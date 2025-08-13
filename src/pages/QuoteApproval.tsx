import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Download, Send, ArrowLeft, Calendar, DollarSign, FileText } from "lucide-react";
import { getSubmission, updateSubmission } from "@/lib/storage";
import { Submission } from "@/types/submission";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/common/BackButton";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import jsPDF from "jspdf";

const QuoteApproval = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [brokerNotes, setBrokerNotes] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");

  useEffect(() => {
    if (!id) return;
    const s = getSubmission(id);
    if (s) {
      setSubmission(s);
      // Set default dates
      const today = new Date();
      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(today.getFullYear() + 1);
      
      setEffectiveDate(today.toISOString().split('T')[0]);
      setExpirationDate(oneYearLater.toISOString().split('T')[0]);
      setPolicyNumber(`POL-${Date.now()}`);
    }
  }, [id]);

  const issuePolicy = () => {
    if (!submission || !id) return;

    const policyData = {
      policyNumber,
      effectiveDate,
      expirationDate,
      brokerNotes,
      issuedAt: new Date().toISOString(),
      premium: submission.stages.rate.output.premium,
      coverages: submission.stages.coverage.output.recommended
    };

    updateSubmission(id, (prev) => ({
      ...prev,
      status: "issued",
      policyData,
      updatedAt: new Date().toISOString()
    }));

    toast({
      title: "Policy Issued Successfully",
      description: `Policy ${policyNumber} has been issued for ${submission.insuredName}`
    });

    navigate('/underwriter');
  };

  const generatePolicyDocument = () => {
    if (!submission) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text("COMMERCIAL AUTO INSURANCE POLICY", pageWidth / 2, yPos, { align: "center" });
    yPos += 20;

    // Policy Information
    doc.setFontSize(14);
    doc.text("POLICY INFORMATION", 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Policy Number: ${policyNumber}`, 20, yPos);
    yPos += 6;
    doc.text(`Effective Date: ${effectiveDate}`, 20, yPos);
    yPos += 6;
    doc.text(`Expiration Date: ${expirationDate}`, 20, yPos);
    yPos += 6;
    doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, yPos);
    yPos += 15;

    // Named Insured
    doc.setFontSize(14);
    doc.text("NAMED INSURED", 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`${submission.insuredName}`, 20, yPos);
    yPos += 6;
    doc.text(`Operation: ${submission.operationType || "Commercial Operations"}`, 20, yPos);
    yPos += 15;

    // Coverage Schedule
    doc.setFontSize(14);
    doc.text("COVERAGE SCHEDULE", 20, yPos);
    yPos += 10;
    doc.setFontSize(10);

    submission.stages.coverage.output.recommended.forEach((cov: any) => {
      doc.text(`${cov.coverage}: ${cov.limits}`, 20, yPos);
      if (cov.deductible !== "$0") {
        doc.text(`Deductible: ${cov.deductible}`, 120, yPos);
      }
      yPos += 6;
    });
    yPos += 10;

    // Premium
    doc.setFontSize(12);
    doc.text(`TOTAL ANNUAL PREMIUM: $${submission.stages.rate.output.premium.toLocaleString()}`, 20, yPos);
    yPos += 15;

    // Broker Notes
    if (brokerNotes) {
      doc.setFontSize(10);
      doc.text("SPECIAL INSTRUCTIONS:", 20, yPos);
      yPos += 6;
      const lines = doc.splitTextToSize(brokerNotes, pageWidth - 40);
      doc.text(lines, 20, yPos);
    }

    doc.save(`${submission.insuredName.replace(/\s+/g, '_')}_Policy.pdf`);
  };

  if (!submission) {
    return (
      <main className="container py-6">
        <Card>
          <CardContent className="p-6">
            <p>Submission not found.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (submission.status !== "quoted") {
    return (
      <main className="container py-6">
        <Card>
          <CardContent className="p-6">
            <p>This submission is not ready for policy issuance.</p>
            <Button onClick={() => navigate('/underwriter')} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Issue Policy - {submission.insuredName} | Auto UW AI</title>
        <meta name="description" content="Complete policy issuance for approved commercial auto quote" />
      </Helmet>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Submissions", href: "/underwriter" },
              { label: submission.insuredName, href: `/underwriter/submission/${id}` },
              { label: "Issue Policy", current: true }
            ]} 
          />
          <h1 className="text-3xl font-bold">Issue Policy</h1>
        </div>
        <BackButton to={`/underwriter/submission/${id}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Quote Approved
              </CardTitle>
              <CardDescription>
                Complete the policy issuance process for {submission.insuredName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Annual Premium</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">
                      {submission.stages.rate.output.premium.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="effectiveDate">Effective Date</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="brokerNotes">Special Instructions (Optional)</Label>
                <Textarea
                  id="brokerNotes"
                  placeholder="Any special instructions or notes for the broker..."
                  value={brokerNotes}
                  onChange={(e) => setBrokerNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={issuePolicy} className="gap-2">
                  <Send className="h-4 w-4" />
                  Issue Policy
                </Button>
                <Button variant="outline" onClick={generatePolicyDocument} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Coverage Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Limit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submission.stages.coverage.output.recommended.map((cov: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{cov.coverage}</TableCell>
                      <TableCell>{cov.limits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default QuoteApproval;
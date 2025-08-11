import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Submission, StageResult } from "@/types/submission";
import { saveSubmission } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";

const emptyStages: Record<"intake" | "risk" | "coverage" | "rate" | "communication", StageResult> = {
  intake: { status: "idle" },
  risk: { status: "idle" },
  coverage: { status: "idle" },
  rate: { status: "idle" },
  communication: { status: "idle" },
};

const BrokerPortal = () => {
  const navigate = useNavigate();
  const [brokerName, setBrokerName] = useState("");
  const [insuredName, setInsuredName] = useState("");
  const [operationType, setOperationType] = useState("Local Delivery");
  const [docs, setDocs] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerName || !insuredName) return toast({ title: "Missing info", description: "Please provide Broker and Insured names." });

    const id = crypto.randomUUID();
    const documents = Array.from(docs || []).map((f) => ({ name: f.name, type: f.type, size: f.size }));

    const submission: Submission = {
      id,
      brokerName,
      insuredName,
      operationType,
      documents,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "submitted",
      stages: emptyStages,
    };

    saveSubmission(submission);
    toast({ title: "Submission received", description: `${insuredName} created.` });
    navigate(`/underwriter/submission/${id}`);
  };

  return (
    <main className="container py-10">
      <Helmet>
        <title>Broker Portal – Submit Small Fleet | Auto UW AI</title>
        <meta name="description" content="Upload ACORD forms, vehicle schedules, and loss runs for commercial auto small fleet underwriting." />
        <link rel="canonical" href={location.href} />
      </Helmet>
      <section className="mx-auto max-w-2xl">
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle>Broker Submission</CardTitle>
            <CardDescription>Upload your submission package to start underwriting.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="broker">Broker Name</Label>
                  <Input id="broker" value={brokerName} onChange={(e) => setBrokerName(e.target.value)} placeholder="e.g., Johnson & Co." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="insured">Insured Name</Label>
                  <Input id="insured" value={insuredName} onChange={(e) => setInsuredName(e.target.value)} placeholder="e.g., Acme Logistics LLC" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="op">Operation Type</Label>
                  <Input id="op" value={operationType} onChange={(e) => setOperationType(e.target.value)} placeholder="Local Delivery" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="docs">Submission Package (PDF, XLSX)</Label>
                  <Input id="docs" type="file" multiple onChange={(e) => setDocs(e.target.files)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="default">Submit for Underwriting</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default BrokerPortal;

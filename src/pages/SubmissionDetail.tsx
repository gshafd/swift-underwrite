import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getSubmission, updateSubmission } from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { Submission } from "@/types/submission";
import { useSuperAgent } from "@/hooks/useSuperAgent";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Download, Send, ArrowLeft, Loader2, Check, MessageSquare, X } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import AgentStepper from "@/components/underwriting/AgentStepper";
import RiskGauge from "@/components/underwriting/RiskGauge";
import FileThumb from "@/components/underwriting/FileThumb";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
const StageBadge = ({ label, status }: { label: string; status: string }) => {
  const color =
    status === "done"
      ? "text-foreground"
      : status === "running"
      ? "text-accent-foreground"
      : status === "error"
      ? "text-destructive"
      : "text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      {status === "running" && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
      {label}
    </span>
  );
};

const JSONBlock = ({ data }: { data: any }) => (
  <pre className="bg-muted/60 rounded-md p-4 text-xs overflow-auto max-h-96">
    {JSON.stringify(data, null, 2)}
  </pre>
);

const SubmissionDetail = () => {
  const { id } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const { run, running, snapshot, currentStage } = useSuperAgent(id!);

  useEffect(() => {
    const s = getSubmission(id!);
    if (s) setSubmission(s);
  }, [id]);

  useEffect(() => {
    if (snapshot) setSubmission(snapshot);
  }, [snapshot]);

  useEffect(() => {
    if (!id) return;
    const shouldAuto = search.get("autoRun") === "1";
    if (shouldAuto && !running && submission && submission.status !== "completed") {
      run();
    }
  }, [search, running, submission, run, id]);

  const title = useMemo(() => (submission ? `${submission.insuredName} – Submission` : "Submission"), [submission]);

  const saveEdit = (stage: string, field: string, value: any) => {
    if (!submission) return;
    
    updateSubmission(id!, (prev) => ({
      ...prev,
      stages: {
        ...prev.stages,
        [stage]: {
          ...prev.stages[stage],
          output: {
            ...prev.stages[stage].output,
            [field]: value,
          },
        },
      },
    }));
    
    setSubmission((prev) => 
      prev ? {
        ...prev,
        stages: {
          ...prev.stages,
          [stage]: {
            ...prev.stages[stage],
            output: {
              ...prev.stages[stage].output,
              [field]: value,
            },
          },
        },
      } : null
    );
    setEditMode(null);
    setEditValues({});
  };

  const generateRealisticPDF = () => {
    if (!submission) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.text("Commercial Auto Insurance Proposal", pageWidth / 2, yPos, { align: "center" });
    yPos += 20;

    // Insured Information
    doc.setFontSize(14);
    doc.text("INSURED INFORMATION", 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.text(`Name: ${submission.insuredName}`, 20, yPos);
    yPos += 6;
    doc.text(`Broker: ${submission.brokerName}`, 20, yPos);
    yPos += 6;
    doc.text(`Operation Type: ${submission.operationType || "Commercial Operations"}`, 20, yPos);
    yPos += 6;
    doc.text(`Years in Business: ${submission.yearsInBusiness || "N/A"}`, 20, yPos);
    yPos += 6;
    doc.text(`Territory: ${submission.territories?.join(", ") || "N/A"}`, 20, yPos);
    yPos += 15;

    // Coverage Details
    if (submission.stages.coverage.output) {
      doc.setFontSize(14);
      doc.text("COVERAGE DETAILS", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      
      submission.stages.coverage.output.recommended?.forEach((cov: any) => {
        doc.text(`${cov.coverage}: ${cov.limits} (Deductible: ${cov.deductible})`, 20, yPos);
        yPos += 6;
      });
      yPos += 10;
    }

    // Premium Information
    if (submission.stages.rate.output) {
      doc.setFontSize(14);
      doc.text("PREMIUM BREAKDOWN", 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      
      const rate = submission.stages.rate.output;
      doc.text(`Base Premium: $${rate.base.toLocaleString()}`, 20, yPos);
      yPos += 6;
      doc.text(`Vehicle Count: ${rate.vehicleCount}`, 20, yPos);
      yPos += 6;
      doc.text(`Rate per Vehicle: $${rate.baseRatePerVehicle.toLocaleString()}`, 20, yPos);
      yPos += 10;
      
      doc.text("Adjustments:", 20, yPos);
      yPos += 6;
      rate.adjustments?.forEach((adj: any) => {
        doc.text(`  • ${adj.label}: ${adj.amountPct > 0 ? '+' : ''}${adj.amountPct}%`, 20, yPos);
        yPos += 6;
      });
      yPos += 6;
      doc.setFontSize(12);
      doc.text(`TOTAL ANNUAL PREMIUM: $${rate.premium.toLocaleString()}`, 20, yPos);
      yPos += 15;
    }

    // Terms and Conditions
    doc.setFontSize(14);
    doc.text("TERMS & CONDITIONS", 20, yPos);
    yPos += 10;
    doc.setFontSize(8);
    doc.text("• Policy term: 12 months", 20, yPos);
    yPos += 5;
    doc.text("• Payment terms: Annual, Semi-Annual, or Quarterly", 20, yPos);
    yPos += 5;
    doc.text("• Coverage effective upon acceptance and payment", 20, yPos);
    yPos += 5;
    doc.text("• Subject to underwriting approval and inspection", 20, yPos);
    yPos += 5;
    doc.text("• Proposal valid for 30 days from issue date", 20, yPos);

    // Download
    doc.save(`${submission.insuredName.replace(/\s+/g, '_')}_Proposal.pdf`);
  };

  if (!submission) return null;

  const stagesOrder: Array<keyof Submission["stages"]> = [
    "intake",
    "risk",
    "coverage",
    "rate",
    "communication",
  ];

  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>{title} | Auto UW AI</title>
        <meta name="description" content="Run the AI Super Agent and view stage-by-stage results for this submission." />
        <link rel="canonical" href={location.href} />
      </Helmet>

      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Submissions", href: "/underwriter" },
              { label: submission.insuredName, current: true }
            ]} 
          />
          <h1 className="text-3xl font-bold">{submission.insuredName}</h1>
        </div>
        <BackButton to="/underwriter" />
      </div>

      <Card className="border-foreground/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{submission.insuredName}</CardTitle>
            <CardDescription>Broker: {submission.brokerName}</CardDescription>
          </div>
          <Button onClick={() => run()} disabled={running} variant={running ? "secondary" : "default"}>
            {running ? "Running..." : "Run AI Super Agent"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <AgentStepper 
            currentStage={currentStage} 
            stages={submission.stages} 
            running={running} 
          />
          
          {(running || submission.stages.communication.status === "done") && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  updateSubmission(id!, (prev) => ({ ...prev, status: "quoted" }));
                  toast({ title: "Quote Approved", description: "Submission has been approved and quote issued." });
                  navigate('/underwriter');
                }}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Approve Quote
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  toast({ title: "Info Requested", description: "Additional information request sent to broker." });
                }}
                className="gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Request More Info
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  updateSubmission(id!, (prev) => ({ ...prev, status: "declined" }));
                  toast({ title: "Submission Declined", description: "Submission has been declined." });
                  navigate('/underwriter');
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Decline Submission
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle>Submission Package</CardTitle>
          <CardDescription>Attached documents</CardDescription>
        </CardHeader>
        <CardContent>
          {submission.documents && submission.documents.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {submission.documents.map((d, idx) => (
                <FileThumb key={`${d.name}-${idx}`} name={d.name} type={d.type} size={d.size} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No files uploaded.</div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Intake Summary
                <Badge variant="secondary" className="text-xs">AI Generated</Badge>
              </CardTitle>
              <CardDescription>Extracted details from submission</CardDescription>
            </div>
            {submission.stages.intake.output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(editMode === "intake" ? null : "intake")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.stages.intake.output ? (
              (() => {
                const io = submission.stages.intake.output;
                const vehicles = io.vehicles?.items ?? [];
                const drivers = io.drivers?.items ?? [];
                const loss = io.loss_history?.items ?? [];
                const avgVehAge = vehicles.length
                  ? (
                      vehicles.reduce((acc: number, v: any) => acc + (new Date().getFullYear() - (v.year || new Date().getFullYear())), 0) /
                      vehicles.length
                    ).toFixed(1)
                  : "-";
                const driverAvgAge = drivers.length
                  ? (
                      drivers.reduce((acc: number, d: any) => acc + (d.age || 0), 0) / drivers.length
                    ).toFixed(1)
                  : "-";
                const totalPaid = loss.reduce((acc: number, l: any) => acc + (l.incurred || 0), 0);

                return (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium mb-2">Insured Details</div>
                      <div className="text-sm text-muted-foreground">
                        <div>Name: {io.insured_info?.insured_name}</div>
                        <div>Operation: {io.insured_info?.operation_type}</div>
                        <div>Confidence: {io.insured_info?.confidence}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Vehicle Summary</div>
                      <div className="text-sm text-muted-foreground">
                        <div>Count: {vehicles.length}</div>
                        <div>Avg Age: {avgVehAge}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Driver Summary</div>
                      <div className="text-sm text-muted-foreground">
                        <div>Count: {drivers.length}</div>
                        <div>Avg Age: {driverAvgAge}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Loss History</div>
                      <div className="text-sm text-muted-foreground">
                        <div>Claims: {loss.length}</div>
                        <div>Total Incurred: ${'{'}totalPaid.toLocaleString(){'}'}</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-muted-foreground">Not available yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Risk Scoring
                <Badge variant="secondary" className="text-xs">AI Generated</Badge>
              </CardTitle>
              <CardDescription>Score, band, and top drivers</CardDescription>
            </div>
            {submission.stages.risk.output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(editMode === "risk" ? null : "risk")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.stages.risk.output ? (
              (() => {
                const ro = submission.stages.risk.output;
                const bandText = ro.risk_band === "A" ? "Low" : ro.risk_band === "B" ? "Moderate" : "High";
                const drivers = (ro.applied_rules || []).slice(0, 5);
                return (
                  <div className="grid gap-4 md:grid-cols-2">
                    <RiskGauge value={ro.overall_risk_score} label={`Band: ${ro.risk_band} (${bandText})`} />
                    <div>
                      <div className="text-sm font-medium mb-2">Top Risk Drivers</div>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        {drivers.map((r: any, idx: number) => (
                          <li key={idx}>{r.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-muted-foreground">Not available yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Coverage Recommendations
                <Badge variant="secondary" className="text-xs">AI Generated</Badge>
              </CardTitle>
              <CardDescription>Limits, deductibles, endorsements</CardDescription>
            </div>
            {submission.stages.coverage.output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(editMode === "coverage" ? null : "coverage")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {submission.stages.coverage.output ? (
              (() => {
                const co = submission.stages.coverage.output;
                const recs = co.recommended || [];
                return (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coverage</TableHead>
                        <TableHead>Limit</TableHead>
                        <TableHead>Deductible</TableHead>
                        <TableHead>KB Rule</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recs.map((r: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{r.coverage}</TableCell>
                          <TableCell>{r.limits}</TableCell>
                          <TableCell>{r.deductible}</TableCell>
                          <TableCell>{r.kb_rule_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              })()
            ) : (
              <div className="text-sm text-muted-foreground">Not available yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Rate Justification
                <Badge variant="secondary" className="text-xs">AI Generated</Badge>
              </CardTitle>
              <CardDescription>Base + adjustments breakdown</CardDescription>
            </div>
            {submission.stages.rate.output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditMode(editMode === "rate" ? null : "rate")}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {submission.stages.rate.output ? (
              (() => {
                const rj = submission.stages.rate.output;
                return (
                  <div className="space-y-3">
                    {editMode === "rate" ? (
                      <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium">Base Rate per Vehicle</label>
                            <Input
                              type="number"
                              value={editValues.baseRatePerVehicle || rj.baseRatePerVehicle}
                              onChange={(e) => setEditValues({...editValues, baseRatePerVehicle: Number(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Final Premium</label>
                            <Input
                              type="number"
                              value={editValues.premium || rj.premium}
                              onChange={(e) => setEditValues({...editValues, premium: Number(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit("rate", "baseRatePerVehicle", editValues.baseRatePerVehicle || rj.baseRatePerVehicle)}>
                            Save Changes
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditMode(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground">
                          Base Rate: ${rj.base?.toLocaleString() || "0"} ({rj.vehicleCount || 0} vehicles @ ${rj.baseRatePerVehicle?.toLocaleString() || "0"})
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Adjustment</TableHead>
                              <TableHead className="text-right">% Impact</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(rj.adjustments || []).map((a: any, idx: number) => (
                              <TableRow key={a.id || idx}>
                                <TableCell>{a.label}</TableCell>
                                <TableCell className="text-right">{a.amountPct > 0 ? '+' : ''}{a.amountPct}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="text-base font-semibold">Final Premium: ${rj.premium?.toLocaleString() || "0"}</div>
                      </>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-muted-foreground">Not available yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Communication Package
                <Badge variant="secondary" className="text-xs">AI Generated</Badge>
              </CardTitle>
              <CardDescription>Proposal preview + email draft</CardDescription>
            </div>
            {submission.stages.communication.output && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditMode(editMode === "communication" ? null : "communication")}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateRealisticPDF}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Generate PDF
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.stages.communication.output ? (
              (() => {
                const co = submission.stages.communication.output;
                return (
                  <>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium">Proposal Preview</div>
                      </div>
                      <div className="bg-muted/60 rounded-md p-4 text-sm overflow-auto max-h-64">
                        <div className="space-y-4">
                          <div className="text-center font-bold text-lg">Commercial Auto Insurance Proposal</div>
                          <div className="grid gap-2">
                            <div><strong>Insured:</strong> {submission.insuredName}</div>
                            <div><strong>Broker:</strong> {submission.brokerName}</div>
                            <div><strong>Operation:</strong> {submission.operationType || "Commercial Operations"}</div>
                            <div><strong>Policy Term:</strong> 12 Months</div>
                          </div>
                          {submission.stages.coverage.output && (
                            <div>
                              <div className="font-semibold mb-2">Coverage Summary:</div>
                              {submission.stages.coverage.output.recommended?.map((cov: any, idx: number) => (
                                <div key={idx} className="text-sm">• {cov.coverage}: {cov.limits} (Deductible: {cov.deductible})</div>
                              ))}
                            </div>
                          )}
                          {submission.stages.rate.output && (
                            <div>
                              <div className="font-semibold mb-2">Premium Information:</div>
                              <div className="text-sm">Base Premium: ${submission.stages.rate.output.base?.toLocaleString()}</div>
                              <div className="text-lg font-bold text-primary">Total Annual Premium: ${submission.stages.rate.output.premium?.toLocaleString()}</div>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            <div>• Payment terms available: Annual, Semi-Annual, Quarterly</div>
                            <div>• Subject to underwriting approval and vehicle inspection</div>
                            <div>• Proposal valid for 30 days from issue date</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium">Email Communication</div>
                      </div>
                      {editMode === "communication" ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editValues.email_body || co.email_body || `Dear ${submission.brokerName},

I hope this email finds you well. Please find attached the comprehensive commercial auto insurance proposal for your client, ${submission.insuredName}.

PROPOSAL HIGHLIGHTS:
• Insured: ${submission.insuredName}
• Operation Type: ${submission.operationType || "Commercial Operations"}
• Coverage Term: 12 Months
${submission.stages.rate.output ? `• Annual Premium: $${submission.stages.rate.output.premium?.toLocaleString()}` : ""}

KEY COVERAGE FEATURES:
${submission.stages.coverage.output?.recommended?.map((cov: any) => `• ${cov.coverage}: ${cov.limits} (${cov.deductible} deductible)`).join('\n') || ""}

NEXT STEPS:
1. Review the attached proposal details
2. Discuss coverage options with your client
3. Contact me with any questions or to proceed with binding

This proposal reflects our competitive pricing and comprehensive coverage options tailored to your client's specific operational needs. The rates are valid for 30 days and subject to final underwriting approval.

Please don't hesitate to reach out if you need any clarification or would like to discuss additional coverage options.

Best regards,
Underwriting Department
Auto UW AI Solutions
Phone: (555) 123-4567
Email: underwriting@autouvai.com`}
                            onChange={(e) => setEditValues({...editValues, email_body: e.target.value})}
                            rows={15}
                            className="font-mono text-sm"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveEdit("communication", "email_body", editValues.email_body)}>
                              Save Changes
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditMode(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted/60 rounded-md p-4 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                          {co.email_body || `Dear ${submission.brokerName},

I hope this email finds you well. Please find attached the comprehensive commercial auto insurance proposal for your client, ${submission.insuredName}.

PROPOSAL HIGHLIGHTS:
• Insured: ${submission.insuredName}
• Operation Type: ${submission.operationType || "Commercial Operations"}
• Coverage Term: 12 Months
${submission.stages.rate.output ? `• Annual Premium: $${submission.stages.rate.output.premium?.toLocaleString()}` : ""}

KEY COVERAGE FEATURES:
${submission.stages.coverage.output?.recommended?.map((cov: any) => `• ${cov.coverage}: ${cov.limits} (${cov.deductible} deductible)`).join('\n') || ""}

NEXT STEPS:
1. Review the attached proposal details
2. Discuss coverage options with your client
3. Contact me with any questions or to proceed with binding

This proposal reflects our competitive pricing and comprehensive coverage options tailored to your client's specific operational needs. The rates are valid for 30 days and subject to final underwriting approval.

Please don't hesitate to reach out if you need any clarification or would like to discuss additional coverage options.

Best regards,
Underwriting Department
Auto UW AI Solutions
Phone: (555) 123-4567
Email: underwriting@autouvai.com`}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="text-sm text-muted-foreground">Not available yet.</div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SubmissionDetail;

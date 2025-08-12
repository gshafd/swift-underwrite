import { useParams, useSearchParams } from "react-router-dom";
import { getSubmission } from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { Submission } from "@/types/submission";
import { useSuperAgent } from "@/hooks/useSuperAgent";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import RiskGauge from "@/components/underwriting/RiskGauge";
import FileThumb from "@/components/underwriting/FileThumb";
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
  const [submission, setSubmission] = useState<Submission | null>(null);
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

  if (!submission) return null;

  const stagesOrder: Array<keyof Submission["stages"]> = [
    "intake",
    "risk",
    "coverage",
    "rate",
    "communication",
  ];
  const doneCount = stagesOrder.filter((k) => submission.stages[k].status === "done").length;
  const progressValue = Math.round(((doneCount + (running ? 0.5 : 0)) / stagesOrder.length) * 100);

  return (
    <main className="container py-10 space-y-6">
      <Helmet>
        <title>{title} | Auto UW AI</title>
        <meta name="description" content="Run the AI Super Agent and view stage-by-stage results for this submission." />
        <link rel="canonical" href={location.href} />
      </Helmet>

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
        <CardContent>
          {running && (
            <div className="mb-4 flex items-center justify-between rounded-md border bg-muted/40 p-3">
              <div className="text-sm">
                AI Super Agent is running: <span className="font-medium capitalize">{currentStage}</span>
              </div>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          <div className="mb-4">
            <Progress value={progressValue} aria-label="Agent progress" />
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            <div className="space-y-1">
              <div className="font-medium">1. Intake</div>
              <StageBadge label={submission.stages.intake.status} status={submission.stages.intake.status} />
            </div>
            <div className="space-y-1">
              <div className="font-medium">2. Risk</div>
              <StageBadge label={submission.stages.risk.status} status={submission.stages.risk.status} />
            </div>
            <div className="space-y-1">
              <div className="font-medium">3. Coverage</div>
              <StageBadge label={submission.stages.coverage.status} status={submission.stages.coverage.status} />
            </div>
            <div className="space-y-1">
              <div className="font-medium">4. Rate</div>
              <StageBadge label={submission.stages.rate.status} status={submission.stages.rate.status} />
            </div>
            <div className="space-y-1">
              <div className="font-medium">5. Communication</div>
              <StageBadge label={submission.stages.communication.status} status={submission.stages.communication.status} />
            </div>
          </div>
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
          <CardHeader>
            <CardTitle>Intake Summary</CardTitle>
            <CardDescription>Extracted details from submission</CardDescription>
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
          <CardHeader>
            <CardTitle>Risk Scoring</CardTitle>
            <CardDescription>Score, band, and top drivers</CardDescription>
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
          <CardHeader>
            <CardTitle>Coverage Recommendations</CardTitle>
            <CardDescription>Limits, deductibles, endorsements</CardDescription>
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
          <CardHeader>
            <CardTitle>Rate Justification</CardTitle>
            <CardDescription>Base + adjustments breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {submission.stages.rate.output ? (
              (() => {
                const rj = submission.stages.rate.output;
                return (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Base Rate: ${'{'}rj.base.toLocaleString(){'}'} ({rj.vehicleCount} vehicles @ ${'{'}rj.baseRatePerVehicle.toLocaleString(){'}'})</div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Adjustment</TableHead>
                          <TableHead className="text-right">% Impact</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rj.adjustments.map((a: any) => (
                          <TableRow key={a.id}>
                            <TableCell>{a.label}</TableCell>
                            <TableCell className="text-right">{a.amountPct}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="text-base font-semibold">Final Premium: ${'{'}rj.premium.toLocaleString(){'}'}</div>
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-muted-foreground">Not available yet.</div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Communication Package</CardTitle>
            <CardDescription>Proposal preview + email draft</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.stages.communication.output ? (
              (() => {
                const co = submission.stages.communication.output;
                const download = (filename: string, content: string) => {
                  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                };
                return (
                  <>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium">proposal_package.pdf (preview)</div>
                        <Button size="sm" variant="outline" onClick={() => download("proposal_package.pdf", co.proposal_package_pdf_preview)}>
                          Download PDF
                        </Button>
                      </div>
                      <pre className="bg-muted/60 rounded-md p-4 text-xs overflow-auto max-h-64">
                        {co.proposal_package_pdf_preview}
                      </pre>
                    </div>
                    <Separator />
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium">email_body.txt (editable)</div>
                        <Button size="sm" variant="outline" onClick={() => download("email_body.txt", co.email_body)}>
                          Download Email
                        </Button>
                      </div>
                      <textarea defaultValue={co.email_body} className="w-full rounded-md border bg-background p-3 text-sm" rows={8} />
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

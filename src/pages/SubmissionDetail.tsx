import { useParams } from "react-router-dom";
import { getSubmission } from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { Submission } from "@/types/submission";
import { useSuperAgent } from "@/hooks/useSuperAgent";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const StageBadge = ({ label, status }: { label: string; status: string }) => {
  const color =
    status === "done"
      ? "text-foreground"
      : status === "running"
      ? "text-accent-foreground"
      : status === "error"
      ? "text-destructive"
      : "text-muted-foreground";
  return <span className={`text-xs ${color}`}>{label}</span>;
};

const JSONBlock = ({ data }: { data: any }) => (
  <pre className="bg-muted/60 rounded-md p-4 text-xs overflow-auto max-h-96">
    {JSON.stringify(data, null, 2)}
  </pre>
);

const SubmissionDetail = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const { run, running, snapshot } = useSuperAgent(id!);

  useEffect(() => {
    const s = getSubmission(id!);
    if (s) setSubmission(s);
  }, [id]);

  useEffect(() => {
    if (snapshot) setSubmission(snapshot);
  }, [snapshot]);

  const title = useMemo(() => (submission ? `${submission.insuredName} – Submission` : "Submission"), [submission]);

  if (!submission) return null;

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

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Intake Output</CardTitle>
            <CardDescription>Extracted data + confidence</CardDescription>
          </CardHeader>
          <CardContent>
            {submission.stages.intake.output ? (
              <JSONBlock data={submission.stages.intake.output} />
            ) : (
              <div className="text-sm text-muted-foreground">Not available yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Score</CardTitle>
            <CardDescription>Band and applied rules</CardDescription>
          </CardHeader>
          <CardContent>
            {submission.stages.risk.output ? (
              <JSONBlock data={submission.stages.risk.output} />
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
              <JSONBlock data={submission.stages.coverage.output} />
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
          <CardContent>
            {submission.stages.rate.output ? (
              <JSONBlock data={submission.stages.rate.output} />
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
              <>
                <div>
                  <div className="text-sm font-medium mb-2">proposal_package.pdf (preview)</div>
                  <pre className="bg-muted/60 rounded-md p-4 text-xs overflow-auto max-h-64">
                    {submission.stages.communication.output.proposal_package_pdf_preview}
                  </pre>
                </div>
                <Separator />
                <div>
                  <div className="text-sm font-medium mb-2">email_body.txt</div>
                  <pre className="bg-muted/60 rounded-md p-4 text-xs overflow-auto max-h-64">
                    {submission.stages.communication.output.email_body}
                  </pre>
                </div>
              </>
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

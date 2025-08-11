import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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
  const [brokerName, setBrokerName] = useState("");
  const [insuredName, setInsuredName] = useState("");
  const [operationType, setOperationType] = useState("Local Delivery");
  const [docs, setDocs] = useState<FileList | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

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
    toast({ title: "Submission received", description: `${insuredName} has been submitted for underwriting.` });
    setSubmittedId(id);
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
{submittedId ? (
              <div className="space-y-4">
                <div className="rounded-md border bg-muted/40 p-4">
                  <p className="text-sm">Your documents have been submitted.</p>
                  <p className="text-sm">Reference ID: <span className="font-mono">{submittedId.slice(0, 8)}</span></p>
                  <p className="text-sm text-muted-foreground">An underwriter at the carrier will review and get back to you.</p>
                </div>
                <div className="text-sm text-muted-foreground">You may close this page; no further action is needed.</div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default BrokerPortal;

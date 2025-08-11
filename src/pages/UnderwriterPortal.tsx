import { Helmet } from "react-helmet-async";
import { listSubmissions } from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { Submission } from "@/types/submission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Truck, DollarSign, Shield } from "lucide-react";

const UnderwriterPortal = () => {
  const [subs, setSubs] = useState<Submission[]>([]);

  useEffect(() => {
    setSubs(listSubmissions());
  }, []);

  return (
    <main className="container py-10 space-y-6">
      <Helmet>
        <title>Underwriter Portal – Dashboard | Auto UW AI</title>
        <meta name="description" content="Review broker submissions and run the AI Super Agent for small fleet commercial auto underwriting." />
        <link rel="canonical" href={location.href} />
      </Helmet>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Underwriter Portal</h1>
          <p className="text-sm text-muted-foreground">Commercial Auto – Small Fleet Underwriting</p>
        </div>
        <div className="rounded-full border bg-muted/40 px-3 py-1 text-sm">
          <span className="inline-flex items-center gap-2 text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500" /> AI Agents Active
          </span>
        </div>
      </header>

      {(() => {
        const active = subs.length;
        const totalVehicles = subs.reduce((acc, s) => acc + (s.stages.intake.output?.vehicles?.items?.length ?? 0), 0);
        const pipeline = subs.reduce((acc, s) => acc + (s.stages.rate.output?.premium ?? 0), 0);
        const highPriority = subs.filter((s) => s.status === "submitted" || s.stages.risk.output?.risk_band === "C").length;

        return (
          <section className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-semibold">{active}</div>
                    <div className="text-xs text-muted-foreground">Active Submissions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-semibold">{totalVehicles}</div>
                    <div className="text-xs text-muted-foreground">Total Vehicles</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-semibold">${'{'}pipeline.toLocaleString(){'}'}</div>
                    <div className="text-xs text-muted-foreground">Pipeline Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-semibold">{highPriority}</div>
                    <div className="text-xs text-muted-foreground">High Priority</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        );
      })()}

      <section>
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle>Pending Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subs.filter((s) => s.status === "submitted" || s.status === "processing").map((s) => {
              const vehicles = s.stages.intake.output?.vehicles?.items?.length ?? 0;
              const created = new Date(s.createdAt).toLocaleDateString();
              return (
                <div key={s.id} className="rounded-lg border bg-card p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="text-base font-semibold">{s.insuredName}</div>
                        {s.status === "submitted" && <Badge variant="destructive">New</Badge>}
                        {s.status === "processing" && <Badge>Processing</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-3">Broker: {s.brokerName}</span>
                        <span className="mr-3">Date: {created}</span>
                        <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3" /> {vehicles} vehicles</span>
                      </div>
                    </div>
                    <div>
                      <Link to={`/underwriter/submission/${s.id}`}>
                        <Button>Review Submission</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {subs.filter((s) => s.status === "submitted" || s.status === "processing").length === 0 && (
              <div className="text-center text-sm text-muted-foreground">No pending submissions.</div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default UnderwriterPortal;

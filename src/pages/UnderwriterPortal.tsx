import { Helmet } from "react-helmet-async";
import { listSubmissions, updateSubmission } from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { Submission } from "@/types/submission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Truck, DollarSign, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UnderwriterPortal = () => {
  const [subs, setSubs] = useState<Submission[]>([]);

  useEffect(() => {
    setSubs(listSubmissions());
  }, []);

  // auto-refresh every 2s to reflect AI processing updates
  useEffect(() => {
    const id = setInterval(() => setSubs(listSubmissions()), 2000);
    return () => clearInterval(id);
  }, []);

  type Filters = {
    broker: string;
    riskBand: string; // any | A | B | C
    startDate: string; // yyyy-mm-dd
    endDate: string; // yyyy-mm-dd
    minFleet?: number;
    maxFleet?: number;
    sortKey: "date" | "broker" | "fleet" | "risk" | "premium";
    sortDir: "asc" | "desc";
  };

  const [filters, setFilters] = useState<Filters>(() => {
    try {
      const raw = localStorage.getItem("uw-filters");
      return raw
        ? (JSON.parse(raw) as Filters)
        : {
            broker: "",
            riskBand: "any",
            startDate: "",
            endDate: "",
            minFleet: undefined,
            maxFleet: undefined,
            sortKey: "date",
            sortDir: "desc",
          };
    } catch {
      return {
        broker: "",
        riskBand: "any",
        startDate: "",
        endDate: "",
        minFleet: undefined,
        maxFleet: undefined,
        sortKey: "date",
        sortDir: "desc",
      };
    }
  });

  useEffect(() => {
    localStorage.setItem("uw-filters", JSON.stringify(filters));
  }, [filters]);

  const getFleet = (s: Submission) => s.stages.intake.output?.vehicles?.items?.length ?? 0;
  const getRisk = (s: Submission) => s.stages.risk.output?.risk_band as "A" | "B" | "C" | undefined;
  const getPremium = (s: Submission) => s.stages.rate.output?.premium as number | undefined;
  const displayStatus = (s: Submission) =>
    s.status === "submitted"
      ? "New"
      : s.status === "processing"
      ? "In Review"
      : s.status === "completed"
      ? "AI Processed"
      : s.status === "quoted"
      ? "Quoted"
      : s.status === "declined"
      ? "Declined"
      : "Error";

  const filtered = useMemo(() => {
    return subs.filter((s) => {
      if (filters.broker && !s.brokerName.toLowerCase().includes(filters.broker.toLowerCase())) return false;
      if (filters.riskBand !== "any") {
        const rb = getRisk(s);
        if (!rb || rb !== (filters.riskBand as any)) return false;
      }
      if (filters.startDate && new Date(s.createdAt) < new Date(filters.startDate)) return false;
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(s.createdAt) > end) return false;
      }
      const fleet = getFleet(s);
      if (filters.minFleet != null && fleet < filters.minFleet) return false;
      if (filters.maxFleet != null && fleet > filters.maxFleet) return false;
      return true;
    });
  }, [subs, filters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = filters.sortDir === "asc" ? 1 : -1;
      switch (filters.sortKey) {
        case "broker":
          return a.brokerName.localeCompare(b.brokerName) * dir;
        case "fleet":
          return (getFleet(a) - getFleet(b)) * dir;
        case "risk": {
          const order: Record<string, number> = { A: 0, B: 1, C: 2 };
          const ra = order[getRisk(a) || "Z"] ?? 99;
          const rb = order[getRisk(b) || "Z"] ?? 99;
          return (ra - rb) * dir;
        }
        case "premium":
          return ((getPremium(a) ?? -1) - (getPremium(b) ?? -1)) * dir;
        default:
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ) * dir; // date
      }
    });
    return arr;
  }, [filtered, filters]);

  const refreshNow = () => setSubs(listSubmissions());
  const handleResetFilters = () =>
    setFilters({
      broker: "",
      riskBand: "any",
      startDate: "",
      endDate: "",
      minFleet: undefined,
      maxFleet: undefined,
      sortKey: "date",
      sortDir: "desc",
    });

  const handleDecline = (id: string) => {
    if (confirm("Decline this submission?")) {
      updateSubmission(id, (prev) => ({
        ...prev,
        status: "declined",
        updatedAt: new Date().toISOString(),
      }));
      refreshNow();
    }
  };

  return (
    <main className="container py-10 space-y-6">
      <Helmet>
        <title>Underwriter Portal – Dashboard | Auto UW AI</title>
        <meta
          name="description"
          content="Review broker submissions and run the AI Super Agent for small fleet commercial auto underwriting."
        />
        <link rel="canonical" href={location.href} />
      </Helmet>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Underwriter Portal</h1>
          <p className="text-sm text-muted-foreground">
            Commercial Auto – Small Fleet Underwriting
          </p>
        </div>
        <div className="rounded-full border bg-muted/40 px-3 py-1 text-sm">
          <span className="inline-flex items-center gap-2 text-green-600">
            <span className="h-2 w-2 rounded-full bg-green-500" /> AI Agents Active
          </span>
        </div>
      </header>

      {(() => {
        const active = subs.length;
        const totalVehicles = subs.reduce(
          (acc, s) => acc + (s.stages.intake.output?.vehicles?.items?.length ?? 0),
          0
        );
        const pipeline = subs.reduce(
          (acc, s) => acc + (s.stages.rate.output?.premium ?? 0),
          0
        );
        const highPriority = subs.filter(
          (s) => s.status === "submitted" || s.stages.risk.output?.risk_band === "C"
        ).length;

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
                    <div className="text-2xl font-semibold">${pipeline.toLocaleString()}</div>
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

      {/* Filters Toolbar */}
      <div className="rounded-md border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-6">
          <Input
            placeholder="Filter by broker"
            value={filters.broker}
            onChange={(e) => setFilters({ ...filters, broker: e.target.value })}
            className="md:col-span-2"
          />
          <Select
            value={filters.riskBand}
            onValueChange={(v) => setFilters({ ...filters, riskBand: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Risk Band" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Risk Band</SelectItem>
              <SelectItem value="A">A (Low)</SelectItem>
              <SelectItem value="B">B (Moderate)</SelectItem>
              <SelectItem value="C">C (High)</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Fleet min"
              value={filters.minFleet ?? ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  minFleet: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
            <Input
              type="number"
              placeholder="Fleet max"
              value={filters.maxFleet ?? ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maxFleet: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {sorted.length} of {subs.length}
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={filters.sortKey}
              onValueChange={(v: any) => setFilters({ ...filters, sortKey: v })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="broker">Broker</SelectItem>
                <SelectItem value="fleet">Fleet Size</SelectItem>
                <SelectItem value="risk">Risk Band</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sortDir}
              onValueChange={(v: any) => setFilters({ ...filters, sortDir: v })}
            >
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button variant="outline" onClick={refreshNow}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Triage Table */}
      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle>Submission Triage</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Broker</TableHead>
                <TableHead>Insured</TableHead>
                <TableHead>Date Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Fleet</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((s) => {
                const fleet = getFleet(s);
                const risk = getRisk(s);
                const premium = getPremium(s);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.id.slice(0, 8)}</TableCell>
                    <TableCell>{s.brokerName}</TableCell>
                    <TableCell>{s.insuredName}</TableCell>
                    <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{displayStatus(s)}</TableCell>
                    <TableCell>Commercial Auto</TableCell>
                    <TableCell>{fleet || "—"}</TableCell>
                    <TableCell>{risk || "—"}</TableCell>
                    <TableCell>{premium ? `$${premium.toLocaleString()}` : "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link to={`/underwriter/submission/${s.id}`}>
                          <Button size="xs" variant="secondary">View</Button>
                        </Link>
                        <Link to={`/underwriter/submission/${s.id}?autoRun=1`}>
                          <Button size="xs">Run AI</Button>
                        </Link>
                        <Button size="xs" variant="destructive" onClick={() => handleDecline(s.id)}>
                          Decline
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-sm text-muted-foreground">
                    No submissions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
};

export default UnderwriterPortal;

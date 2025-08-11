import { Helmet } from "react-helmet-async";
import { listSubmissions } from "@/lib/storage";
import { useEffect, useState } from "react";
import { Submission } from "@/types/submission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";

const UnderwriterPortal = () => {
  const [subs, setSubs] = useState<Submission[]>([]);

  useEffect(() => {
    setSubs(listSubmissions());
  }, []);

  return (
    <main className="container py-10">
      <Helmet>
        <title>Underwriter Portal – Submissions | Auto UW AI</title>
        <meta name="description" content="View broker submissions and run the AI Super Agent for commercial auto underwriting." />
        <link rel="canonical" href={location.href} />
      </Helmet>
      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insured</TableHead>
                <TableHead>Broker</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Link to={`/underwriter/submission/${s.id}`} className="underline-offset-4 hover:underline">
                      {s.insuredName}
                    </Link>
                  </TableCell>
                  <TableCell>{s.brokerName}</TableCell>
                  <TableCell className="capitalize">{s.status}</TableCell>
                  <TableCell>{new Date(s.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {subs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No submissions yet.
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

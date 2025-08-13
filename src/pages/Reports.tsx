import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const Reports = () => {
  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Reports | Auto UW AI</title>
        <meta name="description" content="View underwriting reports and analytics" />
      </Helmet>
      
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Reports", current: true }
            ]} 
          />
          <h1 className="text-3xl font-bold">Reports</h1>
        </div>
        <BackButton to="/underwriter" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submission Analytics</CardTitle>
            <CardDescription>Track submission volume and processing metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Analytics dashboard coming soon.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Performance</CardTitle>
            <CardDescription>Monitor AI agent accuracy and efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Performance metrics coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Reports;
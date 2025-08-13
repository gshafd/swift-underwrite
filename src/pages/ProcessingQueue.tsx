import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const ProcessingQueue = () => {
  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>AI Processing Queue | Auto UW AI</title>
        <meta name="description" content="Monitor AI processing queue and agent status" />
      </Helmet>
      
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "AI Processing Queue", current: true }
            ]} 
          />
          <h1 className="text-3xl font-bold">AI Processing Queue</h1>
        </div>
        <BackButton to="/underwriter" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queue Status</CardTitle>
          <CardDescription>Monitor current AI agent processing tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active processing tasks at the moment.</p>
        </CardContent>
      </Card>
    </main>
  );
};

export default ProcessingQueue;
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BackButton from "@/components/common/BackButton";
import Breadcrumbs from "@/components/common/Breadcrumbs";

const Settings = () => {
  return (
    <main className="container py-6 space-y-6">
      <Helmet>
        <title>Settings | Auto UW AI</title>
        <meta name="description" content="Configure application settings and preferences" />
      </Helmet>
      
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Settings", current: true }
            ]} 
          />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <BackButton to="/underwriter" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">User preferences panel coming soon.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Configuration</CardTitle>
            <CardDescription>Configure AI agent settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">AI configuration options coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Settings;
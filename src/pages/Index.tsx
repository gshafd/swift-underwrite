import { Helmet } from "react-helmet-async";
import heroImg from "@/assets/hero-fleet.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <Helmet>
        <title>Commercial Auto AI Super Agent | Auto UW AI</title>
        <meta name="description" content="End-to-end AI underwriting for small fleet commercial auto: intake, risk scoring, coverage, rating, communication." />
        <link rel="canonical" href={location.href} />
      </Helmet>
      
      <main className="container py-16">
        <section className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              AI Super Agent for Small Fleet Underwriting
            </h1>
            <p className="text-lg text-muted-foreground">
              Orchestrate intake, risk, coverage, rating, and broker communication in one streamlined workflow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/broker">
                <Button variant="hero" size="xl">Submit as Broker</Button>
              </Link>
              <Link to="/underwriter">
                <Button variant="outline" size="lg">Enter Underwriter Portal</Button>
              </Link>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border shadow-lg">
            <img src={heroImg} alt="Commercial auto small fleet underwriting hero image" loading="lazy" className="w-full h-full object-cover" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;

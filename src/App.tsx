import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BrokerPortal from "./pages/BrokerPortal";
import UnderwriterPortal from "./pages/UnderwriterPortal";
import SubmissionDetail from "./pages/SubmissionDetail";
import ProcessingQueue from "./pages/ProcessingQueue";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Header from "@/components/layout/Header";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/broker" element={<BrokerPortal />} />
            <Route path="/underwriter" element={<UnderwriterPortal />} />
            <Route path="/underwriter/submission/:id" element={<SubmissionDetail />} />
            <Route path="/processing-queue" element={<ProcessingQueue />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

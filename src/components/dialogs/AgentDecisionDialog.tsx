import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, FileText, Database, Target } from "lucide-react";

interface AgentDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName: string;
  stageData: any;
}

const AgentDecisionDialog = ({ open, onOpenChange, agentName, stageData }: AgentDecisionDialogProps) => {
  const getAgentDescription = (name: string) => {
    switch (name) {
      case "intake":
        return "Extracts and structures data from submission documents";
      case "risk":
        return "Analyzes risk factors and assigns risk scores";
      case "coverage":
        return "Determines appropriate coverage recommendations";
      case "rate":
        return "Calculates premium rates and adjustments";
      case "communication":
        return "Generates proposals and communication content";
      default:
        return "AI agent processing";
    }
  };

  const getInputDocuments = () => [
    { name: "Application Form.pdf", type: "Submission Document", confidence: "95%" },
    { name: "Vehicle Schedule.xlsx", type: "Submission Document", confidence: "92%" },
    { name: "Driver Records.pdf", type: "Submission Document", confidence: "88%" },
    { name: "Loss History.pdf", type: "Submission Document", confidence: "90%" }
  ];

  const getKnowledgeBase = (stage: string) => {
    switch (stage) {
      case "intake":
        return [
          { rule: "Document parsing rules", source: "KB-DOC-001", description: "Standard data extraction patterns" },
          { rule: "Vehicle classification", source: "KB-VEH-015", description: "Commercial vehicle categorization rules" },
          { rule: "Operation type mapping", source: "KB-OPS-007", description: "Business operation classifications" }
        ];
      case "risk":
        return [
          { rule: "Risk scoring matrix", source: "KB-RISK-101", description: "Base risk assessment criteria" },
          { rule: "Fleet size factors", source: "KB-FLEET-023", description: "Fleet size risk adjustments" },
          { rule: "Loss frequency rules", source: "KB-LOSS-045", description: "Historical loss impact scoring" }
        ];
      case "coverage":
        return [
          { rule: "Coverage standards", source: "KB-COV-201", description: "Minimum coverage requirements" },
          { rule: "Industry guidelines", source: "KB-IND-078", description: "Commercial auto best practices" },
          { rule: "Regulatory compliance", source: "KB-REG-134", description: "State-specific requirements" }
        ];
      case "rate":
        return [
          { rule: "Base rate tables", source: "KB-RATE-301", description: "Territory and class base rates" },
          { rule: "Adjustment factors", source: "KB-ADJ-156", description: "Risk-based rate modifications" },
          { rule: "Fleet discounts", source: "KB-DISC-089", description: "Volume-based pricing adjustments" }
        ];
      case "communication":
        return [
          { rule: "Proposal templates", source: "KB-TEMP-401", description: "Standard proposal formatting" },
          { rule: "Communication standards", source: "KB-COMM-234", description: "Professional correspondence guidelines" },
          { rule: "Regulatory disclosures", source: "KB-DISC-167", description: "Required legal disclosures" }
        ];
      default:
        return [];
    }
  };

  const getDecisionProcess = (stage: string) => {
    switch (stage) {
      case "intake":
        return [
          { step: 1, action: "Document Analysis", description: "Parsed submission documents using OCR and NLP" },
          { step: 2, action: "Data Extraction", description: "Extracted structured data: vehicles, drivers, operations" },
          { step: 3, action: "Validation", description: "Cross-referenced data for consistency and completeness" },
          { step: 4, action: "Confidence Scoring", description: "Assigned confidence scores to extracted information" }
        ];
      case "risk":
        return [
          { step: 1, action: "Factor Analysis", description: "Analyzed vehicle types, driver profiles, and operation details" },
          { step: 2, action: "Rule Application", description: "Applied risk assessment rules from knowledge base" },
          { step: 3, action: "Score Calculation", description: "Computed overall risk score using weighted factors" },
          { step: 4, action: "Band Assignment", description: "Assigned risk band based on score thresholds" }
        ];
      case "coverage":
        return [
          { step: 1, action: "Risk Assessment", description: "Reviewed risk profile and operational exposures" },
          { step: 2, action: "Regulatory Check", description: "Verified minimum coverage requirements by jurisdiction" },
          { step: 3, action: "Best Practice Application", description: "Applied industry standards for similar operations" },
          { step: 4, action: "Recommendation Generation", description: "Generated tailored coverage recommendations" }
        ];
      case "rate":
        return [
          { step: 1, action: "Base Rate Lookup", description: "Retrieved base rates for territory and vehicle classes" },
          { step: 2, action: "Risk Adjustment", description: "Applied risk-based modifications to base rates" },
          { step: 3, action: "Factor Application", description: "Applied fleet size, telematics, and other adjustments" },
          { step: 4, action: "Premium Calculation", description: "Calculated final premium with all adjustments" }
        ];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent Decision Process
          </DialogTitle>
          <DialogDescription>
            {getAgentDescription(agentName)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="process" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="process">Decision Process</TabsTrigger>
            <TabsTrigger value="inputs">Input Documents</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
          </TabsList>

          <TabsContent value="process" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Decision Steps
                </CardTitle>
                <CardDescription>How the AI agent made its decision</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getDecisionProcess(agentName).map((step) => (
                    <div key={step.step} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-medium">{step.action}</div>
                        <div className="text-sm text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inputs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Submission Documents Analyzed
                </CardTitle>
                <CardDescription>Documents used as input for this agent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getInputDocuments().map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-muted-foreground">{doc.type}</div>
                      </div>
                      <Badge variant="secondary">
                        {doc.confidence} confidence
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Knowledge Base Rules Applied
                </CardTitle>
                <CardDescription>Business rules and guidelines used in decision making</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getKnowledgeBase(agentName).map((rule, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{rule.rule}</div>
                        <Badge variant="outline">{rule.source}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{rule.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="output" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Output</CardTitle>
                <CardDescription>Final result produced by this agent</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/30 p-4 rounded-md text-sm overflow-auto max-h-96">
                  {JSON.stringify(stageData?.output || {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDecisionDialog;
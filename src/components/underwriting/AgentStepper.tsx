import { Loader2, CheckCircle, Circle } from "lucide-react";
import { StageName } from "@/types/submission";

interface AgentStep {
  key: StageName;
  name: string;
  description: string;
  status: "idle" | "running" | "done" | "error";
}

interface AgentStepperProps {
  currentStage: StageName | null;
  stages: Record<StageName, { status: string }>;
  running: boolean;
}

const AgentStepper = ({ currentStage, stages, running }: AgentStepperProps) => {
  const steps: AgentStep[] = [
    {
      key: "intake",
      name: "Submission Intake",
      description: "Extract data from docs",
      status: stages.intake.status as any,
    },
    {
      key: "risk",
      name: "Risk Profiling",
      description: "Score & analyze risk",
      status: stages.risk.status as any,
    },
    {
      key: "coverage",
      name: "Coverage Determination",
      description: "Recommend coverages",
      status: stages.coverage.status as any,
    },
    {
      key: "rate",
      name: "Pricing",
      description: "Calculate premium",
      status: stages.rate.status as any,
    },
    {
      key: "communication",
      name: "Draft Email Template",
      description: "Generate email & proposal",
      status: stages.communication.status as any,
    },
  ];

  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background">
              {step.status === "done" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : step.status === "running" || (running && currentStage === step.key) ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <div className="text-xs font-medium">{step.name}</div>
              <div className="text-xs text-muted-foreground">{step.description}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className="w-12 h-0.5 bg-border mx-4 mt-[-20px]" />
          )}
        </div>
      ))}
    </div>
  );
};

export default AgentStepper;
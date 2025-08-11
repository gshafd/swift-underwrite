export type StageName =
  | "intake"
  | "risk"
  | "coverage"
  | "rate"
  | "communication";

export interface AgentLog {
  ruleId?: string;
  message: string;
}

export interface StageResult {
  status: "idle" | "running" | "done" | "error";
  output?: any;
  logs?: AgentLog[];
  startedAt?: string;
  finishedAt?: string;
}

export interface DocumentInfo {
  name: string;
  type: string;
  size: number;
}

export interface Submission {
  id: string;
  brokerName: string;
  insuredName: string;
  operationType?: string;
  documents: DocumentInfo[];
  createdAt: string;
  updatedAt: string;
  status: "submitted" | "processing" | "completed" | "error";
  stages: Record<StageName, StageResult>;
}

import * as React from "react";
import { updateSubmission, getSubmission } from "@/lib/storage";
import { StageName, Submission } from "@/types/submission";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

function now() {
  return new Date().toISOString();
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function useSuperAgent(submissionId: string) {
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentStage, setCurrentStage] = React.useState<StageName | null>(
    null
  );
  const [lastSnapshot, setLastSnapshot] = React.useState<Submission | null>(
    getSubmission(submissionId) || null
  );

  const refresh = React.useCallback(() => {
    setLastSnapshot(getSubmission(submissionId) || null);
  }, [submissionId]);

  const setStage = (stage: StageName, patch: Partial<Submission["stages"][StageName]>) => {
    updateSubmission(submissionId, (prev) => ({
      ...prev,
      updatedAt: now(),
      stages: {
        ...prev.stages,
        [stage]: { ...prev.stages[stage], ...patch },
      },
      status:
        stage === "communication" && patch.status === "done"
          ? "completed"
          : "processing",
    }));
    refresh();
  };

  const run = React.useCallback(async () => {
    if (running) return;
    setRunning(true);
    setError(null);

    const startStage = async (stage: StageName) => {
      setCurrentStage(stage);
      setStage(stage, { status: "running", startedAt: now() });
      await delay(700);
    };

    try {
      // 1. Intake
      await startStage("intake");
      const submission = getSubmission(submissionId)!;
      const vehicleCount = Math.max(2, Math.round(randomBetween(2, 8)));
      const vehicles = Array.from({ length: vehicleCount }).map((_, i) => ({
        vin: `1FT${100000 + i}`,
        year: 2018 + (i % 6),
        make: ["Ford", "Chevy", "Ram"][i % 3],
        model: ["Transit", "Express", "ProMaster"][i % 3],
        use: ["Delivery", "Service", "Sales"][i % 3],
      }));
      const drivers = [
        { name: "Alex Johnson", age: 34, licenseYears: 10 },
        { name: "Maria Gomez", age: 29, licenseYears: 6 },
      ];
      const lossHistory = [
        { date: "2023-05-10", description: "Minor fender bender", incurred: 2400 },
        { date: "2022-11-01", description: "Windshield replacement", incurred: 600 },
      ];
      const intakeOutput = {
        insured_info: {
          insured_name: submission.insuredName,
          operation_type: submission.operationType || "Local Delivery",
          confidence: randomBetween(0.9, 0.99).toFixed(2),
        },
        vehicles: { items: vehicles, confidence: randomBetween(0.9, 0.98).toFixed(2) },
        drivers: { items: drivers, confidence: randomBetween(0.88, 0.97).toFixed(2) },
        loss_history: { items: lossHistory, confidence: randomBetween(0.85, 0.95).toFixed(2) },
        telematics: { has_telemetry: Math.random() > 0.6, confidence: randomBetween(0.8, 0.95).toFixed(2) },
      };
      setStage("intake", { status: "done", output: intakeOutput, finishedAt: now() });

      // 2. Risk
      await startStage("risk");
      const score = Math.round(randomBetween(62, 88));
      const band = score >= 80 ? "A" : score >= 70 ? "B" : "C";
      const riskOutput = {
        overall_risk_score: score,
        risk_band: band,
        applied_rules: [
          { ruleId: "RS-101", message: "Vehicle count between 2-10: moderate base risk" },
          { ruleId: "RS-214", message: "Recent minor property damage claim" },
          { ruleId: "RS-305", message: "Telematics present: favorable adjustment" },
        ],
      };
      setStage("risk", { status: "done", output: riskOutput, finishedAt: now() });

      // 3. Coverage
      await startStage("coverage");
      const coverageOutput = {
        recommended: [
          {
            coverage: "Liability",
            limits: band === "A" ? "$1,000,000 CSL" : "$750,000 CSL",
            deductible: "$0",
            kb_rule_id: "CR-001",
          },
          {
            coverage: "Physical Damage",
            limits: "ACV",
            deductible: band === "A" ? "$1,000" : "$2,500",
            kb_rule_id: "CR-017",
          },
          {
            coverage: "Hired/Non-Owned Auto",
            limits: "$1,000,000",
            deductible: "$0",
            kb_rule_id: "CR-023",
          },
        ],
      };
      setStage("coverage", { status: "done", output: coverageOutput, finishedAt: now() });

      // 4. Rate
      await startStage("rate");
      const baseRatePerVehicle = 1200;
      const adjustments = [
        { id: "RJ-100", label: "Risk band adjustment", amountPct: band === "A" ? -10 : band === "B" ? 0 : 12 },
        { id: "RJ-221", label: "Urban operation", amountPct: 8 },
        { id: "RJ-330", label: "Telematics credit", amountPct: -5 },
      ];
      const base = baseRatePerVehicle * vehicles.length;
      const adjTotalPct = adjustments.reduce((acc, a) => acc + a.amountPct, 0);
      const premium = Math.round(base * (1 + adjTotalPct / 100));
      const rateOutput = { base, baseRatePerVehicle, vehicleCount: vehicles.length, adjustments, premium };
      setStage("rate", { status: "done", output: rateOutput, finishedAt: now() });

      // 5. Communication
      await startStage("communication");
      const proposalText = `Proposal for ${submission.insuredName}\n\nRecommended coverages: Liability, Physical Damage, Hired/Non-Owned.\nEstimated annual premium: $${premium.toLocaleString()}\n\nRationale: Risk band ${band} with applied credits/debits as per KB.`;
      const emailBody = `Hi Broker,\n\nPlease find the proposal attached for ${submission.insuredName}. Estimated premium $${premium.toLocaleString()}.\n\nRegards,\nUnderwriting Team`;
      const commsOutput = { proposal_package_pdf_preview: proposalText, email_body: emailBody };
      setStage("communication", {
        status: "done",
        output: commsOutput,
        finishedAt: now(),
      });

      setRunning(false);
      setCurrentStage(null);
      refresh();
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
      setRunning(false);
      setCurrentStage(null);
    }
  }, [refresh, running, submissionId]);

  return { run, running, error, currentStage, snapshot: lastSnapshot };
}

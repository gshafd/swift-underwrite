import { Submission } from "@/types/submission";

const KEY = "auto-uw-submissions";

function seedIfEmpty(): Submission[] {
  const existing = localStorage.getItem(KEY);
  if (existing) {
    try { return JSON.parse(existing) as Submission[]; } catch { return []; }
  }
  const now = new Date();
  const toISO = (d: Date) => d.toISOString();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

  const baseDocs = [
    { name: "ACORD_125.pdf", type: "application/pdf", size: 245_000 },
    { name: "ACORD_127.pdf", type: "application/pdf", size: 198_000 },
    { name: "Vehicle_Schedule.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: 54_000 },
    { name: "Loss_Runs.pdf", type: "application/pdf", size: 312_000 },
  ];

  const makeStages = (opts: {
    withIntake?: boolean;
    withRisk?: boolean;
    withCoverage?: boolean;
    withRate?: boolean;
    withComms?: boolean;
    vehicleCount?: number;
    score?: number;
    band?: "A" | "B" | "C";
    premium?: number;
  }) => {
    const stages: Submission["stages"] = {
      intake: { status: "idle" },
      risk: { status: "idle" },
      coverage: { status: "idle" },
      rate: { status: "idle" },
      communication: { status: "idle" },
    };
    if (opts.withIntake) {
      const vehicles = Array.from({ length: opts.vehicleCount ?? 5 }).map((_, i) => ({
        vin: `1FT${100000 + i}`,
        year: 2017 + (i % 7),
        make: ["Ford", "Chevy", "Ram"][i % 3],
        model: ["Transit", "Express", "ProMaster"][i % 3],
        use: ["Delivery", "Service", "Sales"][i % 3],
      }));
      const drivers = [
        { name: "Alex Johnson", age: 34, licenseYears: 10 },
        { name: "Maria Gomez", age: 29, licenseYears: 6 },
      ];
      const loss = [
        { date: "2023-05-10", description: "Minor fender bender", incurred: 2400 },
        { date: "2022-11-01", description: "Windshield replacement", incurred: 600 },
      ];
      stages.intake = {
        status: "done",
        output: {
          insured_info: { insured_name: "", operation_type: "Local Delivery", confidence: "0.96" },
          vehicles: { items: vehicles, confidence: "0.95" },
          drivers: { items: drivers, confidence: "0.93" },
          loss_history: { items: loss, confidence: "0.91" },
          telematics: { has_telemetry: Math.random() > 0.5, confidence: "0.90" },
        },
      };
    }
    if (opts.withRisk) {
      const score = opts.score ?? 78;
      const band = opts.band ?? (score >= 80 ? "A" : score >= 70 ? "B" : "C");
      stages.risk = {
        status: "done",
        output: {
          overall_risk_score: score,
          risk_band: band,
          applied_rules: [
            { ruleId: "RS-101", message: "Vehicle count between 2-10: moderate base risk" },
            { ruleId: "RS-214", message: "Recent minor property damage claim" },
            { ruleId: "RS-305", message: "Telematics present: favorable adjustment" },
          ],
        },
      };
    }
    if (opts.withCoverage) {
      stages.coverage = {
        status: "done",
        output: {
          recommended: [
            { coverage: "Liability", limits: "$1,000,000 CSL", deductible: "$0", kb_rule_id: "CR-001" },
            { coverage: "Physical Damage", limits: "ACV", deductible: "$1,000", kb_rule_id: "CR-017" },
            { coverage: "Hired/Non-Owned Auto", limits: "$1,000,000", deductible: "$0", kb_rule_id: "CR-023" },
          ],
        },
      };
    }
    if (opts.withRate) {
      const vehicleCount = opts.vehicleCount ?? 5;
      const baseRatePerVehicle = 1200;
      const adjustments = [
        { id: "RJ-100", label: "Risk band adjustment", amountPct: 0 },
        { id: "RJ-221", label: "Urban operation", amountPct: 8 },
        { id: "RJ-330", label: "Telematics credit", amountPct: -5 },
      ];
      const base = baseRatePerVehicle * vehicleCount;
      const adjTotalPct = adjustments.reduce((acc, a) => acc + a.amountPct, 0);
      const premium = opts.premium ?? Math.round(base * (1 + adjTotalPct / 100));
      stages.rate = { status: "done", output: { base, baseRatePerVehicle, vehicleCount, adjustments, premium } };
    }
    if (opts.withComms) {
      stages.communication = {
        status: "done",
        output: {
          proposal_package_pdf_preview: "Sample proposal text...",
          email_body: "Hi Broker, please find attached the proposal...",
        },
      };
    }
    return stages;
  };

  const subs: Submission[] = [
    {
      id: "SUB-1001",
      brokerName: "Marsh & Co.",
      insuredName: "Acme Logistics LLC",
      operationType: "Delivery Services",
      primaryOperations: "For-Hire Trucking",
      yearsInBusiness: 7,
      territories: ["TX", "OK"],
      uwNotes: "Focus on driver training program.",
      documents: baseDocs,
      createdAt: toISO(daysAgo(1)),
      updatedAt: toISO(daysAgo(1)),
      status: "completed",
      stages: makeStages({ withIntake: true, withRisk: true, withCoverage: true, withRate: true, withComms: true, vehicleCount: 6, score: 82, band: "A" }),
    },
    {
      id: "SUB-1002",
      brokerName: "Aon Risk",
      insuredName: "Blue River Plumbing Inc",
      operationType: "Service",
      primaryOperations: "Contractor",
      yearsInBusiness: 12,
      territories: ["CA"],
      documents: baseDocs,
      createdAt: toISO(daysAgo(2)),
      updatedAt: toISO(daysAgo(2)),
      status: "processing",
      stages: makeStages({ withIntake: true, withRisk: true, withCoverage: true, withRate: false, withComms: false, vehicleCount: 4, score: 74, band: "B" }),
    },
    {
      id: "SUB-1003",
      brokerName: "Gallagher",
      insuredName: "Sunrise Foods Distribution",
      operationType: "Distribution",
      primaryOperations: "Food Delivery",
      yearsInBusiness: 4,
      territories: ["FL", "GA"],
      documents: baseDocs,
      createdAt: toISO(daysAgo(0)),
      updatedAt: toISO(daysAgo(0)),
      status: "submitted",
      stages: makeStages({ withIntake: false, withRisk: false, withCoverage: false, withRate: false, withComms: false, vehicleCount: 5 }),
    },
    {
      id: "SUB-1004",
      brokerName: "Willis Towers Watson",
      insuredName: "Pioneer HVAC Services",
      operationType: "Service",
      primaryOperations: "HVAC Contractor",
      yearsInBusiness: 9,
      territories: ["IL"],
      documents: baseDocs,
      createdAt: toISO(daysAgo(3)),
      updatedAt: toISO(daysAgo(3)),
      status: "completed",
      stages: makeStages({ withIntake: true, withRisk: true, withCoverage: true, withRate: true, withComms: true, vehicleCount: 8, score: 69, band: "C", premium: 13250 }),
    },
    {
      id: "SUB-1005",
      brokerName: "Lockton",
      insuredName: "Metro Courier Services",
      operationType: "Delivery",
      primaryOperations: "Courier",
      yearsInBusiness: 2,
      territories: ["NY", "NJ"],
      documents: baseDocs,
      createdAt: toISO(daysAgo(5)),
      updatedAt: toISO(daysAgo(5)),
      status: "processing",
      stages: makeStages({ withIntake: true, withRisk: true, withCoverage: false, withRate: false, withComms: false, vehicleCount: 10, score: 77, band: "B" }),
    },
    {
      id: "SUB-1006",
      brokerName: "Brown & Brown",
      insuredName: "North Star Landscaping",
      operationType: "Service",
      primaryOperations: "Landscaping",
      yearsInBusiness: 6,
      territories: ["WA"],
      documents: baseDocs,
      createdAt: toISO(daysAgo(6)),
      updatedAt: toISO(daysAgo(6)),
      status: "submitted",
      stages: makeStages({ withIntake: false, withRisk: false, withCoverage: false, withRate: false, withComms: false, vehicleCount: 3 }),
    },
    {
      id: "SUB-1007",
      brokerName: "HUB International",
      insuredName: "Coastal Moving & Storage",
      operationType: "Moving",
      primaryOperations: "Household Goods Movers",
      yearsInBusiness: 15,
      territories: ["NC", "SC"],
      documents: baseDocs,
      createdAt: toISO(daysAgo(4)),
      updatedAt: toISO(daysAgo(4)),
      status: "completed",
      stages: makeStages({ withIntake: true, withRisk: true, withCoverage: true, withRate: true, withComms: true, vehicleCount: 12, score: 84, band: "A", premium: 17200 }),
    },
    {
      id: "SUB-1008",
      brokerName: "USI Insurance",
      insuredName: "Red Rock Electrical",
      operationType: "Contractor",
      primaryOperations: "Electrical Contractor",
      yearsInBusiness: 11,
      territories: ["AZ"],
      documents: baseDocs,
      createdAt: toISO(daysAgo(7)),
      updatedAt: toISO(daysAgo(7)),
      status: "error",
      stages: makeStages({ withIntake: true, withRisk: false, withCoverage: false, withRate: false, withComms: false, vehicleCount: 5 }),
    },
  ];

  localStorage.setItem(KEY, JSON.stringify(subs));
  return subs;
}

export function listSubmissions(): Submission[] {
  const seeded = seedIfEmpty();
  return seeded;
}


export function getSubmission(id: string): Submission | undefined {
  return listSubmissions().find((s) => s.id === id);
}

export function saveSubmission(s: Submission) {
  const all = listSubmissions();
  const idx = all.findIndex((x) => x.id === s.id);
  if (idx >= 0) {
    all[idx] = s;
  } else {
    all.unshift(s);
  }
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function updateSubmission(
  id: string,
  updater: (prev: Submission) => Submission
) {
  const all = listSubmissions();
  const idx = all.findIndex((x) => x.id === id);
  if (idx >= 0) {
    all[idx] = updater(all[idx]);
    localStorage.setItem(KEY, JSON.stringify(all));
  }
}

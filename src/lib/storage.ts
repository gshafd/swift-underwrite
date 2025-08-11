import { Submission } from "@/types/submission";

const KEY = "auto-uw-submissions";

export function listSubmissions(): Submission[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Submission[];
  } catch {
    return [];
  }
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

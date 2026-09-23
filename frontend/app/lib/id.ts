export function generateReportId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "rpt_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
}

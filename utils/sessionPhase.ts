/**
 * Aligns with backend SESSION_FLOW session counts (10 total across phases).
 * Used for pastor UI labels only — not authoritative vs backend.
 */
export function phaseLabelForSessionNumber(sessionNumber: number): string | undefined {
  if (!Number.isFinite(sessionNumber) || sessionNumber < 1) return undefined;
  if (sessionNumber <= 1) return "Self Revitalization Phase";
  if (sessionNumber <= 6) return "Church Empowerment Phase";
  if (sessionNumber <= 10) return "Community Revitalization and Multiplication Phase";
  return undefined;
}

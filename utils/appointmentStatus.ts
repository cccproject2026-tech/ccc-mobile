/** Normalize backend appointment status strings for consistent UI checks. */
export function normalizeAppointmentStatus(
  status: unknown,
): string {
  const raw = String(status ?? "")
    .trim()
    .toLowerCase();
  if (!raw) return "";

  if (raw === "canceled" || raw.startsWith("cancel")) {
    return "cancelled";
  }
  if (raw === "in_progress" || raw === "in-progress") {
    return "in-progress";
  }

  return raw;
}

export function isBlockedAppointmentStatus(status: unknown): boolean {
  const normalized = normalizeAppointmentStatus(status);
  return normalized === "completed" || normalized === "cancelled";
}

export function isActiveAppointmentStatus(status: unknown): boolean {
  const normalized = normalizeAppointmentStatus(status);
  if (!normalized) return false;

  return (
    normalized === "scheduled" ||
    normalized === "in-progress" ||
    normalized === "postponed" ||
    normalized === "missed" ||
    normalized === "rescheduled"
  );
}

import type { SessionMode } from "@/types/appointment.types";

/** UI-facing modes (NOT_DECIDED is treated as ONLINE). */
export type DisplaySessionMode = "ONLINE" | "IN_PERSON";

export function resolveDisplaySessionMode(
  mode?: SessionMode | string | null,
): DisplaySessionMode {
  if (String(mode ?? "").toUpperCase() === "IN_PERSON") {
    return "IN_PERSON";
  }
  return "ONLINE";
}

export function sessionModeLabel(mode: DisplaySessionMode): string {
  return mode === "IN_PERSON" ? "In Person" : "Online";
}

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

/** Prefer appointment sessionMode, then session; infer IN_PERSON from platform when needed. */
export function resolveSessionModeFromSources(sources?: {
  sessionMode?: SessionMode | string | null;
  platform?: string | null;
}): DisplaySessionMode {
  const rawMode = String(sources?.sessionMode ?? "").toUpperCase();
  if (rawMode === "IN_PERSON") return "IN_PERSON";
  if (String(sources?.platform ?? "").toLowerCase() === "in_person") {
    return "IN_PERSON";
  }
  return resolveDisplaySessionMode(sources?.sessionMode);
}

export function sessionModeLabel(mode: DisplaySessionMode): string {
  return mode === "IN_PERSON" ? "In Person" : "Online";
}

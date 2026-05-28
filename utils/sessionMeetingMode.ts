import type { SessionMode } from "@/types/appointment.types";
import { labelToPlatform } from "@/utils/appointments/platform";

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

function platformImpliesInPerson(platform?: string | null): boolean {
  if (!platform?.trim()) return false;
  return labelToPlatform(platform) === "in_person";
}

/** Infer IN_PERSON from sessionMode, platform, or a physical meeting location. */
export function resolveSessionModeFromSources(sources?: {
  sessionMode?: SessionMode | string | null;
  platform?: string | null;
  meetingLocation?: string | null;
}): DisplaySessionMode {
  const rawMode = String(sources?.sessionMode ?? "").toUpperCase();
  if (rawMode === "IN_PERSON") return "IN_PERSON";
  if (sources?.meetingLocation?.trim()) return "IN_PERSON";
  if (platformImpliesInPerson(sources?.platform)) return "IN_PERSON";
  return resolveDisplaySessionMode(sources?.sessionMode);
}

type SessionModeSource = {
  sessionMode?: SessionMode | string | null;
  meetingLocation?: string | null;
};

type AppointmentModeSource = {
  sessionMode?: SessionMode | string | null;
  platform?: string | null;
  meetingLocation?: string | null;
};

/** Merge roadmap session + appointment; IN_PERSON wins if either source indicates it. */
export function resolveSessionModeForMentorshipSession(
  session: SessionModeSource,
  appointment?: AppointmentModeSource | null,
): SessionMode {
  if (
    resolveSessionModeFromSources({
      sessionMode: session.sessionMode,
      meetingLocation: session.meetingLocation,
    }) === "IN_PERSON"
  ) {
    return "IN_PERSON";
  }
  if (
    appointment &&
    resolveSessionModeFromSources({
      sessionMode: appointment.sessionMode,
      platform: appointment.platform,
      meetingLocation: appointment.meetingLocation,
    }) === "IN_PERSON"
  ) {
    return "IN_PERSON";
  }
  return "ONLINE";
}

export function sessionModeLabel(mode: DisplaySessionMode): string {
  return mode === "IN_PERSON" ? "In Person" : "Online";
}

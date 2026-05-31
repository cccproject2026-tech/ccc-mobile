import type { Href, Router } from "expo-router";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import { safeGoBack } from "@/utils/navigation";

export type ScheduleMeetingMode = "schedule" | "reschedule";

function appointmentsRouteForRole(role: string | undefined): Href {
  const r = String(role ?? "").toLowerCase();
  if (r === "mentor") return "/(mentor)/(tabs)/appointments";
  if (r === "director") return "/(director)/(tabs)/appointments";
  return "/(pastor)/(tabs)/appointments";
}

/** Base path for in-drawer scheduler stacks (pastor / mentor). Director uses root `/schedule-meeting`. */
export function getScheduleMeetingBase(
  drawerContext?: string,
  role?: string,
): string {
  const ctx = String(drawerContext ?? "").toLowerCase();
  const r = String(role ?? "").toLowerCase();
  if (ctx === "mentor" || r === "mentor") return "/(mentor)/schedule-meeting";
  if (ctx === "pastor" || r === "pastor") return "/(pastor)/schedule-meeting";
  return "/schedule-meeting";
}

export function openScheduleMeeting(
  router: Router,
  role: string | undefined,
  options?: {
    mode?: ScheduleMeetingMode;
    personData?: string;
    appointmentId?: string;
  },
): void {
  const normalizedRole = String(role ?? "").toLowerCase();
  const mode = options?.mode ?? "schedule";
  const base = getScheduleMeetingBase(undefined, normalizedRole);

  const params: Record<string, string> = { mode };
  if (normalizedRole === "pastor" || normalizedRole === "mentor") {
    params.drawerContext = normalizedRole;
  }
  if (options?.personData) params.personData = options.personData;
  if (options?.appointmentId) params.appointmentId = options.appointmentId;

  router.push({
    pathname: `${base}/person`,
    params,
  } as never);
}

/** Back from the first scheduler screen — restore the screen that opened the flow. */
export function leaveScheduleMeetingPersonStep(
  router: Router,
  role: string | undefined,
): void {
  safeGoBack(router, { fallback: appointmentsRouteForRole(role) });
  // Reset after leaving so confirm/time screens don't react to an empty draft while still mounted.
  setTimeout(() => useScheduleMeetingStore.getState().reset(), 0);
}

/** Leave the scheduler after booking — always returns to the role's appointments list. */
export function exitScheduleMeetingFlow(
  router: Router,
  role: string | undefined,
): void {
  router.replace(appointmentsRouteForRole(role));
  // Reset after leaving so confirm/time screens don't react to an empty draft while still mounted.
  setTimeout(() => useScheduleMeetingStore.getState().reset(), 0);
}

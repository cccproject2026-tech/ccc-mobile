import type { Href, Router } from "expo-router";
import type { RescheduleContext } from "@/stores/scheduleMeeting.store";
import { useScheduleMeetingStore } from "@/stores/scheduleMeeting.store";
import { buildReturnTo, normalizeReturnToHref, safeGoBack } from "@/utils/navigation";

export type ScheduleMeetingMode = "schedule" | "reschedule";

export function appointmentsRouteForRole(role: string | undefined): Href {
  const r = String(role ?? "").toLowerCase();
  if (r === "mentor") return "/(mentor)/(tabs)/appointments";
  if (r === "director") return "/(director)/(tabs)/appointments";
  return "/(pastor)/(tabs)/appointments";
}

/** Full appointment view — shown after a successful schedule or reschedule. */
export function meetingDetailsHref(appointmentId: string): Href {
  return {
    pathname: "/appointments/meeting-details",
    params: { appointmentId: String(appointmentId) },
  } as Href;
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

export type ScheduleFlowParams = {
  drawerContext?: string;
  assessmentId?: string;
  returnTo?: string;
  preserveDraft?: string;
  mode?: ScheduleMeetingMode;
  appointmentId?: string;
  rescheduleContext?: RescheduleContext;
};

/** Route params forwarded across person → time → confirm in the scheduler stack. */
export function buildScheduleFlowParams(
  options: ScheduleFlowParams,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (options.drawerContext) params.drawerContext = options.drawerContext;
  if (options.assessmentId) params.assessmentId = options.assessmentId;
  if (options.returnTo) params.returnTo = options.returnTo;
  if (options.preserveDraft) params.preserveDraft = options.preserveDraft;
  if (options.mode) params.mode = options.mode;
  if (options.appointmentId) params.appointmentId = options.appointmentId;
  if (options.rescheduleContext) params.rescheduleContext = options.rescheduleContext;
  return params;
}

export function openScheduleMeeting(
  router: Router,
  role: string | undefined,
  options?: {
    mode?: ScheduleMeetingMode;
    personData?: string;
    appointmentId?: string;
    /** Tags the appointment for assessment meeting links. */
    assessmentId?: string;
    /** When set, back from the first scheduler screen restores this href. */
    returnTo?: string;
    /** Reschedule only — mentorship sessions use PATCH /mentoring-sessions/:id/reschedule. */
    rescheduleContext?: RescheduleContext;
  },
): void {
  const normalizedRole = String(role ?? "").toLowerCase();
  const mode = options?.mode ?? "schedule";
  const base = getScheduleMeetingBase(undefined, normalizedRole);

  const params = buildScheduleFlowParams({
    mode,
    assessmentId: options?.assessmentId,
    returnTo: options?.returnTo,
    appointmentId: options?.appointmentId,
    rescheduleContext: options?.rescheduleContext ?? "appointment",
    ...(normalizedRole === "pastor" || normalizedRole === "mentor"
      ? { drawerContext: normalizedRole }
      : {}),
  });
  if (options?.personData) params.personData = options.personData;

  useScheduleMeetingStore.getState().reset();

  router.push({
    pathname: `${base}/person`,
    params,
  } as never);
}

/** Back from the first scheduler screen — restore the screen that opened the flow. */
export function leaveScheduleMeetingPersonStep(
  router: Router,
  role: string | undefined,
  returnTo?: string,
): void {
  const store = useScheduleMeetingStore.getState();
  store.beginExitFlow();
  const normalizedReturnTo = normalizeReturnToHref(returnTo, role);
  if (normalizedReturnTo) {
    router.replace(normalizedReturnTo as Href);
  } else {
    safeGoBack(router, { fallback: appointmentsRouteForRole(role), returnTo, role });
  }
  setTimeout(() => store.clearDraft(), 0);
}

/** Leave the scheduler after booking — meeting details, assessment guidelines, or custom returnTo. */
export function exitScheduleMeetingFlow(
  router: Router,
  role: string | undefined,
  options?: {
    assessmentId?: string;
    message?: string;
    returnTo?: string;
    appointmentId?: string;
  },
): void {
  const store = useScheduleMeetingStore.getState();
  store.beginExitFlow();

  if (options?.assessmentId) {
    const href = buildReturnTo(
      "/assessments/survey-guidelines",
      {
        assessmentId: options.assessmentId,
        ...(options.message ? { message: options.message } : {}),
      },
      role,
    );
    router.replace(href as never);
  } else if (options?.returnTo) {
    router.replace(normalizeReturnToHref(options.returnTo, role) as Href);
  } else if (options?.appointmentId) {
    router.replace(meetingDetailsHref(options.appointmentId));
  } else {
    router.replace(appointmentsRouteForRole(role));
  }
  setTimeout(() => store.clearDraft(), 0);
}

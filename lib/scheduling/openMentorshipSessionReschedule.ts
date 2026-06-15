import type { Router } from "expo-router";
import {
  buildScheduleFlowParams,
  getScheduleMeetingBase,
} from "@/lib/scheduling/scheduleMeetingNavigation";
import { seedRescheduleDraft } from "@/lib/scheduling/seedScheduleMeetingDraft";
import type { MentorshipSession } from "@/types/session.types";

/**
 * Opens the schedule-meeting time picker directly for a mentorship session reschedule.
 * Skips the person screen and pre-seeds the draft store.
 */
export function openMentorshipSessionReschedule(
  router: Router,
  role: string | undefined,
  session: MentorshipSession,
  options?: { returnTo?: string },
): void {
  const appointmentId = session.appointmentId;
  const pastorId = session.pastorId;
  if (!appointmentId || !pastorId) {
    return;
  }

  const pastorName = session.pastorName?.trim() || "Pastor";
  const returnTo =
    options?.returnTo ??
    `/(mentor)/(tabs)/sessions/${encodeURIComponent(session.id)}`;

  seedRescheduleDraft({
    mode: "reschedule",
    appointmentId: String(appointmentId),
    rescheduleContext: "mentorship",
    person: {
      id: pastorId,
      name: pastorName,
      role: "pastor",
      profilePicture: session.pastorProfilePicture,
    },
  });

  const normalizedRole = String(role ?? "").toLowerCase();
  const base = getScheduleMeetingBase("mentor", normalizedRole);
  const params = buildScheduleFlowParams({
    mode: "reschedule",
    appointmentId: String(appointmentId),
    rescheduleContext: "mentorship",
    returnTo,
    drawerContext: "mentor",
  });

  router.push({
    pathname: `${base}/time`,
    params,
  } as never);
}

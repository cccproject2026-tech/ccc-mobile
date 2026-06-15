import type { Router } from "expo-router";
import { openScheduleMeeting } from "@/lib/scheduling/scheduleMeetingNavigation";
import type { MentorshipSession } from "@/types/session.types";

/**
 * Opens the shared schedule-meeting flow to reschedule a mentorship session.
 * Uses PATCH /mentoring-sessions/:sessionId/reschedule on confirm (not appointments).
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

  openScheduleMeeting(router, role, {
    mode: "reschedule",
    appointmentId: String(appointmentId),
    rescheduleContext: "mentorship",
    returnTo,
    personData: JSON.stringify({
      id: pastorId,
      name: pastorName,
      role: "pastor",
      profilePicture: session.pastorProfilePicture,
    }),
  });
}

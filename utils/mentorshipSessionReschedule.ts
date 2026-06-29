import type { MentorshipSession } from "@/types/session.types";
import { getAppointmentMentorId } from "@/utils/appointmentMentorId";
import {
  isActiveAppointmentStatus,
  isBlockedAppointmentStatus,
  normalizeAppointmentStatus,
} from "@/utils/appointmentStatus";

/**
 * Whether a mentorship session can be rescheduled from the mentor Sessions UI.
 * Requires the logged-in user to match the appointment's assigned mentor.
 */
export function canRescheduleMentorshipSession(
  session: MentorshipSession | null | undefined,
  appointment?: { status?: string; mentorId?: string; mentor?: { id?: string; _id?: string } } | null,
  currentUserId?: string,
): boolean {
  if (!session?.appointmentId) return false;
  if (session.status === "COMPLETED" || session.status === "CANCELLED") {
    return false;
  }

  if (currentUserId) {
    const current = String(currentUserId);
    const appointmentMentorId = getAppointmentMentorId(appointment);

    if (appointmentMentorId && appointmentMentorId !== current) {
      // Pastor may have been reassigned after the appointment was created (Jumpstart/auto-book).
      // Mentor aggregate sessions are only shown for pastors assigned to this mentor.
      if (!session.pastorId) return false;
    } else if (!appointmentMentorId) {
      const sessionMentorId = session.mentorId ? String(session.mentorId) : undefined;
      if (sessionMentorId && sessionMentorId !== current && !session.pastorId) {
        return false;
      }
    }
  }

  const apptStatus = normalizeAppointmentStatus(appointment?.status);
  if (apptStatus && isBlockedAppointmentStatus(apptStatus)) {
    return false;
  }
  if (apptStatus && !isActiveAppointmentStatus(apptStatus)) {
    return false;
  }

  return session.status === "SCHEDULED" || Boolean(apptStatus);
}

/**
 * When redo/auto-book created duplicate extras rows for the same session number,
 * hide completed duplicates if a scheduled row still exists for that number.
 */
export function filterDuplicateCompletedSessions(
  sessions: MentorshipSession[],
): MentorshipSession[] {
  const scheduledNumbers = new Set(
    sessions
      .filter((s) => s.status === "SCHEDULED")
      .map((s) => s.sessionNumber),
  );
  if (scheduledNumbers.size === 0) return sessions;
  return sessions.filter(
    (s) => s.status !== "COMPLETED" || !scheduledNumbers.has(s.sessionNumber),
  );
}

/** Dev-only diagnostics for reschedule eligibility. */
export function logRescheduleEligibility(
  session: MentorshipSession | null | undefined,
  appointment: { id?: string; mentorId?: string; status?: string } | null | undefined,
  currentUserId: string | undefined,
  canReschedule: boolean,
): void {
  if (!__DEV__) return;

  console.log("[Reschedule eligibility]", {
    canReschedule,
    sessionId: session?.id,
    sessionMentorId: session?.mentorId,
    sessionAppointmentId: session?.appointmentId,
    sessionPastorId: session?.pastorId,
    sessionStatus: session?.status,
    appointmentId: appointment?.id,
    appointmentMentorId: appointment
      ? getAppointmentMentorId(appointment)
      : undefined,
    appointmentStatus: appointment?.status,
    appointmentMeetingDate: (appointment as { meetingDate?: string } | undefined)
      ?.meetingDate,
    normalizedAppointmentStatus: normalizeAppointmentStatus(appointment?.status),
    currentUserId,
  });
}

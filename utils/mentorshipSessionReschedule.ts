import type { MentorshipSession } from "@/types/session.types";
import { getAppointmentMentorId } from "@/utils/appointmentMentorId";

const BLOCKED_APPOINTMENT_STATUSES = new Set([
  "completed",
  "cancelled",
]);

const ACTIVE_APPOINTMENT_STATUSES = new Set([
  "scheduled",
  "in-progress",
  "in_progress",
  "postponed",
  "missed",
  "rescheduled",
]);

/**
 * Whether a mentorship session can be rescheduled from the mentor Sessions UI.
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
    const assignedMentorId =
      getAppointmentMentorId(appointment) ?? session.mentorId;
    if (!assignedMentorId) {
      return false;
    }
    if (String(assignedMentorId) !== String(currentUserId)) {
      return false;
    }
  }

  const apptStatus = String(appointment?.status ?? "").toLowerCase();
  if (apptStatus && BLOCKED_APPOINTMENT_STATUSES.has(apptStatus)) {
    return false;
  }
  if (apptStatus && !ACTIVE_APPOINTMENT_STATUSES.has(apptStatus)) {
    return false;
  }

  return session.status === "SCHEDULED" || Boolean(apptStatus);
}

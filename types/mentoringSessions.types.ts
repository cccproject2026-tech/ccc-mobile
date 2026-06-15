import type { MentorshipSession } from "@/types/session.types";

/** Pending / applied pastor reschedule request surfaced on unified session rows. */
export type MentoringRescheduleRequestStatus =
  | "pending"
  | "applied"
  | "dismissed";

export interface MentoringRescheduleRequestSnippet {
  id: string;
  status: MentoringRescheduleRequestStatus | string;
  reason?: string;
  createdAt?: string;
}

export interface MentorshipReschedulePayload {
  mentorId: string;
  newMeetingDate: string;
}

export interface MentorshipRescheduleResponse {
  session?: MentorshipSession & {
    meetingLink?: string | null;
    appointmentId?: string | null;
  };
  sessionNumber?: number;
  shiftedFutureSessionsByDays?: number;
}

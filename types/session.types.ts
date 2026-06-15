import type { MentorshipInsightsPayload } from "@/types/mentorshipInsights.types";
import type { MentoringRescheduleRequestSnippet } from "@/types/mentoringSessions.types";
import type {
  SessionMode,
  SessionRecordingStatus,
} from "@/types/appointment.types";

export type MentorshipSessionStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "POSTPONED"
  | "MISSED"
  | "CANCELLED"
  | "RESCHEDULED";

/** Chat-style lines for session transcript (same shape as pastor meeting UI). */
export type MentorshipTranscriptLine = {
  role: "mentor" | "pastor";
  text: string;
};

/** AI summary sections for a session (aligned with pastor MeetingAiSummary). */
export type MentorshipAiSummary = {
  overview: string;
  keyDiscussionPoints: string;
  adviceGiven: string;
  actionItems: string;
  nextSessionFocus: string;
};

export interface MentorshipSession {
  id: string;
  sessionNumber: number;
  scheduledDate: string;
  status: MentorshipSessionStatus;
  mentorNote?: string;
  pastorNote?: string;
  appointmentId?: string;
  /** Join URL when API embeds it on the session or nested appointment. */
  meetingLink?: string;
  /** Set when sessions are aggregated for a mentor (pastor / mentee user id) */
  pastorId?: string;
  /** Display name for mentor UI when aggregating multiple pastors */
  pastorName?: string;
  /** Profile image URL from assigned mentee record (mentor aggregate sessions only) */
  pastorProfilePicture?: string;
  /** Optional when API enriches roadmap session payload */
  transcript?: MentorshipTranscriptLine[];
  aiSummary?: MentorshipAiSummary;
  mentorshipInsights?: MentorshipInsightsPayload;
  sessionMode?: SessionMode;
  recordingStatus?: SessionRecordingStatus;
  recordingUrl?: string;
  meetingLocation?: string;
  /** Populated when using unified mentoring-sessions API. */
  rescheduleRequest?: MentoringRescheduleRequestSnippet | null;
  mentorId?: string;
  title?: string;
}

export interface MentorshipSessionsApiResponse {
  success: boolean;
  message: string;
  data: unknown;
}

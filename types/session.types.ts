import type { MentorshipInsightsPayload } from "@/types/mentorshipInsights.types";

export type MentorshipSessionStatus = "SCHEDULED" | "COMPLETED";

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
}

export interface MentorshipSessionsApiResponse {
  success: boolean;
  message: string;
  data: unknown;
}

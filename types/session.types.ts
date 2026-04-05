export type MentorshipSessionStatus = "SCHEDULED" | "COMPLETED";

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
}

export interface MentorshipSessionsApiResponse {
  success: boolean;
  message: string;
  data: unknown;
}

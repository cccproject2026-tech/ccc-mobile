export type MeetingStatusUi =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED";

export type TranscriptLineUi = {
  role: "mentor" | "pastor";
  text: string;
};

export type AiSummarySectionsUi = {
  overview: string;
  keyDiscussionPoints: string;
  adviceGiven: string;
  actionItems: string;
  nextSessionFocus: string;
};

export type PastorMeetingUi = {
  id: string;
  meetingNumber: number;
  title: string;
  scheduledDate: string;
  status: MeetingStatusUi;
  isRedo: boolean;
  isLatest: boolean;
  mentorNote?: string;
  pastorNote?: string;
  transcript: TranscriptLineUi[];
  aiSummary: AiSummarySectionsUi;
};

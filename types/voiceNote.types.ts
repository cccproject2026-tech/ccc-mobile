export type VoiceNoteStatus =
  | "pending"
  | "transcribing"
  | "summarizing"
  | "completed"
  | "failed";

export type VoiceNoteSource = "upload" | "recording";

export interface VoiceNoteSummary {
  sessionOverview: string;
  keyDiscussionPoints: string[];
  mentorGuidance: string[];
  actionItems: string[];
  followUp: string;
}

export interface VoiceNote {
  id: string;
  _id?: string;
  title: string;
  status: VoiceNoteStatus;
  source?: VoiceNoteSource;
  audioUrl?: string;
  transcript?: string;
  transcriptSummary?: VoiceNoteSummary;
  errorMessage?: string;
  recordingPlatform?: string;
  recordingDeviceType?: string;
  recordingDurationSeconds?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface VoiceNoteUploadPayload {
  audio: {
    uri: string;
    name: string;
    type: string;
  };
  title: string;
  source: VoiceNoteSource;
  recordingPlatform?: string;
  recordingDeviceType?: string;
  recordingDurationSeconds?: number;
}

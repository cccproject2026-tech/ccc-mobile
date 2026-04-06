import { DEMO_SESSION_AI_SUMMARY } from "@/constants/demoSessionAiSummary";
import { DEMO_SESSION_TRANSCRIPT_LINES } from "@/constants/demoSessionTranscript";
import type {
  MentorshipAiSummary,
  MentorshipTranscriptLine,
} from "@/types/session.types";

function hasAiSummaryContent(a?: MentorshipAiSummary): boolean {
  if (!a) return false;
  return [
    a.overview,
    a.keyDiscussionPoints,
    a.adviceGiven,
    a.actionItems,
    a.nextSessionFocus,
  ].some((s) => typeof s === "string" && s.trim().length > 0);
}

/** Uses API transcript when present; otherwise demo lines for UI preview. */
export function transcriptLinesForSession(
  session: { transcript?: MentorshipTranscriptLine[] },
): MentorshipTranscriptLine[] {
  if (session.transcript?.length) return session.transcript;
  return DEMO_SESSION_TRANSCRIPT_LINES;
}

/** Uses API AI summary when any section is present; otherwise demo copy for preview. */
export function aiSummaryForSession(
  session: { aiSummary?: MentorshipAiSummary },
): MentorshipAiSummary {
  if (hasAiSummaryContent(session.aiSummary)) {
    return session.aiSummary!;
  }
  return DEMO_SESSION_AI_SUMMARY;
}

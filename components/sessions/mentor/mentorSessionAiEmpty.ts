import type { MentorshipAiSummary } from "@/types/session.types";

export function emptyMentorAiSummary(): MentorshipAiSummary {
  return {
    overview: "",
    keyDiscussionPoints: "",
    adviceGiven: "",
    actionItems: "",
    nextSessionFocus: "",
  };
}

import { MeetingAiSummary } from "@/components/sessions/pastor/MeetingAiSummary";
import { MeetingTranscript } from "@/components/sessions/pastor/MeetingTranscript";
import type { AiSummarySectionsUi } from "@/components/sessions/pastor/pastorSessionDetail.types";
import type { MentorshipAiSummary, MentorshipTranscriptLine } from "@/types/session.types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { emptyMentorAiSummary } from "./mentorSessionAiEmpty";

type Props = {
  transcript?: MentorshipTranscriptLine[];
  aiSummary?: MentorshipAiSummary;
};

function toAiSummaryUi(s?: MentorshipAiSummary): AiSummarySectionsUi {
  const e = emptyMentorAiSummary();
  const m = s ?? e;
  return {
    overview: m.overview || e.overview,
    keyDiscussionPoints: m.keyDiscussionPoints || e.keyDiscussionPoints,
    adviceGiven: m.adviceGiven || e.adviceGiven,
    actionItems: m.actionItems || e.actionItems,
    nextSessionFocus: m.nextSessionFocus || e.nextSessionFocus,
  };
}

/** Transcript + AI summary for mentor session detail (pastor notes excluded elsewhere). */
export function MentorSessionEnrichmentSection({ transcript, aiSummary }: Props) {
  const lines = transcript ?? [];
  const summaryUi = toAiSummaryUi(aiSummary);

  return (
    <View style={styles.wrap}>
      <MeetingTranscript lines={lines} />
      <View style={styles.aiGap}>
        <MeetingAiSummary summary={summaryUi} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
    marginBottom: 8,
  },
  aiGap: {
    marginTop: 4,
  },
});

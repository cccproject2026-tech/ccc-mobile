import { SessionDetailContentTabs } from "@/components/sessions/SessionDetailContentTabs";
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
  notesSlot: React.ReactNode;
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

/** Notes block, then Transcript / Summary tabs (mentor session detail). */
export function MentorSessionEnrichmentSection({
  transcript,
  aiSummary,
  notesSlot,
}: Props) {
  const lines = transcript ?? [];
  const summaryUi = toAiSummaryUi(aiSummary);

  return (
    <View style={styles.wrap}>
      <View style={styles.notesBlock}>{notesSlot}</View>
      <SessionDetailContentTabs
        surface="dark"
        transcriptSlot={
          <MeetingTranscript lines={lines} hideSectionTitle surface="dark" />
        }
        summarySlot={
          <MeetingAiSummary summary={summaryUi} hideHeadline surface="dark" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
    width: "100%",
    minWidth: 0,
    gap: 4,
  },
  notesBlock: {
    width: "100%",
    minWidth: 0,
  },
});

import React, { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AiSummarySectionsUi } from "./pastorSessionDetail.types";

const SP = 16;

type Props = {
  summary: AiSummarySectionsUi;
};

function Section({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  const trimmed = body.trim();
  const empty = !trimmed;
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={empty ? styles.blockEmpty : styles.blockBody}>
        {empty ? "Not available yet." : trimmed}
      </Text>
    </View>
  );
}

export function MeetingAiSummary({ summary }: Props) {
  const { width } = useWindowDimensions();
  const cardPad = useMemo(
    () => (width < 360 ? 14 : width < 420 ? 16 : 18),
    [width],
  );
  return (
    <View style={styles.wrap}>
      <Text style={styles.headline}>AI summary</Text>
      <View style={[styles.card, { padding: cardPad, gap: cardPad }]}>
        <Section title="Overview" body={summary.overview} />
        <Section title="Key discussion points" body={summary.keyDiscussionPoints} />
        <Section title="Advice given" body={summary.adviceGiven} />
        <Section title="Action items" body={summary.actionItems} />
        <Section title="Next session focus" body={summary.nextSessionFocus} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: SP },
  headline: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  block: { gap: 6 },
  blockTitle: {
    color: "rgba(250, 204, 21, 0.95)",
    fontSize: 14,
    fontWeight: "800",
  },
  blockBody: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 22,
  },
  blockEmpty: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
  },
});

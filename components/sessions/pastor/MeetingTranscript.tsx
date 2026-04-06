import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { TranscriptLineUi } from "./pastorSessionDetail.types";

const SP = 16;

type Props = {
  lines: TranscriptLineUi[];
};

export function MeetingTranscript({ lines }: Props) {
  const { width } = useWindowDimensions();
  const transcriptMaxHeight = useMemo(
    () => Math.min(280, Math.max(180, width * 0.42)),
    [width],
  );
  const hasContent = lines.some((l) => l.text.trim().length > 0);

  if (!hasContent) {
    return (
      <View style={styles.emptyWrap}>
        <Ionicons name="chatbubbles-outline" size={22} color="rgba(255,255,255,0.45)" />
        <Text style={styles.emptyTitle}>Transcript</Text>
        <Text style={styles.emptySub}>
          No transcript is available for this meeting yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Transcript</Text>
      <ScrollView
        style={[styles.scroll, { maxHeight: transcriptMaxHeight }]}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {lines.map((line, i) => {
          const isMentor = line.role === "mentor";
          return (
            <View
              key={`${i}-${line.role}`}
              style={[
                styles.bubbleRow,
                isMentor ? styles.bubbleRowMentor : styles.bubbleRowPastor,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isMentor ? styles.bubbleMentor : styles.bubblePastor,
                ]}
              >
                <Text style={styles.bubbleRole}>
                  {isMentor ? "Mentor" : "Pastor"}
                </Text>
                <Text style={styles.bubbleText}>{line.text.trim()}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: SP },
  sectionTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  scroll: {},
  scrollContent: { paddingBottom: 6, gap: 10 },
  bubbleRow: { width: "100%" },
  bubbleRowMentor: { alignItems: "flex-end" },
  bubbleRowPastor: { alignItems: "flex-start" },
  bubble: {
    maxWidth: "88%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMentor: {
    backgroundColor: "rgba(125, 211, 252, 0.16)",
  },
  bubblePastor: {
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  bubbleRole: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  bubbleText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 14,
    lineHeight: 21,
  },
  emptyWrap: {
    marginTop: SP,
    padding: SP,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "800",
    fontSize: 15,
  },
  emptySub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
});

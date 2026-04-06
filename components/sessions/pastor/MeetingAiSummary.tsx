import React, { useMemo } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AiSummarySectionsUi } from "./pastorSessionDetail.types";

const SP = 16;
const SECTION_GAP = 14;

type Props = {
  summary: AiSummarySectionsUi;
  hideHeadline?: boolean;
  surface?: "dark" | "light";
};

function Section({
  title,
  body,
  surface,
  isLast,
}: {
  title: string;
  body: string;
  surface: "dark" | "light";
  isLast?: boolean;
}) {
  const L = surface === "light" ? light : dark;
  const trimmed = body.trim();
  const empty = !trimmed;
  const lines = empty ? [] : trimmed.split(/\n/).map((s) => s.trim()).filter(Boolean);
  return (
    <View style={[styles.block, L.block, !isLast && styles.blockDivider, !isLast && L.blockDivider]}>
      <Text style={[styles.blockTitle, L.blockTitle]}>{title}</Text>
      {empty ? (
        <Text style={[styles.blockEmpty, L.blockEmpty]}>Not available yet.</Text>
      ) : lines.length > 1 ? (
        <View style={styles.bulletList}>
          {lines.map((line, i) => (
            <View key={i} style={styles.bulletRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={L.bulletColor}
                style={styles.bulletIcon}
              />
              <Text style={[styles.blockBody, L.blockBody]}>{line}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.blockBody, L.blockBody]}>{trimmed}</Text>
      )}
    </View>
  );
}

const dark = {
  block: {},
  blockDivider: {
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  blockTitle: {
    color: "rgba(250, 204, 21, 0.95)",
  },
  blockBody: {
    color: "rgba(255,255,255,0.9)",
  },
  blockEmpty: {
    color: "rgba(255,255,255,0.45)",
  },
  bulletColor: "rgba(52, 211, 153, 0.95)",
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  headline: {
    color: "rgba(255,255,255,0.85)",
  },
};

const light = {
  block: {
    backgroundColor: "rgba(248, 250, 252, 0.9)",
  },
  blockDivider: {
    borderBottomColor: "rgba(15, 23, 42, 0.08)",
  },
  blockTitle: {
    color: "#1D4ED8",
  },
  blockBody: {
    color: "#0F172A",
  },
  blockEmpty: {
    color: "rgba(15, 23, 42, 0.45)",
  },
  bulletColor: "#16A34A",
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  headline: {
    color: "rgba(15, 23, 42, 0.55)",
  },
};

export function MeetingAiSummary({
  summary,
  hideHeadline,
  surface = "dark",
}: Props) {
  const { width } = useWindowDimensions();
  const L = surface === "light" ? light : dark;
  const cardPad = useMemo(
    () => (width < 360 ? 14 : width < 420 ? 16 : 18),
    [width],
  );
  return (
    <View style={[styles.wrap, surface === "light" && styles.wrapLight]}>
      {hideHeadline ? null : (
        <Text style={[styles.headline, L.headline]}>AI summary</Text>
      )}
      <View
        style={[
          styles.card,
          L.card,
          {
            padding: cardPad,
            gap: SECTION_GAP,
            borderWidth: surface === "light" ? 1 : 0,
          },
        ]}
      >
        <Section surface={surface} title="Overview" body={summary.overview} />
        <Section
          surface={surface}
          title="Key discussion points"
          body={summary.keyDiscussionPoints}
        />
        <Section surface={surface} title="Advice given" body={summary.adviceGiven} />
        <Section surface={surface} title="Action items" body={summary.actionItems} />
        <Section
          surface={surface}
          title="Next session focus"
          body={summary.nextSessionFocus}
          isLast
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: SP, width: "100%", minWidth: 0 },
  wrapLight: { marginTop: 0 },
  headline: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  card: {
    borderRadius: 14,
  },
  block: {
    gap: 8,
    paddingVertical: 4,
    borderRadius: 12,
    paddingHorizontal: 2,
  },
  blockDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: SECTION_GAP,
    marginBottom: 2,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  blockBody: {
    fontSize: 14,
    lineHeight: 22,
    flex: 1,
    flexShrink: 1,
  },
  blockEmpty: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
  },
  bulletList: {
    gap: 10,
    width: "100%",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    maxWidth: "100%",
  },
  bulletIcon: {
    marginTop: 3,
    flexShrink: 0,
  },
});

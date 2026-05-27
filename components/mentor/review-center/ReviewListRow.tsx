import type { ReviewItem } from "@/lib/mentor/reviewCenter.types";
import { getDashboardBucket } from "@/lib/mentor/reviewCenter.types";
import { DASHBOARD_CARD_CONFIG } from "@/components/mentor/review-center/ReviewDashboardCard";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function formatSubmittedTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "—";
  }
}

type Props = {
  item: ReviewItem;
  onPress: () => void;
};

export function ReviewListRow({ item, onPress }: Props) {
  const bucket = getDashboardBucket(item);
  const accent = bucket ? DASHBOARD_CARD_CONFIG[bucket].accentColor : "#94A3B8";

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.pastor} numberOfLines={1}>
          {item.pastorName}
        </Text>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.typeBadge,
              item.type === "roadmap" ? styles.typeRoadmap : styles.typeAssessment,
            ]}
          >
            <Ionicons
              name={item.type === "roadmap" ? "map-outline" : "clipboard-outline"}
              size={10}
              color={item.type === "roadmap" ? "#38BDF8" : "#A78BFA"}
            />
            <Text
              style={[
                styles.typeText,
                { color: item.type === "roadmap" ? "#38BDF8" : "#A78BFA" },
              ]}
            >
              {item.type === "roadmap" ? "Roadmap" : "Assessment"}
            </Text>
          </View>
          {item.resubmissionCount > 0 && (
            <Text style={styles.resubmit}>×{item.resubmissionCount}</Text>
          )}
          {item.submittedAt ? (
            <Text style={styles.time}>{formatSubmittedTime(item.submittedAt)}</Text>
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.35)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  pastor: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 2,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeRoadmap: {
    backgroundColor: "rgba(56,189,248,0.12)",
  },
  typeAssessment: {
    backgroundColor: "rgba(167,139,250,0.12)",
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  resubmit: {
    color: "#60A5FA",
    fontSize: 10,
    fontWeight: "700",
  },
  time: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
  },
});

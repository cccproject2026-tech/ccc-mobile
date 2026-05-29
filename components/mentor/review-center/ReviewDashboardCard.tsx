import type { ReviewDashboardBucket } from "@/lib/mentor/reviewCenter.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const DASHBOARD_CARD_CONFIG: Record<
  ReviewDashboardBucket,
  {
    title: string;
    subtitle: (count: number) => string;
    accentColor: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
  }
> = {
  resubmitted_tasks: {
    title: "Resubmitted Tasks",
    subtitle: (n) => (n === 1 ? "1 requires attention" : `${n} require attention`),
    accentColor: "#3B82F6",
    icon: "refresh-outline",
  },
  new_roadmap_submissions: {
    title: "New Roadmap Submissions",
    subtitle: (n) => (n === 1 ? "1 awaiting review" : `${n} awaiting review`),
    accentColor: "#F97316",
    icon: "map-outline",
  },
  new_assessments: {
    title: "New Assessments",
    subtitle: (n) => (n === 1 ? "1 pending review" : `${n} pending review`),
    accentColor: "#A855F7",
    icon: "clipboard-outline",
  },
  not_started: {
    title: "Not Started",
    subtitle: (n) => (n === 1 ? "1 task not started" : `${n} tasks not started`),
    accentColor: "#FBBF24",
    icon: "ellipse-outline",
  },
};

/** Buckets that need mentor action (badge counts these). */
export const ACTION_BUCKET_ORDER: ReviewDashboardBucket[] = [
  "new_roadmap_submissions",
  "resubmitted_tasks",
  "new_assessments",
  "not_started",
];

export const DASHBOARD_BUCKET_ORDER: ReviewDashboardBucket[] = [
  ...ACTION_BUCKET_ORDER,
];

type Props = {
  bucket: ReviewDashboardBucket;
  count: number;
  onPress: () => void;
};

export function ReviewDashboardCard({ bucket, count, onPress }: Props) {
  const config = DASHBOARD_CARD_CONFIG[bucket];

  return (
    <Pressable
      style={[styles.card, { borderLeftColor: config.accentColor }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${config.title}, ${config.subtitle(count)}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${config.accentColor}22` }]}>
        <Ionicons name={config.icon} size={22} color={config.accentColor} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle(count)}</Text>
      </View>
      <View style={styles.trailing}>
        <Text style={[styles.count, { color: config.accentColor }]}>{count}</Text>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderLeftWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "500",
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  count: {
    fontSize: 20,
    fontWeight: "800",
    minWidth: 24,
    textAlign: "right",
  },
});

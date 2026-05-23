import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  completedTasks: number;
  totalTasks: number;
};

/** Single journey-wide progress indicator — avoids duplicate counts elsewhere on the screen. */
export function PastorJourneyHeader({ completedTasks, totalTasks }: Props) {
  const percentage = useMemo(() => {
    if (totalTasks <= 0) return 0;
    return Math.min(100, Math.round((completedTasks / totalTasks) * 100));
  }, [completedTasks, totalTasks]);

  const countLabel =
    totalTasks > 0
      ? `${completedTasks} of ${totalTasks} tasks completed`
      : "Your journey will appear here when phases are assigned";

  return (
    <View style={styles.wrap} accessibilityRole="header">
      <Text style={styles.title}>Your Revitalization Journey</Text>
      <Text style={styles.subtitle}>Progress through your phases step-by-step</Text>

      <View style={styles.progressBlock}>
        <View style={styles.progressTrack} accessibilityRole="progressbar">
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.countText}>{countLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 4,
    marginBottom: 6,
    gap: 6,
  },
  title: {
    color: roadmapTheme.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  subtitle: {
    color: roadmapTheme.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 8,
  },
  progressBlock: {
    gap: 10,
    marginTop: 4,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: roadmapTheme.accentMint,
    minWidth: 4,
  },
  countText: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
});

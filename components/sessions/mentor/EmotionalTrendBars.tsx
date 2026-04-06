import type { EmotionalTrendPoint } from "@/types/mentorshipInsights.types";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { mentorSessionPremium as T } from "./mentorSessionTheme";

function normalizeWidthPct(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const a = Math.abs(value);
  if (a <= 1) return Math.min(100, a * 100);
  if (a <= 100) return Math.min(100, a);
  return 100;
}

type Props = {
  points: EmotionalTrendPoint[];
};

export function EmotionalTrendBars({ points }: Props) {
  const maxW = useMemo(
    () => Math.max(1, ...points.map((p) => normalizeWidthPct(p.value))),
    [points],
  );

  if (points.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {points.map((p) => {
        const w = normalizeWidthPct(p.value);
        const relative = maxW > 0 ? (w / maxW) * 100 : 0;
        return (
          <View key={p.label} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.label} numberOfLines={2}>
                {p.label}
              </Text>
              <Text style={styles.valueNum}>
                {Number.isInteger(p.value) ? p.value : p.value.toFixed(1)}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${relative}%` }]} />
            </View>
          </View>
        );
      })}
      <Text style={styles.caption}>
        Relative strength of each signal (normalized across listed items).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  row: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  label: {
    flex: 1,
    color: T.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  valueNum: {
    color: T.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: T.barTrack,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: T.barFill,
  },
  caption: {
    marginTop: 2,
    color: T.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
});

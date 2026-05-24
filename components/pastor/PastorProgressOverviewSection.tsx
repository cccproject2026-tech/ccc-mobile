import {
  PastorProgressStatCard,
  getProgressStatCardHeight,
} from "@/components/pastor/PastorProgressStatCard";
import {
  FOCUS_TILE_GAP,
  computeProgressOverviewColumnWidths,
} from "@/components/pastor/pastorFocusTileLayout";
import type { PastorProgressOverviewStat } from "@/hooks/pastor/usePastorProgressOverview";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

type PastorProgressOverviewSectionProps = {
  stats: PastorProgressOverviewStat[];
  isLoading?: boolean;
  onViewDetails?: () => void;
  onStatPress?: (stat: PastorProgressOverviewStat) => void;
};

export function PastorProgressOverviewSection({
  stats,
  isLoading = false,
  onViewDetails,
  onStatPress,
}: PastorProgressOverviewSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const tileHeight = getProgressStatCardHeight(screenWidth);
  const [rowWidth, setRowWidth] = useState(0);

  const columnWidths = useMemo(
    () => computeProgressOverviewColumnWidths(rowWidth),
    [rowWidth],
  );

  const onRowLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    setRowWidth((prev) => (prev === nextWidth ? prev : nextWidth));
  }, []);

  return (
    <View style={styles.focusCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderCopy}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleIconWrap}>
              <Ionicons name="trending-up-outline" size={18} color="#fff" />
            </View>
            <Text style={styles.sectionTitleText}>My Progress Overview</Text>
          </View>
          <Text style={styles.focusIntroText} numberOfLines={2}>
            Track sessions, assessments, roadmap, and certificates at a glance.
          </Text>
        </View>
        {onViewDetails ? (
          <Pressable
            onPress={onViewDetails}
            style={({ pressed }) => [
              styles.viewDetailsButton,
              pressed ? styles.viewDetailsPressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel="View progress details"
          >
            {/* <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={14} color="#7DD3FC" /> */}
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={[styles.loadingWrap, { minHeight: tileHeight }]}>
          <ActivityIndicator color="#fff" size="small" />
        </View>
      ) : (
        <View style={styles.row} onLayout={onRowLayout}>
          {stats.map((stat, index) => {
            const slotWidth = columnWidths[index] ?? 0;
            const marginRight = index < stats.length - 1 ? FOCUS_TILE_GAP : 0;

            return (
              <View
                key={stat.id}
                style={[
                  styles.tileSlot,
                  slotWidth > 0 ? { width: slotWidth } : styles.tileSlotFlex,
                  { height: tileHeight, marginRight },
                ]}
              >
                <PastorProgressStatCard
                  icon={stat.icon}
                  value={stat.value}
                  label={stat.label}
                  tileHeight={tileHeight}
                  onPress={
                    onStatPress ? () => onStatPress(stat) : undefined
                  }
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  focusCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 14,
    paddingBottom: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 4,
  },
  sectionHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  sectionTitleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitleText: {
    flex: 1,
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  focusIntroText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 16,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
    paddingTop: 6,
  },
  viewDetailsPressed: {
    opacity: 0.85,
  },
  viewDetailsText: {
    color: "#7DD3FC",
    fontSize: 12,
    fontWeight: "700",
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
  },
  tileSlot: {
    overflow: "hidden",
  },
  tileSlotFlex: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
  },
});

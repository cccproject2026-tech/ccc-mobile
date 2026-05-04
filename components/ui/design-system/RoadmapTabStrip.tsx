import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

export type RoadmapTabItem = { key: string; label: string };

type Props = {
  tabs: RoadmapTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Use horizontal scroll when many tabs (e.g. mentor status filters) */
  scrollable?: boolean;
};

/**
 * Pill tabs matching Pastor roadmap list (All / Completed / Remaining).
 */
export function RoadmapTabStrip({ tabs, activeKey, onChange, scrollable }: Props) {
  const body = tabs.map((t) => {
    const active = activeKey === t.key;
    return (
      <Pressable
        key={t.key}
        onPress={() => onChange(t.key)}
        style={[styles.tabPill, active ? styles.tabPillActive : null, scrollable ? styles.tabPillScroll : null]}
      >
        <Text style={[styles.tabText, active ? styles.tabTextActive : null]} numberOfLines={1}>
          {t.label}
        </Text>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <View style={styles.scrollWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollInner}
        >
          {body}
        </ScrollView>
      </View>
    );
  }

  return <View style={styles.row}>{body}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  scrollWrap: {
    marginTop: 14,
    marginBottom: 14,
  },
  scrollInner: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 8,
  },
  tabPill: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 108,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabPillScroll: {
    flexGrow: 0,
    minWidth: 96,
    paddingHorizontal: 14,
  },
  tabPillActive: {
    backgroundColor: "#fff",
    borderColor: "rgba(255,255,255,0.85)",
  },
  tabText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
  },
  tabTextActive: {
    color: roadmapTheme.tealDeep,
  },
});

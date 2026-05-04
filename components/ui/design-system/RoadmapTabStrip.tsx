import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

export type RoadmapTabItem = {
  key: string;
  label: string;
  badge?: number;
};

type Props = {
  tabs: RoadmapTabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  /** Use horizontal scroll when there are many tabs. */
  scrollable?: boolean;
};

/** Pill tabs matching Pastor Home / roadmap screens. */
export function RoadmapTabStrip({ tabs, activeKey, onChange, scrollable }: Props) {
  const body = tabs.map((t) => {
    const active = t.key === activeKey;
    const showBadge = typeof t.badge === "number";
    return (
      <Pressable
        key={t.key}
        onPress={() => onChange(t.key)}
        style={[styles.tab, active ? styles.tabActive : null, scrollable ? styles.tabScrollable : null]}
      >
        <Text style={[styles.tabText, active ? styles.tabTextActive : null]} numberOfLines={1}>
          {t.label}
        </Text>
        {showBadge ? (
          <View style={[styles.badge, active ? styles.badgeActive : null]}>
            <Text style={[styles.badgeText, active ? styles.badgeTextActive : null]}>{t.badge}</Text>
          </View>
        ) : null}
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
    marginTop: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  scrollWrap: {
    marginTop: 12,
    marginBottom: 14,
  },
  scrollInner: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 8,
  },
  tab: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 108,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  tabScrollable: {
    flexGrow: 0,
    minWidth: 96,
    paddingHorizontal: 14,
  },
  tabActive: {
    backgroundColor: "#fff",
    borderColor: "rgba(255,255,255,0.85)",
  },
  tabText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
  },
  tabTextActive: {
    color: roadmapTheme.textActive,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  badgeActive: {
    backgroundColor: "rgba(14, 90, 98, 0.10)",
    borderColor: "rgba(14, 90, 98, 0.18)",
  },
  badgeText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "800",
  },
  badgeTextActive: {
    color: roadmapTheme.textActive,
  },
});


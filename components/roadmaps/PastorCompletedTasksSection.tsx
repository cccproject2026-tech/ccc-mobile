import { RoadmapCard } from "@/components/director/ProgressRoadmapCard";
import { CommonCard, roadmapTheme, SectionHeader } from "@/components/ui/design-system/index";
import type { PastorCompletedTaskItem } from "@/lib/roadmap/helpers";
import { getPastorCompletedTaskCardData } from "@/lib/roadmap/mappers";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  items: PastorCompletedTaskItem[];
  onOpenTask: (item: PastorCompletedTaskItem) => void;
  showHeader?: boolean;
};

export function PastorCompletedTasksSection({
  items,
  onOpenTask,
  showHeader = true,
}: Props) {
  const handlePress = useCallback(
    (item: PastorCompletedTaskItem) => {
      onOpenTask(item);
    },
    [onOpenTask],
  );

  const cardRows = useMemo(
    () =>
      items.map((item) => ({
        item,
        card: getPastorCompletedTaskCardData(item, item.task),
      })),
    [items],
  );

  if (items.length === 0) {
    return (
      <View style={styles.wrap}>
        {showHeader ? (
          <SectionHeader
            title="Your history"
            subtitle="Tasks you have already finished across your journey."
            showDivider
          />
        ) : null}
        <CommonCard style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="time-outline" size={32} color="rgba(111, 212, 190, 0.75)" />
          </View>
          <Text style={styles.emptyTitle}>Nothing in your history yet</Text>
          <Text style={styles.emptySubtitle}>
            When you finish tasks on your journey, they will show up here so you can review them
            anytime.
          </Text>
        </CommonCard>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {showHeader ? (
        <SectionHeader
          title="Your history"
          subtitle="Review finished tasks from your journey."
          showDivider
        />
      ) : null}

      <View style={styles.list}>
        {cardRows.map(({ item, card }) => (
          <Pressable
            key={item.id}
            onPress={() => handlePress(item)}
            style={styles.cardPress}
          >
            <RoadmapCard data={card} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  list: {
    gap: 12,
  },
  cardPress: {
    borderRadius: 14,
    overflow: "hidden",
  },
  emptyCard: {
    paddingVertical: 22,
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(34, 197, 94, 0.06)",
    borderColor: "rgba(74, 222, 128, 0.14)",
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  emptySubtitle: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 17,
    maxWidth: 280,
  },
});

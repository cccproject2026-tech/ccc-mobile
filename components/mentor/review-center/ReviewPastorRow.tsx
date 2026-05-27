import { UserAvatar } from "@/components/ui/UserAvatar";
import type { ReviewPastorGroup } from "@/lib/mentor/reviewCenter.types";
import { resolveProfilePictureUrl } from "@/utils/avatarSource";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  group: ReviewPastorGroup;
  onPress: () => void;
};

function statLine(group: ReviewPastorGroup): string {
  const parts: string[] = [];
  const { counts } = group;
  if (counts.resubmitted_tasks > 0) {
    parts.push(`${counts.resubmitted_tasks} resubmitted`);
  }
  if (counts.new_roadmap_submissions > 0) {
    parts.push(`${counts.new_roadmap_submissions} roadmap`);
  }
  if (counts.new_assessments > 0) {
    parts.push(`${counts.new_assessments} assessment`);
  }
  if (counts.not_started > 0) {
    parts.push(`${counts.not_started} not started`);
  }
  if (parts.length === 0) return "No activity tracked";
  return parts.join(" · ");
}

export function ReviewPastorRow({ group, onPress }: Props) {
  const initial = group.pastorName.charAt(0).toUpperCase() || "P";
  const hasPhoto = Boolean(resolveProfilePictureUrl(group));

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${group.pastorName}, ${statLine(group)}`}
    >
      {hasPhoto ? (
        <UserAvatar user={group} size={44} containerStyle={styles.avatarImage} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {group.pastorName}
          </Text>
          {group.pendingActionCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{group.pendingActionCount}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.stats} numberOfLines={2}>
          {statLine(group)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.45)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  avatarImage: {
    borderWidth: 1,
    borderColor: "rgba(111,212,190,0.4)",
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(111,212,190,0.2)",
    borderWidth: 1,
    borderColor: "rgba(111,212,190,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#6FD4BE",
    fontSize: 17,
    fontWeight: "800",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  stats: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
});

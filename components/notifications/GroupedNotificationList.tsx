import { NotificationCard, NotificationMentorCard } from "@/components/atom/cards";
import { CommonCard } from "@/components/ui/design-system/CommonCard";
import { Notification } from "@/types";
import {
  groupNotificationsForDisplay,
  type NotificationDisplayItem,
} from "@/utils/notifications";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

type Props = {
  notifications: Notification[];
  role?: "mentor" | "pastor" | "director";
  emptyTitle?: string;
  emptySubtitle?: string;
  onPress: (notification: Notification) => void;
};

export function GroupedNotificationList({
  notifications,
  role = "pastor",
  emptyTitle = "No notifications",
  emptySubtitle = "When something changes, you'll see it here.",
  onPress,
}: Props) {
  const sections = useMemo(
    () => groupNotificationsForDisplay(notifications),
    [notifications],
  );

  if (sections.length === 0) {
    return (
      <CommonCard>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
      </CommonCard>
    );
  }

  const CardComponent = role === "mentor" ? NotificationMentorCard : NotificationCard;
  const mentorIconStyles: ViewStyle = {
    padding: 0,
    alignItems: "flex-start",
  };

  return (
    <>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionItems}>
            {section.items.map((item: NotificationDisplayItem, index: number) => (
              <Pressable
                key={item._id || `${section.title}-${item.title}-${index}`}
                onPress={() => onPress(item)}
                style={({ pressed }) => [
                  styles.pressable,
                  pressed && styles.pressablePressed,
                ]}
              >
                <CardComponent
                  data={item}
                  iconsStyles={role === "mentor" ? mentorIconStyles : undefined}
                />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionItems: {
    gap: 12,
  },
  pressable: {
    borderRadius: 14,
  },
  pressablePressed: {
    opacity: 0.92,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
});

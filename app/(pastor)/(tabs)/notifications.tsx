import { NotificationCard } from "@/components/atom/cards";
import TopBar from "@/components/director/TopBar";
import { useMarkNotificationAsRead, useNotifications } from "@/hooks/profile/useProfile";
import { useAuthStore } from "@/stores";
import { Notification } from "@/types";
import { formatNotificationDescription, getNotificationRoute } from "@/utils/notifications";
import { router, Stack } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { GradientBackground } from "@/components/ui/design-system/GradientBackground";
import { SectionHeader } from "@/components/ui/design-system/SectionHeader";
import { CommonCard } from "@/components/ui/design-system/CommonCard";

export default function NotificationScreen() {
  const { user } = useAuthStore();
  const { data, isLoading } = useNotifications(user?.id);
  const { mutateAsync: markNotificationAsRead } = useMarkNotificationAsRead();

  const notifications = (data || [])
    .slice()
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .map((item: Notification) => ({
      ...item,
      title: item.name,
      description: formatNotificationDescription(item.details),
      type: item.module,
      read: !!item.read,
      time: item.createdAt ?? "",
    }));

  const handleNotificationPress = async (notification: Notification) => {
    await markNotificationAsRead(notification);
    router.push(getNotificationRoute(notification.module) as any);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <GradientBackground>
        <TopBar role="pastor" showNotifications={false} />

        <View style={styles.screen}>
          <SectionHeader
            title="Notifications"
            subtitle="Updates, reminders, and activity across your journey."
            showBackButton
          />

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color="#FFFFFF" size="large" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {notifications.length === 0 ? (
                <CommonCard>
                  <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
                  <Text style={styles.emptySubtitle}>
                    New notifications will appear here as they arrive.
                  </Text>
                </CommonCard>
              ) : (
                notifications.map((item, i: number) => (
                  <Pressable
                    key={item._id || `${item.title}-${i}`}
                    onPress={() => void handleNotificationPress(item)}
                    style={({ pressed }) => [
                      styles.pressable,
                      pressed && styles.pressablePressed,
                    ]}
                  >
                    <NotificationCard data={item} />
                  </Pressable>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </GradientBackground>
    </>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1 },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
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

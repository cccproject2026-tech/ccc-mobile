import TopBar from "@/components/director/TopBar";
import { GroupedNotificationList } from "@/components/notifications/GroupedNotificationList";
import { useMarkNotificationAsRead, useNotifications } from "@/hooks/profile/useProfile";
import { useAuthStore } from "@/stores";
import { Notification } from "@/types";
import { resolveNotificationNavigation } from "@/utils/notifications";
import { router, Stack } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { GradientBackground } from "@/components/ui/design-system/GradientBackground";
import { SectionHeader } from "@/components/ui/design-system/SectionHeader";

export default function NotificationScreen() {
  const { user } = useAuthStore();
  const { data, isLoading } = useNotifications(user?.id);
  const { mutateAsync: markNotificationAsRead } = useMarkNotificationAsRead();

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    try { await markNotificationAsRead(notification); } catch (_) {}
    router.push(resolveNotificationNavigation(notification) as any);
  }, [markNotificationAsRead]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "Notifications" }} />
      <GradientBackground>
        <TopBar role="mentor" showNotifications={false} />

        <View style={styles.screen}>
          <SectionHeader
            title="Notifications"
            subtitle="Updates, reminders, and activity across your mentees."
            showBackButton
            alwaysShowBack
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
              <GroupedNotificationList
                role="mentor"
                notifications={data || []}
                emptyTitle="No new notifications"
                emptySubtitle="When something needs your attention, it will show up here."
                onPress={(notification) => void handleNotificationPress(notification)}
              />
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
  },
});

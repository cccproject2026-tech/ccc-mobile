import { NotificationCard } from "@/components/atom/cards";
import { Header } from "@/components/build-components";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { useMarkNotificationAsRead, useNotifications } from "@/hooks/profile/useProfile";
import { useAuthStore } from "@/stores";
import { Notification } from "@/types";
import { formatNotificationDescription, getNotificationRoute } from "@/utils/notifications";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    View
} from "react-native";

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

      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <TopBar role="pastor" showNotifications={false} />

        <View style={styles.scrollContainer}>
          <Header title="Notifications" hideSearchBar={true} />

          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color="#FFFFFF" size="large" />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{
                marginVertical: 10,
                paddingTop: 20,
                paddingHorizontal: 10,
                gap: 10,
              }}
            >
              {notifications.map((item, i: number) => (
                <React.Fragment key={item._id || `${item.title}-${i}`}>
                  <Pressable onPress={() => void handleNotificationPress(item)}>
                    <NotificationCard data={item} />
                  </Pressable>
                  {notifications.length - 1 !== i && (
                    <View style={styles.separator} />
                  )}
                </React.Fragment>
              ))}
            </ScrollView>
          )}
        </View>
      </LinearGradient>
    </>
  );
}


const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 8,
  },
});

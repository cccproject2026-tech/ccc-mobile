import { NotificationCard } from "@/components/atom/cards";
import { Header } from "@/components/build-components";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { useNotifications } from "@/hooks/profile/useProfile";
import { useAuthStore } from "@/stores";
import { Notification } from "@/types";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    View
} from "react-native";

export default function NotificationScreen() {
  const { user } = useAuthStore();
  const { data, isLoading } = useNotifications(user?.id);

  const notifications = data?.map((item: Notification) => ({
    title: item.name,
    description: item.details,
    type: item.module,
    read: false,
    time: "",
  })) || [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <TopBar showNotifications={false} />

        <View style={styles.scrollContainer}>
          <Header title="Notifications" hideSearchBar={true} />

          <ScrollView
            contentContainerStyle={{
              marginVertical: 10,
              paddingTop: 20,
              paddingHorizontal: 10,
              gap: 10,
            }}
          >
            {notifications.map((item, i: number) => (
              <React.Fragment key={i}>
                <NotificationCard data={item} />
                {notifications.length - 1 !== i && (
                  <View style={styles.separator} />
                )}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>
    </>
  );
}


const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 8,
  },
});

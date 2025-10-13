import React, { useEffect } from "react";
import { View } from "react-native";

import { DrawerOverlay } from "@/components/atom/DrawerOverlay";
import { useData } from "@/dataContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Stack } from "expo-router";

export default function MentorTabLayout() {
  const colorScheme = useColorScheme();
  const { setCurrentScreenState } = useData();

  useEffect(() => {
    setCurrentScreenState("Mentor");
  }, [setCurrentScreenState]);

  return (
    <View style={{ flex: 1 }}>
      <Stack />
      {/* <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mentees"
        options={{
          title: 'Mentees',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: 'Resources',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="folder.fill" color={color} />,
        }}
      />
    </Tabs> */}

      <DrawerOverlay />
    </View>
  );
}

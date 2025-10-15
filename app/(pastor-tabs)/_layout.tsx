import React, { useEffect } from 'react';
import { View } from 'react-native';

import { DrawerOverlay } from '@/components/atom/DrawerOverlay';
import { useData } from '@/dataContext';
import { Stack } from 'expo-router';

export default function PastorTabLayout() {
  const { setCurrentScreenState } = useData();

  useEffect(() => {
    setCurrentScreenState('Pastor');
  }, [setCurrentScreenState]);

  return (
    <View style={{ flex: 1 }}>
      <Stack />
      {/* <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: '#221C70',
            borderTopWidth: 0,
            height: 80,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle.fill" color={color} />,
          }}
        />
      </Tabs> */}
      <DrawerOverlay />
    </View>
  );
}


import CustomDrawerContent from '@/components/director/CustomDrawer';
import { MENU_ITEMS } from '@/constants/mockData';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Platform } from 'react-native';


export default function DirectorTabLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent menuItems={MENU_ITEMS} {...props} />}
      screenOptions={{
        drawerType: 'front',
        drawerStyle: {
          width: Platform.OS === 'android' ? 290 : 320,
        },
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          drawerItemStyle: { display: 'none' },
        }}
      />

    </Drawer>
  );
}

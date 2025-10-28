import CustomDrawerContent from '@/components/director/CustomDrawer';
import { PastorMenuItems } from '@/constants/mockData';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Platform } from 'react-native';

export default function PastorDrawerLayout() {
  return (
    <>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent expandAllByDefault={true} userRole="pastor" menuItems={PastorMenuItems} {...props} />}
        screenOptions={{
          drawerType: 'front',
          drawerStyle: {
            width: Platform.OS === 'android' ? 290 : 320,
          },
          headerShown: false,
          // Prevent remounting on navigation
          // unmountOnBlur: false,
          freezeOnBlur: true,
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
    </>
  );
}
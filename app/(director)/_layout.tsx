import CustomDrawerContent from '@/components/director/CustomDrawer';
import { MENU_ITEMS } from '@/constants/mockData';
import { PhaseCreationProvider } from '@/context/PhaseCreationContext';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Platform } from 'react-native';


export default function DirectorDrawerLayout() {
    return (
        <PhaseCreationProvider>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent userRole="director" menuItems={MENU_ITEMS} {...props} />}
                screenOptions={{
                    drawerType: 'front',
                    drawerStyle: {
                        width: Platform.OS === 'android' ? 290 : 320,
                    },
                    headerShown: false,
                    sceneContainerStyle: { backgroundColor: "transparent" },
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
        </PhaseCreationProvider>
    );
}

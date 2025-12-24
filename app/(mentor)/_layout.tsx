import CustomDrawerContent from '@/components/director/CustomDrawer';
import { MentorMenuItems } from '@/constants/mockData';
import { useData } from "@/dataContext";
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function MentorDrawerLayout() {
    const { setCurrentScreenState } = useData();

    useEffect(() => {
        setCurrentScreenState("Mentor");
    }, [setCurrentScreenState]);

    return (
        <Drawer
            drawerContent={(props) => (
                <CustomDrawerContent
                    expandAllByDefault={true}
                    userRole="mentor"
                    menuItems={MentorMenuItems}
                    {...props}
                />
            )}
            screenOptions={{
                drawerType: 'front',
                drawerStyle: {
                    width: Platform.OS === 'android' ? 290 : 320,
                },
                headerShown: false,
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
    );
}

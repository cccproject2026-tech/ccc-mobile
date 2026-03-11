import CustomDrawerContent from '@/components/director/CustomDrawer';
import { MentorMenuItems } from '@/constants/mockData';
import { useData } from "@/dataContext";
import { useAuthStore } from '@/stores/auth.store';
import { Drawer } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function MentorDrawerLayout() {
    const { setCurrentScreenState } = useData();
    const { isAuthenticated, user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        setCurrentScreenState("Mentor");
    }, [setCurrentScreenState]);

    // Redirect to role selection when not authenticated (e.g. after logout)
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'mentor') {
            router.replace('/');
        }
    }, [isAuthenticated, user?.role, router]);

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

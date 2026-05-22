import CustomDrawerContent from '@/components/director/CustomDrawer';
import { MentorMenuItems } from '@/constants/mockData';
import { useData } from "@/dataContext";
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Drawer } from 'expo-router/drawer';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function MentorDrawerLayout() {
    const { setCurrentScreenState } = useData();
    const { isAuthenticated, user } = useAuthStore();
    const { hasProfilePicture } = useOnboardingStore();
    const router = useRouter();

    useEffect(() => {
        setCurrentScreenState("Mentor");
    }, [setCurrentScreenState]);

    // Redirect to role selection when not authenticated (e.g. after logout)
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'mentor') {
            router.replace('/');
            return;
        }

        // Check if mentor has profile picture and redirect to setup if incomplete.
        if (!hasProfilePicture) {
            setTimeout(() => {
                router.replace('/(mentor)/profile-setup');
            }, 100);
        }
    }, [isAuthenticated, user?.role, router, hasProfilePicture]);

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
            <Drawer.Screen
                name="profile-setup"
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />

            <Drawer.Screen
                name="schedule-meeting/person"
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="schedule-meeting/time"
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
            <Drawer.Screen
                name="schedule-meeting/confirm"
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
        </Drawer>
    );
}

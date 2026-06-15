import CustomDrawerContent from '@/components/director/CustomDrawer';
import { PastorMenuItems } from '@/constants/mockData';
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { navigateToWelcomeCenter } from '@/utils/auth-navigation';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function PastorDrawerLayout() {
    const { hasProfilePicture } = useOnboardingStore();
    const { user, isAuthenticated, hasHydrated, isInitialized } = useAuthStore();

    const router = useRouter();

    useEffect(() => {
        if (!hasHydrated || !isInitialized) return;

        if (!isAuthenticated || !user) {
            console.log('⚠️ Not authenticated, redirecting to welcome');
            navigateToWelcomeCenter();
            return;
        }

        if (!hasProfilePicture) {
            console.log('📷 Profile incomplete, redirecting to profile upload');

            const timeoutId = setTimeout(() => {
                const { isAuthenticated: authed, user: currentUser } =
                    useAuthStore.getState();
                if (authed && currentUser) {
                    router.replace('/(pastor)/profile-setup');
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [hasHydrated, isInitialized, isAuthenticated, user, hasProfilePicture, router]);

    return (
        <Drawer
            drawerContent={(props) => (
                <CustomDrawerContent
                    expandAllByDefault={true}
                    userRole="pastor"
                    menuItems={PastorMenuItems}
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
                name="profile-upload"
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

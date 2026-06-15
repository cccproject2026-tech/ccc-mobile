import CustomDrawerContent from '@/components/director/CustomDrawer';
import { MentorMenuItems } from '@/constants/mockData';
import { useData } from "@/dataContext";
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from "@/stores/onboarding.store";
import { Drawer } from 'expo-router/drawer';
import { navigateToWelcomeCenter } from '@/utils/auth-navigation';
import { getAuthenticatedHomeRoute, isMentorRole } from '@/utils/userRole';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function MentorDrawerLayout() {
    const { setCurrentScreenState } = useData();
    const { isAuthenticated, user, hasHydrated, isInitialized } = useAuthStore();
    const { hasProfilePicture } = useOnboardingStore();
    const router = useRouter();

    useEffect(() => {
        setCurrentScreenState("Mentor");
    }, [setCurrentScreenState]);

    // Redirect to welcome when not authenticated (e.g. after logout)
    useEffect(() => {
        if (!hasHydrated || !isInitialized) return;

        if (!isAuthenticated) {
            navigateToWelcomeCenter();
            return;
        }

        if (!isMentorRole(user?.role)) {
            const homeRoute = getAuthenticatedHomeRoute(user?.role);
            if (homeRoute) {
                router.replace(homeRoute as any);
            }
            return;
        }

        if (!hasProfilePicture && user?.profilePicture) {
            useOnboardingStore.getState().setHasProfilePicture(true);
            return;
        }

        if (!hasProfilePicture) {
            const timeoutId = setTimeout(() => {
                const { isAuthenticated: authed, user: currentUser } =
                    useAuthStore.getState();
                if (authed && isMentorRole(currentUser?.role) && !currentUser?.profilePicture) {
                    router.replace('/(mentor)/profile-setup');
                }
            }, 100);
            return () => clearTimeout(timeoutId);
        }
    }, [
        hasHydrated,
        isInitialized,
        isAuthenticated,
        user?.role,
        user?.profilePicture,
        router,
        hasProfilePicture,
    ]);

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
            <Drawer.Screen
                name="review-center"
                options={{
                    headerShown: false,
                    drawerItemStyle: { display: 'none' },
                }}
            />
        </Drawer>
    );
}

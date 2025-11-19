import CustomDrawerContent from '@/components/director/CustomDrawer';
import { PastorMenuItems } from '@/constants/mockData';
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function PastorDrawerLayout() {
    const { hasProfilePicture } = useOnboardingStore();
    const { user, isAuthenticated } = useAuthStore();

    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated || !user) {
            console.log('⚠️ Not authenticated, redirecting to home');
            router.replace('/');
            return;
        }

        // Check if user has profile picture
        if (!hasProfilePicture) {
            console.log('📷 Profile incomplete, redirecting to profile upload');

            // Small delay to ensure layout is mounted
            setTimeout(() => {
                router.replace('/(pastor)/profile-setup');
            }, 100);
        }
    }, [isAuthenticated, user, hasProfilePicture]);

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
        </Drawer>
    );
}

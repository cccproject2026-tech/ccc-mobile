import CustomDrawerContent from '@/components/director/CustomDrawer';
import { PastorMenuItems } from '@/constants/mockData';
import { useAuthStore, useOnboardingStore } from '@/stores';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

export default function PastorDrawerLayout() {
    const { isProfileComplete } = useOnboardingStore();
    const { user, isAuthenticated } = useAuthStore();

    const router = useRouter()
    useEffect(() => {
        if (!isAuthenticated || !user) {
            console.log('⚠️ Not authenticated, redirecting to home');
            router.replace('/');
            return;
        }

        // Check if we're already on profile-setup page
        if (!isProfileComplete) {
            console.log('📋 Profile incomplete, redirecting to profile setup');

            // Small delay to ensure layout is mounted
            setTimeout(() => {
                router.replace('/(pastor)/profile-setup');
            }, 100);
        }
    }, [isAuthenticated, user, isProfileComplete]);


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
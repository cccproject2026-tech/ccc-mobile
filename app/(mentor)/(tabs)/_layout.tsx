import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { icons } from '@/constants/images';
import { AssessmentProvider } from '@/context/AssessmentsContext';
import { RoadmapProgressProvider } from '@/context/RoadmapProgressContext';

export default function MentorTabLayout() {
    const pathname = usePathname();
    const [tabBarVisible, setTabBarVisible] = useState(true);
    const { bottom } = useSafeAreaInsets();

    const detectNavigationType = () => {
        if (Platform.OS !== 'android') {
            return 'default';
        }

        const screenHeight = Dimensions.get('screen').height;
        const windowHeight = Dimensions.get('window').height;
        const navBarHeight = screenHeight - windowHeight - (StatusBar.currentHeight || 0);

        if (bottom > 0 && navBarHeight < 50) {
            return 'gesture';
        }

        return 'button';
    };

    const getTabBarConfig = () => {
        if (Platform.OS === 'ios') {
            return {
                height: 60 + bottom,
                paddingBottom: bottom,
            } as const;
        }

        const navType = detectNavigationType();
        if (navType === 'gesture') {
            return {
                height: 70 + bottom,
                paddingBottom: bottom,
            } as const;
        } else {
            return {
                height: 70,
                paddingBottom: 15,
            } as const;
        }
    };

    const tabBarConfig = getTabBarConfig();

    useEffect(() => {
        const hideTabBarPatterns = [
            /\/report$/,
        ];

        const shouldHide = hideTabBarPatterns.some(pattern => pattern.test(pathname));
        setTabBarVisible(!shouldHide);
    }, [pathname]);

    return (
        <RoadmapProgressProvider>
            <AssessmentProvider>
                <Tabs
                    backBehavior='history'
                    screenOptions={{
                        tabBarActiveTintColor: '#fff',
                        headerShown: false,
                        tabBarButton: HapticTab,
                        tabBarStyle: {
                            backgroundColor: '#221C70',
                            borderTopWidth: 0,
                            elevation: 0,
                            display: tabBarVisible ? undefined : 'none',
                            height: tabBarConfig.height,
                            paddingBottom: tabBarConfig.paddingBottom,
                            paddingTop: 8,
                        },
                        tabBarLabelStyle: {
                            fontSize: 12,
                            fontWeight: '600',
                            marginTop: 4,
                            marginBottom: 4,
                        },
                    }}
                >
                    {/* VISIBLE TABS */}
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Dashboard',
                            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="discover"
                        options={{
                            
                            title: 'Discover',
                            tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass.circle.fill" color={color} />,
                        }}
                    /> 
                    <Tabs.Screen
                        name="profile/index"
                        options={{
                            title: 'Profile',
                            tabBarIcon: ({ color }) => <Image source={icons.profileTabIcon} style={{ width: 28, height: 28, tintColor: color }} />,
                        }}
                    />

                    {/* HIDDEN ROUTES - Profile sub-routes */}
                    <Tabs.Screen name="profile/my-profile" options={{ href: null }} />
                    <Tabs.Screen name="profile/certificate" options={{ href: null }} />
                    <Tabs.Screen name="profile/grant" options={{ href: null }} />
                    <Tabs.Screen name="profile/my-assignment/assignment" options={{ href: null }} />
                    <Tabs.Screen name="profile/my-assignment/detailed-assignment" options={{ href: null }} />
                    <Tabs.Screen name="profile/documents" options={{ href: null }} />
                    <Tabs.Screen name="profile/notes" options={{ href: null }} />
                    <Tabs.Screen name="profile/new-note" options={{ href: null }} />
                    <Tabs.Screen name="profile/note-detail" options={{ href: null }} />

                    {/* HIDDEN ROUTES - Parallel route group segments (auto-generated from folder name) */}
                    <Tabs.Screen name="(index)" options={{ href: null }} />
                    <Tabs.Screen name="(roadmap)" options={{ href: null }} />
                    <Tabs.Screen name="(assessments)" options={{ href: null }} />
                    <Tabs.Screen name="(appointments)" options={{ href: null }} />
                    <Tabs.Screen name="(progress)" options={{ href: null }} />
                    <Tabs.Screen name="(mentees)" options={{ href: null }} />

                    {/* HIDDEN ROUTES - Other screens at tabs root */}
                    <Tabs.Screen name="notifications" options={{ href: null }} />
                    <Tabs.Screen name="my-mentors" options={{ href: null }} />
                    <Tabs.Screen name="mentees" options={{ href: null }} />
                    {/* sessions/ uses index.tsx → screen name is sessions/index, not sessions */}
                    <Tabs.Screen name="sessions/index" options={{ href: null }} />
                    <Tabs.Screen name="sessions/[id]" options={{ href: null }} />
                    <Tabs.Screen name="resources" options={{ href: null }} />
                    <Tabs.Screen name="support/contact-information" options={{ href: null }} />
                    <Tabs.Screen name="new-roadmap" options={{ href: null }} />
                </Tabs>
            </AssessmentProvider>
        </RoadmapProgressProvider>
    );
}

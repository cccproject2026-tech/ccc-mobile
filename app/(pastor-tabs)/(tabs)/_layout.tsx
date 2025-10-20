import { Tabs, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { AssessmentProvider } from '@/context/AssessmentsContext';
import { RoadmapProgressProvider } from '@/context/RoadmapProgressContext';
import { StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PastorTabLayout() {
    const pathname = usePathname();
    const [tabBarVisible, setTabBarVisible] = useState(true);
    const { bottom, top } = useSafeAreaInsets();

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
            };
        }

        const navType = detectNavigationType();
        console.log('Navigation type:', navType);

        if (navType === 'gesture') {
            return {
                height: 60 + bottom,
                paddingBottom: bottom,
            };
        } else {
            // Button navigation
            return {
                height: 75,
                paddingBottom: 15,
            };
        }
    };

    const tabBarConfig = getTabBarConfig();

    // Hide tab bar for specific routes
    // useEffect(() => {

    //     // Define patterns that should hide the tab bar
    //     const hideTabBarPatterns = [
    //         // Specific route patterns
    //         /\/assign-mentor$/,
    //         /\/assign-mentee$/,
    //         /\/remove-mentor$/,
    //         /\/remove-mentee$/,
    //         /\/select-roadmap$/,

    //         // Detail pages with dynamic IDs
    //         /\/revitalization-roadmaps\/[^\/]+$/,

    //         // Sub-routes of new-interests (but not the main page)
    //         /^\/new-interests\/.+/,

    //         // Any modal or overlay routes
    //         /\/modal\//,
    //         /\/overlay\//,
    //     ];

    //     const shouldHide = hideTabBarPatterns.some(pattern => {
    //         const matches = pattern.test(pathname);
    //         if (matches) {
    //             console.log(`Pattern ${pattern} matched pathname ${pathname}`);
    //         }
    //         return matches;
    //     });

    //     setTabBarVisible(!shouldHide);
    // }, [pathname]);


    return (
        <RoadmapProgressProvider>
            <AssessmentProvider>

                <Tabs
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
                    }}>
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
                            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: 'Profile',
                            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="appointments"
                        options={{
                            title: '',
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="assessments"
                        options={{
                            title: '',
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="progress"
                        options={{
                            title: '',
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="roadmap"
                        options={{
                            title: '',
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="my-mentors"
                        options={{
                            title: '',
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="notifications"
                        options={{
                            title: '',
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="schedule-meeting"
                        options={{
                            title: '',
                            href: null,
                        }}
                    />
                </Tabs>
            </AssessmentProvider>
        </RoadmapProgressProvider>
    );
}

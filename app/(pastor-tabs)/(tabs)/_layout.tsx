import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { icons } from '@/constants/images';
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
                height: 70 + bottom,
                paddingBottom: bottom,
            };
        } else {
            return {
                height: 70,
                paddingBottom: 15,
            };
        }
    };

    const tabBarConfig = getTabBarConfig();

    useEffect(() => {
        const hideTabBarPatterns = [
            /\/report$/,
        ];

        const shouldHide = hideTabBarPatterns.some(pattern => {
            const matches = pattern.test(pathname);
            if (matches) {
                console.log(`Pattern ${pattern} matched pathname ${pathname}`);
            }
            return matches;
        });

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
                    }}>

                    {/* VISIBLE TABS */}
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Dashboard',
                            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="profile/index"
                        options={{
                            title: 'Profile',
                            tabBarIcon: ({ color }) => <Image source={icons.profileTabIcon} style={{ width: 28, height: 28, tintColor: color }} />,
                        }}
                    />

                    {/* HIDDEN ROUTES - Hide the parent group AND the individual routes it creates */}
                    {/* <Tabs.Screen
                        name="(index,assessments,roadmap)"
                        options={{
                            href: null,
                        }}
                    /> */}
                    <Tabs.Screen
                        name="profile/documents"
                        options={{
                            href: null,
                        }}
                    />


                    <Tabs.Screen
                        name="profile/certificates"
                        options={{
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="profile/grant"
                        options={{
                            href: null,
                        }}
                    />


                    {/* Hide the auto-generated routes from the folder name */}
                    <Tabs.Screen
                        name="(index)"
                        options={{
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="(assessments)"
                        options={{
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="(roadmap)"
                        options={{
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="appointments"
                        options={{
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="mentors"
                        options={{
                            href: null,
                        }}
                    />
                    {/* <Tabs.Screen
                        name="progress"
                        options={{
                            href: null,
                        }}
                    /> */}
                    <Tabs.Screen
                        name="my-mentors"
                        options={{
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="notifications"
                        options={{
                            href: null,
                        }}
                    />
                    <Tabs.Screen
                        name="schedule-meeting"
                        options={{
                            href: null,
                        }}
                    />
                </Tabs>
            </AssessmentProvider>
        </RoadmapProgressProvider>
    );
}
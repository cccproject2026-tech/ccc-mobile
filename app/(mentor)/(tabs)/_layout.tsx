import { Tabs, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { icons } from '@/constants/images';
import { AssessmentProvider } from '@/context/AssessmentsContext';
import { RoadmapProgressProvider } from '@/context/RoadmapProgressContext';

function TabIcon({
    source,
    focused,
    activeColor = '#fff',
    inactiveColor = 'rgba(255,255,255,0.38)',
}: {
    source: any;
    focused: boolean;
    activeColor?: string;
    inactiveColor?: string;
}) {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scale, {
                toValue: focused ? 1.12 : 1,
                useNativeDriver: true,
                tension: 220,
                friction: 10,
            }),
            Animated.timing(opacity, {
                toValue: focused ? 1 : 0,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [focused, opacity, scale]);

    const tintColor = focused ? activeColor : inactiveColor;

    return (
        <View style={tabIconStyles.wrapper}>
            <Animated.View style={[tabIconStyles.pill, { opacity }]} />
            <Animated.View style={{ transform: [{ scale }] }}>
                <Image
                    source={source}
                    style={[tabIconStyles.icon, { tintColor }]}
                />
            </Animated.View>
        </View>
    );
}

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
        if (Platform.OS === 'ios') return { height: 64 + bottom, paddingBottom: bottom };
        return detectNavigationType() === 'gesture'
            ? { height: 72 + bottom, paddingBottom: bottom }
            : { height: 72, paddingBottom: 14 };
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
                    initialRouteName="index"
                    screenOptions={{
                        tabBarActiveTintColor: '#fff',
                        tabBarInactiveTintColor: 'rgba(255,255,255,0.38)',
                        headerShown: false,
                        tabBarButton: HapticTab,
                        sceneContainerStyle: { backgroundColor: "transparent" },
                        tabBarStyle: {
                            backgroundColor: '#0D3351',
                            borderTopWidth: 1,
                            borderTopColor: 'rgba(255,255,255,0.07)',
                            elevation: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -6 },
                            shadowOpacity: 0.30,
                            shadowRadius: 16,
                            display: tabBarVisible ? undefined : 'none',
                            height: tabBarConfig.height,
                            paddingBottom: tabBarConfig.paddingBottom,
                            paddingTop: 10,
                            paddingHorizontal: 20,
                        },
                        tabBarItemStyle: {
                            paddingVertical: 0,
                        },
                        tabBarLabelStyle: {
                            fontSize: 10,
                            fontWeight: '600',
                            marginTop: 3,
                            letterSpacing: 0.4,
                        },
                    }}
                >
                    {}
                    <Tabs.Screen
                        name="mentee-progress"
                        options={{
                            title: 'Mentee Progress',
                            tabBarIcon: ({ focused }) => (
                                <TabIcon source={icons.progress2} focused={focused} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Home',
                            tabBarIcon: ({ focused }) => (
                                <TabIcon source={icons.homeTabIcon} focused={focused} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="profile/index"
                        options={{
                            title: 'Profile',
                            tabBarIcon: ({ focused }) => (
                                <TabIcon source={icons.profileTabIcon} focused={focused} />
                            ),
                        }}
                    />

                    {}
                    <Tabs.Screen name="profile/my-profile" options={{ href: null }} />
                    <Tabs.Screen name="profile/certificate" options={{ href: null }} />
                    <Tabs.Screen name="profile/grant" options={{ href: null }} />
                    <Tabs.Screen name="profile/my-assignment/assignment" options={{ href: null }} />
                    <Tabs.Screen name="profile/my-assignment/detailed-assignment" options={{ href: null }} />
                    <Tabs.Screen name="profile/documents" options={{ href: null }} />
                    <Tabs.Screen name="profile/notes" options={{ href: null }} />
                    <Tabs.Screen name="profile/new-note" options={{ href: null }} />
                    <Tabs.Screen name="profile/note-detail" options={{ href: null }} />

                    {}
                    <Tabs.Screen name="(index)" options={{ href: null }} />
                    <Tabs.Screen name="(roadmap)" options={{ href: null }} />
                    <Tabs.Screen name="(assessments)" options={{ href: null }} />
                    <Tabs.Screen name="(appointments)" options={{ href: null }} />
                    <Tabs.Screen name="(progress)" options={{ href: null }} />
                    <Tabs.Screen name="(mentees)" options={{ href: null }} />

                    {}
                    <Tabs.Screen name="notifications" options={{ href: null }} />
                    <Tabs.Screen name="my-mentors" options={{ href: null }} />
                    <Tabs.Screen name="mentees" options={{ href: null }} />
                    <Tabs.Screen name="discover" options={{ href: null }} />
                    {}
                    <Tabs.Screen name="sessions/index" options={{ href: null }} />
                    <Tabs.Screen name="sessions/[id]" options={{ href: null }} />
                    <Tabs.Screen name="sessions/insights" options={{ href: null }} />
                    <Tabs.Screen name="resources" options={{ href: null }} />
                    <Tabs.Screen name="support/contact-information" options={{ href: null }} />
                    <Tabs.Screen name="new-roadmap" options={{ href: null }} />
                    <Tabs.Screen name="search" options={{ href: null }} />
                    <Tabs.Screen name="voice-notes/index" options={{ href: null }} />
                    <Tabs.Screen name="voice-notes/detail" options={{ href: null }} />
                    <Tabs.Screen name="review-center" options={{ href: null }} />
                    <Tabs.Screen name="review-center/pastor" options={{ href: null }} />
                    <Tabs.Screen name="review-center/list" options={{ href: null }} />
                </Tabs>
            </AssessmentProvider>
        </RoadmapProgressProvider>
    );
}

const tabIconStyles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 52,
        height: 36,
    },
    pill: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    icon: {
        width: 22,
        height: 22,
    },
});

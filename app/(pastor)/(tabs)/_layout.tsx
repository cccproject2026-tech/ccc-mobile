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

import { HapticTab } from '@/components/HapticTab';
import { icons } from '@/constants/images';
import { AssessmentProvider } from '@/context/AssessmentsContext';
import { RoadmapProgressProvider } from '@/context/RoadmapProgressContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Animated tab icon ────────────────────────────────────────────────────────
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
    const scale    = useRef(new Animated.Value(1)).current;
    const opacity  = useRef(new Animated.Value(focused ? 1 : 0)).current;

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
    }, [focused]);

    const tintColor = focused ? activeColor : inactiveColor;

    return (
        <View style={tabIconStyles.wrapper}>
            {/* Active pill indicator */}
            <Animated.View style={[tabIconStyles.pill, { opacity }]} />

            {/* Icon */}
            <Animated.View style={{ transform: [{ scale }] }}>
                <Image
                    source={source}
                    style={[tabIconStyles.icon, { tintColor }]}
                />
            </Animated.View>
        </View>
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

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function PastorTabLayout() {
    const pathname       = usePathname();
    const [tabBarVisible, setTabBarVisible] = useState(true);
    const { bottom }     = useSafeAreaInsets();

    const detectNavigationType = () => {
        if (Platform.OS !== 'android') return 'default';
        const screenHeight  = Dimensions.get('screen').height;
        const windowHeight  = Dimensions.get('window').height;
        const navBarHeight  = screenHeight - windowHeight - (StatusBar.currentHeight || 0);
        return (bottom > 0 && navBarHeight < 50) ? 'gesture' : 'button';
    };

    const getTabBarConfig = () => {
        if (Platform.OS === 'ios') return { height: 64 + bottom, paddingBottom: bottom };
        return detectNavigationType() === 'gesture'
            ? { height: 72 + bottom, paddingBottom: bottom }
            : { height: 72,          paddingBottom: 14     };
    };

    const tabBarConfig = getTabBarConfig();

    useEffect(() => {
        setTabBarVisible(![/\/report$/].some((p) => p.test(pathname)));
    }, [pathname]);

    const HIDDEN_ROUTES = [
        'profile/documents', 'profile/notes',   'profile/new-note',
        'profile/note-detail','profile/certificates','profile/grant',
        'profile/upload',    '(index)',          '(assessments)',
        '(roadmap)',         '(appointments)',   'mentors',
        '(progress)',        'my-mentors',       'schedule-meeting',
        'support/contact-information', 'support/call-mentor',
    ];

    return (
        <RoadmapProgressProvider>
            <AssessmentProvider>
                <Tabs
                    backBehavior="history"
                    initialRouteName="index"
                    screenOptions={{
                        headerShown: false,
                        tabBarButton: HapticTab,
                        tabBarActiveTintColor:   '#fff',
                        tabBarInactiveTintColor: 'rgba(255,255,255,0.38)',
                        tabBarStyle: {
                            // Solid deep navy — clean & premium
                            backgroundColor: '#0D3351',
                            borderTopWidth: 1,
                            borderTopColor: 'rgba(255,255,255,0.07)',
                            elevation: 24,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -6 },
                            shadowOpacity: 0.30,
                            shadowRadius: 16,
                            display: tabBarVisible ? undefined : 'none',
                            height:            tabBarConfig.height,
                            paddingBottom:     tabBarConfig.paddingBottom,
                            paddingTop:        10,
                            paddingHorizontal: 20,
                        },
                        tabBarItemStyle: {
                            paddingVertical: 0,
                        },
                        tabBarLabelStyle: {
                            fontSize:      10,
                            fontWeight:    '600',
                            marginTop:      3,
                            letterSpacing:  0.4,
                        },
                    }}
                >
                    {/* ── Notifications ── */}
                    <Tabs.Screen
                        name="notifications"
                        options={{
                            title: 'Alerts',
                            tabBarIcon: ({ focused }) => (
                                <TabIcon source={icons.notification} focused={focused} />
                            ),
                        }}
                    />

                    {/* ── Dashboard ── */}
                    <Tabs.Screen
                        name="index"
                        options={{
                            title: 'Home',
                            tabBarIcon: ({ focused }) => (
                                <TabIcon source={icons.homeTabIcon} focused={focused} />
                            ),
                        }}
                    />

                    {/* ── Profile ── */}
                    <Tabs.Screen
                        name="profile/index"
                        options={{
                            title: 'Profile',
                            tabBarIcon: ({ focused }) => (
                                <TabIcon source={icons.profileTabIcon} focused={focused} />
                            ),
                        }}
                    />

                    {/* ── Hidden routes ── */}
                    {HIDDEN_ROUTES.map((name) => (
                        <Tabs.Screen key={name} name={name} options={{ href: null }} />
                    ))}

                    <Tabs.Screen name="sessions" options={{ href: null }} />
                    <Tabs.Screen name="sessions/[id]" options={{ href: null }} />
                </Tabs>
            </AssessmentProvider>
        </RoadmapProgressProvider>
    );
}
import { formatClock, formatDate } from '@/utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import TopBar from './TopBar';

type Props = {
    /** Ignored when showBackgroundImage is false (header sizes to TopBar only). */
    height: number;
    image: ImageSourcePropType;
    bottomBlendColor: string;
    blendHeight?: number;
    scrollOffset: SharedValue<number>;
    role: 'director' | 'pastor' | 'mentor';
    /** When false, no photo hero — only TopBar on the screen gradient. Default true. */
    showBackgroundImage?: boolean;
    /** When false, hides the large clock and date block (e.g. compact pastor home). Default true. */
    showClockDate?: boolean;
    // Optional props for backward compatibility - if provided, use them instead of internal state
    clock?: string;
    date?: string;
    // Callback for when greeting period changes (only used when clock/date are not provided)
    onGreetingPeriodChange?: (period: 'morning' | 'afternoon' | 'evening') => void;
    /** Rendered over the lower part of the hero image (e.g. greeting + welcome card). */
    children?: ReactNode;
};

const HeaderHero: React.FC<Props> = ({
    height,
    image,
    scrollOffset,
    role,
    showBackgroundImage = true,
    showClockDate = true,
    clock: externalClock,
    date: externalDate,
    onGreetingPeriodChange,
    children,
}) => {
    const [now, setNow] = useState(new Date());
    const previousPeriodRef = useRef<'morning' | 'afternoon' | 'evening' | null>(null);

    // If external clock/date provided, use them (backward compatibility)
    // Otherwise, manage state internally
    const useInternalState = externalClock === undefined && externalDate === undefined;

    // Get current greeting period
    const getGreetingPeriod = useCallback((date: Date): 'morning' | 'afternoon' | 'evening' => {
        const h = date.getHours();
        if (h < 12) return 'morning';
        if (h < 18) return 'afternoon';
        return 'evening';
    }, []);

    useEffect(() => {
        if (!useInternalState) return;

        const updateTime = () => {
            const currentTime = new Date();
            setNow(currentTime);
            
            // Check if greeting period changed
            const currentPeriod = getGreetingPeriod(currentTime);
            if (onGreetingPeriodChange && previousPeriodRef.current !== currentPeriod) {
                previousPeriodRef.current = currentPeriod;
                onGreetingPeriodChange(currentPeriod);
            }
        };

        // Update immediately
        updateTime();
        
        // Set interval to update every second
        const id = setInterval(updateTime, 1000);
        return () => clearInterval(id);
    }, [useInternalState, onGreetingPeriodChange]);

    const clock = useInternalState ? formatClock(now) : externalClock!;
    const date = useInternalState ? formatDate(now) : externalDate!;
    const animStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    scrollOffset.value,
                    [-height, 0, height],
                    [-height / 2, 0, height * 0.5]
                ),
            },
            {
                scale: interpolate(scrollOffset.value, [-height, 0, height], [2, 1, 1]),
            },
        ],
    }));

    if (!showBackgroundImage) {
        return (
            <View style={{ width: '100%' }}>
                <TopBar
                    notifications={3}
                    showUserName={false}
                    role={role}
                />
                {children ? (
                    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
                        {children}
                    </View>
                ) : null}
            </View>
        );
    }

    return (
        <View style={{ width: '100%', height, overflow: 'hidden', position: 'relative' }}>
            <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
                <ImageBackground source={image} resizeMode="cover" style={StyleSheet.absoluteFill} />
            </Animated.View>

            {children ? (
                <LinearGradient
                    colors={['transparent', 'rgba(12, 40, 65, 0.2)', 'rgba(12, 40, 65, 0.82)']}
                    locations={[0, 0.45, 1]}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: '72%',
                    }}
                    pointerEvents="none"
                />
            ) : null}

            <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                <TopBar
                    notifications={3}
                    showUserName={false}
                    role={role}
                // ...other TopBar props
                />
            </View>

            {showClockDate ? (
                <View style={{ position: 'absolute', left: 0, right: 0, top: '38%', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 32 }}>{clock}</Text>
                    <Text style={{ color: '#fff', opacity: 0.95, marginTop: 6 }}>{date}</Text>
                </View>
            ) : null}

            {children ? (
                <View
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        paddingHorizontal: 16,
                        paddingBottom: 10,
                        gap: 4,
                    }}
                >
                    {children}
                </View>
            ) : null}
        </View>
    );
};

export default HeaderHero;

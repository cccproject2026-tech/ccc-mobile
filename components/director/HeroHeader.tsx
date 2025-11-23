import { formatClock, formatDate } from '@/utils/date';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import TopBar from './TopBar';

type Props = {
    height: number;
    image: ImageSourcePropType;
    bottomBlendColor: string;
    blendHeight?: number;
    scrollOffset: SharedValue<number>;
    role: 'director' | 'pastor' | 'mentor';
    // Optional props for backward compatibility - if provided, use them instead of internal state
    clock?: string;
    date?: string;
    // Callback for when greeting period changes (only used when clock/date are not provided)
    onGreetingPeriodChange?: (period: 'morning' | 'afternoon' | 'evening') => void;
};

const HeaderHero: React.FC<Props> = ({
    height,
    image,
    scrollOffset,
    role,
    clock: externalClock,
    date: externalDate,
    onGreetingPeriodChange
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

    return (
        <View style={{ width: '100%', height, overflow: 'hidden', position: 'relative' }}>
            <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
                <ImageBackground source={image} resizeMode="cover" style={StyleSheet.absoluteFill} />
            </Animated.View>

            <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
                <TopBar
                    notifications={3}
                    showUserName={false}
                    role={role}
                // ...other TopBar props
                />
            </View>
            {/* <LinearGradient
                colors={['rgba(135,206,235,0.4)', 'transparent']}
                style={[StyleSheet.absoluteFill, { height: 120 }]}
                pointerEvents="none"
            />

            <LinearGradient
                colors={['transparent', bottomBlendColor]}
                style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: blendHeight }}
                pointerEvents="none"
            /> */}

            <View style={{ position: 'absolute', left: 0, right: 0, top: '38%', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 32 }}>{clock}</Text>
                <Text style={{ color: '#fff', opacity: 0.95, marginTop: 6 }}>{date}</Text>
            </View>
        </View>
    );
};

export default HeaderHero;

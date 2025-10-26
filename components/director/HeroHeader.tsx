import React from 'react';
import { ImageBackground, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Animated, { SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import TopBar from './TopBar';

type Props = {
    height: number;
    image: ImageSourcePropType;
    bottomBlendColor: string;
    blendHeight?: number;
    clock: string;
    date: string;
    scrollOffset: SharedValue<number>;
    role: 'director' | 'pastor' | 'mentor';
};

const HeaderHero: React.FC<Props> = ({
    height,
    image,
    clock,
    date,
    scrollOffset,
    role
}) => {
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

import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_WIDTH = SCREEN_WIDTH * 0.9;
const BUTTON_HEIGHT = 60;
const SLIDER_SIZE = 52;
const SLIDER_PADDING = 4;

export default function SliderButton({ onComplete }: { onComplete: () => void }) {
    const [completed, setCompleted] = useState(false);
    const pan = useRef(new Animated.Value(0)).current;

    const currentValue = useRef(0);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !completed,
            onMoveShouldSetPanResponder: () => !completed,
            onPanResponderGrant: () => {
                currentValue.current = 0;
            },
            onPanResponderMove: (_, gesture) => {
                const maxSlide = BUTTON_WIDTH - SLIDER_SIZE - SLIDER_PADDING * 2;
                const newValue = currentValue.current + gesture.dx;
                if (newValue >= 0 && newValue <= maxSlide) {
                    pan.setValue(newValue);
                } else if (newValue > maxSlide) {
                    pan.setValue(maxSlide);
                } else {
                    pan.setValue(0);
                }
            },
            onPanResponderRelease: (_, gesture) => {
                const maxSlide = BUTTON_WIDTH - SLIDER_SIZE - SLIDER_PADDING * 2;
                const finalValue = currentValue.current + gesture.dx;

                if (finalValue >= maxSlide * 0.8) {
                    // Complete the slide
                    Animated.spring(pan, {
                        toValue: maxSlide,
                        useNativeDriver: false,
                        tension: 50,
                        friction: 7,
                    }).start(() => {
                        setCompleted(true);
                        currentValue.current = maxSlide;
                        // Trigger navigation callback
                        if (onComplete) {
                            setTimeout(() => {
                                onComplete();
                            }, 300); // Small delay for better UX
                        }
                    });
                } else {
                    // Reset to start
                    Animated.spring(pan, {
                        toValue: 0,
                        useNativeDriver: false,
                        tension: 50,
                        friction: 7,
                    }).start(() => {
                        currentValue.current = 0;
                    });
                }
            },
        })
    ).current;

    const sliderTranslate = pan.interpolate({
        inputRange: [0, BUTTON_WIDTH - SLIDER_SIZE - SLIDER_PADDING * 2],
        outputRange: [0, BUTTON_WIDTH - SLIDER_SIZE - SLIDER_PADDING * 2],
        extrapolate: 'clamp',
    });

    const textOpacity = pan.interpolate({
        inputRange: [0, BUTTON_WIDTH / 2],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const completedTextOpacity = pan.interpolate({
        inputRange: [BUTTON_WIDTH / 2, BUTTON_WIDTH - SLIDER_SIZE - SLIDER_PADDING * 2],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <LinearGradient
                    colors={['#7B4FDB', '#5B3FB8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                >
                    <Animated.Text style={[styles.leftText, { opacity: textOpacity }]}>
                        New User &gt;&gt;
                    </Animated.Text>

                    <Animated.Text style={[styles.rightText, { opacity: completedTextOpacity }]}>
                        Submit Interest
                    </Animated.Text>

                    <Animated.View
                        style={[
                            styles.slider,
                            {
                                transform: [{ translateX: sliderTranslate }],
                            },
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <LinearGradient
                            colors={['#FFFFFF', '#E8E8E8']}
                            style={styles.sliderGradient}
                        >
                            <View style={styles.arrowContainer}>
                                <Text style={styles.arrow}>&gt;</Text>
                                <Text style={styles.arrow}>&gt;</Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </LinearGradient>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a3a5c',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    gradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    leftText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        position: 'absolute',
        left: 70,
    },
    rightText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        position: 'absolute',
        right: 20,
    },
    slider: {
        position: 'absolute',
        left: SLIDER_PADDING,
        width: SLIDER_SIZE,
        height: SLIDER_SIZE,
        borderRadius: SLIDER_SIZE / 2,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    sliderGradient: {
        flex: 1,
        borderRadius: SLIDER_SIZE / 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowContainer: {
        flexDirection: 'row',
        gap: -4,
    },
    arrow: {
        color: '#7B4FDB',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
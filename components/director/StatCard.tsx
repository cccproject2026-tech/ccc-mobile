import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

type Props = {
    label: string;
    value: string | number;
};

const StatCard: React.FC<Props> = ({ label, value }) => {
    // Calculate responsive circle size based on screen width
    const circleSize = isSmallDevice ? (SCREEN_WIDTH - 48) / 3 * 0.85 : (SCREEN_WIDTH - 48) / 3;

    return (
        <View style={[styles.wrapper, { width: circleSize, height: circleSize }]}>
            <LinearGradient
                colors={['#21B6E9', '#B83AF3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
            >
                <View style={styles.innerCircle}>
                    <Text style={styles.label} numberOfLines={2}>
                        {label}
                    </Text>
                    <Text style={styles.value}>{value}</Text>
                </View>
            </LinearGradient>
        </View>
    );
};

export default StatCard;

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientBorder: {
        width: '100%',
        height: '100%',
        borderRadius: 1000,
        padding: isSmallDevice ? 3 : 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 1000,
        backgroundColor: '#2C5A8A',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: isSmallDevice ? 8 : 10,
    },
    label: {
        color: '#EAF7FF',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: isSmallDevice ? 2 : 3,
        lineHeight: isSmallDevice ? 14 : 16,
        fontSize: isSmallDevice ? 11 : 12,
    },
    value: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: isSmallDevice ? 18 : 22,
        textAlign: 'center',
    },
});

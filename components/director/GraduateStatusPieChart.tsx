import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const STATUS_DATA = [
    {
        label: 'In-progress',
        value: 580,
        color: '#2D2C5B',
        gradientCenterColor: '#3D3C6B'
    },
    {
        label: 'Ready to Graduate',
        value: 660,
        color: '#21B6E9',
        gradientCenterColor: '#1CA8D6'
    },
    {
        label: 'Graduated',
        value: 470,
        color: '#C4C8E8',
        gradientCenterColor: '#D8DCF2'
    },
];

export default function GraduateStatusPieChart({ year = '2023' }: { year?: string }) {
    const { width } = Dimensions.get('window');
    const isSmallDevice = width < 375;

    const pieRadius = isSmallDevice ? 55 : 65;

    const pieData = STATUS_DATA.map(item => ({
        value: item.value,
        color: item.color,
        gradientCenterColor: item.gradientCenterColor,
        focused: false,
    }));

    return (
        <View style={styles.container}>
            {}
            <View style={styles.header}>
                <LinearGradient
                    colors={['#21B6E9', '#136683']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.dropdownBtn}
                >
                    <Text style={styles.dropdownText}>{year}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                </LinearGradient>
            </View>

            {}
            <View style={styles.chartArea}>
                {}
                <View style={styles.pieWrapper}>
                    <View style={styles.pieContainer}>
                        <PieChart
                            data={pieData}
                            radius={pieRadius}
                            strokeWidth={0}
                            strokeColor="transparent"
                            showGradient
                            showValuesAsLabels={false}
                            showText={false}
                            focusOnPress={false}
                            labelsPosition="outward"
                            labelLineConfig={{
                                color: 'transparent',
                                length: 0,
                            }}
                        />

                        {}
                        <View style={[styles.customLabel, styles.inProgressPosition]}>
                            <LinearGradient
                                colors={['#2D2C5B', '#3D3C6B']}
                                style={styles.gradientLabel}
                            >
                                <Text style={styles.whiteText}>580</Text>
                            </LinearGradient>
                        </View>

                        <View style={[styles.customLabel, styles.readyToGraduatePosition]}>
                            <LinearGradient
                                colors={['#21B6E9', '#136683']}
                                style={styles.gradientLabel}
                            >
                                <Text style={styles.whiteText}>660</Text>
                            </LinearGradient>
                        </View>

                        <View style={[styles.customLabel, styles.graduatedPosition]}>
                            <View style={styles.whiteLabel}>
                                <Text style={styles.graduatedText}>470</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {}
                <View style={styles.legend}>
                    {STATUS_DATA.map((item, index) => (
                        <View key={item.label} style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                            <Text style={styles.legendText}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(35, 69, 153, 0.95)',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        padding: 12,
        marginVertical: 6,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        alignSelf: 'flex-end',
        marginBottom: 12,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
        lineHeight: 18,
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.6)',
        gap: 3,
    },
    dropdownText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    dropdownArrow: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '700',
    },
    chartArea: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pieWrapper: {
        marginRight: 16,
    },
    pieContainer: {
        position: 'relative',
        width: 130,
        height: 130,
    },
    customLabel: {
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    gradientLabel: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    whiteLabel: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    whiteText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    graduatedText: {
        color: '#2D2C5B',
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    // Position labels around the pie chart - adjusted for smaller size
    inProgressPosition: {
        top: 10,
        right: -5,
    },
    readyToGraduatePosition: {
        bottom: 5,
        left: 32,
    },
    graduatedPosition: {
        top: 35,
        left: -12,
    },
    legend: {
        flex: 1,
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendColor: {
        width: 14,
        height: 14,
        borderRadius: 3,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    legendText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    
    labelContainer: {},
    inProgressLabel: {},
    readyToGraduateLabel: {},
    graduatedLabel: {},
    labelValue: {},
});

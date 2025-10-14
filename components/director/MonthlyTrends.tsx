import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const MonthlyTrendsChart: React.FC = () => {
    const { width } = Dimensions.get('window');
    const isSmallDevice = width < 375;
    const [selectedBar, setSelectedBar] = useState<{ index: number; value: number; x: number; y: number } | null>(null);

    const chartData = [
        {
            value: 90,
            label: 'Jan',
            frontColor: '#A78BFA',
            gradientColor: '#E9D5FF',
            spacing: 2,
            labelWidth: 30,
            labelTextStyle: {
                color: '#FFFFFF',
                fontSize: isSmallDevice ? 10 : 11,
                fontWeight: '500' as const,
            },
        },
        {
            value: 25,
            frontColor: '#06B6D4',
            gradientColor: '#A5F3FC',
        },
        {
            value: 230,
            label: 'Feb',
            frontColor: '#A78BFA',
            gradientColor: '#E9D5FF',
            spacing: 2,
            labelWidth: 30,
            labelTextStyle: {
                color: '#FFFFFF',
                fontSize: isSmallDevice ? 10 : 11,
                fontWeight: '500' as const,
            },
        },
        {
            value: 275,
            frontColor: '#06B6D4',
            gradientColor: '#A5F3FC',
        },
        {
            value: 140,
            label: 'Mar',
            frontColor: '#A78BFA',
            gradientColor: '#E9D5FF',
            spacing: 2,
            labelWidth: 30,
            labelTextStyle: {
                color: '#FFFFFF',
                fontSize: isSmallDevice ? 10 : 11,
                fontWeight: '500' as const,
            },
        },
        {
            value: 10,
            frontColor: '#06B6D4',
            gradientColor: '#A5F3FC',
        },
        {
            value: 65,
            label: 'Apr',
            frontColor: '#A78BFA',
            gradientColor: '#E9D5FF',
            spacing: 2,
            labelWidth: 30,
            labelTextStyle: {
                color: '#FFFFFF',
                fontSize: isSmallDevice ? 10 : 11,
                fontWeight: '500' as const,
            },
        },
        {
            value: 5,
            frontColor: '#06B6D4',
            gradientColor: '#A5F3FC',
        },
        {
            value: 250,
            label: 'May',
            frontColor: '#A78BFA',
            gradientColor: '#E9D5FF',
            spacing: 2,
            labelWidth: 30,
            labelTextStyle: {
                color: '#FFFFFF',
                fontSize: isSmallDevice ? 10 : 11,
                fontWeight: '500' as const,
            },
        },
        {
            value: 22,
            frontColor: '#06B6D4',
            gradientColor: '#A5F3FC',
        },
        {
            value: 70,
            label: 'Jun',
            frontColor: '#A78BFA',
            gradientColor: '#E9D5FF',
            spacing: 2,
            labelWidth: 30,
            labelTextStyle: {
                color: '#FFFFFF',
                fontSize: isSmallDevice ? 10 : 11,
                fontWeight: '500' as const,
            },
        },
        {
            value: 28,
            frontColor: '#06B6D4',
            gradientColor: '#A5F3FC',
        },
    ];

    const handleBarPress = (item: any, index: number) => {
        const barWidth = isSmallDevice ? 16 : 18;
        const spacing = isSmallDevice ? 4 : 5;
        const leftMargin = 35;
        const xPosition = leftMargin + (index * (barWidth + spacing)) + (barWidth / 2);

        const maxValue = 300;
        const chartHeight = isSmallDevice ? 180 : 200;
        const yPosition = chartHeight - ((item.value / maxValue) * chartHeight);

        if (selectedBar?.index === index) {
            setSelectedBar(null);
        } else {
            setSelectedBar({
                index,
                value: item.value,
                x: xPosition,
                y: yPosition,
            });
        }
    };

    const handleOutsidePress = () => {
        if (selectedBar) {
            setSelectedBar(null);
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={handleOutsidePress}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerRight}>
                    <View style={styles.legendContainer}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { backgroundColor: '#A78BFA' }]} />
                            <Text style={styles.legendText}>Pastor</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendBox, { backgroundColor: '#06B6D4' }]} />
                            <Text style={styles.legendText}>Mentor</Text>
                        </View>
                    </View>

                    <View style={styles.dropdown}>
                        <Text style={styles.dropdownText}>Past 6 months</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </View>
                </View>
            </View>

            {/* Chart */}
            <View style={styles.chartWrapper}>
                <BarChart
                    data={chartData}
                    barWidth={isSmallDevice ? 16 : 18}
                    spacing={isSmallDevice ? 4 : 5}
                    roundedTop={false}
                    roundedBottom={false}
                    hideRules={false}
                    xAxisThickness={0}
                    yAxisThickness={0}
                    yAxisTextStyle={{
                        color: '#E8F4FF',
                        fontSize: isSmallDevice ? 9 : 10,
                        fontWeight: '400',
                    }}
                    noOfSections={5}
                    maxValue={300}
                    height={isSmallDevice ? 180 : 200}
                    width={width - (isSmallDevice ? 90 : 100)}
                    backgroundColor="transparent"
                    isAnimated
                    animationDuration={800}
                    showGradient={true}
                    rulesColor="rgba(255,255,255,0.2)"
                    rulesType="solid"
                    yAxisLabelSuffix=""
                    stepHeight={isSmallDevice ? 36 : 40}
                    stepValue={50}
                    formatYLabel={(value) => {
                        const numValue = parseInt(value);
                        if (numValue === 0) return '0';
                        if (numValue === 50) return '10';
                        if (numValue === 100) return '50';
                        if (numValue === 150) return '100';
                        if (numValue === 200) return '200';
                        if (numValue >= 250) return '250+';
                        return value;
                    }}
                    onPress={handleBarPress}
                    showFractionalValues={false}
                    barBorderRadius={0}
                    yAxisLabelWidth={isSmallDevice ? 28 : 32}
                    initialSpacing={8}
                    endSpacing={8}
                />

                {/* Custom Tooltip */}
                {selectedBar && (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            styles.tooltip,
                            {
                                left: selectedBar.x - 30,
                                top: selectedBar.y - 50,
                            },
                        ]}
                    >
                        <View style={styles.tooltipContent}>
                            <Text style={styles.tooltipText}>{selectedBar.value}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1E40AF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        padding: 12,
        paddingTop: 16,
        marginVertical: 8,
        // marginHorizontal: 16,
    },
    header: {
        marginBottom: 16,
    },
    headerRight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
    },
    legendContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    legendBox: {
        width: 14,
        height: 14,
        borderRadius: 3,
    },
    legendText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        backgroundColor: 'rgba(30, 64, 175, 0.6)',
        gap: 6,
    },
    dropdownText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '500',
    },
    dropdownArrow: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '600',
    },
    chartWrapper: {
        position: 'relative',
        alignItems: 'center',
        marginTop: 6,
        overflow: 'hidden',
    },
    tooltip: {
        position: 'absolute',
        zIndex: 1000,
    },
    tooltipContent: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#06B6D4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    tooltipText: {
        color: '#06B6D4',
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
    },
});

export default MonthlyTrendsChart;

import React from "react";
import { Dimensions, StyleSheet, Text, View, ViewStyle } from "react-native";
import Svg, { G, Line, Rect, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");
const barWidth = 20;
const barGap = 21;
const maxBarHeight = 5;
const gridLineCount = 6;
const chartHeight = 150;
const chartWidth = width - 40;

interface DataSection {
  Total: number;
  Completed: number;
  Remaining: number;
}

interface ChartData {
  Roadmap: DataSection;
  Assessments: DataSection;
}

interface Colors {
  Total: string[];
  Completed: string[];
  Remaining: string[];
}

interface CustomBarChartProps {
  data?: ChartData;
  colors?: Colors;
  containerStyle?: ViewStyle;
  chartHeight?: number;
  chartWidth?: number;
  barWidth?: number;
  barGap?: number;
  maxBarHeight?: number;
  gridLineCount?: number;
}

const defaultData: ChartData = {
  Roadmap: {
    Total: 100,
    Completed: 60,
    Remaining: 40,
  },
  Assessments: {
    Total: 80,
    Completed: 50,
    Remaining: 30,
  },
};

const defaultColors: Colors = {
  Total: ["#183476", "#FFFFFF"],
  Completed: ["#1535A8", "#FFFFFF"],
  Remaining: ["#118FBA", "#FFFFFF"],
};

// Normalize data to a scale of 0 to 5
const normalizeData = (value: number, maxValue: number): number => {
  return (value / maxValue) * maxBarHeight;
};

const CustomBarChart: React.FC<CustomBarChartProps> = ({
  data = defaultData,
  colors = defaultColors,
  containerStyle,
  chartHeight: customChartHeight = chartHeight,
  chartWidth: customChartWidth = chartWidth,
  barWidth: customBarWidth = barWidth,
  barGap: customBarGap = barGap,
  maxBarHeight: customMaxBarHeight = maxBarHeight,
  gridLineCount: customGridLineCount = gridLineCount,
}) => {
  // Find the maximum value in the data to normalize bar heights
  const maxValue = Math.max(
    ...Object.values(data.Roadmap),
    ...Object.values(data.Assessments)
  );

  // Calculate the total width of the Roadmap and Assessments bars
  const roadmapBarCount = Object.keys(data.Roadmap).length;
  const assessmentsBarCount = Object.keys(data.Assessments).length;
  const roadmapTotalWidth = roadmapBarCount * customBarWidth + (roadmapBarCount - 1) * customBarGap;
  const assessmentsTotalWidth = assessmentsBarCount * customBarWidth + (assessmentsBarCount - 1) * customBarGap;

  
  const roadmapStartX = (customChartWidth - (roadmapTotalWidth + assessmentsTotalWidth + customBarGap * 3)) / 2;
  const assessmentsStartX = roadmapStartX + roadmapTotalWidth + customBarGap * 2;

  const renderGridLines = (): React.ReactElement[] => {
    return [...Array(customGridLineCount).keys()].map((i) => (
      <G key={i}>
        {}
        <Line
          x1={40}
          y1={(customChartHeight / (customGridLineCount - 1)) * i}
          x2={customChartWidth}
          y2={(customChartHeight / (customGridLineCount - 1)) * i}
          stroke="#E0E0E0"
          strokeWidth={1}
        />
        {}
        <SvgText
          x={30}
          y={(customChartHeight / (customGridLineCount - 1)) * i + 8}
          fill="white"
          fontSize="10"
          textAnchor="end"
        >
          {customMaxBarHeight - i}
        </SvgText>
      </G>
    ));
  };

  const renderBars = (
    sectionData: DataSection,
    startX: number,
    sectionKey: string
  ): React.ReactElement[] => {
    return Object.entries(sectionData).map(([key, value], index) => (
      <G
        key={`${sectionKey}-${key}`}
        x={startX + index * (customBarWidth + customBarGap)}
        y={
          customChartHeight -
          normalizeData(value, maxValue) * (customChartHeight / customMaxBarHeight)
        }
      >
        <Rect
          width={customBarWidth}
          height={
            normalizeData(value, maxValue) * (customChartHeight / customMaxBarHeight)
          }
          fill={colors[key as keyof Colors][0]}
        />
      </G>
    ));
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Svg width={customChartWidth} height={customChartHeight + 10}>
        {}
        {renderGridLines()}

        {}
        <G>
          {renderBars(data.Roadmap, roadmapStartX, "Roadmap")}
        </G>

        {}
        <G>
          {renderBars(data.Assessments, assessmentsStartX, "Assessments")}
        </G>
      </Svg>

      {}
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Roadmap</Text>
        <Text style={styles.sectionTitle}>Assessments</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignItems: "center",
    padding: 10,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CustomBarChart;

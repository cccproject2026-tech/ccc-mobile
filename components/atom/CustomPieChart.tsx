import React from "react";
import { Text, TextStyle, View, ViewStyle } from "react-native";
import PieChart, { Slice } from "react-native-pie-chart";


interface PieChartDataItem {
  value: number;
  color: string;
  label: string;
}


interface CustomPieChartProps {
  data?: PieChartDataItem[];
  widthAndHeight?: number;
  cover?: number | { radius: number; color?: string };
  labelRadius?: number;
  style?: ViewStyle;
}

const CustomPieChart: React.FC<CustomPieChartProps> = ({
  data = [
    { value: 50, color: "#182c5b", label: "62.5%" },
    { value: 30, color: "#d9d9d9", label: "37.5%" },
  ],
  widthAndHeight = 120,
  cover = 0.7,
  labelRadius = 1.2,
  style,
}) => {
  
  const total = data.reduce((acc: number, item: PieChartDataItem) => acc + item.value, 0);
  const radius = widthAndHeight / 2;
  let startAngle = -90;

  // Convert data to Slice format for the PieChart component
  const series: Slice[] = data.map((item: PieChartDataItem) => ({
    value: item.value,
    color: item.color,
  }));

  
  const getLabelStyle = (label: string): TextStyle => ({
    position: "absolute",
    fontSize: 12,
    fontWeight: "bold",
    color: label === "37.5%" ? "#001fc1" : "#ffffff",
    textAlign: "center",
    backgroundColor: label === "37.5%" ? "#a2c0d3" : "#1c447a",
    padding: 2,
    borderRadius: 4,
  });

  
  const calculateLabelPosition = (
    item: PieChartDataItem,
    currentStartAngle: number
  ): { x: number; y: number } => {
    const sliceAngle = (item.value / total) * 360;
    const middleAngle = currentStartAngle + sliceAngle / 2;
    const radians = (middleAngle * Math.PI) / 180;

    
    const calculatedLabelRadius = radius * labelRadius;
    const x = radius + calculatedLabelRadius * Math.cos(radians);
    const y = radius + calculatedLabelRadius * Math.sin(radians);

    return { x, y };
  };

  
  const containerStyle: ViewStyle = {
    width: "100%",
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    ...style,
  };

  const overlayContainerStyle: ViewStyle = {
    position: "absolute",
    width: widthAndHeight,
    height: widthAndHeight,
  };

  return (
    <View style={containerStyle}>
      <PieChart
        widthAndHeight={widthAndHeight}
        series={series}
        cover={cover}
        style={style}
      />

      {}
      <View style={overlayContainerStyle}>
        {data.map((item: PieChartDataItem, index: number) => {
          const { x, y } = calculateLabelPosition(item, startAngle);
          
          
          const sliceAngle = (item.value / total) * 360;
          startAngle += sliceAngle;

          const labelStyle = getLabelStyle(item.label);

          return (
            <Text
              key={`${item.label}-${index}`}
              style={{
                ...labelStyle,
                left: x - 12,
                top: y - 8,
              }}
            >
              {item.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

export default CustomPieChart;
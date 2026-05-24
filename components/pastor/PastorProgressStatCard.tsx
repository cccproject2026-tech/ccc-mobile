import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

export type PastorProgressStatCardProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string;
  label: string;
  onPress?: () => void;
  tileHeight?: number;
};

function useCompactMetrics() {
  const { width: screenWidth } = useWindowDimensions();
  return useMemo(() => {
    const isSmall = screenWidth < 375;
    return {
      iconSize: isSmall ? 18 : 20,
      valueSize: isSmall ? 11 : 12,
      valueLineHeight: isSmall ? 14 : 15,
      labelSize: isSmall ? 8 : 9,
      labelLineHeight: isSmall ? 10 : 11,
      tileHeight: isSmall ? 78 : 84,
      paddingVertical: isSmall ? 6 : 8,
      paddingHorizontal: isSmall ? 3 : 4,
    };
  }, [screenWidth]);
}

export function PastorProgressStatCard({
  icon,
  value,
  label,
  onPress,
  tileHeight: tileHeightProp,
}: PastorProgressStatCardProps) {
  const metrics = useCompactMetrics();
  const tileHeight = tileHeightProp ?? metrics.tileHeight;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.pressable,
        { height: tileHeight },
        pressed && onPress ? styles.pressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${value}`}
    >
      <View
        style={[
          styles.card,
          {
            height: tileHeight,
            paddingVertical: metrics.paddingVertical,
            paddingHorizontal: metrics.paddingHorizontal,
          },
        ]}
      >
        <Ionicons
          name={icon}
          color="#fff"
          size={metrics.iconSize}
          style={styles.icon}
        />
        <Text
          style={[
            styles.value,
            {
              fontSize: metrics.valueSize,
              lineHeight: metrics.valueLineHeight,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {value}
        </Text>
        <Text
          style={[
            styles.label,
            {
              fontSize: metrics.labelSize,
              lineHeight: metrics.labelLineHeight,
            },
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export function getProgressStatCardHeight(screenWidth: number): number {
  return screenWidth < 375 ? 78 : 84;
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
    alignSelf: "stretch",
  },
  card: {
    width: "100%",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  pressed: {
    opacity: 0.88,
  },
  icon: {
    flexShrink: 0,
  },
  value: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
    width: "100%",
  },
  label: {
    color: "rgba(255,255,255,0.72)",
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
  },
});

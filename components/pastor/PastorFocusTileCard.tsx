import {
  PASTOR_FOCUS_STATUS_STYLES,
  type PastorFocusHighlightStatusVariant,
} from "@/components/pastor/PastorFocusHighlightCard";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";

export type PastorFocusTileCardProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  line1: string;
  line2: string;
  statusLabel: string;
  statusVariant: PastorFocusHighlightStatusVariant;
  onPress?: () => void;
  wrapperStyle?: ViewStyle;
  tileHeight?: number;
};

export function getFocusTileDimensions(screenWidth: number) {
  const isSmall = screenWidth < 375;
  const isNarrow = screenWidth < 390;

  const fontSize = isSmall ? 9 : isNarrow ? 9.5 : 10;
  const lineHeight = Math.round(fontSize * 1.3);
  const iconSize = isSmall ? 20 : 22;
  const badgeFontSize = isSmall ? 8 : 9;
  const titleBlockHeight = lineHeight * 2 + 2;
  const tileHeight = isSmall ? 96 : 102;

  return {
    tileHeight,
    fontSize,
    lineHeight,
    iconSize,
    badgeFontSize,
    titleBlockHeight,
  };
}

function useTileMetrics() {
  const { width: screenWidth } = useWindowDimensions();
  return useMemo(
    () => getFocusTileDimensions(screenWidth),
    [screenWidth],
  );
}

export function PastorFocusTileCard({
  icon,
  line1,
  line2,
  statusLabel,
  statusVariant,
  onPress,
  wrapperStyle,
  tileHeight: tileHeightProp,
}: PastorFocusTileCardProps) {
  const metrics = useTileMetrics();
  const tileHeight = tileHeightProp ?? metrics.tileHeight;
  const statusStyle = PASTOR_FOCUS_STATUS_STYLES[statusVariant];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.pressable,
        { height: tileHeight },
        wrapperStyle,
        pressed && onPress ? styles.wrapperPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${line1} ${line2}. ${statusLabel}`}
    >
      <View style={[styles.card, { height: tileHeight }]}>
        <Ionicons
          name={icon}
          color="#fff"
          size={metrics.iconSize}
          style={styles.icon}
        />

        <View
          style={[styles.titleBlock, { height: metrics.titleBlockHeight }]}
        >
          <Text
            style={[
              styles.titleLine,
              { fontSize: metrics.fontSize, lineHeight: metrics.lineHeight },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {line1}
          </Text>
          <Text
            style={[
              styles.titleLine,
              { fontSize: metrics.fontSize, lineHeight: metrics.lineHeight },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {line2}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: statusStyle.badgeBg }]}>
          <Text
            style={[
              styles.badgeText,
              {
                color: statusStyle.badgeText,
                fontSize: metrics.badgeFontSize,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {statusLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
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
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  wrapperPressed: {
    opacity: 0.88,
  },
  icon: {
    flexShrink: 0,
    marginTop: 2,
  },
  titleBlock: {
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  titleLine: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
  },
  badge: {
    flexShrink: 0,
    marginBottom: 2,
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignSelf: "stretch",
    alignItems: "center",
    minHeight: 20,
    justifyContent: "center",
  },
  badgeText: {
    fontWeight: "700",
    textAlign: "center",
    width: "100%",
  },
});

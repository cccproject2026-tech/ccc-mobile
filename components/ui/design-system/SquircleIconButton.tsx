import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type Ion = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: Ion;
  onPress: () => void;
  accessibilityLabel?: string;
  size?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  prominent?: boolean;
};

export function SquircleIconButton({
  icon,
  onPress,
  accessibilityLabel,
  size: sizeProp,
  iconSize: iconSizeProp,
  style,
  disabled,
  prominent,
}: Props) {
  const size = sizeProp ?? (prominent ? 40 : 34);
  const iconSize = iconSizeProp ?? (prominent ? 22 : 18);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={prominent ? 8 : 10}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        prominent ? styles.baseProminent : null,
        prominent && Platform.OS === "ios" ? styles.shadowIos : null,
        prominent && Platform.OS === "android" ? styles.shadowAndroid : null,
        { width: size, height: size, borderRadius: Math.round(size * 0.42) },
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
  },
  baseProminent: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.30)",
    borderWidth: 1.5,
  },
  shadowIos: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  shadowAndroid: {
    elevation: 8,
  },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.35 },
});
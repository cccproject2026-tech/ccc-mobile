import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { RoadmapAmbientOrbs } from "./RoadmapAmbientOrbs";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Decorative circles used on roadmap list screens */
  decorativeOrbs?: boolean;
};

/**
 * App-wide gradient matching Pastor Home (`Colors.appBgGradient`).
 */
export function GradientBackground({ children, style, decorativeOrbs }: Props) {
  return (
    <LinearGradient colors={[...Colors.appBgGradient]} style={[{ flex: 1 }, style]}>
      {decorativeOrbs ? <RoadmapAmbientOrbs /> : null}
      {children}
    </LinearGradient>
  );
}


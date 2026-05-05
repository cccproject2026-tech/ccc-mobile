import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Frosted/glass card used across Pastor Home + mentorship flows.
 * Keep this as the single source of truth for card radius/border/background.
 */
export function CommonCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: roadmapTheme.frostedSurface ?? "rgba(255,255,255,0.08)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder ?? "rgba(255,255,255,0.12)",
    padding: 14,
  },
});


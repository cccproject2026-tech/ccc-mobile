import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Frosted surface card used across roadmap/notes/assessments screens. */
export function CommonCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
});


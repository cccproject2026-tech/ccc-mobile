import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type Props = {
  title: string;
  subtitle?: string;
  /** Decorative divider row with leaf icon (Pastor Home pattern) */
  showDivider?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, subtitle, showDivider, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {showDivider ? (
        <View style={styles.dividerRow} pointerEvents="none">
          <View style={styles.dividerLine} />
          <Ionicons name="leaf-outline" size={14} color={roadmapTheme.accentMint} />
          <View style={styles.dividerLine} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "500",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});


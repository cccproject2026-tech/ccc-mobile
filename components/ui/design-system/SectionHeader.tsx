import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Decorative divider row with leaf icon (Pastor Home pattern) */
  showDivider?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({ title, subtitle, showDivider, style }: SectionHeaderProps) {
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
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
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


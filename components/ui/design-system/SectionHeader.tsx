import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Decorative divider with leaf (roadmap list pattern) */
  showDivider?: boolean;
  style?: ViewStyle;
};

/**
 * Title + subtitle + optional divider row — matches Pastor roadmap / Home hierarchy.
 */
export function SectionHeader({ title, subtitle, showDivider, style }: SectionHeaderProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {showDivider ? (
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Ionicons name="leaf-outline" size={14} color={roadmapTheme.accentMint} />
          <View style={styles.dividerLine} />
        </View>
      ) : null}
    </View>
  );
}

type RoadmapNavRowProps = {
  onBack: () => void;
  pillLabel: string;
  rightSlot?: React.ReactNode;
};

const backBtnSize = 34;

/**
 * Back (frosted) + pill label — matches Revitalization Roadmap reference header row.
 */
export function RoadmapNavRow({ onBack, pillLabel, rightSlot }: RoadmapNavRowProps) {
  return (
    <View style={styles.navRow}>
      <Pressable onPress={onBack} hitSlop={10} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.92)" />
      </Pressable>
      <View style={styles.headerPillWrap}>
        <View style={styles.pill}>
          <View style={styles.pillDots}>
            <View style={styles.pillDotMint} />
            <View style={styles.pillDotGold} />
          </View>
          <Text style={styles.pillText} numberOfLines={1}>
            {pillLabel}
          </Text>
        </View>
      </View>
      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
    </View>
  );
}

type CommonCardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

/** Frosted surface card for empty states and grouped content */
export function CommonCard({ children, style }: CommonCardProps) {
  return <View style={[styles.commonCard, style]}>{children}</View>;
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  leftIcon?: React.ReactNode;
  disabled?: boolean;
};

/** Solid light button on gradient (matches active tab / CTA pattern) */
export function PrimaryButton({ label, onPress, leftIcon, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryBtn,
        pressed && !disabled && styles.primaryBtnPressed,
        disabled && styles.primaryBtnDisabled,
      ]}
    >
      {leftIcon ? <View style={styles.primaryBtnIcon}>{leftIcon}</View> : null}
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
  },
  title: {
    color: roadmapTheme.textPrimary,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  subtitle: {
    color: roadmapTheme.textMuted,
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: roadmapTheme.divider,
  },

  navRow: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  backBtn: {
    width: backBtnSize,
    height: backBtnSize,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
  },
  headerPillWrap: {
    flex: 1,
    minWidth: 0,
  },
  rightSlot: {
    justifyContent: "center",
    alignItems: "center",
  },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
  },
  pillDots: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillDotMint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: roadmapTheme.accentMint,
  },
  pillDotGold: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: roadmapTheme.accentGold,
  },
  pillText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "700",
  },

  commonCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    padding: 16,
    alignItems: "center",
    gap: 8,
  },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  primaryBtnPressed: {
    opacity: 0.92,
  },
  primaryBtnDisabled: {
    opacity: 0.55,
  },
  primaryBtnIcon: {
    marginRight: 0,
  },
  primaryBtnText: {
    color: roadmapTheme.tealDeep,
    fontSize: 15,
    fontWeight: "700",
  },
});

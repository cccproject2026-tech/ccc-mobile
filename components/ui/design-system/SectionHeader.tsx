import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";
import { SquircleIconButton } from "./SquircleIconButton";

type Props = {
  title: string;
  subtitle?: string;
  /** Decorative divider row with leaf icon (Pastor Home pattern) */
  showDivider?: boolean;
  /** Compact variant for tighter screens */
  variant?: "default" | "compact";
  style?: StyleProp<ViewStyle>;
  /**
   * When true, shows a squircle back control to the left of the title when navigation can go back.
   */
  showBackButton?: boolean;
  /**
   * Show back whenever `showBackButton` is true, even with no stack history (e.g. tab hero).
   * Pair with `onBackPress` so navigation is always defined.
   */
  alwaysShowBack?: boolean;
  onBackPress?: () => void;
  /** Optional trailing control (e.g. menu), aligned with the title row */
  headerRight?: React.ReactNode;
};

export function SectionHeader({
  title,
  subtitle,
  showDivider,
  variant = "default",
  style,
  showBackButton,
  alwaysShowBack,
  onBackPress,
  headerRight,
}: Props) {
  const navigation = useNavigation();
  const isCompact = variant === "compact";
  const canGoBack = navigation.canGoBack();
  const showBack = !!showBackButton && (!!alwaysShowBack || canGoBack);
  const hasTopRow = showBack || !!headerRight;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (navigation.canGoBack()) router.back();
  };

  const titleBlock = (
    <>
      <Text style={[styles.title, isCompact ? styles.titleCompact : null]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, isCompact ? styles.subtitleCompact : null]}>{subtitle}</Text>
      ) : null}
    </>
  );

  return (
    <View style={[styles.wrap, isCompact ? styles.wrapCompact : null, style]}>
      {hasTopRow ? (
        <View style={styles.titleRow}>
          {showBack ? (
            <SquircleIconButton
              icon="chevron-back"
              onPress={handleBack}
              accessibilityLabel="Go back"
              prominent
            />
          ) : null}
          <View style={styles.titleColumn}>{titleBlock}</View>
          {headerRight ? <View style={styles.rightSlot}>{headerRight}</View> : null}
        </View>
      ) : (
        titleBlock
      )}

      {showDivider ? (
        <View style={[styles.dividerRow, isCompact ? styles.dividerRowCompact : null]} pointerEvents="none">
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
  wrapCompact: {
    paddingTop: 6,
    marginBottom: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 44,
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  rightSlot: {
    marginLeft: 4,
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 20,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "500",
  },
  subtitleCompact: {
    fontSize: 12.5,
    marginTop: 6,
    lineHeight: 18,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  dividerRowCompact: {
    marginTop: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

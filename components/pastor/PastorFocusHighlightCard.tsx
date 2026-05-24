import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";

export type PastorFocusHighlightStatusVariant =
  | "upcoming"
  | "pending"
  | "inProgress"
  | "dueToday";

export type PastorFocusHighlightCardProps = {
  title: string;
  subtitle: string;
  statusLabel: string;
  statusVariant: PastorFocusHighlightStatusVariant;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconGradient: readonly [string, string];
  onPress?: () => void;
  style?: ViewStyle;
};

export const PASTOR_FOCUS_STATUS_STYLES: Record<
  PastorFocusHighlightStatusVariant,
  { badgeBg: string; badgeText: string }
> = {
  upcoming: {
    badgeBg: "rgba(56, 189, 248, 0.18)",
    badgeText: "#7DD3FC",
  },
  pending: {
    badgeBg: "rgba(251, 191, 36, 0.18)",
    badgeText: "#FCD34D",
  },
  inProgress: {
    badgeBg: "rgba(56, 189, 248, 0.14)",
    badgeText: "#93C5FD",
  },
  dueToday: {
    badgeBg: "rgba(248, 113, 113, 0.2)",
    badgeText: "#FCA5A5",
  },
};

export function PastorFocusHighlightCard({
  title,
  subtitle,
  statusLabel,
  statusVariant,
  icon,
  iconGradient,
  onPress,
  style,
}: PastorFocusHighlightCardProps) {
  const statusStyle = PASTOR_FOCUS_STATUS_STYLES[statusVariant];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        style,
        onPress && pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}. ${statusLabel}`}
    >
      <LinearGradient
        colors={[iconGradient[0], iconGradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrap}
      >
        <Ionicons name={icon} size={20} color="#fff" />
      </LinearGradient>

      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>

      <View style={[styles.badge, { backgroundColor: statusStyle.badgeBg }]}>
        <Text style={[styles.badgeText, { color: statusStyle.badgeText }]}>
          {statusLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 148,
    minHeight: 168,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  cardPressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 4,
    minHeight: 34,
  },
  subtitle: {
    color: "rgba(186, 230, 253, 0.85)",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 15,
    marginBottom: 10,
    minHeight: 30,
  },
  badge: {
    marginTop: "auto",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "stretch",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});

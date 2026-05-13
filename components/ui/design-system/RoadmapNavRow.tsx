import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { roadmapTheme } from "./roadmapTheme";
import { SquircleIconButton } from "./SquircleIconButton";

type Props = {
  onBack: () => void;
  pillLabel: string;
  rightSlot?: React.ReactNode;
};

/** Back button + frosted pill label row used on reference screens. */
export function RoadmapNavRow({ onBack, pillLabel, rightSlot }: Props) {
  return (
    <View style={styles.row}>
      <SquircleIconButton
        icon="chevron-back"
        onPress={onBack}
        accessibilityLabel="Go back"
        prominent
      />

      <View style={styles.pillWrap}>
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

      {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : <View style={styles.rightSlot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  pillWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    maxWidth: "100%",
  },
  pillDots: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillDotMint: { width: 6, height: 6, borderRadius: 3, backgroundColor: roadmapTheme.accentMint },
  pillDotGold: { width: 6, height: 6, borderRadius: 3, backgroundColor: roadmapTheme.accentGold },
  pillText: { color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: "700" },
  rightSlot: { width: 34, alignItems: "flex-end" },
});


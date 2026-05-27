import type { ReviewRoadmapSection } from "@/lib/mentor/reviewCenter.types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  section: ReviewRoadmapSection;
};

export function ReviewRoadmapSectionHeader({ section }: Props) {
  const taskLabel =
    section.items.length === 1 ? "1 task" : `${section.items.length} tasks`;

  return (
    <View style={styles.header}>
      <View style={styles.iconWrap}>
        <Ionicons name="map-outline" size={16} color="#38BDF8" />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={2}>
          {section.roadmapName}
        </Text>
        <Text style={styles.subtitle}>{taskLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
    backgroundColor: "rgba(56,189,248,0.08)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(56,189,248,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "500",
  },
});

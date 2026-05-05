import { icons } from "@/constants/images";
import { Mentee } from "@/types/mentee.types";
import { Router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";

export default function MentorDetailedCard({
  data,
  dataKey,
  navigation,
  onMenuPress,
}: {
  data: Mentee;
  dataKey: string;
  navigation: Router;
  onMenuPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onMenuPress} hitSlop={10} style={styles.menuBtn}>
        <Image source={icons.menuVertical} style={styles.menuIcon} />
      </TouchableOpacity>

      <View style={styles.row}>
        <View style={styles.leftCol}>
          <Image source={icons.dummyUser} style={styles.photo} />
          <View style={styles.actionsRow}>
            <Image source={icons.phone} style={styles.actionIcon} />
            <Image source={icons.message} style={styles.actionIcon} />
            <Image source={icons.mail} style={styles.actionIcon} />
            <Image source={icons.whatsapp} style={styles.actionIcon} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {data.firstName + " " + data.lastName}
          </Text>
          {!!data?.role && (
            <Text style={styles.role} numberOfLines={1}>
              {data.role}
            </Text>
          )}
          {!!data?.description && (
            <Text style={styles.desc} numberOfLines={3}>
              {data.description}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    padding: 14,
    position: "relative",
  },
  menuBtn: {
    position: "absolute",
    top: 12,
    right: 10,
    padding: 6,
    zIndex: 5,
  },
  menuIcon: {
    width: 18,
    height: 18,
    tintColor: "rgba(255,255,255,0.92)",
    resizeMode: "contain",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  leftCol: {
    width: 112,
  },
  photo: {
    width: "100%",
    height: 104,
    borderRadius: 12,
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  actionIcon: {
    width: 18,
    height: 18,
    tintColor: "rgba(255,255,255,0.92)",
    resizeMode: "contain",
  },
  content: {
    flex: 1,
    minWidth: 0,
    paddingRight: 18,
    gap: 6,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  role: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "700",
  },
  desc: {
    color: roadmapTheme.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
});

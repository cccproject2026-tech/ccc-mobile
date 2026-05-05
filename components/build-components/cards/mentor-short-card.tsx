import { icons } from "@/constants/images";
import { Mentee } from "@/types/mentee.types";
import { Router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";

export default function MentorShortCard({
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
      <View style={styles.left}>
        <Image source={icons.dummyUser} style={styles.avatar} />
        <View style={styles.nameCol}>
          <Text style={styles.name} numberOfLines={1}>
            {data.firstName + " " + data.lastName}
          </Text>
          {!!data.role && (
            <Text style={styles.sub} numberOfLines={1}>
              {data.role}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.iconRow}>
          <Image source={icons.phone} style={styles.icon} />
          <Image source={icons.message} style={styles.icon} />
          <Image source={icons.mail} style={styles.icon} />
          <Image source={icons.whatsapp} style={styles.icon} />
        </View>
        <TouchableOpacity onPress={onMenuPress} hitSlop={10} style={styles.menuBtn}>
          <Image source={icons.menuVertical} style={styles.icon} />
        </TouchableOpacity>
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  nameCol: { flex: 1, minWidth: 0, gap: 2 },
  name: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sub: {
    color: roadmapTheme.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: "rgba(255,255,255,0.92)",
    resizeMode: "contain",
  },
  menuBtn: {
    paddingLeft: 2,
  },
});

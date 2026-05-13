import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleProp, StyleSheet, TextInput, View, ViewStyle } from "react-native";
import { roadmapTheme } from "./roadmapTheme";

type Props = {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  /** Denser padding/height for compact screens */
  dense?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function RoadmapSearchField({
  value,
  onChangeText,
  placeholder = "Search...",
  dense = false,
  style,
}: Props) {
  return (
    <View style={[styles.searchBox, dense ? styles.searchBoxDense : null, style]}>
      <Ionicons name="search" size={18} color="rgba(255,255,255,0.75)" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.55)"
        style={styles.searchInput}
      />
      {!!value && (
        <Pressable onPress={() => onChangeText("")} hitSlop={10}>
          <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.65)" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchBoxDense: {
    paddingVertical: 7,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});


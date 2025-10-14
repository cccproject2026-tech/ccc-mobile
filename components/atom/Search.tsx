import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";

interface SearchProps {
  searchText?: string;
  setSearchText?: (text: string) => void;
  placeholder?: string;
}

export const Search = ({
  searchText,
  setSearchText,
  placeholder,
}: SearchProps) => {
  return (
    <View style={styles.searchBox}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder || "Search"}
        placeholderTextColor="white"
        value={searchText}
        onChangeText={setSearchText}
      />
      <Ionicons
        name="search"
        size={Platform.OS === 'android' ? 18 : 20}
        color="rgba(255, 255, 255, 0.6)"
        style={styles.searchIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: "#14517D",
    borderRadius: Platform.OS === 'android' ? 8 : 10,
    height: Platform.OS === 'android' ? 40 : 45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchIcon: {
    marginLeft: Platform.OS === 'android' ? 10 : 12,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: Platform.OS === 'android' ? 14 : 16,
    fontWeight: "400",
  },
});

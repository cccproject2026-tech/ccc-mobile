import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

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
        size={20}
        color="rgba(255, 255, 255, 0.6)"
        style={styles.searchIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    backgroundColor: "#14517D",
    borderRadius: 10,
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "400",
  },
});

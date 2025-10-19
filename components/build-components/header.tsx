import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";

import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Search } from "../atom/Search";
import { Button } from "../atom/buttons";

export default function Header({
  title = ``,
  subTitle = ``,
  hideSearchBar = false,
  showSettings = true,
  showNewMeeting = false,
  onNewMeetingPress,
}: {
  title?: string | undefined;
  subTitle?: string | undefined;
  hideSearchBar?: boolean | undefined;
  showSettings?: boolean | undefined;
  showNewMeeting?: boolean | undefined;
  onNewMeetingPress?: () => void;
}) {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");
  return (
    <>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 20,
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Image
              source={icons.forward}
              style={{
                width: 18,
                height: 18,
                transform: [{ scaleX: -1 }],
              }}
            />
            <View>
              <Text className="text-white font-semibold text-[17px]">
                {title}
              </Text>
              {subTitle && (
                <Text className="text-[#F4F2F2B5] font-semibold ">
                  {subTitle}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {showSettings && (
          <TouchableOpacity onPress={() => setIsRoadmapModalVisible(true)}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        )}

        {showNewMeeting && (
          <TouchableOpacity onPress={onNewMeetingPress}>
            {/* <Ionicons name="add" size={20} color="white" /> */}
            <Button
              type="custom"
              title="New Meeting"
              icon={icons.plusIcon}
              onPress={onNewMeetingPress || (() => { })}
              style={{
                width: 160,
                backgroundColor: "rgba(255, 255, 255, 0.16)",
              }}
              textStyle={{
                fontSize: 16,
                lineHeight: 22,
                fontWeight: "600",
              }}
              iconStyles={{
                width: 20,
              }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Separator */}
      <View className="h-[0.5px] bg-white/30 mt-3" />

      {!hideSearchBar && (
        <View style={styles.searchContainer}>
          <Search searchText={searchText} setSearchText={setSearchText} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
});

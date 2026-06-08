import { icons } from "@/constants/images";
import { SquircleIconButton } from "@/components/ui/design-system/SquircleIconButton";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Search } from "../atom/Search";
import { Button } from "../atom/buttons";

export default function Header({
  title = ``,
  subTitle = ``,
  hideSearchBar = false,
  showSettings = true,
  showNewMeeting = false,
  onNewMeetingPress,
  onMenuPress,
}: {
  title?: string | undefined;
  subTitle?: string | undefined;
  hideSearchBar?: boolean | undefined;
  showSettings?: boolean | undefined;
  showNewMeeting?: boolean | undefined;
  onNewMeetingPress?: () => void;
  onMenuPress?: () => void;
}) {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack();

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            flex: 1,
            minWidth: 0,
          }}
        >
          {canGoBack ? (
            <SquircleIconButton
              icon="chevron-back"
              onPress={() => router.back()}
              accessibilityLabel="Go back"
              prominent
            />
          ) : null}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{ color: "white" }}
              className="text-white font-semibold text-[17px]"
            >
              {title}
            </Text>
            {subTitle ? (
              <Text className="text-[#F4F2F2B5] font-semibold ">{subTitle}</Text>
            ) : null}
          </View>
        </View>

        {showSettings && (
          <TouchableOpacity onPress={() => {onMenuPress && onMenuPress(); setIsRoadmapModalVisible(true)}}>
            <Ionicons name="ellipsis-vertical" size={20} color="white" />
          </TouchableOpacity>
        )}

        {showNewMeeting && (
          <TouchableOpacity onPress={onNewMeetingPress}>
            {}
            <Button
              type="custom"
              title="New Meetings"
              icon={icons.plusIcon}
              onPress={onNewMeetingPress || (() => {})}
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

      {}
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

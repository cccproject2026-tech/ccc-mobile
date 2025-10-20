import { AssessmentCard } from "@/components/build-components";
import SearchBar from "@/components/director/SearchBar";
import { TabSwitcher } from "@/components/director/TabSwitcher";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { dummyRoadMaps } from "@/lib/assessments/mock";


import { Assessment } from "@/lib/assessments/types";
import { getFontSize, getIconSize, getSpacing } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const availableTabs = [
  { key: "All", label: "All" },
  { key: "Due", label: "Due", badge: 1 },
  { key: "Not Started", label: "Not Started" },
  { key: "In Progress", label: "In Progress" },
  { key: "Completed", label: "Completed" },
  { key: "Overdue", label: "Overdue" },
  { key: "Pending Review", label: "Pending Review" },
  { key: "On Hold", label: "On Hold" },
];


export default function Survey() {
  const [search, setSearch] = React.useState("");
  const [tabs, setTabs] = React.useState("All");
  const { bottom } = useSafeAreaInsets();

  const filteredRoadMaps = dummyRoadMaps.filter((item) => {
    if (tabs === "All") return true;
    return item.status === tabs;
  });
  const handleCardPress = (data: Assessment) => {
    router.push({
      pathname: "/assessments/survey-guidelines",
      params: { data: JSON.stringify(data) },
    });
  };

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <View style={styles.scrollContainer}>
          <TopBar role="pastor" userName="John Doe" showUserName />
          {/* Header Section */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={getIconSize(28)} color="#fff" />
              <Text style={styles.headerTitle}>Assessment</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <SearchBar value={search} onChangeValue={setSearch} />
          </View>
          {/* Tabs Section */}
          <View style={{ marginTop: 10 }}>
            <TabSwitcher
              tabs={availableTabs}
              activeTab={tabs}
              onChange={setTabs}
            />
          </View>

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: bottom + 20,
            }}
          >
            <View
              style={{
                paddingHorizontal: 16,
                width: "100%",
              }}
            >
              {filteredRoadMaps.map((e, i) => (
                <React.Fragment key={i}>
                  <AssessmentCard
                    data={e}
                    onPress={() => handleCardPress(e)} // Pass the custom onPress handler
                    onMeetingPress={() => {
                      console.log("Meeting pressed for:", e.title);
                    }}
                    onMeetingIconPress={() => {
                      console.log("Meeting icon pressed for:", e.title);
                    }}
                    onCustomizedPress={() => {
                      console.log("Customized plans pressed for:", e.title);
                    }}
                  />
                  {i < filteredRoadMaps.length - 1 && (
                    <View className="h-[0.5px] bg-white/30 my-4" />
                  )}
                </React.Fragment>
              ))}
            </View>
          </ScrollView>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: 16,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing(16),
    paddingBottom: getSpacing(12),
    marginVertical: getSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: getSpacing(8),
    fontSize: getFontSize(18),
    fontWeight: '600',
    color: '#fff',
  },
});
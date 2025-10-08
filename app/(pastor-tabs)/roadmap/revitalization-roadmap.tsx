import { RevitalizationCard } from "@/components/atom/cards"
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal"
import { Search } from "@/components/atom/Search"
import { Tab } from "@/components/atom/tab"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Stack, router } from "expo-router"
import React from "react"
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function RevitalizationScreen() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] = React.useState(false)
  const [searchText, setSearchText] = React.useState("")
  const [tabs, setTabs] = React.useState("All")

  const dummyRoadMaps = [
    {
      title: "Self Revitalization Phase",
      description:
        "Take a deeper look into your ministry to bring conflict resolution and theory of change.",
      time: "Completion Time Months 1 - 2",
      type: "assignment",
      read: true,
      status: "Not Started",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 18,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
    },
    {
      id: 2,
      title: "Self Revitalization Phase",
      description:
        "Take a deeper look into your ministry to bring conflict resolution and theory of change.",
      time: "Completion Time Months 1 - 2",
      type: "note",
      read: false,
      subPhase: true,
      status: "Not Started",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 8,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
      phase: "Phase 1",
    },
    {
      id: 3,
      title: "Church Empowerment Phase",
      description:
        "Create community to empower your church and make a long-term impact on coordinated community service programs.",
      time: "Completion Time Months 3 - 9",
      type: "assignment",
      read: true,
      status: "Not Started",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 18,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
      phase: "Phase 2",
    },
    {
      id: 4,
      title: "Community Revitalization and Multiplication Phase",
      description:
        "Review community service outcomes and empower others as you explore opportunities for further growth.",
      time: "Completion Time Months 10 - 12",
      type: "profile",
      read: true,
      status: "Not Started",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
      phase: "Phase 3",
    },
  ]

  const availableTabs = [
    { tab: "All" },
    { tab: "Due" },
    { tab: "Not Started" },
    { tab: "In Progress" },
    { tab: "Completed" },
    { tab: "Overdue" },
    { tab: "Pending Review" },
    { tab: "On Hold" },
  ]

  const filteredRoadMaps = dummyRoadMaps.filter((item) => {
    if (tabs === "All") return true
    return item.status === tabs
  })


  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <PastorNavigationHeader wrapperClass="mt-5" showNameTag={true} />

            {/* Header Section */}
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
                  <Text className="text-white font-semibold text-[17px]">
                    Revitalization Roadmap
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsRoadmapModalVisible(true)}>
                <Ionicons name="ellipsis-vertical" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View className="h-[0.5px] bg-white/30 mt-3" />

            {/* Search Section */}
            <View style={styles.searchContainer}>
              <Search
                searchText={searchText}
                setSearchText={setSearchText}
              />
            </View>

            {/* Tabs Section */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 8,
                marginTop: 15,
                paddingBottom: 5,
              }}
              style={{ maxHeight: 50 }}
            >
              {availableTabs.map((e, i) => (
                <Tab
                  key={i}
                  data={e}
                  tabs={tabs}
                  setTabs={setTabs}
                  onPress={() => {
                    setTabs(e.tab)
                  }}
                />
              ))}
            </ScrollView>

            {/* Content Section */}
            <View
              style={{
                marginVertical: 10,
                paddingHorizontal: 16,
                width: "100%",
              }}
            >
              {filteredRoadMaps.map((e, i) => (
                <React.Fragment key={i}>
                  <RevitalizationCard data={e} navigation={router} />
                  {i < filteredRoadMaps.length - 1 && (
                    <View className="h-[0.5px] bg-white/30 my-4" />
                  )}
                </React.Fragment>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Modal */}
        <RoadMapOutcomeModal
          isMenuVisible={isRoadmapModalVisible}
          closeMenu={() => setIsRoadmapModalVisible(false)}
        />
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
})
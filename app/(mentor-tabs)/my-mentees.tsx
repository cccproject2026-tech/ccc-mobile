import {
  MentorDetailedCard,
  MentorShortCard,
} from "@/components/build-components"
import { Mentee } from "@/components/director/MenteeCard"
import { TabSwitcher } from "@/components/director/TabSwitcher"
import MenteeMenuBottomSheet, { MenteeMenuBottomSheetRef } from "@/components/mentor/MenteeMenuBottomSheet"
import ScheduleMeetingBottomSheet, { ScheduleMeetingBottomSheetRef } from "@/components/mentor/ScheduleMeetingBottomSheet"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { useMentees } from "@/hooks/mentees/useMentees"
import { Feather, Ionicons } from "@expo/vector-icons"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { LinearGradient } from "expo-linear-gradient"
import { Stack, router } from "expo-router"
import React, { useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import MapView, { Marker } from "react-native-maps"
import { SafeAreaView } from "react-native-safe-area-context"

export default function MyMentees() {
  const [listToggle, setListToggle] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [activeTab, setActiveTab] = useState<
    "ALL" | "IN_PROGRESS" | "COMPLETED"
  >("ALL")
  const [showPhaseDropdown, setShowPhaseDropdown] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState("Self Revitalization")
  const [showMap, setShowMap] = useState(false)
  const [mapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })

  const [expandedSection, setExpandedSection] = useState<"PHASE" | "STATE" | "CONFERENCE">("PHASE")
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [selectedConference, setSelectedConference] = useState<string | null>(null)
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)

  const { mentees, isLoading, isError } = useMentees()

  // Filter mentees based on search text and active tab
  const filteredMentees = useMemo(() => {
    let filtered = mentees

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (mentee) =>
          mentee.name.toLowerCase().includes(searchLower) ||
          mentee.role?.toLowerCase().includes(searchLower) ||
          mentee.description?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by tab (note: API doesn't provide isCompleted, so this may not work until API is updated)
    if (activeTab === "COMPLETED") {
      filtered = filtered.filter((mentee) => mentee.isCompleted === true)
    } else if (activeTab === "IN_PROGRESS") {
      filtered = filtered.filter((mentee) => mentee.isCompleted !== true)
    }

    return filtered
  }, [mentees, searchText, activeTab])

  const menteeMenuRef = useRef<MenteeMenuBottomSheetRef>(null)
  const scheduleMeetingRef = useRef<ScheduleMeetingBottomSheetRef>(null)

  const phaseOptions = ["Self Revitalization", "Phase 1", "Phase 2"]

  const tabData = [
    { key: "ALL", label: "All" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "COMPLETED", label: "Completed" },
  ]

  const handleMenuPress = (mentee: Mentee) => {
    setSelectedMentee(mentee)
    menteeMenuRef.current?.present()
  }

  const closeMenu = () => {
    setSelectedMentee(null)
  }

  const handleMenuAction = (action: string, mentee: any) => {
    console.log(`Action: ${action} for mentee: ${mentee?.name}`)
    // Handle different actions here
    switch (action) {
      case "revitalization-roadmap":
        // Navigate to roadmap
        break
      case "mentor-notes":
        // Navigate to notes
        router.push({
          pathname: "/(mentor-tabs)/mentor-notes",
          params: {
            menteeId: mentee?.id,
            menteeName: mentee?.name,
          },
        })
        break
      case "assessments":
        // Navigate to assessments
        break
      case "assignments":
        // Navigate to assignments
        break
      case "track-progress":
        // Navigate to progress tracking
        break
      case "schedule-meeting":
        // Open schedule meeting bottom sheet
        scheduleMeetingRef.current?.present()
        break
      case "mark-complete":
        // Mark mentee program as complete
        break
      default:
        break
    }
  }

  const handleScheduleMeeting = (date: Date, time: string, option: string) => {
    console.log("Meeting scheduled:", {
      mentee: selectedMentee?.name,
      date: date.toDateString(),
      time,
      option,
    })
    // Here you would typically save the meeting to your backend
  }

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LinearGradient
          colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
          style={{ flex: 1 }}
        >
          <Stack.Screen options={{ headerShown: false }} />
          <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#fff" />
          </SafeAreaView>
        </LinearGradient>
      </GestureHandlerRootView>
    )
  }

  if (isError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LinearGradient
          colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
          style={{ flex: 1 }}
        >
          <Stack.Screen options={{ headerShown: false }} />
          <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
            <Text className="text-white text-center">Failed to load mentees. Please try again.</Text>
          </SafeAreaView>
        </LinearGradient>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <LinearGradient
          colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
          style={{ flex: 1 }}
        >
          <Stack.Screen options={{ headerShown: false }} />
          <SafeAreaView style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1 }}>
            <View
              style={{
                height: "100%",
                width: "100%",
                flex: 1,
              }}
            >
              <View>
                {/* Header Section */}
                <PastorNavigationHeader showNameTag />
                <View style={styles.headerContainer}>
                  <View style={styles.headerContent}>
                    <TouchableOpacity
                      onPress={() => router.back()}
                      style={styles.backButton}
                    >
                      <Image source={icons.forward} style={styles.backIcon} />
                      <Text className="text-white font-semibold text-[17px]">
                        My Mentees
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row">
                      <TouchableOpacity
                        onPress={() => setListToggle(!listToggle)}
                        style={styles.toggleButton}
                      >
                        <Image
                          source={listToggle ? icons.list : icons.grid}
                          style={styles.toggleIcon}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowMap(prev => !prev)}
                        style={styles.toggleButton}
                      >
                        <Feather name="map-pin" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Separator */}
                <View className="h-[0.5px] bg-white/30 mt-1" />

                {/* Search Section */}
                <View style={styles.searchContainer} className="mt-4">
                  <View style={styles.searchBox}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search"
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
                </View>

                {/* Tabs */}
                <View style={{ paddingHorizontal: 6, marginBottom: 12 }}>
                  <TabSwitcher
                    tabs={tabData}
                    activeTab={activeTab}
                    onChange={(key: string) => setActiveTab(key as any)}
                  />
                </View>

                {/* Quick Access Mentors (hidden when map is visible) */}
                {!showMap && (
                  <View style={styles.quickAccessContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{
                        ...styles.quickAccessScroll,
                        gap: 10,
                      }}
                    >
                      {filteredMentees.slice(0, 8).map((mentee) => (
                        <TouchableOpacity
                          key={mentee.id}
                          activeOpacity={0.85}
                          style={{ alignItems: "center" }}
                          onPress={() =>
                            router.push({
                              pathname: "/(mentor-tabs)/mentee-profile",
                              params: { menteeId: mentee.id },
                            })
                          }
                        >
                          <LinearGradient
                            colors={["#8B5CF6", "#3B82F6"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 48,
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 10,
                            }}
                          >
                            <View
                              style={{
                                width: "100%",
                                height: "100%",
                                padding: 3,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Image
                                source={icons.myProfile}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: 44,
                                }}
                                resizeMode="cover"
                              />
                            </View>
                          </LinearGradient>
                          <Text
                            style={{
                              color: "white",
                              fontWeight: "500",
                              fontSize: 12,
                              textAlign: "center",
                              marginTop: 8,
                            }}
                          >
                            {mentee.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {/* Separator */}
                <View className="h-[0.5px] bg-white/20 mx-14" />

                {/* phase select dropdown */}
                <View style={styles.filtersRow}>
                  <Text style={styles.filtersLabel}>Filters</Text>
                  <View style={{ position: "relative" }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setShowPhaseDropdown((prev) => !prev)}
                      style={styles.phasePill}
                    >
                      <Text style={styles.phasePillText}>
                        Phase :{" "}
                        <Text style={{ fontWeight: "700" }}>
                          {selectedPhase}
                        </Text>
                      </Text>
                      <Ionicons
                        name={showPhaseDropdown ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#fff"
                      />
                    </TouchableOpacity>

                    {showPhaseDropdown && (
                      <View style={styles.dropdownMenu}
                      >
                        {/* Phase Section */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.sectionHeader}
                          onPress={() => setExpandedSection(prev => prev === "PHASE" ? ("PHASE") : "PHASE")}
                        >
                          <Text style={styles.sectionTitle}>Phase</Text>
                          <View style={styles.chevronPill}>
                            <Ionicons name={expandedSection === "PHASE" ? "chevron-up" : "chevron-down"} size={14} color="#1A4882" />
                          </View>
                        </TouchableOpacity>

                        {expandedSection === "PHASE" && (
                          <View style={styles.sectionBody}
                          >
                            {[
                              "Self Revitalization",
                              "Church Empowerment",
                              "Community Revitalization and Multiplication",
                            ].map(option => (
                              <TouchableOpacity
                                key={option}
                                style={styles.optionRow}
                                onPress={() => setSelectedPhase(option)}
                              >
                                <View style={styles.radioOuter}>
                                  {selectedPhase === option && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}

                        <View style={styles.sectionDivider} />

                        {/* State Section */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.sectionHeader}
                          onPress={() => setExpandedSection(prev => prev === "STATE" ? "STATE" : "STATE")}
                        >
                          <Text style={styles.sectionTitle}>State</Text>
                          <View style={styles.chevronPill}>
                            <Ionicons name={expandedSection === "STATE" ? "chevron-up" : "chevron-down"} size={14} color="#1A4882" />
                          </View>
                        </TouchableOpacity>

                        {expandedSection === "STATE" && (
                          <View style={styles.sectionBody}>
                            {[
                              "North American",
                              "Canada",
                              "Mexico",
                              "Brazil",
                            ].map(option => (
                              <TouchableOpacity
                                key={option}
                                style={styles.optionRow}
                                onPress={() => setSelectedState(option)}
                              >
                                <View style={styles.radioOuter}>
                                  {selectedState === option && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}

                        <View style={styles.sectionDivider} />

                        {/* Conference Section */}
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.sectionHeader}
                          onPress={() => setExpandedSection(prev => prev === "CONFERENCE" ? "CONFERENCE" : "CONFERENCE")}
                        >
                          <Text style={styles.sectionTitle}>Conference</Text>
                          <View style={styles.chevronPill}>
                            <Ionicons name={expandedSection === "CONFERENCE" ? "chevron-up" : "chevron-down"} size={14} color="#1A4882" />
                          </View>
                        </TouchableOpacity>

                        {expandedSection === "CONFERENCE" && (
                          <View style={styles.sectionBody}>
                            {[
                              "East Zone",
                              "West Zone",
                              "North Zone",
                            ].map(option => (
                              <TouchableOpacity
                                key={option}
                                style={styles.optionRow}
                                onPress={() => setSelectedConference(option)}
                              >
                                <View style={styles.radioOuter}>
                                  {selectedConference === option && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.optionText}>{option}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}

                        <View style={styles.sectionDivider} />

                        {/* Clear Sort */}
                        <TouchableOpacity
                          style={[styles.optionRow, { paddingVertical: 12 }]}
                          onPress={() => {
                            setSelectedPhase("Self Revitalization")
                            setSelectedState(null)
                            setSelectedConference(null)
                          }}
                        >
                          <View style={styles.radioOuter} />
                          <Text style={styles.optionText}>Clear Sort</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {/* Map or Mentors List */}
                {showMap ? (
                  <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 24, borderRadius: 10, overflow: "hidden", height: 410 }}>
                    <MapView
                      style={{ width: "100%", height: "100%" }}
                      region={mapRegion}
                      showsUserLocation={false}
                      showsMyLocationButton={false}
                      showsCompass={true}
                      showsScale={true}
                      showsBuildings={true}
                      showsIndoors={true}
                      mapType="standard"
                    >
                      <Marker coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }} />
                    </MapView>
                  </View>
                ) : (
                  <View style={styles.mentorsListContainer} className="mt-4">
                    <View style={styles.mentorsHeader}>
                      <Text className="text-white  font-medium text-[16px]">
                        Current Mentees
                      </Text>
                    </View>

                    <View
                      style={
                        listToggle ? styles.mentorsListView : styles.mentorsGrid
                      }
                    >
                      {filteredMentees.map((mentee) => (
                        <View
                          key={mentee.id}
                          style={
                            listToggle
                              ? styles.detailedMentorCard
                              : styles.mentorCard
                          }
                        >
                          <TouchableOpacity
                            activeOpacity={0.88}
                            onPress={() =>
                              router.push({
                                pathname: "/(mentor-tabs)/mentee-profile",
                                params: { menteeId: mentee.id },
                              })
                            }
                            style={{ flex: 1 }}
                          >
                            {listToggle ? (
                              <MentorDetailedCard
                                data={mentee}
                                key={mentee.id}
                                navigation={router}
                                onMenuPress={() => handleMenuPress(mentee)}
                              />
                            ) : (
                              <MentorShortCard
                                data={mentee}
                                dataKey={mentee.id}
                                navigation={router}
                                onMenuPress={() => handleMenuPress(mentee)}
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

        {/* Mentee Menu Bottom Sheet */}
        <MenteeMenuBottomSheet
          ref={menteeMenuRef}
          mentee={selectedMentee}
          onClose={closeMenu}
          onAction={handleMenuAction}
        />

        {/* Schedule Meeting Bottom Sheet */}
        <ScheduleMeetingBottomSheet
          ref={scheduleMeetingRef}
          mentee={selectedMentee}
          onSchedule={handleScheduleMeeting}
        />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    alignItems: "center",
  },
  headerContent: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backIcon: {
    width: 18,
    height: 18,
    transform: [{ scaleX: -1 }],
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  toggleIcon: {
    width: 22,
    height: 22,
    tintColor: "white",
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
    marginVertical: 4,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
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
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "400",
  },
  quickAccessContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  quickAccessScroll: {
    paddingRight: 20,
  },
  quickAccessItem: {
    alignItems: "center",
    minWidth: 80,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  mentorsListContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  mentorsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mentorsGrid: {
    gap: 12,
  },
  mentorsListView: {
    gap: 16,
  },
  mentorCard: {
    marginBottom: 8,
  },
  detailedMentorCard: {
    marginBottom: 12,
  },
  filtersRow: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  filtersLabel: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    marginRight: 6,
  },
  phasePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  phasePillText: {
    color: "white",
    fontSize: 14,
  },
  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#EAF1F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D2E2F0",
    paddingVertical: 8,
    minWidth: 300,
    zIndex: 20,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#F2F7FB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: "#1A4882",
    fontWeight: "700",
    fontSize: 14,
  },
  chevronPill: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#9EC1DF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  sectionBody: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  optionText: {
    color: "#1A4882",
    fontSize: 14,
    flexShrink: 1,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#9EC1DF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1A4882",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#D2E2F0",
  },
})

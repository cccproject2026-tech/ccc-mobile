import {
  MentorDetailedCard,
  MentorShortCard,
} from "@/components/build-components"
import MenteeMenuBottomSheet, { MenteeMenuBottomSheetRef } from "@/components/mentor/MenteeMenuBottomSheet"
import { RoadmapSearchField, RoadmapTabStrip } from "@/components/ui/design-system"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { useMentees } from "@/hooks/mentees/useMentees"
import { getAvatarSource } from "@/utils/avatarSource"
import { useAuthStore } from "@/stores"
import { Mentee } from "@/types/mentee.types"
import { Feather } from "@expo/vector-icons"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { LinearGradient } from "expo-linear-gradient"
import { Stack, router } from "expo-router"
import React, { useCallback, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import MapView, { Marker } from "react-native-maps"
import { SafeAreaView } from "react-native-safe-area-context"
import AppGradientBackground from "@/components/layout/AppGradientBackground"

const MENTEE_PROGRESS_ROUTE =
  "/(mentor)/mentees/mentee-progress"

export default function MyMentees() {
  const [listToggle, setListToggle] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "in-progress" | "completed">("all")
  const [showMap, setShowMap] = useState(false)
  const [mapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })

  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)
  const { user } = useAuthStore()
  // Only show mentees assigned to this mentor (not all pastors)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useMentees(10, user?.id)

  const allMentees = useMemo(() => {
    return data?.pages.flatMap(page => page.mentees) ?? []
  }, [data])

  
  const filteredMentees = useMemo(() => {
    let filtered = allMentees

    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (mentee) =>
          mentee.firstName?.toLowerCase().includes(searchLower) ||
          mentee.lastName?.toLowerCase().includes(searchLower) ||
          mentee.email?.toLowerCase().includes(searchLower) ||
          mentee.role?.toLowerCase().includes(searchLower) ||
          mentee.description?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by tab (note: API doesn't provide isCompleted, so this may not work until API is updated)
    if (activeTab === "completed") {
      filtered = filtered.filter((mentee) => mentee.hasCompleted === true)
    } else if (activeTab === "in-progress") {
      filtered = filtered.filter((mentee) => mentee.hasCompleted !== true)
    }

    return filtered
  }, [allMentees, searchText, activeTab])

  const menteeMenuRef = useRef<MenteeMenuBottomSheetRef>(null)

  const tabData = [
    { key: "all", label: "All" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
  ]

  const handleMenuPress = (mentee: Mentee) => {
    setSelectedMentee(mentee)
    menteeMenuRef.current?.present()
  }

  const closeMenu = () => {
    setSelectedMentee(null)
  }

  const handleMenuAction = (action: string, mentee: any) => {
    const menteeName = `${mentee?.firstName} ${mentee?.lastName}`;
    console.log(`Action: ${action} for mentee: ${menteeName}`)

    // Use a small timeout to allow bottom sheet to start dismissing
    setTimeout(() => {
      switch (action) {
        case "revitalization-roadmap":
          router.push({
            pathname: "/(mentor)/roadmap/landing/landing" as any,
            params: {
              menteeId: mentee?.id,
              menteeName,
            },
          })
          break
        case "assessments":
          router.push({
            pathname: "/(mentor)/assessments-v2" as any,
            params: {
              menteeId: mentee?.id,
            },
          })
          break
        case "track-progress":
          router.push({
            pathname: MENTEE_PROGRESS_ROUTE as any,
            params: { menteeId: mentee?.id },
          })
          break
        case "schedule-meeting":
          router.push({
            pathname: "/(mentor)/schedule-meeting/person",
            params: {
              mode: "schedule",
              drawerContext: "mentor",
              personData: JSON.stringify({
                id: mentee?.id,
                name: menteeName,
                role: mentee?.role || "pastor",
                profilePicture: mentee?.profilePicture,
              }),
            },
          })
          break
        default:
          break
      }
    }, 300)
  }

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const renderHeader = () => (
    <View>
      {}
      <PastorNavigationHeader showNameTag tagName={user?.firstName + " " + user?.lastName || ""} />
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

      {}
      <View className="h-[0.5px] bg-white/30 mt-1" />

      {}
      <View style={styles.controlsWrap}>
        <RoadmapSearchField
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search mentees"
          dense
        />
        <RoadmapTabStrip
          tabs={tabData}
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as typeof activeTab)}
          scrollable
        />
      </View>

      {}
      {!showMap && (
        <View style={styles.quickAccessContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={allMentees.slice(0, 8)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              gap: 10,
              paddingRight: 20
            }}
            renderItem={({ item: mentee }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                style={{ alignItems: "center" }}
                onPress={() =>
                  router.push({
                    pathname: "/(mentor)/mentees/mentee-profile" as any,
                    params: { menteeId: mentee.id, email: mentee.email },
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
                      source={getAvatarSource(mentee)}
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
                  {mentee.firstName + " " + mentee.lastName}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {}
      <View className="h-[0.5px] bg-white/20 mx-14 mb-4" />

      {showMap && (
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
      )}

      {!showMap && (
        <View style={styles.mentorsHeader}>
          <Text className="text-white font-medium text-[16px] px-4">
            Current Mentees
          </Text>
        </View>
      )}
    </View>
  )

  const renderFooter = () => {
    if (!isFetchingNextPage) return null
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    )
  }

  const renderEmpty = () => {
    if (isLoading) return null
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text className="text-white text-base">No mentees found.</Text>
      </View>
    )
  }

  if (isLoading && !data) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppGradientBackground>
          <Stack.Screen options={{ headerShown: false }} />
          <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#fff" />
          </SafeAreaView>
        </AppGradientBackground>
      </GestureHandlerRootView>
    )
  }

  if (isError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppGradientBackground>
          <Stack.Screen options={{ headerShown: false }} />
          <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
            <Text className="text-white text-center">Failed to load mentees. Please try again.</Text>
          </SafeAreaView>
        </AppGradientBackground>
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AppGradientBackground>
          <Stack.Screen options={{ headerShown: false }} />
          <SafeAreaView style={{ flex: 1 }}>
            {!showMap ? (
              <FlatList
                data={filteredMentees}
                keyExtractor={(item) => item.id}
                key={listToggle ? "list" : "grid"}
                numColumns={1}
                ListHeaderComponent={renderHeader()}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                renderItem={({ item: mentee }) => (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      marginBottom: listToggle ? 12 : 8
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() =>
                        router.push({
                          pathname: "/(mentor)/mentees/mentee-profile" as any,
                          params: { menteeId: mentee.id },
                        })
                      }
                      style={{ flex: 1 }}
                    >
                      {listToggle ? (
                        <MentorDetailedCard
                          data={mentee}
                          dataKey={mentee.id}
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
                )}
                contentContainerStyle={{ paddingBottom: 60 }}
              />
            ) : (
              <ScrollView>
                {renderHeader()}
              </ScrollView>
            )}
          </SafeAreaView>
        </AppGradientBackground>

        {}
        <MenteeMenuBottomSheet
          ref={menteeMenuRef}
          mentee={selectedMentee}
          onClose={closeMenu}
          onAction={handleMenuAction}
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
  controlsWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    gap: 4,
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
})

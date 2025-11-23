import {
    AppointmentCard,
    MentorCard,
    RoadMapCard
} from "@/components/atom/cards"
import { Search } from "@/components/atom/Search"
import { Button } from "@/components/build-components"
import ExploreCard from "@/components/director/ExploreCard"
import HeaderHero from "@/components/director/HeroHeader"
import WelcomeCard from "@/components/director/WelcomeCard"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { mentorExploreItems } from "@/constants/mockData"
import { useMentors } from "@/hooks/mentors/useMentors"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import React, { useCallback, useMemo, useState } from "react"
import { Image, ScrollView, StyleSheet, Text, View } from "react-native"
import MapView, { Marker } from "react-native-maps"
import Animated, {
    useAnimatedRef,
    useScrollViewOffset,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function MentorDashboard() {
  const [searchText, setSearchText] = useState("")
  const [greetingPeriod, setGreetingPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const router = useRouter();
  const [mapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const insets = useSafeAreaInsets()
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useScrollViewOffset(scrollRef)

  const users = [
    // India
    {
      name: "Aarav",
      profilePic: "https://example.com/profiles/aarav.jpg", // Replace with actual image URL
      lat: 28.6139,
      lng: 77.209,
      color: "#FF5733",
      location: "New Delhi, India",
    },
    {
      name: "Priya",
      profilePic: "https://example.com/profiles/priya.jpg",
      lat: 19.076,
      lng: 72.8777,
      color: "#33FF57",
      location: "Mumbai, India",
    },
    // Pakistan
    {
      name: "Ali",
      profilePic: "https://example.com/profiles/ali.jpg",
      lat: 24.8607,
      lng: 67.0011,
      color: "#F39C12",
      location: "Karachi, Pakistan",
    },
    // China
    {
      name: "Wei",
      profilePic: "https://example.com/profiles/wei.jpg",
      lat: 39.9042,
      lng: 116.4074,
      color: "#E74C3C",
      location: "Beijing, China",
    },
    // Add more users as needed
  ]

  // Handle greeting period change from HeaderHero
  const handleGreetingPeriodChange = useCallback((period: 'morning' | 'afternoon' | 'evening') => {
    setGreetingPeriod(period);
  }, []);

  const greeting = useMemo(() => {
    if (greetingPeriod === 'morning') return "Good Morning"
    if (greetingPeriod === 'afternoon') return "Good Afternoon"
    return "Good Evening"
  }, [greetingPeriod])

  const dummyAppointments = [
    {
      date: "04 Aug 24",
      time: "11:30 hrs EST",
      name: "John Ross",
      role: "Mentor",
      mode: "duo",
    },
    {
      date: "11 Aug 24",
      time: "11:30 hrs EST",
      name: "John Ross",
      role: "Field Mentor",
      mode: "meet",
    },
  ]
  const dummyRoadMaps = [
    {
      phase: "Phase 1",
      title: "Revitalization RoadMap",
      status: "Due",
    },
    {
      phase: "Phase 2",
      title: "Revitalization RoadMap",
      status: "In progress",
    },
    {
      phase: "Questionnaires",
      title: "Survey",
      status: "Remaining",
    },
  ]
  
  const { mentors } = useMentors();
  const displayMentors = mentors.slice(0, 2); // Show only first 2 for reminders

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, "#1D548D", "#264387"]}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 + insets.bottom }}
        >
          <HeaderHero
            role="mentor"
            height={280}
            image={icons.backgroundImage}
            bottomBlendColor={Colors.lightBlueGradientOne}
            scrollOffset={scrollOffset}
            onGreetingPeriodChange={handleGreetingPeriodChange}
          />
          <LinearGradient
            colors={[Colors.lightBlueGradientOne, "transparent"]}
            style={{ minHeight: "100%" }}
          >
            <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 8 }}>
              <Text
                style={{ fontSize: 16, color: "#e7f6fc", fontWeight: "700" }}
              >
                {greeting}
              </Text>
              <WelcomeCard
                onClick={() => { }}
                avatar={icons.myProfile}
                message="John Doe, Welcome !"
              />
            </View>
            <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="w-full"
                contentContainerStyle={{
                  gap: 16,
                  paddingVertical: 10,
                  marginTop: 8,
                }}
              >
                <View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden">
                  <Image
                    source={icons.video}
                    className="w-full h-full rounded-[25px]"
                    resizeMode="cover"
                  />
                </View>

                <View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden">
                  <Image
                    source={icons.video}
                    className="w-full h-full rounded-[25px]"
                    resizeMode="cover"
                  />
                </View>

                <View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden">
                  <Image
                    source={icons.video}
                    className="w-full h-full rounded-[25px]"
                    resizeMode="cover"
                  />
                </View>
              </ScrollView>
            </View>
            <View style={styles.separator} />
            {/* Appointments Section */}
            <View
              style={{ paddingHorizontal: 16, marginTop: 14, marginBottom: 20 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 15, color: "#e7f6fc", fontWeight: "700" }}
                >
                  Today's Appointments
                </Text>
                <Text
                  style={{ color: "#cfe9f3", fontWeight: "600", fontSize: 13 }}
                >
                  See all
                </Text>
              </View>
              <View
                style={{
                  marginTop: 10,
                  gap: 12,
                  borderBottomColor: "#ffffff22",
                  borderBottomWidth: 1,
                  paddingBottom: 18,
                }}
              >
                {dummyAppointments.map((e, i) => (
                  <AppointmentCard
                    data={e}
                    dataKey={i.toString()}
                    type={"mentor"}
                    key={i}
                  />
                ))}
              </View>
            </View>

            <View style={styles.RoadMapContainer}>
              <View style={styles.RoadMapHeaderRow}>
                <Text className="text-white font-bold text-[17px]">
                  Roadmap List
                </Text>
                <Text className="text-white font-medium text-[16px]">
                  See all
                </Text>
              </View>
              <View className="gap-2">
                {dummyRoadMaps.map((e, i) => (
                  <RoadMapCard data={e} dataKey={i.toString()} key={i} />
                ))}
              </View>
              <View className="flex justify-end w-full">
                <Button
                  buttonClass="!w-[40%] !h-11"
                  bgColor="white"
                  textColor="#001FC1"
                >
                  Add New Entry
                </Button>
              </View>
            </View>
            <View style={styles.separator} />

            <View style={{ paddingHorizontal: 16, marginTop: 18, marginBottom: 18, gap: 8 }}>
              <Text style={{
                fontSize: 15,
                color: "#e7f6fc", fontWeight: "700"
              }}>
                Explore CCC
              </Text>

              {/* Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  rowGap: 12,
                }}
              >
                {mentorExploreItems.map((item) => (
                  <ExploreCard
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    onPress={() => {
                      if (item.title === 'Track Progress') {
                        router.push('/(mentor-tabs)/progress-tracker');
                      } else if (item.title === 'Assessment') {
                        router.push('/(mentor-tabs)/assessments-v2');
                      } else {
                        console.log(`Pressed ${item.title}`);
                      }
                    }}
                  />
                ))}
              </View>

            </View>
            <View
              style={{
                height: 2,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                marginHorizontal: 16,
                marginBottom: 20,
              }}
            />

            <View style={[styles.mentorContainer, { marginBottom: 24 }]}>
              <View style={styles.mentorHeaderContainer}>
                <Text className="text-white font-bold text-[17px]">
                  Reminders
                </Text>
                <Text className="text-white font-medium text-[16px]">
                  See all
                </Text>
              </View>
              {displayMentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  data={mentor}
                  dataKey={mentor.id}
                  onMenuPress={() => { }}
                />
              ))}
            </View>

            <View className="flex-row justify-between px-5">
              <Text className="text-white font-bold text-[17px]">
                Mentees
              </Text>
            </View>
            <View style={styles.searchContainer}>
              <Search searchText={searchText} setSearchText={setSearchText} />
            </View>
            <View className="my-2.5 mx-5 mb-32 rounded-[10px] overflow-hidden" style={{ height: 410 }}>
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
          </LinearGradient>
        </Animated.ScrollView >
      </LinearGradient >
    </>
  )
}
const styles = StyleSheet.create({
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  backgroundImage: {
    // ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: 350,
    zIndex: -1, // To ensure it goes behind other components
  },
  contentContainer: {
    height: 200,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20, // Adjust for header height
    gap: 3,
  },
  container: {
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  appointmentsContainer: {
    marginHorizontal: 16,
    marginTop: 0,
    position: "relative",
  },
  rowBetween: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  upcomingText: {
    color: "#FFFFFF", // customWhite
    fontSize: 18,
    fontFamily: "AlbertSans-Bold",
    textAlign: "center",
  },
  seeAllText: {
    color: "#FFFFFF", // customWhite
    fontSize: 14,
    fontFamily: "AlbertSans-Medium",
    textAlign: "center",
  },
  appointmentBox: {
    width: "100%",
    backgroundColor: "#14517d", // customBlueOne
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)", // customWhiteEighty
    marginBottom: 16,
  },
  appointmentImage: {
    width: "100%",
    height: 100,
    borderRadius: 16,
    flex: 1,
  },
  appointmentDetails: {
    marginLeft: 10,
    flex: 1,
    gap: 4,
  },
  dateTimeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "AlbertSans-Medium",
  },
  timeText: {
    color: "#FFC107", // customYellow
    fontFamily: "AlbertSans-Medium",
    marginHorizontal: 4,
  },
  mentorInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  mentorImage: {
    width: 20,
    height: 20,
    borderRadius: 50,
    marginRight: 8,
  },
  mentorNameText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "AlbertSans-SemiBold",
    marginTop: 4,
  },
  modeText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 4,
  },
  modeBoldText: {
    fontFamily: "AlbertSans-SemiBold",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 8,
  },
  iconStyle: {
    width: 18,
    height: 18,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // customWhiteTwenty
    marginHorizontal: 16,
    marginVertical: 18,
  },
  RoadMapContainer: {
    gap: 16,
    position: "relative",
    marginHorizontal: 16,
    marginTop: 0,
  },

  RoadMapHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  RoadMapTitleText: {
    color: "#FFFFFF", // customWhite
    fontSize: 18,
    fontFamily: "AlbertBold",
    textAlign: "center",
  },
  RoadMapSeeAllText: {
    color: "#FFFFFF", // customWhite
    fontSize: 14,
    fontFamily: "AlbertMedium",
    textAlign: "center",
  },

  ExploreContainer: {
    marginHorizontal: 16, // mx-4
    marginTop: 0, // mt-0
  },
  headerExploreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerExploreText: {
    color: "#FFFFFF", // text-customWhite
    fontSize: 18, // text-lg
    fontFamily: "AlbertBold", // font-albertBold
    textAlign: "center",
  },
  ExploreBoxContainer: {
    // flex: 1,
    padding: 20, // p-5
    paddingHorizontal: 16, // px-4
  },
  ExploreBoxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12, // mb-3
  },
  ExploreBoxRowTwo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  mentorContainer: {
    marginHorizontal: 16, // mx-4
    gap: 8, // gap-2
    position: "relative",
  },
  mentorHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mentorHeaderText: {
    color: "#FFFFFF", // text-customWhite
    fontSize: 18, // text-lg
    fontFamily: "AlbertBold", // font-albertBold
    textAlign: "center",
  },
})



import {
  AppointmentCard,
  CardBox,
  MentorCard,
  RoadMapCard,
} from "@/components/atom/cards";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PastorDashboard({ navigation }: { navigation: any }) {
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
  ];
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert 24-hour format to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // If hour is 0, show 12

    // Add leading zero to minutes if needed
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours} : ${formattedMinutes} ${ampm}`;
  };
  const greeting = () => {
    const currentHour = new Date().getHours();
    let greeting;

    // Determine the greeting based on the current hour
    if (currentHour < 12) {
      greeting = "Good Morning";
    } else if (currentHour < 18) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }
    return greeting;
  };

  let greetingMessage = greeting();

  const getCurrentDayAndDate = () => {
    const now = new Date();

    // Arrays for days and months
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get day, month, and date
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();

    return `${day}, ${month} ${date}`;
  };

  // Example usage
  const currentDayAndDate = getCurrentDayAndDate();
  console.log(currentDayAndDate); // e.g., "Tuesday, Sep 23"

  // Example usage
  const currentTime = getCurrentTime();
  console.log(currentTime); // e.g., "12:00 PM"

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
  ];
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
  ];
  const dummyMentors = [
    {
      name: "John Doe",
      role: "Mentor",
    },
    {
      name: "John Doe",
      role: "Field Mentor",
    },
  ];

  return (
    <>
      {/* <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      > */}
      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ScrollView contentContainerStyle={styles.container}>
          <ImageBackground
            source={icons.backgroundImage}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <View className="mt-4">
              <PastorNavigationHeader />
            </View>
            <View style={styles.contentContainer}>
              <Text  className="text-white text-[22px] leading-[22px] font-semibold">
                {currentTime}
              </Text>
              <Text className="text-base leading-[22px] text-white font-semibold">
                {currentDayAndDate}
              </Text>
            </View>
            <View></View>
            <View style={{ marginHorizontal: 16, paddingVertical: 10 }}>
              <Text
                className="font-bold"
                style={[styles.text, { ...{ paddingVertical: 10 } }]}
              >
                {greetingMessage}
              </Text>
              <View
                style={{
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "white",
                  borderRadius: 10,
                  height: 90,
                  padding: 10,
                  flexDirection: "row",
                  backgroundColor: "#14517d",
                }}
              >
                <Image
                  source={icons.myProfile} // Replace with actual user profile image URL
                  style={{ width: 60, height: 60 }}
                  resizeMode="contain"
                />
                <View style={{ paddingHorizontal: 10, gap: 10 }}>
                  <Text
                    className="font-semibold"
                    style={[styles.text, { ...{ fontSize: 16 } }]}
                  >
                    John Ross, Welcome Aboard!
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text className="font-medium text-white text-[16px]">
                      Progress{" "}
                    </Text>
                    <View
                      style={{
                        backgroundColor: "black",
                        //   borderWidth: 4,
                        borderRadius: 10,
                        width: "50%",
                        //   borderColor: "white",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "white",
                          width: "70%",
                          height: 6,
                          borderRadius: 10,
                        }}
                      ></View>
                    </View>
                    <Text style={[styles.text, { ...{ fontSize: 16 } }]}>
                      {" "}
                      70%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
          <View
            style={{
              backgroundColor: "#196394",
              height: "100%",
              width: "100%",
            }}
          >
            <LinearGradient
              colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
              style={{ flex: 1 }}
            >
              <View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="w-full"
                  contentContainerStyle={{
                    paddingHorizontal: 20,
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
                <View style={styles.separator} />
                {/* Appointments Section   */}
                <View style={styles.appointmentsContainer}>
                  <View style={styles.rowBetween}>
                    <Text className="text-white font-bold text-[17px]">
                      Upcoming Appointments
                    </Text>
                    <Text className="text-white font-medium text-[16px]">
                      See all
                    </Text>
                  </View>
                  {dummyAppointments.map((e, i) => (
                    <AppointmentCard data={e} dataKey={i.toString()} key={i} />
                  ))}
                </View>
                <View style={styles.separator} />
                {/* Road Maps Section */}

                <View style={styles.RoadMapContainer}>
                  <View style={styles.RoadMapHeaderRow}>
                    <Text className="text-white font-bold text-[17px]">
                      Today's Roadmap List
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
                </View>
                <View style={styles.separator} />

                {/* Explore CCC section  */}

                <View style={styles.ExploreContainer}>
                  <View style={styles.headerExploreContainer}>
                    <Text className="text-white font-bold text-[16px]">
                      Explore CCC
                    </Text>
                  </View>

                  <View className="py-5 px-2 w-full justify-center items-center">
                    <View className="flex-row gap-4">
                      <CardBox
                        title="Revitalization Roadmap"
                        icon={icons.Revitalization2}
                      />
                      <CardBox title="Assessments" icon={icons.Assessments2} />
                    </View>
                    <View className="flex-row gap-4">
                      <CardBox title="Progress" icon={icons.progress2} />
                      <CardBox
                        title="Appointments"
                        icon={icons.Appointments2}
                      />
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    height: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.2)", // customWhiteTwenty
                    marginHorizontal: 16,
                    marginBottom: 20,
                  }}
                />

                <View style={styles.mentorContainer}>
                  <View style={styles.mentorHeaderContainer}>
                    <Text className="text-white font-bold text-[17px]">
                      My Mentors
                    </Text>
                    <Text className="text-white font-medium text-[16px]">
                      See all
                    </Text>
                  </View>
                  {dummyMentors.map((e, i) => (
                    <MentorCard
                      key={i}
                      data={e}
                      dataKey={i.toString()}
                      navigation={navigation}
                      onMenuPress={() => { }}
                    />
                  ))}
                </View>
                <View style={styles.separator} />
              </View>
            </LinearGradient>
            {/* other content  */}
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* </LinearGradient> */}
    </>
  );
}
const styles = StyleSheet.create({
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
    flex: 1,
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
});

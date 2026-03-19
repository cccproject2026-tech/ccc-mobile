import RoadMapCardNew from "@/components/atom/RoadMapCard";
import AppointmentCard from "@/components/director/AppointmentCard";
import ExploreCard from "@/components/director/ExploreCard";
import HeaderHero from "@/components/director/HeroHeader";
import MentorCard from "@/components/director/MentorCard";
import WelcomeCard from "@/components/director/WelcomeCard";
import PastorFocusBottomSheet, {
  PastorFocusItem,
} from "@/components/sheets/PastorFocusBottomSheet";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { Mentor } from "@/hooks/mentors/useMentors";
import { usePastorFocusItems } from "@/hooks/pastor/usePastorFocusItems";
import { useProfile } from "@/hooks/profile/useProfile";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { useAuthStore } from "@/stores";
import { AppointmentPlatform } from "@/types/appointment.types";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { Route, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedRef,
  useScrollViewOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PastorDashboard() {
  const [greetingPeriod, setGreetingPeriod] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pastorFocusSheetRef = useRef<BottomSheetModal>(null);
  const appStateRef = useRef(AppState.currentState);
  const hasPresentedForSessionRef = useRef(false);
  const pendingSheetOpenRef = useRef(true);

  const { user } = useAuthStore();

  const { data, isLoading, isError, error } = useProfile();
  const { mentors, isEmpty } = useAssignedMentors(user?.id as string);
  const { sections: focusSections, isLoading: isFocusLoading } =
    usePastorFocusItems();

  const handleCall = (mentor: Mentor) => {
    if (!mentor.phoneNumber) {
      return Alert.alert("Phone number not available");
    }
    const url = `tel:${mentor.phoneNumber}`;
    Linking.openURL(url);
  };

  const handleChat = (mentor: Mentor) => {
    if (!mentor.phoneNumber) {
      return Alert.alert("Phone number not available");
    }
    const url = `sms:${mentor.phoneNumber}`;
    Linking.openURL(url);
  };

  const handleMail = async (mentor: Mentor) => {
    if (!mentor.email) {
      return Alert.alert("Email not available");
    }

    const gmailApp = `googlegmail://co?to=${mentor.email}`;
    const gmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${mentor.email}`;

    try {
      // Try Gmail app first
      const canOpenGmail = await Linking.canOpenURL(gmailApp);
      if (canOpenGmail) {
        console.log("Opening Gmail app");
        await Linking.openURL(gmailApp);
        return;
      }

      // Always open Gmail Web as fallback (100% works)
      console.log("Opening Gmail web");
      await Linking.openURL(gmailWeb);
    } catch (error) {
      console.log("Mail open error:", error);
      // Final fallback: Gmail web again (just in case)
      await Linking.openURL(gmailWeb);
    }
  };

  const handleWhatsApp = async (mentor: Mentor) => {
    if (!mentor.phoneNumber) {
      return Alert.alert("Phone number not available");
    }

    const url = `whatsapp://send?phone=${mentor.phoneNumber}`;

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      // Fallback to WhatsApp web
      return Linking.openURL(`https://wa.me/${mentor.phoneNumber}`);
    }

    Linking.openURL(url);
  };
  // Fetch appointments
  const {
    appointments: allAppointments,
    isLoading: isAppointmentsLoading,
    getUpcomingAppointments,
  } = useAppointments({ userId: user?.id });

  // Fetch roadmaps
  const { data: roadmaps, isLoading: isRoadmapsLoading } =
    useRoadmaps("pastor");

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const handleWelcomeRoute = () => {
    router.push("/(pastor)/(tabs)/profile");
  };

  // Handle greeting period change from HeaderHero
  const handleGreetingPeriodChange = useCallback(
    (period: "morning" | "afternoon" | "evening") => {
      setGreetingPeriod(period);
    },
    [],
  );

  const handleScheduleAppointment = (mentor: Mentor) => {
    console.log("Schedule appointment with", mentor.name);
    router.push({
      pathname: "/(pastor)/(tabs)/mentors/schedule-meeting",
      params: { mentorData: JSON.stringify(mentor) },
    });
  };

  const handleCardPress = (mentor: Mentor) => {
    router.push({
      pathname: "/(pastor)/(tabs)/mentors/schedule-meeting",
      params: { mentorData: JSON.stringify(mentor) },
    });
  };

  const greeting = useMemo(() => {
    if (greetingPeriod === "morning") return "Good Morning";
    if (greetingPeriod === "afternoon") return "Good Afternoon";
    return "Good Evening";
  }, [greetingPeriod]);

  // Format time for appointments
  const formatTimeIST = useCallback((isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  // Get platform icon
  const getPlatformIcon = useCallback((mode: AppointmentPlatform) => {
    const iconsMap: Record<AppointmentPlatform, any> = {
      zoom: icons.duoMeet,
      google_meet: icons.googleMeet,
      teams: icons.duoMeet,
      phone: icons.phone,
      in_person: icons.profile,
    };
    return iconsMap[mode];
  }, []);

  // Get mode label
  const getModeLabel = useCallback((mode: AppointmentPlatform): string => {
    const labels: Record<AppointmentPlatform, string> = {
      zoom: "Zoom",
      google_meet: "Google Meet",
      teams: "Teams",
      phone: "Phone call",
      in_person: "In Person",
    };
    return labels[mode];
  }, []);

  // Get upcoming appointments (limit to 3 for dashboard)
  const upcomingAppointments = useMemo(() => {
    if (!allAppointments || allAppointments.length === 0) return [];
    const upcoming = getUpcomingAppointments();
    return upcoming.slice(0, 3).map((apt) => {
      const mentor = mentors.find((m) => m.id === apt.mentorId);
      return {
        id: apt.id,
        date: apt.meetingDate.split("T")[0],
        time: formatTimeIST(apt.meetingDate),
        tz: "EST",
        person: mentor?.name || "Mentor",
        role: mentor?.role || "Mentor",
        mode: getModeLabel(apt.platform),
        icon: getPlatformIcon(apt.platform),
        appointment: apt,
      };
    });
  }, [
    allAppointments,
    mentors,
    getUpcomingAppointments,
    formatTimeIST,
    getModeLabel,
    getPlatformIcon,
  ]);

  // Transform roadmaps for RoadMapCard (limit to 3 for dashboard)
  const dashboardRoadmaps = useMemo(() => {
    if (!roadmaps || roadmaps.length === 0) return [];
    return roadmaps.slice(0, 3).map((roadmap) => {
      // Map roadmap status to card status
      let status = "Remaining";
      if (roadmap.status === "completed") {
        status = "Completed";
      } else if (roadmap.status === "in-progress") {
        status = "In progress";
      } else if (roadmap.status === "not started") {
        status = "Not Started";
      }

      return {
        phase: roadmap.phase || "Phase",
        title: roadmap.name || "Roadmap",
        status: status,
        roadmapId: roadmap._id,
      };
    });
  }, [roadmaps]);

  const presentFocusSheet = useCallback(() => {
    if (hasPresentedForSessionRef.current) return;
    if (!pastorFocusSheetRef.current) return;

    pastorFocusSheetRef.current.present();
    hasPresentedForSessionRef.current = true;
    pendingSheetOpenRef.current = false;
  }, []);

  const setPastorFocusSheetRef = useCallback(
    (instance: BottomSheetModal | null) => {
      pastorFocusSheetRef.current = instance;

      if (
        instance &&
        !hasPresentedForSessionRef.current &&
        pendingSheetOpenRef.current
      ) {
        requestAnimationFrame(() => {
          presentFocusSheet();
        });
      }
    },
    [presentFocusSheet],
  );

  useEffect(() => {
    pendingSheetOpenRef.current = true;
    const timer = setTimeout(() => {
      presentFocusSheet();
    }, 30);
    return () => clearTimeout(timer);
  }, [presentFocusSheet]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const wasInBackground = /inactive|background/.test(appStateRef.current);

      if (wasInBackground && nextState === "active") {
        hasPresentedForSessionRef.current = false;
        pendingSheetOpenRef.current = true;
        setTimeout(() => {
          presentFocusSheet();
        }, 30);
      }

      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [presentFocusSheet]);

  const handleFocusItemPress = useCallback(
    (item: PastorFocusItem) => {
      pastorFocusSheetRef.current?.dismiss();

      setTimeout(() => {
        router.push({
          pathname: item.route.pathname as any,
          params: item.route.params,
        });
      }, 220);
    },
    [router],
  );

  const screenContent = isLoading ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.lightBlueGradientOne,
      }}
    >
      <ActivityIndicator size="large" color={Colors.customWhite} />
      <Text style={{ color: Colors.customWhite, marginTop: 12 }}>
        Loading your dashboard...
      </Text>
    </View>
  ) : isError ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ color: Colors.customWhite, textAlign: "center" }}>
        Failed to load profile data: {error?.message || "Unknown error"}
      </Text>
      <Pressable
        onPress={() => router.replace("/(unauthenticated)")}
        style={{
          marginTop: 20,
          padding: 12,
          backgroundColor: Colors.customBlueOne,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: Colors.customWhite }}>Return to Login</Text>
      </Pressable>
    </View>
  ) : (
    <Animated.ScrollView
      ref={scrollRef}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 16 + insets.bottom,
      }}
    >
      <HeaderHero
        height={280}
        image={icons.backgroundImage}
        bottomBlendColor={Colors.lightBlueGradientOne}
        scrollOffset={scrollOffset}
        role="pastor"
        onGreetingPeriodChange={handleGreetingPeriodChange}
      />

      <LinearGradient
        colors={[Colors.lightBlueGradientOne, "transparent"]}
        style={{ minHeight: "100%" }}
      >
        <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 8 }}>
          <Text style={{ fontSize: 16, color: "#e7f6fc", fontWeight: "700" }}>
            {greeting}
          </Text>
          <WelcomeCard
            onClick={handleWelcomeRoute}
            avatar={icons.myProfile}
            message={`${data?.user?.firstName} ${data?.user?.lastName}, Welcome!`}
            progress={data?.progress?.overallProgress ?? 0}
          />
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.videoScrollView}
            contentContainerStyle={styles.videoContentContainer}
          >
            {[...Array(3)].map((_, i) => (
              <View key={i} style={styles.videoCard}>
                <Image
                  source={icons.video}
                  style={styles.videoImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.separator} />

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
              Upcoming Appointments
            </Text>
            <Pressable
              onPress={() =>
                router.push("/(pastor)/(tabs)/(appointments)/appointments")
              }
            >
              <Text
                style={{ color: "#cfe9f3", fontWeight: "600", fontSize: 13 }}
              >
                See all
              </Text>
            </Pressable>
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
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((a) => (
                <TouchableOpacity
                  key={a.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push(
                      "/(pastor)/(tabs)/(appointments)/appointments",
                    )
                  }
                >
                  <AppointmentCard
                    date={a.date}
                    time={a.time}
                    tz={a.tz}
                    person={a.person}
                    role={a.role}
                    mode={a.mode}
                    platformIcon={a.icon}
                    avatar={icons.myProfile}
                    onPressChevron={() => { }}
                    onCall={() => { }}
                    onChat={() => { }}
                    onMail={() => { }}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 14 }}
                >
                  No upcoming appointments
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.RoadMapContainer}>
          <View style={styles.RoadMapHeaderRow}>
            <Text style={styles.roadmapTitle}>Today's Roadmap List</Text>
            <Pressable
              onPress={() => router.push("/(pastor)/(tabs)/(roadmap)/roadmap")}
            >
              <Text style={styles.roadmapSeeAll}>See all</Text>
            </Pressable>
          </View>
          <View style={styles.roadmapList}>
            {dashboardRoadmaps.length > 0 ? (
              dashboardRoadmaps.map((e, i) => (
                <TouchableOpacity
                  key={e.roadmapId || i}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (e.roadmapId) {
                      router.push(
                        `/(pastor)/(tabs)/(roadmap)/roadmap/${e.roadmapId}`,
                      );
                    }
                  }}
                >
                  <RoadMapCardNew data={e} dataKey={i.toString()} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Text
                  style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 14 }}
                >
                  No roadmaps assigned
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.ExploreContainer}>
          <View style={styles.headerExploreContainer}>
            <Text style={styles.exploreTitle}>Explore CCC</Text>
          </View>
          <View style={styles.exploreBoxWrapper}>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                rowGap: 12,
              }}
            >
              {[
                {
                  title: "Revitalization Roadmap",
                  icon: icons.Revitalization2,
                  route: "/(pastor)/(tabs)/roadmap",
                },
                {
                  title: "Assessments",
                  icon: icons.Assessments2,
                  route: "/(pastor)/(tabs)/assessments",
                },
                {
                  title: "Progress",
                  icon: icons.progress2,
                  route: "/(pastor)/(tabs)/progress",
                },
                {
                  title: "Appointments",
                  icon: icons.Appointments2,
                  route: "/(pastor)/(tabs)/appointments",
                },
              ].map((item, idx) => (
                <ExploreCard
                  key={idx}
                  icon={item.icon}
                  route={item.route as Route}
                  title={item.title}
                  wrapperStyle={{ width: "48%" }}
                />
              ))}
            </View>
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
            <Text style={styles.mentorTitle}>My Mentors</Text>
            <Pressable onPress={() => router.push("/(pastor)/(tabs)/mentors")}>
              <Text style={styles.mentorSeeAll}>See all</Text>
            </Pressable>
          </View>
          {mentors.map((e, i) => (
            <MentorCard
              key={i}
              mentor={e}
              layout="list"
              onMail={() => handleMail(e as Mentor)}
              onWhatsApp={() => handleWhatsApp(e as Mentor)}
              onCall={() => handleCall(e as Mentor)}
              onChat={() => handleChat(e as Mentor)}
              onPress={() => handleCardPress(e as Mentor)}
              menuItems={[
                {
                  key: "schedule",
                  title: "Schedule Appointment",
                  icon: { ios: "calendar", android: "ic_menu_today" },
                  onSelect: () => handleScheduleAppointment(e as Mentor),
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>
    </Animated.ScrollView>
  );

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, "#1D548D", "#264387"]}
        style={{ flex: 1 }}
      >
        {screenContent}

        <PastorFocusBottomSheet
          ref={setPastorFocusSheetRef}
          sections={focusSections}
          isLoading={isLoading || isFocusLoading}
          onSelectItem={handleFocusItemPress}
        />
      </LinearGradient>
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
    gap: 16,
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

  // --- NEW STYLES CONVERTED FROM TAILWIND ---

  // For ScrollView className="w-full"
  videoScrollView: {
    width: "100%",
  },
  // For contentContainerStyle={{ gap: 16, paddingVertical: 10, marginTop: 8 }}
  videoContentContainer: {
    gap: 16,
    paddingVertical: 10,
    marginTop: 8,
  },
  // For View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden"
  videoCard: {
    width: 313,
    height: 183,
    borderRadius: 25,
    overflow: "hidden",
  },
  // For Image className="w-full h-full rounded-[25px]"
  videoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
  },

  // Roadmap Section
  roadmapTitle: {
    // text-white font-bold text-[17px]
    color: "white",
    fontWeight: "700",
    fontSize: 17,
  },
  roadmapSeeAll: {
    // text-white font-medium text-[16px]
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
  roadmapList: {
    // gap-2
    gap: 8,
  },

  // Explore Section
  exploreTitle: {
    // text-white font-bold text-[16px]
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  exploreBoxWrapper: {
    // items-center justify-center w-full px-2 py-5
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    // paddingHorizontal: 8, // px-2
    paddingVertical: 20, // py-5
  },
  exploreRow: {
    // flex-row gap-4
    flexDirection: "row",
    gap: 16, // gap-4
  },

  // Mentor Section
  mentorTitle: {
    // text-white font-bold text-[17px]
    color: "white",
    fontWeight: "700",
    fontSize: 17,
  },
  mentorSeeAll: {
    // text-white font-medium text-[16px]
    color: "white",
    fontWeight: "500",
    fontSize: 16,
  },
});

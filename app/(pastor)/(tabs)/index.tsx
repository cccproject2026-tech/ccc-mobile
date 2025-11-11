import RoadMapCardNew from '@/components/atom/RoadMapCard';
import AppointmentCard from '@/components/director/AppointmentCard';
import ExploreCard from "@/components/director/ExploreCard";
import HeaderHero from "@/components/director/HeroHeader";
import MentorCard, { MentorData } from "@/components/director/MentorCard";
import WelcomeCard from "@/components/director/WelcomeCard";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useProfile } from '@/hooks/profile/useProfile';
import { useAuthStore } from '@/stores';
import { formatClock, formatDate } from "@/utils/date";
import { LinearGradient } from "expo-linear-gradient";
import { Route, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image, Pressable, ScrollView, StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { useAnimatedRef, useScrollViewOffset } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PastorDashboard() {
  const [now, setNow] = useState(new Date());
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user } = useAuthStore();
  const { data, isLoading, isError, error } = useProfile();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const handleWelcomeRoute = () => {
    router.push('/(pastor)/(tabs)/profile');
  };

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, [now]);

  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.lightBlueGradientOne }}>
        <ActivityIndicator size="large" color={Colors.customWhite} />
        <Text style={{ color: Colors.customWhite, marginTop: 12 }}>Loading your dashboard...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: Colors.customWhite, textAlign: 'center' }}>
          Failed to load profile data: {error?.message || 'Unknown error'}
        </Text>
        <Pressable
          onPress={() => router.replace('/(unauthenticated)')}
          style={{ marginTop: 20, padding: 12, backgroundColor: Colors.customBlueOne, borderRadius: 8 }}
        >
          <Text style={{ color: Colors.customWhite }}>Return to Login</Text>
        </Pressable>
      </View>
    );
  }

  // if (!data?.user) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <Text style={{ color: Colors.customWhite }}>No profile data available.</Text>
  //     </View>
  //   );
  // }

  const dummyRoadMaps = [
    { phase: 'Phase 1', title: 'Revitalization RoadMap', status: 'Due' },
    { phase: 'Phase 2', title: 'Revitalization RoadMapRevitaliza', status: 'In progress' },
    { phase: 'Questionnaires', title: 'Survey', status: 'Remaining' },
  ];

  const mockMentors: MentorData[] = [
    { id: '1', name: 'John Ross', role: 'Mentor', profileImage: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', name: 'John Ross', role: 'Field Mentor', profileImage: 'https://randomuser.me/api/portraits/men/2.jpg' },
  ];

  const appointments = [
    {
      id: '1',
      date: '2025-11-09',
      time: '10:00 AM',
      tz: 'IST',
      person: 'Alex',
      role: 'Advisor',
      mode: 'Online',
      icon: icons.video,
    },
  ];

  return (
    <LinearGradient colors={[Colors.lightBlueGradientOne, '#1D548D', '#264387']} style={{ flex: 1 }}>
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
          clock={formatClock(now)}
          date={formatDate(now)}
          scrollOffset={scrollOffset}
          role="pastor"
        />

        <LinearGradient colors={[Colors.lightBlueGradientOne, 'transparent']} style={{ minHeight: '100%' }}>
          <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 8 }}>
            <Text style={{ fontSize: 16, color: '#e7f6fc', fontWeight: '700' }}>{greeting}</Text>
            <WelcomeCard
              onClick={handleWelcomeRoute}
              avatar={icons.myProfile}
              message={`${data?.user?.firstName} ${data?.user?.lastName}, Welcome!`}
              progress={data?.progress?.completed || 0}
            />
          </View>

          {/* Video Section */}
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.videoScrollView}
              contentContainerStyle={styles.videoContentContainer}
            >
              {[...Array(3)].map((_, i) => (
                <View key={i} style={styles.videoCard}>
                  <Image source={icons.video} style={styles.videoImage} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.separator} />

          {/* Upcoming Appointments */}
          <View style={{ paddingHorizontal: 16, marginTop: 14, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, color: '#e7f6fc', fontWeight: '700' }}>Upcoming Appointments</Text>
              <Pressable>
                <Text style={{ color: '#cfe9f3', fontWeight: '600', fontSize: 13 }}>See all</Text>
              </Pressable>
            </View>

            <View style={{ marginTop: 10, gap: 12, borderBottomColor: '#ffffff22', borderBottomWidth: 1, paddingBottom: 18 }}>
              {appointments.map((a) => (
                <TouchableOpacity key={a.id} activeOpacity={0.8} onPress={() => router.push('/appointments')}>
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
              ))}
            </View>
          </View>

          {/* Roadmap Section */}
          <View style={styles.RoadMapContainer}>
            <View style={styles.RoadMapHeaderRow}>
              <Text style={styles.roadmapTitle}>Today's Roadmap List</Text>
              <Text style={styles.roadmapSeeAll}>See all</Text>
            </View>
            <View style={styles.roadmapList}>
              {dummyRoadMaps.map((e, i) => (
                <RoadMapCardNew data={e} dataKey={i.toString()} key={i} />
              ))}
            </View>
          </View>

          <View style={styles.separator} />

          {/* Explore Section */}
          <View style={styles.ExploreContainer}>
            <View style={styles.headerExploreContainer}>
              <Text style={styles.exploreTitle}>Explore CCC</Text>
            </View>
            <View style={styles.exploreBoxWrapper}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }}>
                {[
                  { title: 'Revitalization Roadmap', icon: icons.Revitalization2, route: '/(pastor)/(tabs)/roadmap' },
                  { title: 'Assessments', icon: icons.Assessments2, route: '/(pastor)/(tabs)/assessments' },
                  { title: 'Progress', icon: icons.progress2, route: '/(pastor)/(tabs)/progress' },
                  { title: 'Appointments', icon: icons.Appointments2, route: '/(pastor)/(tabs)/appointments' },
                ].map((item, idx) => (
                  <ExploreCard key={idx} icon={item.icon} route={item.route as Route} title={item.title} wrapperStyle={{ width: '48%' }} />
                ))}
              </View>
            </View>
          </View>

          <View style={{ height: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginHorizontal: 16, marginBottom: 20 }} />

          {/* Mentors Section */}
          <View style={[styles.mentorContainer, { marginBottom: 24 }]}>
            <View style={styles.mentorHeaderContainer}>
              <Text style={styles.mentorTitle}>My Mentors</Text>
              <Text style={styles.mentorSeeAll}>See all</Text>
            </View>
            {mockMentors.map((e, i) => (
              <MentorCard key={i} mentor={e} layout="list" onMenuPress={() => { }} />
            ))}
          </View>
        </LinearGradient>
      </Animated.ScrollView>
    </LinearGradient>
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
    width: '100%',
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
    overflow: 'hidden',
  },
  // For Image className="w-full h-full rounded-[25px]"
  videoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },

  // Roadmap Section
  roadmapTitle: { // text-white font-bold text-[17px]
    color: 'white',
    fontWeight: '700',
    fontSize: 17,
  },
  roadmapSeeAll: { // text-white font-medium text-[16px]
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  roadmapList: { // gap-2
    gap: 8,
  },

  // Explore Section
  exploreTitle: { // text-white font-bold text-[16px]
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  exploreBoxWrapper: { // items-center justify-center w-full px-2 py-5
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // paddingHorizontal: 8, // px-2
    paddingVertical: 20, // py-5
  },
  exploreRow: { // flex-row gap-4
    flexDirection: 'row',
    gap: 16, // gap-4
  },

  // Mentor Section
  mentorTitle: { // text-white font-bold text-[17px]
    color: 'white',
    fontWeight: '700',
    fontSize: 17,
  },
  mentorSeeAll: { // text-white font-medium text-[16px]
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  }
});
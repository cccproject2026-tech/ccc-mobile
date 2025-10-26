import ActionCardList from "@/components/director/ActionCard";
import AddUserCard from "@/components/director/AddUserCard";
import AppointmentCard from "@/components/director/AppointmentCard";
import ExploreCard from "@/components/director/ExploreCard";
import GraduateStatusPieChart from "@/components/director/GraduateStatusPieChart";
import HeaderHero from "@/components/director/HeroHeader";
import InterestCard from "@/components/director/InterestCard";
import MentorMenteeList from "@/components/director/MentorMenteeList";
import MonthlyTrendsChart from "@/components/director/MonthlyTrends";
import StatCard from "@/components/director/StatCard";
import UserAddedConfirmationModal from "@/components/director/UserAddedModal";
import WelcomeCard from "@/components/director/WelcomeCard";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import {
  appointments,
  exploreItems,
  newInterests,
  stats,
} from "@/constants/mockData";
import { formatClock, formatDate } from "@/utils/date";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedRef,
  useScrollViewOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 280;

export default function DirectorDashboard() {
  const [now, setNow] = useState(new Date());
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedUser, setAddedUser] = useState({ name: "", role: "" });

  const handleUserAdded = (name: string, role: string) => {
    setAddedUser({ name, role });
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleAssign = () => {
    setShowConfirmation(false);
    // Navigate to assignment screen
  };

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  }, [now]);

  const handleWelcomRoute = () => {
    router.push("/(director-tabs)/(tabs)/profile");
  };

  const topColor = Colors.lightBlueGradientOne;

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <View style={{ flex: 1, backgroundColor: Colors.lightBlueGradientOne }}>
        <Animated.ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 16 + insets.bottom,
          }}
        >
          <HeaderHero
            height={HEADER_HEIGHT}
            image={icons.backgroundImage}
            bottomBlendColor={topColor}
            clock={formatClock(now)}
            date={formatDate(now)}
            scrollOffset={scrollOffset}
          />

          <LinearGradient
            colors={["transparent", Colors.darkBlueGradientOne]}
            style={{ minHeight: "100%" }}
          >
            <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 8 }}>
              <Text style={[styles.sectionTitle, { fontSize: 16 }]}>
                {greeting}
              </Text>
              <WelcomeCard
                onClick={handleWelcomRoute}
                avatar={icons.myProfile}
                message="David Roe, Welcome !"
              />
            </View>

            <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={[styles.sectionTitle, { fontSize: 15 }]}>
                  Today&apos;s Appointments
                </Text>
                <Pressable>
                  <Text
                    style={{
                      color: "#cfe9f3",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
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
                {appointments.map((a) => (
                  <AppointmentCard
                    key={a.id}
                    date={a.date}
                    time={a.time}
                    tz={a.tz}
                    person={a.person}
                    mode={a.mode}
                    platformIcon={a.icon}
                    avatar={icons.myProfile}
                    onPressChevron={() => {}}
                    onCall={() => {}}
                    onChat={() => {}}
                    onMail={() => {}}
                  />
                ))}
              </View>
            </View>
            <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text style={[styles.sectionTitle, { fontSize: 15 }]}>
                    New Interests
                  </Text>
                  <View
                    style={{
                      backgroundColor: "#EAF7FF",
                      borderRadius: 10,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      minWidth: 24,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#164d62",
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      {newInterests.length}
                    </Text>
                  </View>
                </View>
                <Pressable>
                  <Text
                    style={{
                      color: "#cfe9f3",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
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
                {newInterests.map((interest) => (
                  <InterestCard
                    key={interest.id}
                    data={interest}
                    onCall={() => console.log("Call", interest.name)}
                    onChat={() => console.log("Chat", interest.name)}
                    onMail={() => console.log("Mail", interest.name)}
                    onPress={() => console.log("View", interest.name)}
                  />
                ))}
              </View>
            </View>
            <View
              style={{
                paddingHorizontal: 16,
                marginTop: 16,
              }}
            >
              <View
                style={{
                  borderBottomColor: "#ffffff22",
                  borderBottomWidth: 1,
                  paddingBottom: 18,
                }}
              >
                <AddUserCard onUserAdded={handleUserAdded} />
              </View>
            </View>
            <View style={{ marginTop: 16 }}>
              <MentorMenteeList />
            </View>
            <View
              style={{
                paddingHorizontal: 16,
                marginTop: 18,
                marginBottom: 18,
                gap: 8,
              }}
            >
              <Text style={[styles.sectionTitle, { fontSize: 15 }]}>
                Explore CCC
              </Text>

              {/* Grid */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  rowGap: 12,
                }}
              >
                {exploreItems.map((item) => (
                  <ExploreCard
                    key={item.id}
                    icon={item.icon}
                    title={item.title}
                    onPress={() => {
                      if (item.title === "Schedule") {
                        router.push("/(director-tabs)/(tabs)/appointments");
                      } else if (item.title === "Revitalization Roadmap") {
                        router.push(
                          "/(director-tabs)/(tabs)/revitalization-roadmaps"
                        );
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
                paddingHorizontal: 16,
                marginTop: 18,
                marginBottom: 18,
                gap: 8,
              }}
            >
              <Text style={[styles.sectionTitle, { fontSize: 15 }]}>
                Overview
              </Text>

              {/* Stats Row */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {stats.map((stat) => (
                  <StatCard
                    key={stat.id}
                    label={stat.label}
                    value={stat.value}
                  />
                ))}
              </View>
            </View>
            <View
              style={{
                paddingHorizontal: 16,
                marginTop: 18,
                marginBottom: 18,
                gap: 8,
              }}
            >
              <Text style={[styles.sectionTitle, { fontSize: 15 }]}>
                Graduate Status of Pastors in a Year
              </Text>

              <GraduateStatusPieChart />
            </View>
            <View
              style={{
                paddingHorizontal: 16,
                marginTop: 18,
                marginBottom: 18,
                gap: 8,
              }}
            >
              <Text style={[styles.sectionTitle, { fontSize: 15 }]}>
                Monthly Trends of Pastors and Mentors
              </Text>
              <MonthlyTrendsChart />
            </View>
            <ActionCardList />
            {/* Confirmation Modal */}
            <UserAddedConfirmationModal
              visible={showConfirmation}
              userName={addedUser.name}
              userRole={addedUser.role}
              onLater={handleCloseConfirmation}
              onAssign={handleAssign}
            />
          </LinearGradient>
        </Animated.ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#e7f6fc",
    fontWeight: "700",
  },
});

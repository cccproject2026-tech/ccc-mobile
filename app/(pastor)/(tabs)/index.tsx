import ExploreCard from "@/components/director/ExploreCard";
import HeaderHero from "@/components/director/HeroHeader";
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
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Pressable,
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
  const [isFirstDashboardVisit, setIsFirstDashboardVisit] = useState(false);
  const lastProgressRefetchAtRef = useRef<number>(0);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pastorFocusSheetRef = useRef<BottomSheetModal>(null);
  const appStateRef = useRef(AppState.currentState);
  const hasPresentedForSessionRef = useRef(false);
  const pendingSheetOpenRef = useRef(true);

  const { user } = useAuthStore();

  const { data, isLoading, isError, error, progressQuery } = useProfile();
  const { mentors, isEmpty } = useAssignedMentors(user?.id as string);
  const { sections: focusSections, isLoading: isFocusLoading } =
    usePastorFocusItems();
  const [focusSheetSectionId, setFocusSheetSectionId] = useState<string | null>(null);
  const [focusSheetTitle, setFocusSheetTitle] = useState<string | undefined>(undefined);

  const displayedFocusSections = useMemo(() => {
    if (!focusSheetSectionId) return focusSections;
    return focusSections.filter((s) => s.id === focusSheetSectionId);
  }, [focusSheetSectionId, focusSections]);

  const handleCall = (mentor: Mentor) => {
    if (!mentor.phoneNumber) return Alert.alert("Phone number not available");
    Linking.openURL(`tel:${mentor.phoneNumber}`);
  };

  const handleChat = (mentor: Mentor) => {
    if (!mentor.phoneNumber) return Alert.alert("Phone number not available");
    Linking.openURL(`sms:${mentor.phoneNumber}`);
  };

  const handleMail = async (mentor: Mentor) => {
    if (!mentor.email) return Alert.alert("Email not available");
    const gmailApp = `googlegmail://co?to=${mentor.email}`;
    const gmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${mentor.email}`;
    try {
      const canOpenGmail = await Linking.canOpenURL(gmailApp);
      await Linking.openURL(canOpenGmail ? gmailApp : gmailWeb);
    } catch {
      await Linking.openURL(gmailWeb);
    }
  };

  const handleWhatsApp = async (mentor: Mentor) => {
    if (!mentor.phoneNumber) return Alert.alert("Phone number not available");
    const url = `whatsapp://send?phone=${mentor.phoneNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    Linking.openURL(canOpen ? url : `https://wa.me/${mentor.phoneNumber}`);
  };

  const {
    appointments: allAppointments,
    isLoading: isAppointmentsLoading,
    getUpcomingAppointments,
  } = useAppointments({ userId: user?.id });

  const { data: roadmaps, isLoading: isRoadmapsLoading } =
    useRoadmaps("pastor");

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const handleGreetingPeriodChange = useCallback(
    (period: "morning" | "afternoon" | "evening") => setGreetingPeriod(period),
    [],
  );

  const handleScheduleAppointment = (mentor: any) => {
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

  const displayName = useMemo(() => {
    return (data?.user?.firstName || user?.firstName || "Pastor").trim();
  }, [data?.user?.firstName, user?.firstName]);

  const primaryMentor = useMemo(() => {
    if (!mentors?.length) return null;
    return mentors[0] as Mentor;
  }, [mentors]);

  const hasMentorInProgress = useMemo(() => {
    return mentors?.some((m) => {
      const s = (m.status || "").toLowerCase();
      return s === "new" || s === "pending";
    }) ?? false;
  }, [mentors]);

  const acceptedMentor = useMemo(() => {
    if (!mentors?.length || hasMentorInProgress) return null;
    return mentors.find((m) => {
      const s = (m.status || "").toLowerCase();
      return s === "accepted" || s === "active";
    }) || null;
  }, [mentors, hasMentorInProgress]);

  const overallProgress = data?.progress?.overallProgress ?? 0;
  const hasAssignedRoadmap = (roadmaps?.length ?? 0) > 0;
  const showProgressInWelcome = overallProgress > 0 || hasAssignedRoadmap;

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const canRefetch =
        now - lastProgressRefetchAtRef.current > 7000 &&
        !progressQuery.isFetching;
      if (!canRefetch) return;
      lastProgressRefetchAtRef.current = now;
      progressQuery.refetch();
    }, [progressQuery.isFetching, progressQuery.refetch])
  );

  useEffect(() => {
    const checkFirstDashboardVisit = async () => {
      const userId = user?.id;
      if (!userId) { setIsFirstDashboardVisit(false); return; }
      const storageKey = `pastor_dashboard_seen_${userId}`;
      const hasSeen = await AsyncStorage.getItem(storageKey);
      setIsFirstDashboardVisit(!hasSeen);
      if (!hasSeen) await AsyncStorage.setItem(storageKey, "true");
    };
    checkFirstDashboardVisit().catch(() => setIsFirstDashboardVisit(false));
  }, [user?.id]);

  const formatTimeIST = useCallback((isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  }, []);

  const getPlatformIcon = useCallback((mode: AppointmentPlatform) => {
    const map: Record<AppointmentPlatform, any> = {
      zoom: icons.duoMeet,
      google_meet: icons.googleMeet,
      teams: icons.duoMeet,
      phone: icons.phone,
      in_person: icons.profile,
    };
    return map[mode];
  }, []);

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

  const upcomingAppointments = useMemo(() => {
    if (!allAppointments?.length) return [];
    return getUpcomingAppointments().slice(0, 3).map((apt) => {
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
  }, [allAppointments, mentors, getUpcomingAppointments, formatTimeIST, getModeLabel, getPlatformIcon]);

  const hasUpcomingAppointments = upcomingAppointments.length > 0;
  const showAssignedMentorCard = !!acceptedMentor && (!isFirstDashboardVisit || hasUpcomingAppointments);

  const mentorAssignedMessage = useMemo(() => {
    if (hasUpcomingAppointments) return "You already have upcoming mentor meetings. You can schedule another anytime.";
    if (isFirstDashboardVisit) return "You can schedule your first meeting anytime.";
    return "You can schedule a meeting with your mentor anytime.";
  }, [hasUpcomingAppointments, isFirstDashboardVisit]);

  const presentFocusSheet = useCallback(() => {
    if (hasPresentedForSessionRef.current || !pastorFocusSheetRef.current) return;
    setFocusSheetSectionId(null);
    setFocusSheetTitle(undefined);
    pastorFocusSheetRef.current.present();
    hasPresentedForSessionRef.current = true;
    pendingSheetOpenRef.current = false;
  }, []);

  const openThingsToFocusSheet = useCallback(
    (opts?: { sectionId?: string; title?: string }) => {
      setFocusSheetSectionId(opts?.sectionId ?? null);
      setFocusSheetTitle(opts?.title);
      requestAnimationFrame(() => pastorFocusSheetRef.current?.present());
      pendingSheetOpenRef.current = false;
    },
    [],
  );

  const setPastorFocusSheetRef = useCallback(
    (instance: BottomSheetModal | null) => {
      pastorFocusSheetRef.current = instance;
      if (instance && !hasPresentedForSessionRef.current && pendingSheetOpenRef.current) {
        requestAnimationFrame(() => presentFocusSheet());
      }
    },
    [presentFocusSheet],
  );

  // Do not auto-open on mount. Only open on explicit tile press.

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (/inactive|background/.test(appStateRef.current) && nextState === "active") {
        hasPresentedForSessionRef.current = false;
        pendingSheetOpenRef.current = true;
        setTimeout(() => presentFocusSheet(), 30);
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [presentFocusSheet]);

  const handleFocusItemPress = useCallback(
    (item: PastorFocusItem) => {
      pastorFocusSheetRef.current?.dismiss();
      setTimeout(() => {
        router.push({ pathname: item.route.pathname as any, params: item.route.params });
      }, 220);
    },
    [router],
  );

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <LinearGradient colors={["#1A4F7A", "#1B6FA3", "#2389C2"]} style={styles.centerFill}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </LinearGradient>
    );
  }

  if (isError) {
    return (
      <LinearGradient colors={["#1A4F7A", "#1B6FA3", "#2389C2"]} style={styles.centerFill}>
        <Ionicons name="alert-circle-outline" size={40} color="rgba(255,255,255,0.6)" />
        <Text style={styles.errorText}>
          {error?.message || "Failed to load dashboard"}
        </Text>
        <Pressable
          onPress={() => router.replace("/(unauthenticated)")}
          style={styles.errorBtn}
        >
          <Text style={styles.errorBtnText}>Return to Login</Text>
        </Pressable>
      </LinearGradient>
    );
  }

  // ─── Focus tiles config ───────────────────────────────────────────────────
  const FOCUS_TILES = [
    { icon: "calendar-outline" as const, label: "Today's\nMeetings", sectionId: "meetings" },
    { icon: "layers-outline" as const, label: "Roadmap\nPhases", sectionId: "roadmaps" },
    { icon: "document-text-outline" as const, label: "In Progress\nAssessments", sectionId: "assessments" },
    { icon: "chatbubble-outline" as const, label: "Mentor\nComments", sectionId: "mentor-feedback" },
  ];

  const EXPLORE_TILES = [
    {
      title: "Revitalization\nRoadmap",
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
  ];

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={["#1A4F7A", "#1B6FA3", "#2389C2"]}
      style={{ flex: 1 }}
    >
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      >
        {/* Hero header */}
        <HeaderHero
          height={280}
          image={icons.backgroundImage}
          bottomBlendColor="#1A4F7A"
          scrollOffset={scrollOffset}
          role="pastor"
          onGreetingPeriodChange={handleGreetingPeriodChange}
        />

        <View style={styles.bodyContainer}>

          {/* ── Greeting + Welcome card ── */}
          <View style={styles.section}>
            <Text style={styles.greetingText}>{greeting}</Text>
            <WelcomeCard
              onClick={() => router.push("/(pastor)/(tabs)/profile")}
              avatar={icons.myProfile}
              message={isFirstDashboardVisit ? `Welcome aboard, ${displayName}!` : `Welcome back, ${displayName}!`}
              progress={showProgressInWelcome ? overallProgress : undefined}
            />
          </View>

          {/* ── Getting started (no roadmap yet) ── */}
          {!showProgressInWelcome && (
            <View style={styles.infoCard}>
              <View style={styles.infoCardRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons name="compass-outline" size={18} color="rgba(255,255,255,0.7)" />
                </View>
                <View style={styles.infoCardText}>
                  <Text style={styles.infoCardTitle}>Getting started</Text>
                  <Text style={styles.infoCardDesc}>
                    Your progress will appear once your roadmap and tasks become active.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* ── Mentor status card ── */}
          <View style={styles.card}>
            {showAssignedMentorCard ? (
              <>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Your Mentor</Text>
                  <View style={styles.statusBadge}>
                    <Ionicons name="checkmark-circle" size={13} color="#4ADE80" />
                    <Text style={styles.statusBadgeText}>Assigned</Text>
                  </View>
                </View>
                <Text style={styles.mentorName}>{acceptedMentor!.name}</Text>
                <Text style={styles.cardBody}>{mentorAssignedMessage}</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.cardBtn}
                  onPress={() => handleScheduleAppointment(acceptedMentor)}
                >
                  <Text style={styles.cardBtnText}>Schedule a Meeting</Text>
                  <Ionicons name="arrow-forward" size={14} color="#1A4F7A" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Mentor Assignment</Text>
                  <Text style={styles.pendingBadge}>In Progress</Text>
                </View>
                <Text style={styles.cardBody}>
                  {hasMentorInProgress
                    ? "Your request is under review. You'll be notified once a mentor is confirmed."
                    : "You'll be notified once a mentor is assigned to you."}
                </Text>
              </>
            )}
          </View>

          {/* ── Things to focus on ── */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.cardTitle}>Things to Focus On</Text>
                <Text style={styles.cardSubtitle}>
                  The most important actions for today.
                </Text>
              </View>
            </View>
            <View style={styles.tilesGrid}>
              {FOCUS_TILES.map((tile, i) => (
                <Pressable
                  key={i}
                  style={styles.focusTile}
                  onPress={() => openThingsToFocusSheet({ sectionId: tile.sectionId, title: tile.label.replace("\n", " ") })}
                >
                  <View style={styles.focusTileIcon}>
                    <Ionicons name={tile.icon} size={20} color="#fff" />
                  </View>
                  <Text style={styles.focusTileText}>{tile.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ── Divider ── */}
          <View style={styles.divider} />

          {/* ── How to do ? ── */}
          <View style={styles.card}>
            <View style={styles.exploreHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exploreHelpHeading}>How to do ?</Text>
                <Text style={styles.exploreHelpDesc}>
                  We've got simple steps to help you move forward.
                </Text>
              </View>

              <Pressable
                style={styles.exploreHelpButton}
                onPress={() => openThingsToFocusSheet()}
              >
                <Text style={styles.exploreHelpButtonText}>Help..</Text>
              </Pressable>
            </View>
          </View>

          {/* ── Explore CCC ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Explore CCC</Text>
            <View style={styles.exploreGrid}>
              {EXPLORE_TILES.map((item, idx) => (
                <ExploreCard
                  key={idx}
                  icon={item.icon}
                  title={item.title}
                  route={item.route as any}
                  wrapperStyle={styles.exploreItem}
                />
              ))}
            </View>
          </View>

        </View>
      </Animated.ScrollView>

      <PastorFocusBottomSheet
        ref={setPastorFocusSheetRef}
        sections={displayedFocusSections}
        title={focusSheetTitle}
        isLoading={isLoading || isFocusLoading}
        onSelectItem={handleFocusItemPress}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // ── States ────────────────────────────────────────────────────────────────
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  errorText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
  },
  errorBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  errorBtnText: {
    color: "#1A4F7A",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Layout ────────────────────────────────────────────────────────────────
  bodyContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  section: {
    gap: 8,
  },
  greetingText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 4,
  },

  // ── Info card (getting started) ───────────────────────────────────────────
  infoCard: {
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  infoCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  infoCardText: {
    flex: 1,
    gap: 3,
  },
  infoCardTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  infoCardDesc: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: 18,
  },

  // ── Generic card ──────────────────────────────────────────────────────────
  card: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  cardBody: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 20,
  },

  // ── Mentor card specifics ─────────────────────────────────────────────────
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(74,222,128,0.12)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.25)",
  },
  statusBadgeText: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "600",
  },
  pendingBadge: {
    color: "rgba(255,220,100,0.85)",
    fontSize: 11,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,200,50,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,200,50,0.2)",
    overflow: "hidden",
  },
  mentorName: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    lineHeight: 24,
  },
  cardBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 2,
  },
  cardBtnText: {
    color: "#1A4F7A",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Focus tiles ───────────────────────────────────────────────────────────
  tilesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 2,
  },
  focusTile: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 8,
  },
  focusTileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  focusTileText: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 17,
  },

  // ── Explore grid ──────────────────────────────────────────────────────────
  exploreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    marginTop: 4,
  },
  exploreItem: {
    width: "48%",
  },
  exploreHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 6,
    marginBottom: 10,
  },
  exploreHelpHeading: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: "700",
    fontSize: 12,
    marginTop: 4,
  },
  exploreHelpDesc: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "600",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  exploreHelpButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exploreHelpButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  exploreTile: {
    height: 90,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreIcon: {
    width: 42,
    height: 42,
    marginBottom: 10,
  },
  exploreTileTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
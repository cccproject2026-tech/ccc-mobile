import ExploreCard from "@/components/director/ExploreCard";
import HeaderHero from "@/components/director/HeroHeader";
import WelcomeCard from "@/components/director/WelcomeCard";
import {
  PastorFocusBottomSheet,
  PastorFocusItem,
} from "@/components/sheets/PastorFocusBottomSheet";
import { icons } from "@/constants/images";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { Mentor } from "@/hooks/mentors/useMentors";
import { usePastorFocusItems } from "@/hooks/pastor/usePastorFocusItems";
import { useProfile } from "@/hooks/profile/useProfile";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { useAuthStore } from "@/stores";
import { AppointmentPlatform } from "@/types/appointment.types";
import { isPastorMentorIntroActive } from "@/utils/pastorMentorIntro";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedRef,
  useScrollViewOffset,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EXPLORE_TILES = [
  {
    title: "Personal\nNotes",
    icon: icons.notesIcon,
    route: "/(pastor)/(tabs)/profile/notes",
    color: "#10B981",
    gradient: ["#10B981", "#059669"],
  },
  {
    title: "CDP\nResults",
    icon: icons.Assessments2,
    route: "/(pastor)/(tabs)/assessments/report",
    color: "#4CAF50",
    gradient: ["#4CAF50", "#45a049"],
  },
  {
    title: "Progress\nTracker",
    icon: icons.progress2,
    route: "/(pastor)/(tabs)/progress",
    color: "#2196F3",
    gradient: ["#2196F3", "#1976D2"],
  },
  {
    title: "Roadmap\nPhases",
    icon: icons.Revitalization2,
    route: "/(pastor)/(tabs)/roadmap",
    color: "#FFB347",
    gradient: ["#FFB347", "#FF8C00"],
  },
] as const;

export default function PastorDashboard() {
  const [greetingPeriod, setGreetingPeriod] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");
  const [isFirstDashboardVisit, setIsFirstDashboardVisit] = useState(false);
  const [showMentorIntroForNewPastor, setShowMentorIntroForNewPastor] =
    useState(false);
  const lastProgressRefetchAtRef = useRef<number>(0);
  const { height: windowHeight } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
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
    if (focusSheetSectionId === "meetings") {
      return focusSections.filter(
        (s) => s.id === "meetings" || s.id === "meetings-month",
      );
    }
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

  const refreshMentorIntroVisibility = useCallback(async () => {
    const userId = user?.id;
    if (!userId) {
      setShowMentorIntroForNewPastor(false);
      return;
    }
    try {
      const active = await isPastorMentorIntroActive(userId);
      setShowMentorIntroForNewPastor(active);
    } catch {
      setShowMentorIntroForNewPastor(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      refreshMentorIntroVisibility();
    }, [refreshMentorIntroVisibility]),
  );

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
  const mentorAssignedMessage = useMemo(() => {
    if (hasUpcomingAppointments) return "You already have upcoming mentor meetings. You can schedule another anytime.";
    if (showMentorIntroForNewPastor) return "You can schedule your first meeting anytime.";
    return "You can schedule a meeting with your mentor anytime.";
  }, [hasUpcomingAppointments, showMentorIntroForNewPastor]);

  const focusTiles = useMemo(
    () => [
      {
        icon: "calendar-outline" as const,
        line1: "Today's",
        line2: "Meetings",
        sheetTitle: "Today's Meetings",
        sectionId: "meetings",
      },
      {
        icon: "layers-outline" as const,
        line1: "Roadmap",
        line2: "Phases",
        sheetTitle: "Roadmap Phases",
        sectionId: "roadmaps",
      },
      {
        icon: "document-text-outline" as const,
        line1: "In Progress",
        line2: "Assessments",
        sheetTitle: "In Progress Assessments",
        sectionId: "assessments",
      },
      {
        icon: "chatbubble-outline" as const,
        line1: "Mentor",
        line2: "Feedback",
        sheetTitle: "Mentor Comments",
        sectionId: "mentor-feedback",
      },
    ],
    [],
  );

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

  const handleNewMeetingPress = useCallback(() => {
    pastorFocusSheetRef.current?.dismiss();
    setTimeout(() => {
      router.push("/(pastor)/(tabs)/appointments" as any);
    }, 220);
  }, [router]);

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#2389C2"]} style={styles.centerFill}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </LinearGradient>
    );
  }

  if (isError) {
    return (
      <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#2389C2"]} style={styles.centerFill}>
        <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.6)" />
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

  /** Shorter hero on small phones so body (incl. Explore) fits one screen without scroll. */
  const heroHeight = Math.min(
    210,
    Math.max(162, Math.round(windowHeight * 0.22)),
  );

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={["#0F3B5C", "#1A4F7A", "#2389C2"]}
      style={styles.screenRoot}
    >
      <View style={styles.screenInner}>
        <Animated.ScrollView
          ref={scrollRef}
          style={styles.bodyScroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: tabBarHeight + 18 + Math.min(insets.bottom, 10),
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          bounces
        >
          <HeaderHero
            height={heroHeight}
            image={icons.backgroundImage}
            bottomBlendColor="#0F3B5C"
            scrollOffset={scrollOffset}
            role="pastor"
            showClockDate={false}
            onGreetingPeriodChange={handleGreetingPeriodChange}
          >
            <Text style={styles.greetingOnHero}>{greeting}</Text>
            <WelcomeCard
              compact
              onClick={() => router.push("/(pastor)/(tabs)/profile")}
              avatar={icons.myProfile}
              message={
                isFirstDashboardVisit
                  ? `Welcome aboard, ${displayName}!`
                  : `Welcome back, ${displayName}!`
              }
              progress={showProgressInWelcome ? overallProgress : undefined}
              bg="rgba(255,255,255,0.12)"
              borderColor="rgba(255,255,255,0.25)"
            />
          </HeaderHero>

          <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.scrollBodyStack}>
          {!showProgressInWelcome && (
            <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.infoCard}>
              <View style={styles.infoCardRow}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
                  style={styles.infoIconWrap}
                >
                  <Ionicons name="compass-outline" size={18} color="#fff" />
                </LinearGradient>
                <View style={styles.infoCardText}>
                  <Text style={styles.infoCardTitle}>Getting Started</Text>
                  <Text style={styles.infoCardDesc}>
                    Progress appears when your roadmap and tasks are active.
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {showMentorIntroForNewPastor && acceptedMentor && (
            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.mentorCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.06)"]}
                style={styles.mentorCardGradient}
              >
                <View style={styles.mentorCardHeader}>
                  <View style={styles.mentorHeaderLeft}>
                    <View style={styles.mentorIconWrapper}>
                      <Ionicons name="people-outline" size={22} color="#6FD4BE" />
                    </View>
                    <View style={styles.mentorHeaderTextWrap}>
                      <Text style={styles.mentorHeaderTitle}>Mentor assigned</Text>
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#4ADE80" />
                    <Text style={styles.statusBadgeText}>Assigned</Text>
                  </View>
                </View>

                <View style={styles.mentorIdentityBlock}>
                  <Text style={styles.mentorName}>{acceptedMentor.name}</Text>
                  <View style={styles.mentorRolePill}>
                    <Ionicons name="person-outline" size={12} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.mentorRolePillText}>{acceptedMentor.role}</Text>
                  </View>
                </View>

                <Text style={styles.mentorMessage}>{mentorAssignedMessage}</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.scheduleButton}
                  onPress={() => handleScheduleAppointment(acceptedMentor)}
                >
                  <Text style={styles.scheduleButtonText}>Schedule a Meeting</Text>
                  <View style={styles.scheduleButtonArrowWrap}>
                    <Ionicons name="arrow-forward" size={14} color="#0A5A83" />
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          )}

          {showMentorIntroForNewPastor && hasMentorInProgress && !acceptedMentor && (
            <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.pendingCard}>
              <LinearGradient
                colors={["rgba(255,193,7,0.15)", "rgba(255,193,7,0.05)"]}
                style={styles.pendingCardGradient}
              >
                <Ionicons name="time-outline" size={32} color="#FFC107" />
                <Text style={styles.pendingTitle}>Mentor Assignment In Progress</Text>
                <Text style={styles.pendingMessage}>
                  Your request is under review. You'll be notified once a mentor is confirmed.
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          <View style={styles.mainCardsGroup}>
            <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.focusCard}>
              <View style={styles.focusSectionHeader}>
                <View>
                  <View style={styles.sectionTitleRow}>
                    <View style={styles.sectionTitleIconWrap}>
                      <Ionicons name="funnel-outline" size={18} color="#fff" />
                    </View>
                    <Text style={styles.sectionTitleText}>Things to Focus On</Text>
                  </View>
                  <Text style={styles.focusIntroText} numberOfLines={2}>
                    Here are the most important things you should focus on today.
                  </Text>
                </View>
              </View>
              <View style={styles.exploreRow}>
                {focusTiles.map((tile, i) => (
                  <ExploreCard
                    key={i}
                    ionicon={tile.icon}
                    title={`${tile.line1}\n${tile.line2}`}
                    appearance="frosted"
                    compact
                    onPress={() =>
                      openThingsToFocusSheet({
                        sectionId: tile.sectionId,
                        title: tile.sheetTitle,
                      })
                    }
                  />
                ))}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.howToCard}>
              <View style={styles.howToHeader}>
                <View style={styles.howToTitles}>
                  <View style={styles.howToTitleRow}>
                    <View style={styles.howToIconWrap}>
                      <Ionicons name="library-outline" size={15} color="#fff" />
                    </View>
                    <Text style={styles.howToTitleText}>How to do?</Text>
                  </View>
                  <Text style={styles.howToDesc} numberOfLines={2}>
                    We&apos;ve got simple steps to help you move forward.
                  </Text>
                </View>
                <Pressable
                  style={styles.helpButtonCompact}
                  onPress={() => openThingsToFocusSheet()}
                >
                  <Ionicons name="help-circle-outline" size={15} color="#fff" />
                  <Text style={styles.helpButtonCompactText}>Help</Text>
                </Pressable>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(350).springify()} style={styles.exploreCard}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleIconWrap}>
                  <Ionicons name="map-outline" size={18} color="#fff" />
                </View>
                <Text style={styles.sectionTitleText}>Explore CCC</Text>
              </View>
              <Text style={[styles.cardSubtitle, styles.exploreCardSubtitle]} numberOfLines={1}>
                Roadmap, assessments, progress, and appointments.
              </Text>
              <View style={styles.exploreRow}>
                {EXPLORE_TILES.map((item, idx) => (
                  <ExploreCard
                    key={idx}
                    icon={item.icon}
                    title={item.title}
                    route={item.route as any}
                    appearance="frosted"
                    compact
                  />
                ))}
              </View>
            </Animated.View>
          </View>
          </Animated.View>
        </Animated.ScrollView>
      </View>

      <PastorFocusBottomSheet
        ref={setPastorFocusSheetRef}
        sections={displayedFocusSections}
        title={focusSheetTitle}
        isLoading={isLoading || isFocusLoading}
        onNewMeeting={focusSheetSectionId === "meetings" ? handleNewMeetingPress : undefined}
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
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "500",
    marginTop: 8,
  },
  errorText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },
  errorBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorBtnText: {
    color: "#1A4F7A",
    fontWeight: "700",
    fontSize: 14,
  },

  // ── Layout ────────────────────────────────────────────────────────────────
  screenRoot: {
    flex: 1,
  },
  screenInner: {
    flex: 1,
  },
  bodyScroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollBodyStack: {
    paddingHorizontal: 16,
    marginTop: 6,
    gap: 12,
    paddingBottom: 4,
  },
  mainCardsGroup: {
    gap: 22,
  },
  greetingOnHero: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // ── Info card (getting started) ───────────────────────────────────────────
  infoCard: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 12,
  },
  infoCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  infoCardText: {
    flex: 1,
    gap: 4,
  },
  infoCardTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  infoCardDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    lineHeight: 18,
  },

  // ── Mentor card ──────────────────────────────────────────────────────────
  mentorCard: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  mentorCardGradient: {
    padding: 12,
    gap: 6,
  },
  mentorCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  mentorHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mentorHeaderTextWrap: {
    gap: 0,
  },
  mentorHeaderTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  mentorIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(111, 212, 190, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(111, 212, 190, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  mentorIdentityBlock: {
    marginTop: 0,
    marginBottom: 0,
    gap: 4,
  },
  mentorName: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    lineHeight: 22,
  },
  mentorRolePill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  mentorRolePillText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  mentorMessage: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 0,
  },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  scheduleButtonText: {
    color: "#0A3F6B",
    fontWeight: "700",
    fontSize: 14,
  },
  scheduleButtonArrowWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(10, 92, 138, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(74,222,128,0.2)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.38)",
  },
  statusBadgeText: {
    color: "#4ADE80",
    fontSize: 11,
    fontWeight: "600",
  },

  // ── Pending card ──────────────────────────────────────────────────────────
  pendingCard: {
    borderRadius: 20,
    overflow: "hidden",
  },
  pendingCardGradient: {
    padding: 14,
    alignItems: "center",
    gap: 10,
  },
  pendingTitle: {
    color: "#FFC107",
    fontWeight: "700",
    fontSize: 16,
  },
  pendingMessage: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Generic card styles ───────────────────────────────────────────────────
  cardTitle: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  sectionTitleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitleText: {
    flex: 1,
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: 18,
  },
  focusCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 14,
    paddingBottom: 16,
    gap: 10,
  },
  howToCard: {
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  howToTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  howToIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  howToTitleText: {
    flex: 1,
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: -0.15,
  },
  howToDesc: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 10,
    lineHeight: 14,
    marginTop: 0,
  },
  exploreCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 14,
    paddingBottom: 16,
    gap: 6,
  },
  exploreCardSubtitle: {
    marginTop: 2,
    marginBottom: 10,
  },
  focusIntroText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },

  // ── Focus row ─────────────────────────────────────────────────────────────
  focusSectionHeader: {
    marginBottom: 4,
  },

  // ── How to do / Explore ───────────────────────────────────────────────────
  howToHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  howToTitles: {
    flex: 1,
    minWidth: 0,
  },
  exploreRow: {
    width: "100%",
    flexDirection: "row",
    alignSelf: "stretch",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 2,
    paddingBottom: 2,
  },
  helpButtonCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    flexShrink: 0,
  },
  helpButtonCompactText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11,
  },
});
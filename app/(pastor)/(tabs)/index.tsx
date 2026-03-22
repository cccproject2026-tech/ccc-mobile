import ExploreCard from "@/components/director/ExploreCard";
import HeaderHero from "@/components/director/HeroHeader";
import WelcomeCard from "@/components/director/WelcomeCard";
import PastorFocusBottomSheet, {
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
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EXPLORE_TILES = [
  {
    title: "Roadmap",
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
] as const;

export default function PastorDashboard() {
  const [greetingPeriod, setGreetingPeriod] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");
  const [isFirstDashboardVisit, setIsFirstDashboardVisit] = useState(false);
  const lastProgressRefetchAtRef = useRef<number>(0);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
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

  const scrollOffset = useSharedValue(0);

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
  const mentorAssignedMessage = useMemo(() => {
    if (hasUpcomingAppointments) return "You already have upcoming mentor meetings. You can schedule another anytime.";
    if (isFirstDashboardVisit) return "You can schedule your first meeting anytime.";
    return "You can schedule a meeting with your mentor anytime.";
  }, [hasUpcomingAppointments, isFirstDashboardVisit]);

  const focusTiles = useMemo(
    () => [
      {
        icon: "calendar-outline" as const,
        line1: "Your today's",
        line2:
          upcomingAppointments.length === 0
            ? "Meetings"
            : upcomingAppointments.length === 1
              ? "1 meeting"
              : `${upcomingAppointments.length} meetings`,
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
        line1: "In progress",
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
    [upcomingAppointments.length],
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

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={["#1A4F7A", "#1B6FA3", "#2389C2"]}
      style={styles.screenRoot}
    >
      <View style={styles.screenInner}>
        <HeaderHero
          height={248}
          image={icons.backgroundImage}
          bottomBlendColor="#1A4F7A"
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
            bg="rgba(255,255,255,0.14)"
            borderColor="rgba(255,255,255,0.28)"
          />
        </HeaderHero>

        <View
          style={[
            styles.bodyContainer,
            { paddingBottom: tabBarHeight + 10 },
          ]}
        >
          {!showProgressInWelcome ? (
            <View style={styles.infoCard}>
              <View style={styles.infoCardRow}>
                <View style={styles.infoIconWrap}>
                  <Ionicons
                    name="compass-outline"
                    size={16}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
                <View style={styles.infoCardText}>
                  <Text style={styles.infoCardTitle}>Getting started</Text>
                  <Text style={styles.infoCardDesc} numberOfLines={2}>
                    Progress appears when your roadmap and tasks are active.
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {isFirstDashboardVisit ? (
            <View style={styles.card}>
              {acceptedMentor ? (
                <>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Your Mentor</Text>
                    <View style={styles.statusBadge}>
                      <Ionicons name="checkmark-circle" size={13} color="#4ADE80" />
                      <Text style={styles.statusBadgeText}>Assigned</Text>
                    </View>
                  </View>
                  <Text style={styles.mentorName} numberOfLines={1}>
                    {acceptedMentor.name}
                  </Text>
                  <Text style={styles.cardBody} numberOfLines={2}>
                    {mentorAssignedMessage}
                  </Text>
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
                  <Text style={styles.cardBody} numberOfLines={3}>
                    {hasMentorInProgress
                      ? "Your request is under review. You'll be notified once a mentor is confirmed."
                      : "You'll be notified once a mentor is assigned to you."}
                  </Text>
                </>
              )}
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.focusSectionHeader}>
              <View style={styles.focusSectionTitles}>
                <Text style={styles.cardTitle}>Things to Focus On</Text>
                <Text style={styles.focusIntroText}>
                  Here are the most important things you should focus on today.
                </Text>
              </View>
            </View>
            <View style={styles.focusRow}>
              {focusTiles.map((tile, i) => (
                <Pressable
                  key={i}
                  style={styles.focusTile}
                  onPress={() =>
                    openThingsToFocusSheet({
                      sectionId: tile.sectionId,
                      title: tile.sheetTitle,
                    })
                  }
                >
                  <View style={styles.focusTileIcon}>
                    <Ionicons name={tile.icon} size={16} color="#fff" />
                  </View>
                  <View style={styles.focusTileLabels}>
                    <Text style={styles.focusTileLine1} numberOfLines={1}>
                      {tile.line1}
                    </Text>
                    <Text style={styles.focusTileLine2} numberOfLines={1}>
                      {tile.line2}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.howToHeader}>
              <View style={styles.howToTitles}>
                <Text style={styles.cardTitle}>How to do?</Text>
                <Text style={styles.cardSubtitle}>
                  We&apos;ve got simple steps to help you move forward.
                </Text>
              </View>
              <Pressable
                style={styles.exploreHelpButton}
                onPress={() => openThingsToFocusSheet()}
              >
                <Text style={styles.exploreHelpButtonText}>Help</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Explore CCC</Text>
            <Text style={styles.cardSubtitle}>
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
          </View>
        </View>
      </View>

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
  screenRoot: {
    flex: 1,
  },
  screenInner: {
    flex: 1,
  },
  bodyContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 8,
    minHeight: 0,
  },
  greetingOnHero: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  // ── Info card (getting started) ───────────────────────────────────────────
  infoCard: {
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  infoCardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    fontSize: 13,
  },
  infoCardDesc: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    lineHeight: 16,
  },

  // ── Generic card ──────────────────────────────────────────────────────────
  card: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  focusIntroText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    lineHeight: 17,
  },
  cardBody: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    lineHeight: 18,
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
    fontSize: 16,
    lineHeight: 22,
  },
  cardBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  cardBtnText: {
    color: "#1A4F7A",
    fontWeight: "700",
    fontSize: 13,
  },

  // ── Focus row (single row) ────────────────────────────────────────────────
  focusSectionHeader: {
    marginBottom: 2,
  },
  focusSectionTitles: {
    flex: 1,
    minWidth: 0,
  },
  focusRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  focusTile: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 5,
  },
  focusTileIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  focusTileLabels: {
    alignItems: "center",
    width: "100%",
    gap: 1,
  },
  focusTileLine1: {
    color: "rgba(255,255,255,0.95)",
    fontWeight: "700",
    fontSize: 9,
    lineHeight: 12,
    textAlign: "center",
  },
  focusTileLine2: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "600",
    fontSize: 8,
    lineHeight: 11,
    textAlign: "center",
  },

  // ── How to do / Explore ───────────────────────────────────────────────────
  howToHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  howToTitles: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  exploreRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  exploreHelpButton: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  exploreHelpButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
});
import ExploreCard from "@/components/director/ExploreCard";
import HeaderHero from "@/components/director/HeroHeader";
import WelcomeCard from "@/components/director/WelcomeCard";
import { PastorFocusBottomSheet, type PastorFocusItem } from "@/components/sheets/PastorFocusBottomSheet";
import { icons } from "@/constants/images";
import { useMentorFocusItems } from "@/hooks/mentors/useMentorFocusItems";
import { useReviewCenterV2 } from "@/hooks/mentors/useReviewCenterV2";
import { useCurrentUserAvatar } from "@/hooks/useCurrentUserAvatar";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Animated, { FadeInUp, useAnimatedRef, useScrollViewOffset } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Quick Links: six tiles in 3x2 grid layout. */
const EXPLORE_TILES = [
  {
    icon: "document-text-outline",
    title: "Session\nNotes",
    route: "/(mentor)/(tabs)/profile/notes",
  },
  {
    icon: "map-outline",
    title: "Revitalization\nRoadmap",
    route: "/(mentor)/roadmap/landing/landing",
  },
  {
    icon: "calendar-outline",
    title: "Mentorship\nSessions",
    route: "/(mentor)/(tabs)/sessions",
  },
  {
    icon: "people-outline",
    title: "My\nMentees",
    route: "/(mentor)/mentees",
  },
  {
    icon: "bar-chart-outline",
    title: "Mentees'\nProgress",
    route: "/(mentor)/mentees/progress-tracker",
  },
  {
    icon: "analytics-outline",
    title: "Mentorship\nInsights",
    route: "/(mentor)/(tabs)/insights",
  },
] as const;

/** Android Google Maps crashes the process if MapView mounts without a valid API key in app config. */
function canMountGoogleMapOnThisPlatform(): boolean {
  if (Platform.OS !== "android") return true;
  const key = Constants.expoConfig?.android?.config?.googleMaps?.apiKey;
  return typeof key === "string" && key.trim().length > 0;
}

export default function MentorDashboardHome() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userAvatar = useCurrentUserAvatar();

  const [greetingPeriod, setGreetingPeriod] = useState<"morning" | "afternoon" | "evening">("morning");
  const [focusSheetSectionId, setFocusSheetSectionId] = useState<string | null>(null);
  const [focusSheetTitle, setFocusSheetTitle] = useState<string | undefined>(undefined);
  const mentorFocusSheetRef = useRef<BottomSheetModal>(null);

  const [mapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const { height: windowHeight } = useWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const mentorName = useMemo(() => {
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    return fullName || "Mentor";
  }, [user?.firstName, user?.lastName]);

  const greeting = useMemo(() => {
    if (greetingPeriod === "morning") return "Good Morning";
    if (greetingPeriod === "afternoon") return "Good Afternoon";
    return "Good Evening";
  }, [greetingPeriod]);

  const { sections, isLoading } = useMentorFocusItems();
  const { pendingActionCount } = useReviewCenterV2();

  const heroHeight = Math.min(210, Math.max(162, Math.round(windowHeight * 0.22)));

  const handleGreetingPeriodChange = useCallback(
    (period: "morning" | "afternoon" | "evening") => setGreetingPeriod(period),
    [],
  );

  const focusTiles = useMemo(
    () => [
      {
        icon: "calendar-outline" as const,
        line1: "Today's",
        line2: "Sessions",
        sheetTitle: "Today's Mentorship Sessions",
        sectionId: "mentorship-sessions-today",
      },
      {
        icon: "layers-outline" as const,
        line1: "Other",
        line2: "Meetings",
        sheetTitle: "Other Meetings",
        sectionId: "other-meetings",
      },
      {
        icon: "chatbubble-outline" as const,
        line1: "Pastor",
        line2: "Queries",
        sheetTitle: "Pastor Queries",
        sectionId: "pastor-queries",
      },
      {
        icon: "calendar-clear-outline" as const,
        line1: "My",
        line2: "Calendar",
        sheetTitle: "My Calendar",
        sectionId: "mentorship-sessions-today",
        route: {
          pathname: "/appointments",
          params: {},
        },
      },
    ],
    [],
  );

  const displayedFocusSections = useMemo(() => {
    if (focusSheetSectionId === "mentorship-sessions-today") {
      return sections.filter(
        (s) =>
          s.id === "mentorship-sessions-today" ||
          s.id === "mentorship-program-upcoming",
      );
    }
    if (!focusSheetSectionId) return sections;
    return sections.filter((s) => s.id === focusSheetSectionId);
  }, [focusSheetSectionId, sections]);

  const openThingsToFocusSheet = useCallback(
    (opts?: { sectionId?: string; title?: string }) => {
      setFocusSheetSectionId(opts?.sectionId ?? null);
      setFocusSheetTitle(opts?.title);
      requestAnimationFrame(() => mentorFocusSheetRef.current?.present());
    },
    [],
  );

  const setMentorFocusSheetRef = useCallback((instance: BottomSheetModal | null) => {
    mentorFocusSheetRef.current = instance;
  }, []);

  const handleFocusItemPress = useCallback(
    (item: PastorFocusItem) => {
      mentorFocusSheetRef.current?.dismiss();
      setTimeout(() => {
        const { pathname, params } = item.route;
        router.push({ pathname: pathname as any, params: params ?? {} });
      }, 220);
    },
    [router],
  );

  if (isLoading) {
    return (
      <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#2389C2"]} style={styles.screenRoot}>
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0F3B5C", "#1A4F7A", "#2389C2"]} style={styles.screenRoot}>
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
            role="mentor"
            showClockDate={false}
            onGreetingPeriodChange={handleGreetingPeriodChange}
          >
            <Text style={styles.greetingOnHero}>{greeting}</Text>
            <WelcomeCard
              compact
              onClick={() => router.push("/(mentor)/(tabs)/profile")}
              onProgressPress={() => router.push("/(mentor)/(tabs)/progress" as any)}
              avatar={userAvatar}
              message={`Welcome back, ${mentorName}!`}
              bg="rgba(255,255,255,0.12)"
              borderColor="rgba(255,255,255,0.25)"
            />
          </HeaderHero>

          <Animated.View entering={FadeInUp.delay(250).springify()} style={styles.mainCardsGroup}>
            <Animated.View entering={FadeInUp.delay(50).springify()} style={styles.focusCard}>
              <View style={styles.focusSectionHeader}>
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

              <View style={styles.exploreRow}>
                {focusTiles.map((tile, i) => (
                  <ExploreCard
                    key={i}
                    ionicon={tile.icon}
                    title={`${tile.line1}\n${tile.line2}`}
                    appearance="frosted"
                    compact
                    onPress={() => {
                      if (tile.route) {
                        router.push({
                          pathname: tile.route.pathname as any,
                          params: tile.route.params ?? {},
                        });
                        return;
                      }
                      openThingsToFocusSheet({
                        sectionId: tile.sectionId,
                        title: tile.sheetTitle,
                      });
                    }}
                  />
                ))}
              </View>

              <Pressable
                style={styles.reviewCenterLink}
                onPress={() => router.push("/(mentor)/(tabs)/review-center" as any)}
                accessibilityRole="button"
                accessibilityLabel={`Review Center${pendingActionCount > 0 ? `, ${pendingActionCount} pending` : ""}`}
              >
                <View style={styles.reviewCenterIconWrap}>
                  <Ionicons name="file-tray-full-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.reviewCenterLinkText}>Review Center</Text>
                {pendingActionCount > 0 ? (
                  <View style={styles.reviewCenterBadge}>
                    <Text style={styles.reviewCenterBadgeText}>{pendingActionCount}</Text>
                  </View>
                ) : null}
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="rgba(255,255,255,0.45)"
                  style={styles.reviewCenterChevron}
                />
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.howToCard}>
              <View style={styles.howToHeader}>
                <View style={styles.howToTitles}>
                  <View style={styles.howToTitleRow}>
                    <View style={styles.howToIconWrap}>
                      <Ionicons name="library-outline" size={15} color="#fff" />
                    </View>
                    <Text style={styles.howToTitleText}>Need a Help?</Text>
                  </View>
                  <Text style={styles.howToDesc} numberOfLines={2}>
                    We&apos;ve got simple steps to help you move forward.
                  </Text>
                </View>
                <View style={styles.howToActions}>
                  <Pressable
                    style={styles.helpButtonCompact}
                    onPress={() =>
                      router.push("/(mentor)/(tabs)/support/contact-information" as any)
                    }
                  >
                    <Ionicons name="help-circle-outline" size={15} color="#fff" />
                    <Text style={styles.helpButtonCompactText}>Help</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(180).springify()} style={styles.exploreCard}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionTitleIconWrap}>
                  <Ionicons name="map-outline" size={18} color="#fff" />
                </View>
                <Text style={styles.sectionTitleText}>Quick Links</Text>
              </View>

              <View style={styles.exploreGrid}>
                {EXPLORE_TILES.map((tile) => (
                  <View key={tile.route} style={styles.exploreGridItem}>
                    <ExploreCard
                      ionicon={tile.icon as any}
                      title={tile.title}
                      route={tile.route as any}
                      appearance="frosted"
                      compact
                      wrapperStyle={{ width: "100%", maxWidth: "100%" }}
                    />
                  </View>
                ))}
              </View>
            </Animated.View>


            <Animated.View entering={FadeInUp.delay(140).springify()} style={styles.mapCard}>
              {canMountGoogleMapOnThisPlatform() ? (
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
                  <Marker
                    coordinate={{
                      latitude: mapRegion.latitude,
                      longitude: mapRegion.longitude,
                    }}
                  />
                </MapView>
              ) : (
                <View style={styles.mapUnavailable}>
                  <Ionicons name="map-outline" size={32} color="rgba(255,255,255,0.35)" />
                  <Text style={styles.mapUnavailableText}>
                    Map is turned off on this Android build until a Google Maps API key is configured for the app.
                  </Text>
                </View>
              )}
            </Animated.View>

          </Animated.View>
        </Animated.ScrollView>
      </View>

      <PastorFocusBottomSheet
        ref={setMentorFocusSheetRef}
        sections={displayedFocusSections}
        title={focusSheetTitle}
        isLoading={isLoading}
        onSelectItem={handleFocusItemPress}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
  screenRoot: { flex: 1 },
  screenInner: { flex: 1 },
  bodyScroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },

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

  mainCardsGroup: {
    paddingHorizontal: 16,
    marginTop: 6,
    gap: 12,
    paddingBottom: 4,
  },

  // Focus Card
  focusCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    padding: 14,
    paddingBottom: 16,
    gap: 10,
  },
  focusSectionHeader: { marginBottom: 4 },

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
  focusIntroText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
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

  exploreGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
    marginTop: 2,
    paddingBottom: 2,
  },

  exploreGridItem: {
    width: "31%",
    minWidth: 0,
  },

  // Help Card
  howToCard: {
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  howToHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  howToTitles: { flex: 1, minWidth: 0 },
  howToTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
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
  howToActions: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 },

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

  // Map Card
  mapCard: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    height: 410,
  },
  mapUnavailable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  mapUnavailableText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
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

  reviewCenterLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  reviewCenterIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewCenterLinkText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  reviewCenterBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewCenterBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
  },
  reviewCenterChevron: {
    marginLeft: 2,
  },
});


import {
  DetailScreenSkeleton,
  sessionGradientColors,
} from "@/components/sessions/SessionFlowShared";
import { MentorshipInsightsBody } from "@/components/sessions/mentor/MentorshipInsightsBody";
import { mentorSessionPremium as T } from "@/components/sessions/mentor/mentorSessionTheme";
import { Colors } from "@/constants/Colors";
import { useMentorshipSessions } from "@/hooks/roadmaps/useMentorshipSessions";
import { useAuthStore } from "@/stores";
import { aggregateMentorshipInsights } from "@/utils/mentorshipSessionExtras";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const TAB_SCENE_BOTTOM = Colors.darkBlueGradientOne;

export default function MentorshipInsightsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const bottomPad = tabBarHeight + Math.max(insets.bottom, 12) + 16;

  const { data: sessions = [], isLoading } = useMentorshipSessions(user?.id);

  const insights = useMemo(
    () => aggregateMentorshipInsights(sessions),
    [sessions],
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: TAB_SCENE_BOTTOM }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[...sessionGradientColors]} style={styles.gradient}>
        <View style={styles.topRow}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={T.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.heading}>Insights</Text>
        </View>

        {isLoading ? (
          <View style={styles.fill}>
            <DetailScreenSkeleton />
          </View>
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: bottomPad },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.intro}>
              <View style={styles.introIcon}>
                <Ionicons name="analytics-outline" size={26} color={T.icon} />
              </View>
              <Text style={styles.introTitle}>Mentorship Insights</Text>
              <Text style={styles.introSub}>
                AI-assisted view of patterns across sessions with your mentees.
              </Text>
            </View>

            <MentorshipInsightsBody data={insights} />
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  fill: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, gap: 22, paddingTop: 4 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.glassHi,
    borderWidth: 1,
    borderColor: T.borderHi,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 2,
  },
  backText: { color: T.textPrimary, fontWeight: "700", fontSize: 15 },
  heading: {
    color: T.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    flex: 1,
    letterSpacing: -0.3,
  },
  intro: {
    marginBottom: 4,
    gap: 10,
  },
  introIcon: {
    alignSelf: "flex-start",
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.glassHi,
    borderWidth: 1,
    borderColor: T.border,
  },
  introTitle: {
    color: T.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  introSub: {
    color: T.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});

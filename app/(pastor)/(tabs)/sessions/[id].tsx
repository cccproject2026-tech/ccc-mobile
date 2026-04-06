import { buildPastorMeetingsUi } from "@/components/sessions/pastor/buildPastorMeetingsUi";
import { ExpandableMeetingCard } from "@/components/sessions/pastor/ExpandableMeetingCard";
import { MeetingJoinDetails } from "@/components/sessions/pastor/MeetingJoinDetails";
import type { PastorMeetingUi } from "@/components/sessions/pastor/pastorSessionDetail.types";
import { usePastorMeetingLayout } from "@/components/sessions/pastor/usePastorMeetingLayout";
import {
  DetailScreenSkeleton,
  getNextSessionId,
  sessionGradientColors,
  SessionProgressHeader,
  SessionStatusBadge,
} from "@/components/sessions/SessionFlowShared";
import { Colors } from "@/constants/Colors";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { usePastorSessions } from "@/hooks/roadmaps/usePastorSessions";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { phaseLabelForSessionNumber } from "@/utils/sessionPhase";
import {
  sessionOrdinalLabel,
  sessionTopicSubtitle,
} from "@/constants/sessionTitles";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const TAB_SCENE_BOTTOM = Colors.darkBlueGradientOne;

function normalizeMeetingUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export default function PastorSessionDetailScreen() {
  const layout = usePastorMeetingLayout();
  const router = useRouter();
  const { user } = useAuthStore();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const scrollBottomPad = tabBarHeight + Math.max(insets.bottom, 12) + 16;
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = Array.isArray(id) ? id[0] : id;
  const pastorId = user?.id;

  const { data: sessions = [], isLoading } = usePastorSessions(pastorId);
  const { appointments = [] } = useAppointments({ userId: pastorId });
  const { mentors } = useAssignedMentors(pastorId ?? null);

  const mentorNameById = useMemo(() => {
    const m = new Map<string, string>();
    mentors.forEach((mentor) => m.set(mentor.id, mentor.name));
    return m;
  }, [mentors]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber),
    [sessions],
  );

  const nextSessionId = useMemo(
    () => getNextSessionId(sortedSessions),
    [sortedSessions],
  );

  const session = useMemo<MentorshipSession | null>(() => {
    if (!sessionId) return null;
    return sessions.find((s) => s.id === sessionId) ?? null;
  }, [sessions, sessionId]);

  const appointment = useMemo(() => {
    if (!session?.appointmentId) return undefined;
    return appointments.find(
      (a) => String(a.id) === String(session.appointmentId),
    );
  }, [session?.appointmentId, appointments]);

  const mentorName = useMemo(() => {
    if (!appointment?.mentorId) return undefined;
    return mentorNameById.get(String(appointment.mentorId));
  }, [appointment?.mentorId, mentorNameById]);

  const meetingLink = appointment?.meetingLink?.trim();
  const phase = session
    ? phaseLabelForSessionNumber(session.sessionNumber)
    : undefined;
  const heroTopic = sessionTopicSubtitle(session?.sessionNumber);
  const isScheduled = session?.status === "SCHEDULED";
  const canJoin = isScheduled && !!meetingLink;

  const meetingsUi = useMemo<PastorMeetingUi[]>(
    () => (session ? buildPastorMeetingsUi(session, appointment) : []),
    [session, appointment],
  );

  const handleJoin = () => {
    if (!meetingLink) return;
    const url = normalizeMeetingUrl(meetingLink);
    Linking.openURL(url).catch(() => {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Unable to open link",
        text2: "Check your meeting link in appointments.",
      });
    });
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: TAB_SCENE_BOTTOM }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[...sessionGradientColors]} style={styles.gradient}>
        <View style={styles.topRow}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.heading}>Session</Text>
        </View>

        {isLoading ? (
          <View style={styles.fillRest}>
            <DetailScreenSkeleton />
          </View>
        ) : !session ? (
          <View style={[styles.center, styles.fillRest]}>
            <Text style={styles.muted}>Session not found.</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollFlex}
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: scrollBottomPad },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.progressWrap}>
              <SessionProgressHeader
                sessions={sortedSessions}
                nextSessionId={nextSessionId}
              />
            </View>

            <View
              style={[
                styles.heroCard,
                { marginBottom: layout.sectionGapAfterHero },
              ]}
            >
              <View style={styles.heroTop}>
                <View style={styles.heroTitles}>
                  <Text style={styles.heroKicker}>Session overview</Text>
                  {heroTopic ? (
                    <>
                      <Text style={styles.heroSessionName} numberOfLines={4}>
                        {heroTopic}
                      </Text>
                      <Text style={styles.heroSessionOrdinal}>
                        {sessionOrdinalLabel(session.sessionNumber)}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.heroSessionName}>
                      {sessionOrdinalLabel(session.sessionNumber)}
                    </Text>
                  )}
                </View>
                <SessionStatusBadge status={session.status} />
              </View>

              <View style={styles.divider} />

              {mentorName ? (
                <Text style={styles.metaLine}>
                  <Text style={styles.metaEmphasis}>Mentor · </Text>
                  {mentorName}
                </Text>
              ) : null}
              {phase ? (
                <Text style={styles.phaseLine}>{phase}</Text>
              ) : null}
            </View>

            <View
              style={[
                styles.meetingsFeed,
                {
                  maxWidth: layout.feedMaxWidth,
                  marginBottom: layout.meetingsBlockBottom,
                },
              ]}
            >
              <View style={styles.meetingsFeedHeader}>
                <Text style={styles.meetingsHeading}>Meetings</Text>
                <Text style={styles.meetingsSub}>
                  Notes, transcript, and AI summary for each meeting.
                </Text>
              </View>

              {meetingsUi.map((m) => (
              <ExpandableMeetingCard
                key={m.id}
                meeting={m}
                joinButton={
                  m.isLatest && meetingLink ? (
                    <View style={styles.joinStack}>
                      <MeetingJoinDetails
                        meetingLink={meetingLink}
                        platform={appointment?.platform ?? "zoom"}
                      />
                      {canJoin ? (
                        <Pressable style={styles.joinBtn} onPress={handleJoin}>
                          <Ionicons name="videocam" size={22} color="#153C5A" />
                          <Text style={styles.joinBtnText}>Join meeting</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : m.isLatest && isScheduled && !meetingLink ? (
                    <View style={styles.hintBox}>
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color="rgba(255,255,255,0.85)"
                      />
                      <Text style={styles.hint}>
                        Meeting link will appear when your mentor adds it to the
                        appointment.
                      </Text>
                    </View>
                  ) : undefined
                }
              />
            ))}
            </View>
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  meetingsFeed: {
    width: "100%",
    alignSelf: "center",
  },
  meetingsFeedHeader: {
    marginBottom: 14,
    gap: 6,
  },
  fillRest: { flex: 1 },
  scrollFlex: { flex: 1 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 2,
  },
  backText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  heading: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  muted: { color: "rgba(255,255,255,0.9)", fontSize: 15 },
  scroll: { flexGrow: 1 },
  progressWrap: { marginBottom: 6 },
  metaLine: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    fontWeight: "600",
  },
  metaEmphasis: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "700",
  },
  meetingsHeading: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  meetingsSub: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    lineHeight: 21,
  },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  heroTitles: { flex: 1 },
  heroKicker: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroSessionName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  heroSessionOrdinal: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginVertical: 14,
  },
  phaseLine: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
  joinStack: {
    gap: 14,
  },
  joinBtn: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  joinBtnText: { color: "#0F2847", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 },
  hintBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  hint: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
});

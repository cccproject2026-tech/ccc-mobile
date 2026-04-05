import {
  ActionsSection,
  DetailScreenSkeleton,
  formatSessionTime,
  getNextSessionId,
  NoteCard,
  NotesSection,
  sessionGradientColors,
  SessionMetaRow,
  SessionProgressHeader,
  SessionStatusBadge,
} from "@/components/sessions/SessionFlowShared";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { usePastorSessions } from "@/hooks/roadmaps/usePastorSessions";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { phaseLabelForSessionNumber } from "@/utils/sessionPhase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

function normalizeMeetingUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export default function PastorSessionDetailScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
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
  const isScheduled = session?.status === "SCHEDULED";
  const canJoin = isScheduled && !!meetingLink;

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
    <SafeAreaView style={styles.safe}>
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
          <DetailScreenSkeleton />
        ) : !session ? (
          <View style={styles.center}>
            <Text style={styles.muted}>Session not found.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <SessionProgressHeader
              sessions={sortedSessions}
              nextSessionId={nextSessionId}
            />

            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroTitles}>
                  <Text style={styles.heroKicker}>Session overview</Text>
                  <Text style={styles.heroTitle}>
                    Session {session.sessionNumber}
                  </Text>
                </View>
                <SessionStatusBadge status={session.status} />
              </View>

              <View style={styles.divider} />

              <SessionMetaRow
                icon="calendar-outline"
                label={formatSessionDate(session.scheduledDate)}
              />
              <SessionMetaRow
                icon="time-outline"
                label={
                  formatSessionTime(session.scheduledDate) || "Time TBD"
                }
              />
              {mentorName ? (
                <SessionMetaRow
                  icon="person-outline"
                  label={`Mentor ${mentorName}`}
                />
              ) : null}
              {phase ? (
                <Text style={styles.phaseLine}>{phase}</Text>
              ) : null}
            </View>

            {(canJoin || (isScheduled && !meetingLink)) && (
              <ActionsSection>
                {canJoin ? (
                  <Pressable style={styles.joinBtn} onPress={handleJoin}>
                    <Ionicons name="videocam" size={22} color="#153C5A" />
                    <Text style={styles.joinBtnText}>Join meeting</Text>
                  </Pressable>
                ) : (
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
                )}
              </ActionsSection>
            )}

            <NotesSection>
              <NoteCard title="Mentor note" value={session.mentorNote} />
              <NoteCard title="Pastor note" value={session.pastorNote} />
            </NotesSection>
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#153C5A" },
  gradient: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
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
  scroll: { paddingBottom: 32, gap: 4 },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 8,
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
  heroTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
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
  joinBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  joinBtnText: { color: "#153C5A", fontSize: 16, fontWeight: "800" },
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

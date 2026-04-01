import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { usePastorSessions } from "@/hooks/roadmaps/usePastorSessions";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { phaseLabelForSessionNumber } from "@/utils/sessionPhase";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NoteCard = ({ title, value }: { title: string; value?: string }) => (
  <View style={styles.noteCard}>
    <Text style={styles.noteTitle}>{title}</Text>
    <Text style={styles.noteText}>
      {value && value.trim().length > 0 ? value : "No note yet."}
    </Text>
  </View>
);

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
      Alert.alert("Unable to open link", "Check your meeting link in appointments.");
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.gradient}
      >
        <View style={styles.topRow}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.heading}>Session Details</Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.muted}>Loading...</Text>
          </View>
        ) : !session ? (
          <View style={styles.center}>
            <Text style={styles.muted}>Session not found.</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summary}>
              <Text style={styles.sessionTitle}>
                Session {session.sessionNumber}
              </Text>
              <View style={styles.row}>
                <View
                  style={[
                    styles.badge,
                    session.status === "COMPLETED"
                      ? styles.badgeDone
                      : styles.badgeOpen,
                  ]}
                >
                  <Text style={styles.badgeText}>{session.status}</Text>
                </View>
              </View>
              <Text style={styles.meta}>
                Scheduled: {formatSessionDate(session.scheduledDate)}
              </Text>
              {mentorName ? (
                <Text style={styles.meta}>Mentor: {mentorName}</Text>
              ) : null}
              {phase ? <Text style={styles.phase}>{phase}</Text> : null}
            </View>

            {canJoin ? (
              <Pressable style={styles.joinBtn} onPress={handleJoin}>
                <Text style={styles.joinBtnText}>Join Meeting</Text>
              </Pressable>
            ) : isScheduled && !meetingLink ? (
              <Text style={styles.hint}>
                Meeting link will appear here when your mentor adds it to the
                appointment.
              </Text>
            ) : null}

            <NoteCard title="Mentor Note" value={session.mentorNote} />
            <NoteCard title="Pastor Note" value={session.pastorNote} />
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  back: {
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backText: { color: "#FFFFFF", fontWeight: "700" },
  heading: { color: "#FFFFFF", fontSize: 20, fontWeight: "700", flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  muted: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  scroll: { paddingBottom: 32, gap: 12 },
  summary: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  sessionTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  row: { flexDirection: "row", marginTop: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeOpen: { backgroundColor: "rgba(56, 189, 248, 0.25)" },
  badgeDone: { backgroundColor: "rgba(34, 197, 94, 0.25)" },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  meta: { color: "rgba(255,255,255,0.9)", fontSize: 14, marginTop: 8 },
  phase: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 6 },
  joinBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  joinBtnText: { color: "#153C5A", fontSize: 16, fontWeight: "800" },
  hint: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  noteTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  noteText: { color: "#FFFFFF", fontSize: 14, lineHeight: 22 },
});

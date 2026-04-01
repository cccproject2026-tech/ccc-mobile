import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { usePastorSessions } from "@/hooks/roadmaps/usePastorSessions";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { phaseLabelForSessionNumber } from "@/utils/sessionPhase";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EnrichedSession = MentorshipSession & {
  mentorName?: string;
  meetingLink?: string;
  phase?: string;
};

export default function PastorSessionsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const pastorId = user?.id;

  const { data: sessions = [], isLoading, isError, refetch, isRefetching } =
    usePastorSessions(pastorId);
  const { appointments = [] } = useAppointments({ userId: pastorId });
  const { mentors } = useAssignedMentors(pastorId ?? null);

  const mentorNameById = useMemo(() => {
    const m = new Map<string, string>();
    mentors.forEach((mentor) => m.set(mentor.id, mentor.name));
    return m;
  }, [mentors]);

  const enriched: EnrichedSession[] = useMemo(() => {
    return sessions.map((s) => {
      const apt = s.appointmentId
        ? appointments.find((a) => String(a.id) === String(s.appointmentId))
        : undefined;
      const mentorName = apt?.mentorId
        ? mentorNameById.get(String(apt.mentorId))
        : undefined;
      return {
        ...s,
        mentorName,
        meetingLink: apt?.meetingLink,
        phase: phaseLabelForSessionNumber(s.sessionNumber),
      };
    });
  }, [sessions, appointments, mentorNameById]);

  const { displayList, nextSessionId } = useMemo(() => {
    const sorted = [...enriched].sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    );
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const upcoming = sorted.find(
      (s) =>
        s.status === "SCHEDULED" &&
        !Number.isNaN(new Date(s.scheduledDate).getTime()) &&
        new Date(s.scheduledDate) >= start,
    );
    const nextId =
      upcoming?.id ??
      sorted.find((s) => s.status === "SCHEDULED")?.id ??
      undefined;
    if (!nextId) {
      return { displayList: sorted, nextSessionId: undefined };
    }
    const next = sorted.find((s) => s.id === nextId);
    const rest = sorted.filter((s) => s.id !== nextId);
    return {
      displayList: next ? [next, ...rest] : sorted,
      nextSessionId: nextId,
    };
  }, [enriched]);

  if (!pastorId) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.gradient}
      >
        <Text style={styles.stateText}>Please log in.</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Mentorship Sessions</Text>
          <Text style={styles.sub}>
            Track your journey and join upcoming meetings.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.stateText}>Loading sessions...</Text>
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.stateText}>Could not load sessions.</Text>
            <Pressable onPress={() => refetch()} style={styles.retry}>
              <Text style={styles.retryText}>
                {isRefetching ? "Retrying..." : "Retry"}
              </Text>
            </Pressable>
          </View>
        ) : displayList.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>
              No sessions yet. Complete Jumpstart to start your journey.
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayList}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Pressable
                style={styles.card}
                onPress={() =>
                  router.push(`/(pastor)/(tabs)/sessions/${item.id}` as any)
                }
              >
                <View style={styles.rowTop}>
                  <Text style={styles.sessionTitle}>
                    Session {item.sessionNumber}
                  </Text>
                  {item.id === nextSessionId && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Next Session</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.meta}>
                  {formatSessionDate(item.scheduledDate)} ·{" "}
                  {item.status === "COMPLETED" ? "Completed" : "Scheduled"}
                </Text>
                {item.mentorName ? (
                  <Text style={styles.hint}>Mentor: {item.mentorName}</Text>
                ) : null}
                {item.phase ? (
                  <Text style={styles.phase} numberOfLines={2}>
                    {item.phase}
                  </Text>
                ) : null}
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  header: { marginBottom: 16 },
  heading: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  sub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 6,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
  },
  stateText: { color: "#FFFFFF", fontSize: 14, textAlign: "center" },
  emptyTitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  retry: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: "#153C5A", fontWeight: "700" },
  list: { paddingBottom: 32 },
  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  sessionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    flex: 1,
  },
  badge: {
    backgroundColor: "rgba(250, 204, 21, 0.25)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#FDE047",
    fontSize: 11,
    fontWeight: "800",
  },
  meta: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    marginTop: 8,
  },
  hint: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 6,
  },
  phase: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 4,
  },
});

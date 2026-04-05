import {
  formatSessionTime,
  getNextSessionId,
  sessionCardHighlightStyle,
  sessionGradientColors,
  SessionListSkeleton,
  SessionProgressHeader,
  SessionStatusBadge,
} from "@/components/sessions/SessionFlowShared";
import { Colors } from "@/constants/Colors";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { usePastorSessions } from "@/hooks/roadmaps/usePastorSessions";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { phaseLabelForSessionNumber } from "@/utils/sessionPhase";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
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

  const sortedByNumber = useMemo(
    () =>
      [...enriched].sort((a, b) => a.sessionNumber - b.sessionNumber),
    [enriched],
  );

  const nextSessionId = useMemo(
    () => getNextSessionId(sortedByNumber),
    [sortedByNumber],
  );

  const { displayList } = useMemo(() => {
    const sorted = [...enriched].sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime(),
    );
    const nextId = nextSessionId;
    if (!nextId) {
      return { displayList: sorted };
    }
    const next = sorted.find((s) => s.id === nextId);
    const rest = sorted.filter((s) => s.id !== nextId);
    return {
      displayList: next ? [next, ...rest] : sorted,
    };
  }, [enriched, nextSessionId]);

  if (!pastorId) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.gradientBare}
      >
        <Text style={styles.stateText}>Please log in.</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[...sessionGradientColors]} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.heading}>Mentorship Sessions</Text>
          <Text style={styles.sub}>
            Track your journey, join meetings, and see what is next.
          </Text>
        </View>

        {isLoading ? (
          <SessionListSkeleton rows={6} />
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
          <>
            <SessionProgressHeader
              sessions={sortedByNumber}
              nextSessionId={nextSessionId}
            />
            <FlatList
              data={displayList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.card, sessionCardHighlightStyle(item.id === nextSessionId)]}
                  onPress={() =>
                    router.push(`/(pastor)/(tabs)/sessions/${item.id}` as any)
                  }
                >
                  <View style={styles.cardTop}>
                    <View style={styles.titleBlock}>
                      <Text style={styles.sessionTitle}>
                        Session {item.sessionNumber}
                      </Text>
                      {item.id === nextSessionId ? (
                        <View style={styles.currentPill}>
                          <Text style={styles.currentPillText}>Current</Text>
                        </View>
                      ) : null}
                    </View>
                    <SessionStatusBadge status={item.status} compact />
                  </View>

                  <View style={styles.metaBlock}>
                    <View style={styles.metaLine}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="rgba(255,255,255,0.75)"
                      />
                      <Text style={styles.meta}>
                        {formatSessionDate(item.scheduledDate)}
                      </Text>
                    </View>
                    <View style={styles.metaLine}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color="rgba(255,255,255,0.75)"
                      />
                      <Text style={styles.meta}>
                        {formatSessionTime(item.scheduledDate) || "Time TBD"}
                      </Text>
                    </View>
                    {item.mentorName ? (
                      <View style={styles.metaLine}>
                        <Ionicons
                          name="person-outline"
                          size={16}
                          color="rgba(255,255,255,0.75)"
                        />
                        <Text style={styles.meta} numberOfLines={1}>
                          Mentor {item.mentorName}
                        </Text>
                      </View>
                    ) : null}
                    {item.phase ? (
                      <Text style={styles.phase} numberOfLines={2}>
                        {item.phase}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  gradientBare: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 4 },
  heading: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
    minHeight: 200,
  },
  stateText: { color: "#FFFFFF", fontSize: 15, textAlign: "center" },
  emptyTitle: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  retry: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  retryText: { color: "#153C5A", fontWeight: "800", fontSize: 15 },
  list: { paddingBottom: 32 },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  titleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  sessionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  currentPill: {
    backgroundColor: "rgba(250, 204, 21, 0.28)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentPillText: {
    color: "#FDE68A",
    fontSize: 11,
    fontWeight: "800",
  },
  metaBlock: { gap: 8 },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  meta: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    flex: 1,
  },
  phase: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
});

import {
  formatSessionTime,
  getNextSessionId,
  sessionCardHighlightStyle,
  sessionGradientColors,
  SessionListSkeleton,
  SessionModeBadge,
  SessionProgressHeader,
  SessionStatusBadge,
} from "@/components/sessions/SessionFlowShared";
import { SquircleIconButton } from "@/components/ui/design-system/SquircleIconButton";
import { Colors } from "@/constants/Colors";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { usePastorSessions } from "@/hooks/roadmaps/usePastorSessions";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { phaseLabelForSessionNumber } from "@/utils/sessionPhase";
import {
  sessionOrdinalLabel,
  sessionTopicSubtitle,
} from "@/constants/sessionTitles";
import { getAppointmentJoinUrl } from "@/utils/meetingLinkDetails";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const TAB_SCENE_BOTTOM = Colors.darkBlueGradientOne;

type EnrichedSession = MentorshipSession & {
  mentorName?: string;
  meetingLink?: string;
  phase?: string;
};

export default function PastorSessionsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const pastorId = user?.id;
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const listBottomPad = tabBarHeight + Math.max(insets.bottom, 12) + 8;

  const { data: sessions = [], isLoading, isError, refetch, isRefetching } =
    usePastorSessions(pastorId);
  const { appointments = [], refetch: refetchAppointments } = useAppointments({ userId: pastorId });
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
        meetingLink:
          getAppointmentJoinUrl(apt) ?? s.meetingLink ?? undefined,
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
    <SafeAreaView
      style={[styles.safe, { backgroundColor: TAB_SCENE_BOTTOM }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[...sessionGradientColors]} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <SquircleIconButton
              icon="chevron-back"
              accessibilityLabel="Go back"
              prominent
              onPress={() => {
                if (navigation.canGoBack()) router.back();
                else router.replace("/(pastor)/(tabs)" as any);
              }}
            />
            <View style={styles.headerTextBlock}>
              <Text style={styles.heading}>Mentorship Sessions</Text>
              <Text style={styles.sub}>
                Track your journey, join meetings, and see what is next.
              </Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.fillRest}>
            <SessionListSkeleton rows={6} />
          </View>
        ) : isError && displayList.length === 0 ? (
          <View style={[styles.center, styles.fillRest]}>
            <Text style={styles.stateText}>Could not load sessions.</Text>
            <Pressable onPress={() => refetch()} style={styles.retry}>
              <Text style={styles.retryText}>
                {isRefetching ? "Retrying..." : "Retry"}
              </Text>
            </Pressable>
          </View>
        ) : displayList.length === 0 ? (
          <View style={[styles.center, styles.fillRest]}>
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
              style={styles.listFlex}
              data={displayList}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.list,
                {
                  flexGrow: 1,
                  paddingBottom: listBottomPad,
                },
              ]}
              renderItem={({ item }) => {
                const topic = sessionTopicSubtitle(item.sessionNumber);
                return (
                <Pressable
                  style={[styles.card, sessionCardHighlightStyle(item.id === nextSessionId)]}
                  onPress={() =>
                    router.push(`/(pastor)/(tabs)/sessions/${item.id}` as any)
                  }
                >
                  <View style={styles.cardTop}>
                    <View style={styles.titleBlock}>
                      <View style={styles.sessionTitleCol}>
                        {topic ? (
                          <>
                            <Text
                              style={styles.sessionNameTitle}
                              numberOfLines={3}
                            >
                              {topic}
                            </Text>
                            <Text style={styles.sessionOrdinalSmall}>
                              {sessionOrdinalLabel(item.sessionNumber)}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.sessionNameTitle}>
                            {sessionOrdinalLabel(item.sessionNumber)}
                          </Text>
                        )}
                      </View>
                      {item.id === nextSessionId ? (
                        <View style={styles.currentPill}>
                          <Text style={styles.currentPillText}>Current</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.badgeStack}>
                      <SessionModeBadge sessionMode={item.sessionMode} compact />
                      <SessionStatusBadge status={item.status} compact />
                    </View>
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
              );
              }}
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
  },
  fillRest: { flex: 1 },
  listFlex: { flex: 1 },
  gradientBare: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 4 },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTextBlock: { flex: 1, minWidth: 0 },
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
  list: {},
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
  badgeStack: {
    alignItems: "flex-end",
    gap: 6,
  },
  titleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  sessionTitleCol: { flex: 1, minWidth: 0 },
  sessionNameTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  sessionOrdinalSmall: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginTop: 5,
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

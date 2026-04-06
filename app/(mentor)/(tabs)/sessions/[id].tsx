import {
  ActionsSection,
  DetailScreenSkeleton,
  formatSessionTime,
  getNextSessionId,
  NoteCard,
  NotesSection,
  SessionConfirmModal,
  sessionGradientColors,
  SessionMetaRow,
  SessionProgressHeader,
  SessionStatusBadge,
} from "@/components/sessions/SessionFlowShared";
import { MentorSessionEnrichmentSection } from "@/components/sessions/mentor/MentorSessionEnrichmentSection";
import { MENTOR_MEETING_UI } from "@/components/sessions/mentor/mentorSessionMeetingConfig";
import { MeetingJoinDetails } from "@/components/sessions/pastor/MeetingJoinDetails";
import { Colors } from "@/constants/Colors";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useCompleteSession } from "@/hooks/roadmaps/useCompleteSession";
import { useMentorshipSessions } from "@/hooks/roadmaps/useMentorshipSessions";
import { useRedoSession } from "@/hooks/roadmaps/useRedoSession";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const TAB_SCENE_BOTTOM = Colors.darkBlueGradientOne;

function normalizeMeetingUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export default function SessionDetailsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const scrollBottomPad = tabBarHeight + Math.max(insets.bottom, 12) + 16;
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = Array.isArray(id) ? id[0] : id;
  const { data: sessions = [], isLoading: isLoadingSessions } =
    useMentorshipSessions(user?.id);

  const session = useMemo<MentorshipSession | null>(() => {
    if (!sessionId) return null;
    return sessions.find((s) => s.id === sessionId) ?? null;
  }, [sessions, sessionId]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber),
    [sessions],
  );

  const nextSessionId = useMemo(
    () => getNextSessionId(sortedSessions),
    [sortedSessions],
  );

  /** Mentor-side list (may omit some fields). */
  const { appointments: mentorAppointments = [] } = useAppointments({
    mentorId: user?.id,
  });
  /** Same appointment is often visible on the mentee/pastor user — use for meeting link fallback. */
  const { appointments: menteeAppointments = [] } = useAppointments({
    userId: session?.pastorId,
  });

  const { mutateAsync: completeSessionAsync, isPending: isCompleting } =
    useCompleteSession();
  const { mutateAsync: redoSessionAsync, isPending: isRedoing } = useRedoSession(
    {
      onBeforeInvalidate: () => {
        router.replace("/(mentor)/(tabs)/sessions");
      },
    },
  );
  const isMutating = isCompleting || isRedoing;
  const completeActionInFlightRef = useRef(false);
  const redoActionInFlightRef = useRef(false);

  const [confirmKind, setConfirmKind] = useState<"complete" | "redo" | null>(
    null,
  );

  const appointment = useMemo(() => {
    if (!session?.appointmentId) return undefined;
    const id = String(session.appointmentId);
    return (
      mentorAppointments.find((a) => String(a.id) === id) ??
      menteeAppointments.find((a) => String(a.id) === id)
    );
  }, [session?.appointmentId, mentorAppointments, menteeAppointments]);

  const isScheduled = session?.status === "SCHEDULED";
  const apiMeetingLink = appointment?.meetingLink?.trim();

  const showPlaceholderMeeting =
    MENTOR_MEETING_UI.usePlaceholderUntilBackend &&
    isScheduled &&
    !apiMeetingLink;

  const meetingLinkForUi =
    apiMeetingLink ||
    (showPlaceholderMeeting ? MENTOR_MEETING_UI.placeholderMeetingLink : undefined);

  const platformForUi =
    appointment?.platform ?? MENTOR_MEETING_UI.placeholderPlatform;

  const isPlaceholderMeetingUi = showPlaceholderMeeting;

  const showJoinButton = isScheduled && !!meetingLinkForUi;

  const isCompleted = session?.status === "COMPLETED";
  const canComplete = !!session?.appointmentId && !isCompleted;
  /** Redo uses the same appointment; allowed after completion so mentors can schedule again. */
  const canRedo = !!session?.appointmentId;
  const canRetryLookup = !isLoadingSessions && !!user?.id;

  const handleJoinMeeting = () => {
    if (!meetingLinkForUi) return;
    if (isPlaceholderMeetingUi) {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Preview",
        text2:
          "The real meeting link will come from your backend. Turn off placeholder in mentorSessionMeetingConfig when ready.",
      });
      return;
    }
    const url = normalizeMeetingUrl(apiMeetingLink!);
    Linking.openURL(url).catch(() => {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Unable to open link",
        text2: "Check your meeting link in appointments.",
      });
    });
  };

  const getFriendlyError = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message.trim().length > 0) {
      return error.message;
    }
    return fallback;
  };

  const runComplete = async () => {
    const appointmentId = session?.appointmentId;
    if (!appointmentId) {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Missing appointment",
        text2: "Appointment ID is not available for this session.",
      });
      return;
    }
    if (completeActionInFlightRef.current) return;
    completeActionInFlightRef.current = true;
    try {
      const response = await completeSessionAsync(appointmentId);
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Session completed",
        text2: response.message || "Session marked as completed.",
      });
    } catch (error: unknown) {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Could not complete session",
        text2: getFriendlyError(
          error,
          "Unable to complete this session right now. Please try again.",
        ),
      });
    } finally {
      completeActionInFlightRef.current = false;
    }
  };

  const runRedo = async () => {
    const appointmentId = session?.appointmentId;
    if (!appointmentId) {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Missing appointment",
        text2: "Appointment ID is not available for this session.",
      });
      return;
    }
    if (redoActionInFlightRef.current) return;
    redoActionInFlightRef.current = true;
    try {
      const response = await redoSessionAsync(appointmentId);
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Redo scheduled",
        text2: response.message || "Session marked for redo.",
      });
    } catch (error: unknown) {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Could not redo session",
        text2: getFriendlyError(
          error,
          "Unable to redo this session right now. Please try again.",
        ),
      });
    } finally {
      redoActionInFlightRef.current = false;
    }
  };

  const handleCompleteSession = () => {
    if (isCompleting || completeActionInFlightRef.current) return;
    if (!session?.appointmentId) {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Missing appointment",
        text2: "Appointment ID is not available.",
      });
      return;
    }
    setConfirmKind("complete");
  };

  const handleRedoSession = () => {
    if (isRedoing || redoActionInFlightRef.current) return;
    if (!session?.appointmentId) {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Missing appointment",
        text2: "Appointment ID is not available.",
      });
      return;
    }
    setConfirmKind("redo");
  };

  const onConfirmModal = () => {
    const kind = confirmKind;
    if (kind == null) return;
    setConfirmKind(null);
    // Close modal first; run mutations after so the dialog dismisses immediately.
    requestAnimationFrame(() => {
      if (kind === "complete") void runComplete();
      else if (kind === "redo") void runRedo();
    });
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: TAB_SCENE_BOTTOM }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SessionConfirmModal
        visible={confirmKind !== null}
        kind={confirmKind}
        onCancel={() => setConfirmKind(null)}
        onConfirm={onConfirmModal}
      />
      <LinearGradient colors={[...sessionGradientColors]} style={styles.gradient}>
        <View style={styles.topRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.heading}>Session</Text>
        </View>

        {isLoadingSessions ? (
          <View style={styles.fillRest}>
            <DetailScreenSkeleton />
          </View>
        ) : !session ? (
          <View style={[styles.emptyWrap, styles.fillRest]}>
            <Text style={styles.emptyText}>
              Session details are not available right now.
            </Text>
            {canRetryLookup && (
              <Pressable
                style={styles.retryButton}
                onPress={() =>
                  router.replace(`/(mentor)/(tabs)/sessions/${sessionId}`)
                }
              >
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <ScrollView
            style={styles.scrollFlex}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: scrollBottomPad },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <SessionProgressHeader
              sessions={sortedSessions}
              nextSessionId={nextSessionId}
            />

            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View>
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
              {session.pastorName ? (
                <SessionMetaRow
                  icon="person-outline"
                  label={`Pastor ${session.pastorName}`}
                />
              ) : null}
            </View>

            {meetingLinkForUi ? (
              <View style={styles.meetingBlock}>
                {isPlaceholderMeetingUi ? (
                  <Text style={styles.meetingPreviewNote}>
                  
                  </Text>
                ) : null}
                <MeetingJoinDetails
                  meetingLink={meetingLinkForUi}  
                  platform={platformForUi}
                />
                {showJoinButton ? (
                  <Pressable
                    style={[
                      styles.joinBtn,
                      isPlaceholderMeetingUi && styles.joinBtnPreview,
                    ]}
                    onPress={handleJoinMeeting}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isPlaceholderMeetingUi
                        ? "Join meeting (preview)"
                        : "Join meeting"
                    }
                  >
                    <Ionicons name="videocam" size={22} color="#153C5A" />
                    <Text style={styles.joinBtnText}>
                      {isPlaceholderMeetingUi ? "Join meeting (preview)" : "Join meeting"}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : isScheduled && session.appointmentId ? (
              <View style={styles.meetingHint}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="rgba(255,255,255,0.75)"
                />
                <Text style={styles.meetingHintText}>
                  Meeting link will appear when it is added to the appointment.
                </Text>
              </View>
            ) : null}

            <NotesSection>
              <NoteCard title="Mentor note" value={session.mentorNote} />
            </NotesSection>

            <MentorSessionEnrichmentSection
              transcript={session.transcript}
              aiSummary={session.aiSummary}
            />

            <Pressable
              style={styles.insightsCta}
              onPress={() =>
                router.push("/(mentor)/(tabs)/sessions/insights")
              }
              accessibilityRole="button"
              accessibilityLabel="Open Mentorship Insights"
            >
              <View style={styles.insightsCtaIcon}>
                <Ionicons
                  name="analytics-outline"
                  size={24}
                  color="rgba(255,255,255,0.9)"
                />
              </View>
              <View style={styles.insightsCtaTextWrap}>
                <Text style={styles.insightsCtaTitle}>Mentorship Insights</Text>
                <Text style={styles.insightsCtaSub}>
                  Cross-session AI highlights and trends
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255,255,255,0.55)"
              />
            </Pressable>

            <ActionsSection>
              <View style={styles.sessionActionStack}>
                <Pressable
                  style={[
                    styles.primaryBtn,
                    (!canComplete || isMutating) && styles.btnDisabled,
                  ]}
                  onPress={handleCompleteSession}
                  disabled={!canComplete || isMutating}
                >
                  {isCompleting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <View style={styles.primaryIconBadge}>
                        <Ionicons name="checkmark" size={17} color="#15803D" />
                      </View>
                      <Text style={styles.primaryBtnText}>
                        {isCompleted ? "Session completed" : "Mark as completed"}
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.secondaryBtn,
                    (!canRedo || isMutating) && styles.btnDisabled,
                  ]}
                  onPress={handleRedoSession}
                  disabled={!canRedo || isMutating}
                >
                  {isRedoing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="refresh" size={22} color="#FFFFFF" />
                      <Text style={styles.secondaryBtnText}>Redo session</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ActionsSection>
          </ScrollView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  fillRest: { flex: 1 },
  scrollFlex: { flex: 1 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  backButton: {
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
  backText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 40,
  },
  emptyText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  scrollContent: {
    flexGrow: 1,
    gap: 4,
  },
  meetingBlock: {
    gap: 14,
    marginBottom: 8,
  },
  meetingPreviewNote: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginBottom: -4,
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
  joinBtnText: {
    color: "#0F2847",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  joinBtnPreview: {
    opacity: 0.92,
  },
  meetingHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  meetingHintText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  insightsCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  insightsCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  insightsCtaTextWrap: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  insightsCtaTitle: {
    color: "rgba(255,255,255,0.96)",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  insightsCtaSub: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 13,
    lineHeight: 19,
  },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 8,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  heroKicker: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginVertical: 14,
  },
  sessionActionStack: {
    width: "100%",
    gap: 14,
  },
  primaryBtn: {
    backgroundColor: "#22C55E",
    borderRadius: 999,
    paddingVertical: 16,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    alignSelf: "stretch",
  },
  primaryIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 999,
    paddingVertical: 16,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    alignSelf: "stretch",
  },
  secondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  btnDisabled: {
    opacity: 0.55,
  },
  retryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: "#153C5A",
    fontWeight: "800",
  },
});

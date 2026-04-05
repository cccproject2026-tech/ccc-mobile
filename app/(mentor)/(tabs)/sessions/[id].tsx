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
import { Colors } from "@/constants/Colors";
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
  const { mutateAsync: completeSessionAsync, isPending: isCompleting } =
    useCompleteSession();
  const { mutateAsync: redoSessionAsync, isPending: isRedoing } =
    useRedoSession();
  const isMutating = isCompleting || isRedoing;
  const completeActionInFlightRef = useRef(false);
  const redoActionInFlightRef = useRef(false);

  const [confirmKind, setConfirmKind] = useState<"complete" | "redo" | null>(
    null,
  );

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

  const isCompleted = session?.status === "COMPLETED";
  const canComplete = !!session?.appointmentId && !isCompleted;
  const canRedo = !!session?.appointmentId && !isCompleted;
  const canRetryLookup = !isLoadingSessions && !!user?.id;

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

            <NotesSection>
              <NoteCard title="Mentor note" value={session.mentorNote} />
              <NoteCard title="Pastor note" value={session.pastorNote} />
            </NotesSection>

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
                        {isCompleted ? "Session completed" : "Complete session"}
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
                      <Text style={styles.secondaryBtnText}>
                        {isCompleted ? "Redo unavailable" : "Redo session"}
                      </Text>
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
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
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

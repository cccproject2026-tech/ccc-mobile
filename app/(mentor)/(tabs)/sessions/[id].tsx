import { useCompleteSession } from "@/hooks/roadmaps/useCompleteSession";
import { useMentorshipSessions } from "@/hooks/roadmaps/useMentorshipSessions";
import { useRedoSession } from "@/hooks/roadmaps/useRedoSession";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
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
      {value && value.trim().length > 0 ? value : "No note available."}
    </Text>
  </View>
);

export default function SessionDetailsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = Array.isArray(id) ? id[0] : id;
  const { data: sessions = [], isLoading: isLoadingSessions } = useMentorshipSessions(
    user?.id,
  );
  const { mutateAsync: completeSessionAsync, isPending: isCompleting } =
    useCompleteSession();
  const { mutateAsync: redoSessionAsync, isPending: isRedoing } =
    useRedoSession();
  const isMutating = isCompleting || isRedoing;
  const completeActionInFlightRef = useRef(false);
  const redoActionInFlightRef = useRef(false);

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

  const handleCompleteSession = async () => {
    if (isCompleting || completeActionInFlightRef.current) {
      return;
    }
    const appointmentId = session?.appointmentId;
    if (!appointmentId) {
      Alert.alert("Missing appointment", "Appointment ID is not available.");
      return;
    }

    Alert.alert(
      "Complete Session",
      "Are you sure you want to mark this session as completed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Complete",
          onPress: async () => {
            if (completeActionInFlightRef.current) {
              return;
            }
            completeActionInFlightRef.current = true;
            try {
              const response = await completeSessionAsync(appointmentId);
              Alert.alert(
                "Success",
                response.message || "Session marked as completed.",
              );
            } catch (error: unknown) {
              Alert.alert(
                "Failed to complete session",
                getFriendlyError(
                  error,
                  "Unable to complete this session right now. Please try again.",
                ),
              );
            } finally {
              completeActionInFlightRef.current = false;
            }
          },
        },
      ],
    );
  };

  const handleRedoSession = async () => {
    if (isRedoing || redoActionInFlightRef.current) {
      return;
    }
    const appointmentId = session?.appointmentId;
    if (!appointmentId) {
      Alert.alert("Missing appointment", "Appointment ID is not available.");
      return;
    }

    Alert.alert(
      "Redo Session",
      "Are you sure you want to redo this session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Redo",
          onPress: async () => {
            if (redoActionInFlightRef.current) {
              return;
            }
            redoActionInFlightRef.current = true;
            try {
              const response = await redoSessionAsync(appointmentId);
              Alert.alert("Success", response.message || "Session marked for redo.");
            } catch (error: unknown) {
              Alert.alert(
                "Failed to redo session",
                getFriendlyError(
                  error,
                  "Unable to redo this session right now. Please try again.",
                ),
              );
            } finally {
              redoActionInFlightRef.current = false;
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.heading}>Session Details</Text>
        </View>

        {isLoadingSessions ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.emptyText}>Loading session details...</Text>
          </View>
        ) : !session ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              Session details are not available right now.
            </Text>
            {canRetryLookup && (
              <Pressable style={styles.retryButton} onPress={() => router.replace(`/(mentor)/(tabs)/sessions/${sessionId}`)}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.sessionTitle}>
                  Session {session.sessionNumber}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    isCompleted ? styles.statusCompleted : styles.statusScheduled,
                  ]}
                >
                  <Text style={styles.statusText}>{session.status}</Text>
                </View>
              </View>
              <Text style={styles.metaText}>
                Scheduled: {formatSessionDate(session.scheduledDate)}
              </Text>
            </View>

            <NoteCard title="Mentor Note" value={session.mentorNote} />
            <NoteCard title="Pastor Note" value={session.pastorNote} />

            <View style={styles.actionsWrap}>
              <Pressable
                style={[
                  styles.completeButton,
                  (!canComplete || isMutating) && styles.disabledButton,
                ]}
                onPress={handleCompleteSession}
                disabled={!canComplete || isMutating}
              >
                {isCompleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.completeButtonText}>
                    {isCompleted ? "Session Completed" : "Complete Session"}
                  </Text>
                )}
              </Pressable>
              <Pressable
                style={[
                  styles.redoButton,
                  (!canRedo || isMutating) && styles.disabledButton,
                ]}
                onPress={handleRedoSession}
                disabled={!canRedo || isMutating}
              >
                {isRedoing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.redoButtonText}>
                    {isCompleted ? "Redo Disabled" : "Redo Session"}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#153C5A",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  backText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 24,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  sessionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  metaText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 8,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusScheduled: {
    backgroundColor: "rgba(56, 189, 248, 0.25)",
  },
  statusCompleted: {
    backgroundColor: "rgba(34, 197, 94, 0.25)",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  noteCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 14,
  },
  noteTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  noteText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
  },
  actionsWrap: {
    marginTop: 8,
    gap: 10,
  },
  completeButton: {
    backgroundColor: "#22C55E",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  redoButton: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  redoButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  retryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: {
    color: "#153C5A",
    fontWeight: "700",
  },
});

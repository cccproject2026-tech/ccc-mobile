import {
  DetailScreenSkeleton,
  formatSessionTime,
  getNextSessionId,
  SessionConfirmModal,
  sessionGradientColors,
  SessionProgressHeader,
  SessionStatusBadge
} from "@/components/sessions/SessionFlowShared";
import { MENTOR_MEETING_UI } from "@/components/sessions/mentor/mentorSessionMeetingConfig";
import { usePastorMeetingLayout } from "@/components/sessions/pastor/usePastorMeetingLayout";
import { Colors } from "@/constants/Colors";
import {
  sessionOrdinalLabel,
  sessionTopicSubtitle,
} from "@/constants/sessionTitles";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useCompleteSession } from "@/hooks/roadmaps/useCompleteSession";
import { useMentorshipSessions } from "@/hooks/roadmaps/useMentorshipSessions";
import { useRedoSession } from "@/hooks/roadmaps/useRedoSession";
import { useAuthStore } from "@/stores";
import type { AppointmentPlatform } from "@/types/appointment.types";
import { MentorshipAiSummary, MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import {
  appointmentPlatformLabel,
  formatMeetingIdForDisplay,
  parseGoogleMeetCodeFromUrl,
  parseZoomMeetingIdFromUrl,
  truncateMiddle,
  zoomUrlHasPasscodeQuery,
} from "@/utils/meetingLinkDetails";
import { phaseLabelForSessionNumber } from "@/utils/sessionPhase";
import {
  aiSummaryForSession,
  transcriptLinesForSession,
} from "@/utils/sessionTranscriptUi";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  UIManager,
  View
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const TAB_SCENE_BOTTOM = Colors.darkBlueGradientOne;
const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============= Utility Functions =============
const normalizeMeetingUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const shareContent = async (label: string, value: string) => {
  try {
    const result = await Share.share({ message: value, title: label });
    if (result.action === Share.sharedAction) {
      Toast.show({
        type: "success",
        position: "top",
        text1: "✓ Shared",
        text2: label,
      });
    }
  } catch {
    Toast.show({
      type: "error",
      position: "top",
      text1: "Share failed",
      text2: "Long-press to copy instead",
    });
  }
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
};

// ============= Components =============
const MeetingJoinDetails = ({ meetingLink, platform }: { meetingLink: string; platform: AppointmentPlatform }) => {
  const link = meetingLink.trim();
  const zoomId = platform === "zoom" ? parseZoomMeetingIdFromUrl(link) : undefined;
  const meetCode = platform === "google_meet" ? parseGoogleMeetCodeFromUrl(link) : undefined;
  const hasZoomPasscode = platform === "zoom" && zoomUrlHasPasscodeQuery(link);

  const details = [
    { label: "Platform", value: appointmentPlatformLabel(platform), isMono: false },
    ...(zoomId ? [{ label: "Meeting ID", value: formatMeetingIdForDisplay(zoomId), isMono: true }] : []),
    ...(meetCode ? [{ label: "Meet Code", value: meetCode, isMono: true }] : []),
  ];

  return (
    <View style={joinStyles.container}>
      {details.map((detail, idx) => (
        <View key={idx} style={joinStyles.detailRow}>
          <Text style={joinStyles.label}>{detail.label}</Text>
          <View style={joinStyles.valueContainer}>
            <Text style={[joinStyles.value, detail.isMono && joinStyles.mono]} selectable>
              {detail.value}
            </Text>
            <Pressable
              accessibilityLabel={`Share ${detail.label}`}
              hitSlop={SPACING.sm}
              onPress={() => shareContent(detail.label, detail.value.replace(/\s/g, ""))}
            >
              <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.5)" />
            </Pressable>
          </View>
        </View>
      ))}

      {hasZoomPasscode && (
        <View style={joinStyles.hintContainer}>
          <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={joinStyles.hint}>
            Passcode included — will be applied automatically
          </Text>
        </View>
      )}

      <View style={joinStyles.detailRow}>
        <Text style={joinStyles.label}>Meeting Link</Text>
        <View style={joinStyles.linkContainer}>
          <Text style={joinStyles.link} selectable numberOfLines={2}>
            {truncateMiddle(link, 52)}
          </Text>
          <Pressable style={joinStyles.shareButton} onPress={() => shareContent("Meeting link", link)}>
            <Ionicons name="share-outline" size={14} color="#153C5A" />
            <Text style={joinStyles.shareText}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const NoteCard = ({ title, value, icon }: { title: string; value?: string; icon?: string }) => {
  const hasContent = value && value.trim().length > 0;
  return (
    <View style={noteStyles.card}>
      <View style={noteStyles.header}>
        {icon && <Ionicons name={icon as any} size={16} color="rgba(255,255,255,0.5)" />}
        <Text style={noteStyles.title}>{title}</Text>
      </View>
      <Text style={[noteStyles.content, !hasContent && noteStyles.empty]}>
        {hasContent ? value : "No notes yet."}
      </Text>
    </View>
  );
};

const MeetingTranscript = ({ lines }: { lines: { role: "mentor" | "pastor"; text: string }[] }) => {
  const hasContent = lines.some(line => line.text.trim());
  
  if (!hasContent) {
    return (
      <View style={transcriptStyles.emptyContainer}>
        <View style={transcriptStyles.emptyIcon}>
          <Ionicons name="chatbubbles-outline" size={32} color="rgba(255,255,255,0.25)" />
        </View>
        <Text style={transcriptStyles.emptyTitle}>No Transcript Yet</Text>
        <Text style={transcriptStyles.emptySubtitle}>Transcript will appear after the meeting</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={transcriptStyles.scroll}
      contentContainerStyle={transcriptStyles.scrollContent}
      showsVerticalScrollIndicator
      nestedScrollEnabled
    >
      {lines.map((line, idx) => {
        const isMentor = line.role === "mentor";
        return (
          <View key={idx} style={transcriptStyles.messageContainer}>
            <View style={[transcriptStyles.bubble, isMentor ? transcriptStyles.mentorBubble : transcriptStyles.pastorBubble]}>
              <View style={transcriptStyles.bubbleHeader}>
                <View style={transcriptStyles.roleBadge}>
                  <Ionicons name={isMentor ? "person" : "people"} size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={transcriptStyles.role}>{isMentor ? "Mentor" : "Pastor"}</Text>
                </View>
              </View>
              <Text style={transcriptStyles.text}>{line.text.trim()}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const MeetingSummary = ({ summary }: { summary?: MentorshipAiSummary }) => {
  const defaultSummary: MentorshipAiSummary = {
    overview: "",
    keyDiscussionPoints: "",
    adviceGiven: "",
    actionItems: "",
    nextSessionFocus: "",
  };
  
  const data = summary || defaultSummary;
  
  const sections = [
    { title: "Overview", content: data.overview, icon: "document-text", color: "#38BDF8" },
    { title: "Key Points", content: data.keyDiscussionPoints, icon: "bulb", color: "#FACC15" },
    { title: "Advice Given", content: data.adviceGiven, icon: "chatbubble", color: "#A78BFA" },
    { title: "Action Items", content: data.actionItems, icon: "checkmark-circle", color: "#34D399" },
    { title: "Next Focus", content: data.nextSessionFocus, icon: "calendar", color: "#FB923C" },
  ];

  const formatContent = (content: string) => {
    if (!content?.trim()) return null;
    return content.split(/\n/).filter(line => line.trim());
  };

  const hasAnyContent = sections.some(s => formatContent(s.content));
  
  if (!hasAnyContent) {
    return (
      <View style={summaryStyles.emptyContainer}>
        <Ionicons name="sparkles-outline" size={32} color="rgba(255,255,255,0.25)" />
        <Text style={summaryStyles.emptyTitle}>AI Summary Pending</Text>
        <Text style={summaryStyles.emptySubtitle}>Summary will be generated after the meeting</Text>
      </View>
    );
  }

  return (
    <View style={summaryStyles.container}>
      {sections.map((section, idx) => {
        const lines = formatContent(section.content);
        if (!lines) return null;
        
        return (
          <View key={idx} style={[summaryStyles.section, idx > 0 && summaryStyles.sectionWithBorder]}>
            <View style={summaryStyles.sectionHeader}>
              <Ionicons name={section.icon as any} size={18} color={section.color} />
              <Text style={summaryStyles.sectionTitle}>{section.title}</Text>
            </View>
            {lines.length === 1 ? (
              <Text style={summaryStyles.sectionContent}>{lines[0]}</Text>
            ) : (
              <View style={summaryStyles.bulletList}>
                {lines.map((line, i) => (
                  <View key={i} style={summaryStyles.bulletItem}>
                    <View style={[summaryStyles.bullet, { backgroundColor: section.color }]} />
                    <Text style={summaryStyles.bulletText}>{line}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const SessionTabs = ({ transcript, summary }: { transcript: React.ReactNode; summary: React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState<"transcript" | "summary">("transcript");
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const switchTab = (tab: "transcript" | "summary") => {
    if (activeTab === tab) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveTab(tab);
      Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    });
  };

  return (
    <View style={tabStyles.container}>
      <View style={tabStyles.header}>
        <Pressable
          style={[tabStyles.tab, activeTab === "transcript" && tabStyles.activeTab]}
          onPress={() => switchTab("transcript")}
        >
          <Ionicons name="chatbubbles" size={18} color={activeTab === "transcript" ? "#FFFFFF" : "rgba(255,255,255,0.45)"} />
          <Text style={[tabStyles.tabText, activeTab === "transcript" && tabStyles.activeTabText]}>Transcript</Text>
        </Pressable>
        <Pressable
          style={[tabStyles.tab, activeTab === "summary" && tabStyles.activeTab]}
          onPress={() => switchTab("summary")}
        >
          <Ionicons name="sparkles" size={18} color={activeTab === "summary" ? "#FFFFFF" : "rgba(255,255,255,0.45)"} />
          <Text style={[tabStyles.tabText, activeTab === "summary" && tabStyles.activeTabText]}>AI Summary</Text>
        </Pressable>
      </View>
      <Animated.View style={[tabStyles.content, { opacity: fadeAnim }]}>
        {activeTab === "transcript" ? transcript : summary}
      </Animated.View>
    </View>
  );
};

const InsightsCard = () => {
  const router = useRouter();
  
  return (
    <Pressable style={insightsStyles.container} onPress={() => router.push("/(mentor)/(tabs)/sessions/insights")}>
      <View style={insightsStyles.iconContainer}>
        <LinearGradient
          colors={["rgba(56, 189, 248, 0.2)", "rgba(56, 189, 248, 0.05)"]}
          style={insightsStyles.iconGradient}
        >
          <Ionicons name="analytics-outline" size={28} color="#38BDF8" />
        </LinearGradient>
      </View>
      <View style={insightsStyles.content}>
        <Text style={insightsStyles.title}>Mentorship Insights</Text>
        <Text style={insightsStyles.subtitle}>Cross-session AI highlights and trends</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
    </Pressable>
  );
};

// ============= Main Screen =============
export default function SessionDetailsScreen() {
  const layout = usePastorMeetingLayout();
  const router = useRouter();
  const { user } = useAuthStore();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  
  const sessionId = Array.isArray(id) ? id[0] : id;
  const { data: sessions = [], isLoading: isLoadingSessions } = useMentorshipSessions(user?.id);
  
  const session = useMemo<MentorshipSession | null>(() => {
    if (!sessionId) return null;
    return sessions.find((s) => s.id === sessionId) ?? null;
  }, [sessions, sessionId]);

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber),
    [sessions],
  );

  const nextSessionId = useMemo(() => getNextSessionId(sortedSessions), [sortedSessions]);

  const { appointments: mentorAppointments = [] } = useAppointments({ mentorId: user?.id });
  const { appointments: menteeAppointments = [] } = useAppointments({ userId: session?.pastorId });

  const { mutateAsync: completeSessionAsync, isPending: isCompleting } = useCompleteSession();
  const { mutateAsync: redoSessionAsync, isPending: isRedoing } = useRedoSession({
    onBeforeInvalidate: () => {
      router.replace("/(mentor)/(tabs)/sessions");
    },
  });
  
  const isMutating = isCompleting || isRedoing;
  const [confirmKind, setConfirmKind] = useState<"complete" | "redo" | null>(null);

  const appointment = useMemo(() => {
    if (!session?.appointmentId) return undefined;
    const id = String(session.appointmentId);
    return mentorAppointments.find((a) => String(a.id) === id) ?? menteeAppointments.find((a) => String(a.id) === id);
  }, [session?.appointmentId, mentorAppointments, menteeAppointments]);

  const isScheduled = session?.status === "SCHEDULED";
  const apiMeetingLink = appointment?.meetingLink?.trim();
  const showPlaceholderMeeting = MENTOR_MEETING_UI.usePlaceholderUntilBackend && isScheduled && !apiMeetingLink;
  const meetingLink = apiMeetingLink || (showPlaceholderMeeting ? MENTOR_MEETING_UI.placeholderMeetingLink : undefined);
  const platform = appointment?.platform ?? MENTOR_MEETING_UI.placeholderPlatform;
  const showJoinButton = isScheduled && !!meetingLink;
  const isCompleted = session?.status === "COMPLETED";
  const canComplete = !!session?.appointmentId && !isCompleted;
  const canRedo = !!session?.appointmentId;

  const handleJoin = () => {
    if (!meetingLink) return;
    if (showPlaceholderMeeting) {
      Toast.show({
        type: "info",
        position: "top",
        text1: "Preview Mode",
        text2: "Real meeting link will come from your backend",
      });
      return;
    }
    Linking.openURL(normalizeMeetingUrl(apiMeetingLink!)).catch(() => {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Cannot open link",
        text2: "Please check the meeting URL",
      });
    });
  };

  const handleComplete = async () => {
    const appointmentId = session?.appointmentId;
    if (!appointmentId) {
      Toast.show({ type: "error", position: "top", text1: "Missing appointment ID" });
      return;
    }
    try {
      const response = await completeSessionAsync(appointmentId);
      Toast.show({ type: "success", position: "top", text1: "✓ Session completed", text2: response.message });
    } catch (error) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Cannot complete session",
        text2: getErrorMessage(error, "Please try again"),
      });
    }
  };

  const handleRedo = async () => {
    const appointmentId = session?.appointmentId;
    if (!appointmentId) {
      Toast.show({ type: "error", position: "top", text1: "Missing appointment ID" });
      return;
    }
    try {
      const response = await redoSessionAsync(appointmentId);
      Toast.show({ type: "success", position: "top", text1: "✓ Redo scheduled", text2: response.message });
    } catch (error) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Cannot redo session",
        text2: getErrorMessage(error, "Please try again"),
      });
    }
  };

  const phase = session ? phaseLabelForSessionNumber(session.sessionNumber) : undefined;
  const scheduleText = session ? `${formatSessionDate(session.scheduledDate)} · ${formatSessionTime(session.scheduledDate) || "Time TBD"}` : "";
  const heroTopic = sessionTopicSubtitle(session?.sessionNumber);

  if (isLoadingSessions) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <LinearGradient colors={sessionGradientColors} style={styles.gradient}>
          <DetailScreenSkeleton />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <LinearGradient colors={sessionGradientColors} style={styles.gradient}>
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyStateTitle}>Session Not Found</Text>
            <Text style={styles.emptyStateSubtitle}>The session you're looking for doesn't exist</Text>
            <Pressable style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SessionConfirmModal
        visible={confirmKind !== null}
        kind={confirmKind}
        onCancel={() => setConfirmKind(null)}
        onConfirm={() => {
          const kind = confirmKind;
          setConfirmKind(null);
          if (kind === "complete") handleComplete();
          else if (kind === "redo") handleRedo();
        }}
      />
      <LinearGradient colors={sessionGradientColors} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Session Details</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + Math.max(insets.bottom, SPACING.lg) + SPACING.xxxl }
          ]}
          nestedScrollEnabled
        >
          {/* Progress */}
          <View style={styles.progressSection}>
            <SessionProgressHeader sessions={sortedSessions} nextSessionId={nextSessionId} />
          </View>

          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroInfo}>
                <Text style={styles.heroBadge}>Session {session.sessionNumber}</Text>
                <Text style={styles.heroTitle}>{heroTopic || sessionOrdinalLabel(session.sessionNumber)}</Text>
                {heroTopic && <Text style={styles.heroSubtitle}>{sessionOrdinalLabel(session.sessionNumber)}</Text>}
              </View>
              <SessionStatusBadge status={session.status} />
            </View>

            <View style={styles.divider} />

            <View style={styles.metaGrid}>
              {session.pastorName && (
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={16} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.metaLabel}>Pastor</Text>
                  <Text style={styles.metaValue}>{session.pastorName}</Text>
                </View>
              )}
              {phase && (
                <View style={styles.metaItem}>
                  <Ionicons name="flag-outline" size={16} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.metaLabel}>Phase</Text>
                  <Text style={styles.metaValue}>{phase}</Text>
                </View>
              )}
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.5)" />
                <Text style={styles.metaLabel}>Date & Time</Text>
                <Text style={styles.metaValue}>{scheduleText}</Text>
              </View>
            </View>
          </View>

          {/* Meeting Section */}
          {meetingLink && (
            <View style={styles.meetingSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="videocam-outline" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.sectionTitle}>Meeting Details</Text>
              </View>
              <MeetingJoinDetails meetingLink={meetingLink} platform={platform} />
              {showJoinButton && (
                <Pressable style={styles.joinButton} onPress={handleJoin}>
                  <Ionicons name="videocam" size={20} color="#153C5A" />
                  <Text style={styles.joinButtonText}>Join Meeting</Text>
                  <Ionicons name="arrow-forward" size={18} color="#153C5A" />
                </Pressable>
              )}
            </View>
          )}

          {isScheduled && session.appointmentId && !meetingLink && (
            <View style={styles.waitingCard}>
              <Ionicons name="time-outline" size={24} color="rgba(255,255,255,0.5)" />
              <View style={styles.waitingContent}>
                <Text style={styles.waitingTitle}>Waiting for Meeting Link</Text>
                <Text style={styles.waitingText}>The meeting link will appear here once added to the appointment</Text>
              </View>
            </View>
          )}

          {/* Notes & Transcript Section */}
          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.sectionTitle}>Session Notes</Text>
            </View>
            <NoteCard title="Mentor Notes" value={session.mentorNote} icon="create-outline" />
          </View>

          <View style={styles.contentSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubbles-outline" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.sectionTitle}>Conversation</Text>
            </View>
            <SessionTabs
              transcript={<MeetingTranscript lines={transcriptLinesForSession(session)} />}
              summary={<MeetingSummary summary={aiSummaryForSession(session)} />}
            />
          </View>

          {/* Insights Card */}
          <InsightsCard />

          {/* Actions */}
          <View style={styles.actionsSection}>
            <Pressable
              style={[styles.primaryButton, (!canComplete || isMutating) && styles.buttonDisabled]}
              onPress={() => setConfirmKind("complete")}
              disabled={!canComplete || isMutating}
            >
              {isCompleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.primaryButtonIcon}>
                    <Ionicons name="checkmark" size={18} color="#15803D" />
                  </View>
                  <Text style={styles.primaryButtonText}>
                    {isCompleted ? "Completed" : "Mark as Completed"}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, (!canRedo || isMutating) && styles.buttonDisabled]}
              onPress={() => setConfirmKind("redo")}
              disabled={!canRedo || isMutating}
            >
              {isRedoing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.secondaryButtonText}>Schedule Repeat Session</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ============= Styles =============
const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  backText: { color: "#FFFFFF", fontWeight: "600", fontSize: 15 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  scrollContent: { flexGrow: 1, gap: SPACING.xl },
  progressSection: { marginTop: SPACING.xs },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  heroInfo: { flex: 1 },
  heroBadge: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  heroTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "700", lineHeight: 32, marginBottom: SPACING.xs },
  heroSubtitle: { color: "rgba(255,255,255,0.4)", fontSize: 14 },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", marginVertical: SPACING.lg },
  metaGrid: { gap: SPACING.md },
  metaItem: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  metaLabel: { color: "rgba(255,255,255,0.4)", fontSize: 13, minWidth: 70 },
  metaValue: { color: "rgba(255,255,255,0.9)", fontSize: 13, flex: 1 },
  meetingSection: { gap: SPACING.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { color: "rgba(255,255,255,0.7)", fontSize: 16, fontWeight: "600" },
  joinButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  joinButtonText: { color: "#153C5A", fontSize: 16, fontWeight: "700" },
  waitingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  waitingContent: { flex: 1, gap: SPACING.xs },
  waitingTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  waitingText: { color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 19 },
  contentSection: { gap: SPACING.md },
  actionsSection: { gap: SPACING.md, marginTop: SPACING.sm },
  primaryButton: {
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  primaryButtonIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  buttonDisabled: { opacity: 0.5 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: SPACING.md, padding: SPACING.xxxl },
  emptyStateTitle: { color: "rgba(255,255,255,0.7)", fontSize: 18, fontWeight: "600" },
  emptyStateSubtitle: { color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center" },
  retryButton: { backgroundColor: "#FFFFFF", paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: 12 },
  retryButtonText: { color: "#153C5A", fontWeight: "700", fontSize: 15 },
});

const joinStyles = StyleSheet.create({
  container: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: SPACING.lg, gap: SPACING.md },
  detailRow: { gap: SPACING.xs },
  label: { color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  valueContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SPACING.sm },
  value: { color: "rgba(255,255,255,0.9)", fontSize: 14, flex: 1 },
  mono: { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", letterSpacing: 0.5 },
  hintContainer: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: SPACING.xs },
  hint: { color: "rgba(255,255,255,0.45)", fontSize: 12, flex: 1 },
  linkContainer: { gap: SPACING.sm },
  link: { color: "rgba(255,255,255,0.6)", fontSize: 12, lineHeight: 18 },
  shareButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  shareText: { color: "#153C5A", fontSize: 12, fontWeight: "600" },
});

const noteStyles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  header: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginBottom: SPACING.sm },
  title: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  content: { color: "#FFFFFF", fontSize: 14, lineHeight: 21 },
  empty: { color: "rgba(255,255,255,0.35)", fontStyle: "italic" },
});

const transcriptStyles = StyleSheet.create({
  emptyContainer: { alignItems: "center", padding: SPACING.xxxl, gap: SPACING.md },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: "600" },
  emptySubtitle: { color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" },
  scroll: { maxHeight: 450 },
  scrollContent: { paddingBottom: SPACING.md },
  messageContainer: { marginBottom: SPACING.md },
  bubble: { borderRadius: 14, padding: SPACING.md },
  mentorBubble: { backgroundColor: "rgba(56, 189, 248, 0.1)", borderLeftWidth: 3, borderLeftColor: "#38BDF8" },
  pastorBubble: { backgroundColor: "rgba(255,255,255,0.05)", borderLeftWidth: 3, borderLeftColor: "rgba(255,255,255,0.3)" },
  bubbleHeader: { marginBottom: SPACING.xs },
  roleBadge: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  role: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 },
  text: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 22 },
});

const summaryStyles = StyleSheet.create({
  container: { gap: SPACING.lg },
  emptyContainer: { alignItems: "center", padding: SPACING.xxxl, gap: SPACING.md },
  emptyTitle: { color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: "600" },
  emptySubtitle: { color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" },
  section: { gap: SPACING.md },
  sectionWithBorder: { paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  sectionTitle: { color: "#FACC15", fontSize: 14, fontWeight: "700" },
  sectionContent: { color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 21, paddingLeft: SPACING.xl },
  bulletList: { gap: SPACING.md, paddingLeft: SPACING.xl },
  bulletItem: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm },
  bullet: { width: 5, height: 5, borderRadius: 2.5, marginTop: 8 },
  bulletText: { color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 21, flex: 1 },
});

const tabStyles = StyleSheet.create({
  container: { gap: SPACING.lg },
  header: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
  },
  activeTab: { backgroundColor: "rgba(255,255,255,0.12)" },
  tabText: { color: "rgba(255,255,255,0.45)", fontSize: 14, fontWeight: "600" },
  activeTabText: { color: "#FFFFFF" },
  content: { minHeight: 200 },
});

const insightsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  iconContainer: { borderRadius: 14, overflow: "hidden" },
  iconGradient: { padding: SPACING.md, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, gap: SPACING.xs },
  title: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 13 },
});
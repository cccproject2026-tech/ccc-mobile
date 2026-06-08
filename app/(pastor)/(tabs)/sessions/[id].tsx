import { buildPastorMeetingsUi } from "@/components/sessions/pastor/buildPastorMeetingsUi";
import type { PastorMeetingUi } from "@/components/sessions/pastor/pastorSessionDetail.types";
import { MeetingTranscriptChat } from "@/components/sessions/MeetingTranscriptChat";
import { usePastorMeetingLayout } from "@/components/sessions/pastor/usePastorMeetingLayout";
import {
  normalizeTranscriptLineArray,
  parseTranscriptStringToLines,
  type TranscriptParseOptions,
} from "@/lib/session/transcriptParse";
import {
    DetailScreenSkeleton,
    formatSessionTime,
    getNextSessionId,
    SessionModeBadge,
    sessionGradientColors,
    SessionProgressHeader,
    SessionStatusBadge,
} from "@/components/sessions/SessionFlowShared";
import {
  AudioPlayerCard,
  ProcessingStatus,
} from "@/components/voiceNotes";
import { Colors } from "@/constants/Colors";
import {
    sessionOrdinalLabel,
    sessionTopicSubtitle,
} from "@/constants/sessionTitles";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { usePastorSessions } from "@/hooks/roadmaps/usePastorSessions";
import apiClient from "@/services/api";
import { useAuthStore } from "@/stores";
import type { AppointmentPlatform } from "@/types/appointment.types";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import {
    appointmentPlatformLabel,
    formatMeetingIdForDisplay,
    getAppointmentJoinUrl,
    parseGoogleMeetCodeFromUrl,
    parseZoomMeetingIdFromUrl,
    truncateMiddle,
    zoomUrlHasPasscodeQuery,
} from "@/utils/meetingLinkDetails";
import { phaseLabelForSessionNumber } from "@/utils/sessionPhase";
import { resolveSessionModeForMentorshipSession } from "@/utils/sessionMeetingMode";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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
    View,
    ViewStyle,
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
};

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
        text1: "Shared successfully",
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

const getStatusLabel = (status: PastorMeetingUi["status"]): string => {
  const labels = {
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    RESCHEDULED: "Rescheduled",
  };
  return labels[status] || status;
};

const getStatusStyle = (status: PastorMeetingUi["status"]): ViewStyle => {
  const styles = {
    COMPLETED: { backgroundColor: "rgba(34, 197, 94, 0.2)" },
    CANCELLED: { backgroundColor: "rgba(248, 113, 113, 0.2)" },
    RESCHEDULED: { backgroundColor: "rgba(250, 204, 21, 0.18)" },
    SCHEDULED: { backgroundColor: "rgba(59, 130, 246, 0.25)" },
  };
  return styles[status] || styles.SCHEDULED;
};

type TranscriptSummary = {
  sessionOverview?: string;
  keyDiscussionPoints?: string[];
  mentorGuidance?: string[];
  actionItems?: string[];
};

type TranscriptSummaryApiResponse = {
  success: boolean;
  data?: {
    transcript?: string;
    summary?: TranscriptSummary;
    cached?: boolean;
  };
};

const MIN_TRANSCRIPT_CHARS = 20;

const getAppointmentTranscriptText = (apt: unknown): string => {
  if (!apt || typeof apt !== "object") return "";
  const raw = (apt as { transcript?: unknown }).transcript;
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) {
    return raw
      .map((line) =>
        typeof line === "object" && line && "text" in line
          ? String((line as { text?: string }).text ?? "")
          : "",
      )
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  return "";
};

const isTranscriptSummaryUnavailableMessage = (message: string) => {
  const lower = String(message).toLowerCase();
  return (
    lower.includes("too short") ||
    lower.includes("missing") ||
    lower.includes("not found")
  );
};

function transcriptParseOptionsForPastorSession(
  mentorName: string | undefined,
  user: { firstName?: string; lastName?: string } | null | undefined,
): TranscriptParseOptions {
  return {
    mentorName: mentorName?.trim() || undefined,
    pastorName: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : undefined,
  };
}

const mapApiSummaryToMeetingSummary = (summary?: TranscriptSummary): PastorMeetingUi["aiSummary"] => {
  const joinList = (items?: string[]) => (items?.length ? items.filter(Boolean).join("\n") : "");
  return {
    overview: summary?.sessionOverview ?? "",
    keyDiscussionPoints: joinList(summary?.keyDiscussionPoints),
    adviceGiven: joinList(summary?.mentorGuidance),
    actionItems: joinList(summary?.actionItems),
    nextSessionFocus: "",
  };
};

const MeetingJoinDetails = ({ meetingLink, platform }: { meetingLink: string; platform: AppointmentPlatform }) => {
  const link = meetingLink.trim();
  const zoomId = platform === "zoom" ? parseZoomMeetingIdFromUrl(link) : undefined;
  const meetCode = platform === "google_meet" ? parseGoogleMeetCodeFromUrl(link) : undefined;
  const hasZoomPasscode = platform === "zoom" && zoomUrlHasPasscodeQuery(link);

  const details = [
    { label: "Platform", value: appointmentPlatformLabel(platform), isMono: false },
    ...(zoomId ? [{ label: "Meeting ID", value: formatMeetingIdForDisplay(zoomId), isMono: true }] : []),
    ...(meetCode ? [{ label: "Meet code", value: meetCode, isMono: true }] : []),
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
              <Ionicons name="share-outline" size={18} color="rgba(255,255,255,0.6)" />
            </Pressable>
          </View>
        </View>
      ))}

      {hasZoomPasscode && (
        <View style={joinStyles.hintRow}>
          <Ionicons name="lock-closed-outline" size={16} color="rgba(255,255,255,0.55)" />
          <Text style={joinStyles.hint}>
            Your Zoom link includes a passcode — it will be applied automatically.
          </Text>
        </View>
      )}

      <View style={joinStyles.detailRow}>
        <Text style={joinStyles.label}>Link</Text>
        <View style={joinStyles.linkContainer}>
          <Text style={joinStyles.link} selectable numberOfLines={3}>
            {truncateMiddle(link, 52)}
          </Text>
          <Pressable style={joinStyles.shareButton} onPress={() => shareContent("Meeting link", link)}>
            <Ionicons name="share-outline" size={16} color="#153C5A" />
            <Text style={joinStyles.shareText}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const NoteCard = ({ title, value }: { title: string; value?: string }) => {
  const hasContent = value && value.trim().length > 0;
  return (
    <View style={noteStyles.card}>
      <Text style={noteStyles.title}>{title}</Text>
      <Text style={[noteStyles.content, !hasContent && noteStyles.empty]}>
        {hasContent ? value : "No note yet."}
      </Text>
    </View>
  );
};

const MeetingSummary = ({ summary }: { summary: PastorMeetingUi["aiSummary"] }) => {
  const sections = [
    { title: "Overview", content: summary.overview, icon: "document-text-outline" as const },
    { title: "Key points", content: summary.keyDiscussionPoints, icon: "bulb-outline" as const },
    { title: "Advice given", content: summary.adviceGiven, icon: "chatbubbles-outline" as const },
    { title: "Action items", content: summary.actionItems, icon: "checkmark-circle-outline" as const },
    { title: "Next focus", content: summary.nextSessionFocus, icon: "calendar-outline" as const },
  ];

  const formatContent = (content: string) => {
    if (!content?.trim()) return null;
    return content.split(/\n/).filter(line => line.trim());
  };

  return (
    <View style={summaryStyles.container}>
      {sections.map((section, idx) => {
        const lines = formatContent(section.content);
        if (!lines) return null;
        
        return (
          <View key={idx} style={[summaryStyles.section, idx > 0 && summaryStyles.sectionWithBorder]}>
            <View style={summaryStyles.sectionTitleRow}>
              <Ionicons name={section.icon} size={16} color="rgba(250, 204, 21, 0.95)" />
              <Text style={summaryStyles.sectionTitle}>{section.title}</Text>
            </View>
            {lines.length === 1 ? (
              <Text style={summaryStyles.sectionContent}>{lines[0]}</Text>
            ) : (
              lines.map((line, i) => (
                <View key={i} style={summaryStyles.bulletPoint}>
                  <View style={summaryStyles.bullet} />
                  <Text style={summaryStyles.bulletText}>{line}</Text>
                </View>
              ))
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
          <Ionicons name="chatbubbles" size={18} color={activeTab === "transcript" ? "#fff" : "rgba(255,255,255,0.5)"} />
          <Text style={[tabStyles.tabText, activeTab === "transcript" && tabStyles.activeTabText]}>Transcript</Text>
        </Pressable>
        <Pressable
          style={[tabStyles.tab, activeTab === "summary" && tabStyles.activeTab]}
          onPress={() => switchTab("summary")}
        >
          <Ionicons name="sparkles" size={18} color={activeTab === "summary" ? "#fff" : "rgba(255,255,255,0.5)"} />
          <Text style={[tabStyles.tabText, activeTab === "summary" && tabStyles.activeTabText]}>AI Summary</Text>
        </Pressable>
      </View>
      <Animated.View style={{ opacity: fadeAnim }}>
        {activeTab === "transcript" ? transcript : summary}
      </Animated.View>
    </View>
  );
};

const SessionAccordion = ({
  meeting,
  joinButton,
  checkingForTranscript,
  onRefreshTranscript,
  refreshingTranscript,
}: {
  meeting: PastorMeetingUi;
  joinButton?: React.ReactNode;
  checkingForTranscript?: boolean;
  onRefreshTranscript?: () => void;
  refreshingTranscript?: boolean;
}) => {
  const expanded = true;
  const { horizontalPad: padH, cardRadius } = usePastorMeetingLayout();

  const toggle = () => {
    
  };

  return (
    <View style={[accordionStyles.container, { borderRadius: cardRadius, paddingHorizontal: padH }]}>
      <Pressable onPress={toggle} style={accordionStyles.header}>
        <View style={accordionStyles.headerContent}>
          <View style={accordionStyles.headerLeft}>
            <View style={accordionStyles.titleRow}>
              <Text style={accordionStyles.title} numberOfLines={2}>
                {meeting.title}
              </Text>
              {meeting.isRedo && (
                <View style={accordionStyles.redoBadge}>
                  <Text style={accordionStyles.redoText}>Redo</Text>
                </View>
              )}
            </View>
            <Text style={accordionStyles.date}>
              {formatSessionDate(meeting.scheduledDate)} · {formatSessionTime(meeting.scheduledDate) || "Time TBD"}
            </Text>
          </View>
          <View style={[accordionStyles.statusBadge, getStatusStyle(meeting.status)]}>
            <Text style={accordionStyles.statusText}>{getStatusLabel(meeting.status)}</Text>
          </View>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color="rgba(255,255,255,0.5)" />
        </View>
      </Pressable>

      {joinButton && meeting.isLatest && <View style={accordionStyles.joinSection}>{joinButton}</View>}

      {expanded && (
        <View style={accordionStyles.body}>
          <View style={accordionStyles.notesSection}>
            <View style={accordionStyles.sectionTitleRow}>
              <Ionicons name="document-text-outline" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={accordionStyles.sectionTitle}>Notes</Text>
            </View>
            <NoteCard title="Pastor's Notes" value={meeting.pastorNote} />
          </View>
          <SessionTabs
            transcript={
              <MeetingTranscriptChat
                viewerRole="pastor"
                lines={meeting.transcript ?? []}
                checkingForTranscript={checkingForTranscript}
                onRefresh={onRefreshTranscript}
                refreshing={refreshingTranscript}
              />
            }
            summary={<MeetingSummary summary={meeting.aiSummary} />}
          />
        </View>
      )}
    </View>
  );
};

export default function PastorSessionDetailScreen() {
  const layout = usePastorMeetingLayout();
  const router = useRouter();
  const { user } = useAuthStore();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  
  const sessionId = Array.isArray(id) ? id[0] : id;
  const pastorId = user?.id;

  const { data: sessions = [], isLoading, refetch: refetchSessions } = usePastorSessions(pastorId);
  const { appointments = [], refetch: refetchAppointments } = useAppointments({ userId: pastorId, futureOnly: false });
  const { mentors } = useAssignedMentors(pastorId ?? null);

  const mentorMap = useMemo(() => new Map(mentors.map(m => [m.id, m.name])), [mentors]);
  const sortedSessions = useMemo(() => [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber), [sessions]);
  const nextSessionId = useMemo(() => getNextSessionId(sortedSessions), [sortedSessions]);

  const currentSession = useMemo<MentorshipSession | null>(() => {
    return sessionId ? sessions.find(s => s.id === sessionId) ?? null : null;
  }, [sessions, sessionId]);

  const appointment = useMemo(() => {
    return currentSession?.appointmentId
      ? appointments.find((a) => String(a.id) === String(currentSession.appointmentId))
      : undefined;
  }, [currentSession?.appointmentId, appointments]);

  const appointmentId = currentSession?.appointmentId ? String(currentSession.appointmentId) : undefined;
  const [transcript, setTranscript] = useState<string>("");
  const [summary, setSummary] = useState<TranscriptSummary | null>(null);
  const [loadingTranscriptSummary, setLoadingTranscriptSummary] = useState(false);
  const [transcriptSummaryError, setTranscriptSummaryError] = useState<
    "NO_TRANSCRIPT" | "SHORT_TRANSCRIPT" | "GENERAL_ERROR" | null
  >(null);
  const lastFetchedAppointmentIdRef = useRef<string | null>(null);

  const getTranscriptSummary = async (id: string, refresh = false) => {
    setLoadingTranscriptSummary(true);
    setTranscriptSummaryError(null);
    try {
      const fallbackTranscript = getAppointmentTranscriptText(appointment);
      if (
        !refresh &&
        (!fallbackTranscript || fallbackTranscript.length < MIN_TRANSCRIPT_CHARS)
      ) {
        setTranscript(fallbackTranscript);
        setSummary(null);
        setTranscriptSummaryError(
          fallbackTranscript ? "SHORT_TRANSCRIPT" : "NO_TRANSCRIPT",
        );
        return;
      }

      const cleanId = String(id).replace(/%27/g, "").replace(/['"]/g, "").trim();
      const response = await apiClient.post<TranscriptSummaryApiResponse>(
        `/appointments/pastor/${cleanId}/transcript-summary`,
        {},
        { params: { refresh }, timeout: 12000 },
      );
      const result = response.data;
      setTranscript(result?.data?.transcript || fallbackTranscript || "");
      setSummary(result?.data?.summary || null);
    } catch (e) {
      const error = e as {
        response?: { status?: number; data?: { message?: string } };
        statusCode?: number;
        message?: string;
      };
      const status = error?.response?.status ?? error?.statusCode;
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong";
      const fallbackTranscript = getAppointmentTranscriptText(appointment);

      if (
        status === 404 ||
        status === 400 ||
        isTranscriptSummaryUnavailableMessage(message)
      ) {
        setTranscript(fallbackTranscript);
        setSummary(null);
        setTranscriptSummaryError(
          fallbackTranscript.length >= MIN_TRANSCRIPT_CHARS
            ? "SHORT_TRANSCRIPT"
            : "NO_TRANSCRIPT",
        );
        return;
      }

      if (__DEV__) {
        console.warn("Transcript summary unavailable:", message);
      }

      setTranscript(fallbackTranscript);
      setSummary(null);
      setTranscriptSummaryError("GENERAL_ERROR");
    } finally {
      setLoadingTranscriptSummary(false);
    }
  };

  useEffect(() => {
    const fallbackTranscript = getAppointmentTranscriptText(appointment);

    if (!appointmentId) {
      lastFetchedAppointmentIdRef.current = null;
      setTranscript(fallbackTranscript);
      setSummary(null);
      setTranscriptSummaryError(null);
      return;
    }

    if (fallbackTranscript.length >= MIN_TRANSCRIPT_CHARS) {
      if (lastFetchedAppointmentIdRef.current === appointmentId) return;
      lastFetchedAppointmentIdRef.current = appointmentId;
      getTranscriptSummary(appointmentId, false);
      return;
    }

    lastFetchedAppointmentIdRef.current = appointmentId;
    setTranscript(fallbackTranscript);
    setSummary(null);
    setTranscriptSummaryError(
      fallbackTranscript ? "SHORT_TRANSCRIPT" : "NO_TRANSCRIPT",
    );
  }, [appointmentId, appointment]);

  useEffect(() => {
    const fallbackTranscript = (appointment as any)?.transcript;
    if (!transcript?.trim() && typeof fallbackTranscript === "string" && fallbackTranscript.trim()) {
      setTranscript(fallbackTranscript);
    }
  }, [(appointment as any)?.transcript]);

  useEffect(() => {
    if (!appointmentId) return;
    if (
      transcriptSummaryError === "NO_TRANSCRIPT" ||
      transcriptSummaryError === "SHORT_TRANSCRIPT"
    ) {
      return;
    }

    const hasStringTranscript =
      typeof (appointment as any)?.transcript === "string" &&
      (appointment as any).transcript.trim().length > 0;
    const hasArrayTranscript =
      Array.isArray((appointment as any)?.transcript) &&
      (appointment as any).transcript.length > 0;
    const hasTranscript = !!transcript?.trim() || hasStringTranscript || hasArrayTranscript;
    const hasSummary = !!summary;
    if (hasTranscript && hasSummary) return;

    const pollId = setInterval(() => {
      if (loadingTranscriptSummary) return;
      refetchAppointments();
      refetchSessions();
      getTranscriptSummary(appointmentId, false);
    }, 20000);

    return () => clearInterval(pollId);
  }, [
    appointmentId,
    transcript,
    summary,
    transcriptSummaryError,
    (appointment as any)?.transcript,
    loadingTranscriptSummary,
    refetchAppointments,
    refetchSessions,
  ]);

  useEffect(() => {
    const currentMeetingLink = getAppointmentJoinUrl(appointment);
    if (!appointmentId || currentSession?.status !== "SCHEDULED" || !!currentMeetingLink) return;

    const pollId = setInterval(() => {
      refetchAppointments();
      refetchSessions();
    }, 15000);

    return () => clearInterval(pollId);
  }, [
    appointmentId,
    currentSession?.status,
    appointment,
    refetchAppointments,
    refetchSessions,
  ]);

  const mentorName = useMemo(() => {
    if (!appointment?.mentorId) return undefined;
    return mentorMap.get(String(appointment.mentorId));
  }, [appointment?.mentorId, mentorMap]);

  const meetingLink =
    getAppointmentJoinUrl(appointment) ?? currentSession?.meetingLink ?? null;
  const sessionMode = resolveSessionModeForMentorshipSession(
    currentSession,
    appointment,
  );
  const isInPerson = sessionMode === "IN_PERSON";
  const recordingStatus =
    currentSession?.recordingStatus ??
    (appointment as any)?.recordingStatus ??
    "NOT_STARTED";
  const recordingUrl =
    currentSession?.recordingUrl ?? (appointment as any)?.recordingUrl;
  const hasStringTranscript =
    typeof (appointment as any)?.transcript === "string" &&
    (appointment as any).transcript.trim().length > 0;
  const hasArrayTranscript =
    Array.isArray((appointment as any)?.transcript) &&
    (appointment as any).transcript.length > 0;
  const hasTranscriptAvailable = !!transcript?.trim() || hasStringTranscript || hasArrayTranscript;
  const checkingForTranscript = !!appointmentId && !hasTranscriptAvailable && loadingTranscriptSummary;
  const phase = currentSession
    ? phaseLabelForSessionNumber(currentSession.sessionNumber)
    : undefined;
  const heroTopic = currentSession
    ? sessionTopicSubtitle(currentSession.sessionNumber)
    : undefined;
  const isScheduled = currentSession?.status === "SCHEDULED";
  const canJoin = isScheduled && !isInPerson && !!meetingLink;

  const meetingsUI = useMemo(() => {
    return currentSession ? buildPastorMeetingsUi(currentSession, appointment) : [];
  }, [currentSession, appointment]);

  const meetingsUiWithApiData = useMemo(() => {
    if (!meetingsUI.length) return meetingsUI;
    return meetingsUI.map((m) => ({
      ...m,
      transcript: transcript.trim()
        ? parseTranscriptStringToLines(
            transcript,
            transcriptParseOptionsForPastorSession(mentorName, user),
          )
        : Array.isArray((appointment as any)?.transcript)
          ? normalizeTranscriptLineArray(
              (appointment as any)?.transcript as any,
              transcriptParseOptionsForPastorSession(mentorName, user),
            )
          : m.transcript,
      aiSummary: summary ? mapApiSummaryToMeetingSummary(summary) : m.aiSummary,
    }));
  }, [meetingsUI, transcript, summary, (appointment as any)?.transcript, mentorName, user?.firstName, user?.lastName]);

  const handleJoin = () => {
    if (!meetingLink) return;
    Linking.openURL(normalizeMeetingUrl(meetingLink)).catch(() => {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Cannot open link",
        text2: "Please check the meeting URL",
      });
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <LinearGradient colors={sessionGradientColors} style={styles.gradient}>
          <DetailScreenSkeleton />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!currentSession) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <LinearGradient colors={sessionGradientColors} style={styles.gradient}>
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={48} color="rgba(255,255,255,0.4)" />
            <Text style={styles.emptyText}>Session not found</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={sessionGradientColors} style={styles.gradient}>
        
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
            { paddingBottom: tabBarHeight + Math.max(insets.bottom, SPACING.lg) + SPACING.xl }
          ]}
          nestedScrollEnabled
        >
          
          <View style={styles.progressSection}>
            <SessionProgressHeader sessions={sortedSessions} nextSessionId={nextSessionId} />
          </View>

          
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroInfo}>
                <Text style={styles.heroBadge}>Session Overview</Text>
                <Text style={styles.heroTitle}>
                  {heroTopic || sessionOrdinalLabel(currentSession.sessionNumber)}
                </Text>
                {heroTopic && (
                  <Text style={styles.heroSubtitle}>
                    {sessionOrdinalLabel(currentSession.sessionNumber)}
                  </Text>
                )}
              </View>
              <View style={styles.badgeStack}>
                <SessionModeBadge sessionMode={sessionMode} />
                <SessionStatusBadge status={currentSession.status} />
              </View>
            </View>

            <View style={styles.divider} />

            {(mentorName || phase) && (
              <View style={styles.metaInfo}>
                {mentorName && (
                  <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={16} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.metaText}>
                      <Text style={styles.metaLabel}>Mentor: </Text>
                      {mentorName}
                    </Text>
                  </View>
                )}
                {phase && (
                  <View style={styles.metaRow}>
                    <Ionicons name="flag-outline" size={16} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.metaText}>{phase}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          
          <View style={styles.sessionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meeting History</Text>
              <Text style={styles.sectionSubtitle}>
                Access notes, transcripts, and AI summaries for each session
              </Text>
            </View>

            {loadingTranscriptSummary && (
              <Text style={styles.sectionSubtitle}>Loading...</Text>
            )}
            {!loadingTranscriptSummary && !summary && (
              <Text style={styles.sectionSubtitle}>
                {transcriptSummaryError === "GENERAL_ERROR"
                  ? "Summary is temporarily unavailable"
                  : transcript?.trim()
                    ? "Not enough transcript to generate summary"
                    : "No transcript available (meeting not conducted)"}
              </Text>
            )}

            {meetingsUiWithApiData.map(meeting => (
              <SessionAccordion
                key={meeting.id}
                meeting={meeting}
                checkingForTranscript={checkingForTranscript}
                refreshingTranscript={loadingTranscriptSummary}
                onRefreshTranscript={() => {
                  if (!appointmentId) return;
                  lastFetchedAppointmentIdRef.current = appointmentId;
                  getTranscriptSummary(appointmentId, true);
                }}
                joinButton={
                  !isInPerson && meeting.isLatest && meetingLink ? (
                    <View style={styles.joinContainer}>
                      <MeetingJoinDetails meetingLink={meetingLink} platform={appointment?.platform ?? "zoom"} />
                      {canJoin && (
                        <Pressable style={styles.joinButton} onPress={handleJoin}>
                          <Ionicons name="videocam" size={20} color="#153C5A" />
                          <Text style={styles.joinButtonText}>Join Meeting</Text>
                          <Ionicons name="arrow-forward" size={18} color="#153C5A" />
                        </Pressable>
                      )}
                    </View>
                  ) : !isInPerson && meeting.isLatest && isScheduled && !meetingLink ? (
                    <View style={styles.waitingHint}>
                      <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.waitingText}>
                        Meeting link will appear when your mentor adds it
                      </Text>
                    </View>
                  ) : isInPerson && meeting.isLatest ? (
                    <View style={styles.inPersonReadOnly}>
                      {recordingStatus === "PROCESSING" ? (
                        <ProcessingStatus status="transcribing" />
                      ) : recordingStatus === "FAILED" ? (
                        <Text style={styles.sectionSubtitle}>
                          Recording processing failed. Your mentor may re-upload.
                        </Text>
                      ) : recordingStatus === "NOT_STARTED" ? (
                        <Text style={styles.sectionSubtitle}>
                          Waiting for your mentor to upload the in-person recording.
                        </Text>
                      ) : null}
                      {recordingUrl ? (
                        <AudioPlayerCard audioUri={recordingUrl} title="Session Recording" />
                      ) : null}
                    </View>
                  ) : undefined
                }
              />
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

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
    backgroundColor: "rgba(255,255,255,0.12)",
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
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  badgeStack: {
    alignItems: "flex-end",
    gap: SPACING.sm,
  },
  heroInfo: { flex: 1 },
  heroBadge: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 30,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: SPACING.lg,
  },
  metaInfo: { gap: SPACING.sm },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  metaLabel: { fontWeight: "600" },
  metaText: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  sessionsSection: { gap: SPACING.md },
  sectionHeader: { gap: SPACING.xs, marginBottom: SPACING.sm },
  sectionTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  sectionSubtitle: { color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 19 },
  joinContainer: { gap: SPACING.md },
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
  waitingHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: SPACING.md,
  },
  waitingText: { color: "rgba(255,255,255,0.7)", fontSize: 13, flex: 1 },
  inPersonReadOnly: { gap: SPACING.md },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: SPACING.md },
  emptyText: { color: "rgba(255,255,255,0.6)", fontSize: 16 },
});

const joinStyles = StyleSheet.create({
  container: { gap: SPACING.md },
  detailRow: { gap: SPACING.xs },
  label: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600" },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  value: { color: "rgba(255,255,255,0.9)", fontSize: 14, flex: 1 },
  mono: { fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", letterSpacing: 0.5 },
  hintRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, marginTop: SPACING.xs },
  hint: { color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 18, flex: 1 },
  linkContainer: { gap: SPACING.sm },
  link: { color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: 18 },
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
  shareText: { color: "#153C5A", fontSize: 13, fontWeight: "600" },
});

const noteStyles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  title: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600", marginBottom: SPACING.sm },
  content: { color: "#FFFFFF", fontSize: 14, lineHeight: 21 },
  empty: { color: "rgba(255,255,255,0.4)", fontStyle: "italic" },
});

const summaryStyles = StyleSheet.create({
  container: { gap: SPACING.md, padding: SPACING.md },
  section: { gap: SPACING.sm },
  sectionWithBorder: { paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  sectionTitle: { color: "#FACC15", fontSize: 14, fontWeight: "700" },
  sectionContent: { color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 21 },
  bulletPoint: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#FACC15", marginTop: 8 },
  bulletText: { color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 21, flex: 1 },
});

const tabStyles = StyleSheet.create({
  container: { gap: SPACING.lg },
  header: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.2)",
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
  activeTab: { backgroundColor: "rgba(255,255,255,0.15)" },
  tabText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: "600" },
  activeTabText: { color: "#FFFFFF" },
});

const accordionStyles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.09)",
    marginBottom: SPACING.md,
    paddingVertical: SPACING.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  header: { width: "100%" },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  headerLeft: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.xs },
  title: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", flex: 1 },
  redoBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(250,204,21,0.2)" },
  redoText: { color: "#FACC15", fontSize: 10, fontWeight: "700" },
  date: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  statusBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  joinSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.14)",
  },
  body: { marginTop: SPACING.lg, gap: SPACING.xl },
  notesSection: { gap: SPACING.md },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  sectionTitle: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
});
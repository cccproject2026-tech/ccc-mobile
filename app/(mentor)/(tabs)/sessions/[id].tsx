import {
  ActionsSection,
  DetailScreenSkeleton,
  formatSessionTime,
  getNextSessionId,
  SessionConfirmModal,
  sessionGradientColors,
  SessionProgressHeader,
  SessionStatusBadge,
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
import { MentorshipSession, MentorshipAiSummary } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { phaseLabelForSessionNumber } from "@/utils/sessionPhase";
import {
  aiSummaryForSession,
  transcriptLinesForSession,
} from "@/utils/sessionTranscriptUi";
import {
  appointmentPlatformLabel,
  formatMeetingIdForDisplay,
  parseGoogleMeetCodeFromUrl,
  parseZoomMeetingIdFromUrl,
  truncateMiddle,
  zoomUrlHasPasscodeQuery,
} from "@/utils/meetingLinkDetails";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
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
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const TAB_SCENE_BOTTOM = Colors.darkBlueGradientOne;
const SP = 16;
const TAB_MIN_HEIGHT = 48;
const TAB_FONT = 15;
const SEG_GAP = 4;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function normalizeMeetingUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

async function sharePlainText(label: string, value: string) {
  try {
    const result = await Share.share({ message: value, title: label });
    if (result.action === Share.sharedAction) {
      Toast.show({
        type: "floating",
        position: "top",
        text1: "Shared",
        text2: label,
      });
    }
  } catch {
    Toast.show({
      type: "floating",
      position: "top",
      text1: "Could not open share",
      text2: "Long-press the text above to select and copy.",
    });
  }
}

type TabKey = "transcript" | "summary";

function SessionTabs({
  transcriptSlot,
  summarySlot,
}: {
  transcriptSlot: React.ReactNode;
  summarySlot: React.ReactNode;
}) {
  const [active, setActive] = useState<TabKey>("transcript");
  const fade = useRef(new Animated.Value(1)).current;

  const animateTo = useCallback(
    (key: TabKey) => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }).start(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActive(key);
        Animated.timing(fade, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }).start();
      });
    },
    [fade],
  );

  const tabs: { key: TabKey; label: string }[] = [
    { key: "transcript", label: "Complete Transcript" },
    { key: "summary", label: "AI Summary" },
  ];

  const content = active === "transcript" ? transcriptSlot : summarySlot;

  return (
    <View style={tabsStyles.wrap}>
      <View style={tabsStyles.track}>
        {tabs.map((t) => {
          const isActive = active === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                if (!isActive) animateTo(t.key);
              }}
              style={({ pressed }) => [
                tabsStyles.segment,
                isActive ? tabsStyles.segmentOn : tabsStyles.segmentOff,
                pressed && !isActive && tabsStyles.segmentPressed,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              android_ripple={
                Platform.OS === "android"
                  ? {
                      color: "rgba(255, 255, 255, 0.14)",
                      borderless: false,
                    }
                  : undefined
              }
            >
              <Text
                numberOfLines={1}
                style={[
                  tabsStyles.label,
                  isActive ? tabsStyles.labelOn : tabsStyles.labelOff,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Animated.View style={[tabsStyles.panel, { opacity: fade }]}>
        {content}
      </Animated.View>
    </View>
  );
}

function MeetingJoinDetailsInline({
  meetingLink,
  platform,
}: {
  meetingLink: string;
  platform: AppointmentPlatform;
}) {
  const link = meetingLink.trim();
  const zoomId =
    platform === "zoom" ? parseZoomMeetingIdFromUrl(link) : undefined;
  const meetCode =
    platform === "google_meet" ? parseGoogleMeetCodeFromUrl(link) : undefined;
  const zoomPwd = platform === "zoom" && zoomUrlHasPasscodeQuery(link);

  const displayUrl = truncateMiddle(link, 52);

  return (
    <View style={joinStyles.wrap}>
      <View style={joinStyles.row}>
        <Text style={joinStyles.k}>Platform</Text>
        <Text style={joinStyles.v}>{appointmentPlatformLabel(platform)}</Text>
      </View>

      {zoomId ? (
        <View style={joinStyles.row}>
          <Text style={joinStyles.k}>Meeting ID</Text>
          <View style={joinStyles.valueWithCopy}>
            <Text style={joinStyles.vMono} selectable>
              {formatMeetingIdForDisplay(zoomId)}
            </Text>
            <Pressable
              accessibilityLabel="Share meeting ID"
              hitSlop={10}
              onPress={() =>
                sharePlainText("Meeting ID", zoomId.replace(/\s/g, ""))
              }
              style={joinStyles.copyHit}
            >
              <Ionicons
                name="share-outline"
                size={18}
                color="rgba(255,255,255,0.75)"
              />
            </Pressable>
          </View>
        </View>
      ) : null}

      {meetCode ? (
        <View style={joinStyles.row}>
          <Text style={joinStyles.k}>Meet code</Text>
          <View style={joinStyles.valueWithCopy}>
            <Text style={joinStyles.vMono} selectable>
              {meetCode}
            </Text>
            <Pressable
              accessibilityLabel="Share Meet code"
              hitSlop={10}
              onPress={() => sharePlainText("Meet code", meetCode)}
              style={joinStyles.copyHit}
            >
              <Ionicons
                name="share-outline"
                size={18}
                color="rgba(255,255,255,0.75)"
              />
            </Pressable>
          </View>
        </View>
      ) : null}

      {zoomPwd ? (
        <Text style={joinStyles.hint}>
          Your Zoom link includes a passcode — use Join meeting and your browser
          or app will apply it automatically.
        </Text>
      ) : null}

      <View style={joinStyles.row}>
        <Text style={joinStyles.k}>Link</Text>
        <View style={joinStyles.linkBlock}>
          <Text style={joinStyles.linkText} selectable numberOfLines={3}>
            {displayUrl}
          </Text>
          <Pressable
            accessibilityLabel="Share meeting link"
            style={joinStyles.copyLinkBtn}
            onPress={() => sharePlainText("Meeting link", link)}
          >
            <Ionicons name="share-outline" size={18} color="#153C5A" />
            <Text style={joinStyles.copyLinkText}>Share link</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function NoteCardInline({
  title,
  value,
  cardStyle,
}: {
  title: string;
  value?: string;
  cardStyle?: ViewStyle;
}) {
  const has = value && value.trim().length > 0;
  return (
    <View style={[noteStyles.card, cardStyle]}>
      <Text style={noteStyles.title}>{title}</Text>
      <Text style={[noteStyles.body, !has && noteStyles.empty]}>
        {has ? value : "No note yet."}
      </Text>
    </View>
  );
}

function MeetingTranscriptInline({
  lines,
}: {
  lines: { role: "mentor" | "pastor"; text: string }[];
}) {
  const { width, height: screenHeight } = useWindowDimensions();
  const transcriptMaxHeight = useMemo(() => {
    const byWidth = width * 0.55;
    const byHeight = screenHeight * 0.36;
    return Math.min(480, Math.max(220, Math.max(byWidth, byHeight)));
  }, [width, screenHeight]);
  const hasContent = lines.some((l) => l.text.trim().length > 0);

  if (!hasContent) {
    return (
      <View style={transcriptStyles.section}>
        <View style={transcriptStyles.borderBox}>
          <View
            style={[transcriptStyles.emptyWrap, transcriptStyles.emptyWrapInBox]}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={22}
              color="rgba(255,255,255,0.45)"
            />
            <Text style={transcriptStyles.emptySub}>
              No transcript is available for this meeting yet.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={transcriptStyles.section}>
      <View style={transcriptStyles.borderBox}>
        <ScrollView
          style={[transcriptStyles.scroll, { maxHeight: transcriptMaxHeight }]}
          contentContainerStyle={transcriptStyles.scrollContent}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          {lines.map((line, i) => {
            const isMentor = line.role === "mentor";
            return (
              <View key={`${i}-${line.role}`} style={transcriptStyles.row}>
                <View
                  style={[
                    transcriptStyles.bubble,
                    isMentor
                      ? transcriptStyles.bubbleMentor
                      : transcriptStyles.bubblePastor,
                    isMentor
                      ? transcriptStyles.bubbleMentorTab
                      : transcriptStyles.bubblePastorTab,
                  ]}
                >
                  <Text style={transcriptStyles.role}>
                    {isMentor ? "Mentor" : "Pastor"}
                  </Text>
                  <Text style={transcriptStyles.text}>{line.text.trim()}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

function emptyMentorAiSummary(): MentorshipAiSummary {
  return {
    overview: "",
    keyDiscussionPoints: "",
    adviceGiven: "",
    actionItems: "",
    nextSessionFocus: "",
  };
}

function MeetingAiSummaryInline({ summary }: { summary?: MentorshipAiSummary }) {
  const { width } = useWindowDimensions();
  const cardPad = useMemo(() => (width < 360 ? 14 : width < 420 ? 16 : 18), [width]);
  const s = summary ?? emptyMentorAiSummary();
  const sections: { title: string; body: string }[] = [
    { title: "Overview", body: s.overview },
    { title: "Key discussion points", body: s.keyDiscussionPoints },
    { title: "Advice given", body: s.adviceGiven },
    { title: "Action items", body: s.actionItems },
    { title: "Next session focus", body: s.nextSessionFocus },
  ];

  return (
    <View style={aiStyles.wrap}>
      <View style={[aiStyles.card, { padding: cardPad, gap: 14 }]}>
        {sections.map((sec, idx) => {
          const trimmed = (sec.body ?? "").trim();
          const empty = !trimmed;
          const lines = empty
            ? []
            : trimmed.split(/\n/).map((x) => x.trim()).filter(Boolean);
          const isLast = idx === sections.length - 1;
          return (
            <View key={sec.title} style={[aiStyles.block, !isLast && aiStyles.blockDivider]}>
              <Text style={aiStyles.blockTitle}>{sec.title}</Text>
              {empty ? (
                <Text style={aiStyles.blockEmpty}>Not available yet.</Text>
              ) : lines.length > 1 ? (
                <View style={aiStyles.bulletList}>
                  {lines.map((line, i) => (
                    <View key={`${idx}-${i}`} style={aiStyles.bulletRow}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="rgba(52, 211, 153, 0.95)"
                        style={aiStyles.bulletIcon}
                      />
                      <Text style={aiStyles.blockBody}>{line}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={aiStyles.blockBody}>{trimmed}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function SessionDetailsScreen() {
  const layout = usePastorMeetingLayout();
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

  const phase = useMemo(
    () =>
      session ? phaseLabelForSessionNumber(session.sessionNumber) : undefined,
    [session?.sessionNumber],
  );

  const scheduleText = useMemo(() => {
    if (!session) return "";
    const d = formatSessionDate(session.scheduledDate);
    const t = formatSessionTime(session.scheduledDate);
    return [d, t].filter(Boolean).join(" · ");
  }, [session]);

  const heroTopic = sessionTopicSubtitle(session?.sessionNumber);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: TAB_SCENE_BOTTOM }]}
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
          <Pressable style={styles.back} onPress={() => router.back()}>
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
              styles.scroll,
              { paddingBottom: scrollBottomPad },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.progressWrap}>
              <SessionProgressHeader
                sessions={sortedSessions}
                nextSessionId={nextSessionId}
              />
            </View>

            <View
              style={[
                styles.heroCard,
                { marginBottom: layout.sectionGapAfterHero },
              ]}
            >
              <View style={styles.heroTop}>
                <View style={styles.heroTitles}>
                  <Text style={styles.heroKicker}>Session overview</Text>
                  {heroTopic ? (
                    <>
                      <Text style={styles.heroSessionName} numberOfLines={4}>
                        {heroTopic}
                      </Text>
                      <Text style={styles.heroSessionOrdinal}>
                        {sessionOrdinalLabel(session.sessionNumber)}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.heroSessionName}>
                      {sessionOrdinalLabel(session.sessionNumber)}
                    </Text>
                  )}
                </View>
                <SessionStatusBadge status={session.status} />
              </View>

              <View style={styles.divider} />

              {session.pastorName ? (
                <Text style={styles.metaLine}>
                  <Text style={styles.metaEmphasis}>Pastor · </Text>
                  {session.pastorName}
                </Text>
              ) : null}
              {phase ? <Text style={styles.phaseLine}>{phase}</Text> : null}
              {scheduleText ? (
                <Text style={styles.scheduleLine}>{scheduleText}</Text>
              ) : null}
            </View>

            {meetingLinkForUi ? (
              <View
                style={[
                  styles.meetingBlock,
                  {
                    maxWidth: layout.feedMaxWidth,
                    alignSelf: "center",
                    width: "100%",
                  },
                ]}
              >
                {isPlaceholderMeetingUi ? (
                  <Text style={styles.meetingPreviewNote}>
                  </Text>
                ) : null}
                <MeetingJoinDetailsInline
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

            <View
              style={[
                styles.meetingsFeed,
                {
                  maxWidth: layout.feedMaxWidth,
                  marginBottom: layout.meetingsBlockBottom,
                },
              ]}
            >
              <View style={styles.meetingsFeedHeader}>
                <Text style={styles.meetingsHeading}>Sessions</Text>
                <Text style={styles.meetingsSub}>
                Session Information, Notes, Complete Meeting Transcript and AI Summary
                </Text>
              </View>
              <View style={styles.enrichmentWrap}>
                <View style={styles.notesBlock}>
                  <Text style={styles.sectionHeadline}>Notes</Text>
                  <NoteCardInline title="Mentor note" value={session.mentorNote} />
                </View>
                <SessionTabs
                  transcriptSlot={
                    <MeetingTranscriptInline
                      lines={transcriptLinesForSession(session)}
                    />
                  }
                  summarySlot={
                    <MeetingAiSummaryInline summary={aiSummaryForSession(session)} />
                  }
                />
              </View>
            </View>

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
                      <Text style={styles.secondaryBtnText}>Repeat Session</Text>
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
  safe: { flex: 1 },
  meetingsFeed: {
    width: "100%",
    alignSelf: "center",
  },
  meetingsFeedHeader: {
    marginBottom: 16,
    gap: 8,
  },
  meetingsHeading: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  meetingsSub: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    lineHeight: 21,
    flexShrink: 1,
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
  scroll: { flexGrow: 1 },
  progressWrap: { marginBottom: 6 },
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
    width: "100%",
    alignSelf: "stretch",
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
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  heroTitles: { flex: 1, minWidth: 0, flexShrink: 1 },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  metaLine: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    fontWeight: "600",
  },
  metaEmphasis: {
    color: "rgba(255,255,255,0.65)",
    fontWeight: "700",
  },
  phaseLine: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
  scheduleLine: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    marginTop: 10,
    lineHeight: 19,
  },
  heroKicker: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroSessionName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  heroSessionOrdinal: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 6,
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
  enrichmentWrap: {
    marginBottom: 8,
    width: "100%",
    minWidth: 0,
    gap: 18,
  },
  notesBlock: {
    width: "100%",
    minWidth: 0,
    gap: 12,
  },
  sectionHeadline: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

const tabsStyles = StyleSheet.create({
  wrap: {
    marginTop: 0,
    gap: 18,
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
  },
  track: {
    flexDirection: "row",
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
    padding: SEG_GAP,
    borderRadius: 14,
    gap: SEG_GAP,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  segment: {
    flex: 1,
    minWidth: 0,
    minHeight: TAB_MIN_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  segmentOn: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
  },
  segmentOff: {
    backgroundColor: "transparent",
  },
  segmentPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  label: {
    fontSize: TAB_FONT,
    fontWeight: "600",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  labelOn: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  labelOff: {
    color: "rgba(255, 255, 255, 0.55)",
    fontWeight: "600",
  },
  panel: {
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
  },
});

const joinStyles = StyleSheet.create({
  wrap: {
    gap: 12,
    marginBottom: 4,
  },
  row: {
    gap: 6,
  },
  k: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
  },
  v: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    fontWeight: "600",
  },
  vMono: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
    flex: 1,
    minWidth: 0,
  },
  valueWithCopy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  copyHit: {
    padding: 4,
  },
  hint: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 19,
  },
  linkBlock: {
    gap: 10,
  },
  linkText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    lineHeight: 18,
  },
  copyLinkBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.88)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyLinkText: {
    color: "#153C5A",
    fontSize: 14,
    fontWeight: "800",
  },
});

const noteStyles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 0,
  },
  title: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  body: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
  },
  empty: {
    color: "rgba(255,255,255,0.45)",
    fontStyle: "italic",
  },
});

const transcriptStyles = StyleSheet.create({
  section: { marginTop: SP, width: "100%", alignSelf: "stretch" },
  borderBox: {
    width: "100%",
    alignSelf: "stretch",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
    overflow: "hidden",
  },
  emptyWrap: {
    padding: SP,
    borderRadius: 12,
    backgroundColor: "transparent",
    alignItems: "center",
    gap: 8,
  },
  emptyWrapInBox: {
    marginTop: 0,
    borderWidth: 0,
    paddingVertical: 12,
  },
  emptySub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    flexShrink: 1,
  },
  scroll: { width: "100%", alignSelf: "stretch" },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 6,
    gap: 12,
  },
  row: { alignItems: "stretch", width: "100%" },
  bubble: {
    maxWidth: "100%",
    width: "100%",
    alignSelf: "stretch",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMentor: {
    backgroundColor: "rgba(125, 211, 252, 0.16)",
  },
  bubblePastor: {
    backgroundColor: "rgba(255,255,255,0.09)",
  },
  bubbleMentorTab: {
    borderLeftWidth: 4,
    borderLeftColor: "rgba(56, 189, 248, 0.85)",
  },
  bubblePastorTab: {
    borderLeftWidth: 4,
    borderLeftColor: "rgba(255,255,255,0.35)",
  },
  role: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.55)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  text: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    lineHeight: 24,
    flexShrink: 1,
  },
});

const aiStyles = StyleSheet.create({
  wrap: { marginTop: SP, width: "100%", minWidth: 0 },
  card: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  block: {
    gap: 8,
    paddingVertical: 4,
    borderRadius: 12,
    paddingHorizontal: 2,
  },
  blockDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingBottom: 14,
    marginBottom: 2,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "rgba(250, 204, 21, 0.95)",
  },
  blockBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.9)",
    flexShrink: 1,
  },
  blockEmpty: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
    color: "rgba(255,255,255,0.45)",
  },
  bulletList: {
    gap: 10,
    width: "100%",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    maxWidth: "100%",
  },
  bulletIcon: {
    marginTop: 3,
    flexShrink: 0,
  },
});

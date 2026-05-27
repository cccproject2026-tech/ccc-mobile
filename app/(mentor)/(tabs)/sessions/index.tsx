import {
  formatSessionTime,
  getNextSessionId,
  SessionConfirmModal,
  sessionGradientColors,
  SessionListSkeleton,
  SessionModeBadge,
  SessionProgressHeader,
  SessionStatusBadge
} from "@/components/sessions/SessionFlowShared";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAppointments } from "@/hooks/appointments/useAppointments";
import { useCompleteSession } from "@/hooks/roadmaps/useCompleteSession";
import { useMentorshipSessions } from "@/hooks/roadmaps/useMentorshipSessions";
import { resolveSessionModeFromSources } from "@/utils/sessionMeetingMode";
import type { SessionMode } from "@/types/appointment.types";
import { menteesService } from "@/services/mentees.service";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import {
  sessionOrdinalLabel,
  sessionTopicSubtitle,
} from "@/constants/sessionTitles";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  LayoutAnimation,
  ListRenderItem,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useQuery } from "@tanstack/react-query";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { SquircleIconButton } from "@/components/ui/design-system/SquircleIconButton";

const UNKNOWN_PASTOR_KEY = "__unknown_pastor__";

export type PastorSessionGroup = {
  pastorId: string;
  pastorName: string;
  pastorProfilePicture?: string;
  sessions: MentorshipSession[];
};

export function groupSessionsByPastor(
  sessions: MentorshipSession[],
): PastorSessionGroup[] {
  const map = new Map<
    string,
    { pastorName: string; sessions: MentorshipSession[] }
  >();

  for (const s of sessions) {
    const pastorId = s.pastorId?.trim() || UNKNOWN_PASTOR_KEY;
    const fallbackName =
      pastorId === UNKNOWN_PASTOR_KEY ? "Pastor" : pastorId;
    const nameFromSession = s.pastorName?.trim();

    let bucket = map.get(pastorId);
    if (!bucket) {
      bucket = {
        pastorName: nameFromSession || fallbackName,
        sessions: [],
      };
      map.set(pastorId, bucket);
    } else if (nameFromSession) {
      bucket.pastorName = nameFromSession;
    }
    bucket.sessions.push(s);
  }

  const groups: PastorSessionGroup[] = [];
  map.forEach((value, pastorId) => {
    const sorted = [...value.sessions].sort(
      (a, b) => a.sessionNumber - b.sessionNumber,
    );
    groups.push({
      pastorId,
      pastorName: value.pastorName,
      pastorProfilePicture: sorted.find((s) => s.pastorProfilePicture?.trim())
        ?.pastorProfilePicture,
      sessions: sorted,
    });
  });

  groups.sort((a, b) =>
    a.pastorName.localeCompare(b.pastorName, undefined, {
      sensitivity: "base",
    }),
  );
  return groups;
}

// ─── Tokens ──────────────────────────────────────────────────────────────────
const GLASS_BG        = "rgba(255,255,255,0.08)";
const GLASS_BORDER    = "rgba(255,255,255,0.14)";
const GLASS_BORDER_HI = "rgba(255,255,255,0.26)";
const TEXT_PRIMARY    = "#FFFFFF";
const TEXT_SECONDARY  = "rgba(255,255,255,0.72)";
const TEXT_MUTED      = "rgba(255,255,255,0.42)";

// Complete btn – deep emerald that matches the dark-blue scene
const COMPLETE_BG       = "#059669"; // emerald-600
const COMPLETE_BG_DONE  = "rgba(5,150,105,0.38)";
const COMPLETE_BORDER   = "rgba(6,95,70,0.55)";
const COMPLETE_ICON_BG  = "#ECFDF5";
const COMPLETE_ICON_CLR = "#065F46";

// View-details btn – mid-blue that sings against the gradient
const VIEW_BG     = "rgba(99,179,237,0.18)"; // sky-300 tint
const VIEW_BORDER = "rgba(147,210,255,0.38)";
const VIEW_TEXT   = "#BAE6FD"; // sky-200
const VIEW_ICON   = "#7DD3FC"; // sky-300

const TAB_SCENE_BOTTOM = Colors.darkBlueGradientOne;

const AVATAR_RING_SIZE    = 66;
const AVATAR_RING_PADDING = 2.5;
const AVATAR_INNER_SIZE   = AVATAR_RING_SIZE - AVATAR_RING_PADDING * 2;

// ─── SessionRow ───────────────────────────────────────────────────────────────
type SessionRowProps = {
  item: MentorshipSession;
  isCurrent: boolean;
  onView: () => void;
  onRequestComplete: () => void;
  completeBusy: boolean;
};

const SessionRow = React.memo(function SessionRow({
  item,
  isCurrent,
  onView,
  onRequestComplete,
  completeBusy,
}: SessionRowProps) {
  const isCompleted    = item.status === "COMPLETED";
  const canSubmit      = item.status === "SCHEDULED" && !!item.appointmentId;
  const completeDisabled = isCompleted || !canSubmit || completeBusy;
  const sessionTopic = sessionTopicSubtitle(item.sessionNumber);

  return (
    <View style={[styles.card, isCurrent && styles.cardCurrent]}>
      {/* Current stripe accent */}
      {isCurrent && <View style={styles.cardAccentStripe} />}

      <Pressable
        onPress={onView}
        style={({ pressed }) => [
          styles.cardBodyPressable,
          pressed && styles.cardBodyPressed,
        ]}
        android_ripple={
          Platform.OS === "android"
            ? { color: "rgba(255,255,255,0.12)" }
            : undefined
        }
        accessibilityRole="button"
        accessibilityLabel={`${sessionOrdinalLabel(item.sessionNumber)}${sessionTopic ? `, ${sessionTopic}` : ""}, view details`}
      >
        {/* Pastor identity row */}
        {(item.pastorName?.trim() || item.pastorProfilePicture) ? (
          <View style={styles.pastorIdentityRow}>
            <View style={styles.pastorAvatarWrap}>
              <Image
                source={
                  item.pastorProfilePicture
                    ? { uri: item.pastorProfilePicture }
                    : icons.myProfile
                }
                style={styles.pastorIdentityAvatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.pastorIdentityTextWrap}>
              <Text style={styles.pastorIdentityLabel}>PASTOR</Text>
              <Text style={styles.pastorIdentityName} numberOfLines={1}>
                {item.pastorName?.trim() || "Pastor"}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Header row */}
        <View style={styles.cardTop}>
          <View style={styles.cardTitleBlock}>
            <View style={styles.cardTitleTextCol}>
              {sessionTopic ? (
                <>
                  <Text style={styles.sessionNameTitle} numberOfLines={3}>
                    {sessionTopic}
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
            {isCurrent && (
              <View style={styles.currentPill}>
                <View style={styles.currentPillDot} />
                <Text style={styles.currentPillText}>Current</Text>
              </View>
            )}
          </View>
          <View style={styles.badgeStack}>
            <SessionModeBadge sessionMode={item.sessionMode} compact />
            <SessionStatusBadge status={item.status} compact />
          </View>
        </View>

        {/* Meta */}
        <View style={styles.metaDivider} />
        <View style={styles.metaBlock}>
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={14} color={TEXT_MUTED} />
            <Text style={styles.metaText}>
              {formatSessionDate(item.scheduledDate)}
            </Text>
          </View>
          <View style={styles.metaDot} />
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={14} color={TEXT_MUTED} />
            <Text style={styles.metaText}>
              {formatSessionTime(item.scheduledDate) || "Time TBD"}
            </Text>
          </View>
        </View>
        <View style={styles.metaDivider} />
      </Pressable>

      {/* Action buttons — full-width stacked */}
      <View style={styles.sessionActionsStack}>
        {/* Complete session */}
        <Pressable
          onPress={onRequestComplete}
          disabled={completeDisabled}
          accessibilityRole="button"
          accessibilityLabel={isCompleted ? "Session completed" : "Mark session complete"}
          accessibilityState={{ disabled: completeDisabled }}
          android_ripple={
            Platform.OS === "android" && !completeDisabled
              ? { color: "rgba(255,255,255,0.2)" }
              : undefined
          }
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnComplete,
            isCompleted && styles.actionBtnCompleteDone,
            completeDisabled && !isCompleted && styles.actionBtnDisabled,
            pressed && !completeDisabled && styles.actionBtnPressed,
          ]}
        >
          {completeBusy ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.actionBtnInner}>
              <View style={[
                styles.actionIconCircle,
                { backgroundColor: isCompleted ? "rgba(255,255,255,0.22)" : COMPLETE_ICON_BG },
              ]}>
                <Ionicons
                  name={isCompleted ? "checkmark-done" : "checkmark-circle"}
                  size={16}
                  color={isCompleted ? "#FFFFFF" : COMPLETE_ICON_CLR}
                />
              </View>
              <Text style={styles.actionBtnCompleteText} numberOfLines={1}>
                {isCompleted ? "Session completed" : "Mark as completed"}
              </Text>
            </View>
          )}
        </Pressable>

        {/* View details */}
        <Pressable
          onPress={onView}
          accessibilityRole="button"
          accessibilityLabel="View session details"
          android_ripple={
            Platform.OS === "android"
              ? { color: "rgba(147,210,255,0.18)" }
              : undefined
          }
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionBtnView,
            pressed && styles.actionBtnPressed,
          ]}
        >
          <View style={styles.actionBtnInner}>
            <Ionicons name="refresh-outline" size={18} color={VIEW_ICON} />
            <Text style={styles.actionBtnViewText} numberOfLines={1}>
              View Details
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
});

// ─── PastorAvatarTab ──────────────────────────────────────────────────────────
type PastorAvatarTabProps = {
  group: PastorSessionGroup;
  selected: boolean;
  onPress: () => void;
};

const PastorAvatarTab = React.memo(function PastorAvatarTab({
  group,
  selected,
  onPress,
}: PastorAvatarTabProps) {
  const { completed, total } = useMemo(() => {
    const done = group.sessions.filter((s) => s.status === "COMPLETED").length;
    return { completed: done, total: group.sessions.length };
  }, [group.sessions]);

  const hasPhoto  = !!group.pastorProfilePicture?.trim();
  const ringColors = selected
    ? (["#818CF8", "#34D399"] as const)
    : (["rgba(129,140,248,0.4)", "rgba(52,211,153,0.35)"] as const);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      android_ripple={
        Platform.OS === "android"
          ? { color: "rgba(255,255,255,0.12)" }
          : undefined
      }
      style={({ pressed }) => [
        styles.pastorAvatarTabCell,
        pressed && styles.pastorAvatarTabPressed,
      ]}
    >
      <View style={[
        styles.pastorAvatarRingWrap,
        selected && styles.pastorAvatarRingWrapSelected,
      ]}>
        <LinearGradient
          colors={[...ringColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pastorAvatarGradientRing}
        >
          <View style={[
            styles.pastorAvatarInnerDisk,
            selected && styles.pastorAvatarInnerDiskSelected,
          ]}>
            {hasPhoto ? (
              <Image
                source={{ uri: group.pastorProfilePicture! }}
                style={styles.pastorAvatarPhoto}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person-outline" size={28} color="rgba(255,255,255,0.9)" />
            )}
          </View>
        </LinearGradient>

        {/* Progress arc overlay – simple count badge */}
        <View style={[styles.progressBadge, selected && styles.progressBadgeSelected]}>
          <Text style={styles.progressBadgeText}>{completed}/{total}</Text>
        </View>
      </View>

      <Text
        style={[
          styles.pastorAvatarTabLabel,
          selected ? styles.pastorAvatarTabLabelSelected : styles.pastorAvatarTabLabelIdle,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {group.pastorName}
      </Text>
    </Pressable>
  );
});

// ─── PastorTabBar ─────────────────────────────────────────────────────────────
type PastorTabBarProps = {
  groups: PastorSessionGroup[];
  selectedPastorId: string | null;
  onSelect: (pastorId: string) => void;
};

const PastorTabBar = React.memo(function PastorTabBar({
  groups,
  selectedPastorId,
  onSelect,
}: PastorTabBarProps) {
  const keyExtractor = useCallback((item: PastorSessionGroup) => item.pastorId, []);

  const renderPastorTab = useCallback<ListRenderItem<PastorSessionGroup>>(
    ({ item }) => (
      <PastorAvatarTab
        group={item}
        selected={item.pastorId === selectedPastorId}
        onPress={() => onSelect(item.pastorId)}
      />
    ),
    [selectedPastorId, onSelect],
  );

  const tabSeparator = useCallback(
    () => <View style={styles.pastorAvatarTabSeparator} />,
    [],
  );

  if (groups.length === 0) return null;

  return (
    <View style={styles.pastorTabListWrap}>
      <FlatList
        horizontal
        data={groups}
        keyExtractor={keyExtractor}
        renderItem={renderPastorTab}
        extraData={selectedPastorId}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.pastorAvatarTabListContent}
        ItemSeparatorComponent={tabSeparator}
      />
      <LinearGradient
        colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,0.10)", "rgba(255,255,255,0.0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.pastorTabBottomRule}
      />
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SessionsScreen() {
  const router     = useRouter();
  const navigation = useNavigation();
  const { user }   = useAuthStore();
  const tabBarHeight = useBottomTabBarHeight();
  const insets       = useSafeAreaInsets();
  const listBottomPad = tabBarHeight + Math.max(insets.bottom, 12) + 8;

  const {
    data: sessions = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMentorshipSessions(user?.id);

  const { appointments: mentorAppointments = [] } = useAppointments({
    mentorId: user?.id,
    futureOnly: false,
  });

  const appointmentById = useMemo(() => {
    const map = new Map<string, (typeof mentorAppointments)[number]>();
    for (const apt of mentorAppointments) {
      map.set(String(apt.id), apt);
    }
    return map;
  }, [mentorAppointments]);

  const enrichSessionMode = useCallback((session: MentorshipSession): MentorshipSession => {
    const apt = session.appointmentId
      ? appointmentById.get(String(session.appointmentId))
      : undefined;
    const displayMode = resolveSessionModeFromSources({
      sessionMode: apt?.sessionMode ?? session.sessionMode,
      platform: apt?.platform,
    });
    const sessionMode: SessionMode =
      displayMode === "IN_PERSON" ? "IN_PERSON" : "ONLINE";
    if (session.sessionMode === sessionMode) return session;
    return { ...session, sessionMode };
  }, [appointmentById]);

  const { data: assigned = { users: [] as any[] }, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ["mentees", "assigned-lite", user?.id ?? ""],
    queryFn: () => menteesService.getAssignedMentees(user!.id),
    enabled: !!user?.id,
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      const status = error?.statusCode ?? error?.response?.status;
      if (status === 429) return false;
      return failureCount < 1;
    },
  });

  const { mutateAsync: completeSessionAsync, isPending: isCompleting } =
    useCompleteSession();
  const completeActionInFlightRef = useRef(false);
  const [confirmSession, setConfirmSession] = useState<MentorshipSession | null>(null);
  const [completingId,   setCompletingId]   = useState<string | null>(null);

  const pastorGroups = useMemo(() => {
    const groupsFromSessions = groupSessionsByPastor(
      sessions.map(enrichSessionMode),
    );

    // Ensure all assigned pastors show in the avatar bar even if a pastor's sessions
    // request was throttled/failed and returned zero sessions for that pastor.
    const assignedUsers = assigned?.users ?? [];
    if (!assignedUsers.length) return groupsFromSessions;

    const byId = new Map<string, PastorSessionGroup>(groupsFromSessions.map((g) => [g.pastorId, g]));
    for (const u of assignedUsers) {
      const pastorId = String((u as any)?._id ?? (u as any)?.id ?? "").trim();
      if (!pastorId) continue;

      if (!byId.has(pastorId)) {
        const pastorName = `${(u as any)?.firstName ?? ""} ${(u as any)?.lastName ?? ""}`.trim() || "Pastor";
        const pic = typeof (u as any)?.profilePicture === "string" ? (u as any).profilePicture : undefined;
        byId.set(pastorId, {
          pastorId,
          pastorName,
          pastorProfilePicture: pic?.trim() ? pic.trim() : undefined,
          sessions: [],
        });
      }
    }

    const merged = Array.from(byId.values());
    merged.sort((a, b) =>
      a.pastorName.localeCompare(b.pastorName, undefined, { sensitivity: "base" }),
    );
    return merged;
  }, [sessions, assigned, enrichSessionMode]);
  const [selectedPastorId, setSelectedPastorId] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    if (pastorGroups.length === 0) { setSelectedPastorId(null); return; }
    setSelectedPastorId((prev) => {
      if (prev && pastorGroups.some((g) => g.pastorId === prev)) return prev;
      const firstWithSessions = pastorGroups.find((g) => (g.sessions?.length ?? 0) > 0);
      return (firstWithSessions ?? pastorGroups[0]).pastorId;
    });
  }, [pastorGroups]);

  const activeGroup       = useMemo(() =>
    selectedPastorId ? (pastorGroups.find((g) => g.pastorId === selectedPastorId) ?? null) : null,
    [pastorGroups, selectedPastorId],
  );
  const sessionsForPastor = activeGroup?.sessions ?? [];
  const nextSessionId     = useMemo(() => getNextSessionId(sessionsForPastor), [sessionsForPastor]);

  const getFriendlyError = useCallback((error: unknown, fallback: string) => {
    if (error instanceof Error && error.message.trim().length > 0) return error.message;
    return fallback;
  }, []);

  const handleSelectPastor = useCallback((pastorId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPastorId(pastorId);
  }, []);

  const handleView = useCallback(
    (sessionId: string) => { router.push(`/(mentor)/(tabs)/sessions/${sessionId}`); },
    [router],
  );

  const runCompleteForSession = useCallback(async (session: MentorshipSession) => {
    const appointmentId = session.appointmentId;
    if (!appointmentId) {
      Toast.show({ type: "floating", position: "top", text1: "Missing appointment", text2: "Appointment ID is not available." });
      return;
    }
    if (completeActionInFlightRef.current) return;
    completeActionInFlightRef.current = true;
    setCompletingId(session.id);
    try {
      const response = await completeSessionAsync(appointmentId);
      Toast.show({ type: "floating", position: "top", text1: "Session completed", text2: response.message || "Marked as completed." });
    } catch (error: unknown) {
      Toast.show({ type: "floating", position: "top", text1: "Could not complete session", text2: getFriendlyError(error, "Please try again.") });
    } finally {
      completeActionInFlightRef.current = false;
      setCompletingId(null);
    }
  }, [completeSessionAsync, getFriendlyError]);

  const renderItem: ListRenderItem<MentorshipSession> = useCallback(
    ({ item }) => (
      <SessionRow
        item={item}
        isCurrent={item.id === nextSessionId}
        onView={() => handleView(item.id)}
        onRequestComplete={() => setConfirmSession(item)}
        completeBusy={isCompleting && completingId === item.id}
      />
    ),
    [nextSessionId, handleView, isCompleting, completingId],
  );

  const keyExtractor = useCallback((item: MentorshipSession) => item.id, []);

  const listEmpty = useMemo(() => (
    <View style={styles.tabEmptyState}>
      <Ionicons name="calendar-outline" size={32} color={TEXT_MUTED} />
      <Text style={styles.tabEmptyText}>No sessions for this pastor.</Text>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppGradientBackground style={styles.gradient}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeadingRow}>
              <SquircleIconButton
                icon="chevron-back"
                accessibilityLabel="Go back"
                prominent
                onPress={() => {
                  if (navigation.canGoBack()) router.back();
                  else router.replace("/(mentor)/(tabs)" as any);
                }}
              />
              <View style={styles.headerTitleRow}>
                <Text style={styles.heading}>Mentorship</Text>
                <View style={styles.headerAccentPill}>
                  <Text style={styles.headerAccentText}>Sessions</Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={() =>
                router.push("/(mentor)/(tabs)/sessions/insights")
              }
              style={({ pressed }) => [
                styles.insightsHeaderBtn,
                pressed && styles.insightsHeaderBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open Mentorship Insights"
            >
              <Ionicons
                name="analytics-outline"
                size={18}
                color="rgba(255,255,255,0.88)"
              />
              <Text style={styles.insightsHeaderBtnText}>Insights</Text>
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            Review sessions with your pastors and track completion.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.fillRest}><SessionListSkeleton rows={6} /></View>
        ) : isError && pastorGroups.length === 0 ? (
          <View style={[styles.centerState, styles.fillRest]}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="cloud-offline-outline" size={34} color={TEXT_MUTED} />
            </View>
            <Text style={styles.stateText}>Failed to load sessions.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>{isRefetching ? "Retrying…" : "Retry"}</Text>
            </Pressable>
          </View>
        ) : pastorGroups.length === 0 ? (
          <View style={[styles.centerState, styles.fillRest]}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={34} color={TEXT_MUTED} />
            </View>
            <Text style={styles.stateText}>No sessions found.</Text>
            <Text style={styles.stateSubtext}>
              Sessions will appear here once they are scheduled for your mentees.
            </Text>
          </View>
        ) : (
          <>
            <PastorTabBar
              groups={pastorGroups}
              selectedPastorId={selectedPastorId}
              onSelect={handleSelectPastor}
            />
            <SessionProgressHeader
              sessions={sessionsForPastor}
              nextSessionId={nextSessionId}
            />
            <FlatList
              style={styles.listFlex}
              data={sessionsForPastor}
              keyExtractor={keyExtractor}
              extraData={`${nextSessionId}-${selectedPastorId}-${isCompleting}-${completingId}`}
              renderItem={renderItem}
              ListEmptyComponent={listEmpty}
              contentContainerStyle={[styles.listContent, { flexGrow: 1, paddingBottom: listBottomPad }]}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </AppGradientBackground>

      <SessionConfirmModal
        visible={!!confirmSession}
        kind="complete"
        onCancel={() => setConfirmSession(null)}
        onConfirm={() => {
          if (!confirmSession) return;
          const sessionToComplete = confirmSession;
          setConfirmSession(null);
          void runCompleteForSession(sessionToComplete);
        }}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  gradient:  { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  fillRest:  { flex: 1 },
  listFlex:  { flex: 1 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: { marginBottom: 16 },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  headerLeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  insightsHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    flexShrink: 0,
  },
  insightsHeaderBtnPressed: { opacity: 0.88 },
  insightsHeaderBtnText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  heading: {
    color: TEXT_PRIMARY,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerAccentPill: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerAccentText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  subtitle: {
    color: TEXT_SECONDARY,
    fontSize: 13.5,
    lineHeight: 20,
  },

  // ── Pastor tab bar ───────────────────────────────────────────────────────────
  pastorTabListWrap: { marginBottom: 14, marginHorizontal: -16 },
  pastorAvatarTabListContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    alignItems: "flex-start",
  },
  pastorAvatarTabSeparator: { width: 16 },
  pastorTabBottomRule: { height: 1, marginHorizontal: 0 },

  pastorAvatarTabCell: {
    alignItems: "center",
    minWidth: 80,
    maxWidth: 110,
    paddingHorizontal: 2,
  },
  pastorAvatarTabPressed: { opacity: 0.88 },

  pastorAvatarRingWrap: { marginBottom: 8, position: "relative" },
  pastorAvatarRingWrapSelected: {
    ...Platform.select({
      ios: {
        shadowColor: "#818CF8",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  pastorAvatarGradientRing: {
    width: AVATAR_RING_SIZE,
    height: AVATAR_RING_SIZE,
    borderRadius: AVATAR_RING_SIZE / 2,
    padding: AVATAR_RING_PADDING,
    justifyContent: "center",
    alignItems: "center",
  },
  pastorAvatarInnerDisk: {
    width: AVATAR_INNER_SIZE,
    height: AVATAR_INNER_SIZE,
    borderRadius: AVATAR_INNER_SIZE / 2,
    backgroundColor: "#1E3A5F",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  pastorAvatarInnerDiskSelected: { backgroundColor: "#264873" },
  pastorAvatarPhoto: { width: AVATAR_INNER_SIZE, height: AVATAR_INNER_SIZE },

  // small badge bottom-right of avatar
  progressBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "rgba(30,58,95,0.9)",
    borderWidth: 1,
    borderColor: "rgba(129,140,248,0.35)",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  progressBadgeSelected: { borderColor: "#818CF8" },
  progressBadgeText: { color: TEXT_SECONDARY, fontSize: 9, fontWeight: "700" },

  pastorAvatarTabLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
    paddingHorizontal: 2,
  },
  pastorAvatarTabLabelIdle: { color: TEXT_SECONDARY },
  pastorAvatarTabLabelSelected: { color: TEXT_PRIMARY, fontWeight: "700" },

  // ── Card ─────────────────────────────────────────────────────────────────────
  listContent: { paddingTop: 2 },

  card: {
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardCurrent: {
    borderColor: "rgba(250,204,21,0.38)",
    backgroundColor: "rgba(250,204,21,0.06)",
  },
  cardAccentStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    bottom: 0,
    backgroundColor: "#FACC15",
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  cardBodyPressable: {},
  cardBodyPressed: {
    opacity: 0.92,
  },

  // pastor identity inside card
  pastorIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: GLASS_BORDER,
  },
  pastorAvatarWrap: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: GLASS_BORDER_HI,
    overflow: "hidden",
  },
  pastorIdentityAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  pastorIdentityTextWrap: { flex: 1, minWidth: 0 },
  pastorIdentityLabel: {
    color: TEXT_MUTED,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  pastorIdentityName: { color: TEXT_PRIMARY, fontSize: 15, fontWeight: "700" },

  // card header
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  badgeStack: {
    alignItems: "flex-end",
    gap: 6,
  },
  cardTitleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  cardTitleTextCol: { flex: 1, minWidth: 0 },
  sessionNameTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  sessionOrdinalSmall: {
    color: TEXT_MUTED,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginTop: 5,
  },

  currentPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(250,204,21,0.2)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.4)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  currentPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FDE68A",
  },
  currentPillText: { color: "#FDE68A", fontSize: 11, fontWeight: "800" },

  // meta
  metaDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: GLASS_BORDER,
    marginVertical: 10,
  },
  metaBlock: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: TEXT_MUTED,
  },
  metaText: { color: TEXT_SECONDARY, fontSize: 13 },

  // ── Action buttons — full-width stacked ──────────────────────────────────
  sessionActionsStack: {
    flexDirection: "column",
    gap: 10,
    marginTop: 6,
  },

  actionBtn: {
    width: "100%",
    minHeight: 52,
    borderRadius: 999,          // pill shape matching screenshot
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  actionBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  actionIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Complete – solid bright green (matches screenshot top btn)
  actionBtnComplete: {
    backgroundColor: "#22C55E",   // green-500 — vibrant, matches the image
    borderWidth: 1,
    borderColor: "rgba(20,83,45,0.4)",
    ...Platform.select({
      ios: {
        shadowColor: "#16A34A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  actionBtnCompleteDone: {
    backgroundColor: "rgba(34,197,94,0.32)",
    borderColor: "rgba(34,197,94,0.22)",
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
      default: {},
    }),
  },
  actionBtnCompleteText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.1,
    ...Platform.select({ android: { includeFontPadding: false }, default: {} }),
  },

  // View Details – muted glass outline (matches screenshot bottom btn)
  actionBtnView: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
  },
  actionBtnViewText: {
    color: "rgba(255,255,255,0.88)",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.1,
    ...Platform.select({ android: { includeFontPadding: false }, default: {} }),
  },

  actionBtnDisabled: { opacity: 0.45 },
  actionBtnPressed:  { opacity: 0.82 },

  // ── Empty / states ────────────────────────────────────────────────────────
  tabEmptyState: { paddingVertical: 48, alignItems: "center", gap: 10 },
  tabEmptyText:  { color: TEXT_SECONDARY, fontSize: 15, textAlign: "center" },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    minHeight: 200,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stateText: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    textAlign: "center",
    fontWeight: "600",
  },
  stateSubtext: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: GLASS_BORDER_HI,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  retryText: { color: TEXT_PRIMARY, fontWeight: "700", fontSize: 14 },
});
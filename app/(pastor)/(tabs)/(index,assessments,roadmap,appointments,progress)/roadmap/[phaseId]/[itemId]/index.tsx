import ContextMenu, { MenuItem } from "@/components/director/ContextMenu";
import ExpectedOutcomeModal from "@/components/director/ExpectedOutcomeModal";
import TopBar from "@/components/director/TopBar";
import { RoadmapMetaCard } from "@/components/roadmaps/RoadmapMetaCard";
import { TaskStatusBadges } from "@/components/roadmaps/TaskStatusBadges";
import { MentorTaskView } from "@/components/roadmaps/MentorTaskView";
import { TaskCompletionModal } from "@/components/roadmaps/celebration/TaskCompletionModal";
import { PhaseCompletionModal } from "@/components/roadmaps/celebration/PhaseCompletionModal";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import KeyboardSafeContainer from "@/components/layout/KeyboardSafeContainer";
import { Colors } from "@/constants/Colors";
import { useRoadmap, useRoadmapComments, useRoadmapQueries, useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { useCompletionCelebration } from "@/hooks/roadmap/useCompletionCelebration";
import { useRoadmapMeta } from "@/hooks/roadmap/useRoadmapMeta";
import { resolveRoadmapDetailTask } from "@/lib/roadmap/helpers";
import { comparePastorPhasesForFocus } from "@/lib/roadmap/helpers";
import type { NestedRoadmap, Roadmap } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const accent = {
  gold: "#E8C88A",
  mint: "#6FD4BE",
  mintSoft: "rgba(111, 212, 190, 0.28)",
  tealDeep: "#0E5A62",
};

export default function PastorRoadmapItemDetail() {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { phaseId, itemId } = useLocalSearchParams<{ phaseId: string; itemId: string }>();

  const { user } = useAuthStore();
  const targetUserId = user?.id;
  const { data: roadmap, isLoading, error, refetch, isRefetching } = useRoadmap(phaseId);
  const { data: comments } = useRoadmapComments(phaseId, targetUserId);
  const { data: queries } = useRoadmapQueries(phaseId, targetUserId);

  const task = useMemo<NestedRoadmap | undefined>(
    () => resolveRoadmapDetailTask(roadmap, itemId),
    [itemId, roadmap],
  );

  const { data: allRoadmaps } = useRoadmaps("pastor");
  const sortedRoadmaps = useMemo(() => {
    const list = [...(allRoadmaps ?? [])];
    list.sort((a, b) => comparePastorPhasesForFocus(a as Roadmap, b as Roadmap));
    return list as Roadmap[];
  }, [allRoadmaps]);

  const meta = useRoadmapMeta(roadmap as Roadmap | undefined, task);

  const {
    celebration,
    triggerCelebration,
    handleContinueJourney,
    handleBackToPhase,
    handleStartNextPhase,
    handleBackToJourney,
  } = useCompletionCelebration();

  const handleSaveSuccess = useCallback(() => {
    const taskName = String((task as any)?.name || task?.title || "Task");
    const triggered = triggerCelebration(
      roadmap as Roadmap | undefined,
      itemId,
      taskName,
      sortedRoadmaps,
    );
    if (!triggered) {
      router.back();
    }
  }, [task, roadmap, itemId, sortedRoadmaps, triggerCelebration, router]);

  const [activeTab, setActiveTab] = useState<"overview" | "comments" | "queries">("overview");

  const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState("");

  const outcomeMenuItems = useCallback(
    (): MenuItem[] => [
      {
        id: "outcome-4-months",
        label: "Expected Outcome - 4 Months",
        onPress: () => {
          setSelectedOutcome("Expected Outcome - First Four Months");
          setShowOutcomeMenu(false);
          setShowOutcomeModal(true);
        },
      },
      {
        id: "outcome-6-months",
        label: "Expected Outcome - 6 Months",
        onPress: () => {
          setSelectedOutcome("Expected Outcome - Six Months");
          setShowOutcomeMenu(false);
          setShowOutcomeModal(true);
        },
      },
      {
        id: "outcome-9-months",
        label: "Expected Outcome - 9 Months",
        onPress: () => {
          setSelectedOutcome("Expected Outcome - Nine Months");
          setShowOutcomeMenu(false);
          setShowOutcomeModal(true);
        },
      },
      {
        id: "outcome-end-year",
        label: "Expected Outcome - End of Year",
        onPress: () => {
          setSelectedOutcome("Expected Outcome - End of Year");
          setShowOutcomeMenu(false);
          setShowOutcomeModal(true);
        },
      },
    ],
    [],
  );

  const outcomeData = useCallback(
    () => [
      { id: "1", text: "The church is committed to the revitalization process." },
      { id: "2", text: "The Church is praying consistently and intentionally for revitalization." },
      { id: "3", text: "The church understands its current health and is committed to making improvements." },
      { id: "4", text: "The church is beginning to feel like a warm and welcoming place for new attendees." },
      { id: "5", text: "Church members have begun to build new relationships." },
      { id: "6", text: "Church members will begin to feel a sense of hope for the future." },
    ],
    [],
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const horizontalPadding = useMemo(() => {
    const v = Math.round(width * 0.05);
    return Math.max(16, Math.min(24, v));
  }, [width]);
  const maxWidth = useMemo(() => (width >= 520 ? 520 : undefined), [width]);
  const coverHeight = useMemo(() => {
    const h = Math.round(width * 0.52);
    return Math.max(170, Math.min(230, h));
  }, [width]);

  if (isLoading) {
    return (
      <AppGradientBackground>
        <TopBar role="pastor" showUserName />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading task…</Text>
        </View>
      </AppGradientBackground>
    );
  }

  return (
    <AppGradientBackground style={styles.root}>
      <View style={styles.bgCircleTop} pointerEvents="none" />
      <View style={styles.bgCircleBottom} pointerEvents="none" />
      <TopBar role="pastor" showUserName />

      <KeyboardSafeContainer
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={100}
        extraHeight={120}
        enableResetScrollToCoords={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: bottom + 140,
            paddingHorizontal: horizontalPadding,
            maxWidth,
            width: "100%",
            alignSelf: maxWidth ? "center" : undefined,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={!!isRefetching}
            onRefresh={refetch}
            tintColor="#fff"
            colors={["#fff"]}
            progressBackgroundColor="rgba(255,255,255,0.2)"
          />
        }
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={18} color="rgba(255,255,255,0.92)" />
          </Pressable>
          <View style={styles.headerPillWrap}>
            <View style={styles.pill}>
              <View style={styles.pillDots}>
                <View style={styles.pillDot} />
                <View style={styles.pillDotGold} />
              </View>
              <Text style={styles.pillText} numberOfLines={1}>
                Task details
              </Text>
            </View>
          </View>
          <Pressable onPress={() => setShowOutcomeMenu(true)} hitSlop={10} style={styles.ellipsisBtn}>
            <Ionicons name="ellipsis-vertical" size={16} color="rgba(255,255,255,0.92)" />
          </Pressable>
        </View>

        {!!error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#fff" />
            <Text style={styles.errorText}>Failed to load. Pull to refresh.</Text>
          </View>
        ) : null}

        {!task ? (
          <View style={styles.emptyCard}>
            <Ionicons name="alert-circle-outline" size={28} color="rgba(255,255,255,0.7)" />
            <Text style={styles.emptyTitle}>Task not found</Text>
            <Text style={styles.emptySubtitle}>Please go back and try again.</Text>
          </View>
        ) : (
          <>
            <View style={styles.tabRow}>
              <Pressable
                onPress={() => setActiveTab("overview")}
                style={[styles.tabButton, activeTab === "overview" ? styles.tabActive : styles.tabInactive]}
              >
                <View style={styles.tabLabelRow}>
                  <Text
                    style={[styles.tabText, activeTab === "overview" ? styles.tabTextActive : styles.tabTextInactive]}
                    numberOfLines={1}
                  >
                    Overview
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setActiveTab("comments");
                  router.push({ pathname: "/(pastor)/roadmap/comments", params: { roadmapId: phaseId } } as any);
                }}
                style={[styles.tabButton, activeTab === "comments" ? styles.tabActive : styles.tabInactive]}
              >
                <View style={styles.tabLabelRow}>
                  <Text
                    style={[styles.tabText, activeTab === "comments" ? styles.tabTextActive : styles.tabTextInactive]}
                    numberOfLines={1}
                  >
                    Comments
                  </Text>
                  {comments?.comments && comments.comments.length > 0 ? (
                    <View style={[styles.badge, activeTab === "comments" ? styles.badgeActive : styles.badgeInactive]}>
                      <Text
                        style={[styles.badgeText, activeTab === "comments" ? styles.badgeTextActive : styles.badgeTextInactive]}
                        numberOfLines={1}
                      >
                        {comments.comments.length}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>

              <Pressable
                onPress={() => {
                  setActiveTab("queries");
                  router.push({ pathname: "/(pastor)/roadmap/queries", params: { roadmapId: phaseId, taskId: task._id } } as any);
                }}
                style={[styles.tabButton, activeTab === "queries" ? styles.tabActive : styles.tabInactive]}
              >
                <View style={styles.tabLabelRow}>
                  <Text
                    style={[styles.tabText, activeTab === "queries" ? styles.tabTextActive : styles.tabTextInactive]}
                    numberOfLines={1}
                  >
                    Queries
                  </Text>
                  {Array.isArray(queries) && queries.length > 0 ? (
                    <View style={[styles.badge, activeTab === "queries" ? styles.badgeActive : styles.badgeInactive]}>
                      <Text
                        style={[styles.badgeText, activeTab === "queries" ? styles.badgeTextActive : styles.badgeTextInactive]}
                        numberOfLines={1}
                      >
                        {queries.length}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            </View>

            <View style={[styles.coverImageContainer, { height: coverHeight }]}>
              {(task as any).imageUrl ? (
                <Image source={{ uri: String((task as any).imageUrl) }} style={styles.coverImage} resizeMode="cover" />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="image-outline" size={40} color="rgba(255,255,255,0.30)" />
                </View>
              )}
              <View style={styles.coverTitleOverlay}>
                <View style={styles.coverTitleBox}>
                  <Text style={styles.coverTitleText} numberOfLines={2}>
                    {String((task as any).name || task.title || "Task")}
                  </Text>
                </View>
              </View>
            </View>

            {!meta.isMultiTask && <RoadmapMetaCard meta={meta} />}

            <View style={styles.completionBox}>
              {String(task.status || "").toLowerCase() === "completed" ? (
                <View style={styles.completionContainer}>
                  <Text style={styles.completionStatusText}>Completed</Text>
                  <View style={styles.completionInfoColumn}>
                    <Text style={styles.completionInfoText}>
                      Completed on : {formatDate((task as any).completedOn)}
                    </Text>
                    <Text style={styles.completionInfoText}>
                      Last Updated : {formatDate((roadmap as any)?.updatedAt)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.completionText}>Completion Time Months: {String((task as any).duration || "—")}</Text>
              )}
            </View>

            <TaskStatusBadges task={task} variant="pastor" />

            <Text style={styles.sectionTitle}>Roadmap</Text>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionText}>
                {String((task as any).roadMapDetails || (roadmap as any)?.roadMapDetails || (task as any).name || task.title || "")}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.sectionBox}>
              <Text style={styles.sectionText}>{String((task as any).description || "No description provided")}</Text>
            </View>

            <MentorTaskView
              task={task}
              parentRoadmap={roadmap}
              phaseId={String(phaseId)}
              itemId={String(itemId)}
              userId={targetUserId}
              onSaveSuccess={handleSaveSuccess}
            />
          </>
        )}
      </KeyboardSafeContainer>

      <ContextMenu
        visible={showOutcomeMenu}
        items={outcomeMenuItems()}
        onClose={() => setShowOutcomeMenu(false)}
        position={{ top: 60, right: 16 }}
        minWidth={280}
        showIcons={false}
        itemTextStyle={{ fontSize: 15, fontWeight: "500", color: "#1A4882" }}
      />

      <ExpectedOutcomeModal
        visible={showOutcomeModal}
        onClose={() => setShowOutcomeModal(false)}
        title={selectedOutcome}
        outcomes={outcomeData()}
        onSelect={() => setShowOutcomeModal(false)}
        onEdit={() => setShowOutcomeModal(false)}
        onDownload={() => {}}
      />

      <TaskCompletionModal
        visible={celebration.kind === "task"}
        taskName={celebration.taskName}
        phaseName={celebration.phaseName}
        completedCount={celebration.completedCount}
        totalCount={celebration.totalCount}
        onContinueJourney={handleContinueJourney}
        onBackToPhase={handleBackToPhase}
      />

      <PhaseCompletionModal
        visible={celebration.kind === "phase"}
        phaseName={celebration.phaseName}
        completedCount={celebration.completedCount}
        totalCount={celebration.totalCount}
        currentPhaseNumber={celebration.currentPhaseNumber}
        totalPhases={celebration.totalPhases}
        nextPhaseName={celebration.nextPhaseName}
        hasNextPhase={celebration.hasNextPhase}
        onStartNextPhase={handleStartNextPhase}
        onBackToJourney={handleBackToJourney}
      />
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { width: "100%", alignSelf: "center" },
  bgCircleTop: {
    position: "absolute",
    top: -120,
    right: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  bgCircleBottom: {
    position: "absolute",
    bottom: -90,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600" },
  headerRow: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  headerPillWrap: { flex: 1, minWidth: 0 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  ellipsisBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  pillDots: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: accent.mint },
  pillDotGold: { width: 6, height: 6, borderRadius: 3, backgroundColor: accent.gold },
  pillText: { color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: "700", flexShrink: 1 },

  tabRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 12,
    marginBottom: 16,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    maxWidth: "100%",
  },
  tabActive: { backgroundColor: "#FFFFFF" },
  tabInactive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  tabText: { fontSize: 12, fontWeight: "700" },
  tabTextActive: { color: "#0E5A62" },
  tabTextInactive: { color: "#FFFFFF" },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeActive: { backgroundColor: "rgba(14, 90, 98, 0.14)" },
  badgeInactive: { backgroundColor: "rgba(255, 255, 255, 0.22)" },
  badgeText: { fontSize: 11, fontWeight: "800" },
  badgeTextActive: { color: "#0E5A62" },
  badgeTextInactive: { color: "#FFFFFF" },

  coverImageContainer: {
    width: "100%",
    height: 190,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  coverTitleOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 12 },
  coverTitleBox: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    maxWidth: "92%",
  },
  coverTitleText: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: -0.2 },

  completionBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 16,
  },
  completionText: { color: "#fff", fontSize: 14, fontWeight: "800", textAlign: "center" },
  completionContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  completionStatusText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  completionInfoColumn: { flex: 1, alignItems: "flex-end" },
  completionInfoText: { color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: "700" },

  sectionTitle: { color: "#fff", fontSize: 15, fontWeight: "800", marginBottom: 8 },
  sectionBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 16,
  },
  sectionText: { color: "rgba(255,255,255,0.78)", fontSize: 13, lineHeight: 18, fontWeight: "600" },

  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.28)",
    marginTop: 8,
  },
  errorText: { color: "rgba(255,255,255,0.92)", fontSize: 12, fontWeight: "700", flex: 1 },

  emptyCard: {
    marginTop: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: { color: "#fff", fontSize: 15, fontWeight: "800" },
  emptySubtitle: { color: "rgba(255,255,255,0.65)", fontSize: 12, textAlign: "center" },
});


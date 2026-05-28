import { RoadmapCard } from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import { PastorCompletedTasksSection } from "@/components/roadmaps/PastorCompletedTasksSection";
import {
  PastorContinueFocusCard,
  PastorJourneyAllCaughtUp,
} from "@/components/roadmaps/pastor/PastorContinueFocusCard";
import { PastorJourneyFlowStrip } from "@/components/roadmaps/pastor/PastorJourneyFlowStrip";
import { PastorJourneyHeader } from "@/components/roadmaps/pastor/PastorJourneyHeader";
import { PastorJourneyWelcomeModal } from "@/components/roadmaps/pastor/PastorJourneyWelcomeModal";
import {
  CommonCard,
  GradientBackground,
  RoadmapNavRow,
  RoadmapSearchField,
  RoadmapTabStrip,
  roadmapTheme,
  SectionHeader,
} from "@/components/ui/design-system/index";
import { useTaskCompletionTimestamps } from "@/hooks/roadmap/useTaskCompletionTimestamps";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import {
  applyLocalTaskCompletionOverrides,
  buildPastorCompletedJourneyTabs,
  comparePastorPhasesForFocus,
  flattenPastorCompletedTasks,
  getCardStatus,
  getCompletionStats,
  getNextIncompleteNestedTaskId,
  type PastorCompletedTaskItem,
} from "@/lib/roadmap/helpers";
import {
  areAllAssignedPhasesComplete,
  buildJourneyFlowSteps,
  getFocusRoadmap,
  getOverallJourneyTaskStats,
  type JourneyFlowStep,
} from "@/lib/roadmap/journeyFlow";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import type { Roadmap } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores";
import {
  hasSeenPastorJourneyWelcome,
  markPastorJourneyWelcomeSeen,
} from "@/utils/pastorJourneyWelcome";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FilterKey = "All" | "Completed" | "InProgress" | "NotStarted";
type ScreenView = "journey" | "history";

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: "All", label: "All Phases" },
  { key: "Completed", label: "Completed" },
  { key: "InProgress", label: "In Progress" },
  { key: "NotStarted", label: "Not Started" },
];

function computePastorJourneyMeta(roadmap: Roadmap | undefined | null) {
  if (!roadmap) {
    return {
      completed: 0,
      total: 0,
      nextIncompleteTaskId: null as string | null,
      allComplete: false,
      hasTasks: false,
    };
  }
  const { completed, total } = getCompletionStats(roadmap);
  const hasTasks = total > 0;
  const nextIncompleteTaskId = hasTasks ? getNextIncompleteNestedTaskId(roadmap) : null;
  const allComplete = hasTasks && completed === total;
  return { completed, total, nextIncompleteTaskId, allComplete, hasTasks };
}

export default function PastorRoadmapIndex() {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [screenView, setScreenView] = useState<ScreenView>("journey");
  const [filter, setFilter] = useState<FilterKey>("All");
  const [historyPhaseTab, setHistoryPhaseTab] = useState("all");
  const [search, setSearch] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  const horizontalPadding = useMemo(() => {
    const v = Math.round(width * 0.05);
    return Math.max(16, Math.min(24, v));
  }, [width]);
  const maxWidth = useMemo(() => (width >= 520 ? 520 : undefined), [width]);

  const { user } = useAuthStore();
  const { data: roadmaps, isLoading, isRefetching, refetch, error } = useRoadmaps("pastor");

  const baseSortedRoadmaps = useMemo(() => {
    const list = [...(roadmaps ?? [])];
    list.sort((a, b) => comparePastorPhasesForFocus(a as Roadmap, b as Roadmap));
    return list as Roadmap[];
  }, [roadmaps]);

  const { timestamps: completionTimestamps, reloadTimestamps } =
    useTaskCompletionTimestamps(user?.id, baseSortedRoadmaps);

  const sortedRoadmaps = useMemo(
    () =>
      baseSortedRoadmaps.map((r) =>
        applyLocalTaskCompletionOverrides(r, completionTimestamps),
      ),
    [baseSortedRoadmaps, completionTimestamps],
  );

  useFocusEffect(
    useCallback(() => {
      reloadTimestamps();
    }, [reloadTimestamps]),
  );

  useEffect(() => {
    if (!user?.id || isLoading) return;
    let cancelled = false;
    (async () => {
      const seen = await hasSeenPastorJourneyWelcome(user.id);
      if (!cancelled && !seen) setShowWelcome(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isLoading]);

  const handleDismissWelcome = useCallback(async () => {
    setShowWelcome(false);
    if (user?.id) await markPastorJourneyWelcomeSeen(user.id);
  }, [user?.id]);

  const journeyStats = useMemo(
    () => getOverallJourneyTaskStats(sortedRoadmaps as Roadmap[]),
    [sortedRoadmaps],
  );

  const flowSteps = useMemo(
    () => buildJourneyFlowSteps(sortedRoadmaps as Roadmap[]),
    [sortedRoadmaps],
  );

  const focusRoadmap = useMemo(
    () => getFocusRoadmap(sortedRoadmaps as Roadmap[]),
    [sortedRoadmaps],
  );

  const focusJourney = useMemo(
    () => computePastorJourneyMeta(focusRoadmap),
    [focusRoadmap],
  );

  const allCaughtUp = useMemo(
    () => areAllAssignedPhasesComplete(sortedRoadmaps as Roadmap[]),
    [sortedRoadmaps],
  );

  const completedTasks = useMemo(
    () => flattenPastorCompletedTasks(sortedRoadmaps as Roadmap[], completionTimestamps),
    [sortedRoadmaps, completionTimestamps],
  );

  const historyPhaseTabs = useMemo(
    () => buildPastorCompletedJourneyTabs(completedTasks, sortedRoadmaps as Roadmap[]),
    [completedTasks, sortedRoadmaps],
  );

  const historyPhaseTabStrip = useMemo(
    () =>
      historyPhaseTabs.map((t) => ({
        key: t.key,
        label: t.key === "all" ? "All" : t.label,
      })),
    [historyPhaseTabs],
  );

  useEffect(() => {
    if (screenView !== "history") return;
    const validKeys = new Set(historyPhaseTabs.map((t) => t.key));
    if (!validKeys.has(historyPhaseTab)) setHistoryPhaseTab("all");
  }, [screenView, historyPhaseTabs, historyPhaseTab]);

  const completedByPhase = useMemo(() => {
    if (historyPhaseTab === "all") return completedTasks;
    return completedTasks.filter((item) => item.phaseId === historyPhaseTab);
  }, [completedTasks, historyPhaseTab]);

  const screenTabs = useMemo(
    () => [
      { key: "journey" as const, label: "Journey" },
      { key: "history" as const, label: "History" },
    ],
    [],
  );

  const filteredHistory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return completedByPhase;
    return completedByPhase.filter((item) => {
      const title = item.taskTitle.toLowerCase();
      const phase = item.phaseTitle.toLowerCase();
      return title.includes(q) || phase.includes(q);
    });
  }, [completedByPhase, search]);

  const filteredPhases = useMemo(() => {
    let list = sortedRoadmaps;
    if (filter === "Completed") list = list.filter((r: any) => getCardStatus(r) === "completed");
    if (filter === "InProgress") list = list.filter((r: any) => getCardStatus(r) === "in-progress");
    if (filter === "NotStarted") list = list.filter((r: any) => getCardStatus(r) === "initial");

    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r: any) => {
      const title = String(r?.title ?? r?.name ?? "").toLowerCase();
      const desc = String(r?.description ?? "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [search, sortedRoadmaps, filter]);

  const phaseRows = useMemo(
    () =>
      filteredPhases.map((r: any) => ({
        key: String(r?._id ?? r?.id),
        roadmap: r,
        card: getRoadmapCard(r),
      })),
    [filteredPhases],
  );

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  const handleOpen = useCallback((roadmap: any) => {
    const roadmapId = roadmap?._id ?? roadmap?.id;
    if (!roadmapId) return;
    const nested = Array.isArray(roadmap?.roadmaps) ? roadmap.roadmaps : [];
    const firstNestedId = nested?.[0]?._id ?? nested?.[0]?.id;
    if (nested.length === 1 && firstNestedId) {
      router.push(`/roadmap/${roadmapId}/${firstNestedId}` as any);
      return;
    }
    router.push(`/roadmap/${roadmapId}` as any);
  }, []);

  const handleContinueJourney = useCallback((roadmap: any, nextTaskId: string) => {
    const roadmapId = roadmap?._id ?? roadmap?.id;
    if (!roadmapId || !nextTaskId) return;
    router.push(`/roadmap/${roadmapId}/${nextTaskId}` as any);
  }, []);

  const handleOpenCompletedTask = useCallback((item: PastorCompletedTaskItem) => {
    if (!item.phaseId || !item.taskId) return;
    router.push(`/roadmap/${item.phaseId}/${item.taskId}` as any);
  }, []);

  const handleFlowStepPress = useCallback(
    (step: JourneyFlowStep) => {
      if (step.state === "locked" || !step.roadmap) return;
      handleOpen(step.roadmap);
    },
    [handleOpen],
  );

  const handleFocusContinue = useCallback(() => {
    if (!focusRoadmap || !focusJourney.nextIncompleteTaskId) return;
    handleContinueJourney(focusRoadmap, focusJourney.nextIncompleteTaskId);
  }, [focusRoadmap, focusJourney.nextIncompleteTaskId, handleContinueJourney]);

  if (isLoading) {
    return (
      <GradientBackground>
        <TopBar role="pastor" showUserName />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading your journey...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground decorativeOrbs style={styles.root}>
      <TopBar role="pastor" showUserName />
      <PastorJourneyWelcomeModal visible={showWelcome} onStart={handleDismissWelcome} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: bottom + 24, paddingHorizontal: horizontalPadding, maxWidth },
        ]}
        refreshControl={
          <RefreshControl refreshing={!!isRefetching} onRefresh={handleRefresh} tintColor="#fff" />
        }
      >
        <RoadmapNavRow onBack={() => router.back()} pillLabel="Roadmap" />
        <PastorJourneyHeader
          completedTasks={journeyStats.completed}
          totalTasks={journeyStats.total}
        />

        <RoadmapTabStrip
          tabs={screenTabs}
          activeKey={screenView}
          onChange={(k: string) => setScreenView(k as ScreenView)}
        />

        <View style={styles.searchWrap}>
          <RoadmapSearchField
            value={search}
            onChangeText={setSearch}
            dense
            placeholder={
              screenView === "history" ? "Search your finished work..." : "Search phases..."
            }
          />
        </View>

        {!!error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#fff" />
            <Text style={styles.errorText}>
              Could not load your journey. Pull down to try again.
            </Text>
          </View>
        ) : null}

        {screenView === "journey" ? (
          <>
            <PastorJourneyFlowStrip steps={flowSteps} onPressStep={handleFlowStepPress} />

            {sortedRoadmaps.length > 0 ? (
              allCaughtUp ? (
                <PastorJourneyAllCaughtUp onViewHistory={() => setScreenView("history")} />
              ) : focusRoadmap && focusJourney.nextIncompleteTaskId ? (
                <PastorContinueFocusCard
                  roadmap={focusRoadmap}
                  journey={focusJourney}
                  onContinue={handleFocusContinue}
                  onOpenPhase={() => handleOpen(focusRoadmap)}
                />
              ) : null
            ) : null}

            <SectionHeader
              title="Your roadmap"
              subtitle="Each Roadmap contains tasks to complete with your mentor."
              showDivider
            />

            <RoadmapTabStrip
              tabs={filterTabs}
              activeKey={filter}
              onChange={(k: string) => setFilter(k as FilterKey)}
              scrollable
            />

            <View style={styles.list}>
              {filteredPhases.length === 0 ? (
                <CommonCard style={styles.emptyCard}>
                  <Ionicons name="map-outline" size={32} color="rgba(255,255,255,0.65)" />
                  <Text style={styles.emptyTitle}>No phases here yet</Text>
                  <Text style={styles.emptySubtitle}>
                    {sortedRoadmaps.length === 0
                      ? "When your director assigns phases, they will appear on this journey."
                      : "Try a different filter or search term."}
                  </Text>
                </CommonCard>
              ) : (
                phaseRows.map(({ key, roadmap: r, card }) => (
                  <Pressable key={key} onPress={() => handleOpen(r)} style={styles.cardPress}>
                    <RoadmapCard data={card as any} />
                  </Pressable>
                ))
              )}
            </View>
          </>
        ) : (
          <>
            <SectionHeader
              title="Your history"
              subtitle="Look back at tasks you have already finished."
              showDivider
            />

            {historyPhaseTabStrip.length > 1 ? (
              <RoadmapTabStrip
                tabs={historyPhaseTabStrip}
                activeKey={historyPhaseTab}
                onChange={setHistoryPhaseTab}
                scrollable
              />
            ) : null}

            <View style={styles.historyListWrap}>
              {completedTasks.length > 0 && filteredHistory.length === 0 && search.trim() ? (
                <CommonCard style={styles.emptyCard}>
                  <Ionicons name="search-outline" size={32} color="rgba(255,255,255,0.65)" />
                  <Text style={styles.emptyTitle}>Nothing matched your search</Text>
                  <Text style={styles.emptySubtitle}>Try another word or clear the search.</Text>
                </CommonCard>
              ) : completedByPhase.length === 0 && historyPhaseTab !== "all" ? (
                <CommonCard style={styles.emptyCard}>
                  <Ionicons name="time-outline" size={32} color="rgba(255,255,255,0.65)" />
                  <Text style={styles.emptyTitle}>No finished tasks in this phase</Text>
                  <Text style={styles.emptySubtitle}>Choose another phase or view All.</Text>
                </CommonCard>
              ) : (
                <PastorCompletedTasksSection
                  items={filteredHistory}
                  onOpenTask={handleOpenCompletedTask}
                  showHeader={false}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { width: "100%", alignSelf: "center" },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "rgba(255,255,255,0.75)", fontSize: 15, fontWeight: "600" },
  searchWrap: { marginBottom: 16 },
  list: { gap: 14, paddingBottom: 12, marginTop: 4 },
  cardPress: { borderRadius: 16, overflow: "hidden" },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.28)",
    marginBottom: 14,
  },
  errorText: { color: "rgba(255,255,255,0.92)", fontSize: 13, fontWeight: "700", flex: 1 },
  emptyCard: { paddingVertical: 28, alignItems: "center", gap: 10 },
  emptyTitle: { color: roadmapTheme.textPrimary, fontSize: 16, fontWeight: "800" },
  emptySubtitle: {
    color: roadmapTheme.textSubtle,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    maxWidth: 280,
    fontWeight: "600",
  },
  historyListWrap: { marginTop: 4 },
});

import TopBar from "@/components/director/TopBar";
import { RoadmapCard } from "@/components/director/ProgressRoadmapCard";
import {
  CommonCard,
  GradientBackground,
  RoadmapNavRow,
  RoadmapSearchField,
  RoadmapTabStrip,
  SectionHeader,
  roadmapTheme,
} from "@/components/ui/design-system/index";
import { useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { getCompletionStats, getTasks } from "@/lib/roadmap/helpers";
import type { Roadmap } from "@/lib/roadmap/types";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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

type TabKey = "All" | "Completed" | "Remaining";

function toEpochMs(dateString?: string): number {
  if (!dateString) return 0;
  const parsed = Date.parse(dateString);
  return Number.isNaN(parsed) ? 0 : parsed;
}

const filterTabs: { key: TabKey; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Completed", label: "Completed" },
  { key: "Remaining", label: "Remaining" },
];

/** Frontend-only: next actionable nested task; order matches `getTasks` / roadmap.roadmaps. */
function getNextIncompleteNestedTaskId(roadmap: Roadmap | undefined | null): string | null {
  if (!roadmap) return null;
  const tasks = getTasks(roadmap);
  for (const t of tasks) {
    if (!t) continue;
    if (t.status !== "completed") {
      return String(t._id);
    }
  }
  return null;
}

function computePastorJourneyMeta(roadmap: Roadmap | undefined | null) {
  if (!roadmap) {
    return {
      completed: 0,
      total: 0,
      percentage: 0,
      nextIncompleteTaskId: null as string | null,
      allComplete: false,
      hasTasks: false,
    };
  }
  const { completed, total } = getCompletionStats(roadmap);
  const hasTasks = total > 0;
  const percentage = hasTasks ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const nextIncompleteTaskId = hasTasks ? getNextIncompleteNestedTaskId(roadmap) : null;
  const allComplete = hasTasks && completed === total;
  return {
    completed,
    total,
    percentage,
    nextIncompleteTaskId,
    allComplete,
    hasTasks,
  };
}

/** Display label for the next incomplete nested task (read-only; uses same task order as `getTasks`). */
function getNestedTaskTitleById(roadmap: Roadmap | undefined | null, taskId: string | null): string {
  if (!roadmap || !taskId) return "Next task";
  const tasks = getTasks(roadmap);
  const found = tasks.find((t) => t && String(t._id) === String(taskId));
  const name = found?.name?.trim();
  return name && name.length > 0 ? name : "Next task";
}

/** Sort bucket for pastor list only: 0 = in progress, 1 = not started / no tasks, 2 = completed. */
function pastorRoadmapListSortGroup(roadmap: Roadmap): 0 | 1 | 2 {
  const m = computePastorJourneyMeta(roadmap);
  if (!m.hasTasks) return 1;
  if (m.allComplete) return 2;
  if (m.completed === 0) return 1;
  return 0;
}

export default function PastorRoadmapIndex() {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<TabKey>("All");
  const [search, setSearch] = useState("");

  const horizontalPadding = useMemo(() => {
    const v = Math.round(width * 0.05);
    return Math.max(16, Math.min(24, v));
  }, [width]);
  const maxWidth = useMemo(() => (width >= 520 ? 520 : undefined), [width]);

  const {
    data: roadmaps,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useRoadmaps("pastor");

  const sortedRoadmaps = useMemo(() => {
    const list = [...(roadmaps ?? [])];
    list.sort((a: any, b: any) => {
      const ga = pastorRoadmapListSortGroup(a as Roadmap);
      const gb = pastorRoadmapListSortGroup(b as Roadmap);
      if (ga !== gb) return ga - gb;
      const timeDelta = toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt);
      if (timeDelta !== 0) return timeDelta;
      return String(a?._id ?? "").localeCompare(String(b?._id ?? ""));
    });
    return list;
  }, [roadmaps]);

  const filtered = useMemo(() => {
    let list = sortedRoadmaps;
    if (tab === "Completed") list = list.filter((r: any) => r.status === "completed");
    if (tab === "Remaining") list = list.filter((r: any) => r.status !== "completed");

    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((r: any) => {
      const title = String(r?.title ?? r?.name ?? "").toLowerCase();
      const desc = String(r?.description ?? "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [search, sortedRoadmaps, tab]);

  const roadmapRows = useMemo(
    () =>
      filtered.map((r: any) => ({
        key: String(r?._id ?? r?.id),
        roadmap: r,
        card: getRoadmapCard(r),
        journey: computePastorJourneyMeta(r as Roadmap),
      })),
    [filtered],
  );

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

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

  if (isLoading) {
    return (
      <GradientBackground>
        <TopBar role="pastor" showUserName />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading your roadmaps...</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground decorativeOrbs style={styles.root}>
      <TopBar role="pastor" showUserName />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: bottom + 20,
            paddingHorizontal: horizontalPadding,
            maxWidth,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={!!isRefetching}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }
      >
        <RoadmapNavRow onBack={() => router.back()} pillLabel="Revitalization Roadmap" />

        <SectionHeader
          title="Your roadmap phases"
          subtitle="Track phases, tasks, and next steps."
          showDivider
        />

        <RoadmapSearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Search phases..."
        />

        <RoadmapTabStrip tabs={filterTabs} activeKey={tab} onChange={(k: string) => setTab(k as TabKey)} />

        {!!error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#fff" />
            <Text style={styles.errorText}>Failed to load roadmaps. Pull to refresh.</Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <CommonCard style={styles.emptyCard}>
              <Ionicons name="map-outline" size={28} color="rgba(255,255,255,0.7)" />
              <Text style={styles.emptyTitle}>No phases found</Text>
              <Text style={styles.emptySubtitle}>Try a different filter or search.</Text>
            </CommonCard>
          ) : (
            roadmapRows.map(({ key, roadmap: r, card, journey }) => {
              const journeyProgress =
                journey.hasTasks
                  ? { completed: journey.completed, total: journey.total }
                  : undefined;
              const nextId = journey.nextIncompleteTaskId;
              const showContinue = journey.hasTasks && !journey.allComplete && !!nextId;
              const showJourneyComplete = journey.hasTasks && journey.allComplete;

              const journeyGuidance = showContinue && nextId
                ? {
                    kind: "active" as const,
                    ctaPhase: journey.completed === 0 ? ("start" as const) : ("continue" as const),
                    nextStepTitle: getNestedTaskTitleById(r as Roadmap, nextId),
                    onContinuePress: () => handleContinueJourney(r, nextId),
                  }
                : showJourneyComplete
                  ? { kind: "completed" as const }
                  : undefined;

              return (
                <Pressable key={key} onPress={() => handleOpen(r)} style={styles.cardPress}>
                  <RoadmapCard
                    data={card as any}
                    journeyProgress={journeyProgress}
                    journeyGuidance={journeyGuidance}
                  />
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    width: "100%",
    alignSelf: "center",
  },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600" },

  list: { gap: 12, paddingBottom: 10 },
  cardPress: { borderRadius: 14, overflow: "hidden" },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(248, 113, 113, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.28)",
    marginBottom: 12,
  },
  errorText: { color: "rgba(255,255,255,0.92)", fontSize: 12, fontWeight: "700", flex: 1 },

  emptyCard: {
    paddingVertical: 20,
  },
  emptyTitle: { color: roadmapTheme.textPrimary, fontSize: 15, fontWeight: "800" },
  emptySubtitle: { color: roadmapTheme.textSubtle, fontSize: 12, textAlign: "center" },
});

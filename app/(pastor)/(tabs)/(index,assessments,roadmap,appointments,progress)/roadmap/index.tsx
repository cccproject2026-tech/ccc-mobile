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
    list.sort((a: any, b: any) => toEpochMs(b.updatedAt) - toEpochMs(a.updatedAt));
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
            filtered.map((r: any) => {
              const card = getRoadmapCard(r);
              return (
                <Pressable key={String(r?._id ?? r?.id)} onPress={() => handleOpen(r)} style={styles.cardPress}>
                  <RoadmapCard data={card as any} />
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

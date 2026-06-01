import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import KeyboardSafeContainer from "@/components/layout/KeyboardSafeContainer";
import { RoadmapMetaCard } from "@/components/roadmaps/RoadmapMetaCard";
import {
  RoadmapSearchField,
  RoadmapTabStrip,
  roadmapTheme,
} from "@/components/ui/design-system/index";
import { useRoadmap } from "@/hooks/roadmaps/useRoadmaps";
import { useRoadmapMeta } from "@/hooks/roadmap/useRoadmapMeta";
import { getTasks } from "@/lib/roadmap/helpers";
import { getTaskCard } from "@/lib/roadmap/mappers";
import type { NestedRoadmap, Roadmap } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { useStableFocusRefetch } from "@/hooks/roadmaps/useStableFocusRefetch";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = "ALL" | "NOT_STARTED" | "COMPLETED";

const accent = {
  mint: roadmapTheme.accentMint,
  gold: roadmapTheme.accentGold,
};

export default function PastorRoadmapDetail() {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { phaseId } = useLocalSearchParams<{ phaseId: string }>();
  const { user } = useAuthStore();

  const { data: roadmap, isLoading, error, refetch, refetchLight, isRefetching } = useRoadmap(
    phaseId,
    user?.id,
  );

  useStableFocusRefetch(
    () => {
      void (refetchLight?.() ?? refetch());
    },
    `roadmap-phase-${phaseId ?? ""}`,
  );

  const meta = useRoadmapMeta(roadmap as Roadmap | undefined);

  const horizontalPadding = useMemo(() => {
    const v = Math.round(width * 0.05);
    return Math.max(16, Math.min(24, v));
  }, [width]);
  const maxWidth = useMemo(() => (width >= 520 ? 520 : undefined), [width]);

  const [search, setSearch] = useState("");

  const phaseNumber = useMemo(() => {
    if (!roadmap?.phase) return null;
    const match = roadmap.phase.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }, [roadmap]);

  const [activeTab, setActiveTab] = useState<TabKey>("ALL");

  const tabs = useMemo(
    () => [
      { key: "ALL", label: "All" },
      { key: "NOT_STARTED", label: "Not Started" },
      { key: "COMPLETED", label: "Completed" },
    ],
    [],
  );

  const allTasks = useMemo<NestedRoadmap[]>(() => {
    if (!roadmap) return [];
    return getTasks(roadmap) as NestedRoadmap[];
  }, [roadmap]);

  const filtered = useMemo(() => {
    let list = allTasks;

    if (activeTab === "COMPLETED") {
      list = list.filter((t) => String(t.status || "").toLowerCase() === "completed");
    }
    if (activeTab === "NOT_STARTED") {
      list = list.filter((t) => String(t.status || "").toLowerCase() === "not started");
    }


    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((t) => {
      const title = String((t as any).name ?? "").toLowerCase();
      const desc = String((t as any).description ?? "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }, [activeTab, search, allTasks]);

  const handleOpenTask = useCallback(
    (taskId: string) => {
      router.push(`/roadmap/${String(phaseId)}/${taskId}` as any);
    },
    [phaseId],
  );

  if (isLoading) {
    return (
      <AppGradientBackground>
        <TopBar role="pastor" showUserName />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading roadmap…</Text>
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
        extraScrollHeight={40}
        dismissKeyboardOnTap
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: bottom + 40,
            paddingHorizontal: horizontalPadding,
            maxWidth,
            width: "100%",
            alignSelf: maxWidth ? "center" : undefined,
          },
        ]}
        refreshControl={
          <RefreshControl refreshing={!!isRefetching} onRefresh={refetch} tintColor="#fff" />
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
                {(roadmap as any)?.name || "Revitalization Roadmap"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>
          {phaseNumber ? `Phase ${phaseNumber}` : "Roadmap"} tasks
        </Text>
        <Text style={styles.subtitle}>
          Tap a task to view details, comments, and queries.
        </Text>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Ionicons name="leaf-outline" size={14} color={accent.mint} />
          <View style={styles.dividerLine} />
        </View>

        <RoadmapMetaCard meta={meta} />

        {!!error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#fff" />
            <Text style={styles.errorText}>Failed to load roadmap. Pull to refresh.</Text>
          </View>
        ) : null}

        <RoadmapSearchField value={search} onChangeText={setSearch} dense style={styles.searchField} />

        <RoadmapTabStrip tabs={tabs} activeKey={activeTab} onChange={(k) => setActiveTab(k as TabKey)} scrollable />

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkbox-outline" size={28} color="rgba(255,255,255,0.7)" />
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptySubtitle}>Try a different filter or search.</Text>
            </View>
          ) : (
            filtered.map((t) => {
              const cardData = getTaskCard(t);
              return (
                <Pressable key={String(t._id)} onPress={() => handleOpenTask(String(t._id))} style={styles.cardPress}>
                  <RoadmapCard data={cardData as any} />
                </Pressable>
              );
            })
          )}
        </View>
      </KeyboardSafeContainer>

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

  title: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.2, marginTop: 8 },
  subtitle: { color: "rgba(255,255,255,0.72)", marginTop: 4, fontSize: 13, lineHeight: 18 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.12)" },

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
    marginBottom: 10,
  },
  errorText: { color: "rgba(255,255,255,0.92)", fontSize: 12, fontWeight: "700", flex: 1 },

  searchField: { marginTop: 8, marginBottom: 4 },
  list: { gap: 12, paddingBottom: 10 },
  cardPress: { borderRadius: 16, overflow: "hidden" },

  emptyCard: {
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


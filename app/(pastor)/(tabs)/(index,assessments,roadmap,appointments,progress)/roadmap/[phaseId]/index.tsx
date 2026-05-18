import ContextMenu, { MenuItem } from "@/components/director/ContextMenu";
import ExpectedOutcomeModal from "@/components/director/ExpectedOutcomeModal";
import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import SearchBar from "@/components/director/SearchBar";
import { TabSwitcher } from "@/components/director/TabSwitcher";
import TopBar from "@/components/director/TopBar";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { Colors } from "@/constants/Colors";
import { useRoadmap } from "@/hooks/roadmaps/useRoadmaps";
import { getTasks } from "@/lib/roadmap/helpers";
import { getTaskCard } from "@/lib/roadmap/mappers";
import type { NestedRoadmap } from "@/lib/roadmap/types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

type TabKey = "ALL" | "DUE" | "NOT_STARTED" | "COMPLETED";

const accent = {
  gold: "#E8C88A",
  mint: "#6FD4BE",
  mintSoft: "rgba(111, 212, 190, 0.28)",
  tealDeep: "#0E5A62",
};

export default function PastorRoadmapDetail() {
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { phaseId } = useLocalSearchParams<{ phaseId: string }>();

  const { data: roadmap, isLoading, error, refetch, isRefetching } = useRoadmap(phaseId);

  const horizontalPadding = useMemo(() => {
    const v = Math.round(width * 0.05);
    return Math.max(16, Math.min(24, v));
  }, [width]);
  const maxWidth = useMemo(() => (width >= 520 ? 520 : undefined), [width]);

  const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [search, setSearch] = useState("");

  const phaseNumber = useMemo(() => {
    if (!roadmap?.phase) return null;
    const match = roadmap.phase.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  }, [roadmap]);

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

  const [activeTab, setActiveTab] = useState<TabKey>("ALL");

  const tabs = useMemo(
    () => [
      { key: "ALL", label: "All" },
      { key: "DUE", label: "Due" },
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
    if (activeTab === "DUE") {
      const today = new Date().toISOString().slice(0, 10);
      list = list.filter((t) => {
        const status = String(t.status || "").toLowerCase();
        if (status === "completed") return false;
        if (!(t as any).endDate) return false;
        return String((t as any).endDate) <= today;
      });
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
          <Pressable onPress={() => setShowOutcomeMenu(true)} hitSlop={10} style={styles.ellipsisBtn}>
            <Ionicons name="ellipsis-vertical" size={16} color="rgba(255,255,255,0.92)" />
          </Pressable>
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

        {!!error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#fff" />
            <Text style={styles.errorText}>Failed to load roadmap. Pull to refresh.</Text>
          </View>
        ) : null}

        <View style={styles.searchWrap}>
          <SearchBar value={search} onChangeValue={setSearch} />
        </View>

        <View style={styles.tabsWrap}>
          <TabSwitcher tabs={tabs} activeTab={activeTab} onChange={(k) => setActiveTab(k as TabKey)} />
        </View>

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
      </ScrollView>

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

  searchWrap: { marginTop: 8 },
  tabsWrap: { marginTop: 12 },
  list: { marginTop: 14, gap: 12, paddingBottom: 10 },
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


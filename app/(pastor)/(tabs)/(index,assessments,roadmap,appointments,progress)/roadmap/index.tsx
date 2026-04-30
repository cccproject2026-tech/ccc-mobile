import TopBar from "@/components/director/TopBar";
import { RoadmapCard } from "@/components/director/ProgressRoadmapCard";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { Colors } from "@/constants/Colors";
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
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = "All" | "Completed" | "Remaining";

const accent = {
  gold: "#E8C88A",
  mint: "#6FD4BE",
  mintSoft: "rgba(111, 212, 190, 0.28)",
  tealDeep: "#0E5A62",
};

function toEpochMs(dateString?: string): number {
  if (!dateString) return 0;
  const parsed = Date.parse(dateString);
  return Number.isNaN(parsed) ? 0 : parsed;
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

    // If a roadmap has a single nested item, go straight to it.
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
      <AppGradientBackground>
        <TopBar role="pastor" showUserName />
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading your roadmaps...</Text>
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
          <RefreshControl
            refreshing={!!isRefetching}
            onRefresh={handleRefresh}
            tintColor="#fff"
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
                Revitalization Roadmap
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Your roadmap phases</Text>
        <Text style={styles.subtitle}>Track phases, tasks, and next steps.</Text>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Ionicons name="leaf-outline" size={14} color={accent.mint} />
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.75)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search phases..."
            placeholderTextColor="rgba(255,255,255,0.55)"
            style={styles.searchInput}
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.65)" />
            </Pressable>
          )}
        </View>

        <View style={styles.tabsRow}>
          {(["All", "Completed", "Remaining"] as const).map((t) => {
            const active = tab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabPill, active ? styles.tabPillActive : null]}
              >
                <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        {!!error ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={22} color="#fff" />
            <Text style={styles.errorText}>Failed to load roadmaps. Pull to refresh.</Text>
          </View>
        ) : null}

        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="map-outline" size={28} color="rgba(255,255,255,0.7)" />
              <Text style={styles.emptyTitle}>No phases found</Text>
              <Text style={styles.emptySubtitle}>Try a different filter or search.</Text>
            </View>
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
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    width: "100%",
    alignSelf: "center",
  },
  headerRow: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  headerPillWrap: {
    flex: 1,
    minWidth: 0,
  },
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
    marginTop: 0,
    marginBottom: 0,
  },
  pillDots: { flexDirection: "row", alignItems: "center", gap: 6 },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: accent.mint },
  pillDotGold: { width: 6, height: 6, borderRadius: 3, backgroundColor: accent.gold },
  pillText: { color: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: "700" },

  title: { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.2 },
  subtitle: { color: "rgba(255,255,255,0.72)", marginTop: 4, fontSize: 13, lineHeight: 18 },

  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.12)" },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: "#fff", fontSize: 13, fontWeight: "600" },

  tabsRow: { flexDirection: "row", gap: 10, marginTop: 14, marginBottom: 14, flexWrap: "wrap" },
  tabPill: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 108,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabPillActive: { backgroundColor: "#fff", borderColor: "rgba(255,255,255,0.85)" },
  tabText: { color: "rgba(255,255,255,0.78)", fontSize: 12, fontWeight: "700" },
  tabTextActive: { color: accent.tealDeep },

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

  list: { gap: 12, paddingBottom: 10 },
  cardPress: { borderRadius: 14, overflow: "hidden" },

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


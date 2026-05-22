import AppGradientBackground from "@/components/layout/AppGradientBackground";
import TopBar from "@/components/director/TopBar";
import { RoadmapSearchField } from "@/components/ui/design-system/RoadmapSearchField";
import { SectionHeader } from "@/components/ui/design-system/SectionHeader";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import { useAllRoadmaps, useRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import {
  getInterestDisplayTitle,
  getRoadmapDisplaySubtitle,
  getRoadmapDisplayTitle,
  isSearchInterestItem,
  isSearchRoadmapItem,
  navigateToSearchInterest,
  navigateToSearchRoadmap,
} from "@/lib/search/globalSearchNavigation";
import { apiClient } from "@/services/api/client";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GlobalSearchScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { data: assignedRoadmaps } = useRoadmaps(user?.role, user?.id);
  const { data: allRoadmaps } = useAllRoadmaps();
  const roadmapsForNavigation = useMemo(() => {
    if (allRoadmaps?.length) return allRoadmaps;
    return assignedRoadmaps ?? [];
  }, [allRoadmaps, assignedRoadmaps]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestRef = useRef<number>(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    if (!query || query.trim().length < 2) {
      setRoadmaps([]);
      setInterests([]);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const requestId = ++activeRequestRef.current;

      const run = async () => {
        setLoading(true);
        try {
          const resp = await apiClient.get("/search/global", {
            params: { query: query.trim(), q: query.trim() },
          });

          const payload = resp?.data?.data ?? resp?.data ?? {};

          let roadmapsGroup: any[] = [];
          let interestsGroup: any[] = [];

          if (
            payload &&
            typeof payload === "object" &&
            payload.results &&
            typeof payload.results === "object"
          ) {
            roadmapsGroup = Array.isArray(payload.results.roadmaps)
              ? payload.results.roadmaps
              : [];
            interestsGroup = Array.isArray(payload.results.interests)
              ? payload.results.interests
              : [];
          } else {
            let items: any[] = [];
            if (Array.isArray(payload)) {
              items = payload;
            } else if (Array.isArray(payload.results)) {
              items = payload.results;
            } else if (Array.isArray(payload.items)) {
              items = payload.items;
            } else if (Array.isArray(payload.data)) {
              items = payload.data;
            } else {
              const foundRoadmaps = payload.roadmaps ?? payload.roadmap ?? [];
              const foundInterests = payload.interests ?? payload.interest ?? [];
              if (Array.isArray(foundRoadmaps) || Array.isArray(foundInterests)) {
                if (Array.isArray(foundRoadmaps)) items = items.concat(foundRoadmaps);
                if (Array.isArray(foundInterests)) items = items.concat(foundInterests);
              } else if (payload && typeof payload === "object") {
                items = [payload];
              }
            }

            const othersGroup: any[] = [];

            for (const it of items) {
              if (isSearchInterestItem(it)) {
                interestsGroup.push(it);
              } else if (isSearchRoadmapItem(it)) {
                roadmapsGroup.push(it);
              } else {
                othersGroup.push(it);
              }
            }

            if (interestsGroup.length === 0 && othersGroup.length > 0) {
              interestsGroup.push(...othersGroup);
            }
          }

          if (requestId === activeRequestRef.current) {
            setRoadmaps(roadmapsGroup);
            setInterests(interestsGroup);
          }
        } catch (err) {
          console.warn("Search error:", err);
          if (requestId === activeRequestRef.current) {
            setRoadmaps([]);
            setInterests([]);
          }
        } finally {
          if (requestId === activeRequestRef.current) {
            setLoading(false);
          }
        }
      };

      run();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleRoadmapPress = (r: unknown) => {
    navigateToSearchRoadmap(router, user?.role, r, roadmapsForNavigation);
  };

  const handleInterestPress = (it: unknown) => {
    navigateToSearchInterest(router, user?.role, it);
  };

  const hasQuery = query.trim().length >= 2;
  const showEmpty = !loading && roadmaps.length === 0 && interests.length === 0 && hasQuery;

  return (
    <AppGradientBackground>
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <TopBar showBackButton showDrawer={false} showSearch={false} />

        <View style={styles.container}>
          <SectionHeader
            title="Search"
            subtitle="Find roadmaps and interests across CCC"
            showDivider
            variant="compact"
            style={styles.sectionHeader}
          />

          <RoadmapSearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search CCC"
          />

          <View style={styles.resultsArea}>
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={roadmapTheme.accentMint} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            )}

            {!loading && !hasQuery && (
              <View style={styles.hintState}>
                <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.25)" />
                <Text style={styles.hintText}>Type at least 2 characters to search</Text>
              </View>
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.resultsContainer}
              keyboardShouldPersistTaps="handled"
            >
              {showEmpty && (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyText}>No results found</Text>
                  <Text style={styles.emptySubtext}>Try a different keyword</Text>
                </View>
              )}

              {roadmaps.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{`Roadmaps (${roadmaps.length})`}</Text>
                  {roadmaps.map((r, idx) => {
                    const title = getRoadmapDisplayTitle(r);
                    const subtitle = getRoadmapDisplaySubtitle(r);
                    const record = r as Record<string, unknown>;
                    const status = record.metadata?.status ?? record.status ?? record.state ?? null;
                    return (
                      <Pressable
                        key={String(record.id ?? record._id ?? idx)}
                        onPress={() => handleRoadmapPress(r)}
                        android_ripple={{ color: "rgba(255,255,255,0.08)" }}
                        style={styles.resultCard}
                      >
                        <View style={styles.row}>
                          <View style={styles.iconCircle}>
                            <Ionicons name="book-outline" size={18} color={roadmapTheme.accentMint} />
                          </View>
                          <View style={styles.textBlock}>
                            <Text style={styles.itemTitle} numberOfLines={1}>
                              {title}
                            </Text>
                            {subtitle ? (
                              <Text style={styles.itemSubtitle} numberOfLines={1}>
                                {subtitle}
                              </Text>
                            ) : null}
                          </View>
                          {status ? (
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>{String(status)}</Text>
                            </View>
                          ) : (
                            <Ionicons name="chevron-forward" size={18} color={roadmapTheme.accentMint} />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {interests.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{`Interests (${interests.length})`}</Text>
                  {interests.map((it, idx) => {
                    const title = getInterestDisplayTitle(it);
                    const record = it as Record<string, unknown>;
                    const metadata =
                      record.metadata && typeof record.metadata === "object"
                        ? (record.metadata as Record<string, unknown>)
                        : undefined;
                    const subtitle = String(
                      record.description ??
                        metadata?.conference ??
                        record.email ??
                        metadata?.phoneNumber ??
                        "",
                    );
                    const status = record.metadata?.status ?? record.status ?? record.state ?? null;
                    return (
                      <Pressable
                        key={String(record.id ?? record._id ?? idx)}
                        onPress={() => handleInterestPress(it)}
                        android_ripple={{ color: "rgba(255,255,255,0.08)" }}
                        style={styles.resultCard}
                      >
                        <View style={styles.row}>
                          <View style={styles.iconCircle}>
                            <Ionicons name="person-outline" size={18} color={roadmapTheme.accentGold} />
                          </View>
                          <View style={styles.textBlock}>
                            <Text style={styles.itemTitle} numberOfLines={1}>
                              {title}
                            </Text>
                            {subtitle ? (
                              <Text style={styles.itemSubtitle} numberOfLines={1}>
                                {subtitle}
                              </Text>
                            ) : null}
                          </View>
                          {status ? (
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>{String(status)}</Text>
                            </View>
                          ) : (
                            <Ionicons name="chevron-forward" size={18} color={roadmapTheme.accentMint} />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </AppGradientBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 14,
  },
  sectionHeader: {
    marginBottom: 0,
  },
  resultsArea: {
    flex: 1,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  loadingText: {
    color: roadmapTheme.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  hintState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  hintText: {
    color: roadmapTheme.textSubtle,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  resultsContainer: {
    paddingBottom: 32,
    flexGrow: 1,
  },
  section: {
    marginTop: 8,
    gap: 8,
  },
  sectionTitle: {
    color: roadmapTheme.textPrimary,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  resultCard: {
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    color: roadmapTheme.textPrimary,
    fontWeight: "700",
    fontSize: 15,
  },
  itemSubtitle: {
    color: roadmapTheme.textMuted,
    marginTop: 2,
    fontSize: 13,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: roadmapTheme.accentGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    maxWidth: 100,
  },
  badgeText: {
    color: roadmapTheme.tealDeep,
    fontWeight: "700",
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    color: roadmapTheme.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtext: {
    color: roadmapTheme.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
});

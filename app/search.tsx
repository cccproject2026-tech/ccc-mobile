import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TopBar from "@/components/director/TopBar";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { apiClient } from "@/services/api/client";

export default function SearchScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestRef = useRef<number>(0);

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect unauthenticated users to home
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const clear = () => setQuery("");

  // Debounced search effect
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
            params: { query: query.trim() },
          });

          const payload = resp?.data?.data ?? resp?.data ?? {};

          const foundRoadmaps = payload.roadmaps ?? payload.roadmap ?? [];
          const foundInterests = payload.interests ?? payload.interest ?? [];

          if (requestId === activeRequestRef.current) {
            setRoadmaps(Array.isArray(foundRoadmaps) ? foundRoadmaps : []);
            setInterests(Array.isArray(foundInterests) ? foundInterests : []);
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

  const handleRoadmapPress = (r: any) => {
    const roadmapId = r._id ?? r.id;
    if (!roadmapId) return;

    // If roadmap has a single nested roadmap (task), navigate directly to the task
    const nested = Array.isArray(r.roadmaps) && r.roadmaps.length === 1 ? r.roadmaps[0] : null;
    const nestedId = nested ? nested._id ?? nested.id : null;

    if (nestedId && !r.haveNextedRoadMaps) {
      router.push(`/roadmap/${roadmapId}/${nestedId}`);
    } else {
      router.push(`/roadmap/${roadmapId}`);
    }
  };

  const handleInterestPress = (it: any) => {
    const interestId = it._id ?? it.id;
    if (!interestId) return;
    router.push({
      pathname: '/(director)/(tabs)/new-interests/interest-details',
      params: { interestId },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar showBackButton={true} showDrawer={false} showSearch={false} />
      <View style={styles.container}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={Platform.OS === "android" ? 18 : 20} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search CCC"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={clear} hitSlop={8} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.9)" />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.emptyArea}>
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.resultsContainer}>
            {!loading && roadmaps.length === 0 && interests.length === 0 && query.trim().length >= 2 ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No results found. Try a different keyword.</Text>
              </View>
            ) : null}

            {roadmaps.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{`Roadmaps (${roadmaps.length})`}</Text>
                {roadmaps.map((r, idx) => {
                  const title = r.title ?? r.name ?? "Untitled Roadmap";
                  const subtitle = r.roadMapDetails ?? r.description ?? r.phase ?? '';
                  const status = r.status ?? r.state ?? null;
                  return (
                    <Pressable
                      key={r.id ?? r._id ?? idx}
                      onPress={() => handleRoadmapPress(r)}
                      android_ripple={{ color: 'rgba(255,255,255,0.06)' }}
                      style={[styles.item, styles.card]}
                      hitSlop={8}
                    >
                      <View style={styles.row}>
                        <View style={styles.iconCircle}>
                          <Ionicons name="book-outline" size={18} color="#EAF7FF" />
                        </View>
                        <View style={styles.textBlock}>
                          <Text style={styles.itemTitleBold} numberOfLines={1}>
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
                        ) : null}
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
                  const title = it.name ?? it.title ?? "Interest";
                  const subtitle = it.email ?? it.phoneNumber ?? it.role ?? '';
                  const status = it.status ?? it.state ?? null;
                  return (
                    <Pressable
                      key={it.id ?? it._id ?? idx}
                      onPress={() => handleInterestPress(it)}
                      android_ripple={{ color: 'rgba(255,255,255,0.06)' }}
                      style={[styles.item, styles.card]}
                      hitSlop={8}
                    >
                      <View style={styles.row}>
                        <View style={styles.iconCircle}>
                          <Ionicons name="person-outline" size={18} color="#EAF7FF" />
                        </View>
                        <View style={styles.textBlock}>
                          <Text style={styles.itemTitleBold} numberOfLines={1}>
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
                        ) : null}
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
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0B2540",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchRow: {
    marginBottom: 16,
  },
  searchBox: {
    backgroundColor: "#14517D",
    borderRadius: Platform.OS === "android" ? 8 : 10,
    height: Platform.OS === "android" ? 44 : 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Platform.OS === "android" ? 12 : 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: Platform.OS === "android" ? 14 : 16,
    fontWeight: "400",
    marginLeft: 10,
  },
  clearButton: {
    marginLeft: 8,
  },
  emptyArea: {
    flex: 1,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  loadingText: {
    color: "rgba(255,255,255,0.9)",
    marginLeft: 8,
  },
  resultsContainer: {
    paddingBottom: 32,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    color: "white",
    fontWeight: "600",
    marginBottom: 8,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  itemTitle: {
    color: "white",
  },
  noResults: {
    paddingVertical: 20,
    alignItems: "center",
  },
  noResultsText: {
    color: "rgba(255,255,255,0.8)",
  },
  // New styles for improved result UI
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(26,91,119,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  itemTitleBold: {
    color: "white",
    fontWeight: "700",
    fontSize: Platform.OS === "android" ? 14 : 16,
  },
  itemSubtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontSize: Platform.OS === "android" ? 12 : 13,
  },
  badge: {
    marginLeft: 8,
    backgroundColor: "#F7E35F",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "#1D1D1D",
    fontWeight: "700",
    fontSize: 12,
  },
});


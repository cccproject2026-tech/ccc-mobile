import React, { useCallback, useMemo, useState } from "react";

import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import SearchBar from "@/components/director/SearchBar";
import { TabSwitcher } from "@/components/director/TabSwitcher";
import TopBar from "@/components/director/TopBar";
import { useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { getCardStatus } from "@/lib/roadmap/helpers";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { Roadmap, RoadmapCardStatus } from "@/lib/roadmap/types";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppGradientBackground from "@/components/layout/AppGradientBackground";

type MainTabKey = 'PASTOR_ROADMAPS' | 'ROADMAP_LIBRARY';
type StatusTabKey = 'ALL' | 'DUE' | 'IN_PROGRESS' | 'NOT_STARTED' | 'COMPLETED';

export default function Landing() {
    const [isRoadmapModalVisible, setIsRoadmapModalVisible] = useState(false);
    const [mainTab, setMainTab] = useState<MainTabKey>('PASTOR_ROADMAPS');
    const [statusTab, setStatusTab] = useState<StatusTabKey>('ALL');
    const [search, setSearch] = useState('');

    // Fetch roadmaps
    const { data: roadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();

    // Handle roadmap press navigation
    const handleRoadmapPress = useCallback((roadmap: Roadmap) => {
        if (!roadmap.haveNextedRoadMaps || roadmap.roadmaps.length === 0) {
            console.warn('Roadmap has no tasks');
            return;
        }

        // Navigate to roadmap detail - using dynamic routes
        if (roadmap.roadmaps.length === 1 && !roadmap.haveNextedRoadMaps) {
            // Single task - go directly to task
            router.push(`/(mentor-tabs)/roadmap/${roadmap._id}/${roadmap.roadmaps[0]._id}` as any);
        } else {
            // Multiple tasks - show task list
            router.push(`/(mentor-tabs)/roadmap/${roadmap._id}` as any);
        }
    }, []);

    // Filter roadmaps by pastor division
    //todo: this logic is wrong we need to fix this
    const filterPastorRoadmaps = useCallback((roadmapList: Roadmap[]): Roadmap[] => {
        return roadmapList.filter(roadmap =>
            roadmap.roadmaps?.some(nested =>
                nested.phase?.toLowerCase().includes('pastor')
            )
        );
    }, []);

    // Calculate roadmaps with status
    const roadmapsWithStatus = useMemo(() => {
        if (!roadmaps) return [];

        return roadmaps.map(roadmap => {
            const status = getCardStatus(roadmap);
            return { roadmap, status };
        });
    }, [roadmaps]);

    // Apply all filters
    const filteredRoadmaps = useMemo(() => {
        let filtered = roadmapsWithStatus;

        // Step 1: Apply main tab filter (Pastor's Roadmaps vs Roadmap Library)
        if (mainTab === 'PASTOR_ROADMAPS') {
            const pastorRoadmaps = filterPastorRoadmaps(filtered.map(r => r.roadmap));
            filtered = filtered.filter(({ roadmap }) =>
                pastorRoadmaps.some(pr => pr._id === roadmap._id)
            );

            // Step 2: Apply status filter (only for Pastor's Roadmaps)
            if (statusTab !== 'ALL') {
                const statusMap: Record<StatusTabKey, RoadmapCardStatus> = {
                    ALL: 'initial', // Not used
                    COMPLETED: 'completed',
                    IN_PROGRESS: 'in-progress',
                    NOT_STARTED: 'initial',
                    DUE: 'due',
                };

                filtered = filtered.filter(
                    ({ status }) => status === statusMap[statusTab]
                );
            }
        }

        // Step 3: Apply search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(({ roadmap }) =>
                roadmap.name?.toLowerCase().includes(searchLower) ||
                roadmap.roadMapDetails?.toLowerCase().includes(searchLower) ||
                roadmap.phase?.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [roadmapsWithStatus, mainTab, statusTab, search, filterPastorRoadmaps]);

    return (
        <AppGradientBackground style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.topBarWrapper}>
                <TopBar role="mentor" showUserName />
            </View>

            <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Revitalization Roadmap</Text>
                </View>
                <TouchableOpacity onPress={() => setIsRoadmapModalVisible(true)}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <SearchBar
                    value={search}
                    onChangeValue={setSearch}
                    placeholder="Search"
                />
            </View>

            {/* Main Tabs: Pastor's Roadmaps / Roadmap Library */}
            <View style={styles.mainTabsContainer}>
                <Pressable
                    style={[
                        styles.mainTab,
                        mainTab === 'PASTOR_ROADMAPS' && styles.mainTabActive
                    ]}
                    onPress={() => setMainTab('PASTOR_ROADMAPS')}
                >
                    <Text
                        style={[
                            styles.mainTabText,
                            mainTab === 'PASTOR_ROADMAPS' && styles.mainTabTextActive
                        ]}
                    >
                        Pastor's Roadmaps
                    </Text>
                </Pressable>
                <Pressable
                    style={[
                        styles.mainTab,
                        mainTab === 'ROADMAP_LIBRARY' && styles.mainTabActive
                    ]}
                    onPress={() => setMainTab('ROADMAP_LIBRARY')}
                >
                    <Text
                        style={[
                            styles.mainTabText,
                            mainTab === 'ROADMAP_LIBRARY' && styles.mainTabTextActive
                        ]}
                    >
                        Roadmap Library
                    </Text>
                </Pressable>
            </View>

            {/* Status Tabs (only show in Pastor's Roadmaps) */}
            {mainTab === 'PASTOR_ROADMAPS' && (
                <TabSwitcher
                    tabs={[
                        { key: 'ALL', label: 'All' },
                        { key: 'DUE', label: 'Due' },
                        { key: 'IN_PROGRESS', label: 'In Progress' },
                        { key: 'NOT_STARTED', label: 'Not Started' },
                        { key: 'COMPLETED', label: 'Completed' },
                    ]}
                    activeTab={statusTab}
                    onChange={(key) => setStatusTab(key as StatusTabKey)}
                />
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {isLoadingRoadmaps ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="white" />
                        <Text style={styles.loadingText}>
                            Loading roadmaps...
                        </Text>
                    </View>
                ) : filteredRoadmaps.length > 0 ? (
                    filteredRoadmaps.map(({ roadmap }) => {
                        const cardData = getRoadmapCard(roadmap);
                        return (
                            <Pressable
                                key={roadmap._id}
                                onPress={() => handleRoadmapPress(roadmap)}
                            >
                                <RoadmapCard data={cardData} />
                            </Pressable>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="search-outline" size={48} color="#fff" opacity={0.5} />
                        <Text style={styles.emptyText}>
                            {search.trim()
                                ? `No roadmaps found matching "${search}"`
                                : 'No roadmaps available'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            <RoadMapOutcomeModal
                isMenuVisible={isRoadmapModalVisible}
                closeMenu={() => setIsRoadmapModalVisible(false)}
            />
        </AppGradientBackground>
    )
}

const styles = StyleSheet.create({
    topBarWrapper: {
        paddingBottom: 10
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 8,
    },
    searchWrapper: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    mainTabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 8,
    },
    mainTab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: '#14517D',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    mainTabActive: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    mainTabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    mainTabTextActive: {
        color: '#1a5b77',
    },
    scrollContent: {
        padding: 16,
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: "center",
    },
    loadingText: {
        color: "white",
        marginTop: 16,
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 12,
    },
});

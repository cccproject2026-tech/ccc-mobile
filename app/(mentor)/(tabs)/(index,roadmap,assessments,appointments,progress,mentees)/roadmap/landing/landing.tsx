import React, { useCallback, useMemo, useRef, useState } from "react";

import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import ActionBottomSheet from "@/components/sheets/ActionBottomSheet";
import MenteeCard from "@/components/director/MenteeCard";
import RoadmapCard from "@/components/director/ProgressRoadmapCard";
import SearchBar from "@/components/director/SearchBar";
import { TabSwitcher } from "@/components/director/TabSwitcher";
import TopBar from "@/components/director/TopBar";
import { useMentees } from "@/hooks/mentees/useMentees";
import { useProgressByUserId } from "@/hooks/progress/useProgress";
import { mergeRoadmapWithProgress, useAllRoadmaps } from "@/hooks/roadmaps/useRoadmaps";
import { getCardStatus } from "@/lib/roadmap/helpers";
import { getRoadmapCard } from "@/lib/roadmap/mappers";
import { Roadmap, RoadmapCardStatus } from "@/lib/roadmap/types";
import { Mentee } from "@/types/mentee.types";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MainTabKey = 'PASTOR_ROADMAPS' | 'ROADMAP_LIBRARY';
type StatusTabKey = 'ALL' | 'DUE' | 'IN_PROGRESS' | 'NOT_STARTED' | 'COMPLETED';

export default function Landing() {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const [selectedRoadmapForMenu, setSelectedRoadmapForMenu] = useState<Roadmap | null>(null);
    const [isRoadmapModalVisible, setIsRoadmapModalVisible] = useState(false);
    const [mainTab, setMainTab] = useState<MainTabKey>('PASTOR_ROADMAPS');
    const [statusTab, setStatusTab] = useState<StatusTabKey>('ALL');
    const [pastorSearch, setPastorSearch] = useState('');
    const [librarySearch, setLibrarySearch] = useState('');
    const [selectedPastorRoadmapSearch, setSelectedPastorRoadmapSearch] = useState('');
    const [selectedPastor, setSelectedPastor] = useState<Mentee | null>(null);

    // Fetch roadmaps
    const { data: roadmaps, isLoading: isLoadingRoadmaps } = useAllRoadmaps();

    // Fetch mentees (pastors)
    const {
        data: menteesData,
        isLoading: isLoadingMentees,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useMentees();
    const mentees = useMemo(() => menteesData?.pages.flatMap(page => page.mentees) || [], [menteesData]);

    // Handle pagination for mentees
    const loadMoreMentees = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && mainTab === 'PASTOR_ROADMAPS' && !selectedPastor) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, mainTab, selectedPastor, fetchNextPage]);
console.log('selectedPastor----->>>>>>>>>>>>>>', selectedPastor);
    // Fetch selected pastor's progress
    const { data: pastorProgress, isLoading: isLoadingProgress } = useProgressByUserId(selectedPastor?.id);

    const handleRoadmapMenuPress = useCallback((roadmap: Roadmap) => {
        setSelectedRoadmapForMenu(roadmap);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const roadmapMenuItems = useMemo(() => [
        {
            icon: 'person-add-outline',
            label: 'Assign to',
            onPress: () => {
                if (!selectedRoadmapForMenu) return;
                router.push({
                    pathname: '/(mentor)/roadmap/assign-roadmaps' as any,
                    params: { roadmapIds: JSON.stringify([selectedRoadmapForMenu._id]) },
                });
            },
        },
        {
            icon: 'copy-outline',
            label: 'Select Multiple',
            onPress: () => {
                router.push('/(mentor)/roadmap/select-roadmap' as any);
            },
        },
    ], [selectedRoadmapForMenu]);

    // Handle roadmap press navigation
    const handleRoadmapPress = useCallback((roadmap: Roadmap) => {
        if (!roadmap || !roadmap._id) {
            console.error("❌ Roadmap or Roadmap ID is missing");
            return;
        }

        // Navigate to roadmap detail - using dynamic routes
        if (roadmap.roadmaps.length === 1 && !roadmap.haveNextedRoadMaps) {
            // Single task - go directly to task
            router.push({pathname: `/(mentor)/roadmap/${roadmap._id}/${roadmap.roadmaps[0]._id}` as any, params: { menteeId: selectedPastor?.id, menteeName: selectedPastor?.firstName + ' ' + selectedPastor?.lastName }});
        } else {
            // Multiple tasks - show task list
            router.push({pathname: `/(mentor)/roadmap/${roadmap._id}` as any, params: { menteeId: selectedPastor?.id, menteeName: selectedPastor?.firstName + ' ' + selectedPastor?.lastName }});
        }
    }, [selectedPastor]);

    // Apply all filters and return data for the list
    const displayData = useMemo(() => {
        // Case 1: Roadmap Library tab
        if (mainTab === 'ROADMAP_LIBRARY') {
            if (!roadmaps) return [];
            let filtered = roadmaps.map(roadmap => ({
                type: 'ROADMAP' as const,
                data: roadmap,
                status: getCardStatus(roadmap)
            }));

            if (librarySearch.trim()) {
                const searchLower = librarySearch.toLowerCase();
                filtered = filtered.filter(({ data: roadmap }) =>
                    roadmap.name?.toLowerCase().includes(searchLower) ||
                    roadmap.roadMapDetails?.toLowerCase().includes(searchLower) ||
                    roadmap.phase?.toLowerCase().includes(searchLower)
                );
            }
            return filtered;
        }

        // Case 2: Pastor's Roadmaps tab - No pastor selected (Show Mentee list)
        if (selectedPastor === null) {
            let filtered = mentees.map(mentee => ({
                type: 'MENTEE' as const,
                data: mentee
            }));

            if (pastorSearch.trim()) {
                const searchLower = pastorSearch.toLowerCase();
                filtered = filtered.filter(({ data: mentee }) =>
                    mentee.firstName?.toLowerCase().includes(searchLower) ||
                    mentee.lastName?.toLowerCase().includes(searchLower) ||
                    mentee.email?.toLowerCase().includes(searchLower)
                );
            }
            return filtered;
        }

        // Case 3: Pastor's Roadmaps tab - Pastor selected (Show assigned roadmaps with progress)
        if (!roadmaps || !pastorProgress) return [];

        // Filter roadmaps assigned to this pastor and merge with progress
        const assignedRoadmapIds = pastorProgress.roadmaps.items.map(item => item.roadMapId) || [];
        const assignedRoadmaps = roadmaps.filter(roadmap => assignedRoadmapIds.includes(roadmap._id));

        let merged = assignedRoadmaps.map(roadmap => {
            const progressItem = pastorProgress.roadmaps.items.find(p => p.roadMapId === roadmap._id);
            const mergedRoadmap = mergeRoadmapWithProgress(roadmap, progressItem);
            return {
                type: 'ROADMAP' as const,
                data: mergedRoadmap,
                status: getCardStatus(mergedRoadmap)
            };
        });

        // Apply status filter
        if (statusTab !== 'ALL') {
            const statusMap: Record<StatusTabKey, RoadmapCardStatus> = {
                ALL: 'initial',
                COMPLETED: 'completed',
                IN_PROGRESS: 'in-progress',
                NOT_STARTED: 'initial',
                DUE: 'due',
            };
            merged = merged.filter(({ status }) => status === statusMap[statusTab]);
        }

        // Apply search filter
        if (selectedPastorRoadmapSearch.trim()) {
            const searchLower = selectedPastorRoadmapSearch.toLowerCase();
            merged = merged.filter(({ data: roadmap }) =>
                roadmap.name?.toLowerCase().includes(searchLower) ||
                roadmap.roadMapDetails?.toLowerCase().includes(searchLower) ||
                roadmap.phase?.toLowerCase().includes(searchLower)
            );
        }

        return merged;
    }, [roadmaps, mainTab, selectedPastor, mentees, pastorProgress, pastorSearch, librarySearch, selectedPastorRoadmapSearch, statusTab]);

    const renderItem = useCallback(({ item,index }: { item: any,index: number }) => {
        if (item.type === 'MENTEE') {
            return (
                <MenteeCard
                    data={item.data}
                    onPress={() => setSelectedPastor(item.data)}
                />
            );
        }
        const cardData = getRoadmapCard(item.data);
        const isLibrary = mainTab === 'ROADMAP_LIBRARY';
                return (
            <Pressable onPress={() => {handleRoadmapPress(item.data)}}>
                <RoadmapCard
                    data={cardData}
                    showMenu={isLibrary}
                    onMenuPress={isLibrary ? () => handleRoadmapMenuPress(item.data) : undefined}
                />
                {index !== displayData.length - 1 && <View style={{ height: .5,marginHorizontal: 8,opacity: 0.5, backgroundColor: '#ffffff', marginTop: 4,marginBottom: 16 }} />}
            </Pressable>
        );
    }, [handleRoadmapPress, mainTab, handleRoadmapMenuPress]);

    const listEmptyComponent = useCallback(() => {
        if (isLoadingRoadmaps || isLoadingMentees || (selectedPastor && isLoadingProgress)) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            );
        }

        const currentSearch = selectedPastor
            ? selectedPastorRoadmapSearch
            : (mainTab === 'PASTOR_ROADMAPS' ? pastorSearch : librarySearch);

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="#fff" opacity={0.5} />
                <Text style={styles.emptyText}>
                    {currentSearch.trim()
                        ? `No results found matching "${currentSearch}"`
                        : 'No items available'}
                </Text>
            </View>
        );
    }, [isLoadingRoadmaps, isLoadingMentees, isLoadingProgress, pastorSearch, librarySearch, selectedPastorRoadmapSearch, mainTab, selectedPastor]);

    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#fff" />
            </View>
        );
    }, [isFetchingNextPage]);

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.topBarWrapper}>
                <TopBar role="mentor" showUserName />
            </View>
            <View style={{ paddingVertical: 8 }}>
                <View style={styles.headerContainer}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => {
                            if (selectedPastor) {
                                setSelectedPastor(null);
                            } else {
                                router.back();
                            }
                        }}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ marginLeft: 8 }}>
                            <Text style={styles.headerTitle}>
                                {selectedPastor ? `${selectedPastor.firstName}'s Roadmaps` : 'Revitalization Roadmap'}
                            </Text>
                            {selectedPastor && (
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', marginTop: 2,marginLeft: 8 }}>
                                    My Mentee &gt; {selectedPastor.firstName} {selectedPastor.lastName}
                                </Text>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => setIsRoadmapModalVisible(true)}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.searchWrapper}>
                <SearchBar
                    value={
                        selectedPastor
                            ? selectedPastorRoadmapSearch
                            : (mainTab === 'PASTOR_ROADMAPS' ? pastorSearch : librarySearch)
                    }
                    onChangeValue={
                        selectedPastor
                            ? setSelectedPastorRoadmapSearch
                            : (mainTab === 'PASTOR_ROADMAPS' ? setPastorSearch : setLibrarySearch)
                    }
                    placeholder={
                        selectedPastor
                            ? "Search in roadmaps"
                            : (mainTab === 'PASTOR_ROADMAPS' ? "Search pastors" : "Search in library")
                    }
                />
            </View>

            <View style={styles.mainTabsContainer}>
                <Pressable
                    style={[
                        styles.mainTab,
                        mainTab === 'PASTOR_ROADMAPS' && styles.mainTabActive
                    ]}
                    onPress={() => {
                        setMainTab('PASTOR_ROADMAPS');
                        setSelectedPastor(null);
                    }}
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
                    onPress={() => {
                        setMainTab('ROADMAP_LIBRARY');
                        setSelectedPastor(null);
                    }}
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

            {mainTab === 'PASTOR_ROADMAPS' && selectedPastor && (
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

            <FlatList
                data={displayData}
                keyExtractor={(item) => item.type === 'MENTEE' ? item.data.id : item.data._id}
                renderItem={renderItem}
                ListEmptyComponent={listEmptyComponent}
                ListFooterComponent={renderFooter}
                onEndReached={loadMoreMentees}
                onEndReachedThreshold={0.5}
                contentContainerStyle={[styles.scrollContent, displayData.length === 0 && styles.scrollContentFlex]}
                showsVerticalScrollIndicator={false}
                style={styles.flatList}
                keyboardShouldPersistTaps="handled"
            />

            <RoadMapOutcomeModal
                isMenuVisible={isRoadmapModalVisible}
                closeMenu={() => setIsRoadmapModalVisible(false)}
            />

            <ActionBottomSheet
                ref={bottomSheetModalRef}
                title={selectedRoadmapForMenu?.name || ""}
                subtitle={selectedRoadmapForMenu?.roadMapDetails || ""}
                image={selectedRoadmapForMenu?.imageUrl}
                actions={roadmapMenuItems}
                onClose={() => bottomSheetModalRef.current?.dismiss()}
            />
        </LinearGradient>
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
    flatList: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    scrollContentFlex: {
        flexGrow: 1,
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
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

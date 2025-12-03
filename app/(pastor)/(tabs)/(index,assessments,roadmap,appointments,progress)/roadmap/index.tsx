// import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
// import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
// import RoadmapCard from '@/components/director/ProgressRoadmapCard';
// import SearchBar from '@/components/director/SearchBar';
// import { TabSwitcher } from '@/components/director/TabSwitcher';
// import TopBar from '@/components/director/TopBar';
// import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
// import { usePhaseCard } from '@/lib/roadmap/mappers';
// import { mockRevitalization } from '@/lib/roadmap/mock';
// import { getPhase, getPhaseTasks } from '@/lib/roadmap/selectors';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { router } from 'expo-router';
// import { useCallback, useMemo, useState } from 'react';
// import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// type TabKey = 'ALL' | 'DUE' | 'COMPLETED' | 'NOT_STARTED' | 'IN_PROGRESS';

// export default function PhaseList() {
//     const { progress, resetAll } = useRoadmapProgress();
//     const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
//     const [showOutcomeModal, setShowOutcomeModal] = useState(false);
//     const [selectedOutcome, setSelectedOutcome] = useState('');
//     const [search, setSearch] = useState('');
//     const [activeTab, setActiveTab] = useState<TabKey>('ALL');

//     const outcomeMenuItems = useCallback((): MenuItem[] => [
//         {
//             id: 'outcome-4-months',
//             label: 'Expected Outcome - 4 Months',
//             onPress: () => {
//                 setSelectedOutcome('Expected Outcome - First Four Months');
//                 setShowOutcomeMenu(false);
//                 setShowOutcomeModal(true);
//             },
//         },
//         {
//             id: 'outcome-6-months',
//             label: 'Expected Outcome - 6 Months',
//             onPress: () => {
//                 setSelectedOutcome('Expected Outcome - Six Months');
//                 setShowOutcomeMenu(false);
//                 setShowOutcomeModal(true);
//             },
//         },
//         {
//             id: 'outcome-9-months',
//             label: 'Expected Outcome - 9 Months',
//             onPress: () => {
//                 setSelectedOutcome('Expected Outcome - Nine Months');
//                 setShowOutcomeMenu(false);
//                 setShowOutcomeModal(true);
//             },
//         },
//         {
//             id: 'outcome-end-year',
//             label: 'Expected Outcome - End of Year',
//             onPress: () => {
//                 setSelectedOutcome('Expected Outcome - End of Year');
//                 setShowOutcomeMenu(false);
//                 setShowOutcomeModal(true);
//             },
//         },
//     ], []);

//     const outcomeData = useCallback(() => [
//         { id: '1', text: 'The church is committed to the revitalization process.' },
//         { id: '2', text: 'The Church is praying consistently and intentionally for revitalization.' },
//         { id: '3', text: 'The church understands its current health and is committed to making improvements.' },
//         { id: '4', text: 'The church is beginning to feel like a warm and welcoming place for new attendees.' },
//         { id: '5', text: 'Church members have begun to build new relationships with people who have attended a community engagement event.' },
//         { id: '6', text: 'Church members will begin to feel a sense of hope for the future.' },
//     ], []);

//     const phasesWithStatus = useMemo(() => {
//         return mockRevitalization.program.phases.map(phaseId => {
//             const phase = getPhase(mockRevitalization, phaseId);
//             const tasks = getPhaseTasks(mockRevitalization, phase);

//             const completed = tasks.filter(t =>
//                 (progress[t.id]?.status || t.status) === 'COMPLETED'
//             ).length;
//             const total = tasks.length;

//             const anyDue = tasks.some(t => {
//                 const status = progress[t.id]?.status || t.status;
//                 const today = new Date().toISOString().slice(0, 10);
//                 return t.dueDate && t.dueDate <= today && status !== 'COMPLETED';
//             });

//             const anyInProgress = tasks.some(t =>
//                 (progress[t.id]?.status || t.status) === 'IN_PROGRESS'
//             );

//             const allCompleted = completed === total && total > 0;

//             const phaseStatus: 'initial' | 'in-progress' | 'completed' | 'due' =
//                 allCompleted ? 'completed' :
//                     anyDue ? 'due' :
//                         anyInProgress || completed > 0 ? 'in-progress' :
//                             'initial';

//             return { phase, tasks, phaseStatus };
//         });
//     }, [progress]);

//     const filteredPhases = useMemo(() => {
//         if (activeTab === 'ALL') return phasesWithStatus;

//         const statusMap: Record<TabKey, string> = {
//             ALL: '',
//             COMPLETED: 'completed',
//             IN_PROGRESS: 'in-progress',
//             NOT_STARTED: 'initial',
//             DUE: 'due',
//         };

//         return phasesWithStatus.filter(
//             ({ phaseStatus }) => phaseStatus === statusMap[activeTab]
//         );
//     }, [phasesWithStatus, activeTab]);

//     const handlePhasePress = useCallback((phase: typeof filteredPhases[0]['phase']) => {
//         if (phase.isSingleRoadmap && Array.isArray(phase.tasks) && phase.tasks.length === 1) {
//             router.push(`/roadmap/${phase.id}/${phase.tasks[0]}`);
//         } else {
//             router.push(`/roadmap/${phase.id}`);
//         }
//     }, []);

//     return (
//         <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
//             <View style={styles.topBarWrapper}>
//                 <TopBar role="pastor" userName="John Ross" showUserName />
//             </View>

//             <View style={styles.headerContainer}>
//                 <View style={styles.headerLeft}>
//                     <TouchableOpacity onPress={() => router.back()}>
//                         <Ionicons name="chevron-back" size={28} color="#fff" />
//                     </TouchableOpacity>
//                     <Text style={styles.headerTitle}>Revitalization Roadmap</Text>
//                 </View>
//                 <TouchableOpacity onPress={() => setShowOutcomeMenu(true)}>
//                     <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
//                 </TouchableOpacity>
//             </View>

//             <View style={styles.searchWrapper}>
//                 <SearchBar value={search} onChangeValue={setSearch} />
//             </View>

//             <TabSwitcher
//                 tabs={[
//                     { key: 'ALL', label: 'All' },
//                     { key: 'DUE', label: 'Due' },
//                     { key: 'IN_PROGRESS', label: 'In Progress' },
//                     { key: 'NOT_STARTED', label: 'Not Started' },
//                     { key: 'COMPLETED', label: 'Completed' },
//                 ]}
//                 activeTab={activeTab}
//                 onChange={(key) => setActiveTab(key as TabKey)}
//             />

//             <ScrollView contentContainerStyle={styles.scrollContent}>
//                 {activeTab === 'ALL' && (
//                     <Pressable onPress={resetAll} style={styles.clearButton}>
//                         <Text style={styles.clearButtonText}>Clear Roadmap Progress</Text>
//                     </Pressable>
//                 )}

//                 {filteredPhases.length > 0 ? (
//                     filteredPhases.map(({ phase, tasks }) => {
//                         const cardData = usePhaseCard(phase, tasks);
//                         return (
//                             <Pressable key={phase.id} onPress={() => handlePhasePress(phase)}>
//                                 <RoadmapCard data={cardData} />
//                             </Pressable>
//                         );
//                     })
//                 ) : (
//                     <View style={styles.emptyContainer}>
//                         <Text style={styles.emptyText}>No phases match the selected filter.</Text>
//                     </View>
//                 )}
//             </ScrollView>

//             <ContextMenu
//                 visible={showOutcomeMenu}
//                 items={outcomeMenuItems()}
//                 onClose={() => setShowOutcomeMenu(false)}
//                 position={{ top: 60, right: 16 }}
//                 minWidth={280}
//                 showIcons={false}
//                 itemTextStyle={{ fontSize: 15, fontWeight: '500', color: '#1A4882' }}
//             />

//             <ExpectedOutcomeModal
//                 visible={showOutcomeModal}
//                 onClose={() => setShowOutcomeModal(false)}
//                 title={selectedOutcome}
//                 outcomes={outcomeData()}
//                 onSelect={() => setShowOutcomeModal(false)}
//                 onEdit={() => setShowOutcomeModal(false)}
//                 onDownload={() => console.log('Download outcome')}
//             />
//         </LinearGradient>
//     );
// }

// const styles = StyleSheet.create({
//     topBarWrapper: { paddingBottom: 10 },
//     headerContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingVertical: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(255,255,255,0.2)',
//         marginBottom: 16,
//     },
//     headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
//     headerTitle: {
//         color: '#fff',
//         fontSize: 20,
//         fontWeight: '700',
//         marginLeft: 8,
//     },
//     searchWrapper: { paddingHorizontal: 16, marginBottom: 16 },
//     scrollContent: { padding: 16 },
//     clearButton: {
//         backgroundColor: '#264387',
//         paddingVertical: 10,
//         paddingHorizontal: 18,
//         borderRadius: 8,
//         alignSelf: 'flex-start',
//         marginBottom: 16,
//     },
//     clearButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
//     emptyContainer: { alignItems: 'center', marginTop: 40 },
//     emptyText: { color: 'white', fontSize: 16 },
// });



// screens/PhaseList.tsx
import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import RoadmapCard from '@/components/director/ProgressRoadmapCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { useRoadmaps } from '@/hooks/roadmaps/useRoadmaps';
import { getCardStatus } from '@/lib/roadmap/helpers';
import { getRoadmapCard } from '@/lib/roadmap/mappers';
import { Roadmap, RoadmapCardStatus } from '@/lib/roadmap/types';
import { useAuthStore } from '@/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type TabKey = 'ALL' | 'DUE' | 'COMPLETED' | 'NOT_STARTED' | 'IN_PROGRESS';

export default function PhaseList() {
    const { user } = useAuthStore();

    // Fetch roadmaps with merged progress status
    const {
        data: roadmaps,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useRoadmaps(user?.role || 'pastor');

    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('ALL');

    // Pull-to-refresh handler
    const onRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    const outcomeMenuItems = useCallback((): MenuItem[] => [
        {
            id: 'outcome-4-months',
            label: 'Expected Outcome - 4 Months',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - First Four Months');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: 'outcome-6-months',
            label: 'Expected Outcome - 6 Months',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - Six Months');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: 'outcome-9-months',
            label: 'Expected Outcome - 9 Months',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - Nine Months');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: 'outcome-end-year',
            label: 'Expected Outcome - End of Year',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - End of Year');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
    ], []);

    const outcomeData = useCallback(() => [
        { id: '1', text: 'The church is committed to the revitalization process.' },
        { id: '2', text: 'The Church is praying consistently and intentionally for revitalization.' },
        { id: '3', text: 'The church understands its current health and is committed to making improvements.' },
        { id: '4', text: 'The church is beginning to feel like a warm and welcoming place for new attendees.' },
        { id: '5', text: 'Church members have begun to build new relationships with people who have attended a community engagement event.' },
        { id: '6', text: 'Church members will begin to feel a sense of hope for the future.' },
    ], []);

    // Calculate phases with status (status already merged from progress)
    const phasesWithStatus = useMemo(() => {
        if (!roadmaps) return [];

        return roadmaps.map(roadmap => {
            const status = getCardStatus(roadmap);
            return { roadmap, status };
        });
    }, [roadmaps]);

    // Filter by search and active tab
    const filteredPhases = useMemo(() => {
        let filtered = phasesWithStatus;

        // Apply tab filter
        if (activeTab !== 'ALL') {
            const statusMap: Record<TabKey, RoadmapCardStatus> = {
                ALL: 'initial', // Not used
                COMPLETED: 'completed',
                IN_PROGRESS: 'in-progress',
                NOT_STARTED: 'initial',
                DUE: 'due',
            };

            filtered = filtered.filter(
                ({ status }) => status === statusMap[activeTab]
            );
        }

        // Apply search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(({ roadmap }) =>
                roadmap.name?.toLowerCase().includes(searchLower) ||
                roadmap.roadMapDetails?.toLowerCase().includes(searchLower) ||
                roadmap.phase?.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [phasesWithStatus, activeTab, search]);

    const handlePhasePress = useCallback((roadmap: Roadmap) => {
        console.log('Pressed roadmap:', {
            id: roadmap._id,
            name: roadmap.name,
            status: roadmap.status,
            hasNested: roadmap.haveNextedRoadMaps,
            taskCount: roadmap.roadmaps.length
        });

        if (!roadmap.haveNextedRoadMaps || roadmap.roadmaps.length === 0) {
            // No tasks - might be a placeholder or error
            console.warn('Roadmap has no tasks');
            return;
        }

        if (roadmap.roadmaps.length === 1 && !roadmap.haveNextedRoadMaps) {
            // Single task - go directly to task
            router.push(`/roadmap/${roadmap._id}/${roadmap.roadmaps[0]._id}`);
        } else {
            // Multiple tasks - show task list
            router.push(`/roadmap/${roadmap._id}`);
        }
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
                <View style={styles.topBarWrapper}>
                    <TopBar role="pastor" showUserName />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
                        Loading your roadmaps...
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    // Error state
    if (error) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
                <View style={styles.topBarWrapper}>
                    <TopBar role="pastor" showUserName />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="alert-circle" size={48} color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 16, textAlign: 'center', fontSize: 16 }}>
                        {error instanceof Error ? error.message : 'Failed to load roadmaps'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    if (!roadmaps || roadmaps.length === 0) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
                <View style={styles.topBarWrapper}>
                    <TopBar role="pastor" showUserName />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="map-outline" size={64} color="#fff" opacity={0.5} />
                    <Text style={{ color: '#fff', marginTop: 16, fontSize: 18, fontWeight: '600' }}>
                        No Roadmaps Assigned
                    </Text>
                    <Text style={{ color: '#cfe9f3', marginTop: 8, textAlign: 'center' }}>
                        You don't have any roadmaps assigned yet. Please contact your administrator.
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <View style={styles.topBarWrapper}>
                <TopBar role="pastor" showUserName />
            </View>

            <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Revitalization Roadmap</Text>
                </View>
                <TouchableOpacity onPress={() => setShowOutcomeMenu(true)}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <SearchBar
                    value={search}
                    onChangeValue={setSearch}
                    placeholder="Search roadmaps..."
                />
            </View>

            <TabSwitcher
                tabs={[
                    { key: 'ALL', label: 'All' },
                    { key: 'DUE', label: 'Due' },
                    { key: 'IN_PROGRESS', label: 'In Progress' },
                    { key: 'NOT_STARTED', label: 'Not Started' },
                    { key: 'COMPLETED', label: 'Completed' },
                ]}
                activeTab={activeTab}
                onChange={(key) => setActiveTab(key as TabKey)}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={onRefresh}
                        tintColor="#fff"
                        colors={['#fff']}
                        progressBackgroundColor="#264387"
                    />
                }
            >
                {filteredPhases.length > 0 ? (
                    filteredPhases.map(({ roadmap }) => {
                        // getRoadmapCard now uses status from merged progress data
                        const cardData = getRoadmapCard(roadmap);
                        return (
                            <Pressable
                                key={roadmap._id}
                                onPress={() => handlePhasePress(roadmap)}
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
                                : 'No roadmaps match the selected filter.'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            <ContextMenu
                visible={showOutcomeMenu}
                items={outcomeMenuItems()}
                onClose={() => setShowOutcomeMenu(false)}
                position={{ top: 60, right: 16 }}
                minWidth={280}
                showIcons={false}
                itemTextStyle={{ fontSize: 15, fontWeight: '500', color: '#1A4882' }}
            />

            <ExpectedOutcomeModal
                visible={showOutcomeModal}
                onClose={() => setShowOutcomeModal(false)}
                title={selectedOutcome}
                outcomes={outcomeData()}
                onSelect={() => setShowOutcomeModal(false)}
                onEdit={() => setShowOutcomeModal(false)}
                onDownload={() => console.log('Download outcome')}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    topBarWrapper: { paddingBottom: 10 },
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
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        marginLeft: 8,
    },
    searchWrapper: { paddingHorizontal: 16, marginBottom: 16 },
    scrollContent: { padding: 16 },
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
    retryButton: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#264387',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

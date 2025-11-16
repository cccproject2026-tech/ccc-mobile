import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import RoadmapCard from '@/components/director/ProgressRoadmapCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { useRoadmap } from '@/hooks/roadmaps/useRoadmaps';
import { getTasks, getTasksByDivision } from '@/lib/roadmap/helpers';
import { getTaskCard } from '@/lib/roadmap/mappers';
import { NestedRoadmap } from '@/lib/roadmap/types';
import { getFontSize, getSpacing, isAndroid } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type StatusTabKey = 'ALL' | 'DUE' | 'NOT_STARTED' | 'COMPLETED';
type TabKey = StatusTabKey | string; // string for division IDs

export default function PhaseDetail() {
    const { phaseId } = useLocalSearchParams<{ phaseId: string }>();
    
    // Fetch roadmap from API
    const { data: roadmap, isLoading, error } = useRoadmap(phaseId);

    // Get phase number from roadmap.phase
    const phaseNumber = useMemo(() => {
        if (!roadmap?.phase) return null;
        const match = roadmap.phase.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    }, [roadmap]);

    // Get divisions from roadmap.divisions array
    const phaseDivisions = useMemo(() => {
        if (!roadmap?.divisions || roadmap.divisions.length === 0) return [];
        return roadmap.divisions.map((division, index) => ({
            id: division.toLowerCase(),
            name: division.charAt(0).toUpperCase() + division.slice(1),
        }));
    }, [roadmap]);

    const hasDivisions = phaseDivisions.length > 0;

    // Get all tasks (nested roadmaps)
    const allTasks = useMemo(() => {
        return roadmap ? getTasks(roadmap) : [];
    }, [roadmap]);

    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [search, setSearch] = useState('');

    // Initialize activeTab - first division if exists, otherwise 'ALL'
    const [activeTab, setActiveTab] = useState<TabKey>('ALL');

    // Update activeTab when roadmap loads and divisions are available
    useEffect(() => {
        if (hasDivisions && phaseDivisions.length > 0 && activeTab === 'ALL') {
            setActiveTab(phaseDivisions[0].id);
        }
    }, [hasDivisions, phaseDivisions, activeTab]);

    // Outcome menu
    const outcomeMenuItems = useCallback((): MenuItem[] => [
        {
            id: 'edit-phase',
            label: 'Edit Phase',
            onPress: () => {
                setShowOutcomeMenu(false);
                router.push({
                    pathname: '/(director)/(tabs)/revitalization-roadmaps/(creation)/create-roadmap',
                    params: {
                        isEditMode: 'true',
                        roadmapId: phaseId,
                    },
                });
            },
        },
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
    ], [phaseId, router]);

    const outcomeData = useCallback(() => [
        { id: '1', text: 'The church is committed to the revitalization process.' },
        { id: '2', text: 'The Church is praying consistently and intentionally for revitalization.' },
        { id: '3', text: 'The church understands its current health and is committed to making improvements.' },
        { id: '4', text: 'The church is beginning to feel like a warm and welcoming place for new attendees.' },
        { id: '5', text: 'Church members have begun to build new relationships.' },
        { id: '6', text: 'Church members will begin to feel a sense of hope for the future.' },
    ], []);

    const handleCreateTask = useCallback(() => {
        if (!phaseId) {
            return;
        }

        router.push({
            pathname: '/(director)/(tabs)/revitalization-roadmaps/(creation)/create-roadmap',
            params: {
                isNestedRoadmap: 'true',
                parentRoadmapId: phaseId,
                phase: roadmap?.phase || '',
            },
        });
    }, [phaseId, roadmap, router]);

    // Generate tabs: division tabs replace "All" tab, but status tabs remain
    const tabs = useMemo(() => {
        if (hasDivisions) {
            // Division tabs + status filter tabs (without "All")
            const divisionTabs = phaseDivisions.map(division => ({
                key: division.id,
                label: division.name,
            }));

            const statusTabs = [
                { key: 'DUE', label: 'Due' },
                { key: 'NOT_STARTED', label: 'Not Started' },
                { key: 'COMPLETED', label: 'Completed' },
            ];

            return [...divisionTabs, ...statusTabs];
        } else {
            // Standard tabs with "All"
            return [
                { key: 'ALL', label: 'All' },
                { key: 'DUE', label: 'Due' },
                { key: 'NOT_STARTED', label: 'Not Started' },
                { key: 'COMPLETED', label: 'Completed' },
            ];
        }
    }, [hasDivisions, phaseDivisions]);

    // Check if activeTab is a division ID
    const isDivisionTab = useMemo(() => {
        return hasDivisions && phaseDivisions.some(d => d.id === activeTab);
    }, [hasDivisions, phaseDivisions, activeTab]);

    // Filter tasks based on active tab
    const filteredTasks = useMemo(() => {
        if (!roadmap) return [];

        let tasksToFilter: NestedRoadmap[] = [];

        // Determine which tasks to filter
        if (isDivisionTab) {
            // Get tasks for the selected division
            const groupedTasks = getTasksByDivision(roadmap);
            tasksToFilter = groupedTasks[activeTab as string] || [];
        } else if (activeTab === 'ALL') {
            // Show all tasks (only for phases without divisions)
            tasksToFilter = allTasks;
        } else {
            // Apply status filter (DUE, NOT_STARTED, COMPLETED)
            // For phases with divisions, filter across ALL tasks
            tasksToFilter = allTasks.filter(task => {
                const status = task.status;

                if (activeTab === 'DUE') {
                    const today = new Date().toISOString().slice(0, 10);
                    return task.endDate && task.endDate <= today && status !== 'completed';
                }

                if (activeTab === 'NOT_STARTED') return status === 'not started';
                if (activeTab === 'COMPLETED') return status === 'completed';

                return false;
            });
        }

        // Apply search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            tasksToFilter = tasksToFilter.filter(task =>
                task.name.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower) ||
                task.roadMapDetails?.toLowerCase().includes(searchLower)
            );
        }

        return tasksToFilter;
    }, [roadmap, isDivisionTab, activeTab, allTasks, search]);

    // Loading state
    if (isLoading) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
                <View style={{ paddingBottom: 10 }}>
                    <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
                        Loading roadmap...
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    // Error state
    if (error) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
                <View style={{ paddingBottom: 10 }}>
                    <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                    <Text style={{ color: '#ff6b6b', marginTop: 16, fontSize: 16, textAlign: 'center', fontWeight: '600' }}>
                        Failed to load roadmap
                    </Text>
                    <Text style={{ color: '#fff', marginTop: 8, fontSize: 14, textAlign: 'center', opacity: 0.8 }}>
                        {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    // No roadmap found
    if (!roadmap) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
                <View style={{ paddingBottom: 10 }}>
                    <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Roadmap not found</Text>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />
            </View>

            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: getSpacing(8),
                paddingVertical: getSpacing(16),
                marginBottom: getSpacing(16),
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.2)',
            }}>
                {/* Left side - Back button and Text */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    marginRight: getSpacing(12),
                }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginRight: getSpacing(8) }}
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Text Container with flex to prevent overflow */}
                    <View style={{ flex: 1, marginRight: getSpacing(8) }}>
                        <Text
                            style={{
                                fontSize: isAndroid ? getFontSize(18) : getFontSize(15),
                                fontWeight: '700',
                                lineHeight: getFontSize(18),
                                color: '#FFFFFF',
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {roadmap.name}
                        </Text>
                        {(roadmap.roadMapDetails || roadmap.description) && (
                            <Text
                                style={{
                                    marginTop: getSpacing(4),
                                    fontSize: getFontSize(12),
                                    color: 'rgba(255, 255, 255, 0.8)',
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {roadmap.roadMapDetails || roadmap.description}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Right side - Phase badge, task button and menu */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: getSpacing(8),
                }}>
                    {phaseNumber && (
                        <View style={{
                            backgroundColor: '#F7E35F',
                            borderRadius: 10,
                            paddingHorizontal: getSpacing(10),
                            paddingVertical: getSpacing(2),
                        }}>
                            <Text style={{
                                color: '#1D1D1D',
                                fontWeight: '700',
                                fontSize: getFontSize(13),
                            }}>
                                Phase {phaseNumber}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={handleCreateTask}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 8,
                            paddingHorizontal: getSpacing(8),
                            paddingVertical: getSpacing(6),
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: getSpacing(4),
                        }}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={{
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: getFontSize(13),
                        }}>
                            Task
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowOutcomeMenu(true)}
                        style={{ padding: getSpacing(4) }}
                    >
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search & Tabs */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <SearchBar value={search} onChangeValue={setSearch} />
            </View>

            {/* Tabs: Division tabs (replacing "All") + Status filter tabs */}
            <TabSwitcher
                tabs={tabs}
                activeTab={activeTab}
                onChange={(key) => setActiveTab(key as TabKey)}
            />

            {/* Content */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => {
                        const cardData = getTaskCard(task);
                        return (
                            <Pressable
                                key={task._id}
                                onPress={() => router.push(`/(director)/(tabs)/revitalization-roadmaps/${phaseId}/${task._id}`)}
                            >
                                <RoadmapCard data={cardData} />
                            </Pressable>
                        );
                    })
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ color: 'white', fontSize: 16 }}>
                            {search.trim()
                                ? 'No tasks match your search.'
                                : 'No tasks available.'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Modals */}
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

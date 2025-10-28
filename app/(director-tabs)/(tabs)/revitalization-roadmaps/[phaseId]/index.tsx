import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import RoadmapCard from '@/components/director/ProgressRoadmapCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { getDivisionsForPhase, getPhase, getPhaseTasks, getTasksForDivision } from '@/lib/roadmap/selectors';
import { Task } from '@/lib/roadmap/types';
import { getFontSize, getSpacing, isAndroid } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type StatusTabKey = 'ALL' | 'DUE' | 'NOT_STARTED' | 'COMPLETED';
type TabKey = StatusTabKey | string; // string for division IDs

export default function PhaseDetail() {
    const { phaseId } = useLocalSearchParams<{ phaseId: string }>();
    const phase = getPhase(mockRevitalization, phaseId!);

    // Compute phase number from phaseId
    let phaseNumber: number | null = null;
    if (phaseId && phaseId.startsWith('phase-')) {
        const num = parseInt(phaseId.replace('phase-', ''), 10);
        if (!isNaN(num)) phaseNumber = num;
    }

    // Check if phase has divisions
    const phaseDivisions = getDivisionsForPhase(mockRevitalization, phaseId!);
    const hasDivisions = phaseDivisions.length > 0;

    // Get all tasks (either from divisions or direct)
    const allTasks = getPhaseTasks(mockRevitalization, phase);
    const { progress } = useRoadmapProgress();

    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [search, setSearch] = useState('');

    // Initialize activeTab - first division if exists, otherwise 'ALL'
    const [activeTab, setActiveTab] = useState<TabKey>(
        hasDivisions ? (phaseDivisions[0]?.id || 'ALL') : 'ALL'
    );

    // Outcome menu
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
        { id: '5', text: 'Church members have begun to build new relationships.' },
        { id: '6', text: 'Church members will begin to feel a sense of hope for the future.' },
    ], []);

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
        let tasksToFilter: Task[] = [];

        // Determine which tasks to filter
        if (isDivisionTab) {
            // Get tasks for the selected division
            tasksToFilter = getTasksForDivision(mockRevitalization, activeTab);
        } else if (activeTab === 'ALL') {
            // Show all tasks (only for phases without divisions)
            tasksToFilter = allTasks;
        } else {
            // Apply status filter (DUE, NOT_STARTED, COMPLETED)
            // For phases with divisions, filter across ALL tasks
            tasksToFilter = allTasks.filter(task => {
                const status = progress[task.id]?.status || task.status;

                if (activeTab === 'DUE') {
                    const today = new Date().toISOString().slice(0, 10);
                    return task.dueDate && task.dueDate <= today && status !== 'COMPLETED';
                }

                if (activeTab === 'NOT_STARTED') return status === 'NOT_STARTED';
                if (activeTab === 'COMPLETED') return status === 'COMPLETED';

                return false;
            });
        }

        // Apply search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            tasksToFilter = tasksToFilter.filter(task =>
                task.title.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower)
            );
        }

        return tasksToFilter;
    }, [isDivisionTab, activeTab, allTasks, progress, search]);

    // Convert task to card data
    const getTaskCardData = useCallback((task: Task) => {
        const status = progress[task.id]?.status || task.status;
        const cardStatus: 'initial' | 'in-progress' | 'completed' | 'due' =
            status === 'COMPLETED' ? 'completed' :
                status === 'IN_PROGRESS' ? 'in-progress' :
                    status === 'BLOCKED' ? 'due' :
                        'initial';

        return {
            image: task.meta?.coverImage,
            title: task.title,
            description: task.description,
            completionTime: `Completion Time\nMonths ${task.meta?.completionTimeMonths || '1 - 2'}`,
            status: cardStatus,
            completedDate: status === 'COMPLETED' ? new Date().toISOString().slice(0, 10) : undefined,
            showArrow: true,
            showCheckmark: status === 'COMPLETED',
        };
    }, [progress]);

    console.log({
        filteredTasks,
        hasDivisions,
        activeTab,
        isDivisionTab,
        totalTasks: allTasks.length
    });

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
                            {phase.title}
                        </Text>
                        {phase.subtitle && (
                            <Text
                                style={{
                                    marginTop: getSpacing(4),
                                    fontSize: getFontSize(12),
                                    color: 'rgba(255, 255, 255, 0.8)',
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {phase.subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Right side - Phase badge and menu */}
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
                        const cardData = getTaskCardData(task);
                        return (
                            <Pressable
                                key={task.id}
                                onPress={() => router.push(`/(director-tabs)/(tabs)/revitalization-roadmaps/${phaseId}/${task.id}`)}
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

import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import RoadmapCard from '@/components/director/ProgressRoadmapCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { usePhaseCard } from '@/lib/roadmap/mappers';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { getPhase, getPhaseTasks } from '@/lib/roadmap/selectors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type TabKey = 'ALL' | 'DUE' | 'COMPLETED' | 'NOT_STARTED' | 'IN_PROGRESS';

export default function PhaseList() {
    const { progress, resetAll } = useRoadmapProgress();
    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('ALL');

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
        { id: '5', text: 'Church members have begun to build new relationships with people who have attended a community engagement event.' },
        { id: '6', text: 'Church members will begin to feel a sense of hope for the future.' },
    ], []);

    // Calculate phase statuses with progress
    const phasesWithStatus = useMemo(() => {
        return mockRevitalization.program.phases.map(phaseId => {
            const phase = getPhase(mockRevitalization, phaseId);
            const tasks = getPhaseTasks(mockRevitalization, phase);

            // Calculate status
            const completed = tasks.filter(t =>
                (progress[t.id]?.status || t.status) === 'COMPLETED'
            ).length;
            const total = tasks.length;

            const anyDue = tasks.some(t => {
                const status = progress[t.id]?.status || t.status;
                const today = new Date().toISOString().slice(0, 10);
                return t.dueDate && t.dueDate <= today && status !== 'COMPLETED';
            });

            const anyInProgress = tasks.some(t =>
                (progress[t.id]?.status || t.status) === 'IN_PROGRESS'
            );

            const allCompleted = completed === total && total > 0;

            const phaseStatus: 'initial' | 'in-progress' | 'completed' | 'due' =
                allCompleted ? 'completed' :
                    anyDue ? 'due' :
                        anyInProgress || completed > 0 ? 'in-progress' :
                            'initial';

            return { phase, tasks, phaseStatus };
        });
    }, [progress]);

    // Filter by tab
    const filteredPhases = useMemo(() => {
        if (activeTab === 'ALL') return phasesWithStatus;

        const statusMap: Record<TabKey, string> = {
            ALL: '',
            COMPLETED: 'completed',
            IN_PROGRESS: 'in-progress',
            NOT_STARTED: 'initial',
            DUE: 'due',
        };

        return phasesWithStatus.filter(
            ({ phaseStatus }) => phaseStatus === statusMap[activeTab]
        );
    }, [phasesWithStatus, activeTab]);

    const handlePhasePress = useCallback((phase: typeof filteredPhases[0]['phase']) => {
        if (phase.isSingleRoadmap && Array.isArray(phase.tasks) && phase.tasks.length === 1) {
            router.push(`/roadmap/${phase.id}/${phase.tasks[0]}`);
        } else {
            router.push(`/roadmap/${phase.id}`);
        }
    }, []);

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="pastor" userName="John Ross" showUserName />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 mb-4 border-b border-white/20">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text className="ml-2 text-xl font-bold text-white">
                        Revitalization Roadmap
                    </Text>
                </View>
                <TouchableOpacity onPress={() => setShowOutcomeMenu(true)}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search & Tabs */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <SearchBar value={search} onChangeValue={setSearch} />
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

            {/* Content */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {activeTab === 'ALL' && (
                    <Pressable
                        onPress={resetAll}
                        style={{
                            backgroundColor: '#264387',
                            paddingVertical: 10,
                            paddingHorizontal: 18,
                            borderRadius: 8,
                            alignSelf: 'flex-start',
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                            Clear Roadmap Progress
                        </Text>
                    </Pressable>
                )}

                {filteredPhases.length > 0 ? (
                    filteredPhases.map(({ phase, tasks }) => {
                        const cardData = usePhaseCard(phase, tasks);
                        return (
                            <Pressable key={phase.id} onPress={() => handlePhasePress(phase)}>
                                <RoadmapCard data={cardData} />
                            </Pressable>
                        );
                    })
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ color: 'white', fontSize: 16 }}>
                            No phases match the selected filter.
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

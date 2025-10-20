// app/(pastor-tabs)/(tabs)/new-roadmap/[phaseId]/index.tsx - OPTIMIZED
import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import RoadmapCard from '@/components/director/ProgressRoadmapCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { getPhase, getPhaseTasks } from '@/lib/roadmap/selectors';
import { Task } from '@/lib/roadmap/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type TabKey = 'ALL' | 'DUE' | 'NOT_STARTED' | 'COMPLETED';

export default function PhaseDetail() {
    const { phaseId } = useLocalSearchParams<{ phaseId: string }>();
    const phase = getPhase(mockRevitalization, phaseId!);
    const tasks = getPhaseTasks(mockRevitalization, phase);
    const { progress } = useRoadmapProgress();

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
        { id: '5', text: 'Church members have begun to build new relationships.' },
        { id: '6', text: 'Church members will begin to feel a sense of hope for the future.' },
    ], []);

    // Filter tasks based on tab
    const filteredTasks = useMemo(() => {
        if (activeTab === 'ALL') return tasks;

        return tasks.filter(task => {
            const status = progress[task.id]?.status || task.status;

            if (activeTab === 'DUE') {
                const today = new Date().toISOString().slice(0, 10);
                return task.dueDate && task.dueDate <= today && status !== 'COMPLETED';
            }

            if (activeTab === 'NOT_STARTED') return status === 'NOT_STARTED';
            if (activeTab === 'COMPLETED') return status === 'COMPLETED';

            return false;
        });
    }, [tasks, activeTab, progress]);

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

    console.log({ filteredTasks });
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
                    <View className="ml-2">
                        <Text className="text-xl font-bold leading-6 text-white">
                            {phase.title}
                        </Text>
                        {phase.subtitle && (
                            <Text className="mt-1 text-sm text-white/80">
                                {phase.subtitle}
                            </Text>
                        )}
                    </View>
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
                    { key: 'NOT_STARTED', label: 'Not Started' },
                    { key: 'COMPLETED', label: 'Completed' },
                ]}
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
                                onPress={() => router.push(`/new-roadmap/${phaseId}/${task.id}`)}
                            >
                                <RoadmapCard data={cardData} />
                            </Pressable>
                        );
                    })
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <Text style={{ color: 'white', fontSize: 16 }}>
                            No tasks match the selected filter.
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

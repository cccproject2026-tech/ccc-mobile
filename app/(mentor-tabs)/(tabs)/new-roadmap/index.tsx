// app/(tabs)/new-roadmap/index.tsx or wherever your file is
import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import RoadmapCard from '@/components/director/ProgressRoadmapCard';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { usePhaseToCard } from '@/lib/roadmap/mappers';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { selectPhase, selectProgram } from '@/lib/roadmap/selectors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function PhaseList() {
    const program = selectProgram(mockRevitalization);
    const { resetAll } = useRoadmapProgress();
    const { progress } = useRoadmapProgress();
    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<string>('');
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<
        'ALL' | 'DUE' | 'COMPLETED' | 'NOT_STARTED' | 'IN_PROGRESS'
    >('ALL');

    // Outcome menu items
    const getOutcomeMenuItems = useCallback((): MenuItem[] => [
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

    const getOutcomeData = useCallback((title: string) => {
        return [
            { id: '1', text: 'The church is committed to the revitalization process.' },
            { id: '2', text: 'The Church is praying consistently and intentionally for revitalization.' },
            { id: '3', text: 'The church understands its current health and is committed to making improvements.' },
            { id: '4', text: 'The church is beginning to feel like a warm and welcoming place for new attendees.' },
            { id: '5', text: 'Church members have begun to build new relationships with people who have attended a community engagement event and its follow-up event.' },
            { id: '6', text: 'Church members will begin to feel a sense of hope for the future and begin expecting God to do something exciting in their church.' },
        ];
    }, []);

    const tabData = [
        { key: 'ALL', label: 'All' },
        { key: 'DUE', label: 'Due' },
        { key: 'IN_PROGRESS', label: 'In Progress' },
        { key: 'NOT_STARTED', label: 'Not Started' },
        { key: 'COMPLETED', label: 'Completed' },
    ];

    const handleTabChange = useCallback((key: string) => {
        setActiveTab(key as any);
    }, []);

    // Get phases that should be shown based on the active tab
    const filteredPhases = program.phases
        .map(pid => selectPhase(mockRevitalization, pid))
        .filter(phase => {
            const items = phase.items
                .map(id => mockRevitalization.items[id])
                .filter((item): item is NonNullable<typeof item> => item != null);

            if (activeTab === 'ALL') return true;

            // For COMPLETED tab, check if ALL items in the phase are completed
            if (activeTab === 'COMPLETED') {
                return items.length > 0 && items.every(item => {
                    const status = progress[item.id]?.status || item.status;
                    return status === 'COMPLETED';
                });
            }

            // For DUE tab, check if any item is due
            if (activeTab === 'DUE') {
                const today = new Date().toISOString().slice(0, 10);
                return items.some(item => {
                    const status = progress[item.id]?.status || item.status;
                    return item.dueDate &&
                        item.dueDate <= today &&
                        status !== 'COMPLETED';
                });
            }

            // For IN_PROGRESS and NOT_STARTED, check if any item matches
            return items.some(item => {
                const status = progress[item.id]?.status || item.status;
                return status === activeTab;
            });
        });

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1 }}
        >
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="pastor" showUserName />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-1 py-4 mb-4 border-b border-white/20">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View className="ml-2">
                        <Text className="text-xl font-bold leading-6 text-white">
                            Revitalization Roadmap
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    className="p-1"
                    onPress={() => setShowOutcomeMenu(prev => !prev)}
                >
                    <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Search & Tabs */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <SearchBar value={search} onChangeValue={setSearch} />
            </View>
            <TabSwitcher
                tabs={tabData}
                activeTab={activeTab}
                onChange={handleTabChange}
            />

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Only show reset button on "All" tab */}
                {activeTab === 'ALL' && (
                    <View style={{ marginBottom: 16 }}>
                        <Pressable
                            onPress={resetAll}
                            style={{
                                backgroundColor: '#264387',
                                paddingVertical: 10,
                                paddingHorizontal: 18,
                                borderRadius: 8,
                                alignSelf: 'flex-start',
                            }}
                        >
                            <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                                Clear Roadmap Progress
                            </Text>
                        </Pressable>
                    </View>
                )}

                {filteredPhases.length > 0 ? (
                    filteredPhases.map(phase => {
                        const card = usePhaseToCard(mockRevitalization, phase);
                        const isSingleItem = phase.items.length === 1;

                        const handlePress = () => {
                            if (isSingleItem) {
                                router.push(`/new-roadmap/${phase.id}/${phase.items[0]}`);
                            } else {
                                router.push(`/new-roadmap/${phase.id}`);
                            }
                        };

                        return (
                            <Pressable key={phase.id} onPress={handlePress}>
                                <RoadmapCard data={card} />
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

            {/* Context Menu (rendered on top) */}
            <ContextMenu
                visible={showOutcomeMenu}
                items={getOutcomeMenuItems()}
                onClose={() => setShowOutcomeMenu(false)}
                position={{ top: 60, right: 16 }}
                minWidth={280}
                showIcons={false}
                itemTextStyle={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: '#1A4882',
                }}
            />

            {/* Outcome Modal */}
            <ExpectedOutcomeModal
                visible={showOutcomeModal}
                onClose={() => setShowOutcomeModal(false)}
                title={selectedOutcome}
                outcomes={getOutcomeData(selectedOutcome)}
                onSelect={() => setShowOutcomeModal(false)}
                onEdit={() => setShowOutcomeModal(false)}
                onDownload={() => console.log('Download outcome')}
            />
        </LinearGradient>
    );
}
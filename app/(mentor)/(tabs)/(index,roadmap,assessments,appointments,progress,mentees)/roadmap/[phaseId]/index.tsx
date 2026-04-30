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
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StatusTabKey = 'ALL' | 'DUE' | 'NOT_STARTED' | 'COMPLETED';
type TabKey = StatusTabKey | string;

export default function RoadmapDetail() {
    const { phaseId, menteeId, menteeName } = useLocalSearchParams<{ phaseId: string, menteeId?: string, menteeName?: string }>();
    const { bottom } = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const horizontalPadding = useMemo(() => {
        const v = Math.round(width * 0.05);
        return Math.max(16, Math.min(24, v));
    }, [width]);
    const maxWidth = useMemo(() => (width >= 520 ? 520 : undefined), [width]);

    // Fetch single roadmap
    const targetUserId = menteeId;
    const { data: roadmap, isLoading, error, refetch } = useRoadmap(phaseId, targetUserId);

    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [search, setSearch] = useState('');

    // Get phase number from phase string
    const phaseNumber = useMemo(() => {
        if (!roadmap?.phase) return null;
        const match = roadmap.phase.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    }, [roadmap]);

    // Check if roadmap has divisions
    const hasDivisions = useMemo(() => {
        return roadmap?.divisions && roadmap.divisions.length > 0;
    }, [roadmap]);

    // Get divisions
    const divisions = useMemo(() => {
        if (!roadmap || !hasDivisions) return [];
        return roadmap.divisions;
    }, [roadmap, hasDivisions]);

    // Initialize activeTab - first division if exists, otherwise 'ALL'
    const [activeTab, setActiveTab] = useState<TabKey>(() => {
        if (hasDivisions && divisions.length > 0) {
            return divisions[0];
        }
        return 'ALL';
    });

    // Update active tab when divisions change
    useMemo(() => {
        const statusKeys = ['ALL', 'DUE', 'NOT_STARTED', 'COMPLETED'];
        if (hasDivisions &&
            divisions.length > 0 &&
            !divisions.includes(activeTab as string) &&
            !statusKeys.includes(activeTab as string)) {
            setActiveTab(divisions[0]);
        }
    }, [hasDivisions, divisions, activeTab]);

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

    // Generate tabs based on whether divisions exist
    const tabs = useMemo(() => {
        if (hasDivisions && divisions.length > 0) {
            const divisionTabs = divisions.map(division => ({
                key: division,
                label: division.charAt(0).toUpperCase() + division.slice(1),
            }));

            const statusTabs = [
                { key: 'DUE', label: 'Due' },
                { key: 'NOT_STARTED', label: 'Not Started' },
                { key: 'COMPLETED', label: 'Completed' },
            ];

            return [...divisionTabs, ...statusTabs];
        } else {
            return [
                { key: 'ALL', label: 'All' },
                { key: 'DUE', label: 'Due' },
                { key: 'NOT_STARTED', label: 'Not Started' },
                { key: 'COMPLETED', label: 'Completed' },
            ];
        }
    }, [hasDivisions, divisions]);

    // Check if activeTab is a division
    const isDivisionTab = useMemo(() => {
        return hasDivisions && divisions.includes(activeTab as string);
    }, [hasDivisions, divisions, activeTab]);

    // Get all tasks
    const allTasks = useMemo(() => {
        return roadmap ? getTasks(roadmap) : [];
    }, [roadmap]);

    // Filter tasks based on active tab
    const filteredTasks = useMemo(() => {
        if (!roadmap) return [];

        let tasksToFilter: NestedRoadmap[] = [];

        if (isDivisionTab) {
            const groupedTasks = getTasksByDivision(roadmap);
            const exactMatch = groupedTasks[activeTab as string];

            if (exactMatch) {
                tasksToFilter = exactMatch;
            } else {
                const matchingKey = Object.keys(groupedTasks).find(
                    key => key.toLowerCase() === (activeTab as string).toLowerCase()
                );
                tasksToFilter = matchingKey ? groupedTasks[matchingKey] : [];
            }
        } else if (activeTab === 'ALL') {
            tasksToFilter = allTasks;
        } else {
            tasksToFilter = allTasks.filter(task => {
                const status = task.status ? task.status.toLowerCase() : '';

                if (activeTab === 'DUE') {
                    if (!task.endDate) return false;
                    const today = new Date().toISOString().slice(0, 10);
                    return task.endDate <= today && status !== 'completed';
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
                (task.name && task.name.toLowerCase().includes(searchLower)) ||
                (task.roadMapDetails && task.roadMapDetails.toLowerCase().includes(searchLower)) ||
                (task.description && task.description.toLowerCase().includes(searchLower))
            );
        }

        return tasksToFilter;
    }, [roadmap, isDivisionTab, activeTab, allTasks, search]);

    // Loading state
    if (isLoading) {
        return (
            <AppGradientBackground style={{ flex: 1 }}>
                <View style={{ paddingBottom: 10 }}>
                    <TopBar role="mentor" showUserName />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 16 }}>Loading roadmap details...</Text>
                </View>
            </AppGradientBackground>
        );
    }

    // Error or not found state
    if (error || !roadmap) {
        return (
            <AppGradientBackground style={{ flex: 1 }}>
                <View style={{ paddingBottom: 10 }}>
                    <TopBar role="mentor" showUserName />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="alert-circle" size={48} color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 16, textAlign: 'center' }}>
                        {error ? 'Failed to load roadmap details' : 'Roadmap not found'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        style={{ marginTop: 20, padding: 12, backgroundColor: '#264387', borderRadius: 8 }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </AppGradientBackground>
        );
    }

    return (
        <AppGradientBackground style={styles.root}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="mentor" showUserName />
            </View>

            {/* Header */}
            <View style={[styles.section, { paddingHorizontal: horizontalPadding, maxWidth }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.backBtn}
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.headerTextCol}>
                        <Text
                            style={styles.headerTitle}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {roadmap.name}
                        </Text>
                        {roadmap.roadMapDetails && (
                            <Text
                                style={styles.headerSubtitle}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {roadmap.roadMapDetails}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.headerActions}>
                    {phaseNumber && (
                        <View style={styles.phaseBadge}>
                            <Text style={styles.phaseBadgeText}>
                                Phase {phaseNumber}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => setShowOutcomeMenu(true)}
                        style={styles.moreBtn}
                    >
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={[styles.section, { paddingHorizontal: horizontalPadding, maxWidth }]}>
                <SearchBar value={search} onChangeValue={setSearch} />
            </View>

            {/* Tabs */}
            <View style={[styles.section, { paddingHorizontal: horizontalPadding, maxWidth }]}>
                <TabSwitcher
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={(key) => setActiveTab(key as TabKey)}
                />
            </View>

            {/* Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.content,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: bottom + 20,
                        maxWidth,
                    },
                ]}
            >
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => {
                        const cardData = getTaskCard(task);
                        return (
                            <Pressable
                                key={task._id}
                                onPress={() => router.push({pathname: `/(mentor)/roadmap/${phaseId}/${task._id}` as any, params: { menteeId: menteeId, menteeName: menteeName }})}
                                style={styles.cardPress}
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
        </AppGradientBackground>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    section: {
        width: '100%',
        alignSelf: 'center',
        marginBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: getSpacing(14),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.18)',
    },
    backBtn: { marginRight: getSpacing(8) },
    headerTextCol: { flex: 1, minWidth: 0, marginRight: getSpacing(10) },
    headerTitle: {
        fontSize: isAndroid ? getFontSize(18) : getFontSize(16),
        fontWeight: '800',
        lineHeight: getFontSize(20),
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    headerSubtitle: {
        marginTop: getSpacing(4),
        fontSize: getFontSize(12),
        color: 'rgba(255, 255, 255, 0.8)',
    },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: getSpacing(8) },
    phaseBadge: {
        backgroundColor: 'rgba(250, 204, 21, 0.28)',
        borderRadius: 10,
        paddingHorizontal: getSpacing(10),
        paddingVertical: getSpacing(3),
    },
    phaseBadgeText: {
        color: '#FDE68A',
        fontWeight: '800',
        fontSize: getFontSize(12.5),
        letterSpacing: 0.2,
    },
    moreBtn: { padding: getSpacing(4) },
    content: {
        paddingTop: 4,
        alignSelf: 'center',
        width: '100%',
        gap: 12,
    },
    cardPress: { borderRadius: 14, overflow: 'hidden' },
});

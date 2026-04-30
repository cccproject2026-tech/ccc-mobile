import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import TopBar from '@/components/director/TopBar';

import {
    useDeleteRoadmapDocument,
    useRoadmap,
    useRoadmapDocuments
} from '@/hooks/roadmaps/useRoadmaps';
import { getTasks } from '@/lib/roadmap/helpers';
import { useAuthStore } from '@/stores';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import AppGradientBackground from "@/components/layout/AppGradientBackground";

const { width } = Dimensions.get('window');
const PADDING = 16;
const CONTAINER_PADDING = 16;
const GAP = 12;
const imageWidth = (width - (PADDING * 2) - (CONTAINER_PADDING * 2) - GAP) / 2;

// Shape of each flattened document item from useRoadmapDocuments
type RoadmapMedia = {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploadedAt?: string;
    extraName?: string;
    uploadBatchId?: string;
};

export default function ShareMedia() {
    const { user } = useAuthStore();

    const { taskId, extraName, roadMapId, nestedId } =
        useLocalSearchParams<{
            taskId?: string;
            extraName?: string;
            roadMapId?: string;
            nestedId?: string;
        }>();

    const deleteDocument = useDeleteRoadmapDocument();

    // Fetch roadmap data to get task title
    const { data: roadmap, isLoading: isLoadingRoadmap } = useRoadmap(roadMapId || undefined);

    // Fetch all documents for this roadmap item + extraName
    const { data: docs = [] } = useRoadmapDocuments(
        roadMapId,
        nestedId,
        user?.id,
        extraName
    ) as { data: RoadmapMedia[] | undefined } as any;

    interface RoadmapMedia {
        _id: string;
        fileName: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
        uploadedAt?: string;
        extraName?: string;
        uploadBatchId?: string;
    }

    const photos: RoadmapMedia[] = (docs || []).filter((f: RoadmapMedia) => f.fileType?.startsWith('image/'));
    const videos: RoadmapMedia[] = (docs || []).filter((f: RoadmapMedia) => f.fileType?.startsWith('video/'));

    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const currentMedia: RoadmapMedia[] = activeTab === 'photos' ? photos : videos;

    const taskTitle = useMemo(() => {
        // If no roadmap or taskId/nestedId, return default
        if (!roadmap || (!taskId && !nestedId)) return 'Shared Media';

        try {
            // Get all tasks from the roadmap
            const tasks = getTasks(roadmap);
            
            // Find the task by taskId or nestedId
            const taskIdToFind = taskId || nestedId;
            const task = tasks.find(t => t._id === taskIdToFind);
            
            return task?.name || 'Shared Media';
        } catch {
            return 'Shared Media';
        }
    }, [roadmap, taskId, nestedId]);

    // ---------------- OUTCOME MENU + DATA (restored) ----------------
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

    // ---------------- SELECTION HANDLERS ----------------

    const toggleSelectionMode = useCallback(() => {
        setSelectionMode(prev => {
            if (prev) {
                // turning OFF → clear selection
                setSelectedItems(new Set());
            }
            return !prev;
        });
    }, []);

    const toggleItemSelection = useCallback((id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    }, []);

    const selectAll = useCallback(() => {
        setSelectedItems(new Set(currentMedia.map(item => item._id)));
    }, [currentMedia]);

    const deleteSelected = useCallback(() => {
        if (!roadMapId || !nestedId || !user?.id) return;

        Alert.alert(
            'Delete Items',
            'Are you sure you want to delete the selected items?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        currentMedia.forEach(m => {
                            if (selectedItems.has(m._id)) {
                                deleteDocument.mutate({
                                    roadMapId,
                                    nestedId,
                                    userId: user.id,
                                    fileUrl: m.fileUrl,
                                    uploadBatchId: m.uploadBatchId as string,
                                });
                            }
                        });
                        setSelectionMode(false);
                        setSelectedItems(new Set());
                    },
                },
            ]
        );
    }, [selectedItems, currentMedia, deleteDocument, roadMapId, nestedId, user?.id, extraName]);

    // ---------------- RENDER MEDIA ITEM ----------------

    const renderMediaItem = useCallback(
        ({ item, index }: { item: RoadmapMedia; index: number }) => {
            const isSelected = selectedItems.has(item._id);
            const isRightColumn = index % 2 === 1;

            return (
                <TouchableOpacity
                    onPress={() => selectionMode && toggleItemSelection(item._id)}
                    onLongPress={() => {
                        if (!selectionMode) {
                            setSelectionMode(true);
                            toggleItemSelection(item._id);
                        }
                    }}
                    style={{ width: imageWidth, marginLeft: isRightColumn ? GAP : 0 }}
                >
                    <View style={styles.mediaItemWrapper}>
                        {/* IMAGE thumbnail */}
                        {item.fileType.startsWith('image/') && (
                            <Image
                                source={{ uri: item.fileUrl }}
                                style={[styles.thumbnail, { width: imageWidth }]}
                            />
                        )}

                        {/* VIDEO thumbnail (gray box + play icon only, no actual player) */}
                        {item.fileType.startsWith('video/') && (
                            <View style={[styles.thumbnail, { width: imageWidth }]}>
                                <View style={styles.playIconWrapper}>
                                    <View style={styles.playIconCircle}>
                                        <Ionicons name="play" size={32} color="#1D548D" />
                                    </View>
                                </View>
                            </View>
                        )}

                        {selectionMode && (
                            <View style={styles.checkboxWrapper}>
                                <View
                                    style={[
                                        styles.checkbox,
                                        isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
                                    ]}
                                >
                                    {isSelected && (
                                        <Ionicons name="checkmark" size={18} color="#1D548D" />
                                    )}
                                </View>
                            </View>
                        )}
                    </View>

                    <Text style={styles.mediaDate}>
                        {item.uploadedAt
                            ? new Date(item.uploadedAt).toLocaleDateString()
                            : ''}
                    </Text>
                </TouchableOpacity>
            );
        },
        [selectionMode, selectedItems, toggleItemSelection]
    );

    return (
        <AppGradientBackground style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Top Bar */}
                <View style={styles.topBarWrapper}>
                    <TopBar role="pastor" showUserName />
                </View>

                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>{taskTitle}</Text>
                            <Text style={styles.headerSubtitle}>Shared Media</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => setShowOutcomeMenu(true)}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.section}>
                    <View style={styles.sharedMediaBox}>
                        <Text style={styles.sharedMediaTitle}>{extraName}</Text>
                    </View>

                    <View style={styles.tabRow}>
                        {(['photos', 'videos'] as const).map(tab => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => {
                                    setActiveTab(tab);
                                    setSelectionMode(false);
                                    setSelectedItems(new Set());
                                }}
                                style={[
                                    styles.tabButton,
                                    activeTab === tab
                                        ? styles.tabButtonActive
                                        : styles.tabButtonInactive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabButtonText,
                                        activeTab === tab
                                            ? styles.tabTextActive
                                            : styles.tabTextInactive,
                                    ]}
                                >
                                    {tab === 'photos' ? 'Photos' : 'Videos'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Media Grid */}
                <View style={styles.mediaContainer}>
                    <View style={styles.mediaBorderBox}>
                        {/* Selection Header */}
                        {selectionMode && (
                            <>
                                <View style={styles.selectionHeader}>
                                    <View style={styles.selectionHeaderLeft}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectionMode(false);
                                                setSelectedItems(new Set());
                                            }}
                                            style={styles.closeIcon}
                                        >
                                            <Ionicons name="close" size={24} color="#fff" />
                                        </TouchableOpacity>

                                        <Text style={styles.selectionText}>
                                            {selectedItems.size > 0
                                                ? `${selectedItems.size} `
                                                : ''}
                                            Selected Items
                                        </Text>
                                    </View>

                                    <View style={styles.selectionHeaderRight}>
                                        <TouchableOpacity
                                            onPress={deleteSelected}>
                                            <Ionicons
                                                name="trash-outline"
                                                size={24}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* <TouchableOpacity
                                     onPress={selectAll}
                                    style={styles.selectAllButton}
                                >
                                    <Text style={styles.selectAllText}>Select all</Text>
                                </TouchableOpacity> */}
                            </>
                        )}

                        {/* Empty state */}
                        {currentMedia.length === 0 && (
                            <Text
                                style={{
                                    color: '#fff',
                                    textAlign: 'center',
                                    marginTop: 20,
                                }}
                            >
                                No {activeTab} uploaded yet.
                            </Text>
                        )}

                        {/* Media Grid */}
                        {currentMedia.length > 0 &&
                            currentMedia
                                .reduce<RoadmapMedia[][]>((rows, item, index) => {
                                    if (index % 2 === 0) rows.push([item]);
                                    else rows[rows.length - 1].push(item);
                                    return rows;
                                }, [])
                                .map((row, rowIndex) => (
                                    <View key={rowIndex} style={styles.mediaRow}>
                                        {row.map((item, colIndex) => {
                                            const index = rowIndex * 2 + colIndex;
                                            return (
                                                <View key={item._id}>
                                                    {renderMediaItem({ item, index })}
                                                </View>
                                            );
                                        })}
                                        {row.length === 1 && (
                                            <View style={{ width: imageWidth }} />
                                        )}
                                    </View>
                                ))}
                    </View>

                    {!selectionMode && currentMedia.length > 0 && (
                        <View style={styles.selectionToggleWrapper}>
                            <TouchableOpacity
                                onPress={toggleSelectionMode}
                                style={styles.selectionToggleButton}
                            >
                                <Ionicons name="checkmark" size={20} color="#1D548D" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Context Menu – full outcome menu restored */}
            <ContextMenu
                visible={showOutcomeMenu}
                items={outcomeMenuItems()}
                onClose={() => setShowOutcomeMenu(false)}
                position={{ top: 60, right: 16 }}
                minWidth={280}
                showIcons={false}
            />

            {/* Outcome Modal – full behaviour restored */}
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
    container: { flex: 1 },
    scrollContent: { paddingBottom: 20 },
    topBarWrapper: { paddingHorizontal: PADDING, paddingBottom: 10 },
    headerContainer: {
        paddingHorizontal: PADDING,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    headerTextContainer: { flex: 1, marginLeft: 8 },
    headerTitle: { color: '#fff', fontWeight: '700', fontSize: 20 },
    headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 },
    section: { paddingHorizontal: PADDING, paddingTop: 16 },
    sharedMediaBox: {
        padding: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    sharedMediaTitle: { color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: '600' },
    tabRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    tabButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    tabButtonActive: { backgroundColor: '#fff' },
    tabButtonInactive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    tabButtonText: { fontWeight: '600', fontSize: 16 },
    tabTextActive: { color: '#1D548D' },
    tabTextInactive: { color: '#fff' },
    mediaContainer: { paddingHorizontal: PADDING, position: 'relative' },
    mediaBorderBox: {
        padding: CONTAINER_PADDING,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    selectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    selectionHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    closeIcon: { marginRight: 8 },
    selectionText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    selectionHeaderRight: { flexDirection: 'row', gap: 16 },
    selectAllButton: {
        backgroundColor: '#2666A0',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 16,
    },
    selectAllText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    mediaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    mediaItemWrapper: { position: 'relative' },
    thumbnail: {
        aspectRatio: 1,
        borderRadius: 10,
        backgroundColor: '#999',
        overflow: 'hidden',
        marginBottom: 8,
    },
    playIconWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIconCircle: {
        padding: 12,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    checkboxWrapper: { position: 'absolute', top: 6, right: 6, zIndex: 10 },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxUnselected: { backgroundColor: 'transparent', borderColor: '#fff' },
    checkboxSelected: { backgroundColor: '#fff', borderColor: '#fff' },
    mediaDate: { color: '#fff', fontSize: 13 },
    selectionToggleWrapper: { position: 'absolute', top: 8, right: 28, zIndex: 1000 },
    selectionToggleButton: {
        width: 28,
        height: 28,
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#1D548D',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

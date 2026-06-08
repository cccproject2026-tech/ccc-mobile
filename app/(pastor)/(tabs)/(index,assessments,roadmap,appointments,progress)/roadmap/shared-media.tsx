import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import TopBar from '@/components/director/TopBar';

import {
    useDeleteRoadmapDocument,
    useRoadmap,
    useRoadmapDocuments
} from '@/hooks/roadmaps/useRoadmaps';
import {
    formatRoadmapUploadFieldLabel,
    getTasks,
    resolveRoadmapDocumentUrl,
} from '@/lib/roadmap/helpers';
import { useAuthStore } from '@/stores';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
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

function isImageMedia(file: RoadmapMedia): boolean {
    const type = String(file.fileType ?? '').toLowerCase();
    const name = String(file.fileName ?? '').toLowerCase();
    return (
        type.startsWith('image/') ||
        type === 'image' ||
        /\.(jpe?g|png|gif|webp|heic|bmp)$/i.test(name)
    );
}

function isVideoMedia(file: RoadmapMedia): boolean {
    const type = String(file.fileType ?? '').toLowerCase();
    const name = String(file.fileName ?? '').toLowerCase();
    return (
        type.startsWith('video/') ||
        type === 'video' ||
        /\.(mp4|mov|m4v|webm|avi)$/i.test(name)
    );
}

function resolveUploadBatchId(file: RoadmapMedia): string | null {
    const id = file.uploadBatchId;
    if (id != null && String(id).trim() !== '') return String(id);
    return null;
}

function MediaThumbnail({ uri, width }: { uri: string; width: number }) {
    const [failed, setFailed] = useState(false);
    const resolved = resolveRoadmapDocumentUrl(uri);

    if (!resolved || failed) {
        return (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder, { width }]}>
                <Ionicons name="image-outline" size={26} color="rgba(255,255,255,0.45)" />
            </View>
        );
    }

    return (
        <Image
            source={{ uri: resolved }}
            style={[styles.thumbnail, { width }]}
            contentFit="cover"
            transition={150}
            onError={() => setFailed(true)}
        />
    );
}

export default function ShareMedia() {
    const { user } = useAuthStore();

    const { taskId, extraName, roadMapId, nestedId } =
        useLocalSearchParams<{
            taskId?: string;
            extraName?: string;
            roadMapId?: string;
            nestedId?: string;
        }>();

    const resolvedNestedId = String(nestedId || taskId || '').trim();

    const deleteDocument = useDeleteRoadmapDocument();

    
    const { data: roadmap, isLoading: isLoadingRoadmap } = useRoadmap(roadMapId || undefined);

    
    const { data: docs = [] } = useRoadmapDocuments(
        roadMapId,
        resolvedNestedId || undefined,
        user?.id,
        extraName
    ) as { data: RoadmapMedia[] | undefined } as any;

    const allDocs: RoadmapMedia[] = docs || [];
    const photos: RoadmapMedia[] = allDocs.filter(isImageMedia);
    const videos: RoadmapMedia[] = allDocs.filter(isVideoMedia);
    const otherFiles: RoadmapMedia[] = allDocs.filter(
        (f) => !isImageMedia(f) && !isVideoMedia(f),
    );

    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'files'>('photos');
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    const currentMedia: RoadmapMedia[] =
        activeTab === 'photos' ? photos : activeTab === 'videos' ? videos : otherFiles;

    const availableTabs = useMemo(() => {
        const tabs: Array<'photos' | 'videos' | 'files'> = [];
        if (photos.length > 0) tabs.push('photos');
        if (videos.length > 0) tabs.push('videos');
        if (otherFiles.length > 0) tabs.push('files');
        return tabs;
    }, [photos.length, videos.length, otherFiles.length]);

    React.useEffect(() => {
        if (availableTabs.length === 0) return;
        if (!availableTabs.includes(activeTab)) {
            setActiveTab(availableTabs[0]);
        }
    }, [activeTab, availableTabs]);

    const taskTitle = useMemo(() => {
        
        if (!roadmap || (!taskId && !nestedId)) return 'Shared Media';

        try {
            
            const tasks = getTasks(roadmap);
            
            
            const taskIdToFind = resolvedNestedId || taskId || nestedId;
            const task = tasks.find(t => String(t._id) === String(taskIdToFind));
            
            return task?.name || 'Shared Media';
        } catch {
            return 'Shared Media';
        }
    }, [roadmap, taskId, nestedId, resolvedNestedId]);

    const deleteFiles = useCallback(
        async (files: RoadmapMedia[]) => {
            if (!roadMapId || !resolvedNestedId || !user?.id) {
                Alert.alert(
                    'Cannot delete',
                    'Missing roadmap information. Go back and open shared media from the task again.',
                );
                return;
            }

            const missingBatch = files.filter((f) => !resolveUploadBatchId(f));
            if (missingBatch.length > 0) {
                Alert.alert(
                    'Cannot delete',
                    'This file is missing upload metadata. Try refreshing the task, or contact support if it persists.',
                );
                return;
            }

            setIsDeleting(true);
            try {
                await Promise.all(
                    files.map((file) =>
                        deleteDocument.mutateAsync({
                            roadMapId: String(roadMapId),
                            userId: user.id,
                            nestedId: resolvedNestedId,
                            fileUrl: file.fileUrl,
                            uploadBatchId: resolveUploadBatchId(file)!,
                        }),
                    ),
                );
                setSelectionMode(false);
                setSelectedItems(new Set());
            } catch (err: any) {
                Alert.alert(
                    'Delete failed',
                    err?.message || 'Could not remove the selected file(s). Please try again.',
                );
            } finally {
                setIsDeleting(false);
            }
        },
        [roadMapId, resolvedNestedId, user?.id, deleteDocument],
    );

    const confirmDeleteSingle = useCallback(
        (file: RoadmapMedia) => {
            Alert.alert(
                'Delete file',
                `Remove "${file.fileName || 'this file'}"?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteFiles([file]),
                    },
                ],
            );
        },
        [deleteFiles],
    );

    
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

    

    const toggleSelectionMode = useCallback(() => {
        setSelectionMode(prev => {
            if (prev) {
                
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
        const toDelete = currentMedia.filter((m) => selectedItems.has(m._id));
        if (toDelete.length === 0) {
            Alert.alert('Nothing selected', 'Tap items to select them, then delete.');
            return;
        }

        Alert.alert(
            'Delete items',
            `Remove ${toDelete.length} selected item${toDelete.length === 1 ? '' : 's'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteFiles(toDelete),
                },
            ],
        );
    }, [selectedItems, currentMedia, deleteFiles]);

    

    const renderMediaItem = useCallback(
        ({ item, index }: { item: RoadmapMedia; index: number }) => {
            const isSelected = selectedItems.has(item._id);
            const isRightColumn = index % 2 === 1;
            const showAsImage = isImageMedia(item);
            const showAsVideo = !showAsImage && isVideoMedia(item);

            return (
                <TouchableOpacity
                    onPress={() => {
                        if (selectionMode) toggleItemSelection(item._id);
                    }}
                    onLongPress={() => {
                        if (!selectionMode) {
                            setSelectionMode(true);
                            toggleItemSelection(item._id);
                        }
                    }}
                    style={{ width: imageWidth, marginLeft: isRightColumn ? GAP : 0 }}
                >
                    <View style={styles.mediaItemWrapper}>
                        {showAsImage ? (
                            <MediaThumbnail uri={item.fileUrl} width={imageWidth} />
                        ) : null}

                        {showAsVideo && (
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

                        {!selectionMode && !isDeleting ? (
                            <TouchableOpacity
                                onPress={() => confirmDeleteSingle(item)}
                                style={styles.itemDeleteButton}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                accessibilityLabel="Delete file"
                            >
                                <Ionicons name="trash-outline" size={18} color="#fff" />
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <Text style={styles.mediaDate}>
                        {item.uploadedAt
                            ? new Date(item.uploadedAt).toLocaleDateString()
                            : ''}
                    </Text>
                </TouchableOpacity>
            );
        },
        [selectionMode, selectedItems, toggleItemSelection, confirmDeleteSingle, isDeleting],
    );

    const renderFileRow = useCallback(
        (item: RoadmapMedia) => {
            const isSelected = selectedItems.has(item._id);
            return (
                <View key={item._id} style={styles.fileRow}>
                    <TouchableOpacity
                        style={styles.fileRowMain}
                        onPress={() => {
                            if (selectionMode) {
                                toggleItemSelection(item._id);
                                return;
                            }
                        }}
                        onLongPress={() => {
                            if (!selectionMode) {
                                setSelectionMode(true);
                                toggleItemSelection(item._id);
                            }
                        }}
                    >
                        {selectionMode ? (
                            <View
                                style={[
                                    styles.checkbox,
                                    isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
                                    styles.fileRowCheckbox,
                                ]}
                            >
                                {isSelected ? (
                                    <Ionicons name="checkmark" size={16} color="#1D548D" />
                                ) : null}
                            </View>
                        ) : null}
                        <Ionicons name="document-outline" size={22} color="#fff" />
                        <View style={styles.fileRowText}>
                            <Text style={styles.fileRowName} numberOfLines={2}>
                                {item.fileName || 'Uploaded file'}
                            </Text>
                            {item.uploadedAt ? (
                                <Text style={styles.fileRowDate}>
                                    {new Date(item.uploadedAt).toLocaleDateString()}
                                </Text>
                            ) : null}
                        </View>
                    </TouchableOpacity>
                    {!selectionMode && !isDeleting ? (
                        <TouchableOpacity
                            onPress={() => confirmDeleteSingle(item)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.fileRowDelete}
                        >
                            <Ionicons name="trash-outline" size={22} color="#f87171" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            );
        },
        [selectionMode, selectedItems, toggleItemSelection, confirmDeleteSingle, isDeleting],
    );

    return (
        <AppGradientBackground style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {}
                <View style={styles.topBarWrapper}>
                    <TopBar role="pastor" showUserName />
                </View>

                {}
                <View style={styles.headerContainer}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                        </TouchableOpacity>

                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle} numberOfLines={2} maxFontSizeMultiplier={1.15}>
                                {taskTitle}
                            </Text>
                            <Text style={styles.headerSubtitle} maxFontSizeMultiplier={1.15}>
                                Shared Media
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => setShowOutcomeMenu(true)}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {}
                <View style={styles.section}>
                    <View style={styles.fieldLabelRow}>
                        <Text style={styles.fieldLabelCaption} maxFontSizeMultiplier={1.1}>
                            Media field
                        </Text>
                        <Text style={styles.fieldLabelValue} numberOfLines={2} maxFontSizeMultiplier={1.1}>
                            {formatRoadmapUploadFieldLabel(extraName)}
                        </Text>
                    </View>

                    {availableTabs.length > 1 ? (
                        <View style={styles.tabRow}>
                            {availableTabs.map((tab) => (
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
                                        {tab === 'photos'
                                            ? 'Photos'
                                            : tab === 'videos'
                                              ? 'Videos'
                                              : 'Files'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : null}
                </View>

                {}
                <View style={styles.mediaContainer}>
                    <View style={styles.mediaBorderBox}>
                        {}
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
                                            onPress={deleteSelected}
                                            disabled={isDeleting || selectedItems.size === 0}
                                        >
                                            <Ionicons
                                                name="trash-outline"
                                                size={24}
                                                color={
                                                    isDeleting || selectedItems.size === 0
                                                        ? 'rgba(255,255,255,0.35)'
                                                        : '#fff'
                                                }
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

                        {}
                        {allDocs.length === 0 && (
                            <Text
                                style={{
                                    color: '#fff',
                                    textAlign: 'center',
                                    marginTop: 20,
                                }}
                            >
                                No media uploaded yet.
                            </Text>
                        )}

                        {allDocs.length > 0 && currentMedia.length === 0 && (
                            <Text
                                style={{
                                    color: '#fff',
                                    textAlign: 'center',
                                    marginTop: 20,
                                }}
                            >
                                No items in this tab.
                            </Text>
                        )}

                        {activeTab === 'files' && currentMedia.length > 0 ? (
                            <View style={styles.filesList}>
                                {currentMedia.map((item) => renderFileRow(item))}
                            </View>
                        ) : null}

                        {}
                        {activeTab !== 'files' && currentMedia.length > 0 &&
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

                    {!selectionMode && allDocs.length > 0 && (
                        <View style={styles.selectionToggleWrapper}>
                            <TouchableOpacity
                                onPress={toggleSelectionMode}
                                style={styles.selectionToggleButton}
                            >
                                <Ionicons name="checkbox-outline" size={18} color="#1D548D" />
                                <Text style={styles.selectionToggleText}>Select</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {}
            <ContextMenu
                visible={showOutcomeMenu}
                items={outcomeMenuItems()}
                onClose={() => setShowOutcomeMenu(false)}
                position={{ top: 60, right: 16 }}
                minWidth={280}
                showIcons={false}
            />

            {}
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
    headerTitle: { color: '#fff', fontWeight: '700', fontSize: 17, lineHeight: 22 },
    headerSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
    section: { paddingHorizontal: PADDING, paddingTop: 12 },
    fieldLabelRow: {
        marginBottom: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.14)',
    },
    fieldLabelCaption: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    fieldLabelValue: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
    },
    tabRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    tabButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    tabButtonActive: { backgroundColor: '#fff' },
    tabButtonInactive: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    tabButtonText: { fontWeight: '600', fontSize: 14 },
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
    selectionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
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
        backgroundColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
        marginBottom: 8,
    },
    thumbnailPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
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
    selectionToggleWrapper: { position: 'absolute', top: 8, right: 20, zIndex: 1000 },
    selectionToggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1D548D',
    },
    selectionToggleText: {
        color: '#1D548D',
        fontSize: 12,
        fontWeight: '700',
    },
    itemDeleteButton: {
        position: 'absolute',
        bottom: 14,
        left: 6,
        zIndex: 11,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.92)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filesList: { gap: 10 },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    fileRowMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
    },
    fileRowCheckbox: { marginRight: 2 },
    fileRowText: { flex: 1, minWidth: 0, gap: 2 },
    fileRowName: { color: '#fff', fontSize: 14, fontWeight: '600' },
    fileRowDate: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    fileRowDelete: { paddingLeft: 8 },
});

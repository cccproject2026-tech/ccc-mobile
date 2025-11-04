import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import TopBar from '@/components/director/TopBar';
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { getTask } from '@/lib/roadmap/selectors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const PADDING = 16;
const CONTAINER_PADDING = 16; // Padding inside the bordered container
const GAP = 12;
// Calculate image width: screen width - outer padding - container padding - gap - extra margin
const imageWidth = (width - (PADDING * 2) - (CONTAINER_PADDING * 2) - GAP) / 2;

export default function ShareMedia() {
    const { progress, resetAll } = useRoadmapProgress();
    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const { mediaId, taskId } = useLocalSearchParams<{ mediaId?: string, taskId?: string }>();

    // Get task title
    const taskTitle = useMemo(() => {
        if (!taskId) return 'Complete a Community Engagement Project';
        try {
            const task = getTask(mockRevitalization, taskId);
            return task?.title || 'Complete a Community Engagement Project';
        } catch {
            return 'Complete a Community Engagement Project';
        }
    }, [taskId]);



    // Mock media data
    const mockPhotos = [
        { id: '1', uri: 'book-nature', date: '20 Oct 2024' },
        { id: '2', uri: 'hands-praying', date: '20 Oct 2024' },
        { id: '3', uri: 'hands-praying-2', date: '20 Oct 2024' },
        { id: '4', uri: 'book-nature-2', date: '20 Oct 2024' },
        { id: '5', uri: 'book-nature-3', date: '20 Oct 2024' },
        { id: '6', uri: 'hands-praying-3', date: '20 Oct 2024' },
    ];

    const mockVideos = [
        { id: '1', uri: 'video-thumbnail', date: '20 Oct 2024' },
        { id: '2', uri: 'video-thumbnail-2', date: '20 Oct 2024' },
    ];

    const currentMedia = activeTab === 'photos' ? mockPhotos : mockVideos;

    // Toggle selection mode
    const toggleSelectionMode = useCallback(() => {
        setSelectionMode(!selectionMode);
        if (selectionMode) {
            setSelectedItems(new Set());
        }
    }, [selectionMode]);

    // Toggle item selection
    const toggleItemSelection = useCallback((id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    // Select all items
    const selectAll = useCallback(() => {
        setSelectedItems(new Set(currentMedia.map(item => item.id)));
    }, [currentMedia]);

    // Delete selected items
    const deleteSelected = useCallback(() => {
        console.log('Delete selected items:', Array.from(selectedItems));
        setSelectedItems(new Set());
        setSelectionMode(false);
    }, [selectedItems]);

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

    const renderMediaItem = useCallback(({ item, index }: { item: typeof mockPhotos[0], index: number }) => {
        const isSelected = selectedItems.has(item.id);
        const isRightColumn = index % 2 === 1;

        return (
            <TouchableOpacity
                onPress={() => {
                    if (selectionMode) {
                        toggleItemSelection(item.id);
                    }
                }}
                onLongPress={() => {
                    if (!selectionMode) {
                        setSelectionMode(true);
                        toggleItemSelection(item.id);
                    }
                }}
                style={{
                    width: imageWidth,
                    marginLeft: isRightColumn ? GAP : 0,
                }}
            >
                <View className="relative">
                    {/* Image/Video Thumbnail */}
                    <View
                        className="mb-2 overflow-hidden bg-gray-400 rounded-lg"
                        style={{ aspectRatio: 1, width: imageWidth }}
                    >
                        <View className="items-center justify-center flex-1">
                            {activeTab === 'videos' && (
                                <View className="absolute inset-0 z-10 items-center justify-center">
                                    <View className="p-3 rounded-full bg-white/90">
                                        <Ionicons name="play" size={32} color="#1D548D" />
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Checkbox overlay */}
                    {selectionMode && (
                        <View className="absolute z-20 top-2 right-2">
                            <View
                                className={`w-6 h-6 rounded border-2 items-center justify-center ${isSelected
                                    ? 'bg-white border-white'
                                    : 'bg-transparent border-white'
                                    }`}
                            >
                                {isSelected && (
                                    <Ionicons name="checkmark" size={18} color="#1D548D" />
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Date */}
                <Text className="text-sm text-white">
                    {item.date}
                </Text>
            </TouchableOpacity>
        );
    }, [activeTab, selectionMode, selectedItems, toggleItemSelection, imageWidth]);

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* TopBar */}
                <View style={{ paddingHorizontal: PADDING, paddingBottom: 10 }}>
                    <TopBar role="pastor" userName="John Ross" showUserName />
                </View>

                {/* Header */}
                <View style={{ paddingHorizontal: PADDING }}>
                    <View className="flex-row items-center justify-between pb-4 border-b border-white/20">
                        <View className="flex-row items-center flex-1">
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="chevron-back" size={28} color="#fff" />
                            </TouchableOpacity>
                            <View className="flex-1 ml-2">
                                <Text className="text-xl font-bold text-white">
                                    {taskTitle}
                                </Text>
                                <Text className="text-sm text-white/70 mt-0.5">
                                    Phase 2
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setShowOutcomeMenu(true)}>
                            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Shared Media Header */}
                <View style={{ paddingHorizontal: PADDING, paddingTop: 16 }}>
                    <View className="p-4 mb-4 border bg-white/10 rounded-2xl border-white/20">
                        <Text className="text-lg font-semibold text-center text-white">
                            Shared Media
                        </Text>
                    </View>

                    {/* Tab Buttons */}
                    <View className="flex-row gap-3 mb-4">
                        <TouchableOpacity
                            onPress={() => {
                                setActiveTab('photos');
                                setSelectionMode(false);
                                setSelectedItems(new Set());
                            }}
                            className={`flex-1 py-3 rounded-xl ${activeTab === 'photos' ? 'bg-white' : 'bg-white/20 border border-white/30'
                                }`}
                        >
                            <Text
                                className={`text-center font-semibold ${activeTab === 'photos' ? 'text-[#1D548D]' : 'text-white'
                                    }`}
                            >
                                Photos
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setActiveTab('videos');
                                setSelectionMode(false);
                                setSelectedItems(new Set());
                            }}
                            className={`flex-1 py-3 rounded-xl ${activeTab === 'videos' ? 'bg-white' : 'bg-white/20 border border-white/30'
                                }`}
                        >
                            <Text
                                className={`text-center font-semibold ${activeTab === 'videos' ? 'text-[#1D548D]' : 'text-white'
                                    }`}
                            >
                                Videos
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Media Grid Container with border */}
                <View style={{ paddingHorizontal: PADDING, position: 'relative' }}>
                    <View className="p-4 border bg-white/10 rounded-2xl border-white/20">
                        {/* Selection Mode Header - Inside border */}
                        {selectionMode && (
                            <View className="mb-4">
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectionMode(false);
                                                setSelectedItems(new Set());
                                            }}
                                            className="mr-3"
                                        >
                                            <Ionicons name="close" size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <Text className="text-lg font-semibold text-white">
                                            {selectedItems.size > 0 ? `${selectedItems.size} ` : ''}Selected Items
                                        </Text>
                                    </View>
                                    <View className="flex-row gap-4">
                                        <TouchableOpacity onPress={deleteSelected}>
                                            <Ionicons name="trash-outline" size={24} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setShowOutcomeMenu(true)}>
                                            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Select All Button */}
                                <TouchableOpacity
                                    onPress={selectAll}
                                    className="bg-[#2666A0] py-3 rounded-lg items-center"
                                >
                                    <Text className="text-base font-semibold text-white">
                                        Select all
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Media Grid */}
                        <View>
                            {currentMedia.reduce((rows: any[][], item, index) => {
                                if (index % 2 === 0) {
                                    rows.push([item]);
                                } else {
                                    rows[rows.length - 1].push(item);
                                }
                                return rows;
                            }, []).map((row, rowIndex) => (
                                <View
                                    key={rowIndex}
                                    className="flex-row justify-between"
                                    style={{ marginBottom: 16 }}
                                >
                                    {row.map((item, colIndex) => {
                                        const index = rowIndex * 2 + colIndex;
                                        return (
                                            <View key={item.id}>
                                                {renderMediaItem({ item, index })}
                                            </View>
                                        );
                                    })}
                                    {/* Add spacer if only one item in row */}
                                    {row.length === 1 && (
                                        <View style={{ width: imageWidth }} />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Checkbox to toggle selection mode - positioned at top right of border */}
                    {!selectionMode && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 8,
                                right: 28,
                                zIndex: 1000,
                            }}
                        >
                            <TouchableOpacity
                                onPress={toggleSelectionMode}
                                className="w-7 h-7 bg-white rounded border-2 border-[#1D548D] items-center justify-center shadow-lg"
                            >
                                <Ionicons name="checkmark" size={20} color="#1D548D" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
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
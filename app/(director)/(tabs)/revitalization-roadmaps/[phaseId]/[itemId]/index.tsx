
import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import TopBar from '@/components/director/TopBar';
import { DynamicFormTask } from '@/components/roadmaps/DynamicFormTask';
import { useRoadmap } from '@/hooks/roadmaps/useRoadmaps';
import { NestedRoadmap } from '@/lib/roadmap/types';
import { getFontSize, getSpacing, isAndroid } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ItemDetail() {
    const { phaseId, itemId } = useLocalSearchParams<{ phaseId: string; itemId: string; returnTo?: string }>();
    const router = useRouter();

    // Fetch parent roadmap
    const { data: roadmap, isLoading, error } = useRoadmap(phaseId);

    // Find the specific nested roadmap (task)
    const task = useMemo<NestedRoadmap | undefined>(() => {
        return roadmap?.roadmaps?.find(r => r._id === itemId);
    }, [roadmap, itemId]);

    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'queries'>('overview');

    const outcomeMenuItems = useCallback((): MenuItem[] => [
        {
            id: 'edit-task',
            label: 'Edit Task',
            onPress: () => {
                setShowOutcomeMenu(false);
                router.push({
                    pathname: '/(director)/(tabs)/revitalization-roadmaps/(creation)/create-roadmap',
                    params: {
                        isEditMode: 'true',
                        isNestedEdit: 'true',
                        parentRoadmapId: phaseId,
                        nestedRoadmapId: itemId,
                        phase: roadmap?.phase || '',
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
    ], [phaseId, itemId, roadmap, router]);

    const outcomeData = useCallback(() => [
        { id: '1', text: 'The church is committed to the revitalization process.' },
        { id: '2', text: 'The Church is praying consistently and intentionally for revitalization.' },
        { id: '3', text: 'The church understands its current health and is committed to making improvements.' },
        { id: '4', text: 'The church is beginning to feel like a warm and welcoming place for new attendees.' },
        { id: '5', text: 'Church members have begun to build new relationships.' },
        { id: '6', text: 'Church members will begin to feel a sense of hope for the future.' },
    ], []);

    // Parse duration to extract months range
    const parseDurationMonths = useCallback((duration: string | undefined): string => {
        if (!duration) return '1 - 2';
        // Try to extract numbers from duration string (e.g., "3 months" -> "3", "2-4 weeks" -> "2 - 4")
        const numbers = duration.match(/\d+/g);
        if (numbers && numbers.length >= 2) {
            return `${numbers[0]} - ${numbers[1]}`;
        } else if (numbers && numbers.length === 1) {
            return `${numbers[0]} - ${numbers[0]}`;
        }
        return '1 - 2';
    }, []);

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

    // Task not found state
    if (!task || !roadmap) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
                <View style={{ paddingBottom: 10 }}>
                    <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 16 }}>Task not found</Text>
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
                    marginRight: getSpacing(12), // Add space before right elements
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            router.back();
                        }}
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

                {/* Right side - Phase badge and menu */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: getSpacing(8),
                }}>
                    <TouchableOpacity
                        onPress={() => setShowOutcomeMenu(true)}
                        style={{ padding: getSpacing(4) }}
                    >
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-row items-center justify-center px-4 mb-4">
                <TouchableOpacity
                    onPress={() => setActiveTab('overview')}
                    className={`px-6 py-2.5 rounded-full mr-2 ${activeTab === 'overview' ? 'bg-white' : 'bg-transparent border border-white/40'
                        }`}
                >
                    <Text className={`text-[15px] font-medium ${activeTab === 'overview' ? 'text-[#1A4882]' : 'text-white'
                        }`}>
                        Overview
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/roadmap/comments',
                        params: { taskId: task._id, phaseId: phaseId },
                    })}
                    className={`px-5 py-2.5 rounded-full mr-2 flex-row items-center ${activeTab === 'comments' ? 'bg-white' : 'bg-transparent border border-white/40'
                        }`}
                >
                    <Text className={`text-[15px] font-medium ${activeTab === 'comments' ? 'text-[#1A4882]' : 'text-white'
                        }`}>
                        Comments
                    </Text>
                    <View className={`ml-2 w-5 h-5 rounded-full items-center justify-center ${activeTab === 'comments' ? 'bg-[#1A4882]' : 'bg-white'
                        }`}>
                        <Text className={`text-xs font-bold ${activeTab === 'comments' ? 'text-white' : 'text-[#1A4882]'
                            }`}>
                            2
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/roadmap/queries',
                        params: { taskId: task._id, phaseId: phaseId },
                    })}
                    className={`px-5 py-2.5 rounded-full flex-row items-center ${activeTab === 'queries' ? 'bg-white' : 'bg-transparent border border-white/40'
                        }`}
                >
                    <Text className={`text-[15px] font-medium ${activeTab === 'queries' ? 'text-[#1A4882]' : 'text-white'
                        }`}>
                        Queries
                    </Text>
                    <View className={`ml-2 w-5 h-5 rounded-full items-center justify-center ${activeTab === 'queries' ? 'bg-[#1A4882]' : 'bg-white'
                        }`}>
                        <Text className={`text-xs font-bold ${activeTab === 'queries' ? 'text-white' : 'text-[#1A4882]'
                            }`}>
                            3
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                {/* Cover Image */}
                <View className="relative mb-0 overflow-hidden rounded-3xl" style={{ height: 220, backgroundColor: '#1a1a1a' }}>
                    {task.imageUrl ? (
                        <Image
                            source={{ uri: task.imageUrl }}
                            style={{ width: '100%', height: '100%', position: 'absolute' }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={{ width: '100%', height: '100%', backgroundColor: '#2a2a2a' }} />
                    )}

                    {/* Title overlay */}
                    <View style={{ position: 'absolute', bottom: 24, left: 0, paddingHorizontal: 24 }}>
                        <View style={{
                            backgroundColor: 'rgba(50, 50, 80, 0.7)',
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderRadius: 8,
                            alignSelf: 'flex-start',
                        }}>
                            <Text className="text-2xl font-semibold text-white">{task.name}</Text>
                        </View>
                    </View>
                </View>

                {/* Completion Time */}
                <View className="px-6 py-4 border-b border-white/20" style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}>
                    <Text className="text-base font-normal text-right text-white">
                        Completion Time Months {parseDurationMonths(task.duration)}
                    </Text>
                </View>

                {/* Roadmap Section */}
                <Text className="px-1 mt-6 mb-3 text-xl font-semibold text-white">Roadmap</Text>
                <View className="p-5 mb-6 rounded-2xl" style={{ backgroundColor: 'rgba(64, 156, 186, 0.5)' }}>
                    <Text className="text-base leading-6 text-white">
                        {task.roadMapDetails || roadmap.roadMapDetails || roadmap.description || task.name}
                    </Text>
                </View>

                {/* Description Section */}
                <Text className="px-1 mb-3 text-xl font-semibold text-white">Description</Text>
                <View className="p-6 mb-6 rounded-2xl" style={{ backgroundColor: 'rgba(64, 156, 186, 0.5)' }}>
                    <Text className="text-base leading-6 text-white">
                        {task.description || 'No description provided'}
                    </Text>
                </View>

                <DynamicFormTask task={task} phaseId={phaseId} itemId={itemId} />
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

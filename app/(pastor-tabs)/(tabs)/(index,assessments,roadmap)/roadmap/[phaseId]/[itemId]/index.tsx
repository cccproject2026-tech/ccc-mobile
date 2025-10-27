
import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import TopBar from '@/components/director/TopBar';
import { DynamicFormTask } from '@/components/roadmaps/DynamicFormTask';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { getPhase, getTask } from '@/lib/roadmap/selectors';
import { getFontSize, getSpacing, isAndroid } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ItemDetail() {
    const { itemId } = useLocalSearchParams<{ itemId: string; returnTo?: string }>();
    const router = useRouter();

    const task = getTask(mockRevitalization, itemId!);
    const phase = getPhase(mockRevitalization, task?.phaseId || '');

    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'queries'>('overview');

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

    if (!task) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Task not found</Text>
        </View>
    );

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={{ flex: 1 }}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="pastor" userName="John Ross" showUserName />
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
                        params: { taskId: task.id, phaseId: task.phaseId },
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
                        params: { taskId: task.id, phaseId: task.phaseId },
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
                    {task.meta?.coverImage ? (
                        <Image
                            source={typeof task.meta.coverImage === 'string'
                                ? { uri: task.meta.coverImage }
                                : task.meta.coverImage
                            }
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
                            <Text className="text-2xl font-semibold text-white">{task.title}</Text>
                        </View>
                    </View>
                </View>

                {/* Completion Time */}
                <View className="px-6 py-4 border-b border-white/20" style={{ borderBottomLeftRadius: 50, borderBottomRightRadius: 50 }}>
                    <Text className="text-base font-normal text-right text-white">
                        Completion Time Months {task.meta?.completionTimeMonths || '1 - 2'}
                    </Text>
                </View>

                {/* Roadmap Section */}
                <Text className="px-1 mt-6 mb-3 text-xl font-semibold text-white">Roadmap</Text>
                <View className="p-5 mb-6 rounded-2xl" style={{ backgroundColor: 'rgba(64, 156, 186, 0.5)' }}>
                    <Text className="text-base leading-6 text-white">
                        {task.meta?.roadmapText || phase?.subtitle || task.title}
                    </Text>
                </View>

                {/* Description Section */}
                <Text className="px-1 mb-3 text-xl font-semibold text-white">Description</Text>
                <View className="p-6 mb-6 rounded-2xl" style={{ backgroundColor: 'rgba(64, 156, 186, 0.5)' }}>
                    <Text className="text-base leading-6 text-white">
                        {task.description || 'No description provided'}
                    </Text>
                </View>

                <DynamicFormTask item={task} />
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

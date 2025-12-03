// // app/(pastor-tabs)/(tabs)/new-roadmap/[phaseId]/[itemId].tsx
// import { ChildRoadmapItem } from '@/components/roadmaps/ChildRoadMapItem';
// import { FormTask } from '@/components/roadmaps/tasks/FormTask';
// import { SignatureTask } from '@/components/roadmaps/tasks/SignatureTask';
// import { UploadTask } from '@/components/roadmaps/tasks/UploadTask';
// import { mockRevitalization } from '@/lib/roadmap/mock';
// import { Task } from '@/lib/roadmap/types';
// import { useLocalSearchParams } from 'expo-router';
// import { Text } from 'react-native';

// export default function ItemDetail() {
//     const { itemId } = useLocalSearchParams<{ itemId: string }>();
//     const item = mockRevitalization.items[itemId!];

//     if (!item) return <Text>Not found</Text>;

//     // Route to correct component based on taskType
//     if (item.kind === 'TASK') {
//         const task = item as Task;
//         switch (task.taskType) {
//             case 'UPLOAD': return <UploadTask item={task} />;
//             case 'FORM': return <FormTask item={task} />;
//             case 'SIGN': return <SignatureTask item={task} />;
//             // case 'CHECKLIST': return <ChecklistTask item={task} />;
//             // case 'LINK': return <LinkTask item={task} />;
//             // case 'MEETING': return <MeetingTask item={task} />;
//             default: return <Text>Unsupported task</Text>;
//         }
//     }

//     // Handle child roadmaps (Jump-start)
//     return <ChildRoadmapItem item={item} />;
// }


// app/(pastor-tabs)/(tabs)/new-roadmap/[phaseId]/[itemId].tsx
import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import TopBar from '@/components/director/TopBar';

import { FormTask } from '@/components/roadmaps/tasks/FormTask';
import { SignatureTask } from '@/components/roadmaps/tasks/SignatureTask';
import { UploadTask } from '@/components/roadmaps/tasks/UploadTask';
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { ChildRoadmap, Task } from '@/lib/roadmap/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ItemDetail() {
    const { itemId } = useLocalSearchParams<{ itemId: string }>();
    const item = mockRevitalization.items[itemId!];
    const phase = mockRevitalization.phases[item?.phaseId || ''];
    const router = useRouter();
    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'queries'>('overview');
    const { progress, toggleChecklist, updateItem } = useRoadmapProgress();

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

    if (!item) return <Text>Not found</Text>;

    const p = progress[item.id];

    // Render bottom interactive section based on task type
    const renderInteractiveContent = () => {
        // Jump-start child roadmap
        if (item.kind === 'CHILD_ROADMAP') {
            const childItem = item as ChildRoadmap;

            // Overview - show steps as checklist
            return (
                <View>
                    {childItem.steps.map(step => (
                        <Pressable
                            key={step.id}
                            onPress={() => toggleChecklist(item.id, step.id)}
                            style={styles.stepRow}
                        >
                            <View style={[styles.checkbox, (p?.checklist?.[step.id] ?? step.done) && styles.checkboxChecked]}>
                                {(p?.checklist?.[step.id] ?? step.done) && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.stepText}>{step.title}</Text>
                        </Pressable>
                    ))}
                    <TouchableOpacity
                        className="items-center py-4 mt-4 bg-white rounded-lg"
                        onPress={() => updateItem(item.id, { status: 'COMPLETED' })}
                    >
                        <Text className="text-base font-semibold text-[#1A4882]">
                            Mark as Completed
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }

        // Task types - use reusable components
        const task = item as Task;
        if (task.taskType === 'SIGN') return <SignatureTask item={task} />;
        if (task.taskType === 'UPLOAD') return <UploadTask item={task} />;
        if (task.taskType === 'FORM') return <FormTask item={task} />;

        return (
            <View className="py-8">
                <Text className="text-base text-center text-white">
                    Unsupported task type: {task.taskType}
                </Text>
            </View>
        );
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1 }}
        >
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="pastor" showUserName />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 mb-5 border-b border-white/20">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View className="ml-2">
                        <Text className="text-xl font-bold leading-6 text-white">
                            {item.phaseId === 'jump-start' ? 'Revitalization Roadmap' :
                                item.phaseId === 'phase-1' ? 'Self Revitalization Phase' :
                                    item.phaseId === 'phase-2' ? 'Church Empowerment Phase' :
                                        'Community Revitalization Phase'}
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


            <View className="flex-row items-center justify-center px-4 mb-4">
                {/* Over View Tab */}
                <TouchableOpacity
                    onPress={() => setActiveTab('overview')}
                    className={`px-6 py-2.5 rounded-full mr-2 ${activeTab === 'overview' ? 'bg-white' : 'bg-transparent border border-white/40'
                        }`}
                >
                    <Text
                        className={`text-center text-[15px] font-medium ${activeTab === 'overview' ? 'text-[#1A4882]' : 'text-white'
                            }`}
                    >
                        Over View
                    </Text>
                </TouchableOpacity>

                {/* Comments Tab */}
                <TouchableOpacity
                    onPress={() => setActiveTab('comments')}
                    className={`px-5 py-2.5 rounded-full mr-2 flex-row items-center ${activeTab === 'comments' ? 'bg-white' : 'bg-transparent border border-white/40'
                        }`}
                >
                    <Text
                        className={`text-[15px] font-medium ${activeTab === 'comments' ? 'text-[#1A4882]' : 'text-white'
                            }`}
                    >
                        Comments
                    </Text>
                    <View
                        className={`ml-2 w-5 h-5 rounded-full items-center justify-center ${activeTab === 'comments' ? 'bg-[#1A4882]' : 'bg-white'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${activeTab === 'comments' ? 'text-white' : 'text-[#1A4882]'
                                }`}
                        >
                            2
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Queries Tab */}
                <TouchableOpacity
                    onPress={() => setActiveTab('queries')}
                    className={`px-5 py-2.5 rounded-full flex-row items-center ${activeTab === 'queries' ? 'bg-white' : 'bg-transparent border border-white/40'
                        }`}
                >
                    <Text
                        className={`text-[15px] font-medium ${activeTab === 'queries' ? 'text-[#1A4882]' : 'text-white'
                            }`}
                    >
                        Queries
                    </Text>
                    <View
                        className={`ml-2 w-5 h-5 rounded-full items-center justify-center ${activeTab === 'queries' ? 'bg-[#1A4882]' : 'bg-white'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${activeTab === 'queries' ? 'text-white' : 'text-[#1A4882]'
                                }`}
                        >
                            3
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                {/* Hero Card with Cover Image */}
                <View
                    className="relative mb-0 overflow-hidden rounded-3xl"
                    style={{
                        backgroundColor: '#1a1a1a',
                        height: 220,
                    }}
                >
                    {/* Image - Replace with your actual image */}
                    {item?.meta?.coverImage ? (
                        <Image
                            source={typeof item.meta.coverImage === 'string'
                                ? { uri: item.meta.coverImage }
                                : item.meta.coverImage}
                            style={{
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#2a2a2a',
                            }}
                        />
                    )}

                    {/* Text overlay with background */}
                    <View
                        style={{
                            position: 'absolute',
                            bottom: 24, // Adjust this value to control vertical positioning
                            left: 0,
                            paddingLeft: 24, // Matches the padding for the text
                            paddingRight: 24, // You might want to adjust this based on desired width
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: 'rgba(50, 50, 80, 0.7)', // Semi-transparent dark background
                                paddingVertical: 8, // Vertical padding inside the background
                                paddingHorizontal: 12, // Horizontal padding inside the background
                                borderRadius: 8, // Rounded corners for the background
                                alignSelf: 'flex-start', // Ensures the background only takes up space needed for text
                            }}
                        >
                            <Text className="text-2xl font-semibold text-white">
                                {item?.title || 'Jump-start'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Completion Time Section with Border */}
                <View
                    className="px-6 py-4 border-b border-white/20"
                    style={{
                        borderBottomLeftRadius: 50,
                        borderBottomRightRadius: 50,
                    }}
                >
                    <Text className="text-base font-normal text-right text-white">
                        Completion Time Months {item.meta?.completionTimeMonths || '1 - 2'}
                    </Text>
                </View>

                {/* Roadmap Section */}
                <Text className="px-1 mt-6 mb-3 text-xl font-semibold text-white">
                    Roadmap
                </Text>

                <View
                    className="p-5 mb-6 rounded-2xl"
                    style={{
                        backgroundColor: 'rgba(64, 156, 186, 0.5)',
                    }}
                >
                    <Text className="text-base leading-6 text-white">
                        {phase.subtitle || item.title}
                    </Text>
                </View>

                {/* Description Section */}
                <Text className="px-1 mb-3 text-xl font-semibold text-white">
                    Description
                </Text>

                <View
                    className="p-6 mb-6 rounded-2xl"
                    style={{
                        backgroundColor: 'rgba(64, 156, 186, 0.5)',
                    }}
                >
                    {item.descriptionRich?.content && (
                        item.descriptionRich.type === 'text' ? (
                            <Text className="text-base leading-6 text-white">
                                {item.descriptionRich.content}
                            </Text>
                        ) : item.descriptionRich.type === 'unordered' ? (
                            <View className="space-y-2">
                                {(item.descriptionRich.content as string[]).map((point, index) => (
                                    <View key={index} className="flex-row items-start">
                                        <Text className="mr-2 text-base leading-6 text-white">•</Text>
                                        <Text className="flex-1 text-base leading-6 text-white">{point}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : item.descriptionRich.type === 'ordered' ? (
                            <View className="space-y-2">
                                {(item.descriptionRich.content as string[]).map((point, index) => (
                                    <View key={index} className="flex-row items-start">
                                        <Text className="mr-2 text-base leading-6 text-white">{index + 1}.</Text>
                                        <Text className="flex-1 text-base leading-6 text-white">{point}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null
                    )}
                    {item.description && (
                        <Text className="text-base leading-6 text-white">
                            {item.description}
                        </Text>
                    )}
                </View>

                {/* Interactive Task Content */}
                {renderInteractiveContent()}
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

const styles = StyleSheet.create({
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(64, 156, 186, 0.5)',
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    stepText: {
        color: 'white',
        fontSize: 15,
        flex: 1,
        lineHeight: 22,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#34d399',
        borderColor: '#34d399',
    },
    checkmark: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

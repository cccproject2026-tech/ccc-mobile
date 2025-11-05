import CommentBottomSheet from '@/components/director/CommentBottomSheet';
import PMPBottomSheet from '@/components/director/PMPBottomSheet';
import ProgressAssessmentCard from '@/components/director/ProgressAssessmentCard';
import { ChartData, ProgressBarChart } from '@/components/director/ProgressBarChart';
import { ProgressPieChart } from '@/components/director/ProgressPieChart';
import RoadmapCard from '@/components/director/ProgressRoadmapCard';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { dummyAssessment, dummyAssessmentCompleted, dummyRoadMaps, dummyRoadMapsCompleted } from '@/constants/mockData';
import { RoadmapCardData, RoadmapCardStatus } from '@/lib/roadmap/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProgressDetails() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [showCompleted, setShowCompleted] = useState(true);
    const [revitalizationActiveTab, setRevitalizationActiveTab] = useState('all');
    const [assessmentActiveTab, setAssessmentActiveTab] = useState('all');
    const [isMarkedCompleted, setIsMarkedCompleted] = useState(false);

    const [progress, setProgress] = useState<{ completedPercentage: number; remainingPercentage: number }>({
        completedPercentage: 62.5,
        remainingPercentage: 37.5,
    });

    const [comments, setComments] = useState<Array<{
        id: string;
        text: string;
        author: string;
        role: string;
        avatar?: string;
        timestamp: Date;
    }>>([]);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

    const commentSheetRef = useRef<BottomSheetModal | null>(null);

    const pmpSheetRef = useRef<BottomSheetModal>(null);

    // Helper function to convert old roadmap data to new format
    const convertToRoadmapCardData = (oldData: any): RoadmapCardData => {
        let status: RoadmapCardStatus = 'initial';

        if (oldData.status === 'Completed') {
            status = 'completed';
        } else if (oldData.status === 'In Progress') {
            status = 'in-progress';
        } else if (oldData.status === 'Due') {
            status = 'due';
        } else if (oldData.status === 'Not Started Yet') {
            status = 'initial';
        }

        const taskProgress = oldData.taskStatus?.inProgress ? {
            completed: oldData.taskStatus.inProgress,
            total: 8 // Assuming total of 8 tasks based on original logic
        } : undefined;

        return {
            image: oldData.image,
            title: oldData.title,
            description: oldData.description,
            completionTime: progress.completedPercentage === 100 ? undefined : oldData.time, // Hide if overall progress is 100%
            status: status,
            completedDate: oldData.completedTime,
            taskProgress: status !== 'completed' && status !== 'initial' ? taskProgress : undefined,
            showArrow: status !== 'completed',
        };
    };

    const openPMPSheet = useCallback(() => {
        console.log('Opening PMP Bottom Sheet');
        console.log('pmpSheetRef current:', pmpSheetRef.current);
        if (pmpSheetRef.current) {
            pmpSheetRef.current.present();
        } else {
            console.error('PMPBottomSheet ref is null');
        }
    }, []);

    const closePMPSheet = useCallback(() => {
        pmpSheetRef.current?.dismiss();
    }, []);

    const handleNext = () => {
        closePMPSheet();
        router.push('/(director)/(tabs)/progress-tracker/pmp-detail-screen');
    };

    const handleDownload = () => {
        console.log('Download pressed');
        // Download PDF logic
    };

    const openCommentSheet = useCallback((commentId?: string) => {
        if (commentId) {
            setEditingCommentId(commentId);
        } else {
            setEditingCommentId(null);
        }
        commentSheetRef.current?.present();
    }, []);

    const closeCommentSheet = useCallback(() => {
        setEditingCommentId(null);
        commentSheetRef.current?.dismiss();
    }, []);

    const handleSubmitComment = useCallback((text: string) => {
        if (editingCommentId) {
            // Edit existing comment
            setComments(prev => prev.map(comment =>
                comment.id === editingCommentId
                    ? { ...comment, text, timestamp: new Date() }
                    : comment
            ));
        } else {
            // Add new comment (max 2)
            if (comments.length < 2) {
                const newComment = {
                    id: Date.now().toString(),
                    text,
                    author: 'John Doe', // Replace with actual user
                    role: 'Mentor', // Replace with actual role
                    timestamp: new Date(),
                };
                setComments(prev => [...prev, newComment]);
            }
        }

        // If progress is 100% and not yet marked completed, mark it on first comment
        if (progress.completedPercentage === 100 && !isMarkedCompleted && comments.length === 0) {
            setIsMarkedCompleted(true);
        }

        closeCommentSheet();
    }, [editingCommentId, comments.length, progress.completedPercentage, isMarkedCompleted, closeCommentSheet]);

    const handleDeleteComment = useCallback((commentId: string) => {
        setComments(prev => prev.filter(c => c.id !== commentId));
    }, []);


    // Determine button text based on state
    const getCommentTriggerText = () => {
        return comments.length === 0 ? 'Add Final Comments' : 'View Final Comments';
    };

    // Completed progress data
    const completedData: ChartData = {
        roadmapsTotal: 5,
        roadmapsCompleted: 5,
        assessmentsTotal: 3,
        assessmentsCompleted: 3,
    };

    // In-progress data
    const inProgressData: ChartData = {
        roadmapsTotal: 5,
        roadmapsCompleted: 3,
        roadmapsRemaining: 2,
        assessmentsTotal: 3,
        assessmentsCompleted: 2,
        assessmentsRemaining: 1,
    };

    const currentData = showCompleted ? completedData : inProgressData;
    const currentTitle = showCompleted
        ? "Individual - Roadmaps, Assessments"
        : "Individual - Assignment, Survey";

    const revitalizationTabs = [
        { key: 'all', label: 'All' },
        { key: 'completed', label: 'Completed' },
        { key: 'remaining', label: 'Remaining' },
    ];

    const assessmentTabs = [
        { key: 'all', label: 'All' },
        { key: 'completed', label: 'Completed' },
        { key: 'remaining', label: 'Remaining' },
    ];

    const getSubmitButtonText = () => {
        const isProgress100 = progress.completedPercentage === 100;
        console.log({ isProgress100, comments, isMarkedCompleted });
        if (isProgress100 && comments.length === 0) {
            return 'Mark Programme as Completed';
        }

        if (isMarkedCompleted && comments.length === 0) {
            return 'Submit';
        }

        return 'Submit';
    };


    const handleSwitchProgress = (progress: 'completed' | 'inprogress') => {
        if (progress === 'completed') {
            setProgress({ completedPercentage: 100, remainingPercentage: 0 });
            setShowCompleted(true);
            // setIsMarkedCompleted(true);
        } else {
            setProgress({ completedPercentage: 62.5, remainingPercentage: 37.5 });
            setShowCompleted(false);
        }
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1, }}
        >
            <View className="flex-1">
                <TopBar userName="David Roe" notifications={3} showUserName={true} showNotifications={true} />

                <View className="flex-1 pt-6">
                    <View className="flex-row items-center justify-between px-4 pb-3 mb-4 border-b border-white/30">
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Pr. John Doe</Text>
                            <Text style={styles.headerBreadcrumb}>Progress</Text>
                        </View>
                        {showCompleted && comments.length <= 2 && (
                            <TouchableOpacity
                                onPress={() => openCommentSheet()}
                                style={styles.finalCommentButton}
                            >
                                <Text style={styles.finalCommentText}>
                                    {getCommentTriggerText()}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                showCompleted && styles.toggleButtonActive,
                                styles.toggleButtonLeft,
                            ]}
                            onPress={() => handleSwitchProgress('inprogress')}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                showCompleted && styles.toggleButtonTextActive
                            ]}>
                                Inprogress
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.toggleButton,
                                !showCompleted && styles.toggleButtonActive,
                                styles.toggleButtonRight,
                            ]}
                            onPress={() => handleSwitchProgress('completed')}
                        >
                            <Text style={[
                                styles.toggleButtonText,
                                !showCompleted && styles.toggleButtonTextActive
                            ]}>
                                Completed
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingBottom: bottom }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Pie Chart Section */}
                        <ProgressPieChart
                            data={progress}
                            title="Overall Progress - Roadmaps & Assessments"
                        />

                        {/* Bar Chart Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>{currentTitle}</Text>

                            <View style={styles.chartWrapper}>
                                <ProgressBarChart
                                    data={currentData}
                                    showRemaining={!showCompleted}
                                />
                            </View>
                        </View>

                        {/* Revitalization Roadmap Progress Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Revitalization Roadmap Progress</Text>
                            {!showCompleted && (
                                <View className='py-5'>
                                    <TabSwitcher
                                        tabs={revitalizationTabs}
                                        activeTab={revitalizationActiveTab}
                                        onChange={(key) => setRevitalizationActiveTab(key)}
                                    />
                                </View>
                            )}

                            <View style={styles.cardsContainer}>
                                {showCompleted && dummyRoadMapsCompleted.map((item, index) => (
                                    <View key={`roadmap-${index}`} style={[styles.cardWrapper, {
                                        paddingTop: index === 0 ? 15 : 0,
                                    }]}>
                                        <RoadmapCard data={convertToRoadmapCardData(item)} />
                                    </View>
                                ))}

                                {!showCompleted && (() => {
                                    const filtered = revitalizationActiveTab === 'all'
                                        ? dummyRoadMaps
                                        : revitalizationActiveTab === 'completed'
                                            ? dummyRoadMaps.filter(r => r.status === 'Completed')
                                            : dummyRoadMaps.filter(r => r.status !== 'Completed');

                                    return filtered.map((item, index) => (
                                        <View key={`roadmap-${index}`} style={styles.cardWrapper}>
                                            <RoadmapCard data={convertToRoadmapCardData(item)} />
                                        </View>
                                    ));
                                })()}
                            </View>
                        </View>

                        {/* Assessments Progress Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Assessments Progress</Text>
                            {!showCompleted && (
                                <View className='py-5'>
                                    <TabSwitcher
                                        tabs={assessmentTabs}
                                        activeTab={assessmentActiveTab}
                                        onChange={(key) => setAssessmentActiveTab(key)}
                                    />
                                </View>
                            )}

                            <View style={styles.cardsContainer}>
                                {showCompleted && dummyAssessmentCompleted.map((item, index) => (
                                    <View key={`assessment-${index}`} style={[styles.cardWrapper, {
                                        paddingTop: index === 0 ? 15 : 0,
                                    }]}>
                                        <ProgressAssessmentCard
                                            onDevelopmentPlanPress={openPMPSheet} data={item as any} />
                                    </View>
                                ))}

                                {!showCompleted && (() => {
                                    const filtered = assessmentActiveTab === 'all'
                                        ? dummyAssessment
                                        : assessmentActiveTab === 'completed'
                                            ? dummyAssessment.filter(a => a.status === 'Completed')
                                            : dummyAssessment.filter(a => a.status !== 'Completed');

                                    return filtered.map((item, index) => (
                                        <View key={`assessment-${index}`} style={styles.cardWrapper}>
                                            <ProgressAssessmentCard
                                                onDevelopmentPlanPress={openPMPSheet} data={item as any} />
                                        </View>
                                    ));
                                })()}
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Comment Bottom Sheet instance */}
            <CommentBottomSheet
                ref={commentSheetRef}
                onClose={closeCommentSheet}
                onSubmit={handleSubmitComment}
                onDelete={handleDeleteComment}
                onEdit={openCommentSheet}
                comments={comments}
                editingCommentId={editingCommentId}
                submitButtonText={getSubmitButtonText()}
                maxCommentsReached={comments.length >= 2}
            />
            <PMPBottomSheet
                ref={pmpSheetRef}
                onClose={closePMPSheet}
                onNext={handleNext}
                onDownload={handleDownload}
            />
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    backButton: {
        padding: 4,
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    headerBreadcrumb: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 15,
        color: '#e7f6fc',
        fontWeight: '700',
    },
    toggleContainer: {
        flexDirection: 'row',
        marginVertical: 16,
        alignSelf: 'center',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#1A5A7F',
    },
    toggleButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#000',
        minWidth: 120,
        alignItems: 'center',
    },
    toggleButtonLeft: {
        borderTopLeftRadius: 7,
        borderBottomLeftRadius: 7,
    },
    toggleButtonRight: {
        borderTopRightRadius: 7,
        borderBottomRightRadius: 7,
        borderLeftWidth: 1,
        borderLeftColor: '#1A5A7F',
    },
    toggleButtonActive: {
        backgroundColor: '#0F4A6D',
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    toggleButtonTextActive: {
        color: '#8BA5B8',
        fontWeight: '600',
    },
    chartWrapper: {
        backgroundColor: 'transparent',
        paddingHorizontal: 10,
        borderRadius: 12,
        paddingVertical: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    cardsContainer: {
        gap: 16,
    },
    cardWrapper: {
        width: '100%',
    },
    finalCommentButton: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: 'rgba(35, 58, 111, 1)',
        borderWidth: 1,
        borderColor: '#fff'
    },
    finalCommentText: {
        color: '#fff',
        fontWeight: '600'
    },
});

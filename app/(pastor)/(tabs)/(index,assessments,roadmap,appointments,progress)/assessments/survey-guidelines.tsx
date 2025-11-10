import TopBar from '@/components/director/TopBar';
import { useAssessment } from '@/hooks/assessments';
import { mapApiToFrontend } from '@/lib/assessments/mappers';
import { useAssessmentStore } from '@/stores/assessment.store';
import { ApiAssessment } from '@/types/assessment.types';
import { getFontSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

export default function SurveyGuidelinesPage() {
    const { assessmentId } = useLocalSearchParams();
    const router = useRouter();

    // Fetch assessment from API (server state)
    const { data, isLoading, error, refetch } = useAssessment(assessmentId as string);
    const assessment = useMemo(() => {
        if (!data) return null;
        return mapApiToFrontend(data as ApiAssessment);
    }, [data]);

    // Get draft from store (client state)
    const getDraft = useAssessmentStore((state) => state.getDraft);
    const clearDraft = useAssessmentStore((state) => state.clearDraft);
    const draftResponse = getDraft(assessmentId as string);

    // Check if completed from server data
    const isCompleted = assessment?.status === 'Completed';

    // Check if has draft in progress
    const hasDraft = !!draftResponse;

    // Refresh on focus
    useFocusEffect(
        useCallback(() => {
            refetch(); // Refresh assessment data from server
        }, [assessmentId])
    );

    const handleStart = () => {
        if (!assessment) return;
        console.log('Starting assessment:', assessmentId);
        console.log('Assessment type:', assessment.type);
        console.log('Has pre-survey:', assessment.sections[0]);
        router.push({
            pathname: '/assessments/answer-questions',
            params: {
                assessmentId,
                hasPreSurvey: (assessment.type === 'CMA' && assessment.preSurvey) ? 'true' : 'false'
            },
        });
    };

    const handleRepeatSurvey = async () => {
        // Clear any existing draft
        clearDraft(assessmentId as string);
        handleStart();
    };

    const handleViewResponse = () => {
        router.push({
            pathname: '/assessments/answer-questions',
            params: {
                assessmentId,
                viewMode: 'true'
            },
        });
    };

    const getCardContent = () => {
        if (!assessment) return null;

        if (assessment.type === 'PMP') {
            return {
                acronym: 'PMP',
                line1: 'PASTORAL MINISTRY',
                line2: 'PROFILE',
            };
        } else if (assessment.type === 'CMA') {
            return {
                acronym: 'CMA',
                line1: 'CHURCH ASSESSMENT',
                line2: 'EVALUATION',
            };
        }
        return null;
    };

    const cardContent = getCardContent();

    // Loading state
    if (isLoading) {
        return (
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
            >
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: '#fff', marginTop: 16 }}>Loading assessment...</Text>
            </LinearGradient>
        );
    }

    // Error state
    if (error || !assessment) {
        return (
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}
            >
                <Ionicons name="alert-circle-outline" size={64} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 18, marginTop: 16 }}>
                    Failed to load assessment
                </Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={{ color: '#fff', textDecorationLine: 'underline' }}>Go Back</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    if (!assessmentId) {
        return (
            <View style={styles.container}>
                <Text style={{ color: '#fff', textAlign: 'center', marginTop: 50 }}>
                    Assessment ID is missing.
                </Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={styles.container}
        >
            <TopBar
                userName="John Ross"
                showUserName={true}
                showNotifications={true}
            />
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{assessment.title}</Text>
                        <Text style={styles.headerSubtitle}>Assessment</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Assessment Card */}
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{cardContent?.acronym}</Text>
                        <View style={styles.cardDivider} />
                        <Text style={styles.cardSubtitle}>{cardContent?.line1}</Text>
                        <Text style={styles.cardSubtitle}>{cardContent?.line2}</Text>
                    </View>

                    <View style={styles.dateContainer}>
                        {assessment.dueDate && (
                            <Text style={styles.dueDate}>
                                Due: {assessment.dueDate}
                            </Text>
                        )}
                        {isCompleted && assessment.completionDate && (
                            <Text style={styles.completedDate}>
                                Completed on: {assessment.completionDate}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Meeting info */}
                {assessment.completedOn && assessment.meetingDate && (
                    <LinearGradient
                        colors={["#B83AF3", "#21B6E9"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.meetingGradientContainer}
                    >
                        <TouchableOpacity
                            style={styles.meetingContainer}
                            onPress={() => console.log('Meeting pressed')}
                        >
                            <Text style={styles.meetingText}>
                                Meeting Scheduled on {assessment.meetingDate}
                            </Text>
                            <TouchableOpacity onPress={() => console.log('Meeting options')}>
                                <Ionicons name="ellipsis-vertical" size={24} color="#EAB308" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </LinearGradient>
                )}

                {/* Show guidelines only if not completed */}
                {!isCompleted && (
                    <View style={styles.guidelinesSection}>
                        <Text style={styles.guidelinesTitle}>Assessment Guidelines</Text>
                        <View style={styles.guidelinesBox}>
                            {assessment.guidelines.map((guideline, index) => (
                                <View key={index} style={styles.guidelineItem}>
                                    <View style={styles.bulletContainer}>
                                        <View style={styles.bullet} />
                                    </View>
                                    <Text style={styles.guidelineText}>{guideline}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Action Buttons */}
                {isCompleted ? (
                    <View style={styles.completedButtonContainer}>
                        <TouchableOpacity
                            style={styles.repeatButton}
                            onPress={handleRepeatSurvey}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.repeatButtonText}>
                                Repeat {assessment.type} Survey
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.viewResponseButton}
                            onPress={handleViewResponse}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.viewResponseButtonText}>View Response</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStart}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.startButtonText}>
                            {hasDraft ? 'Continue Assessment' : 'Start Now'}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: getSpacing(16),
        paddingBottom: getSpacing(32),
        paddingTop: getSpacing(16),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: getSpacing(12),
    },
    backButton: {
        padding: getSpacing(4),
        marginRight: getSpacing(8),
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#fff',
        marginBottom: getSpacing(2),
    },
    headerSubtitle: {
        fontSize: getFontSize(12),
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '400',
    },
    cardContainer: {
        marginBottom: getSpacing(24),
    },
    card: {
        backgroundColor: '#00ABAE',
        borderRadius: 16,
        padding: getSpacing(32),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        minHeight: height * 0.2,
    },
    cardTitle: {
        fontSize: getFontSize(48),
        fontWeight: '800',
        color: '#0F4C75',
        letterSpacing: 2,
    },
    cardDivider: {
        width: '80%',
        height: 3,
        backgroundColor: '#fff',
        marginVertical: getSpacing(12),
    },
    cardSubtitle: {
        fontSize: getFontSize(13),
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 1.5,
    },
    dueDate: {
        fontSize: getFontSize(13),
        color: '#fff',
        marginTop: getSpacing(12),
        fontWeight: '400',
    },
    guidelinesSection: {
        marginBottom: getSpacing(24),
    },
    guidelinesTitle: {
        fontSize: getFontSize(18),
        fontWeight: '600',
        color: '#fff',
        marginBottom: getSpacing(16),
        textAlign: 'center',
    },
    guidelinesBox: {
        borderRadius: 16,
        padding: getSpacing(20),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    guidelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: getSpacing(16),
    },
    bulletContainer: {
        paddingTop: getSpacing(6),
        marginRight: getSpacing(12),
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
    },
    guidelineText: {
        flex: 1,
        fontSize: getFontSize(14),
        color: '#fff',
        lineHeight: getFontSize(21),
        fontWeight: '400',
    },
    startButton: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: getSpacing(14),
        alignItems: 'center',
        marginTop: getSpacing(8),
        width: '50%',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    startButtonText: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#1D548D',
    },
    completedButtonContainer: {
        flexDirection: 'row',
        gap: getSpacing(12),
        marginTop: getSpacing(8),
    },
    repeatButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: getSpacing(14),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    repeatButtonText: {
        fontSize: getFontSize(15),
        fontWeight: '600',
        color: '#5B47D6',
    },
    viewResponseButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        paddingVertical: getSpacing(14),
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    viewResponseButtonText: {
        fontSize: getFontSize(15),
        fontWeight: '600',
        color: '#fff',
    },
    dateContainer: {
        marginTop: getSpacing(12),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContainer: {
        paddingHorizontal: getSpacing(16),
        marginTop: getSpacing(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    completedDate: {
        fontSize: getFontSize(13),
        color: '#14B8A6',
        fontWeight: '500',
    },
    meetingGradientContainer: {
        borderRadius: 10,
        padding: 2,
        marginVertical: getSpacing(12),
        width: "95%",
        alignSelf: "center",
    },
    meetingContainer: {
        backgroundColor: "#233A6F",
        borderRadius: 8,
        alignItems: "center",
        paddingVertical: getSpacing(7),
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: getSpacing(10),
    },
    meetingText: {
        fontSize: getFontSize(16),
        color: "#EAB308",
        fontWeight: "600",
        lineHeight: getFontSize(20),
        paddingVertical: getSpacing(4),
        flex: 1,
    },

});

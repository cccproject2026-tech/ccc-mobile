import TopBar from '@/components/director/TopBar';
import { useAssessment } from '@/context/AssessmentsContext';
import { Assessment, AssessmentQuestion, QuestionGroup } from '@/lib/assessments/types';
import { getFontSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function AnswerQuestionPage() {
    const { data, assessmentId, viewMode } = useLocalSearchParams();
    const assessment: Assessment = JSON.parse(data as string);
    const router = useRouter();
    const { saveResponse, getResponse, completeAssessment } = useAssessment();

    // Check if we're in view mode
    const isViewMode = viewMode === 'true';

    // Load previous response if exists
    const previousResponse = getResponse(assessmentId as string);
    const [answers, setAnswers] = useState<Record<string, any>>(
        previousResponse?.sectionAnswers || {}
    );
    const [currentSectionIndex, setCurrentSectionIndex] = useState(
        isViewMode ? 0 : (previousResponse?.currentSectionIndex || 0)
    );

    const totalSections = assessment.sections.length;
    const currentSection = assessment.sections[currentSectionIndex];

    // Auto-save progress whenever answers or section changes (only if not in view mode)
    useEffect(() => {
        if (!isViewMode) {
            saveProgress();
        }
    }, [answers, currentSectionIndex]);

    const saveProgress = async () => {
        await saveResponse(assessmentId as string, {
            assessmentId: assessmentId as string,
            assessmentType: assessment.type,
            assessmentTitle: assessment.title,
            preSurveyAnswers: previousResponse?.preSurveyAnswers,
            sectionAnswers: answers,
            status: 'in-progress',
            currentSectionIndex,
        });
    };

    const handleAnswer = (questionId: string, value: boolean) => {
        // Don't allow changes in view mode
        if (isViewMode) return;

        setAnswers(prev => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleClearResponses = () => {
        if (isViewMode) return;

        Alert.alert(
            "Clear Responses",
            "Are you sure you want to clear all responses for this section?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => {
                        const clearedAnswers = { ...answers };
                        currentSection.questionGroups.forEach(group => {
                            group.questions.forEach(q => {
                                delete clearedAnswers[q.id];
                            });
                        });
                        setAnswers(clearedAnswers);
                    }
                }
            ]
        );
    };

    const handleNextSection = () => {
        if (isViewMode) {
            // In view mode, just navigate to next section without validation
            if (currentSectionIndex < totalSections - 1) {
                setCurrentSectionIndex(prev => prev + 1);
            } else {
                router.back();
            }
            return;
        }

        // Check if all required questions are answered (only in edit mode)
        const allQuestions = currentSection.questionGroups.flatMap(group => group.questions);
        const unansweredQuestions = allQuestions.filter(
            q => q.required && !answers[q.id]
        );

        if (unansweredQuestions.length > 0) {
            Alert.alert("Required Fields", "Please answer all required questions before proceeding.");
            return;
        }

        if (currentSectionIndex < totalSections - 1) {
            setCurrentSectionIndex(prev => prev + 1);
        } else {
            handleSubmitAssessment();
        }
    };

    const handlePreviousSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1);
        }
    };

    const handleSubmitAssessment = () => {
        Alert.alert(
            "Submit Assessment",
            "Are you sure you want to submit your assessment? You won't be able to make changes after submission.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Submit",
                    onPress: async () => {
                        await completeAssessment(assessmentId as string);
                        Alert.alert(
                            "Success",
                            "Your assessment has been submitted successfully!",
                            [
                                {
                                    text: "OK",
                                    onPress: () => router.back()
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    const renderQuestion = (question: AssessmentQuestion) => {
        if (question.type === 'checkbox') {
            const isChecked = answers[question.id] || false;
            return (
                <TouchableOpacity
                    key={question.id}
                    style={styles.questionItem}
                    onPress={() => handleAnswer(question.id, !isChecked)}
                    activeOpacity={isViewMode ? 1 : 0.7}
                    disabled={isViewMode}
                >
                    <View style={[
                        styles.checkbox,
                        isChecked && styles.checkboxChecked,
                        isViewMode && styles.checkboxViewMode
                    ]}>
                        {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                    <Text style={styles.questionText}>
                        {question.text}
                        {question.required && <Text style={styles.required}> *</Text>}
                    </Text>
                </TouchableOpacity>
            );
        }
        return null;
    };

    const renderQuestionGroup = (group: QuestionGroup) => {
        return (
            <View key={group.id} style={styles.questionGroupCard}>
                {group.questions.map(renderQuestion)}
            </View>
        );
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={styles.container}
        >
            <TopBar showDrawer={false} showNotifications={false} />

            {/* View Mode Indicator */}
            {isViewMode && (
                <View style={styles.viewModeIndicator}>
                    <Ionicons name="eye-outline" size={20} color="#14B8A6" />
                    <Text style={styles.viewModeText}>Viewing Previous Response</Text>
                </View>
            )}

            <KeyboardAwareScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    {assessment.sections.map((_, index) => (
                        <React.Fragment key={index}>
                            <View style={[
                                styles.progressDot,
                                index <= currentSectionIndex && styles.progressDotActive
                            ]} />
                            {index < totalSections - 1 && (
                                <View style={[
                                    styles.progressLine,
                                    index < currentSectionIndex && styles.progressLineActive
                                ]} />
                            )}
                        </React.Fragment>
                    ))}
                </View>

                {/* Section Header Card */}
                <View style={styles.sectionHeaderCard}>
                    <View style={styles.sectionBadge}>
                        <Text style={styles.sectionBadgeText}>Section {currentSectionIndex + 1}</Text>
                    </View>
                    <Text style={styles.sectionTitle}>{currentSection.title}</Text>
                </View>

                {/* Instructions */}
                {currentSection.subtitle && (
                    <Text style={styles.instructionText}>
                        {currentSection.subtitle}
                    </Text>
                )}

                {/* Render all question groups */}
                {currentSection.questionGroups.map(renderQuestionGroup)}

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    {isViewMode ? (
                        <>
                            {/* Previous Section Button */}
                            <TouchableOpacity
                                style={[styles.clearButton, currentSectionIndex === 0 && styles.buttonDisabled]}
                                onPress={handlePreviousSection}
                                activeOpacity={0.8}
                                disabled={currentSectionIndex === 0}
                            >
                                <Text style={styles.clearButtonText}>
                                    <Ionicons name="chevron-back" size={16} /> Previous
                                </Text>
                            </TouchableOpacity>

                            {/* Next/Close Button */}
                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={handleNextSection}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.nextButtonText}>
                                    {currentSectionIndex < totalSections - 1 ? 'Next >>' : 'Close'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* Clear Button */}
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={handleClearResponses}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.clearButtonText}>Clear Responses</Text>
                            </TouchableOpacity>

                            {/* Next/Submit Button */}
                            <TouchableOpacity
                                style={styles.nextButton}
                                onPress={handleNextSection}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.nextButtonText}>
                                    {currentSectionIndex < totalSections - 1 ? 'Next Section >>' : 'Submit Survey'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </KeyboardAwareScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    viewModeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(20, 184, 166, 0.2)',
        paddingVertical: getSpacing(10),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(20, 184, 166, 0.3)',
        gap: getSpacing(8),
    },
    viewModeText: {
        color: '#14B8A6',
        fontSize: getFontSize(14),
        fontWeight: '600',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: getSpacing(20),
        paddingHorizontal: getSpacing(40),
    },
    progressDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    progressDotActive: {
        backgroundColor: '#fff',
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: getSpacing(8),
    },
    progressLineActive: {
        backgroundColor: '#fff',
    },
    sectionHeaderCard: {
        marginHorizontal: getSpacing(20),
        marginBottom: getSpacing(20),
        backgroundColor: 'rgba(25, 79, 130, 1)',
        borderRadius: 20,
        padding: getSpacing(24),
        alignItems: 'center',
    },
    sectionBadge: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        paddingHorizontal: getSpacing(20),
        paddingVertical: getSpacing(8),
        borderRadius: 20,
        marginBottom: getSpacing(16),
    },
    sectionBadgeText: {
        color: '#fff',
        fontSize: getFontSize(14),
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        lineHeight: getFontSize(28),
    },
    instructionText: {
        fontSize: getFontSize(14),
        color: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: getSpacing(20),
        marginBottom: getSpacing(20),
        lineHeight: getFontSize(21),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: getSpacing(100),
    },
    questionGroupCard: {
        marginHorizontal: getSpacing(20),
        marginBottom: getSpacing(16),
        borderRadius: 20,
        padding: getSpacing(20),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    questionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: getSpacing(16),
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: 'rgba(200, 200, 210, 0.8)',
        marginRight: getSpacing(16),
        marginTop: getSpacing(2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#5B7BB4',
    },
    checkboxViewMode: {
        opacity: 0.7,
    },
    questionText: {
        flex: 1,
        fontSize: getFontSize(15),
        color: '#fff',
        lineHeight: getFontSize(23),
        fontWeight: '400',
    },
    required: {
        color: '#EF4444',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: getSpacing(20),
        paddingTop: getSpacing(32),
        gap: getSpacing(16),
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingVertical: getSpacing(16),
        alignItems: 'center',
        maxWidth: 180,
    },
    clearButtonText: {
        fontSize: getFontSize(15),
        fontWeight: '600',
        color: '#3D5A8C',
    },
    nextButton: {
        flex: 1,
        backgroundColor: 'rgba(60, 85, 130, 0.8)',
        borderRadius: 25,
        paddingVertical: getSpacing(16),
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        maxWidth: 180,
    },
    nextButtonText: {
        fontSize: getFontSize(15),
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

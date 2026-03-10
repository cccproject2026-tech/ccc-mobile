import { useAssessmentStore } from '@/stores/assessment.store';
import { Assessment, AssessmentQuestion, QuestionGroup } from '@/types/assessment.types';
import { getFontSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface MentorReviewSection {
    sectionId: string;
    title: string;
    score?: number;
    recommendations: string[];
}

interface AssessmentQuestionsSectionProps {
    assessment: Assessment;
    assessmentId: string;
    isViewMode: boolean;
    onSubmit: (sectionAnswers: Record<number, Record<string, any>>) => void;
    onClose?: () => void;
    // When true, show mentor review UI (Responses & Recommendations) after final section
    reviewMode?: boolean;
    /** Mentor review data per section (score + recommendations) from GET answers. */
    mentorReviewSections?: MentorReviewSection[];
    // Called when mentor sends Customized Development Plans (CDP)
    onSendCdp?: (payload: {
        recommendations: Array<{
            sectionId: string;
            selectedItems: Array<{ level: number; text: string }>;
        }>;
    }) => void;
}

export default function AssessmentQuestionsSection({
    assessment,
    assessmentId,
    isViewMode,
    onSubmit,
    onClose,
    reviewMode = false,
    mentorReviewSections,
    onSendCdp,
}: AssessmentQuestionsSectionProps) {
    const getDraft = useAssessmentStore((state) => state.getDraft);
    const saveDraft = useAssessmentStore((state) => state.saveDraft);

    const previousResponse = getDraft(assessmentId);
    const [answers, setAnswers] = useState<Record<number, Record<string, any>>>(
        previousResponse?.sectionAnswers || {}
    );
    const [currentSectionIndex, setCurrentSectionIndex] = useState(
        isViewMode ? 0 : (previousResponse?.currentSectionIndex || 0)
    );

    /** CDP recommendations selected by mentor per section. Key = sectionId (section index as string), value = selected recommendation texts. */
    const [selectedRecommendations, setSelectedRecommendations] = useState<Record<string, string[]>>({});

    const totalSections = assessment.sections.length;
    const currentSection = assessment.sections[currentSectionIndex];

    // Auto-save progress
    useEffect(() => {
        if (!isViewMode) {
            saveProgress();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answers, currentSectionIndex]);

    const saveProgress = async () => {
        saveDraft(assessmentId, {
            assessmentId,
            assessmentType: assessment.type,
            assessmentTitle: assessment.title,
            preSurveyAnswers: previousResponse?.preSurveyAnswers,
            sectionAnswers: answers,
            status: 'Not Started',
            currentSectionIndex,
        });
    };

    /** One selected choice per question (layer). Value is numeric level "1"|"2"|"3"|"4" for backend. */
    const handleAnswer = (questionId: string, choiceId: string) => {
        if (isViewMode) return;
        setAnswers(prev => ({
            ...prev,
            [currentSectionIndex]: {
                ...prev[currentSectionIndex],
                [questionId]: choiceId,
            }
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
                        setAnswers(prev => ({
                            ...prev,
                            [currentSectionIndex]: {},
                        }));
                    }
                }
            ]
        );
    };

    const handleNextSection = () => {
        if (isViewMode) {
            if (currentSectionIndex < totalSections - 1) {
                setCurrentSectionIndex(prev => prev + 1);
            }
            else {
                // In mentor review mode, stay on last section so user can see recommendations
                if (!reviewMode && onClose) {
                    onClose();
                }
            }
            return;
        }

        const allQuestions = currentSection.questionGroups.flatMap(group => group.questions);
        const unansweredQuestions = allQuestions.filter(
            q => q.required && !(answers[currentSectionIndex]?.[q.id])
        );

        if (unansweredQuestions.length > 0) {
            Alert.alert("Required Fields", "Please answer all required questions before proceeding.");
            return;
        }

        for (const group of currentSection.questionGroups) {
            const hasAnswered = group.questions.some(q => answers[currentSectionIndex]?.[q.id]);
            if (!hasAnswered) {
                Alert.alert(
                    "Incomplete Group",
                    "Please answer at least one question in each group of this section before proceeding."
                );
                return;
            }
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

    /** Toggle a CDP recommendation: add if not selected, remove if selected. */
    const toggleRecommendation = (sectionId: string, recommendationText: string) => {
        setSelectedRecommendations(prev => {
            const list = prev[sectionId] ?? [];
            const isSelected = list.includes(recommendationText);
            const nextList = isSelected
                ? list.filter(t => t !== recommendationText)
                : [...list, recommendationText];
            return { ...prev, [sectionId]: nextList };
        });
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
                        // Pass answers to parent for API submission
                        onSubmit(answers);
                    }
                }
            ]
        );
    };

    const renderQuestion = (question: AssessmentQuestion) => {
        if (question.type === 'radio' && question.options?.length) {
            const selectedChoiceId = answers[currentSectionIndex]?.[question.id] as string | undefined;
            return (
                <View key={question.id} style={styles.radioQuestionBlock}>
                    <Text style={styles.radioQuestionLabel}>
                        {question.text}
                        {question.required && <Text style={styles.required}> *</Text>}
                    </Text>
                    {question.options.map((option) => {
                        const isSelected = selectedChoiceId === option.value;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                style={styles.radioRow}
                                onPress={() => handleAnswer(question.id, option.value)}
                                activeOpacity={isViewMode ? 1 : 0.7}
                                disabled={isViewMode}
                            >
                                <View style={[
                                    styles.radioOuter,
                                    isSelected && styles.radioOuterSelected,
                                    isViewMode && styles.radioViewMode
                                ]}>
                                    {isSelected && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.radioOptionLabel}>{option.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        }
        return null;
    };

    const renderQuestionGroup = (group: QuestionGroup) => (
        <View key={group.id} style={styles.questionGroupCard}>
            {/* Show group title if exists */}
            {group.questions.map(renderQuestion)}
        </View>
    );

    return (
        <>
            {__DEV__ && !isViewMode && (
                <View style={{ alignItems: 'flex-end', margin: 12 }}>
                    <TouchableOpacity
                        onPress={() => {
                            const filledAnswers: Record<string, string> = {};
                            currentSection.questionGroups.forEach(group => {
                                group.questions.forEach(q => {
                                    if (q.type === 'radio' && q.options?.length) {
                                        filledAnswers[q.id] = q.options[0].value;
                                    }
                                });
                            });
                            setAnswers(prev => ({
                                ...prev,
                                [currentSectionIndex]: {
                                    ...prev[currentSectionIndex],
                                    ...filledAnswers
                                }
                            }));
                        }}
                        style={{
                            backgroundColor: '#28C76F',
                            paddingVertical: 8,
                            paddingHorizontal: 18,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>
                            Mark All As Answered
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

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
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={handleClearResponses}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.clearButtonText}>Clear Responses</Text>
                            </TouchableOpacity>
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

                {/* Mentor Review: Responses & Recommendations — use sectionScore + recommendations from answers API */}
                {reviewMode && isViewMode && (
                    <View style={styles.recommendationsContainer}>
                        <Text style={styles.recommendationsHeader}>
                            Responses &amp; Recommendations
                        </Text>
                        {mentorReviewSections?.map((section) => {
                            if (!section.recommendations || section.recommendations.length === 0) {
                                return null;
                            }
                            return (
                                <View key={section.sectionId} style={styles.recommendationSectionCard}>
                                    <Text style={styles.recommendationSectionTitle}>
                                        {section.title}
                                    </Text>
                                    <Text style={styles.recommendationScoreLabel}>
                                        Score: {section.score ?? "-"}
                                    </Text>
                                    <View style={styles.recommendationLevelBlock}>
                                        <Text style={styles.recommendationLevelLabel}>
                                            Recommended CDP
                                        </Text>
                                        {section.recommendations.map((item, itemIndex) => {
                                            const key = `${section.sectionId}-${itemIndex}`;
                                            const sectionId = section.sectionId;
                                            const isSelected = (selectedRecommendations[sectionId] ?? []).includes(item);
                                            return (
                                                <TouchableOpacity
                                                    key={key}
                                                    style={styles.recommendationRow}
                                                    onPress={() => toggleRecommendation(sectionId, item)}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={[
                                                        styles.recommendationCheckbox,
                                                        isSelected && styles.recommendationCheckboxChecked
                                                    ]}>
                                                        {isSelected && (
                                                            <Ionicons name="checkmark" size={14} color="#fff" />
                                                        )}
                                                    </View>
                                                    <Text style={styles.recommendationText}>{item}</Text>
                                                    <Ionicons
                                                        name="pencil-outline"
                                                        size={16}
                                                        color="#E2E8F0"
                                                        style={styles.recommendationEditIcon}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                        {onSendCdp && mentorReviewSections && (
                            <TouchableOpacity
                                style={styles.sendCdpButton}
                                onPress={() => {
                                    // Build payload from selected recommendations per section
                                    const payload = {
                                        recommendations: mentorReviewSections
                                            .map((section) => {
                                                const selected = selectedRecommendations[section.sectionId] ?? [];
                                                return {
                                                    sectionId: section.sectionId,
                                                    selectedItems: selected.map((text) => ({
                                                        level: section.score ?? 0,
                                                        text,
                                                    })),
                                                };
                                            })
                                            .filter((s) => s.selectedItems.length > 0),
                                    };
                                    onSendCdp(payload);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.sendCdpButtonText}>Send CDP</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </KeyboardAwareScrollView>
        </>
    );
}

const styles = StyleSheet.create({
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
    radioQuestionBlock: {
        marginBottom: getSpacing(20),
    },
    radioQuestionLabel: {
        fontSize: getFontSize(15),
        color: '#fff',
        lineHeight: getFontSize(23),
        fontWeight: '600',
        marginBottom: getSpacing(12),
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: getSpacing(12),
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        marginRight: getSpacing(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: '#5B7BB4',
        backgroundColor: 'rgba(91, 123, 180, 0.3)',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#5B7BB4',
    },
    radioViewMode: {
        opacity: 0.7,
    },
    radioOptionLabel: {
        flex: 1,
        fontSize: getFontSize(15),
        color: '#fff',
        lineHeight: getFontSize(22),
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
    recommendationsContainer: {
        marginTop: getSpacing(32),
        paddingHorizontal: getSpacing(20),
        paddingBottom: getSpacing(40),
    },
    recommendationsHeader: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        color: '#fff',
        marginBottom: getSpacing(16),
    },
    recommendationSectionCard: {
        marginBottom: getSpacing(16),
        padding: getSpacing(16),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(15,35,70,0.9)',
    },
    recommendationSectionTitle: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#E2E8F0',
        marginBottom: getSpacing(8),
    },
    recommendationLevelBlock: {
        marginTop: getSpacing(8),
    },
    recommendationScoreLabel: {
        fontSize: getFontSize(13),
        fontWeight: '500',
        color: '#E2E8F0',
        marginTop: getSpacing(4),
        marginBottom: getSpacing(4),
    },
    recommendationLevelLabel: {
        fontSize: getFontSize(13),
        fontWeight: '600',
        color: '#A5B4FC',
        marginBottom: getSpacing(4),
    },
    recommendationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getSpacing(6),
    },
    recommendationCheckbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(226,232,240,0.7)',
        marginRight: getSpacing(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    recommendationCheckboxChecked: {
        backgroundColor: '#5B7BB4',
        borderColor: '#5B7BB4',
    },
    recommendationText: {
        flex: 1,
        fontSize: getFontSize(14),
        color: '#E2E8F0',
    },
    recommendationEditIcon: {
        marginLeft: getSpacing(8),
    },
    sendCdpButton: {
        marginTop: getSpacing(24),
        alignSelf: 'center',
        paddingVertical: getSpacing(12),
        paddingHorizontal: getSpacing(32),
        borderRadius: 24,
        backgroundColor: '#FACC15',
    },
    sendCdpButtonText: {
        fontSize: getFontSize(15),
        fontWeight: '700',
        color: '#1F2933',
    },
});

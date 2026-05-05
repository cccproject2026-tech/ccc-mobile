import CdpPlansModal from '@/components/CdpPlansModal';
import { useAssessmentStore } from '@/stores/assessment.store';
import { Assessment, AssessmentQuestion, QuestionGroup } from '@/types/assessment.types';
import { sharePdfFromHtml } from '@/utils/pdf';
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

interface AssessmentQuestionsSectionProps {
    assessment: Assessment;
    assessmentId: string;
    isViewMode: boolean;
    /** If true (usually from deep-link), open CDP modal immediately when ready. */
    openCdpOnLoad?: boolean;
    /** Optional initial answers for view mode (e.g. from submitted answers). */
    initialSectionAnswers?: Record<number, Record<string, any>>;
    onSubmit: (sectionAnswers: Record<number, Record<string, any>>) => void;
    onClose?: () => void;
    // When true, show mentor review UI (Responses & Recommendations) after final section
    reviewMode?: boolean;
    /** Mentor review data per section (score + recommendations) from GET answers. */
    mentorReviewSections?: Array<{
        sectionId: string;
        title: string;
        score?: number;
        recommendations: string[];
    }>;
    /**
     * Raw sections array from the answers API (GET /assessment/{id}/answers/{userId}).
     * Used only to decide if CDP is ready, so pastor doesn't see CDP based on template-level recommendations.
     */
    submittedSections?: Array<{
        recommendations?: string[];
    }>;
    // Called when mentor sends Customized Development Plans (CDP)
    onSendCdp?: (payload: {
        recommendations: Array<{
            sectionId: string;
            selectedItems: Array<{ level: number; text: string }>;
        }>;
    }) => void;
    /** Current viewer role to separate pastor vs mentor CDP visibility behavior. */
    userRole?: string;
}

export default function AssessmentQuestionsSection({
    assessment,
    assessmentId,
    isViewMode,
    openCdpOnLoad = false,
    initialSectionAnswers,
    onSubmit,
    onClose,
    reviewMode = false,
    mentorReviewSections,
    submittedSections,
    onSendCdp,
    userRole,
}: AssessmentQuestionsSectionProps) {
    const previousResponse = useAssessmentStore(
        (state) => state.getDraft(assessmentId)
    );
    const saveDraft = useAssessmentStore((state) => state.saveDraft);
    const [answers, setAnswers] = useState<Record<number, Record<string, any>>>(
        isViewMode
            ? (initialSectionAnswers || previousResponse?.sectionAnswers || {})
            : (previousResponse?.sectionAnswers || {})
    );
    const [currentSectionIndex, setCurrentSectionIndex] = useState(
        isViewMode ? 0 : (previousResponse?.currentSectionIndex || 0)
    );

    /** CDP recommendations selected by mentor per section. Key = sectionId, value = selected recommendation texts. */
    const [selectedRecommendations, setSelectedRecommendations] = useState<Record<string, string[]>>({});
    const [editableMentorSections, setEditableMentorSections] = useState<
        Array<{
            sectionId: string;
            title: string;
            score?: number;
            recommendations: string[];
        }>
    >([]);
    const [showCdpModal, setShowCdpModal] = useState(false);

    const totalSections = assessment.sections.length;
    const currentSection = assessment.sections[currentSectionIndex];

    // CDP is ready only when the ANSWERS API contains at least one recommendation.
    // Missing/invalid recommendations are treated as empty.
    const sections = submittedSections || [];
    const hasCdpRecommendations = sections.some(
        (section) =>
            Array.isArray(section.recommendations) &&
            section.recommendations.length > 0,
    );

    const normalizedRole = (userRole || '').toLowerCase();
    const isPastor = normalizedRole === 'pastor';
    const isMentor = normalizedRole === 'mentor' || reviewMode;
    const showCdpAsReady = isMentor || hasCdpRecommendations;

    useEffect(() => {
        setEditableMentorSections(mentorReviewSections ?? []);
    }, [mentorReviewSections]);

    useEffect(() => {
        if (!openCdpOnLoad) return;
        if (!isViewMode) return;
        if (!showCdpAsReady) return;
        setShowCdpModal(true);
    }, [openCdpOnLoad, isViewMode, showCdpAsReady]);

    // In view mode, sync any incoming initial answers into local state
    useEffect(() => {
        if (isViewMode && initialSectionAnswers) {
            setAnswers(initialSectionAnswers);
            setCurrentSectionIndex(0);
        }
    }, [isViewMode, initialSectionAnswers]);

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

    const updateRecommendationText = (
        sectionId: string,
        recommendationIndex: number,
        nextText: string,
    ) => {
        const trimmedText = nextText;
        let previousText = '';

        setEditableMentorSections((prev) =>
            prev.map((section) => {
                if (section.sectionId !== sectionId) {
                    return section;
                }

                const nextRecommendations = [...(section.recommendations ?? [])];
                previousText = nextRecommendations[recommendationIndex] ?? '';
                nextRecommendations[recommendationIndex] = trimmedText;

                return {
                    ...section,
                    recommendations: nextRecommendations,
                };
            }),
        );

        if (!previousText || previousText === trimmedText) {
            return;
        }

        setSelectedRecommendations((prev) => {
            const currentSelected = prev[sectionId] ?? [];
            if (!currentSelected.includes(previousText)) {
                return prev;
            }

            const withoutOld = currentSelected.filter((item) => item !== previousText);
            if (!trimmedText.trim()) {
                return { ...prev, [sectionId]: withoutOld };
            }

            return { ...prev, [sectionId]: [...withoutOld, trimmedText] };
        });
    };

    const addRecommendationRow = (sectionId: string) => {
        setEditableMentorSections((prev) =>
            prev.map((section) => {
                if (section.sectionId !== sectionId) return section;
                const nextRecommendations = [...(section.recommendations ?? []), ''];
                return { ...section, recommendations: nextRecommendations };
            }),
        );
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

    const handleDownloadCdp = async () => {
        if (!editableMentorSections.length) {
            Alert.alert('Download', 'No CDP recommendations available to download yet.');
            return;
        }

        const escapeHtml = (value: string) =>
            value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

        const generatedAt = new Date().toLocaleString();

        const sectionsHtml = editableMentorSections
            .map((section, index) => {
                const recommendationItems = (section.recommendations ?? [])
                    .map((item) => `<li>${escapeHtml(item)}</li>`)
                    .join('');

                return `
                    <div style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 6px 0; color: #1f2937;">
                            Section ${index + 1}: ${escapeHtml(section.title)}
                        </h3>
                        ${typeof section.score === 'number'
                        ? `<p style="margin: 0 0 8px 0; color: #4b5563;">Level: ${section.score}</p>`
                        : ''}
                        <ul style="margin: 0; padding-left: 18px; color: #111827;">
                            ${recommendationItems || '<li>No recommendations provided.</li>'}
                        </ul>
                    </div>
                `;
            })
            .join('');

        const html = `
            <html>
                <body style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">
                    <h1 style="margin-bottom: 6px;">${escapeHtml(assessment.title)} - CDP</h1>
                    <p style="margin-top: 0; color: #6b7280;">Generated: ${escapeHtml(generatedAt)}</p>
                    ${sectionsHtml}
                </body>
            </html>
        `;

        await sharePdfFromHtml({
            html,
            fileName: `${assessment.title.replace(/[^a-z0-9]/gi, '_')}_CDP`,
        });
    };

    const renderQuestion = (question: AssessmentQuestion) => {
        if (question.type === 'radio' && question.options?.length) {
            const selectedChoiceId = answers[currentSectionIndex]?.[question.id] as string | undefined;
            const isAutoGeneratedTitle = /^Layer \d+$/i.test(question.text?.trim() || '');
            return (
                <View key={question.id} style={styles.radioQuestionBlock}>
                    {!isAutoGeneratedTitle && question.text?.trim() && (
                        <Text style={styles.radioQuestionLabel}>
                            {question.text}
                            {question.required && <Text style={styles.required}> *</Text>}
                        </Text>
                    )}
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
                {/* View mode: Responses | Customized Development Plans at top of section */}
                {isViewMode && (
                    <View style={styles.tabBarContainer}>
                        <View style={[styles.tabSegment, styles.tabSegmentActive]}>
                            <Text style={styles.tabSegmentActiveText}>Responses</Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.tabSegmentOutline,
                                isPastor && !showCdpAsReady && styles.tabSegmentDisabled,
                            ]}
                            onPress={showCdpAsReady ? () => setShowCdpModal(true) : undefined}
                            activeOpacity={showCdpAsReady ? 0.8 : 1}
                            disabled={isPastor && !showCdpAsReady}
                        >
                            {showCdpAsReady ? (
                                <Text style={styles.tabSegmentOutlineText}>
                                    Customized Development Plans
                                </Text>
                            ) : (
                                <View style={styles.waitingForResponseContainer}>
                                    <Text style={styles.tabSegmentOutlineText}>
                                        {isPastor
                                            ? "Waiting for response from mentor"
                                            : "Customized Development Plans"}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

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

                {/* Instructions (skip in view mode; subtitle is shown in section card) */}
                {!isViewMode && currentSection.subtitle && (
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

                <CdpPlansModal
                    visible={showCdpModal}
                    onClose={() => setShowCdpModal(false)}
                    assessmentTitle={assessment.title}
                    mode={reviewMode ? 'mentor' : 'pastor'}
                    sections={editableMentorSections}
                    selectedRecommendations={reviewMode ? selectedRecommendations : undefined}
                    onToggleRecommendation={reviewMode ? toggleRecommendation : undefined}
                    onUpdateRecommendation={reviewMode ? updateRecommendationText : undefined}
                    onAddRecommendation={reviewMode ? addRecommendationRow : undefined}
                    onSendCdp={
                        reviewMode && onSendCdp && editableMentorSections
                            ? () => {
                                  const payload = {
                                      recommendations: editableMentorSections
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
                                  setShowCdpModal(false);
                              }
                            : undefined
                    }
                    onDownloadCdp={!reviewMode ? handleDownloadCdp : undefined}
                />
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
    sectionSubtitle: {
        fontSize: getFontSize(13),
        color: 'rgba(255,255,255,0.85)',
        marginTop: getSpacing(6),
        textAlign: 'center',
    },
    tabBarContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: getSpacing(20),
        marginBottom: getSpacing(16),
        marginTop: getSpacing(8),
        gap: getSpacing(12),
        alignItems: 'center',
    },
    tabSegment: {
        paddingVertical: getSpacing(10),
        paddingHorizontal: getSpacing(16),
        borderRadius: 20,
    },
    tabSegmentActive: {
        backgroundColor: 'rgba(255,255,255,0.25)',
    },
    tabSegmentActiveText: {
        fontSize: getFontSize(15),
        fontWeight: '600',
        color: '#fff',
    },
    tabSegmentOutline: {
        paddingVertical: getSpacing(10),
        paddingHorizontal: getSpacing(16),
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        backgroundColor: 'transparent',
    },
    tabSegmentOutlineText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#fff',
    },
    tabSegmentDisabled: {
        opacity: 0.7,
    },
    waitingForResponseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: getSpacing(8),
    },
    waitingSpinner: {
        marginRight: getSpacing(4),
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
    cdpButtonContainer: {
        marginTop: getSpacing(24),
        paddingHorizontal: getSpacing(20),
        paddingBottom: getSpacing(40),
    },
    cdpOpenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: getSpacing(16),
        paddingHorizontal: getSpacing(20),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    cdpOpenButtonText: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#fff',
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

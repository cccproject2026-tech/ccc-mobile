import { Assessment, PreSurveyQuestion } from '@/lib/assessments/types';
import { useAssessmentStore } from '@/stores/assessment.store';
import { getFontSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import KeyboardSafeContainer from '@/components/layout/KeyboardSafeContainer';

interface PreSurveySectionProps {
    assessment: Assessment;
    assessmentId: string;
    onComplete: (answers: Record<string, string>) => void;
    onCancel: () => void;
    hasExistingAnswers?: boolean;
}

export default function PreSurveySection({
    assessment,
    assessmentId,
    onComplete,
    onCancel,
    hasExistingAnswers = false
}: PreSurveySectionProps) {
    const getDraft = useAssessmentStore((state) => state.getDraft);
    const saveDraft = useAssessmentStore((state) => state.saveDraft);

    const previousResponse = getDraft(assessmentId);
    const [answers, setAnswers] = useState<Record<string, string>>(
        previousResponse?.preSurveyAnswers || {}
    );

    const handleChange = (id: string, value: string) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        const requiredQuestions = assessment.preSurvey?.filter(q => q.required) || [];
        const allAnswered = requiredQuestions.every(
            q => answers[q.id] && answers[q.id].trim() !== ''
        );

        if (!allAnswered) {
            Alert.alert("Required Fields", "Please fill all required fields.");
            return;
        }

        // Save to draft store temporarily
        saveDraft(assessmentId, {
            assessmentId,
            assessmentType: assessment.type,
            assessmentTitle: assessment.title,
            preSurveyAnswers: answers,
            sectionAnswers: previousResponse?.sectionAnswers || {},
            status: 'Not Started',
            currentSectionIndex: 0,
        });

        // Pass answers to parent for API submission
        onComplete(answers);
    };

    return (
        <>
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onCancel} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{assessment.title}</Text>
                        <Text style={styles.headerSubtitle}>Assessment</Text>
                    </View>
                </View>
            </View>

            {/* Scrollable Content */}
            <KeyboardSafeContainer
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bottomOffset={20}
                keyboardShouldPersistTaps="handled"
            >
                {/* Questions Section */}
                <View style={styles.questionsSection}>
                    <Text style={styles.sectionTitle}>Please Answer these Questions :</Text>

                    {assessment.preSurvey?.map((question: PreSurveyQuestion, index: number) => (
                        <View key={question.id} style={styles.questionCard}>
                            <Text style={styles.questionText}>
                                {index + 1}. {question.text}
                                {question.required && <Text style={styles.required}> *</Text>}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={question.placeholder}
                                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                value={answers[question.id] || ''}
                                onChangeText={(val) => handleChange(question.id, val)}
                                keyboardType={question.type === 'number' ? 'numeric' : 'default'}
                            />
                        </View>
                    ))}
                </View>

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={onCancel}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitButtonText}>
                            {hasExistingAnswers ? 'Continue' : 'Submit'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardSafeContainer>
        </>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: getSpacing(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: getSpacing(16),
        paddingTop: getSpacing(24),
        paddingBottom: getSpacing(32),
    },
    questionsSection: {
        marginBottom: getSpacing(24),
    },
    sectionTitle: {
        fontSize: getFontSize(18),
        fontWeight: '600',
        color: '#fff',
        marginBottom: getSpacing(24),
    },
    questionCard: {
        borderRadius: 16,
        padding: getSpacing(20),
        marginBottom: getSpacing(16),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    questionText: {
        fontSize: getFontSize(15),
        color: '#fff',
        marginBottom: getSpacing(12),
        fontWeight: '500',
        lineHeight: getFontSize(22),
    },
    required: {
        color: '#EF4444',
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        paddingVertical: getSpacing(8),
        paddingHorizontal: getSpacing(4),
        fontSize: getFontSize(15),
        color: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: getSpacing(24),
        gap: getSpacing(16),
        width: '80%',
        alignSelf: 'center',
    },
    cancelButton: {
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
    cancelButtonText: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#1D548D',
    },
    submitButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        paddingVertical: getSpacing(14),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    submitButtonText: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#fff',
    },
});

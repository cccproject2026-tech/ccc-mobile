import type { AssessmentResponse } from '@/types/assessment.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ==================== Store State ====================
interface AssessmentStoreState {
    draftResponses: Record<string, AssessmentResponse>;
}

// ==================== Store Actions ====================
interface AssessmentStoreActions {
    saveDraft: (assessmentId: string, response: AssessmentResponse) => void;
    getDraft: (assessmentId: string) => AssessmentResponse | null;
    clearDraft: (assessmentId: string) => void;
    updateSectionAnswers: (assessmentId: string, sectionId: string, answers: any) => void;
    updatePreSurveyAnswers: (assessmentId: string, answers: Record<string, string>) => void;
}

// ==================== Store Type ====================
type AssessmentStore = AssessmentStoreState & AssessmentStoreActions;

// ==================== Storage Key ====================
const STORAGE_KEY = 'assessment-drafts';

// ==================== Zustand Store ====================
export const useAssessmentStore = create<AssessmentStore>()(
    persist(
        (set, get) => ({
            // ==================== State ====================
            draftResponses: {},

            // ==================== Actions ====================
            saveDraft: (assessmentId: string, response: AssessmentResponse) => {
                set((state) => ({
                    draftResponses: {
                        ...state.draftResponses,
                        [assessmentId]: {
                            ...response,
                            status: 'Not Started',
                        },
                    },
                }));
            },

            getDraft: (assessmentId: string): AssessmentResponse | null => {
                return get().draftResponses[assessmentId] || null;
            },

            clearDraft: (assessmentId: string) => {
                set((state) => {
                    const newDrafts = { ...state.draftResponses };
                    delete newDrafts[assessmentId];
                    return { draftResponses: newDrafts };
                });
            },

            updateSectionAnswers: (assessmentId: string, sectionId: string, answers: any) => {
                set((state) => {
                    const existingDraft = state.draftResponses[assessmentId];

                    return {
                        draftResponses: {
                            ...state.draftResponses,
                            [assessmentId]: {
                                ...existingDraft,
                                sectionAnswers: {
                                    ...existingDraft?.sectionAnswers,
                                    [sectionId]: answers,
                                },
                            },
                        },
                    };
                });
            },

            updatePreSurveyAnswers: (assessmentId: string, answers: Record<string, string>) => {
                set((state) => {
                    const existingDraft = state.draftResponses[assessmentId];

                    return {
                        draftResponses: {
                            ...state.draftResponses,
                            [assessmentId]: {
                                ...existingDraft,
                                assessmentId,
                                assessmentType: existingDraft?.assessmentType || 'CMA',
                                assessmentTitle: existingDraft?.assessmentTitle || '',
                                preSurveyAnswers: answers,
                                sectionAnswers: existingDraft?.sectionAnswers || {},
                                status: 'Not Started',
                                currentSectionIndex: 0,
                            },
                        },
                    };
                });
            },
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface AssessmentResponse {
    assessmentId: string; // Unique assessment ID
    assessmentType: 'CMA' | 'PMP';
    assessmentTitle: string;
    preSurveyAnswers?: Record<string, string>;
    sectionAnswers: Record<string, any>;
    completedAt?: string;
    status: 'Due' | 'Not Started' | 'Submitted' | 'Completed';
    currentSectionIndex: number;
    meetingDate?: string;
}

interface AssessmentContextType {
    responses: Record<string, AssessmentResponse>;
    saveResponse: (assessmentId: string, response: AssessmentResponse) => Promise<void>;
    getResponse: (assessmentId: string) => AssessmentResponse | null;
    clearResponse: (assessmentId: string) => Promise<void>;
    completeAssessment: (assessmentId: string) => Promise<void>;
    updateMeetingDate: (assessmentId: string, meetingDate: string) => Promise<void>;
    isLoading: boolean;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

const STORAGE_KEY = '@assessment_responses';

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
    const [responses, setResponses] = useState<Record<string, AssessmentResponse>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadResponses();
    }, []);

    const loadResponses = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setResponses(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading responses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveResponse = async (assessmentId: string, response: AssessmentResponse) => {
        try {
            const updatedResponses = {
                ...responses,
                [assessmentId]: response,
            };
            setResponses(updatedResponses);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResponses));
        } catch (error) {
            console.error('Error saving response:', error);
        }
    };

    const getResponse = (assessmentId: string): AssessmentResponse | null => {
        return responses[assessmentId] || null;
    };

    const clearResponse = async (assessmentId: string) => {
        try {
            const updatedResponses = { ...responses };
            delete updatedResponses[assessmentId];
            setResponses(updatedResponses);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResponses));
        } catch (error) {
            console.error('Error clearing response:', error);
        }
    };


    const completeAssessment = async (assessmentId: string) => {
        try {
            const response = responses[assessmentId];
            if (response) {
                const updatedResponse = {
                    ...response,
                    status: 'Completed' as const,
                    completedAt: new Date().toISOString(),
                };
                await saveResponse(assessmentId, updatedResponse);
            }
        } catch (error) {
            console.error('Error completing assessment:', error);
        }
    };

    const updateMeetingDate = async (assessmentId: string, meetingDate: string) => {
        try {
            const response = responses[assessmentId];
            if (response) {
                const updatedResponse = {
                    ...response,
                    meetingDate,
                };
                await saveResponse(assessmentId, updatedResponse);
            }
        } catch (error) {
            console.error('Error updating meeting date:', error);
        }
    };

    return (
        <AssessmentContext.Provider
            value={{
                responses,
                saveResponse,
                getResponse,
                clearResponse,
                completeAssessment,
                updateMeetingDate,
                isLoading,
            }}
        >
            {children}
        </AssessmentContext.Provider>
    );
};

export const useAssessment = () => {
    const context = useContext(AssessmentContext);
    if (!context) {
        throw new Error('useAssessment must be used within AssessmentProvider');
    }
    return context;
};

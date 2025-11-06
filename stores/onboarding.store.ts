// stores/onboarding.store.ts
import { InterestFormData, InterestStatus } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingState {
    // Form data
    interestData: InterestFormData | null;
    interestStatus: InterestStatus | null;
    userId: string | null;
    applicationId: string | null;
    email: string | null;

    // Email verification flow
    isEmailVerified: boolean;
    isPasswordSet: boolean;

    // UI flow state (temporary, not persisted)
    currentStep:
    | 'form'
    | 'submitted'
    | 'approved'
    | 'email-verify'
    | 'password'
    | 'complete';
}

interface OnboardingActions {
    setInterestData: (data: InterestFormData) => void;
    setInterestStatus: (status: InterestStatus) => void;
    setUserId: (userId: string | null) => void;
    setApplicationId: (id: string | null) => void;
    setEmail: (email: string | null) => void;
    setEmailVerified: (verified: boolean) => void;
    setPasswordSet: (set: boolean) => void;
    setCurrentStep: (
        step: OnboardingState['currentStep']
    ) => void;
    reset: () => void;
}

type OnboardingStore = OnboardingState & OnboardingActions;

const initialState: OnboardingState = {
    interestData: null,
    interestStatus: null,
    userId: null,
    applicationId: null,
    email: null,
    isEmailVerified: false,
    isPasswordSet: false,
    currentStep: 'form',
};

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set) => ({
            ...initialState,

            setInterestData: (data) => {
                set({ interestData: data, interestStatus: 'pending', email: data.email });
                console.log('📝 Interest data saved:', data.email);
            },

            setInterestStatus: (status) => {
                set({ interestStatus: status });
                console.log('📊 Interest status updated:', status);
            },

            setUserId: (userId) => {
                set({ userId });
                console.log('👤 User ID set:', userId);
            },

            setApplicationId: (id) => {
                set({ applicationId: id });
                console.log('📋 Application ID set:', id);
            },

            setEmail: (email) => {
                set({ email });
                console.log('📧 Email set:', email);
            },

            setEmailVerified: (verified) => {
                set({ isEmailVerified: verified });
                console.log('✅ Email verified:', verified);
            },

            setPasswordSet: (passwordSet) => {
                set({ isPasswordSet: passwordSet });
                console.log('🔐 Password set:', passwordSet);
            },

            setCurrentStep: (step) => {
                set({ currentStep: step });
                console.log('📍 Current step:', step);
            },

            reset: () => {
                set(initialState);
                console.log('🔄 Onboarding store reset');
            },
        }),
        {
            name: 'onboarding-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                interestData: state.interestData,
                interestStatus: state.interestStatus,
                userId: state.userId,
                applicationId: state.applicationId,
                email: state.email,
                isEmailVerified: state.isEmailVerified,
                isPasswordSet: state.isPasswordSet,
                // Don't persist currentStep (UI state only)
            }),
        }
    )
);

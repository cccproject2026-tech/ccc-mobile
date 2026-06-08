
import { InterestFormData, InterestStatus } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingState {
    
    interestData: InterestFormData | null;
    interestStatus: InterestStatus | null;
    userId: string | null;
    applicationId: string | null;
    email: string | null;

    
    isEmailVerified: boolean;
    isPasswordSet: boolean;

    
    hasProfilePicture: boolean;

    
    currentStep:
    | 'form'
    | 'submitted'
    | 'approved'
    | 'email-verify'
    | 'password'
    | 'complete';
    hasHydrated: boolean;
    /** Prevents welcome-screen resume redirects immediately after logout */
    suppressOnboardingResume: boolean;
}

interface OnboardingActions {
    setInterestData: (data: InterestFormData) => void;
    setInterestStatus: (status: InterestStatus) => void;
    setUserId: (userId: string | null) => void;
    setApplicationId: (id: string | null) => void;
    setEmail: (email: string | null) => void;
    setEmailVerified: (verified: boolean) => void;
    setPasswordSet: (set: boolean) => void;
    setHasProfilePicture: (has: boolean) => void;
    setCurrentStep: (step: OnboardingState['currentStep']) => void;
    reset: () => void;
    /** Clears onboarding progress but keeps tutorial dismissed (e.g. logout). */
    resetOnLogout: () => void;
    clearOnboardingResumeSuppress: () => void;
    setHasHydrated: (hydrated: boolean) => void;
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
    hasProfilePicture: false,
    currentStep: 'form',
    hasHydrated: false,
    suppressOnboardingResume: false,
};

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set) => ({
            ...initialState,

            setInterestData: (data) => {
                set({
                    interestData: data,
                    interestStatus: 'pending',
                    email: data.email,
                    suppressOnboardingResume: false,
                });
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

            
            setHasProfilePicture: (has) => {
                set({ hasProfilePicture: has });
                console.log('📷 Has profile picture:', has);
            },

            setCurrentStep: (step) => {
                set({ currentStep: step });
                console.log('📍 Current step:', step);
            },

            setHasHydrated: (hydrated) => {
                set({ hasHydrated: hydrated });
            },

            reset: () => {
                set(initialState);
                console.log('🔄 Onboarding store reset');
            },

            resetOnLogout: () => {
                set({
                    interestData: null,
                    interestStatus: null,
                    userId: null,
                    applicationId: null,
                    email: null,
                    isEmailVerified: false,
                    isPasswordSet: false,
                    hasProfilePicture: false,
                    currentStep: 'form',
                    hasHydrated: true,
                    suppressOnboardingResume: true,
                });
                console.log('🔄 Onboarding progress cleared on logout');
            },

            clearOnboardingResumeSuppress: () => {
                set({ suppressOnboardingResume: false });
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
                hasProfilePicture: state.hasProfilePicture,
                
                
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

import { InterestFormData, InterestStatus } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingState {
    // Interest form state
    interestStatus: InterestStatus;
    applicationId: string | null;
    interestData: InterestFormData | null;

    // Auth flow state
    email: string | null; // Email for OTP flow
    otpToken: string | null; // Token from OTP verification
    isEmailVerified: boolean;
    isPasswordSet: boolean;
    isProfileComplete: boolean;

    // Timestamps
    lastStatusCheck: number | null;
    submittedAt: number | null;
}

interface OnboardingActions {
    // Interest form actions
    setInterestStatus: (status: InterestStatus) => void;
    setApplicationId: (id: string) => void;
    setInterestData: (data: InterestFormData) => void;
    updateInterestData: (updates: Partial<InterestFormData>) => void;

    // Auth flow actions
    setEmail: (email: string) => void;
    setOtpToken: (token: string | null) => void;
    setEmailVerified: (verified: boolean) => void;
    setPasswordSet: (set: boolean) => void;
    setProfileComplete: (complete: boolean) => void;

    // Utility actions
    updateLastStatusCheck: () => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;

    // Computed getters
    canSendOtp: () => boolean;
    canVerifyOtp: () => boolean;
    canSetPassword: () => boolean;
    canCompleteProfile: () => boolean;
    hasCompleteInterestData: () => boolean;
}

type OnboardingStore = OnboardingState & OnboardingActions;

const initialState: OnboardingState = {
    interestStatus: 'none',
    applicationId: null,
    interestData: null,
    email: null,
    otpToken: null,
    isEmailVerified: false,
    isPasswordSet: false,
    isProfileComplete: false,
    lastStatusCheck: null,
    submittedAt: null,
};

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            // Interest form actions
            setInterestStatus: (status) => {
                set({ interestStatus: status });
                console.log('📝 Interest status:', status);
            },

            setApplicationId: (id) => {
                set({ applicationId: id });
                console.log('📝 Application ID:', id);
            },

            setInterestData: (data) => {
                set({
                    interestData: data,
                    email: data.email, // Store email for later use
                    submittedAt: Date.now(),
                    interestStatus: 'pending',
                });
                console.log('📝 Interest data saved:', data.email);
            },

            updateInterestData: (updates) => {
                const current = get().interestData;
                if (current) {
                    set({
                        interestData: { ...current, ...updates }
                    });
                    console.log('📝 Interest data updated');
                }
            },

            // Auth flow actions
            setEmail: (email) => {
                set({ email });
                console.log('📧 Email set:', email);
            },

            setOtpToken: (token) => {
                set({ otpToken: token });
                console.log('🔑 OTP token stored');
            },

            setEmailVerified: (verified) => {
                set({ isEmailVerified: verified });
                console.log('✅ Email verified:', verified);
            },

            setPasswordSet: (passwordSet) => {
                set({ isPasswordSet: passwordSet });
                console.log('✅ Password set:', passwordSet);
            },

            setProfileComplete: (complete) => {
                set({ isProfileComplete: complete });
                console.log('✅ Profile complete:', complete);
            },

            // Utility actions
            updateLastStatusCheck: () => {
                set({ lastStatusCheck: Date.now() });
            },

            completeOnboarding: () => {
                set({
                    isProfileComplete: true,
                    interestStatus: 'approved',
                });
                console.log('🎉 Onboarding completed!');
            },

            resetOnboarding: () => {
                set(initialState);
                console.log('🔄 Onboarding reset');
            },

            // Computed getters
            canSendOtp: () => {
                const state = get();
                return (
                    state.interestStatus === 'approved' &&
                    !!state.email &&
                    !state.isEmailVerified
                );
            },

            canVerifyOtp: () => {
                const state = get();
                return !!state.email && !state.isEmailVerified;
            },

            canSetPassword: () => {
                const state = get();
                return (
                    state.isEmailVerified &&
                    !!state.otpToken &&
                    !state.isPasswordSet
                );
            },

            canCompleteProfile: () => {
                const state = get();
                return state.isPasswordSet && !state.isProfileComplete;
            },

            hasCompleteInterestData: () => {
                const data = get().interestData;
                if (!data) return false;

                // Check required fields
                return !!(
                    data.firstName &&
                    data.lastName &&
                    data.email &&
                    data.phoneNumber &&
                    data.churches?.length > 0 &&
                    data.title &&
                    data.yearsInMinistry &&
                    data.conference &&
                    data.interests?.length > 0
                );
            },
        }),
        {
            name: 'pastor-onboarding',
            storage: createJSONStorage(() => AsyncStorage),
            // Persist everything except sensitive otpToken
            partialize: (state) => ({
                interestStatus: state.interestStatus,
                applicationId: state.applicationId,
                interestData: state.interestData,
                email: state.email,
                isEmailVerified: state.isEmailVerified,
                isPasswordSet: state.isPasswordSet,
                isProfileComplete: state.isProfileComplete,
                lastStatusCheck: state.lastStatusCheck,
                submittedAt: state.submittedAt,
                // Don't persist otpToken for security
            }),
        }
    )
);

import { useOnboardingStore } from '@/stores/onboarding.store';
import { InterestFormData, InterestStatus } from '@/types';

export function markOnboardingTutorialSeen(): void {
    useOnboardingStore.getState().setHasSeenOnboardingTutorial(true);
}

export type OnboardingTutorialState = {
    hasSeenOnboardingTutorial: boolean;
    hasAccessToken?: boolean;
    interestStatus?: InterestStatus | null;
    email?: string | null;
    userId?: string | null;
    applicationId?: string | null;
    interestData?: InterestFormData | null;
    isEmailVerified?: boolean;
    isPasswordSet?: boolean;
};

export function getOnboardingTutorialState(
    hasAccessToken?: boolean
): OnboardingTutorialState {
    const s = useOnboardingStore.getState();
    return {
        hasSeenOnboardingTutorial: s.hasSeenOnboardingTutorial,
        hasAccessToken,
        interestStatus: s.interestStatus,
        email: s.email,
        userId: s.userId,
        applicationId: s.applicationId,
        interestData: s.interestData,
        isEmailVerified: s.isEmailVerified,
        isPasswordSet: s.isPasswordSet,
    };
}

export function hasOnboardingProgress(state: OnboardingTutorialState): boolean {
    return !!(
        state.interestStatus ||
        state.email ||
        state.userId ||
        state.applicationId ||
        state.interestData ||
        state.isEmailVerified ||
        state.isPasswordSet
    );
}

export function shouldShowOnboardingTutorial(
    state: OnboardingTutorialState
): boolean {
    if (state.hasSeenOnboardingTutorial) return false;
    if (state.hasAccessToken) return false;
    if (state.interestStatus) return false;
    if (state.email) return false;
    if (hasOnboardingProgress(state)) return false;
    return true;
}

type RoleParam = 'pastor' | 'mentor' | 'layleader' | 'seminarian';

export type SkipTutorialRoute = {
    pathname: string;
    params?: Record<string, string>;
};

export function getSkipTutorialDestination(
    role: RoleParam,
    state: OnboardingTutorialState
): SkipTutorialRoute {
    if (state.isPasswordSet) {
        return { pathname: '/(unauthenticated)/login-form' };
    }
    if (state.interestStatus === 'accepted') {
        return { pathname: '/(unauthenticated)/set-password' };
    }
    if (
        state.interestStatus === 'pending' ||
        state.interestStatus === 'new' ||
        state.interestStatus === 'rejected' ||
        state.userId ||
        state.applicationId ||
        state.interestData
    ) {
        return { pathname: '/(unauthenticated)' };
    }
    return { pathname: '/(unauthenticated)/login-form' };
}
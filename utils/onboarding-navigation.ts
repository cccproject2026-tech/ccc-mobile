import { OnboardingNextStep } from '@/types';
import { Router } from 'expo-router';

/**
 * Routes the user to the correct unauthenticated screen based on backend nextStep.
 * Call after persisting onboarding store fields from check-onboarding-status.
 */
export function navigateByOnboardingStep(
    router: Router,
    nextStep: OnboardingNextStep
): void {
    switch (nextStep) {
        case 'pending':
            router.replace('/(unauthenticated)');
            break;
        case 'verify-email':
        case 'set-password':
            router.replace('/(unauthenticated)/set-password');
            break;
        case 'login':
            router.replace('/(unauthenticated)/login-form');
            break;
        case 'rejected':
            router.replace('/(unauthenticated)/application-rejected');
            break;
        default:
            router.replace('/(unauthenticated)');
    }
}

export const ONBOARDING_NOT_FOUND_MESSAGE =
    'We could not find an application associated with this email.';

export function getCheckOnboardingStatusErrorMessage(error: {
    statusCode?: number;
    message?: string;
}): string {
    if (error.statusCode === 404) {
        return ONBOARDING_NOT_FOUND_MESSAGE;
    }
    if (error.statusCode === 0) {
        return 'Network error. Please check your connection and try again.';
    }
    if (error.statusCode && error.statusCode >= 500) {
        return 'Something went wrong on our end. Please try again later.';
    }
    return error.message || 'Unable to check your application status. Please try again.';
}

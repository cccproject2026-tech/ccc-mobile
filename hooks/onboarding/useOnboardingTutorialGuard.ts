import {
    getOnboardingTutorialState,
    getSkipTutorialDestination,
    shouldShowOnboardingTutorial,
} from '@/utils/onboarding-tutorial';
import { storage } from '@/utils/storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

type RoleParam = 'pastor' | 'mentor' | 'layleader' | 'seminarian';

export function useOnboardingTutorialScreenGuard(role: RoleParam = 'pastor') {
    const router = useRouter();

    useEffect(() => {
        const guard = async () => {
            const accessToken = await storage.getAccessToken();
            const tutorialState = getOnboardingTutorialState(!!accessToken);
            if (!shouldShowOnboardingTutorial(tutorialState)) {
                const dest = getSkipTutorialDestination(role, tutorialState);
                router.replace(dest as never);
            }
        };
        guard();
    }, [role, router]);
}
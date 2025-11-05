import { useOnboardingStore } from '@/stores/onboarding.store';
import { useProfileStore } from '@/stores/profile.store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export const useCompleteProfile = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setProfileComplete, completeOnboarding } = useOnboardingStore();
    const { updateProfile } = useProfileStore();

    return useMutation({
        mutationFn: async () => {
            // You might have a specific endpoint for this
            // Or just mark it complete locally
            return Promise.resolve();
        },
        onSuccess: () => {
            setProfileComplete(true);
            completeOnboarding();

            console.log('✅ Profile completed!');

            // Invalidate profile query
            queryClient.invalidateQueries({ queryKey: ['profile'] });

            // Navigate to pastor dashboard
            router.replace('/(pastor)/(tabs)');
        },
        onError: (error: any) => {
            console.error('❌ Complete profile failed:', error.message);
        },
    });
};

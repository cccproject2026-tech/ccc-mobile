import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { SetPasswordRequest } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export const useSetPassword = () => {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const { setPasswordSet } = useOnboardingStore();

    return useMutation({
        mutationFn: (data: SetPasswordRequest) => authService.setPassword(data),
        onSuccess: async (data) => {
            // Auto-login after password set
            await login(data.user, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });

            setPasswordSet(true);

            console.log('✅ Password set and logged in');

            // Navigate to profile completion
            router.replace('/(unauthenticated)/profile');
        },
        onError: (error: any) => {
            console.error('❌ Set password failed:', error.message);
        },
    });
};

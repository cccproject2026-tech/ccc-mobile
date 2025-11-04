// src/hooks/auth/useLogin.ts
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { LoginCredentials } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

export const useLogin = () => {
    const router = useRouter();
    const login = useAuthStore((state) => state.login);
    const isProfileComplete = useOnboardingStore((state) => state.isProfileComplete);

    return useMutation({
        mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
        onSuccess: async (data) => {
            await login(data.user, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });

            console.log('✅ Login successful');

            if (data.user.role === 'pastor') {
                if (isProfileComplete) {
                    router.replace('/(pastor)/(tabs)');
                } else {
                    router.replace('/(unauthenticated)/profile');
                }
            } else if (data.user.role === 'mentor') {
                // router.replace('/(mentor)/(tabs)');
            } else if (data.user.role === 'director') {
                // router.replace('/(director)/(tabs)');
            }
        },
        onError: (error: any) => {
            console.error('❌ Login failed:', error.message);
        },
    });
};

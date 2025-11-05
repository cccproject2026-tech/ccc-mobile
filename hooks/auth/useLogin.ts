// // src/hooks/auth/useLogin.ts
// import { authService } from '@/services/auth.service';
// import { useAuthStore } from '@/stores/auth.store';
// import { useOnboardingStore } from '@/stores/onboarding.store';
// import { LoginCredentials } from '@/types';
// import { useMutation } from '@tanstack/react-query';
// import { useRouter } from 'expo-router';

// export const useLogin = () => {
//     const router = useRouter();
//     const login = useAuthStore((state) => state.login);
//     const isProfileComplete = useOnboardingStore((state) => state.isProfileComplete);

//     return useMutation({
//         mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
//         onSuccess: async (data) => {
//             await login(data.user, {
//                 accessToken: data.accessToken,
//                 refreshToken: data.refreshToken,
//             });

//             console.log('✅ Login successful');

//             if (data.user.role === 'pastor') {
//                 if (isProfileComplete) {
//                     router.replace('/(pastor)/(tabs)');
//                 } else {
//                     router.replace('/(unauthenticated)/profile');
//                 }
//             } else if (data.user.role === 'mentor') {
//                 // router.replace('/(mentor)/(tabs)');
//             } else if (data.user.role === 'director') {
//                 // router.replace('/(director)/(tabs)');
//             }
//         },
//         onError: (error: any) => {
//             console.error('❌ Login failed:', error.message);
//         },
//     });
// };



// // src/hooks/auth/useLogin.ts
// import { authService } from '@/services/auth.service';
// import { useAuthStore } from '@/stores/auth.store';
// import { LoginCredentials } from '@/types';
// import { useMutation } from '@tanstack/react-query';
// import { useRouter } from 'expo-router';

// export const useLogin = () => {
//     const router = useRouter();
//     const { login } = useAuthStore();

//     return useMutation({
//         mutationFn: (credentials: LoginCredentials) => authService.login(credentials),

//         onSuccess: async (response) => {
//             try {
//                 console.log('✅ Login API success');

//                 // Extract from response
//                 const { user, accessToken, refreshToken } = response.data;

//                 // Validate response
//                 if (!user || !accessToken || !refreshToken) {
//                     throw new Error('Invalid login response structure');
//                 }

//                 // Store auth data
//                 await login(user, { accessToken, refreshToken });

//                 console.log('✅ Login complete for:', user.email);
//                 console.log('User role:', user.role);
//                 console.log('User status:', user.status);

//                 // ✅ SIMPLIFIED: Just check status and route accordingly
//                 if (user.role === 'pastor' || user.role === 'pending') {
//                     if (user.status === 'pending' || user.status === 'new') {
//                         // Waiting for approval
//                         console.log('📋 User status pending, showing waiting screen');
//                         router.replace('/(unauthenticated)');
//                     } else {
//                         // Approved - go to dashboard
//                         console.log('✅ User approved, navigating to dashboard');
//                         router.replace('/(pastor)/(tabs)');
//                     }
//                 } else if (user.role === 'mentor') {
//                     router.replace('/(mentor)');
//                 } else if (user.role === 'director') {
//                     router.replace('/(director)/(tabs)');
//                 } else {
//                     // Unknown role
//                     router.replace('/');
//                 }
//             } catch (error) {
//                 console.error('❌ Error in onSuccess:', error);
//                 throw error;
//             }
//         },

//         onError: (error: any) => {
//             console.error('❌ Login failed:', {
//                 message: error.message,
//                 statusCode: error.statusCode,
//                 errors: error.errors,
//             });
//         },
//     });
// };



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

        onSuccess: async (response) => {
            // ✅ FIXED: Extract from response.data (your API structure)
            const { user, accessToken, refreshToken } = response.data;

            // Store auth data
            await login(user, {
                accessToken,
                refreshToken,
            });

            console.log('✅ Login successful for:', user.email);
            console.log('User role:', user.role);

        },

        onError: (error: any) => {
            console.error('❌ Login failed:', error.message);
        },
    });
};

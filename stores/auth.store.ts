// stores/auth.store.ts
import { User } from '@/types/auth.types';
import { storage } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useOnboardingStore } from './onboarding.store';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
}

interface AuthActions {
    // Set user after login
    setUser: (user: User) => void;
    // Logout user
    logout: () => Promise<void>;
    // Initialize from storage on app startup
    initialize: () => Promise<void>;
    // Update user data
    updateUser: (updates: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isInitialized: false,

            setUser: (user) => {
                set({ user, isAuthenticated: true });
                console.log('✅ User authenticated:', user.email);
            },

            logout: async () => {
                try {
                    console.log('🔓 Logging out');
                    // Set state FIRST so root layout and Stack.Protected see logged-out state immediately and redirect
                    set({ user: null, isAuthenticated: false });
                    console.log('✅ Logout complete');

                    // Then clear all storage (async)
                    await storage.clearAll();

                    try {
                        useOnboardingStore.getState().resetOnLogout();
                        console.log('🔄 Onboarding store reset');
                    } catch (err) {
                        console.warn('⚠️ Failed to reset onboarding store:', err);
                    }

                    try {
                        await AsyncStorage.clear();
                        console.log('🧹 AsyncStorage cleared');
                    } catch (err) {
                        console.warn('⚠️ Failed to clear AsyncStorage:', err);
                    }
                } catch (error) {
                    console.error('❌ Logout failed:', error);
                    throw error;
                }
            },

            initialize: async () => {
                try {
                    console.log('🔄 Initializing auth...');
                    // Check if tokens exist in secure storage
                    const tokens = await storage.getTokens();
                    if (tokens?.accessToken) {
                        set({ isInitialized: true, isAuthenticated: true });
                        console.log('✅ Auth initialized with stored tokens');
                    } else {
                        set({
                            isInitialized: true,
                            user: null,
                            isAuthenticated: false,
                        });
                        console.log('✅ Auth initialized - no stored tokens');
                    }
                } catch (error) {
                    console.error('❌ Auth initialization failed:', error);
                    set({
                        isInitialized: true,
                        user: null,
                        isAuthenticated: false,
                    });
                }
            },

            updateUser: (updates) => {
                const currentUser = get().user;
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...updates };
                    set({ user: updatedUser });
                    console.log('✅ User updated');
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist user and auth status, NOT tokens
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                isInitialized: state.isInitialized,
                // Don't persist tokens in AsyncStorage (they're in SecureStore)
            }),
        }
    )
);

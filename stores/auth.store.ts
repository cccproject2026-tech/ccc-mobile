import { User } from '@/types/auth.types';
import { normalizeApiUser } from '@/utils/userRole';
import { storage } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useOnboardingStore } from './onboarding.store';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
    hasHydrated: boolean;
}

interface AuthActions {
    setUser: (user: User) => void;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
    updateUser: (updates: Partial<User>) => void;
    setHasHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

function isValidSessionUser(user: User | null | undefined): user is User {
    if (!user) return false;
    const normalized = normalizeApiUser(user);
    return Boolean(normalized.id && normalized.role);
}

function clearedAuthState(): Pick<AuthState, 'user' | 'isAuthenticated' | 'isInitialized'> {
    return {
        isInitialized: true,
        user: null,
        isAuthenticated: false,
    };
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isInitialized: false,
            hasHydrated: false,

            setUser: (user) => {
                const normalizedUser = normalizeApiUser(user);
                set({ user: normalizedUser, isAuthenticated: true });
                console.log('✅ User authenticated:', normalizedUser.email, normalizedUser.role);
            },

            setHasHydrated: () => {
                set({ hasHydrated: true });
            },

            logout: async () => {
                try {
                    console.log('🔓 Logging out');
                    set({ user: null, isAuthenticated: false });

                    try {
                        useOnboardingStore.getState().resetOnLogout();
                        console.log('🔄 Onboarding store reset');
                    } catch (err) {
                        console.warn('⚠️ Failed to reset onboarding store:', err);
                    }

                    console.log('✅ Logout complete');

                    await storage.clearAll();

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

                    const tokens = await storage.getTokens();
                    const storedUser = await storage.getUserData();

                    if (tokens?.accessToken && isValidSessionUser(storedUser)) {
                        const normalizedUser = normalizeApiUser(storedUser);
                        set({
                            isInitialized: true,
                            isAuthenticated: true,
                            user: normalizedUser,
                        });
                        console.log('✅ Auth initialized with stored tokens and user');
                        return;
                    }

                    if (tokens?.accessToken || storedUser) {
                        console.warn(
                            '⚠️ Stale or incomplete session — clearing SecureStore',
                        );
                        await storage.clearAll();
                    }

                    set(clearedAuthState());
                    console.log('✅ Auth initialized - no valid session');
                } catch (error) {
                    console.error('❌ Auth initialization failed:', error);
                    set(clearedAuthState());
                }
            },

            updateUser: (updates) => {
                const currentUser = get().user;
                if (currentUser) {
                    const updatedUser = normalizeApiUser({ ...currentUser, ...updates });
                    set({ user: updatedUser });
                    console.log('✅ User updated');
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated && !!state.user,
                isInitialized: state.isInitialized,
            }),
            onRehydrateStorage: () => (state) => {
                if (!state) return;

                if (state.user) {
                    state.user = normalizeApiUser(state.user);
                }

                if (state.isAuthenticated && !state.user) {
                    console.warn(
                        '⚠️ Sanitizing rehydrated auth: isAuthenticated without user',
                    );
                    state.isAuthenticated = false;
                    state.user = null;
                }

                if (!state.isAuthenticated && state.user) {
                    console.warn(
                        '⚠️ Sanitizing rehydrated auth: user present without isAuthenticated',
                    );
                    state.user = null;
                }

                // Always re-validate SecureStore on cold start before routing.
                state.isInitialized = false;
                state.setHasHydrated();
            },
        }
    )
);

import { AuthTokens, PastorProfile, User } from '@/types';
import { storage } from '@/utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
    user: User | PastorProfile | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
}

interface AuthActions {
    setUser: (user: User | PastorProfile) => void;
    setTokens: (tokens: AuthTokens) => void;
    login: (user: User | PastorProfile, tokens: AuthTokens) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User | PastorProfile>) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
    user: null,
    tokens: null,
    isAuthenticated: false,
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setUser: (user) => {
                set({ user, isAuthenticated: true });
                console.log('✅ User set:', user.email);
            },

            setTokens: (tokens) => {
                set({ tokens });
                console.log('✅ Tokens set in store');
            },

            login: async (user, tokens) => {
                try {
                    console.log('📝 Starting login process...');
                    console.log('User:', user.email);
                    console.log('Tokens:', {
                        accessToken: tokens.accessToken?.substring(0, 20) + '...',
                        refreshToken: tokens.refreshToken?.substring(0, 20) + '...'
                    });

                    // ✅ Validate tokens are strings
                    if (typeof tokens.accessToken !== 'string' || typeof tokens.refreshToken !== 'string') {
                        throw new Error('Tokens must be strings');
                    }

                    // Store in secure storage
                    await storage.setTokens(tokens.accessToken, tokens.refreshToken);
                    await storage.setUserData(user);

                    // Update store
                    set({
                        user,
                        tokens,
                        isAuthenticated: true,
                    });

                    console.log('✅ Login successful:', user.email);
                } catch (error) {
                    console.error('❌ Login failed:', error);
                    throw error;
                }
            },

            logout: async () => {
                try {
                    console.log('🔓 Starting logout...');

                    // Clear secure storage
                    await storage.clearAll();

                    // Reset store
                    set(initialState);

                    console.log('✅ Logout successful');
                } catch (error) {
                    console.error('❌ Logout failed:', error);
                    throw error;
                }
            },

            updateUser: (updates) => {
                const currentUser = get().user;
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...updates };

                    // Update secure storage (async, but don't wait)
                    storage.setUserData(updatedUser).catch(err =>
                        console.error('Error updating user in storage:', err)
                    );

                    // Update store
                    set({ user: updatedUser });

                    console.log('✅ User updated');
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // ✅ Only persist user and auth status, NOT tokens (security)
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                // Don't persist tokens in AsyncStorage
            }),
        }
    )
);

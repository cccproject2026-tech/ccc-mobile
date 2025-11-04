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
            },

            setTokens: (tokens) => {
                set({ tokens });
            },

            login: async (user, tokens) => {
                // Store in secure storage
                await storage.setTokens(tokens.accessToken, tokens.refreshToken);
                await storage.setUserData(user);

                // Update store
                set({
                    user,
                    tokens,
                    isAuthenticated: true
                });

                console.log('✅ Login successful:', user.email);
            },

            logout: async () => {
                // Clear secure storage
                await storage.clearAll();

                // Reset store
                set(initialState);

                console.log('✅ Logout successful');
            },

            updateUser: (updates) => {
                const currentUser = get().user;
                if (currentUser) {
                    const updatedUser = { ...currentUser, ...updates };

                    // Update secure storage
                    storage.setUserData(updatedUser);

                    // Update store
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
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

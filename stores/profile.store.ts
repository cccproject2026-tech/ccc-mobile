import { ChurchInfo, PastorProfile } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ProfileState {
    profile: PastorProfile | null;
    isLoading: boolean;
    lastFetchedAt: number | null;
}

interface ProfileActions {
    setProfile: (profile: PastorProfile) => void;
    updateProfile: (updates: Partial<PastorProfile>) => void;
    addChurch: (church: ChurchInfo) => void;
    updateChurch: (churchId: string, updates: Partial<ChurchInfo>) => void;
    removeChurch: (churchId: string) => void;
    clearProfile: () => void;
    setLoading: (loading: boolean) => void;
    needsRefresh: () => boolean;
}

type ProfileStore = ProfileState & ProfileActions;

const initialState: ProfileState = {
    profile: null,
    isLoading: false,
    lastFetchedAt: null,
};

export const useProfileStore = create<ProfileStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setProfile: (profile) => {
                set({
                    profile,
                    lastFetchedAt: Date.now(),
                    isLoading: false,
                });
                console.log('✅ Profile loaded:', profile.email);
            },

            updateProfile: (updates) => {
                const current = get().profile;
                if (current) {
                    const updatedProfile = { ...current, ...updates };
                    set({
                        profile: updatedProfile,
                        lastFetchedAt: Date.now(),
                    });
                    console.log('✅ Profile updated');
                }
            },

            addChurch: (church) => {
                const current = get().profile;
                if (current) {
                    const updatedProfile = {
                        ...current,
                        churches: [...current.churches, church],
                    };
                    set({
                        profile: updatedProfile,
                        lastFetchedAt: Date.now(),
                    });
                    console.log('✅ Church added:', church.churchName);
                }
            },

            updateChurch: (churchId, updates) => {
                const current = get().profile;
                if (current) {
                    const updatedChurches = current.churches.map(church =>
                        church.id === churchId ? { ...church, ...updates } : church
                    );
                    set({
                        profile: { ...current, churches: updatedChurches },
                        lastFetchedAt: Date.now(),
                    });
                    console.log('✅ Church updated:', churchId);
                }
            },

            removeChurch: (churchId) => {
                const current = get().profile;
                if (current) {
                    const updatedChurches = current.churches.filter(
                        church => church.id !== churchId
                    );
                    set({
                        profile: { ...current, churches: updatedChurches },
                        lastFetchedAt: Date.now(),
                    });
                    console.log('✅ Church removed:', churchId);
                }
            },

            clearProfile: () => {
                set(initialState);
                console.log('🗑️ Profile cleared');
            },

            setLoading: (loading) => {
                set({ isLoading: loading });
            },

            needsRefresh: () => {
                const lastFetched = get().lastFetchedAt;
                if (!lastFetched) return true;

                const FIVE_MINUTES = 5 * 60 * 1000;
                return Date.now() - lastFetched > FIVE_MINUTES;
            },
        }),
        {
            name: 'profile-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                profile: state.profile,
                lastFetchedAt: state.lastFetchedAt,
            }),
        }
    )
);

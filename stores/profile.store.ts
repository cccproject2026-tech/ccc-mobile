import { create } from 'zustand';

interface ProfileUIStore {
    
    isEditingProfile: boolean;
    setIsEditingProfile: (editing: boolean) => void;
    selectedChurchId: string | null;
    setSelectedChurchId: (id: string | null) => void;
    showWelcomeModal: boolean;
    setShowWelcomeModal: (show: boolean) => void;
}

export const useProfileUIStore = create<ProfileUIStore>((set) => ({
    isEditingProfile: false,
    setIsEditingProfile: (editing) => set({ isEditingProfile: editing }),
    selectedChurchId: null,
    setSelectedChurchId: (id) => set({ selectedChurchId: id }),
    showWelcomeModal: false,
    setShowWelcomeModal: (show) => set({ showWelcomeModal: show }),
}));

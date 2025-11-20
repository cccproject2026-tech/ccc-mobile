import { grantService } from '@/services/grant.service';
import {
    GrantFormResponse,
    MicrograntApplication,
    MicrograntApplicationDetail
} from '@/types/grant.type';
import { create } from 'zustand';

interface GrantStore {
    // State
    form: GrantFormResponse | null;
    applications: MicrograntApplication[];
    currentApplication: MicrograntApplicationDetail | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    // Actions
    fetchGrantForm: () => Promise<void>;
    fetchApplications: (status?: string) => Promise<void>;
    fetchApplicationById: (applicationId: string) => Promise<void>;
    clearCurrentApplication: () => void;
    resetError: () => void;
    reset: () => void;
}

const initialState = {
    form: null,
    applications: [],
    currentApplication: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
};

export const useGrantStore = create<GrantStore>((set, get) => ({
    ...initialState,

    /**
     * Fetch the grant application form structure
     */
    fetchGrantForm: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await grantService.getGrantForm();
            set({
                form: response,
                isLoading: false
            });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to fetch grant form';
            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
        }
    },

    /**
     * Fetch all applications with optional status filter
     */
    fetchApplications: async (status?: string) => {
        set({ isLoading: true, error: null });
        try {
            const applications = await grantService.getApplications(status);
            set({
                applications,
                isLoading: false
            });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to fetch applications';
            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
        }
    },

    /**
     * Fetch a single application by ID
     */
    fetchApplicationById: async (applicationId: string) => {
        set({ isLoading: true, error: null });
        try {
            const applicationDetail = await grantService.getApplication(applicationId);
            set({
                currentApplication: applicationDetail,
                isLoading: false
            });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to fetch application';
            set({
                error: errorMessage,
                isLoading: false
            });
            throw error;
        }
    },

    /**
     * Clear current application from state
     */
    clearCurrentApplication: () => {
        set({ currentApplication: null });
    },

    /**
     * Reset error state
     */
    resetError: () => {
        set({ error: null });
    },

    /**
     * Reset entire store to initial state
     */
    reset: () => {
        set(initialState);
    },
}));

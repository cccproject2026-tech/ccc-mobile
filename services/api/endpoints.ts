import { UserRole } from "@/types";

export const ENDPOINTS = {
    // Authentication (Unauthenticated routes)
    AUTH: {
        LOGIN: '/auth/login',
        SEND_OTP: '/auth/send-otp',
        VERIFY_OTP: '/auth/verify-otp',
        SET_PASSWORD: '/auth/set-password',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        REFRESH_TOKEN: '/auth/refresh-token',
        LOGOUT: '/auth/logout',
    },

    // Users
    USERS: {
        GET_ALL_USERS: (role?: UserRole) => `/users?role=${role}`,
        GET_USER: (userId: string) => `/users/${userId}`,
        UPDATE_USER: (userId: string) => `/users/${userId}`,
        CHECK_STATUS: (userId: string) => `/users/check-status/${userId}`,
        GET_INTERESTS: (email: string) => `/interests/by-email/${email}`,
        UPDATE_INTERESTS: (email: string) => `/interests/by-email/${email}`,
        GET_PROGRESS: (userId: string) => `/progress/${userId}`,
    },

    // Pastor Onboarding (if separate from auth)
    ONBOARDING: {
        SUBMIT_INTEREST: '/interests',
        CHECK_STATUS: (userId: string) => `/users/check-status/${userId}`,
    },

    // Profile (Authenticated routes)
    PROFILE: {
        UPDATE_PROFILE: '/users/me',
        UPLOAD_AVATAR: '/users/me/avatar',
    },

    GRANT: {
        GET_FORM: '/microgrant/form',
        APPLY_GRANT: '/microgrant/apply'
    },

    APPOINTMENTS: {
        GET: (userId: string) => `appointments/user/${userId}`,
        CREATE: '/appointments',
        GET_BY_MENTOR: (mentorId: string) => `/appointments/mentor/${mentorId}`,
        UPDATE: (appointmentId: string) => `/appointments/${appointmentId}`
    }
} as const;

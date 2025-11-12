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

    // Home
    HOME: {
        MENTEES: '/home/mentees',
        MENTORS: '/home/mentors',
        GET_MENTOR_BY_EMAIL: (email: string) => `/home/mentor/${email}`,
        GET_MENTEE_BY_EMAIL: (email: string) => `/home/mentee/${email}`,
    },

    // Profile (Authenticated routes)
    PROFILE: {
        UPDATE_PROFILE: '/users/me',
        UPLOAD_AVATAR: '/users/me/avatar',
    },

    // Assessments
    ASSESSMENTS: {
        GET_ASSESSMENTS: '/assessment',
        GET_ASSESSMENT_BY_ID: (assessmentId: string) => `/assessment/${assessmentId}`,
        ASSIGN_ASSESSMENT: (assessmentId: string) => `/assessment/${assessmentId}/assign`,
        CREATE_ASSESSMENT: '/assessment',
        SUBMIT_ASSESSMENT_ANSWERS: (id: string) => `/assessment/${id}/answers`,
        SUBMIT_ASSESSMENT_PRESURVEY: (id: string) => `/assessment/${id}/pre-survey`,
        FETCH_ANSWERS: (assessmentId: string, userId: string) =>
            `/assessment/${assessmentId}/answers/${userId}`,
        DELETE_ASSESSMENT: (assessmentId: string) => `/assessment/${assessmentId}`,
        UPDATE_INSTRUCTIONS: (assessmentId: string) => `/assessment/${assessmentId}/instructions`,
    },

    GRANT: {
        GET_FORM: '/microgrant/form',
        APPLY_GRANT: '/microgrant/apply',
        GET_APPLICATIONS: (status?: string) => status ? `/microgrant/applications?status=${status}` : '/microgrant/applications',
        GET_APPLICATION: (applicationId: string) => `/microgrant/application/${applicationId}`,
    },

    APPOINTMENTS: {
        GET: (userId: string) => `/appointments/user/${userId}`,
        CREATE: '/appointments',
        GET_BY_MENTOR: (mentorId: string) => `/appointments/mentor/${mentorId}`,
        UPDATE: (appointmentId: string) => `/appointments/${appointmentId}`
    },

    ROADMAPS: {
        GET_ALL: '/roadmaps',
        CREATE: '/roadmaps',
    },

    INTERESTS: {
        GET_ALL: '/interests',
        GET_METADATA: '/interests/metadata',
        UPDATE_STATUS: (id: string) => `/interests/request/${id}`,
    }
} as const;

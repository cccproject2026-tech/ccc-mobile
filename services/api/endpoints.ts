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
        GET_USER: (userId: string) => `/users/${userId}`,
        CHECK_STATUS: (userId: string) => `/users/check-status/${userId}`,
        GET_INTERESTS: (email: string) => `/interests/by-email/${email}`
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
        DELETE_ASSESSMENT: (assessmentId: string) => `/assessment/${assessmentId}`,
        UPDATE_INSTRUCTIONS: (assessmentId: string) => `/assessment/${assessmentId}/instructions`,
    },
} as const;

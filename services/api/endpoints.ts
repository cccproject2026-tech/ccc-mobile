export const ENDPOINTS = {
    // Authentication (Unauthenticated routes)
    AUTH: {
        LOGIN: '/login',
        SEND_OTP: '/send-otp',
        VERIFY_OTP: '/verify-otp',
        SET_PASSWORD: '/set-password',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
        REFRESH_TOKEN: '/refresh-token',
        LOGOUT: '/logout',
    },

    // Users
    USERS: {
        GET_USER: (userId: string) => `/users/${userId}`,
    },

    // Pastor Onboarding (if separate from auth)
    ONBOARDING: {
        SUBMIT_INTEREST: '/interest',
        CHECK_STATUS: (applicationId: string) => `/pastor/onboarding/status/${applicationId}`,
    },

    // Profile (Authenticated routes)
    PROFILE: {
        UPDATE_PROFILE: '/users/me',
        UPLOAD_AVATAR: '/users/me/avatar',
    },
} as const;

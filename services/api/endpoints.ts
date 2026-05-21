import { UserRole } from "@/types";

export const ENDPOINTS = {
  // Authentication (Unauthenticated routes)
  AUTH: {
    LOGIN: "/auth/login",
    SEND_OTP: "/auth/send-otp",
    VERIFY_OTP: "/auth/verify-otp",
    SET_PASSWORD: "/auth/set-password",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh-token",
    LOGOUT: "/auth/logout",
    CHECK_ONBOARDING_STATUS: "/auth/check-onboarding-status",
  },

  // Users
  USERS: {
    GET_ALL_USERS: (role?: UserRole) => `/users?role=${role}`,
    GET_USER: (userId: string) => `/users/${userId}`,
    UPDATE_USER: (userId: string) => `/users/${userId}`,
    MARK_COMPLETE: (userId: string) => `/users/${userId}/mark-completed`,
    ISSUE_CERTIFICATE: (userId: string) => `/users/${userId}/issue-certificate`,
    CHECK_STATUS: (userId: string) => `/users/check-status/${userId}`,
    GET_INTERESTS: (email: string) => `/interests/by-email/${email}`,
    UPDATE_INTERESTS: (email: string) => `/interests/by-email/${email}`,
    GET_PROGRESS: (userId: string) => `/progress/${userId}`,
    UPDATE_PROFILE_PICTURE: (userId: string) =>
      `/users/${userId}/profile-picture`,
    GET_DOCUMENTS: (userId: string) => `/users/${userId}/documents`,
    UPLOAD_DOCUMENT: (userId: string) => `/users/${userId}/documents`,
    DELETE_DOCUMENT: (userId: string) => `/users/${userId}/documents`,
    GET_NOTIFICATIONS: (userId: string) =>
      `/home/notifications?userId=${userId}`,
    NOTES: (userId: string) => `/users/${userId}/notes`,
    NOTE_BY_ID: (userId: string, noteId: string) =>
      `/users/${userId}/notes/${noteId}`,
  },

  // Pastor Onboarding (if separate from auth)
  ONBOARDING: {
    SUBMIT_INTEREST: "/interests",
    CHECK_STATUS: (userId: string) => `/users/check-status/${userId}`,
  },

  MENTORS: {
    GET_ASSIGNED_MENTORS: (menteeId: string) => `/users/${menteeId}/assigned`,
    GET_ALL_MENTORS: "/users?role=mentor",
  },
  MENTEES: {
    GET_ASSIGNED_MENTEES: (mentorId: string) => `/users/${mentorId}/assigned`,
    GET_ALL_MENTEES: "/users?role=pastor",
  },
  // Home
  HOME: {
    MENTEES: "/home/mentees",
    MENTORS: "/home/mentors",
    REGISTER_DEVICE_TOKEN: "/home/device-token",
    GET_MENTOR_BY_EMAIL: (email: string) => `/home/mentor/${email}`,
    GET_MENTEE_BY_EMAIL: (email: string) => `/home/mentee/${email}`,
  },

  // Profile (Authenticated routes)
  PROFILE: {
    UPDATE_PROFILE: "/users/me",
    UPLOAD_AVATAR: "/users/me/avatar",
  },

  // Assessments
  ASSESSMENTS: {
    GET_ASSESSMENTS: "/assessment",
    GET_ASSESSMENT_BY_ID: (assessmentId: string) =>
      `/assessment/${assessmentId}`,
    ASSIGN_ASSESSMENT: (assessmentId: string) =>
      `/assessment/${assessmentId}/assign`,
    CREATE_ASSESSMENT: "/assessment",
    SUBMIT_ASSESSMENT_ANSWERS: (id: string) => `/assessment/${id}/answers`,
    SUBMIT_ASSESSMENT_PRESURVEY: (id: string) => `/assessment/${id}/pre-survey`,
    FETCH_ANSWERS: (assessmentId: string, userId: string) =>
      `/assessment/${assessmentId}/answers/${userId}`,
    SEND_RECOMMENDATION: (assessmentId: string) =>
      `/assessment/${assessmentId}/send-recommendation`,
    DELETE_ASSESSMENT: "/assessment",
    UPDATE_INSTRUCTIONS: (assessmentId: string) =>
      `/assessment/${assessmentId}/instructions`,
  },

  GRANT: {
    GET_FORM: "/microgrant/form",
    APPLY_GRANT: "/microgrant/apply",
    CHECK_APPLICATION: (userId: string) =>
      `/microgrant/application/check/${userId}`,
    GET_APPLICATIONS: (status?: string) =>
      status
        ? `/microgrant/applications?status=${status}`
        : "/microgrant/applications",
    GET_APPLICATION: (applicationId: string) =>
      `/microgrant/application/${applicationId}`,
  },

  APPOINTMENTS: {
    GET: (userId: string) => `/appointments/user/${userId}`,
    CREATE: "/appointments",
    GET_BY_MENTOR: (mentorId: string) => `/appointments/mentor/${mentorId}`,
    UPDATE: (appointmentId: string) => `/appointments/${appointmentId}`,
    GET_WEEKLY_AVAILABILITY: (mentorId: string) =>
      `/appointments/availability/${mentorId}`,
    GET_MONTHLY_AVAILABILITY: (mentorId: string, month: number, year: number) =>
      `/appointments/availability/${mentorId}/month?month=${month}&year=${year}`,
    SET_AVAILABILITY: "/appointments/availability",
    RESCHEDULE: (appointmentId: string) =>
      `/appointments/${appointmentId}/reschedule`,
    CANCEL: (appointmentId: string) =>
      `/appointments/${appointmentId}/cancel`,
  },

  ROADMAPS: {
    GET_ALL: "/roadmaps",
    CREATE: "/roadmaps",
    UPDATE: (roadmapId: string) => `/roadmaps/${roadmapId}`,
    GET_SESSIONS: (userId: string) => `/roadmaps/sessions/${userId}`,
    COMPLETE_SESSION: "/roadmaps/complete-session",
    REDO_SESSION: "/roadmaps/redo-session",
    ADD_COMMENT: (roadmapId: string) => `/roadmaps/${roadmapId}/comments`,
    GET_COMMENTS: (roadmapId: string, userId: string) =>
      `/roadmaps/${roadmapId}/comments?userId=${userId}`,
    SUBMIT_QUERY: (roadmapId: string) => `/roadmaps/${roadmapId}/queries`,
    GET_QUERIES: (roadmapId: string, userId: string) =>
      `/roadmaps/${roadmapId}/queries?userId=${userId}`,
    REPLY_QUERY: (roadmapId: string, queryId: string) =>
      `/roadmaps/${roadmapId}/queries/${queryId}/reply`,
    CREATE_NESTED: (roadmapId: string) => `/roadmaps/${roadmapId}/nested`,
  },

  INTERESTS: {
    GET_ALL: "/interests",
    GET_METADATA: "/interests/metadata",
    UPDATE_STATUS: (id: string) => `/interests/request/${id}`,
  },

  // Progress
  PROGRESS: {
    GET: (userId: string) => `/progress/${userId}`,
    ASSIGN_ASSESSMENT: "/progress/assign-assessment",
    ASSIGN_ROADMAP: "/progress/assign-roadmap",
    FINAL_COMMENTS: "/progress/final-comments",
    GET_FINAL_COMMENTS: (userId: string) =>
      `/progress/${userId}/final-comments`,
  },
} as const;

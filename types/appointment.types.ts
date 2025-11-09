export type AppointmentPlatform = 'zoom' | 'google_meet' | 'teams' | 'phone' | 'in_person';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface CreateAppointmentPayload {
    userId: string; // MongoId - REQUIRED
    mentorId: string; // MongoId - REQUIRED
    meetingDate: string; // ISO Date - REQUIRED
    platform: AppointmentPlatform; // REQUIRED
    meetingLink?: string; // OPTIONAL
    notes?: string; // OPTIONAL
}

export interface UpdateAppointmentPayload {
    meetingDate?: string;
    platform?: AppointmentPlatform;
    meetingLink?: string;
    notes?: string;
    status?: AppointmentStatus;
}

export interface Appointment {
    id: string;
    userId: string;
    mentorId: string;
    meetingDate: string; // ISO Date
    endTime: string; // ISO Date
    platform: AppointmentPlatform;
    meetingLink?: string;
    notes?: string;
    status: AppointmentStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface AppointmentResponse {
    success: boolean;
    message: string;
    data: Appointment | Appointment[];
}

export interface UseAppointmentsState {
    appointments: Appointment[];
    currentAppointment: Appointment | null;
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    error: string | null;
    success: boolean;
}

export interface AppointmentFilter {
    userId?: string;
    mentorId?: string;
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
}

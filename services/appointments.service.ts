import {
    Appointment,
    AppointmentResponse,
    CreateAppointmentPayload,
    UpdateAppointmentPayload,
} from '../types/appointment.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const appointmentService = {
    /**
     * Fetch all appointments for a specific user
     */
    getUserAppointments: async (userId: string): Promise<Appointment[]> => {
        try {
            const response = await apiClient.get<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.GET(userId)
            );
            return Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];
        } catch (error) {
            console.error('Error fetching user appointments:', error);
            throw error;
        }
    },

    /**
     * Fetch all appointments for a specific mentor
     */
    getMentorAppointments: async (mentorId: string): Promise<Appointment[]> => {
        try {
            const response = await apiClient.get<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.GET_BY_MENTOR(mentorId)
            );
            return Array.isArray(response.data.data)
                ? response.data.data
                : [response.data.data];
        } catch (error) {
            console.error('Error fetching mentor appointments:', error);
            throw error;
        }
    },

    /**
     * Create a new appointment
     */
    createAppointment: async (
        payload: CreateAppointmentPayload
    ): Promise<Appointment> => {
        try {
            const response = await apiClient.post<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.CREATE,
                payload
            );
            return Array.isArray(response.data.data)
                ? response.data.data[0]
                : response.data.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            throw error;
        }
    },

    /**
     * Update an existing appointment
     */
    updateAppointment: async (
        appointmentId: string,
        payload: UpdateAppointmentPayload
    ): Promise<Appointment> => {
        try {
            const response = await apiClient.patch<AppointmentResponse>(
                ENDPOINTS.APPOINTMENTS.UPDATE(appointmentId),
                payload
            );
            return Array.isArray(response.data.data)
                ? response.data.data[0]
                : response.data.data;
        } catch (error) {
            console.error('Error updating appointment:', error);
            throw error;
        }
    },

    /**
     * Build appointment payload with validation
     */
    buildCreatePayload: (
        userId: string,
        mentorId: string,
        meetingDate: string,
        platform: string,
        meetingLink?: string,
        notes?: string
    ): CreateAppointmentPayload => {
        return {
            userId,
            mentorId,
            meetingDate,
            platform: platform as any,
            ...(meetingLink && { meetingLink }),
            ...(notes && { notes }),
        };
    },

    /**
     * Format appointment date for display
     */
    formatAppointmentDate: (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC',
        });
    },

    /**
     * Check if appointment is upcoming
     */
    isUpcoming: (meetingDate: string): boolean => {
        return new Date(meetingDate) > new Date();
    },

    /**
     * Calculate appointment duration in minutes
     */
    calculateDuration: (startTime: string, endTime: string): number => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return Math.round((end.getTime() - start.getTime()) / 60000);
    },
};

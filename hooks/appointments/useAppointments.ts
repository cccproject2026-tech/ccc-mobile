import { appointmentService } from '@/services/appointments.service';
import {
    Appointment,
    AppointmentStatus,
    CreateAppointmentPayload,
    UpdateAppointmentPayload,
} from '@/types/appointment.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface UseAppointmentsOptions {
    userId?: string;
    mentorId?: string;
    onCreateSuccess?: (appointment: Appointment) => void;
    onCreateError?: (error: Error) => void;
    onUpdateSuccess?: (appointment: Appointment) => void;
    onUpdateError?: (error: Error) => void;
}

export const useAppointments = (options?: UseAppointmentsOptions) => {
    const { userId, mentorId, onCreateSuccess, onCreateError, onUpdateSuccess, onUpdateError } = options || {};
    const queryClient = useQueryClient();

    // Fetch user appointments
    const userQuery = useQuery({
        queryKey: ['appointments', 'user', userId],
        queryFn: () => appointmentService.getUserAppointments(userId!),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Fetch mentor appointments
    const mentorQuery = useQuery({
        queryKey: ['appointments', 'mentor', mentorId],
        queryFn: () => appointmentService.getMentorAppointments(mentorId!),
        enabled: !!mentorId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Create appointment
    const createMutation = useMutation({
        mutationFn: (payload: CreateAppointmentPayload) =>
            appointmentService.createAppointment(payload),
        onSuccess: (newAppointment) => {
            // Refresh the data after creating
            queryClient.invalidateQueries({
                queryKey: ['appointments']
            });
            queryClient.invalidateQueries({
                queryKey: ['weekly-availability']
            });
            queryClient.invalidateQueries({
                queryKey: ['monthly-availability']
            });

            onCreateSuccess?.(newAppointment);
        },
        onError: (error: Error) => {
            console.error('Failed to create appointment:', error);
            onCreateError?.(error);
        },
    });

    // Update appointment
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateAppointmentPayload }) =>
            appointmentService.updateAppointment(id, payload),
        onSuccess: (updatedAppointment) => {
            // Refresh the data after updating
            queryClient.invalidateQueries({
                queryKey: ['appointments']
            });

            onUpdateSuccess?.(updatedAppointment);
        },
        onError: (error: Error) => {
            console.error('Failed to update appointment:', error);
            onUpdateError?.(error);
        },
    });

    // Get the right data
    const appointments = userId ? (userQuery.data || []) : (mentorQuery.data || []);
    const isLoading = userId ? userQuery.isLoading : mentorQuery.isLoading;
    const isError = userId ? userQuery.isError : mentorQuery.isError;
    const error = userId ? userQuery.error : mentorQuery.error;

    // Simple filter helpers
    const getAppointmentsByStatus = (status: AppointmentStatus) => {
        return appointments.filter(apt => apt.status === status);
    };

    const getAppointmentsByDate = (date: string) => {
        return appointments.filter(apt => apt.meetingDate.split('T')[0] === date);
    };

    const getUpcomingAppointments = () => {
        return appointments.filter(apt => appointmentService.isUpcoming(apt.meetingDate));
    };

    const getPastAppointments = () => {
        return appointments.filter(apt => !appointmentService.isUpcoming(apt.meetingDate));
    };

    return {
        // Data
        appointments,
        isLoading,
        isError,
        error,

        // Actions
        createAppointment: createMutation.mutateAsync,
        updateAppointment: (id: string, payload: UpdateAppointmentPayload) =>
            updateMutation.mutateAsync({ id, payload }),

        // Status
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,

        // Filters
        getAppointmentsByStatus,
        getAppointmentsByDate,
        getUpcomingAppointments,
        getPastAppointments,

        // Refetch
        refetch: userId ? userQuery.refetch : mentorQuery.refetch,
    };
};

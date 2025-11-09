import { appointmentService } from '@/services/appointments.service';
import {
    Appointment,
    CreateAppointmentPayload,
    UpdateAppointmentPayload,
} from '@/types/appointment.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAppointments = (userId?: string, mentorId?: string) => {
    const queryClient = useQueryClient();

    // Fetch user appointments (for pastors)
    const userQuery = useQuery({
        queryKey: ['appointments', 'user', userId],
        queryFn: () => appointmentService.getUserAppointments(userId!),
        enabled: !!userId,
    });

    // Fetch mentor appointments (for mentors)
    const mentorQuery = useQuery({
        queryKey: ['appointments', 'mentor', mentorId],
        queryFn: () => appointmentService.getMentorAppointments(mentorId!),
        enabled: !!mentorId,
    });

    // Create appointment
    const createMutation = useMutation({
        mutationFn: (payload: CreateAppointmentPayload) =>
            appointmentService.createAppointment(payload),
        onSuccess: (newApt) => {
            // Update the relevant cache
            if (userId) {
                queryClient.setQueryData(
                    ['appointments', 'user', userId],
                    (old: Appointment[] = []) => [...old, newApt]
                );
            }
            if (mentorId) {
                queryClient.setQueryData(
                    ['appointments', 'mentor', mentorId],
                    (old: Appointment[] = []) => [...old, newApt]
                );
            }
        },
    });

    // Update appointment
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateAppointmentPayload }) =>
            appointmentService.updateAppointment(id, payload),
        onSuccess: (updated) => {
            // Update the relevant cache
            if (userId) {
                queryClient.setQueryData(
                    ['appointments', 'user', userId],
                    (old: Appointment[] = []) =>
                        old.map(apt => (apt.id === updated.id ? updated : apt))
                );
            }
            if (mentorId) {
                queryClient.setQueryData(
                    ['appointments', 'mentor', mentorId],
                    (old: Appointment[] = []) =>
                        old.map(apt => (apt.id === updated.id ? updated : apt))
                );
            }
        },
    });

    // Get the right data based on what was passed
    const appointments = userId ? (userQuery.data || []) : (mentorQuery.data || []);
    const isLoading = userId ? userQuery.isLoading : mentorQuery.isLoading;
    const error = userId ? userQuery.error : mentorQuery.error;

    // Filter by date
    const getAppointmentsByDate = (date: string) => {
        return appointments.filter(apt => apt.meetingDate.split('T')[0] === date);
    };

    // Mock available dates
    const getMentorAvailableDates = () => {
        return [
            '2025-11-10',
            '2025-11-12',
            '2025-11-14',
            '2025-11-15',
            '2025-11-17',
        ];
    };

    return {
        // Data
        appointments,
        isLoading,
        error,

        // Mutations
        createAppointment: (payload: CreateAppointmentPayload) =>
            createMutation.mutateAsync(payload),
        updateAppointment: (id: string, payload: UpdateAppointmentPayload) =>
            updateMutation.mutateAsync({ id, payload }),
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,

        // Filters
        getAppointmentsByDate,
        getMentorAvailableDates,

        // Refetch
        refetch: userId ? userQuery.refetch : mentorQuery.refetch,
    };
};

import { appointmentService } from '@/services/appointments.service';
import { Appointment, CreateAppointmentPayload } from '@/types/appointment.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseCreateAppointmentOptions {
    onSuccess?: (appointment: Appointment) => void;
    onError?: (error: Error) => void;
}

interface RescheduleAppointmentPayload {
    appointmentId: string;
    newDate: string;
    startTime: string;
    startPeriod: 'AM' | 'PM';
}

export const useCreateAppointment = (options?: UseCreateAppointmentOptions) => {
    const { onSuccess, onError } = options || {};
    const queryClient = useQueryClient();

    
    const createMutation = useMutation({
        mutationFn: (payload: CreateAppointmentPayload) =>
            appointmentService.createAppointment(payload),
        onSuccess: (newAppointment) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-availability'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-availability'] });

            onSuccess?.(newAppointment);
        },
        onError: (error: Error) => {
            console.error('Failed to create appointment:', error);
            onError?.(error);
        },
    });

    
    const rescheduleMutation = useMutation({
        mutationFn: async (payload: RescheduleAppointmentPayload) => {
            // Call the reschedule API endpoint
            const response = await appointmentService.rescheduleAppointment(
                payload.appointmentId,
                {
                    newDate: payload.newDate,
                    startTime: payload.startTime,
                    startPeriod: payload.startPeriod,
                }
            );
            return response;
        },
        onSuccess: (updatedAppointment) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['weekly-availability'] });
            queryClient.invalidateQueries({ queryKey: ['monthly-availability'] });

            onSuccess?.(updatedAppointment);
        },
        onError: (error: Error) => {
            console.error('Failed to reschedule appointment:', error);
            onError?.(error);
        },
    });

    return {
        
        createAppointment: createMutation.mutate,
        createAppointmentAsync: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

        
        rescheduleAppointment: rescheduleMutation.mutate,
        rescheduleAppointmentAsync: rescheduleMutation.mutateAsync,
        isRescheduling: rescheduleMutation.isPending,

        
        isSuccess: createMutation.isSuccess || rescheduleMutation.isSuccess,
        isError: createMutation.isError || rescheduleMutation.isError,
        error: createMutation.error || rescheduleMutation.error,
        data: createMutation.data || rescheduleMutation.data,
        reset: () => {
            createMutation.reset();
            rescheduleMutation.reset();
        },
    };
};

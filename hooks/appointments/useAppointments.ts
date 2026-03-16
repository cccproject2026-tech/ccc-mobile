import { appointmentService } from "@/services/appointments.service";
import { AppointmentStatus } from "@/types/appointment.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseAppointmentsOptions {
  userId?: string;
  mentorId?: string;
}

export const appointmentKeys = {
  all: ["appointments"] as const,
  user: (userId: string) => [...appointmentKeys.all, "user", userId] as const,
  mentor: (mentorId: string) =>
    [...appointmentKeys.all, "mentor", mentorId] as const,
};

export const useAppointments = (options?: UseAppointmentsOptions) => {
  const { userId, mentorId } = options || {};

  // Fetch user appointments
  const userQuery = useQuery({
    queryKey: appointmentKeys.user(userId || ""),
    queryFn: () => appointmentService.getUserAppointments(userId!),
    enabled: !!userId,
    staleTime: 20000, // 2 seconds (was 5 minutes)
  });

  // Fetch mentor appointments
  const mentorQuery = useQuery({
    queryKey: appointmentKeys.mentor(mentorId || ""),
    queryFn: () => appointmentService.getMentorAppointments(mentorId!),
    enabled: !!mentorId,
    staleTime: 20000, // 2 seconds (was 5 minutes)
  });

  // Get the right data
  const appointments = userId ? userQuery.data || [] : mentorQuery.data || [];
  const isLoading = userId ? userQuery.isLoading : mentorQuery.isLoading;
  const isError = userId ? userQuery.isError : mentorQuery.isError;
  const error = userId ? userQuery.error : mentorQuery.error;

  // Filter helpers
  const getAppointmentsByStatus = (status: AppointmentStatus) => {
    return appointments.filter((apt) => apt.status === status);
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter((apt) => apt.meetingDate.split("T")[0] === date);
  };

  const getUpcomingAppointments = () => {
    return appointments.filter((apt) =>
      appointmentService.isUpcoming(apt.meetingDate),
    );
  };

  const getPastAppointments = () => {
    return appointments.filter(
      (apt) => !appointmentService.isUpcoming(apt.meetingDate),
    );
  };

  return {
    // Data
    appointments,
    isLoading,
    isError,
    error,

    // Filters
    getAppointmentsByStatus,
    getAppointmentsByDate,
    getUpcomingAppointments,
    getPastAppointments,

    // Refetch
    refetch: userId ? userQuery.refetch : mentorQuery.refetch,
  };
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentService.cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

import { appointmentService } from "@/services/appointments.service";
import type { TimeSlot } from "@/types/appointment.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const availableMeetingSlotsKeys = {
  all: ["available-meeting-slots"] as const,
  day: (
    mentorId: string,
    date: string,
    participantUserId?: string,
    excludeAppointmentId?: string,
  ) =>
    [
      ...availableMeetingSlotsKeys.all,
      mentorId,
      date.slice(0, 10),
      participantUserId ?? "",
      excludeAppointmentId ?? "",
    ] as const,
};

export function slotStartKeysMatch(
  a: Pick<TimeSlot, "startTime" | "startPeriod">,
  b: Pick<TimeSlot, "startTime" | "startPeriod">,
): boolean {
  const normalize = (time: string) => {
    const parts = String(time ?? "").split(":");
    const h = parseInt(parts[0], 10);
    const m = parts[1] ? parseInt(parts[1], 10) : 0;
    if (!Number.isFinite(h) || !Number.isFinite(m)) return String(time ?? "").trim();
    return `${h}:${String(m).padStart(2, "0")}`;
  };
  return (
    normalize(a.startTime) === normalize(b.startTime) &&
    a.startPeriod === b.startPeriod
  );
}

export function useAvailableMeetingSlots(params: {
  mentorId?: string;
  date?: string;
  participantUserId?: string;
  excludeAppointmentId?: string;
  enabled?: boolean;
}) {
  const mentorId = params.mentorId?.trim();
  const date = params.date?.slice(0, 10);

  return useQuery({
    queryKey: availableMeetingSlotsKeys.day(
      mentorId ?? "",
      date ?? "",
      params.participantUserId,
      params.excludeAppointmentId,
    ),
    queryFn: () =>
      appointmentService.getAvailableSlots({
        mentorId: mentorId!,
        date: date!,
        participantUserId: params.participantUserId,
        excludeAppointmentId: params.excludeAppointmentId,
      }),
    enabled: Boolean(mentorId && date && params.enabled !== false),
    staleTime: 0,
    gcTime: 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

export async function refetchAvailableMeetingSlots(
  queryClient: ReturnType<typeof useQueryClient>,
  params: {
    mentorId: string;
    date: string;
    participantUserId?: string;
    excludeAppointmentId?: string;
  },
) {
  return queryClient.fetchQuery({
    queryKey: availableMeetingSlotsKeys.day(
      params.mentorId,
      params.date,
      params.participantUserId,
      params.excludeAppointmentId,
    ),
    queryFn: () => appointmentService.getAvailableSlots(params),
    staleTime: 0,
  });
}

export function isSelectedSlotStillAvailable(
  slots: TimeSlot[],
  selected: Pick<TimeSlot, "startTime" | "startPeriod"> | null | undefined,
): boolean {
  if (!selected) return false;
  return slots.some((slot) => slotStartKeysMatch(slot, selected));
}

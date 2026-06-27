import { assessmentMeetingNote } from '@/lib/assessments/assessmentMeetings';
import { mentorshipSessionKeys } from '@/hooks/roadmaps/useMentorshipSessions';
import { useRescheduleMentorshipSession } from '@/hooks/roadmaps/useRescheduleMentorshipSession';
import { pastorSessionKeys } from '@/hooks/roadmaps/usePastorSessions';
import { appointmentService } from '@/services/appointments.service';
import type { RescheduleContext } from '@/stores/scheduleMeeting.store';
import type {
  Appointment,
  TimeSlot as APITimeSlot,
  WeeklyAvailability,
} from '@/types/appointment.types';
import {
  extractGoogleCalendarCreateOutcome,
  googleCalendarSuccessHintFromCreateResponse,
} from '@/utils/google-calendar/google-calendar-scheduling';
import { getAppointmentMentorId } from '@/utils/appointmentMentorId';
import { isMentorRole, normalizeUserRole } from '@/utils/userRole';
import { getAppointmentJoinUrl } from '@/utils/meetingLinkDetails';
import { labelToPlatform } from '@/utils/appointments/platform';
import { validateSchedule } from '@/utils/appointments/validation';
import {
  isSelectedSlotStillAvailable,
  resolveLatestAvailableSlots,
} from '@/hooks/appointments/useAvailableMeetingSlots';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useCreateAppointment } from './useCreateAppointment';

export type SchedulerMode = 'schedule' | 'reschedule';

export type SchedulerPerson = {
  id: string;
  name: string;
  role?: string;
};

export type UseMeetingSchedulerParams = {
  mode: SchedulerMode;
  currentUserId: string | undefined;
  currentUserRole: string | undefined;
  selectedPerson: SchedulerPerson | null;
  /** For reschedule only. */
  existingAppointment?: Appointment | null;
  /** Reschedule fallback when the appointment is not in the cached list yet. */
  rescheduleAppointmentId?: string;
  /** YYYY-MM-DD */
  selectedDayYmd: string;
  selectedSlot: APITimeSlot | null;
  meetingOptionLabel: string;
  settings?: WeeklyAvailability | null;
  mentorAppointments?: Appointment[];
  userAppointments?: Appointment[];
  /** Tags the appointment for assessment list meeting links. */
  assessmentId?: string;
  /** Reschedule only — mentorship sessions use a dedicated backend endpoint. */
  rescheduleContext?: RescheduleContext;
};

export type MeetingSchedulerSubmitResult = {
  appointmentId: string;
  meetingDate: string;
  meetingLink?: string;
  googleCalendarSuccessHint?: string;
  googleCalendarSyncWarnings: string[];
};

export function useMeetingScheduler(params: UseMeetingSchedulerParams) {
  const {
    mode,
    currentUserId,
    currentUserRole,
    selectedPerson,
    existingAppointment,
    selectedDayYmd,
    selectedSlot,
    meetingOptionLabel,
    settings,
    mentorAppointments = [],
    userAppointments = [],
    assessmentId,
    rescheduleContext = 'appointment',
    rescheduleAppointmentId,
  } = params;

  const queryClient = useQueryClient();
  const [isBooking, setIsBooking] = useState(false);
  const {
    rescheduleAppointmentAsync,
    isRescheduling: isReschedulingAppointment,
  } = useCreateAppointment();
  const {
    mutateAsync: rescheduleMentorshipSessionAsync,
    isPending: isReschedulingMentorship,
  } = useRescheduleMentorshipSession();

  const isSubmitting = isBooking || isReschedulingAppointment || isReschedulingMentorship;

  function refreshBookingCaches() {
    void queryClient.invalidateQueries({ queryKey: ['appointments'] });
    void queryClient.invalidateQueries({ queryKey: ['weekly-availability'] });
    void queryClient.invalidateQueries({ queryKey: ['monthly-availability'] });
    void queryClient.invalidateQueries({ queryKey: ['available-meeting-slots'] });
    void queryClient.invalidateQueries({ queryKey: mentorshipSessionKeys.all });
    void queryClient.invalidateQueries({ queryKey: pastorSessionKeys.all });
  }

  async function submit(): Promise<MeetingSchedulerSubmitResult> {
    if (
      !currentUserId ||
      !selectedPerson?.id ||
      !selectedSlot?.startTime ||
      !selectedDayYmd
    ) {
      throw new Error('Missing required details.');
    }

    const meetingDateIso = appointmentService.createMeetingDate(
      selectedDayYmd,
      selectedSlot,
    );

    if (__DEV__) {
      console.log('[ScheduleMeeting] selectedDate', selectedDayYmd);
      console.log('[ScheduleMeeting] selectedTime', `${selectedSlot.startTime} ${selectedSlot.startPeriod}`);
      console.log('[ScheduleMeeting] meetingDateIso', meetingDateIso);
    }

    const resolvedRescheduleId =
      existingAppointment?.id ?? rescheduleAppointmentId;

    const issue = validateSchedule({
      meetingDateIso,
      meetingDayYmd: selectedDayYmd,
      settings,
      mentorAppointments,
      userAppointments,
      excludeAppointmentId:
        mode === "reschedule" ? resolvedRescheduleId : undefined,
    });
    if (issue) {
      const err = new Error(issue.message);
      (err as any).title = issue.title;
      (err as any).code = issue.code;
      throw err;
    }

    const isMentorUser = isMentorRole(currentUserRole);
    const payloadMentorId = isMentorUser ? currentUserId : selectedPerson.id;
    const payloadUserId = isMentorUser ? selectedPerson.id : currentUserId;

    setIsBooking(true);
    try {
      if (mode !== 'reschedule') {
        const latestSlots = await resolveLatestAvailableSlots(queryClient, {
          mentorId: payloadMentorId,
          date: selectedDayYmd,
          participantUserId: payloadUserId,
        });
        if (!isSelectedSlotStillAvailable(latestSlots.slots, selectedSlot)) {
          const err = new Error(
            'This slot is no longer available. Please choose another time.',
          );
          (err as any).title = 'Slot unavailable';
          (err as any).code = 'slot_unavailable';
          throw err;
        }
      }

      const platform = labelToPlatform(meetingOptionLabel);

      const normalizedRole = normalizeUserRole(currentUserRole);
      const initiatorRole =
        normalizedRole === 'mentor' ||
        normalizedRole === 'field-mentor' ||
        normalizedRole === 'director' ||
        normalizedRole === 'pastor'
          ? normalizedRole === 'field-mentor'
            ? 'mentor'
            : normalizedRole
          : undefined;

      if (mode === 'reschedule') {
        if (!resolvedRescheduleId) {
          throw new Error('Missing appointment to reschedule.');
        }

        if (rescheduleContext === 'mentorship') {
          if (!currentUserId) {
            throw new Error('Missing mentor id.');
          }

          let appointmentForMentor = existingAppointment ?? null;
          if (!getAppointmentMentorId(appointmentForMentor) && resolvedRescheduleId) {
            appointmentForMentor = await appointmentService.getAppointmentById(
              resolvedRescheduleId,
            );
          }

          const rescheduleMentorId = getAppointmentMentorId(appointmentForMentor);
          if (!rescheduleMentorId) {
            throw new Error('Could not determine the assigned mentor for this session.');
          }
          if (String(rescheduleMentorId) !== String(currentUserId)) {
            throw new Error('Only the assigned mentor may reschedule this session.');
          }

          const data = await rescheduleMentorshipSessionAsync({
            sessionId: resolvedRescheduleId,
            mentorId: rescheduleMentorId,
            newMeetingDate: meetingDateIso,
          });
          const updatedSession = data.session;
          const meetingLink =
            typeof updatedSession?.meetingLink === 'string'
              ? updatedSession.meetingLink.trim() || undefined
              : undefined;
          refreshBookingCaches();
          return {
            appointmentId: String(
              updatedSession?.appointmentId ?? resolvedRescheduleId,
            ),
            meetingDate: meetingDateIso,
            meetingLink,
            googleCalendarSyncWarnings: [],
          };
        }

        const res = await rescheduleAppointmentAsync({
          appointmentId: resolvedRescheduleId,
          newDate: meetingDateIso,
          startTime: selectedSlot.startTime,
          startPeriod: selectedSlot.startPeriod as any,
        });
        refreshBookingCaches();
        return {
          appointmentId: res.id,
          meetingDate: meetingDateIso,
          meetingLink: getAppointmentJoinUrl(res) ?? undefined,
          googleCalendarSyncWarnings: [],
        };
      }

      const notes = assessmentId
        ? assessmentMeetingNote(assessmentId)
        : `Meeting with ${selectedPerson.name}`;

      const createPayload = {
        userId: payloadUserId,
        mentorId: payloadMentorId,
        meetingDate: meetingDateIso,
        platform,
        meetingLink: undefined,
        notes,
        ...(initiatorRole ? { initiatorRole } : {}),
      };

      const rawResponse = await appointmentService.createAppointmentRaw(createPayload);
      const outcome = extractGoogleCalendarCreateOutcome(rawResponse);
      const gHint = googleCalendarSuccessHintFromCreateResponse(rawResponse);

      refreshBookingCaches();

      const data = rawResponse.data;
      const created = (Array.isArray(data) ? data[0] : data) as Appointment;

      return {
        appointmentId: created.id,
        meetingDate: meetingDateIso,
        meetingLink: getAppointmentJoinUrl(created) ?? undefined,
        googleCalendarSuccessHint: gHint,
        googleCalendarSyncWarnings: outcome.warnings,
      };
    } finally {
      setIsBooking(false);
    }
  }

  return { submit, isSubmitting };
}

import { assessmentMeetingNote } from "@/lib/assessments/assessmentMeetings";
import { appointmentService } from "@/services/appointments.service";
import { getAppointmentJoinUrl } from "@/utils/meetingLinkDetails";
import type {
  Appointment,
  AppointmentPlatform,
  TimeSlot as APITimeSlot,
  WeeklyAvailability,
} from "@/types/appointment.types";
import { labelToPlatform } from "@/utils/appointments/platform";
import { validateSchedule } from "@/utils/appointments/validation";
import { useCreateAppointment } from "./useCreateAppointment";

export type SchedulerMode = "schedule" | "reschedule";

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
  /** YYYY-MM-DD */
  selectedDayYmd: string;
  selectedSlot: APITimeSlot | null;
  meetingOptionLabel: string;
  settings?: WeeklyAvailability | null;
  mentorAppointments?: Appointment[];
  userAppointments?: Appointment[];
  /** Tags the appointment for assessment list meeting links. */
  assessmentId?: string;
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
  } = params;

  const {
    createAppointmentAsync,
    rescheduleAppointmentAsync,
    isCreating,
    isRescheduling,
  } = useCreateAppointment();

  const isSubmitting = isCreating || isRescheduling;

  async function submit(): Promise<{
    appointmentId: string;
    meetingDate: string;
    meetingLink?: string;
  }> {
    if (
      !currentUserId ||
      !selectedPerson?.id ||
      !selectedSlot?.startTime ||
      !selectedDayYmd
    ) {
      throw new Error("Missing required details.");
    }

    const meetingDateIso = appointmentService.createMeetingDate(
      selectedDayYmd,
      selectedSlot,
    );

    const issue = validateSchedule({
      meetingDateIso,
      meetingDayYmd: selectedDayYmd,
      settings,
      mentorAppointments,
      userAppointments,
    });
    if (issue) {
      const err = new Error(issue.message);
      (err as any).title = issue.title;
      (err as any).code = issue.code;
      throw err;
    }

    const platform = labelToPlatform(meetingOptionLabel) as AppointmentPlatform;

    const isMentorUser =
      String(currentUserRole || "").toLowerCase() === "mentor";

    // Preserve backend participant contract:
    // - mentorId must be the mentor user id
    // - userId must be the pastor/mentee/director user id
    const payloadMentorId = isMentorUser ? currentUserId : selectedPerson.id;
    const payloadUserId = isMentorUser ? selectedPerson.id : currentUserId;

    if (mode === "reschedule") {
      if (!existingAppointment?.id) {
        throw new Error("Missing appointment to reschedule.");
      }
      const res = await rescheduleAppointmentAsync({
        appointmentId: existingAppointment.id,
        newDate: meetingDateIso,
        startTime: selectedSlot.startTime,
        startPeriod: selectedSlot.startPeriod as any,
      });
      return {
        appointmentId: res.id,
        meetingDate: meetingDateIso,
        meetingLink: getAppointmentJoinUrl(res) ?? undefined,
      };
    }

    const notes = assessmentId
      ? assessmentMeetingNote(assessmentId)
      : `Meeting with ${selectedPerson.name}`;

    const created = await createAppointmentAsync({
      userId: payloadUserId,
      mentorId: payloadMentorId,
      meetingDate: meetingDateIso,
      platform,
      meetingLink: undefined,
      notes,
    });
    return {
      appointmentId: created.id,
      meetingDate: meetingDateIso,
      meetingLink: getAppointmentJoinUrl(created) ?? undefined,
    };
  }

  return { submit, isSubmitting };
}


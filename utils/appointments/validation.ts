import { appointmentService } from "@/services/appointments.service";
import type {
  Appointment,
  WeeklyAvailability,
  TimeSlot,
} from "@/types/appointment.types";

export type MeetingValidationIssueCode =
  | "missing_required"
  | "min_notice"
  | "max_bookings_per_day"
  | "overlap";

export type MeetingValidationIssue = {
  code: MeetingValidationIssueCode;
  title: string;
  message: string;
};

export type ValidateScheduleParams = {
  meetingDateIso: string;
  meetingDayYmd: string;
  settings?: WeeklyAvailability | null;
  mentorAppointments?: Appointment[];
  userAppointments?: Appointment[];
  /** Reschedule: ignore the appointment being moved. */
  excludeAppointmentId?: string;
};

function isCancelledStatus(status: unknown) {
  const normalized = String(status ?? "").trim().toLowerCase();
  return (
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized.startsWith("cancel")
  );
}

/** True when the booker already has a non-cancelled appointment at this ISO start time. */
export function isUserBookedAtMeetingIso(
  meetingDateIso: string,
  userAppointments: Appointment[],
  excludeAppointmentId?: string,
): boolean {
  if (!meetingDateIso || !userAppointments.length) return false;
  return userAppointments.some((apt) => {
    if (excludeAppointmentId && String(apt.id) === String(excludeAppointmentId)) {
      return false;
    }
    if (isCancelledStatus(apt.status)) return false;
    return String(apt.meetingDate) === String(meetingDateIso);
  });
}

/** True when the booker already has a non-cancelled appointment at this slot start. */
export function isUserBookedAtSlot(
  dayYmd: string,
  slot: SlotLike,
  userAppointments: Appointment[],
  excludeAppointmentId?: string,
): boolean {
  if (!dayYmd || !slot?.startTime || !userAppointments.length) return false;
  const meetingDateIso = appointmentService.createMeetingDate(dayYmd, slot);
  return isUserBookedAtMeetingIso(meetingDateIso, userAppointments, excludeAppointmentId);
}

/** Drop slots that would fail the confirm-step overlap check for the booker. */
export function filterSlotsByUserOverlap(
  dayYmd: string,
  slots: TimeSlot[],
  userAppointments: Appointment[],
  excludeAppointmentId?: string,
): TimeSlot[] {
  if (!slots.length || !userAppointments.length) return slots;
  return slots.filter(
    (s) => !isUserBookedAtSlot(dayYmd, s, userAppointments, excludeAppointmentId),
  );
}

export function validateSchedule(
  params: ValidateScheduleParams,
): MeetingValidationIssue | null {
  const {
    meetingDateIso,
    meetingDayYmd,
    settings,
    mentorAppointments = [],
    userAppointments = [],
    excludeAppointmentId,
  } = params;

  if (!meetingDateIso || !meetingDayYmd) {
    return {
      code: "missing_required",
      title: "Missing details",
      message: "Please select a date and time to continue.",
    };
  }

  const now = new Date();
  const meetingDateTime = new Date(meetingDateIso);

  // 1) Minimum notice
  if (settings?.minSchedulingNoticeHours) {
    const hoursNotice =
      (meetingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursNotice < settings.minSchedulingNoticeHours) {
      return {
        code: "min_notice",
        title: "Notice period required",
        message: `This mentor requires at least ${settings.minSchedulingNoticeHours} hours notice for appointments.`,
      };
    }
  }

  // 2) Max bookings per day
  if (settings?.maxBookingsPerDay) {
    const bookingsOnDate = mentorAppointments.filter((apt) => {
      if (isCancelledStatus(apt.status)) return false;
      const day = String(apt.meetingDate).split("T")[0];
      return day === meetingDayYmd;
    });
    if (bookingsOnDate.length >= settings.maxBookingsPerDay) {
      return {
        code: "max_bookings_per_day",
        title: "Daily limit reached",
        message:
          "This mentor has reached their maximum number of bookings for the selected date.",
      };
    }
  }

  // 3) Overlap (booker already has another appointment at this exact start time)
  if (isUserBookedAtMeetingIso(meetingDateIso, userAppointments, excludeAppointmentId)) {
    return {
      code: "overlap",
      title: "Schedule conflict",
      message: "You already have another appointment scheduled at this time.",
    };
  }

  return null;
}

/** Helper for schedulers that have a selected slot object. */
export function ymdFromSelectedDate(selectedDate: string): string {
  return String(selectedDate || "").slice(0, 10);
}

/** Narrow helper type used by the schedulers today. */
export type SlotLike = Pick<TimeSlot, "startTime" | "startPeriod">;

/** True when the slot start is at least `minHours` after now. */
export function isSlotWithinMinNotice(
  dayYmd: string,
  slot: SlotLike,
  minHours: number,
): boolean {
  if (!minHours || minHours <= 0) return true;
  if (!dayYmd || !slot?.startTime) return false;
  const meetingDateIso = appointmentService.createMeetingDate(dayYmd, slot);
  const hoursNotice =
    (new Date(meetingDateIso).getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursNotice >= minHours;
}

export function filterSlotsByMinNotice(
  dayYmd: string,
  slots: TimeSlot[],
  settings?: WeeklyAvailability | null,
): TimeSlot[] {
  const min = settings?.minSchedulingNoticeHours;
  if (!min || min <= 0) return slots;
  return slots.filter((s) => isSlotWithinMinNotice(dayYmd, s, min));
}


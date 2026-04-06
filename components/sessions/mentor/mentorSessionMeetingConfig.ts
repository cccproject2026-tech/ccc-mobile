import type { AppointmentPlatform } from "@/types/appointment.types";

/**
 * Mentor session meeting UI until API returns meetingLink / platform on appointments.
 * Set usePlaceholderUntilBackend to false when the backend is wired.
 */
export const MENTOR_MEETING_UI = {
  usePlaceholderUntilBackend: true,
  placeholderMeetingLink: "https://zoom.us/j/00000000000",
  placeholderPlatform: "zoom" as AppointmentPlatform,
} as const;

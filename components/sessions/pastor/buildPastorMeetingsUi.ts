import { sessionOrdinalLabel } from "@/constants/sessionTitles";
import { Appointment } from "@/types/appointment.types";
import { MentorshipSession } from "@/types/session.types";
import {
  aiSummaryForSession,
  transcriptLinesForSession,
} from "@/utils/sessionTranscriptUi";
import {
  MeetingStatusUi,
  PastorMeetingUi,
} from "./pastorSessionDetail.types";

function mapAppointmentStatus(
  session: MentorshipSession,
  appointment?: Appointment,
): MeetingStatusUi {
  const raw = String(appointment?.status ?? "").toLowerCase();
  if (raw === "cancelled") return "CANCELLED";
  if (raw === "rescheduled") return "RESCHEDULED";
  if (raw === "completed") return "COMPLETED";
  if (session.status === "COMPLETED") return "COMPLETED";
  return "SCHEDULED";
}

/**
 * Maps session + appointment into meeting rows for the UI.
 * Current roadmap payload is one occurrence per session; this returns one row.
 * Extend here when the API adds meeting history without changing callers.
 */
export function buildPastorMeetingsUi(
  session: MentorshipSession,
  appointment?: Appointment,
): PastorMeetingUi[] {
  const id = `${session.id}-meeting-1`;
  const status = mapAppointmentStatus(session, appointment);

  const meeting: PastorMeetingUi = {
    id,
    meetingNumber: 1,
    title: sessionOrdinalLabel(session.sessionNumber),
    scheduledDate: session.scheduledDate,
    status,
    isRedo: false,
    isLatest: true,
    mentorNote: session.mentorNote,
    pastorNote: session.pastorNote,
    transcript: transcriptLinesForSession(session),
    aiSummary: aiSummaryForSession(session),
  };

  return [meeting];
}
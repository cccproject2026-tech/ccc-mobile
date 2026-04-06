import { Appointment } from "@/types/appointment.types";
import { MentorshipSession } from "@/types/session.types";
import {
  AiSummarySectionsUi,
  MeetingStatusUi,
  PastorMeetingUi,
} from "./pastorSessionDetail.types";

function emptyAiSummary(): AiSummarySectionsUi {
  return {
    overview: "",
    keyDiscussionPoints: "",
    adviceGiven: "",
    actionItems: "",
    nextSessionFocus: "",
  };
}

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
    title: "Meeting 1",
    scheduledDate: session.scheduledDate,
    status,
    isRedo: false,
    isLatest: true,
    mentorNote: session.mentorNote,
    pastorNote: session.pastorNote,
    transcript: [],
    aiSummary: emptyAiSummary(),
  };

  return [meeting];
}

import {
  loadAssessmentMeetingLinks,
  parseAssessmentIdFromNotes,
  type AssessmentMeetingLink,
} from "@/lib/assessments/assessmentMeetings";
import type { Appointment } from "@/types/appointment.types";
import { getAppointmentJoinUrl } from "@/utils/meetingLinkDetails";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

function linkFromAppointment(apt: Appointment): AssessmentMeetingLink | null {
  if (!apt.id || !apt.meetingDate) return null;
  const meetingLink = getAppointmentJoinUrl(apt) ?? undefined;
  return { appointmentId: apt.id, meetingDate: apt.meetingDate, meetingLink };
}

function pickRicherLink(
  existing: AssessmentMeetingLink,
  candidate: AssessmentMeetingLink,
): AssessmentMeetingLink {
  if (!existing.meetingLink && candidate.meetingLink) {
    return { ...existing, meetingLink: candidate.meetingLink };
  }
  return existing;
}

/** Merge persisted links with appointments tagged via notes (`assessment:<id>`). */
export function buildAssessmentMeetingMap(
  stored: Record<string, AssessmentMeetingLink>,
  appointments: Appointment[] = [],
): Record<string, AssessmentMeetingLink> {
  const merged = { ...stored };
  for (const apt of appointments) {
    const assessmentId = parseAssessmentIdFromNotes(apt.notes);
    if (!assessmentId) continue;
    const existing = merged[assessmentId];
    if (!existing) {
      const link = linkFromAppointment(apt);
      if (link) merged[assessmentId] = link;
      continue;
    }
    const aptTime = new Date(apt.meetingDate).getTime();
    const existingTime = new Date(existing.meetingDate).getTime();
    if (aptTime >= existingTime) {
      const link = linkFromAppointment(apt);
      if (link) merged[assessmentId] = link;
    } else {
      const link = linkFromAppointment(apt);
      if (link) merged[assessmentId] = pickRicherLink(existing, link);
    }
  }
  return merged;
}

export function useAssessmentMeetingMap(appointments: Appointment[] = []) {
  const [storedLinks, setStoredLinks] = useState<
    Record<string, AssessmentMeetingLink>
  >({});

  const refreshStored = useCallback(async () => {
    setStoredLinks(await loadAssessmentMeetingLinks());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshStored();
    }, [refreshStored]),
  );

  const meetingMap = buildAssessmentMeetingMap(storedLinks, appointments);

  return { meetingMap, refreshStored };
}

/** Resolve mentor id from an appointment payload (flat or populated mentor). */
export function getAppointmentMentorId(
  appointment?: {
    mentorId?: string;
    mentor?: { id?: string; _id?: string };
  } | null,
): string | undefined {
  if (!appointment) return undefined;
  if (appointment.mentorId) return String(appointment.mentorId);
  const mentor = appointment.mentor;
  if (mentor?._id) return String(mentor._id);
  if (mentor?.id) return String(mentor.id);
  return undefined;
}

/** Resolve mentor id from an appointment payload (flat or populated mentor). */
export function getAppointmentMentorId(
  appointment?: {
    mentorId?: string | { _id?: string; id?: string };
    mentor?: { id?: string; _id?: string };
  } | null,
): string | undefined {
  if (!appointment) return undefined;

  const rawMentorId = appointment.mentorId;
  if (rawMentorId != null && typeof rawMentorId === "object") {
    const nested = rawMentorId._id ?? rawMentorId.id;
    if (nested != null && String(nested).trim().length > 0) {
      return String(nested);
    }
  } else if (
    rawMentorId != null &&
    String(rawMentorId).trim().length > 0 &&
    String(rawMentorId) !== "undefined" &&
    String(rawMentorId) !== "null"
  ) {
    return String(rawMentorId);
  }

  const mentor = appointment.mentor;
  if (mentor?._id) return String(mentor._id);
  if (mentor?.id) return String(mentor.id);
  return undefined;
}

/** Resolve pastor/user id from flat or populated user fields. */
export function getAppointmentUserId(
  appointment?: {
    userId?: string | { _id?: string; id?: string };
    user?: { id?: string; _id?: string };
  } | null,
): string | undefined {
  if (!appointment) return undefined;

  const rawUserId = appointment.userId;
  if (rawUserId != null && typeof rawUserId === "object") {
    const nested = rawUserId._id ?? rawUserId.id;
    if (nested != null) return String(nested);
  } else if (rawUserId != null && String(rawUserId).trim().length > 0) {
    return String(rawUserId);
  }

  const user = appointment.user;
  if (user?._id) return String(user._id);
  if (user?.id) return String(user.id);
  return undefined;
}

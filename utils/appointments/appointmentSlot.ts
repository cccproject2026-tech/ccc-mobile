import type { TimeSlot } from "@/types/appointment.types";
import { slotStartKeysMatch } from "@/hooks/appointments/useAvailableMeetingSlots";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Calendar day (YYYY-MM-DD) for a stored meetingDate in mentor IST. */
export function meetingDateToDayYmd(meetingDateIso: string): string {
  const ist = new Date(new Date(meetingDateIso).getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Map appointment meetingDate to the hourly slot shape used by the scheduler. */
export function parseSlotFromMeetingDateIso(
  meetingDateIso: string,
): Pick<TimeSlot, "startTime" | "startPeriod"> | null {
  if (!meetingDateIso) return null;
  const ist = new Date(new Date(meetingDateIso).getTime() + IST_OFFSET_MS);
  const hour24 = ist.getUTCHours();
  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  let displayHour = hour24 % 12;
  if (displayHour === 0) displayHour = 12;
  return {
    startTime: `${displayHour}:00`,
    startPeriod: period,
  };
}

export function isSameSlotAsMeetingDate(
  slot: Pick<TimeSlot, "startTime" | "startPeriod">,
  meetingDateIso: string,
): boolean {
  const current = parseSlotFromMeetingDateIso(meetingDateIso);
  if (!current) return false;
  return slotStartKeysMatch(slot, current);
}

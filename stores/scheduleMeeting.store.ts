import type { TimeSlot as APITimeSlot } from "@/types/appointment.types";
import { create } from "zustand";

export type SchedulePerson = {
  id: string;
  name: string;
  role?: string;
  profilePicture?: string;
  profileImage?: string;
};

export type ScheduleMeetingMode = "schedule" | "reschedule";

/** Distinguishes generic appointments from mentorship journey sessions when rescheduling. */
export type RescheduleContext = "appointment" | "mentorship";

export type ScheduleMeetingDraft = {
  mode: ScheduleMeetingMode;
  person: SchedulePerson | null;
  selectedDayYmd: string;
  selectedSlot: APITimeSlot | null;
  meetingOptionLabel: string;
  /** Optional: used to find appointment for reschedule. */
  appointmentId?: string;
  /** Reschedule only — routes to the correct backend endpoint. */
  rescheduleContext: RescheduleContext;
};

type ScheduleMeetingStore = {
  draft: ScheduleMeetingDraft;
  setMode: (mode: ScheduleMeetingMode) => void;
  setPerson: (person: SchedulePerson | null) => void;
  setDay: (ymd: string) => void;
  setSlot: (slot: APITimeSlot | null) => void;
  setPlatformLabel: (label: string) => void;
  setAppointmentId: (id?: string) => void;
  setRescheduleContext: (context: RescheduleContext) => void;
  reset: () => void;
};

const initialDraft: ScheduleMeetingDraft = {
  mode: "schedule",
  person: null,
  selectedDayYmd: "",
  selectedSlot: null,
  meetingOptionLabel: "Zoom",
  appointmentId: undefined,
  rescheduleContext: "appointment",
};

export const useScheduleMeetingStore = create<ScheduleMeetingStore>((set) => ({
  draft: initialDraft,
  setMode: (mode) => set((s) => ({ draft: { ...s.draft, mode } })),
  setPerson: (person) => set((s) => ({ draft: { ...s.draft, person } })),
  setDay: (selectedDayYmd) =>
    set((s) => ({ draft: { ...s.draft, selectedDayYmd } })),
  setSlot: (selectedSlot) => set((s) => ({ draft: { ...s.draft, selectedSlot } })),
  setPlatformLabel: (meetingOptionLabel) =>
    set((s) => ({ draft: { ...s.draft, meetingOptionLabel } })),
  setAppointmentId: (appointmentId) =>
    set((s) =>
      appointmentId
        ? { draft: { ...s.draft, appointmentId } }
        : s,
    ),
  setRescheduleContext: (rescheduleContext) =>
    set((s) => ({ draft: { ...s.draft, rescheduleContext } })),
  reset: () => set({ draft: initialDraft }),
}));


import {
  useScheduleMeetingStore,
  type RescheduleContext,
  type ScheduleMeetingMode,
  type SchedulePerson,
} from "@/stores/scheduleMeeting.store";

export type SeedRescheduleDraftParams = {
  mode: ScheduleMeetingMode;
  appointmentId: string;
  person: SchedulePerson;
  rescheduleContext: RescheduleContext;
};

/** Reset and pre-fill the scheduler draft (skips the person-picker step). */
export function seedRescheduleDraft(params: SeedRescheduleDraftParams): void {
  const store = useScheduleMeetingStore.getState();
  store.reset();
  store.setMode(params.mode);
  store.setAppointmentId(params.appointmentId);
  store.setPerson(params.person);
  store.setRescheduleContext(params.rescheduleContext);
}

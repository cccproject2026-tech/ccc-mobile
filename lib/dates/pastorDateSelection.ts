import { flattenExtraFields } from '@/lib/roadmap/extraFieldKeys';
import type { Extra } from '@/lib/roadmap/types';
import { isBefore, isValid, parse, startOfDay } from 'date-fns';

export const PAST_DATE_VALIDATION_MESSAGE =
    'Please select today or a future date.';

/** Start of the current calendar day in the device local timezone. */
export function getStartOfTodayLocal(): Date {
    return startOfDay(new Date());
}

/** True when the calendar day of `date` is strictly before today (local). */
export function isBeforeTodayLocal(date: Date): boolean {
    return isBefore(startOfDay(date), getStartOfTodayLocal());
}

/** Picker value: use today when the stored value is missing or in the past. */
export function coerceDatePickerValue(date: Date | null | undefined): Date {
    const base = date ?? new Date();
    if (isBeforeTodayLocal(base)) {
        return getStartOfTodayLocal();
    }
    return base;
}

/** Parse roadmap form / API date strings for local calendar-day comparison. */
export function parseRoadmapDateValue(raw?: string): Date | null {
    const v = String(raw ?? '').trim();
    if (!v) return null;

    const iso = parse(v, 'yyyy-MM-dd', new Date());
    if (isValid(iso) && v.length >= 10 && v[4] === '-' && v[7] === '-') {
        return iso;
    }

    const legacy = parse(v, 'dd / MM / yy', new Date());
    if (isValid(legacy)) return legacy;

    const d = new Date(v);
    return isValid(d) ? d : null;
}

/** Collect validation errors for pastor-selectable DATE_PICKER fields with past values. */
export function collectPastDateFieldErrors(
    extras: Extra[],
    formData: Record<string, unknown>,
): Record<string, string> {
    const errors: Record<string, string> = {};

    for (const { extra, fieldKey } of flattenExtraFields(extras)) {
        if (extra.type !== 'DATE_PICKER') continue;

        const raw = formData[fieldKey];
        if (raw === undefined || raw === null || raw === '') continue;

        const parsed = parseRoadmapDateValue(String(raw));
        if (parsed && isBeforeTodayLocal(parsed)) {
            errors[fieldKey] = PAST_DATE_VALIDATION_MESSAGE;
        }
    }

    return errors;
}

import { useMemo } from "react";
import { getRelativeDueDate, type DueDateStatus, type RelativeDueDate } from "@/utils/date";

export function useDueDateStatus(
    dueDate: string | null | undefined,
    isCompleted = false,
): RelativeDueDate {
    return useMemo(
        () => getRelativeDueDate(dueDate, isCompleted),
        [dueDate, isCompleted],
    );
}

export type { DueDateStatus, RelativeDueDate };

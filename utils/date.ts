export const pad = (n: number) => String(n).padStart(2, '0');

export const formatClock = (d: Date) => {
    let h = d.getHours();
    const suffix = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const m = pad(d.getMinutes());
    return `${pad(h)} : ${m} ${suffix}`;
};

export const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: '2-digit',
    });

export const getGreeting = (d: Date) => {
    const h = d.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
};

export const formatSessionDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// ─── Roadmap metadata helpers ─────────────────────────────────────────────────

function safeParse(value: string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

/** "Jul 3, 2026" — human-friendly display for assignment/due dates. */
export function formatDisplayDate(
    value: string | null | undefined,
    fallback = "—",
): string {
    const d = safeParse(value);
    if (!d) return fallback;
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/** American display for appointment `meetingDate` values (ISO datetime or YYYY-MM-DD). */
export function formatMeetingDateDisplay(
    value: string | null | undefined,
    fallback = "—",
): string {
    const raw = String(value ?? "").trim();
    if (!raw) return fallback;
    const ymd = raw.includes("T") ? raw.split("T")[0] : raw.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        return formatDisplayDate(`${ymd}T12:00:00`, fallback);
    }
    return formatDisplayDate(raw, fallback);
}

export type DueDateStatus = "upcoming" | "due-soon" | "overdue" | "none";

export interface RelativeDueDate {
    label: string;
    status: DueDateStatus;
    daysRemaining: number | null;
}

/**
 * "Due in 5 days" / "Overdue by 2 days" — relative label + severity bucket.
 * `isCompleted` makes the label static ("Due: May 24, 2026") so completed
 * tasks never show alarming overdue text.
 */
export function getRelativeDueDate(
    dueDate: string | null | undefined,
    isCompleted = false,
): RelativeDueDate {
    const NONE: RelativeDueDate = { label: "No due date", status: "none", daysRemaining: null };
    const d = safeParse(dueDate);
    if (!d) return NONE;

    if (isCompleted) {
        return {
            label: `Due: ${formatDisplayDate(dueDate)}`,
            status: "none",
            daysRemaining: null,
        };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffMs = dueStart.getTime() - todayStart.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        const abs = Math.abs(diffDays);
        return {
            label: `Overdue by ${abs} day${abs !== 1 ? "s" : ""}`,
            status: "overdue",
            daysRemaining: diffDays,
        };
    }

    if (diffDays === 0) {
        return { label: "Due today", status: "due-soon", daysRemaining: 0 };
    }

    if (diffDays <= 7) {
        return {
            label: `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`,
            status: "due-soon",
            daysRemaining: diffDays,
        };
    }

    return {
        label: `Due in ${diffDays} days`,
        status: "upcoming",
        daysRemaining: diffDays,
    };
}

/** "Updated 2 hours ago" / "Updated today" — for mentor resubmission visibility. */
export function formatRelativeTimestamp(
    value: string | null | undefined,
    fallback = "",
): string {
    const d = safeParse(value);
    if (!d) return fallback;

    const now = Date.now();
    const diffMs = now - d.getTime();
    if (diffMs < 0) return "Just now";

    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `Updated ${mins} min${mins !== 1 ? "s" : ""} ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Updated ${hours} hour${hours !== 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days === 0) return "Updated today";
    if (days === 1) return "Updated yesterday";
    if (days <= 14) return `Updated ${days} days ago`;

    return `Updated ${formatDisplayDate(value)}`;
}

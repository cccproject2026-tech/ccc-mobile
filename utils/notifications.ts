import { UserRole } from '@/types';
import { Notification } from '@/types';
import type { Href } from 'expo-router';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

const ISO_DATE_REGEX =
    /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\b/g;

export type NotificationPushData = {
    module?: string | null;
    referenceId?: string | null;
    appointmentId?: string | null;
};

const normalizeNotificationModule = (moduleName?: string | null) =>
    String(moduleName || '')
        .trim()
        .toLowerCase();

export const isAppointmentNotificationModule = (moduleName?: string | null) => {
    const normalizedModule = normalizeNotificationModule(moduleName);
    return normalizedModule === 'appointment' || normalizedModule === 'appointments';
};

export const getAppointmentIdFromNotification = (
    notification: Partial<Notification>,
    pushData?: NotificationPushData | null,
): string | undefined => {
    const fromNotification = notification.referenceId?.trim();
    if (fromNotification) return fromNotification;

    const fromPush = String(pushData?.referenceId || pushData?.appointmentId || '').trim();
    return fromPush || undefined;
};

export const resolveNotificationNavigation = (
    notificationOrModule: Partial<Notification> | string | null | undefined,
    pushData?: NotificationPushData | null,
    fallback: string = '/notifications',
): Href => {
    const notification =
        typeof notificationOrModule === 'string'
            ? { module: notificationOrModule }
            : notificationOrModule ?? {};

    const moduleName = notification.module ?? pushData?.module ?? undefined;
    const appointmentId = getAppointmentIdFromNotification(notification, pushData);

    if (isAppointmentNotificationModule(moduleName) && appointmentId) {
        return {
            pathname: '/appointments/meeting-details',
            params: { appointmentId },
        };
    }

    return getNotificationRoute(moduleName, fallback) as Href;
};

export const getNotificationRoute = (
    moduleName?: string | null,
    fallback: string = '/notifications'
) => {
    const normalizedModule = String(moduleName || '')
        .trim()
        .toLowerCase();

    switch (normalizedModule) {
        case 'appointment':
        case 'appointments':
            return '/appointments';
        case 'assessment':
        case 'assessments':
            return '/assessments';
        case 'roadmap':
        case 'roadmaps':
            return '/roadmap';
        case 'progress':
            return '/progress';
        case 'note':
        case 'notes':
            return '/profile/notes';
        case 'profile':
            return '/profile';
        case 'resource':
        case 'resources':
            return '/resources';
        case 'session':
        case 'sessions':
            return '/sessions';
        case 'notification':
        case 'notifications':
            return '/notifications';
        default:
            return fallback;
    }
};

export const getRoleNotificationRoute = (role?: UserRole | string | null) => {
    if (role === 'director') {
        return '/(director)/(tabs)/notification';
    }

    return '/notifications';
};

export const getNotificationId = (notification: Partial<Notification>) =>
    notification._id ||
    [
        notification.name,
        notification.details,
        notification.module,
        notification.createdAt,
    ]
        .filter(Boolean)
        .join('::');

/** Best-effort epoch ms for sorting — createdAt, updatedAt, ObjectId, or ISO in details. */
export function getNotificationTimestamp(notification: Partial<Notification>): number {
    for (const value of [notification.createdAt, notification.updatedAt]) {
        if (!value) continue;
        const parsed = Date.parse(value);
        if (!Number.isNaN(parsed)) return parsed;
    }

    const id = notification._id;
    if (id && /^[a-f\d]{24}$/i.test(id)) {
        const fromObjectId = parseInt(id.substring(0, 8), 16) * 1000;
        if (!Number.isNaN(fromObjectId)) return fromObjectId;
    }

    const details = String(notification.details || '');
    const matches = details.match(ISO_DATE_REGEX);
    if (matches?.length) {
        for (let i = matches.length - 1; i >= 0; i -= 1) {
            const parsed = Date.parse(matches[i]);
            if (!Number.isNaN(parsed)) return parsed;
        }
    }

    return 0;
}

/** Most recent notifications first. */
export function sortNotificationsByRecent(notifications: Notification[]): Notification[] {
    const items = [...notifications];
    const hasAnyTimestamp = items.some((n) => getNotificationTimestamp(n) > 0);

    // Backend stores via $push (oldest → newest). Reverse when dates are missing from API.
    if (!hasAnyTimestamp) {
        return items.reverse();
    }

    return items.sort((a, b) => {
        const timeDiff = getNotificationTimestamp(b) - getNotificationTimestamp(a);
        if (timeDiff !== 0) return timeDiff;
        return String(b._id || '').localeCompare(String(a._id || ''));
    });
}

export type NotificationDisplayItem = Notification & {
    title: string;
    description: string;
    type: string;
    timeLabel: string;
};

export type NotificationSection = {
    title: string;
    items: NotificationDisplayItem[];
};

/** Today → time only; yesterday → "Yesterday, 3:45 PM"; older → full date. */
export function formatNotificationListTime(timestamp: number): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';

    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    return format(date, 'dd MMM yyyy, h:mm a');
}

export function toNotificationDisplayItem(item: Notification): NotificationDisplayItem {
    const timestamp = getNotificationTimestamp(item);

    return {
        ...item,
        title: item.name,
        description: formatNotificationDescription(item.details),
        type: item.module,
        read: !!item.read,
        time: item.createdAt ?? item.updatedAt ?? '',
        timeLabel: formatNotificationListTime(timestamp),
    };
}

export function groupNotificationsForDisplay(
    notifications: Notification[],
): NotificationSection[] {
    const sorted = sortNotificationsByRecent(notifications);
    const hasAnyTimestamp = sorted.some((n) => getNotificationTimestamp(n) > 0);

    if (!hasAnyTimestamp) {
        const items = sorted.map(toNotificationDisplayItem);
        return items.length ? [{ title: 'Recent', items }] : [];
    }

    const today: NotificationDisplayItem[] = [];
    const yesterday: NotificationDisplayItem[] = [];
    const earlier: NotificationDisplayItem[] = [];

    for (const item of sorted) {
        const display = toNotificationDisplayItem(item);
        const timestamp = getNotificationTimestamp(item);

        if (!timestamp) {
            today.push(display);
            continue;
        }

        const date = new Date(timestamp);
        if (isToday(date)) today.push(display);
        else if (isYesterday(date)) yesterday.push(display);
        else earlier.push(display);
    }

    const sections: NotificationSection[] = [];
    if (today.length) sections.push({ title: 'Today', items: today });
    if (yesterday.length) sections.push({ title: 'Yesterday', items: yesterday });
    if (earlier.length) sections.push({ title: 'Earlier', items: earlier });
    return sections;
}

const formatSingleDate = (value?: string | null, fallback = '') => {
    if (!value) {
        return fallback;
    }

    try {
        const parsed = parseISO(value);
        if (Number.isNaN(parsed.getTime())) {
            return fallback || value;
        }

        return format(parsed, 'dd MMM yyyy, h:mm a');
    } catch {
        return fallback || value;
    }
};

export const formatNotificationDate = (value?: string | null) =>
    formatSingleDate(value, '');

export const formatNotificationTitle = (value?: string | null) =>
    String(value || '')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

export const formatNotificationDescription = (value?: string | null) =>
    String(value || '').replace(ISO_DATE_REGEX, (match) => formatSingleDate(match, match));

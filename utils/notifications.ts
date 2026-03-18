import { UserRole } from '@/types';
import { Notification } from '@/types';
import { format, parseISO } from 'date-fns';

const ISO_DATE_REGEX =
    /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\b/g;

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

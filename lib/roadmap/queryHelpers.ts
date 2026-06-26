import type { RoadmapQuery } from '@/lib/roadmap/types';

export type NormalizedRoadmapQuery = RoadmapQuery & {
    threadId?: string;
    createdDate: string;
    repliedDate?: string;
};

/** Normalize API date field variants onto stable keys for UI. */
export function normalizeRoadmapQueryItem(
    query: Record<string, unknown>,
    threadId?: string,
): NormalizedRoadmapQuery {
    const createdRaw =
        query.createdDate ?? query.createdAt ?? query.created_at ?? query.submittedDate;
    const repliedRaw =
        query.repliedDate ?? query.repliedAt ?? query.replied_at ?? query.answeredDate;

    return {
        ...(query as RoadmapQuery),
        threadId,
        status: String(query.status ?? 'pending').toLowerCase() as RoadmapQuery['status'],
        createdDate: createdRaw ? String(createdRaw) : '',
        repliedDate: repliedRaw ? String(repliedRaw) : undefined,
    };
}

export function formatQuerySubmittedDate(raw?: string | null): string {
    if (!raw?.trim()) return 'Date unavailable';

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return 'Date unavailable';

    return parsed.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/** Resolve pastor/mentee display name for mentor query views. */
export function resolvePastorDisplayName(options: {
    menteeNameParam?: string | null;
    legacyDataName?: string | null;
    profile?: {
        firstName?: string | null;
        lastName?: string | null;
    } | null;
}): string {
    const fromParam = String(options.menteeNameParam ?? '').trim();
    if (fromParam) return fromParam;

    const fromLegacy = String(options.legacyDataName ?? '').trim();
    if (fromLegacy) return fromLegacy;

    const fromProfile = [options.profile?.firstName, options.profile?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
    if (fromProfile) return fromProfile;

    return 'Pastor';
}

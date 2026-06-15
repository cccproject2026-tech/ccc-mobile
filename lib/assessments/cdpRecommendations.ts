import type {
    ApiAssessmentSection,
    CreateAssessmentSectionRecommendation,
    SubmittedAnswersResponse,
} from '@/types/assessment.types';

export function normalizeAssessmentLevel(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const n = Number(value);
    if (!Number.isFinite(n)) return undefined;
    const rounded = Math.round(n);
    if (rounded < 1 || rounded > 4) return undefined;
    return rounded;
}

export function normalizeRecommendationItems(items: unknown): string[] {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object' && 'text' in item) {
                return String((item as { text?: unknown }).text ?? '').trim();
            }
            return String(item ?? '').trim();
        })
        .filter((text) => text.length > 0);
}

export function getTemplateRecommendationsForLevel(
    templateRecommendations: CreateAssessmentSectionRecommendation[] | unknown,
    level: unknown,
): string[] {
    const normalizedLevel = normalizeAssessmentLevel(level);
    if (!normalizedLevel || templateRecommendations == null) return [];

    if (Array.isArray(templateRecommendations)) {
        if (!templateRecommendations.length) return [];
        const matched = templateRecommendations.find(
            (rec) =>
                rec &&
                typeof rec === 'object' &&
                normalizeAssessmentLevel((rec as CreateAssessmentSectionRecommendation).level) ===
                    normalizedLevel,
        ) as CreateAssessmentSectionRecommendation | undefined;
        return normalizeRecommendationItems(matched?.items);
    }

    if (typeof templateRecommendations === 'object') {
        const record = templateRecommendations as Record<string, unknown>;
        const byLevelKey =
            record[String(normalizedLevel)] ??
            record[`level${normalizedLevel}`] ??
            record[`Level ${normalizedLevel}`];
        return normalizeRecommendationItems(byLevelKey);
    }

    return [];
}

export function resolveSectionScore(
    submittedSection: SubmittedAnswersResponse['sections'][number],
): number | undefined {
    const fromApi = normalizeAssessmentLevel(submittedSection.sectionScore);
    if (fromApi != null) return fromApi;

    const layerScores =
        submittedSection.layers
            ?.map((layer) => normalizeAssessmentLevel(layer.selectedChoice))
            .filter((n): n is number => n != null) ?? [];

    if (!layerScores.length) return undefined;

    return Math.max(...layerScores);
}

export type MentorCdpSection = {
    sectionId: string;
    title: string;
    score?: number;
    recommendations: string[];
};

export function buildMentorCdpSections(
    assessmentSections: Array<{ title: string; recommendations?: CreateAssessmentSectionRecommendation[] }>,
    apiSections: ApiAssessmentSection[] | undefined,
    submittedSections: SubmittedAnswersResponse['sections'] | undefined,
): MentorCdpSection[] | undefined {
    if (!apiSections?.length || !submittedSections?.length) return undefined;

    return submittedSections.map((submittedSection) => {
        const apiSectionIndex = apiSections.findIndex(
            (s) => String(s._id) === String(submittedSection.sectionId),
        );
        const apiSection = apiSectionIndex >= 0 ? apiSections[apiSectionIndex] : undefined;
        const mappedSection =
            apiSectionIndex >= 0 ? assessmentSections[apiSectionIndex] : undefined;

        const sectionScore = resolveSectionScore(submittedSection);
        const sentRecommendations = normalizeRecommendationItems(submittedSection.recommendations);

        const templateFromApi = getTemplateRecommendationsForLevel(
            apiSection?.recommendations,
            sectionScore,
        );
        const templateFromMapped = getTemplateRecommendationsForLevel(
            mappedSection?.recommendations,
            sectionScore,
        );

        const mentorVisibleRecommendations =
            sentRecommendations.length > 0
                ? sentRecommendations
                : templateFromApi.length > 0
                  ? templateFromApi
                  : templateFromMapped;

        return {
            sectionId: submittedSection.sectionId,
            title:
                mappedSection?.title ??
                apiSection?.title ??
                'Section',
            score: sectionScore,
            recommendations: mentorVisibleRecommendations,
        };
    });
}

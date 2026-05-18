// components/director/ProgressRoadmapCard.tsx
import { RoadmapCardData } from '@/lib/roadmap/types';
import { icons } from '@/constants/images';
import { roadmapTheme } from '@/components/ui/design-system/roadmapTheme';
import { getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const JOURNEY_ICON_CTA = 20;
const JOURNEY_ICON_COMPASS = 16;
const JOURNEY_ICON_BADGE = 21;

/** Optional pastor roadmap list: in-card journey CTA / completion strip. Omit everywhere else. */
export type RoadmapCardJourneyGuidance =
  | {
      kind: 'active';
      ctaPhase: 'start' | 'continue';
      nextStepTitle: string;
      onContinuePress: () => void;
    }
  | { kind: 'completed'; bannerText?: string };

interface Props {
  data: RoadmapCardData & { phaseNumber?: number };
  onPress?: () => void;
  showMenu?: boolean;
  onMenuPress?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  /**
   * When set (e.g. pastor list), always shows nested-task progress bar, counts, and % —
   * including completed phases where `data.taskProgress` is omitted by the mapper.
   * Default: omit for identical behavior everywhere else.
   */
  journeyProgress?: { completed: number; total: number };
  /** In-card journey CTA / completion (pastor list). Parent keeps navigation logic. */
  journeyGuidance?: RoadmapCardJourneyGuidance;
}

export const RoadmapCard: React.FC<Props> = ({
    data,
    onPress,
    showMenu,
    onMenuPress,
    selectionMode,
    isSelected,
    onToggleSelection,
    journeyProgress,
    journeyGuidance,
}) => {
    const isCompleted = data.status === 'completed';
    const hasProgress = data.taskProgress && !isCompleted;
    const showArrow = data.showArrow && !isCompleted && !selectionMode;

    // ✅ Check if actions (menu or arrow) are present
    const hasActions = (showMenu || showArrow || selectionMode);

    const progressPercentage = useMemo(() => {
        return data.taskProgress
            ? Math.min(100, (data.taskProgress.completed / data.taskProgress.total) * 100)
            : 0;
    }, [data.taskProgress]);

    const statusConfig = useMemo(() => {
        // Match mentorship session badge approach: subtle tinted background + white text
        const configs = {
            'completed': {
                text: 'Completed',
                bg: 'rgba(34, 197, 94, 0.18)', // green
                accent: 'rgba(34, 197, 94, 0.55)',
            },
            'due': {
                text: 'Due',
                bg: 'rgba(250, 204, 21, 0.20)', // amber (friendlier than red for "due")
                accent: 'rgba(250, 204, 21, 0.55)',
            },
            'in-progress': {
                text: 'In Progress',
                bg: 'rgba(59, 130, 246, 0.18)', // blue
                accent: 'rgba(59, 130, 246, 0.55)',
            },
            'initial': {
                text: 'Not Started',
                bg: 'rgba(56, 189, 248, 0.16)', // sky
                accent: 'rgba(56, 189, 248, 0.45)',
            },
        } as const;
        return data.status ? configs[data.status as keyof typeof configs] : null;
    }, [data.status]);

    const showCompletionTimeOnLeft = !!(data.completionTime && data.status);
    const CardWrapper = onPress ? TouchableOpacity : View;

    const iconTintColor = useMemo(() => {
        // Keep icons mostly neutral (cleaner, more consistent with session cards)
        return 'rgba(255,255,255,0.65)';
    }, []);

    const progressFillColor = useMemo(() => {
        if (data.status === 'completed') return 'rgba(34, 197, 94, 0.85)'; // green
        if (data.status === 'due') return 'rgba(250, 204, 21, 0.85)'; // amber
        if (data.status === 'in-progress') return 'rgba(59, 130, 246, 0.82)'; // blue
        if (data.status === 'initial') return 'rgba(56, 189, 248, 0.80)'; // sky
        return 'rgba(255,255,255,0.55)';
    }, [data.status]);

    const secondaryTextColor = useMemo(() => {
        // Keep secondary text readable and consistent
        return 'rgba(255,255,255,0.70)';
    }, []);

    const renderImage = () => (
        <View style={styles.imageContainer}>
            <Image
                source={(() => {
                    if (typeof data.image === 'number') return data.image;
                    if (typeof data.image === 'string' && data.image.trim().length > 0) return { uri: data.image };
                    return icons.dummyImage;
                })()}
                style={styles.image}
                resizeMode="cover"
            />

            {data.phaseNumber && !data.phaseLabel && (
                <View style={styles.phaseBadge}>
                    <Text style={styles.phaseBadgeText}>Phase {data.phaseNumber}</Text>
                </View>
            )}

            {isCompleted && (
                <View style={styles.checkmarkOverlay}>
                    <Ionicons
                        name="checkmark"
                        size={isSmallDevice ? 22 : 26}
                        color="#FFFFFF"
                    />
                </View>
            )}
        </View>
    );

    const renderActions = () => {
        if (!hasActions) return null;

        return (
            <View style={styles.actionsContainer}>
                {selectionMode && onToggleSelection && (
                    <TouchableOpacity
                        onPress={onToggleSelection}
                        style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected
                        ]}
                    >
                        {isSelected && (
                            <Ionicons name="checkmark" size={16} color="#1A4882" />
                        )}
                    </TouchableOpacity>
                )}
                {showMenu && onMenuPress && !selectionMode && (
                    <TouchableOpacity
                        onPress={(e) => {
                            // Prevent the card wrapper onPress from firing when tapping the menu button.
                            // This avoids accidental navigation instead of opening the action sheet.
                            // (Same pattern used in other card components.)
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (e as any)?.stopPropagation?.();
                            onMenuPress();
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name="ellipsis-vertical"
                            size={isSmallDevice ? 20 : 24}
                            color={iconTintColor}
                        />
                    </TouchableOpacity>
                )}
                {showArrow && (
                    <Ionicons
                        name="chevron-forward"
                        size={isSmallDevice ? 20 : 24}
                        color={iconTintColor}
                    />
                )}
            </View>
        );
    };

    const journeyProgressPercentage = useMemo(() => {
        if (!journeyProgress || journeyProgress.total <= 0) return 0;
        return Math.min(100, Math.round((journeyProgress.completed / journeyProgress.total) * 100));
    }, [journeyProgress]);

    const renderJourneyProgressSection = () => {
        if (!journeyProgress || journeyProgress.total <= 0) return null;
        const { completed, total } = journeyProgress;

        return (
            <View style={styles.progressSection}>
                <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${journeyProgressPercentage}%`,
                                    backgroundColor: progressFillColor,
                                },
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressPercent, { color: secondaryTextColor }]}>
                        {journeyProgressPercentage}%
                    </Text>
                </View>
                <Text style={[styles.progressCounts, { color: secondaryTextColor }]}>
                    {completed} / {total} tasks · {journeyProgressPercentage}% complete
                </Text>
            </View>
        );
    };

    const renderProgressSection = () => {
        if (journeyProgress && journeyProgress.total > 0) {
            return renderJourneyProgressSection();
        }

        if (!hasProgress || !data.taskProgress) return null;

        return (
            <View style={styles.progressSection}>
                <View style={styles.progressRow}>
                    <View style={styles.progressTrack}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${progressPercentage}%`, backgroundColor: progressFillColor },
                            ]}
                        />
                    </View>
                    <Text style={[styles.progressFraction, { color: secondaryTextColor }]}>
                        {data.taskProgress.completed} / {data.taskProgress.total}
                    </Text>
                </View>
                <Text style={[styles.progressLabel, { color: secondaryTextColor }]}>Tasks Completed</Text>
            </View>
        );
    };

    const renderJourneyGuidanceSection = () => {
        if (!journeyGuidance) return null;

        if (journeyGuidance.kind === 'completed') {
            const label = journeyGuidance.bannerText ?? 'Journey Completed';
            return (
                <View style={styles.journeyIntegrated}>
                    <View style={styles.journeyCompleteBanner}>
                        <Ionicons
                            name="checkmark-done-circle"
                            size={JOURNEY_ICON_BADGE}
                            color="rgba(186, 250, 220, 0.95)"
                        />
                        <Text style={styles.journeyCompleteBannerText}>{label}</Text>
                    </View>
                </View>
            );
        }

        const isStart = journeyGuidance.ctaPhase === 'start';
        const ctaLabel = isStart ? 'Start Journey' : 'Continue Journey';
        const a11yLabel = isStart ? 'Start journey: open first task' : 'Continue journey: open next incomplete task';
        const ctaIconColor = '#153C5A';

        return (
            <View style={styles.journeyIntegrated}>
                <View style={styles.nextStepHeaderRow}>
                    <Ionicons
                        name="compass-outline"
                        size={JOURNEY_ICON_COMPASS}
                        color={roadmapTheme.accentGold}
                    />
                    <Text style={styles.nextStepHeading}>Next step</Text>
                </View>
                <Text
                    style={styles.nextStepTitle}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                >
                    {journeyGuidance.nextStepTitle}
                </Text>
                <TouchableOpacity
                    style={styles.journeyCtaBtn}
                    onPress={journeyGuidance.onContinuePress}
                    activeOpacity={0.88}
                    accessibilityRole="button"
                    accessibilityLabel={a11yLabel}
                >
                    {isStart ? (
                        <Ionicons
                            name="play-circle-outline"
                            size={JOURNEY_ICON_CTA}
                            color={ctaIconColor}
                        />
                    ) : (
                        <Ionicons
                            name="arrow-forward-circle-outline"
                            size={JOURNEY_ICON_CTA}
                            color={ctaIconColor}
                        />
                    )}
                    <Text style={styles.journeyCtaBtnText}>{ctaLabel}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <CardWrapper
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardBody}>
                {/* ✅ Use dynamic flex ratios based on hasActions */}
                <View style={[
                    styles.inner,
                    !hasActions && styles.innerNoActions
                ]}>
                    <View style={[
                        styles.left,
                        !hasActions && styles.leftNoActions
                    ]}>
                        {renderImage()}
                        {showCompletionTimeOnLeft && (
                            <Text style={styles.completionTime}>
                                {data.completionTime}
                            </Text>
                        )}
                    </View>

                    <View style={[
                        styles.right,
                        !hasActions && styles.rightNoActions
                    ]}>
                        <View style={styles.titleRow}>
                            <Text
                                style={[
                                    styles.title,
                                    !hasActions && styles.titleNoActions
                                ]}
                                numberOfLines={2}
                            >
                                {data.title}
                            </Text>
                        {renderActions()}
                    </View>

                    {data.description && (
                            <Text
                                style={[
                                    styles.description,
                                    !hasActions && styles.descriptionNoActions
                                ]}
                                numberOfLines={2}
                            >
                                {data.description}
                            </Text>
                        )}

                        {!!data.phaseLabel && (
                            <View style={[styles.phasePill, !hasActions && styles.phasePillNoActions]}>
                                <Text style={styles.phasePillText} numberOfLines={1}>
                                    {data.phaseContextPrefix ?? "Phase"} : {data.phaseLabel}
                                </Text>
                            </View>
                        )}

                        {data.completionTime && !data.status && (
                            <Text style={[
                                styles.completionTimeText,
                                !hasActions && styles.completionTimeTextNoActions
                            ]}>
                                {data.completionTime}
                            </Text>
                        )}

                        {statusConfig && (
                            <View style={[
                                styles.statusRow,
                                !hasActions && styles.statusRowNoActions
                            ]}>
                                <View
                                    style={[
                                        styles.statusPill,
                                        { backgroundColor: statusConfig.bg, borderColor: statusConfig.accent },
                                    ]}
                                >
                                    <Text style={styles.statusPillLabel}>Status</Text>
                                    <Text style={styles.statusPillDot}>•</Text>
                                    <Text
                                        style={styles.statusPillValue}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {statusConfig.text}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {renderProgressSection()}

                        {isCompleted && data.completedDate && (
                            <Text style={[
                                styles.completedDate,
                                !hasActions && styles.completedDateNoActions
                            ]}>
                                {data.completedDateDisplay === 'plain'
                                    ? data.completedDate
                                    : `Completed on : ${data.completedDate}`}
                            </Text>
                        )}
                    </View>
                </View>

                {renderJourneyGuidanceSection()}
            </View>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        overflow: 'hidden',
        paddingVertical: 14,
        paddingHorizontal: 14,
    },
    cardBody: {
        width: '100%',
        minWidth: 0,
    },
    journeyIntegrated: {
        width: '100%',
        marginTop: getSpacing(14),
        paddingTop: getSpacing(16),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: roadmapTheme.divider,
    },
    nextStepHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getSpacing(8),
        marginBottom: getSpacing(6),
    },
    nextStepHeading: {
        fontSize: getFontSize(12.5),
        fontWeight: '700',
        letterSpacing: 0.2,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.70)',
    },
    nextStepTitle: {
        fontSize: getFontSize(isSmallDevice ? 15 : 16),
        fontWeight: '600',
        color: roadmapTheme.textPrimary,
        lineHeight: getFontSize(isSmallDevice ? 21 : 22),
        marginBottom: getSpacing(12),
    },
    journeyCtaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 11,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignSelf: 'stretch',
    },
    journeyCtaBtnText: {
        color: '#153C5A',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: 0.15,
    },
    journeyCompleteBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: getSpacing(4),
    },
    journeyCompleteBannerText: {
        color: 'rgba(255,255,255,0.94)',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.15,
        flexShrink: 1,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minWidth: 0,
    },
    // ✅ When no actions, use different layout
    innerNoActions: {
        // No changes needed, flexDirection remains 'row'
    },
    left: {
        marginRight: 12,
        alignItems: 'flex-start',
        flexShrink: 0,
    },
    // ✅ When no actions, left section matches assessment thumbnail column width
    leftNoActions: {
        width: 128,
        maxWidth: 128,
    },
    imageContainer: {
        position: 'relative',
        width: 128,
        height: 138,
        borderRadius: 14,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.75)',
        overflow: 'hidden',
        backgroundColor: '#00ABAE',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
        backgroundColor: '#2A5080',
    },
    phaseBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(250, 204, 21, 0.28)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    phaseBadgeText: {
        color: '#FDE68A',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    checkmarkOverlay: {
        position: 'absolute',
        right: 8,
        top: 8,
        width: isSmallDevice ? 34 : 38,
        height: isSmallDevice ? 34 : 38,
        borderRadius: isSmallDevice ? 17 : 19,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#052E16',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 4,
    },
    completionTime: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 16,
        marginTop: 12,
    },
    right: {
        flex: 1,
        minWidth: 0,
    },
    // ✅ When no actions, right section takes remaining 70%
    rightNoActions: {
        flex: 1,
        paddingRight: 22,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: getSpacing(6),
        minWidth: 0,
    },
    title: {
        flex: 1,
        fontSize: getFontSize(isSmallDevice ? 15 : 17),
        fontWeight: '800',
        letterSpacing: -0.2,
        color: roadmapTheme.textPrimary,
        lineHeight: getFontSize(isSmallDevice ? 20 : 23),
        paddingRight: getSpacing(40),
        minWidth: 0,
    },
    // ✅ When no actions, no padding needed for actions space
    titleNoActions: {
        paddingRight: 0,
    },
    actionsContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        position: 'absolute',
        right: 0,
        top: 0,
        gap: 12,
        flexShrink: 0,
        width: 32,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxSelected: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    description: {
        fontSize: getFontSize(isSmallDevice ? 12.5 : 13.5),
        fontWeight: '500',
        color: roadmapTheme.textMuted,
        marginBottom: getSpacing(10),
        lineHeight: getFontSize(18),
        paddingRight: getSpacing(40),
        minWidth: 0,
    },
    // ✅ Remove padding when no actions
    descriptionNoActions: {
        paddingRight: 0,
    },
    phasePill: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        borderRadius: 12,
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(8),
        alignSelf: 'flex-start',
        marginTop: getSpacing(-2),
        marginBottom: getSpacing(10),
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingRight: getSpacing(12),
        minWidth: 0,
        maxWidth: '100%',
    },
    phasePillNoActions: {
        // keep same; placeholder for any no-actions tweaks
    },
    phasePillText: {
        color: '#FFFFFF',
        fontSize: getFontSize(13),
        fontWeight: '600',
        opacity: 0.95,
    },
    statusRow: {
        marginTop: getSpacing(6),
        paddingRight: getSpacing(40),
    },
    statusRowNoActions: {
        paddingRight: 0,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'nowrap',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        paddingHorizontal: getSpacing(10),
        paddingVertical: getSpacing(6),
        borderRadius: 12,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.08)',
        flexShrink: 0,
        maxWidth: '100%',
        gap: 5,
    },
    statusPillLabel: {
        color: 'rgba(255,255,255,0.82)',
        fontSize: getFontSize(12.5),
        fontWeight: '600',
        flexShrink: 0,
    },
    statusPillDot: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: getFontSize(12.5),
        fontWeight: '700',
        flexShrink: 0,
    },
    statusPillValue: {
        color: roadmapTheme.textPrimary,
        fontSize: getFontSize(12.5),
        fontWeight: '800',
        flexShrink: 1,
    },
    progressSection: {
        marginTop: getSpacing(12),
        paddingRight: getSpacing(40),
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: getSpacing(6),
        minWidth: 0,
    },
    progressTrack: {
        flex: 1,
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: getSpacing(12),
        minWidth: 50,
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.55)',
    },
    progressFraction: {
        color: '#fff',
        fontSize: getFontSize(14),
        fontWeight: '600',
        flexShrink: 0,
        minWidth: 40,
    },
    progressPercent: {
        fontSize: getFontSize(14),
        fontWeight: '700',
        flexShrink: 0,
        minWidth: 38,
        textAlign: 'right',
    },
    progressCounts: {
        fontSize: getFontSize(13),
        fontWeight: '600',
        marginTop: getSpacing(6),
    },
    progressLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: getFontSize(12),
        fontWeight: '400',
    },
    completedDate: {
        color: 'rgba(255,255,255,0.85)',
        marginTop: getSpacing(10),
        fontSize: getFontSize(13),
        fontWeight: '600',
        paddingRight: getSpacing(40),
        minWidth: 0,
    },
    completedDateNoActions: {
        paddingRight: 0,
    },
    completionTimeText: {
        fontSize: getFontSize(14),
        fontWeight: '400',
        color: 'rgba(255,255,255,0.8)',
        lineHeight: getFontSize(18),
        marginTop: getSpacing(6),
        paddingRight: getSpacing(40),
        minWidth: 0,
    },
    completionTimeTextNoActions: {
        paddingRight: 0,
    },
});

export default RoadmapCard;

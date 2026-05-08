// components/director/ProgressRoadmapCard.tsx
import { RoadmapCardData } from '@/lib/roadmap/types';
import { icons } from '@/constants/images';
import { getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  data: RoadmapCardData & { phaseNumber?: number };
  onPress?: () => void;
  showMenu?: boolean;
  onMenuPress?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

export const RoadmapCard: React.FC<Props> = ({
    data,
    onPress,
    showMenu,
    onMenuPress,
    selectionMode,
    isSelected,
    onToggleSelection,
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

    const showCompletionTimeOnLeft = data.completionTime && data.status;
    const CardWrapper = onPress ? TouchableOpacity : View;

    const accentBorderColor = useMemo(() => {
        if (statusConfig?.accent) return statusConfig.accent;
        return 'rgba(255,255,255,0.14)';
    }, [statusConfig]);

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
                    <Ionicons name="checkmark" size={isSmallDevice ? 32 : 40} color="#fff" />
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

    const renderProgressSection = () => {
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

    return (
        <CardWrapper
            style={[styles.card, { borderLeftColor: accentBorderColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
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
                                Phase : {data.phaseLabel}
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
                                <Text style={styles.statusPillText}>
                                    Status  •  {statusConfig.text}
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
                            Completed on : {data.completedDate}
                        </Text>
                    )}
                </View>
            </View>
        </CardWrapper>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        overflow: 'hidden',
        borderLeftWidth: 3,
        padding: getSpacing(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 10,
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
        marginRight: getSpacing(16),
        alignItems: 'flex-start',
        flexShrink: 0,
    },
    // ✅ When no actions, left section takes 30% width
    leftNoActions: {
        width: '30%',
        maxWidth: 140,
    },
    imageContainer: {
        position: 'relative',
        width: getSpacing(100),
        height: getSpacing(100),
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
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
        width: isSmallDevice ? 36 : 44,
        height: isSmallDevice ? 36 : 44,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingRight: 0,
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
        fontWeight: '700',
        color: '#FFFFFF',
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
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)',
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
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(7),
        borderRadius: 12,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.08)',
        flexShrink: 1,
    },
    statusPillText: {
        color: '#FFFFFF',
        fontSize: getFontSize(13),
        fontWeight: '600',
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
    progressLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: getFontSize(12),
        fontWeight: '400',
    },
    completedDate: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: getSpacing(10),
        fontSize: getFontSize(13),
        fontWeight: '400',
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

import { getFontSize, getImageSize, getSpacing, isMediumDevice, isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type RoadmapCardStatus = 'initial' | 'in-progress' | 'completed' | 'due';

export interface RoadmapCardData {
    image: ImageSourcePropType;
    title: string;
    description?: string;
    completionTime?: string;
    status?: RoadmapCardStatus;
    completedDate?: string;
    taskProgress?: {
        completed: number;
        total: number;
    };
    showArrow?: boolean;
    showCheckmark?: boolean;

}

interface Props {
    data: RoadmapCardData;
    onPress?: () => void;
    showMenu?: boolean;
    onMenuPress?: () => void;
}

export const RoadmapCard: React.FC<Props> = ({ data,
    onPress,
    showMenu,
    onMenuPress
}) => {
    const isCompleted = data.status === 'completed';
    const hasProgress = data.taskProgress && data.status !== 'completed';
    const showArrow = data.showArrow && !isCompleted;
    const progressPercentage = data.taskProgress
        ? Math.min(100, (data.taskProgress.completed / data.taskProgress.total) * 100)
        : 0;

    // Determine status display
    const getStatusText = () => {
        if (data.status === 'completed') return 'Completed';
        if (data.status === 'due') return 'Due';
        if (data.status === 'in-progress') return 'In Progress';
        if (data.status === 'initial') return 'Not Started Yet';
        return null;
    };

    const getStatusColor = () => {
        if (data.status === 'completed') return '#fff';
        if (data.status === 'due') return '#FFD700';
        if (data.status === 'initial') return 'rgba(255,255,255,0.8)';
        return '#fff';
    };

    const statusText = getStatusText();

    // Show completion time on left when status exists
    const showCompletionTimeOnLeft = data.completionTime && data.status;

    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.inner}>
                {/* Left Section - Image + Completion Time */}
                <View style={styles.left}>
                    <View style={styles.imageContainer}>
                        <Image source={data.image} style={styles.image} />
                        {isCompleted && (
                            <View style={styles.checkmarkOverlay}>
                                <Ionicons name="checkmark" size={isSmallDevice ? 32 : 40} color="#fff" />
                            </View>
                        )}
                    </View>

                    {/* Show completion time below image */}
                    {showCompletionTimeOnLeft && (
                        <Text style={styles.completionTime}>
                            {data.completionTime}
                        </Text>
                    )}
                </View>

                {/* Right Section - Content */}
                <View style={styles.right}>
                    {/* Title Row */}
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={2}>
                            {data.title}
                        </Text>
                        <View style={styles.actionsContainer}>

                            {showMenu && onMenuPress && (
                                <TouchableOpacity onPress={onMenuPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons
                                        name="ellipsis-vertical"
                                        size={isSmallDevice ? 20 : 24}
                                        color="rgba(255,255,255,0.6)"
                                        style={{
                                            marginLeft: 8,
                                            // marginTop: 2,
                                            flexShrink: 0,

                                        }}
                                    />
                                </TouchableOpacity>
                            )}
                            {showArrow && (
                                <Ionicons
                                    name="chevron-forward"
                                    size={isSmallDevice ? 20 : 24}
                                    color="rgba(255,255,255,0.6)"
                                    style={styles.arrowIcon}
                                />
                            )}
                        </View>

                    </View>

                    {/* Description */}
                    {data.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {data.description}
                        </Text>
                    )}

                    {/* Completion Time Text - show below description when no status */}
                    {data.completionTime && !data.status && (
                        <Text style={styles.completionTimeText}>
                            {data.completionTime}
                        </Text>
                    )}

                    {/* Status Badge */}
                    {statusText && (
                        <View style={styles.statusRow}>
                            <View style={styles.statusPill}>
                                <Text style={[styles.statusPillText, { color: getStatusColor() }]}>
                                    Status  •  {statusText}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Progress Bar Section */}
                    {hasProgress && data.taskProgress && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressRow}>
                                <View style={styles.progressTrack}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { width: `${progressPercentage}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressFraction}>
                                    {data.taskProgress.completed} / {data.taskProgress.total}
                                </Text>
                            </View>
                            <Text style={styles.progressLabel}>Tasks Completed</Text>
                        </View>
                    )}

                    {/* Completion Date */}
                    {isCompleted && data.completedDate && (
                        <Text style={styles.completedDate}>
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
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        overflow: 'hidden',
        marginBottom: getSpacing(18),
        padding: getSpacing(12),
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minWidth: 0, // Prevent overflow
    },
    left: {
        width: getImageSize(isSmallDevice ? 80 : isMediumDevice ? 90 : 96),
        marginRight: getSpacing(16),
        alignItems: 'flex-start',
        flexShrink: 0,
    },
    imageContainer: {
        position: 'relative',
        width: getImageSize(isSmallDevice ? 80 : isMediumDevice ? 90 : 96),
        height: getImageSize(isSmallDevice ? 80 : isMediumDevice ? 90 : 96),
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#2A5080',
    },
    checkmarkOverlay: {
        position: 'absolute',
        // bottom: 8,
        right: 8,
        width: isSmallDevice ? 36 : 44,
        // height: isSmallDevice ? 36 : 44,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    completionTime: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: getFontSize(13),
        fontWeight: '400',
        lineHeight: getFontSize(16),
        marginTop: getSpacing(12),
    },
    right: {
        flex: 1,
        minWidth: 0, // Prevent overflow
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: getSpacing(6),
        minWidth: 0, // Prevent overflow
    },
    title: {
        flex: 1,
        fontSize: getFontSize(isSmallDevice ? 15 : 17),
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: getFontSize(isSmallDevice ? 20 : 23),
        paddingRight: getSpacing(40), // Account for action buttons
        minWidth: 0, // Prevent overflow
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
        height: '100%',
    },
    arrowIcon: {
        marginLeft: 8,
        // marginTop: 2,
        flexShrink: 0,
    },
    description: {
        fontSize: getFontSize(isSmallDevice ? 12.5 : 13.5),
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: getSpacing(10),
        lineHeight: getFontSize(18),
        paddingRight: getSpacing(40), // Account for action buttons
        minWidth: 0, // Prevent overflow
    },
    statusRow: {
        marginTop: getSpacing(6),
        paddingRight: getSpacing(40), // Account for action buttons
    },
    statusPill: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(8),
        borderRadius: 12,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.08)',
        flexShrink: 1,
    },
    statusPillText: {
        fontSize: getFontSize(13),
        fontWeight: '600',
    },
    progressSection: {
        marginTop: getSpacing(12),
        paddingRight: getSpacing(40), // Account for action buttons
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: getSpacing(6),
        minWidth: 0, // Prevent overflow
    },
    progressTrack: {
        flex: 1,
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: getSpacing(12),
        minWidth: 50, // Minimum track width
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1f2b55',
    },
    progressFraction: {
        color: '#fff',
        fontSize: getFontSize(14),
        fontWeight: '600',
        flexShrink: 0,
        minWidth: 40, // Minimum width for fraction text
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
        paddingRight: getSpacing(40), // Account for action buttons
        minWidth: 0, // Prevent overflow
    },
    completionTimeText: {
        fontSize: getFontSize(14),
        fontWeight: '400',
        color: 'rgba(255,255,255,0.8)',
        lineHeight: getFontSize(18),
        marginTop: getSpacing(6),
        paddingRight: getSpacing(40), // Account for action buttons
        minWidth: 0, // Prevent overflow
    },
});

export default RoadmapCard;


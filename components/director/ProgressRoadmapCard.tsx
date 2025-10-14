import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
                                <Ionicons name="checkmark" size={40} color="#fff" />
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
                        <View style={{ flexDirection: 'column', alignItems: 'center', position: 'absolute', right: 0, top: 0, gap: 8 }}>

                            {showMenu && onMenuPress && (
                                <TouchableOpacity onPress={onMenuPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons
                                        name="ellipsis-vertical"
                                        size={24}
                                        color="rgba(255,255,255,0.6)"
                                        style={styles.arrowIcon}
                                    />
                                </TouchableOpacity>
                            )}
                            {showArrow && (
                                <Ionicons
                                    name="chevron-forward"
                                    size={24}
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
        marginBottom: 18,
        padding: 12,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    left: {
        width: 96,
        marginRight: 16,
        alignItems: 'flex-start',
    },
    imageContainer: {
        position: 'relative',
        width: 96,
        height: 96,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#2A5080',
    },
    checkmarkOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 44,
        height: 44,
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
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    title: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        lineHeight: 23,
    },
    arrowIcon: {
        marginLeft: 8,
        marginTop: 2,
        flexShrink: 0,
    },
    description: {
        fontSize: 13.5,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: 10,
        lineHeight: 18,
    },
    statusRow: {
        marginTop: 6,
    },
    statusPill: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    statusPillText: {
        fontSize: 13,
        fontWeight: '600',
    },
    progressSection: {
        marginTop: 12,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressTrack: {
        flex: 1,
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#1f2b55',
    },
    progressFraction: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        flexShrink: 0,
    },
    progressLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '400',
    },
    completedDate: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 10,
        fontSize: 13,
        fontWeight: '400',
    },
    completionTimeText: {
        fontSize: 14,
        fontWeight: '400',
        color: 'rgba(255,255,255,0.8)',
        lineHeight: 18,
        marginTop: 6,
        width: '100%',
    },
});

export default RoadmapCard;


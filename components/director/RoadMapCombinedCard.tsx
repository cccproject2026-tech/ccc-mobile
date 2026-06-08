import { getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type RoadmapCardStatus = 'initial' | 'in-progress' | 'completed' | 'due' | 'Not Started' | 'Not Started Yet';
export type RoadmapCardVariant = 'full' | 'simple';

export interface TaskStatus {
    started?: boolean;
    inProgress: number;
    toComplete: number;
}

export interface MeetingData {
    scheduled: string;
}

export interface RoadmapCardData {
    image: ImageSourcePropType;
    title: string;
    description?: string;
    time?: string;
    status?: RoadmapCardStatus;
    completionDate?: string;
    sessionDate?: string;
    phase?: string;
    taskStatus?: TaskStatus;
    taskProgress?: {
        completed: number;
        total: number;
    };
    meeting?: MeetingData;
    showArrow?: boolean;
    showBothDate?: boolean;
    
    assignment?: boolean;
    subPhase?: boolean;
    empowerment?: boolean;
}

interface Props {
    data: RoadmapCardData;
    variant?: RoadmapCardVariant;
    onPress?: () => void;
    showMenu?: boolean;
    onMenuPress?: () => void;
    
    navigation?: any;
    pathname?: string;
}

export const UnifiedRoadmapCard: React.FC<Props> = ({
    data,
    variant = 'simple',
    onPress,
    showMenu,
    onMenuPress,
    navigation,
    pathname
}) => {
    const isFull = variant === 'full';

    // Normalize status
    const normalizedStatus = (() => {
        if (data.status === 'Not Started' || data.status === 'Not Started Yet') return 'initial';
        if (data.status === 'completed' || data.status === 'Completed') return 'completed';
        if (data.status === 'due' || data.status === 'Due') return 'due';
        if (data.status === 'in-progress') return 'in-progress';
        return data.status;
    })();

    const isCompleted = normalizedStatus === 'completed';
    const isDue = normalizedStatus === 'due';
    const isNotStarted = normalizedStatus === 'initial';

    
    const hasProgress = data.taskStatus?.started || (data.taskProgress && !isCompleted);
    const progressPercentage = data.taskStatus
        ? (data.taskStatus.inProgress / data.taskStatus.toComplete) * 100
        : data.taskProgress
            ? (data.taskProgress.completed / data.taskProgress.total) * 100
            : 0;

    
    const getStatusText = () => {
        if (normalizedStatus === 'completed') return 'Completed';
        if (normalizedStatus === 'due') return 'Due';
        if (normalizedStatus === 'in-progress') return 'In Progress';
        if (normalizedStatus === 'initial') return 'Not Started';
        return data.status || null;
    };

    const getStatusColor = () => {
        if (normalizedStatus === 'completed') return '#fff';
        if (normalizedStatus === 'due') return '#FFD700';
        if (normalizedStatus === 'initial') return 'rgba(255,255,255,0.8)';
        return '#fff';
    };

    const statusText = getStatusText();

    
    const handleNavigation = () => {
        if (isFull && navigation && pathname) {
            if (pathname === "/roadmap/phase-1/revitalization-roadmap") {
                typeof data.assignment !== "undefined" && data.assignment
                    ? navigation.push({
                        pathname: "/(pastor-tabs)/profile/my-assignment/detailed-assignment",
                        params: { data: JSON.stringify(data) },
                    })
                    : typeof data.subPhase !== "undefined" && data.subPhase
                        ? navigation.push({
                            pathname: "/(pastor-tabs)/roadmap/sub-phases",
                            params: { data: JSON.stringify(data) },
                        })
                        : navigation.push({
                            pathname: "/(pastor-tabs)/roadmap/phase-1/detailed-roadmap",
                            params: { data: JSON.stringify(data) },
                        });
            } else if (pathname === "/roadmap/phase-2/revitalization-roadmap") {
                typeof data.assignment !== "undefined" && data.assignment
                    ? navigation.push({
                        pathname: "/(pastor-tabs)/profile/my-assignment/detailed-assignment",
                        params: { data: JSON.stringify(data) },
                    })
                    : typeof data.subPhase !== "undefined" && data.subPhase
                        ? navigation.push({
                            pathname: "/(pastor-tabs)/roadmap/sub-phases",
                            params: { data: JSON.stringify(data) },
                        })
                        : data.empowerment
                            ? navigation.push({
                                pathname: "/(pastor-tabs)/roadmap/phase-2/detailed-empowerment",
                                params: { data: JSON.stringify(data) },
                            })
                            : navigation.push({
                                pathname: "/(pastor-tabs)/roadmap/phase-2/detailed-roadmap",
                                params: { data: JSON.stringify(data) },
                            });
            } else if (pathname === "/roadmap/landing/landing") {
                typeof data.assignment !== "undefined" && data.assignment
                    ? navigation.push({
                        pathname: "/(mentor)/profile/my-assignment/detailed-assignment",
                        params: { data: JSON.stringify(data) },
                    })
                    : typeof data.subPhase !== "undefined" && data.subPhase
                        ? navigation.push({
                            pathname: "/(mentor)/roadmap/sub-phases",
                            params: { data: JSON.stringify(data) },
                        })
                        : data.empowerment
                            ? navigation.push({
                                pathname: "/(mentor)/roadmap/phase-2/detailed-empowerment",
                                params: { data: JSON.stringify(data) },
                            })
                            : navigation.push({
                                pathname: "/(mentor)/roadmap/phase-2/detailed-roadmap",
                                params: { data: JSON.stringify(data) },
                            });
            }
        } else if (onPress) {
            onPress();
        }
    };

    const CardWrapper = TouchableOpacity;

    
    if (isFull) {
        return (
            <CardWrapper
                style={styles.fullCard}
                onPress={handleNavigation}
                activeOpacity={0.7}
            >
                <View style={styles.fullInner}>
                    {}
                    <View style={styles.fullLeft}>
                        <View style={styles.fullImageContainer}>
                            <Image source={data.image} style={styles.fullImage} />
                            {data.phase && (
                                <View style={styles.fullPhaseBadge}>
                                    <Text style={styles.fullPhaseBadgeText}>{data.phase}</Text>
                                </View>
                            )}
                        </View>
                        {data.time && (
                            <Text style={styles.fullTime}>{data.time}</Text>
                        )}
                    </View>

                    {}
                    <View style={styles.fullRight}>
                        <Text style={styles.fullTitle} ellipsizeMode="tail">
                            {data.title}
                        </Text>

                        {data.description && (
                            <Text style={styles.fullDescription}>{data.description}</Text>
                        )}

                        {}
                        {statusText && (
                            <View style={styles.fullStatusContainer}>
                                <Text style={styles.fullStatusText}>
                                    Status{' '}
                                    <Text style={styles.fullStatusDot}>•</Text>{' '}
                                    <Text style={[
                                        styles.fullStatusValue,
                                        { color: getStatusColor() }
                                    ]}>
                                        {statusText}
                                    </Text>
                                </Text>
                            </View>
                        )}

                        {}
                        {data.sessionDate && isNotStarted && !data.showBothDate && (
                            <View style={styles.sessionDateBox}>
                                <Text style={styles.sessionDateLabel}>Session Date :</Text>
                                <View style={styles.sessionDateInner}>
                                    <Text style={styles.sessionDateValue}>{data.sessionDate}</Text>
                                </View>
                            </View>
                        )}

                        {}
                        {hasProgress && (
                            <View style={styles.progressContainer}>
                                <View style={styles.progressWrapper}>
                                    <View style={styles.progressBarBg}>
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                { width: `${progressPercentage}%` }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.progressText}>
                                        {' '}{data.taskStatus?.inProgress || data.taskProgress?.completed} /{' '}
                                        {data.taskStatus?.toComplete || data.taskProgress?.total}
                                    </Text>
                                </View>
                                <Text style={styles.progressLabel}>Tasks Completed</Text>
                            </View>
                        )}

                        {}
                        {isCompleted && data.completionDate && (
                            <Text style={styles.fullCompletionDate}>
                                Completed on : {data.completionDate}
                            </Text>
                        )}
                    </View>
                </View>

                {}
                {data.showBothDate && data.sessionDate && isNotStarted && (
                    <View style={styles.doubleDateContainer}>
                        <View style={styles.dateColumn}>
                            <Text style={styles.sessionDateLabel}>Session Date :</Text>
                            <View style={styles.sessionDateInner}>
                                <Text style={styles.sessionDateValue}>{data.sessionDate}</Text>
                            </View>
                        </View>
                        <View style={styles.dateColumn}>
                            <Text style={styles.sessionDateLabel}>Session Date :</Text>
                            <View style={styles.sessionDateInner}>
                                <Text style={styles.sessionDateValue}>{data.sessionDate}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {}
                {data.showBothDate && data.meeting && (
                    <LinearGradient
                        colors={['#B83AF3', '#21B6E9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.meetingGradient}
                    >
                        <View style={styles.meetingInner}>
                            <Text style={styles.meetingText}>
                                Meeting Scheduled on 25 {data.meeting.scheduled}
                            </Text>
                            <TouchableOpacity onPress={onMenuPress}>
                                <Ionicons
                                    name="ellipsis-horizontal"
                                    size={24}
                                    color="#fff"
                                />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                )}
            </CardWrapper>
        );
    }

    
    return (
        <CardWrapper
            style={styles.card}
            onPress={handleNavigation}
            activeOpacity={0.7}
        >
            <View style={styles.inner}>
                {}
                <View style={styles.left}>
                    <View style={styles.imageContainer}>
                        <Image source={data.image} style={styles.image} />
                        {data.phase && (
                            <View style={styles.phaseBadge}>
                                <Text style={styles.phaseBadgeText}>{data.phase}</Text>
                            </View>
                        )}
                        {isCompleted && (
                            <View style={styles.checkmarkOverlay}>
                                <Ionicons name="checkmark" size={isSmallDevice ? 32 : 40} color="#fff" />
                            </View>
                        )}
                    </View>
                    {data.time && (
                        <Text style={styles.completionTime}>{data.time}</Text>
                    )}
                </View>

                {}
                <View style={styles.right}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={2}>
                            {data.title}
                        </Text>
                        <View style={styles.actionsContainer}>
                            {showMenu && onMenuPress && (
                                <TouchableOpacity
                                    onPress={onMenuPress}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name="ellipsis-vertical"
                                        size={isSmallDevice ? 20 : 24}
                                        color="rgba(255,255,255,0.6)"
                                    />
                                </TouchableOpacity>
                            )}
                            {data.showArrow && !isCompleted && (
                                <Ionicons
                                    name="chevron-forward"
                                    size={isSmallDevice ? 20 : 24}
                                    color="rgba(255,255,255,0.6)"
                                />
                            )}
                        </View>
                    </View>

                    {data.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {data.description}
                        </Text>
                    )}

                    {}
                    {statusText && (
                        <View style={styles.statusRow}>
                            <View style={styles.statusPill}>
                                <Text style={[styles.statusPillText, { color: getStatusColor() }]}>
                                    Status  •  {statusText}
                                </Text>
                            </View>
                        </View>
                    )}

                    {}
                    {hasProgress && (
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
                                    {data.taskStatus?.inProgress || data.taskProgress?.completed} / {data.taskStatus?.toComplete || data.taskProgress?.total}
                                </Text>
                            </View>
                            <Text style={styles.progressLabel}>Tasks Completed</Text>
                        </View>
                    )}

                    {}
                    {isCompleted && data.completionDate && (
                        <Text style={styles.completedDate}>
                            Completed on : {data.completionDate}
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
        marginBottom: getSpacing(18),
        padding: getSpacing(12),
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        minWidth: 0,
    },
    left: {
        width: 90,
        marginRight: getSpacing(16),
        alignItems: 'flex-start',
        flexShrink: 0,
    },
    imageContainer: {
        position: 'relative',
        width: 90,
        height: 90,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
        backgroundColor: '#2A5080',
    },
    phaseBadge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: '#d7f96c',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    phaseBadgeText: {
        color: '#000',
        fontSize: 10,
        fontWeight: '700',
    },
    checkmarkOverlay: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: isSmallDevice ? 36 : 44,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
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
    description: {
        fontSize: getFontSize(isSmallDevice ? 12.5 : 13.5),
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: getSpacing(10),
        lineHeight: getFontSize(18),
        paddingRight: getSpacing(40),
        minWidth: 0,
    },
    statusRow: {
        marginTop: getSpacing(6),
        paddingRight: getSpacing(40),
    },
    statusPill: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(8),
        borderRadius: 12,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    statusPillText: {
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
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 8,
        overflow: 'hidden',
        marginRight: getSpacing(12),
        minWidth: 50,
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
    },

    
    fullCard: {
        backgroundColor: '#194F82',
        borderRadius: 10,
        padding: 16,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
    },
    fullInner: {
        flexDirection: 'row',
    },
    fullLeft: {
        width: 110,
        height: 100,
        alignItems: 'center',
        marginRight: 10,
    },
    fullImageContainer: {
        position: 'relative',
        width: 110,
        height: 100,
    },
    fullImage: {
        width: 110,
        height: 100,
        borderRadius: 12,
    },
    fullPhaseBadge: {
        position: 'absolute',
        bottom: 10,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(241, 233, 26, 0.52)',
        padding: 4,
        borderRadius: 8,
    },
    fullPhaseBadgeText: {
        color: '#000',
        fontWeight: '600',
        fontSize: 12,
        textAlign: 'center',
    },
    fullTime: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
        lineHeight: 22,
        marginTop: 8,
    },
    fullRight: {
        flex: 1,
        gap: 2,
    },
    fullTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    fullDescription: {
        paddingVertical: 8,
        color: 'rgba(244, 242, 242, 0.71)',
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 18,
    },
    fullStatusContainer: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginVertical: 4,
        borderRadius: 12,
        maxWidth: '80%',
    },
    fullStatusText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    fullStatusDot: {
        color: '#fff',
        fontWeight: '900',
    },
    fullStatusValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    sessionDateBox: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 10,
        marginVertical: 12,
        borderRadius: 12,
        width: '80%',
    },
    sessionDateLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        paddingBottom: 4,
    },
    sessionDateInner: {
        borderWidth: 1,
        borderColor: '#47729b',
        padding: 6,
        marginVertical: 4,
        width: '75%',
        borderRadius: 12,
    },
    sessionDateValue: {
        textAlign: 'center',
        fontSize: 12,
        color: '#fff',
        fontWeight: '300',
    },
    progressContainer: {
        marginTop: 4,
    },
    progressWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBarBg: {
        backgroundColor: '#000',
        borderRadius: 10,
        width: '80%',
        height: 6,
    },
    progressBarFill: {
        backgroundColor: '#fff',
        height: 6,
        borderRadius: 10,
    },
    progressText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '300',
        paddingLeft: 4,
    },
    fullCompletionDate: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '300',
    },
    doubleDateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 10,
        marginVertical: 12,
        borderRadius: 12,
        width: '95%',
        marginHorizontal: 'auto',
    },
    dateColumn: {
        alignItems: 'center',
    },
    meetingGradient: {
        borderRadius: 10,
        padding: 2,
        marginVertical: 12,
        width: '95%',
        marginHorizontal: 'auto',
    },
    meetingInner: {
        backgroundColor: '#233A6F',
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 7,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    meetingText: {
        fontSize: 16,
        color: 'yellow',
        fontWeight: '600',
        lineHeight: 20,
        paddingVertical: 4,
    },
});

export default UnifiedRoadmapCard;

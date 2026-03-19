import { AssessmentProgress } from '@/constants/mockData';
import { icons } from '@/constants/images';
import { useAuthStore } from '@/stores/auth.store';
import type { Assessment } from '@/types/assessment.types';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    data: AssessmentProgress | Assessment;
    onDevelopmentPlanPress?: () => void;
    onPress?: () => void;
}

export const ProgressAssessmentCard: React.FC<Props> = ({ data, onDevelopmentPlanPress, onPress }) => {
    const statusLower = data.status.toLowerCase();
    const isCompleted = statusLower === 'completed';
    const { user } = useAuthStore();

    const formatDisplayDate = (value?: string): string | null => {
        if (!value) return null;
        const parsed = Date.parse(value);
        if (Number.isNaN(parsed)) return value;
        return new Date(parsed).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const imageSource: ImageSourcePropType = (() => {
        const maybeImage = (data as any)?.image;
        if (maybeImage) {
            if (typeof maybeImage === 'number') return maybeImage;
            if (typeof maybeImage === 'string') return { uri: maybeImage };
            if (typeof maybeImage === 'object' && (maybeImage as any).uri) return maybeImage;
        }

        // Fallback for API-backed assessments (no image field).
        if (user?.profilePicture) return { uri: user.profilePicture };
        return icons.myProfile;
    })();

    const dateLabel = (() => {
        const submittedDate = (data as any)?.submittedDate;
        const dueDate = (data as any)?.dueDate;
        const completionDate = (data as any)?.completionDate;
        const completedOn = (data as any)?.completedOn;
        const createdAt = (data as any)?.createdAt;

        const submitted = formatDisplayDate(submittedDate);
        const due = formatDisplayDate(dueDate);
        const completed = formatDisplayDate(completionDate || completedOn);
        const created = formatDisplayDate(createdAt);

        if (submitted) return `Submitted on : ${submitted}`;
        if (statusLower === 'submitted' && (completionDate || completedOn || createdAt)) {
            return `Submitted on : ${completed || created || completionDate || completedOn || createdAt}`;
        }
        if (isCompleted && (completionDate || completedOn)) return `Completed on : ${completed || completionDate || completedOn}`;
        if (due) return `Due : ${due}`;
        return null;
    })();

    const renderCustomizedBadge = () => (
        <TouchableOpacity
            onPress={(event) => {
                event?.stopPropagation?.();
                onDevelopmentPlanPress?.();
            }}
            style={styles.customBadge}>
            <Text style={styles.customBadgeText}>Customized Development Plans</Text>
        </TouchableOpacity>
    );

    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper style={styles.card} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image source={imageSource} style={styles.image} />
                </View>

                <View style={styles.textContent}>
                    <Text style={styles.title} numberOfLines={2}>{data.title}</Text>
                    {data.description && <Text style={styles.description} numberOfLines={2}>{data.description}</Text>}
                    {isCompleted && renderCustomizedBadge()}
                    {dateLabel ? <Text style={styles.dateText}>{dateLabel}</Text> : null}
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
        marginBottom: 14,
    },
    content: {
        flexDirection: 'row',
        padding: 14,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },
    imageContainer: {
        width: '28%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 14,
        flexShrink: 0,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    textContent: {
        flex: 1,
        minWidth: 0,
        justifyContent: 'flex-start',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 6,
        lineHeight: 23,
    },
    description: {
        fontSize: 13.5,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.75)',
        marginBottom: 10,
        lineHeight: 18,
    },
    customBadge: {
        alignSelf: 'flex-start',
        borderWidth: 1.5,
        borderColor: 'rgba(0, 255, 255, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 18,
        marginBottom: 8,
    },
    customBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFD700',
    },
    dateText: {
        fontSize: 12.5,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.68)',
        marginTop: 2,
    },
});

export default ProgressAssessmentCard;

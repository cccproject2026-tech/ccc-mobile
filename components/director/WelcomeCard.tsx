import { isSmallDevice } from '@/utils/responsive';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

type Props = {
    onClick?: () => void;
    avatar: any;
    message: string;
    progress?: number;
    bg?: string;
    borderColor?: string;
    /** Tighter layout for embedding in the hero (e.g. pastor home). */
    compact?: boolean;
};

const WelcomeCard: React.FC<Props> = ({
    avatar,
    message,
    progress,
    bg = '#14517d',
    borderColor = '#fff',
    onClick,
    compact = false,
}) => {
    const showProgress = progress !== undefined && progress >= 0;

    return (
        <TouchableOpacity
            onPress={onClick}
            style={[
                styles.container as ViewStyle,
                compact ? styles.containerCompact : null,
                { backgroundColor: bg, borderColor },
            ]}
            activeOpacity={onClick ? 0.8 : 1}
        >
            <View style={[styles.content, compact && styles.contentCompact]}>
                <Image source={avatar} style={[styles.avatar, compact && styles.avatarCompact]} />

                <View style={styles.messageBlock}>
                    <Text style={[styles.message, compact && styles.messageCompact]}>{message}</Text>

                    {showProgress && (
                        <View style={styles.progressRow}>
                            <Text style={[styles.progressLabel, compact && styles.progressLabelCompact]}>Progress</Text>

                            <View style={styles.progressVisuals}>
                                <View style={[styles.progressContainer, compact && styles.progressContainerCompact]}>
                                    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: '#fff' }]} />
                                </View>
                                <Text style={[styles.progressText, compact && styles.progressTextCompact]}>{progress} %</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default WelcomeCard;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 12,
        padding: isSmallDevice ? 16 : 20,
    },
    containerCompact: {
        padding: isSmallDevice ? 10 : 12,
        borderRadius: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 12 : 16,
    },
    contentCompact: {
        gap: isSmallDevice ? 10 : 12,
    },
    avatar: {
        width: isSmallDevice ? 40 : 48,
        height: isSmallDevice ? 40 : 48,
        borderRadius: isSmallDevice ? 20 : 24,
    },
    avatarCompact: {
        width: isSmallDevice ? 36 : 40,
        height: isSmallDevice ? 36 : 40,
        borderRadius: isSmallDevice ? 18 : 20,
    },
    messageBlock: {
        flex: 1,
        flexDirection: 'column',
    },
    message: {
        color: '#fff',
        fontWeight: '600',
        fontSize: isSmallDevice ? 16 : 18,
        marginBottom: 8,
    },
    messageCompact: {
        fontSize: isSmallDevice ? 14 : 15,
        marginBottom: 6,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressLabel: {
        color: '#fff',
        fontSize: isSmallDevice ? 14 : 15,
        fontWeight: '500',
        marginRight: 10,
    },
    progressLabelCompact: {
        fontSize: isSmallDevice ? 12 : 13,
        marginRight: 8,
    },
    progressVisuals: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressContainer: {
        height: 8,
        flex: 1,
        // Using the requested dark blue color for the track
        backgroundColor: 'rgba(24, 44, 91, 1)',
        borderRadius: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
        elevation: 3,
    },
    progressContainerCompact: {
        height: 6,
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        color: '#fff',
        fontSize: isSmallDevice ? 14 : 15,
        fontWeight: '600',
        minWidth: 40,
        textAlign: 'right',
    },
    progressTextCompact: {
        fontSize: isSmallDevice ? 12 : 13,
        minWidth: 36,
    },
});

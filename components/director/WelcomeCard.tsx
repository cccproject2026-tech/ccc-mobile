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
};

const WelcomeCard: React.FC<Props> = ({ avatar, message, progress, bg = '#14517d', borderColor = '#fff', onClick }) => {
    const showProgress = progress !== undefined && progress >= 0;

    return (
        <TouchableOpacity
            onPress={onClick}
            style={[styles.container as ViewStyle, { backgroundColor: bg, borderColor }]}
            activeOpacity={onClick ? 0.8 : 1}
        >
            <View style={styles.content}>
                <Image source={avatar} style={styles.avatar} />

                <View style={styles.messageBlock}>
                    <Text style={styles.message}>{message}</Text>

                    {showProgress && (
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Progress</Text>

                            <View style={styles.progressVisuals}>
                                <View style={styles.progressContainer}>
                                    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: '#fff' }]} />
                                </View>
                                <Text style={styles.progressText}>{progress} %</Text>
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
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 12 : 16,
    },
    avatar: {
        width: isSmallDevice ? 40 : 48,
        height: isSmallDevice ? 40 : 48,
        borderRadius: isSmallDevice ? 20 : 24,
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
});

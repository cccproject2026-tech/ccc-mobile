import { isSmallDevice } from '@/utils/responsive';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

type Props = {
    onClick?: () => void;
    /** Navigates to progress when the View Progress button is pressed (compact hero cards). */
    onProgressPress?: () => void;
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
    onProgressPress,
    compact = false,
}) => {
    const showProgress = progress !== undefined && progress >= 0;
    const showViewProgressButton = compact && showProgress && !!onProgressPress;

    return (
        <View
            style={[
                styles.container as ViewStyle,
                compact ? styles.containerCompact : null,
                { backgroundColor: bg, borderColor },
            ]}
        >
            <View style={[styles.content, compact && styles.contentCompact]}>
                <Pressable
                    onPress={onClick}
                    disabled={!onClick}
                    style={({ pressed }) => [onClick && pressed ? styles.pressedOpacity : null]}
                >
                    <Image source={avatar} style={[styles.avatar, compact && styles.avatarCompact]} />
                </Pressable>

                <View style={styles.rightColumn}>
                    {showViewProgressButton ? (
                        <View style={[styles.messageRow, compact && styles.messageRowCompact]}>
                            <Pressable
                                onPress={onClick}
                                disabled={!onClick}
                                style={({ pressed }) => [
                                    styles.messagePressable,
                                    onClick && pressed ? styles.pressedOpacity : null,
                                ]}
                            >
                                <Text
                                    style={[styles.message, compact && styles.messageInRow]}
                                    numberOfLines={1}
                                >
                                    {message}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={onProgressPress}
                                style={({ pressed }) => [
                                    styles.viewProgressButton,
                                    compact && styles.viewProgressButtonCompact,
                                    pressed && styles.pressedOpacity,
                                ]}
                                accessibilityRole="button"
                                accessibilityLabel="View progress"
                            >
                                <Text style={[styles.viewProgressText, compact && styles.viewProgressTextCompact]}>
                                    View Progress
                                </Text>
                                {/* <Ionicons name="chevron-forward" size={compact ? 14 : 16} color="#fff" /> */}
                            </Pressable>
                        </View>
                    ) : (
                        <Pressable
                            onPress={onClick}
                            disabled={!onClick}
                            style={({ pressed }) => [onClick && pressed ? styles.pressedOpacity : null]}
                        >
                            <Text style={[styles.message, compact && styles.messageCompact]}>{message}</Text>
                        </Pressable>
                    )}

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
        </View>
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
    rightColumn: {
        flex: 1,
        flexDirection: 'column',
    },
    pressedOpacity: {
        opacity: 0.85,
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
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 8,
    },
    messageRowCompact: {
        gap: 6,
        marginBottom: 6,
    },
    messagePressable: {
        flex: 1,
        minWidth: 0,
    },
    messageInRow: {
        fontSize: isSmallDevice ? 14 : 15,
        marginBottom: 0,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    viewProgressButton: {
        flexShrink: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    viewProgressButtonCompact: {
        paddingVertical: 5,
        paddingHorizontal: 9,
        borderRadius: 7,
    },
    viewProgressText: {
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        fontWeight: '700',
        fontSize: isSmallDevice ? 12 : 13,
    },
    viewProgressTextCompact: {
        fontSize: isSmallDevice ? 11 : 12,
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

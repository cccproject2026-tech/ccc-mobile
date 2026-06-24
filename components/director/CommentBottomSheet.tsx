import { icons } from '@/constants/images';
import { roadmapTheme } from '@/components/ui/design-system/roadmapTheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface CommentModalRef {
    present: () => void;
    dismiss: () => void;
}

export interface CommentBottomSheetProps {
    title?: string;
    subtitle?: string;
    onClose: () => void;
    onSubmit: (text: string) => void;
    onDelete: (commentId: string) => void;
    onEdit: (commentId: string) => void;
    comments: Array<{
        id: string;
        text: string;
        author: string;
        role: string;
        avatar?: string;
        timestamp: Date;
    }>;
    placeholder?: string;
    editingCommentId?: string | null;
    submitButtonText?: string;
    maxCommentsReached?: boolean;
    readOnly?: boolean;
}

function formatAuthorLabel(author: string, role: string) {
    const trimmedAuthor = author?.trim() || 'Mentor';
    const trimmedRole = role?.trim();
    if (!trimmedRole || trimmedAuthor.toLowerCase() === trimmedRole.toLowerCase()) {
        return trimmedAuthor;
    }
    return `${trimmedAuthor} · ${trimmedRole}`;
}

function formatCommentDate(date: Date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const CommentBottomSheet = forwardRef<CommentModalRef, CommentBottomSheetProps>(
    (
        {
            title = 'Pr. John Doe',
            subtitle = 'Final Comments',
            onClose,
            onSubmit,
            onDelete,
            onEdit,
            comments = [],
            placeholder = 'Write your final comments here...',
            editingCommentId = null,
            submitButtonText = 'Submit',
            maxCommentsReached = false,
            readOnly = false,
        },
        ref,
    ) => {
        const { top, bottom } = useSafeAreaInsets();
        const [visible, setVisible] = useState(false);
        const [comment, setComment] = useState('');
        const [showInput, setShowInput] = useState(false);

        const dismiss = useCallback(() => {
            setVisible(false);
        }, []);

        const present = useCallback(() => {
            setVisible(true);
        }, []);

        useImperativeHandle(ref, () => ({ present, dismiss }), [present, dismiss]);

        useEffect(() => {
            if (!visible) return;

            if (editingCommentId) {
                const existingComment = comments.find((c) => c.id === editingCommentId);
                setComment(existingComment?.text || '');
                setShowInput(true);
            } else {
                setComment('');
                setShowInput(comments.length === 0 && !readOnly);
            }
        }, [editingCommentId, comments, readOnly, visible]);

        const handleClose = useCallback(() => {
            dismiss();
            onClose();
        }, [dismiss, onClose]);

        const handleSubmit = () => {
            if (comment.trim()) {
                onSubmit(comment);
                setComment('');
                setShowInput(false);
            }
        };

        const handleAddComment = () => {
            setShowInput(true);
            setComment('');
        };

        const canAddMore = !readOnly && !maxCommentsReached;

        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
                statusBarTranslucent
            >
                <View style={styles.overlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={[
                            styles.popupWrap,
                            {
                                paddingTop: Math.max(top, 16),
                                paddingBottom: Math.max(bottom, 16),
                            },
                        ]}
                    >
                        <View style={styles.popupCard}>
                            <LinearGradient
                                colors={[...Colors.appBgGradient]}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={styles.popupGradient}
                            >
                                <View style={styles.sheetHeader}>
                                    <View style={styles.sheetHeaderText}>
                                        <Text style={styles.sheetTitle} numberOfLines={2}>
                                            {title}
                                        </Text>
                                        {subtitle ? (
                                            <Text style={styles.sheetSubtitle}>{subtitle}</Text>
                                        ) : null}
                                    </View>
                                    <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={8}>
                                        <Ionicons name="close" size={22} color={roadmapTheme.textPrimary} />
                                    </Pressable>
                                </View>

                                <ScrollView
                                    style={styles.scrollArea}
                                    contentContainerStyle={styles.scrollContent}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                >
                                    {comments.length > 0 && !showInput ? (
                                        <View style={styles.commentsListContainer}>
                                            {comments.map((commentItem) => {
                                                const dateLabel = formatCommentDate(commentItem.timestamp);

                                                return (
                                                    <View key={commentItem.id} style={styles.commentCard}>
                                                        <View style={styles.commentCardTop}>
                                                            <View style={styles.commentBadge}>
                                                                <Ionicons
                                                                    name="chatbubble-ellipses-outline"
                                                                    size={14}
                                                                    color={roadmapTheme.accentMint}
                                                                />
                                                                <Text style={styles.commentBadgeText}>
                                                                    Final comment
                                                                </Text>
                                                            </View>

                                                            {!readOnly ? (
                                                                <View style={styles.commentActions}>
                                                                    <Pressable
                                                                        onPress={() => onEdit(commentItem.id)}
                                                                        style={styles.iconAction}
                                                                        hitSlop={6}
                                                                    >
                                                                        <Ionicons
                                                                            name="create-outline"
                                                                            size={18}
                                                                            color={roadmapTheme.accentMint}
                                                                        />
                                                                    </Pressable>
                                                                    <Pressable
                                                                        onPress={() => onDelete(commentItem.id)}
                                                                        style={styles.iconAction}
                                                                        hitSlop={6}
                                                                    >
                                                                        <Ionicons
                                                                            name="trash-outline"
                                                                            size={18}
                                                                            color="#F87171"
                                                                        />
                                                                    </Pressable>
                                                                </View>
                                                            ) : null}
                                                        </View>

                                                        <Text style={styles.commentText}>{commentItem.text}</Text>

                                                        <View style={styles.authorRow}>
                                                            <Image
                                                                source={
                                                                    commentItem.avatar
                                                                        ? { uri: commentItem.avatar }
                                                                        : icons.myProfile
                                                                }
                                                                style={styles.avatar}
                                                                resizeMode="cover"
                                                            />
                                                            <View style={styles.authorMeta}>
                                                                <Text style={styles.authorText}>
                                                                    {formatAuthorLabel(
                                                                        commentItem.author,
                                                                        commentItem.role,
                                                                    )}
                                                                </Text>
                                                                {dateLabel ? (
                                                                    <Text style={styles.commentDate}>
                                                                        {dateLabel}
                                                                    </Text>
                                                                ) : null}
                                                            </View>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    ) : null}

                                    {comments.length === 0 && !showInput && !readOnly ? (
                                        <View style={styles.emptyState}>
                                            <Ionicons
                                                name="chatbubble-ellipses-outline"
                                                size={28}
                                                color={roadmapTheme.accentMint}
                                            />
                                            <Text style={styles.emptyStateTitle}>No final comments yet</Text>
                                            <Text style={styles.emptyStateText}>
                                                Add a short summary of this pastor's progress before marking the
                                                programme complete.
                                            </Text>
                                        </View>
                                    ) : null}

                                    {showInput && !readOnly ? (
                                        <View style={styles.inputContainer}>
                                            <Text style={styles.inputLabel}>
                                                {editingCommentId ? 'Edit comment' : 'New comment'}
                                            </Text>
                                            <TextInput
                                                value={comment}
                                                onChangeText={setComment}
                                                placeholder={placeholder}
                                                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                                                style={styles.textInput}
                                                multiline
                                                numberOfLines={8}
                                                textAlignVertical="top"
                                            />
                                        </View>
                                    ) : null}
                                </ScrollView>

                                <View style={styles.actionsContainer}>
                                    {showInput && !readOnly ? (
                                        <>
                                            <Pressable
                                                onPress={() => {
                                                    setComment('');
                                                    if (editingCommentId) {
                                                        handleClose();
                                                        return;
                                                    }
                                                    if (comments.length > 0) {
                                                        setShowInput(false);
                                                    }
                                                }}
                                                style={({ pressed }) => [
                                                    styles.secondaryButton,
                                                    pressed && styles.buttonPressed,
                                                ]}
                                            >
                                                <Text style={styles.secondaryButtonText}>Cancel</Text>
                                            </Pressable>

                                            <Pressable
                                                onPress={handleSubmit}
                                                disabled={!comment.trim()}
                                                style={({ pressed }) => [
                                                    styles.primaryButton,
                                                    !comment.trim() && styles.primaryButtonDisabled,
                                                    pressed && comment.trim() ? styles.buttonPressed : null,
                                                ]}
                                            >
                                                <Text style={styles.primaryButtonText}>{submitButtonText}</Text>
                                            </Pressable>
                                        </>
                                    ) : canAddMore ? (
                                        <Pressable
                                            onPress={handleAddComment}
                                            style={({ pressed }) => [
                                                styles.addCommentButton,
                                                pressed && styles.buttonPressed,
                                            ]}
                                        >
                                            <Ionicons
                                                name="add-circle-outline"
                                                size={18}
                                                color={roadmapTheme.accentMint}
                                            />
                                            <Text style={styles.addCommentButtonText}>Add comment</Text>
                                        </Pressable>
                                    ) : readOnly && comments.length > 0 ? (
                                        <Text style={styles.readOnlyHint}>
                                            Comments are read-only after programme completion.
                                        </Text>
                                    ) : null}
                                </View>
                            </LinearGradient>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        );
    },
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(6, 28, 46, 0.72)',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    popupWrap: {
        width: '100%',
        maxHeight: '92%',
    },
    popupCard: {
        width: '100%',
        maxHeight: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
        elevation: 12,
    },
    popupGradient: {
        maxHeight: '100%',
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 16,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 14,
    },
    sheetHeaderText: {
        flex: 1,
        gap: 4,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: roadmapTheme.textPrimary,
        lineHeight: 26,
    },
    sheetSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: roadmapTheme.accentMint,
        letterSpacing: 0.2,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
    },
    scrollArea: {
        flexGrow: 0,
        maxHeight: 420,
    },
    scrollContent: {
        paddingBottom: 8,
    },
    commentsListContainer: {
        gap: 12,
        marginBottom: 12,
    },
    commentCard: {
        backgroundColor: roadmapTheme.frostedSurfaceStrong,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(111, 212, 190, 0.28)',
        padding: 16,
        gap: 12,
    },
    commentCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    commentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: 'rgba(111, 212, 190, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(111, 212, 190, 0.25)',
    },
    commentBadgeText: {
        color: roadmapTheme.accentMint,
        fontSize: 12,
        fontWeight: '600',
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconAction: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    commentText: {
        color: roadmapTheme.textPrimary,
        fontSize: 16,
        lineHeight: 24,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: roadmapTheme.divider,
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    authorMeta: {
        flex: 1,
        gap: 2,
    },
    authorText: {
        color: roadmapTheme.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    commentDate: {
        color: roadmapTheme.textSubtle,
        fontSize: 12,
    },
    emptyState: {
        alignItems: 'center',
        gap: 10,
        paddingVertical: 24,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        backgroundColor: roadmapTheme.frostedSurface,
    },
    emptyStateTitle: {
        color: roadmapTheme.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    emptyStateText: {
        color: roadmapTheme.textMuted,
        fontSize: 13,
        lineHeight: 19,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 8,
        gap: 8,
    },
    inputLabel: {
        color: roadmapTheme.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    textInput: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(111, 212, 190, 0.35)',
        backgroundColor: 'rgba(255,255,255,0.06)',
        padding: 16,
        fontSize: 16,
        color: roadmapTheme.textPrimary,
        lineHeight: 24,
        minHeight: 140,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: roadmapTheme.divider,
    },
    secondaryButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorderStrong,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    secondaryButtonText: {
        color: roadmapTheme.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    primaryButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: roadmapTheme.accentMint,
    },
    primaryButtonDisabled: {
        opacity: 0.45,
    },
    primaryButtonText: {
        color: '#0B3D5C',
        fontSize: 15,
        fontWeight: '700',
    },
    addCommentButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(111, 212, 190, 0.55)',
        backgroundColor: 'rgba(111, 212, 190, 0.08)',
    },
    addCommentButtonText: {
        color: roadmapTheme.accentMint,
        fontSize: 15,
        fontWeight: '600',
    },
    readOnlyHint: {
        flex: 1,
        textAlign: 'center',
        color: roadmapTheme.textSubtle,
        fontSize: 13,
        lineHeight: 18,
        paddingVertical: 8,
    },
    buttonPressed: {
        opacity: 0.85,
    },
});

export default CommentBottomSheet;

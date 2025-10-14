import { icons } from '@/constants/images';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
}

const CommentBottomSheet = forwardRef<BottomSheetModal, CommentBottomSheetProps>(
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
        },
        ref
    ) => {
        const { bottom } = useSafeAreaInsets();
        const snapPoints = useMemo(() => ['75%'], []); // Increased height for comments
        const [comment, setComment] = useState('');
        const [showInput, setShowInput] = useState(false);

        useEffect(() => {
            if (editingCommentId) {
                const existingComment = comments.find(c => c.id === editingCommentId);
                setComment(existingComment?.text || '');
                setShowInput(true);
            } else {
                setComment('');
                setShowInput(comments.length === 0); // Show input if no comments
            }
        }, [editingCommentId, comments]);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.7}
                    pressBehavior="close"
                />
            ),
            []
        );

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

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                // make the modal background transparent — we'll render our gradient inside so corners and overflow work correctly
                backgroundStyle={styles.bottomSheetBackgroundTransparent}
                handleIndicatorStyle={styles.handleIndicator}
                onDismiss={onClose}
            >
                <LinearGradient
                    colors={['#264387', '#1D548D', '#176192']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={[styles.sheetGradient, { paddingBottom: bottom + 20 }]}
                >
                    <BottomSheetScrollView
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                    >

                        <View style={styles.closeButtonRow}>
                            <Pressable onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={28} color="#FFFFFF" />
                            </Pressable>
                        </View>

                        <View style={styles.headerWrapper}>
                            <LinearGradient
                                colors={['#7B2FF7', '#00D4FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBorder}
                            >
                                <View style={styles.headerContent}>
                                    <Text style={styles.headerText}>
                                        <Text style={styles.title}>{title}</Text>
                                        {subtitle && (
                                            <>
                                                <Text style={styles.separator}> - </Text>
                                                <Text style={styles.subtitle}>{subtitle}</Text>
                                            </>
                                        )}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </View>

                        {comments.length > 0 && !showInput && (
                            <View style={styles.commentsListContainer}>
                                {comments.map((commentItem) => (
                                    <View key={commentItem.id} style={styles.commentCard}>
                                        <View style={styles.editRow}>
                                            <Pressable
                                                onPress={() => {
                                                    onEdit(commentItem.id);
                                                }}
                                                style={styles.editButton}
                                            >
                                                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                                                <Text style={styles.editText}>Edit</Text>
                                            </Pressable>
                                        </View>

                                        <Text style={styles.commentText}>{commentItem.text}</Text>

                                        <View style={styles.authorRow}>
                                            <View style={styles.divider} />
                                            <Image
                                                source={icons.myProfile}
                                                style={styles.avatar}
                                                resizeMode="cover"
                                            />
                                            <Text style={styles.authorText}>
                                                {commentItem.author}({commentItem.role})
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {showInput && (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    value={comment}
                                    onChangeText={setComment}
                                    placeholder={placeholder}
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    style={styles.textInput}
                                    multiline
                                    numberOfLines={8}
                                    textAlignVertical="top"
                                />
                            </View>
                        )}

                        <View style={styles.actionsContainer}>
                            {showInput ? (
                                <>
                                    <Pressable
                                        onPress={() => {
                                            // setShowInput(false);
                                            setComment('');
                                            if (editingCommentId) {
                                                onClose();
                                            }
                                        }}
                                        style={{
                                            backgroundColor: '#fff',
                                            flex: 1,
                                            paddingVertical: 14,
                                            borderRadius: 10,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{
                                            color: '#1a5b77',
                                            fontSize: 16,
                                            fontWeight: '600',
                                        }}>Cancel</Text>
                                    </Pressable>

                                    <Pressable
                                        onPress={handleSubmit}
                                        disabled={!comment.trim()}
                                        style={[
                                            styles.submitButton,
                                            !comment.trim() && styles.submitButtonDisabled
                                        ]}
                                    >
                                        <Text style={styles.submitText}>{submitButtonText}</Text>
                                    </Pressable>
                                </>
                            ) : (
                                <>
                                    {!maxCommentsReached && (
                                        <Pressable
                                            onPress={handleAddComment}
                                            style={({ pressed }) => [
                                                styles.addCommentButton,
                                                pressed && styles.submitButtonPressed
                                            ]}
                                        >
                                            <Text style={styles.submitText}>Add Comment</Text>
                                        </Pressable>
                                    )}
                                </>
                            )}
                        </View>
                    </BottomSheetScrollView>
                </LinearGradient>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: '#0F1941',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    handleIndicator: {
        display: 'none',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    bottomSheetBackgroundTransparent: {
        backgroundColor: 'transparent',
    },
    sheetGradient: {
        flex: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    closeButtonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 16,
    },
    closeButton: {
        padding: 4,
    },
    headerWrapper: {
        marginBottom: 28,
    },
    gradientBorder: {
        padding: 2.5,
        borderRadius: 18,
    },
    headerContent: {
        backgroundColor: '#264387',
        paddingVertical: 15,
        paddingHorizontal: 28,
        borderRadius: 15.5,
        alignItems: 'center',
    },
    headerText: {
        textAlign: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    separator: {
        fontSize: 20,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '400',
        color: '#FFFFFF',
    },
    commentsListContainer: {
        marginBottom: 24,
    },

    // 1. Primary Card Container
    commentCard: {
        backgroundColor: 'rgba(42, 70, 135, 0.6)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        padding: 24, // Main padding for content
        paddingBottom: 20, // Slightly less padding at the bottom for better flow
        marginBottom: 20,
    },

    // 2. Top Row for Edit Button
    editRow: {
        // Aligns the edit button to the right
        flexDirection: 'row',
        justifyContent: 'flex-end',
        // Matches the spacing from the image
        marginBottom: 24,
    },

    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.35)',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        gap: 8,
    },
    editText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },

    // 3. Comment Text
    commentText: {
        color: '#FFFFFF',
        fontSize: 16,
        lineHeight: 26,
        // Separates text from the author row below
        marginBottom: 28,
    },

    // 4. Author Row
    authorRow: {
        // Aligns the entire author container to the right
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
    },

    // The following styles are used by authorRow children:
    divider: {
        width: 10,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    authorText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },

    inputContainer: {
        marginBottom: 24,
        minHeight: 200,
    },
    textInput: {
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        backgroundColor: 'rgba(42, 70, 135, 0.4)',
        padding: 24,
        fontSize: 16,
        color: '#FFFFFF',
        lineHeight: 26,
        minHeight: 200,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
        // maxWidth: "90%",
        // alignSelf: 'center',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelButtonPressed: {
        opacity: 0.8,
    },
    cancelText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    submitButtonPressed: {
        opacity: 0.7,
    },
    submitButtonDisabled: {
        opacity: 0.4,
    },
    submitText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    addCommentButton: {
        flex: 1,
        backgroundColor: '#1B4FD8',
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});



export default CommentBottomSheet;
import {
    canMentorMarkProgramComplete,
    MENTOR_FINAL_COMMENT_REQUIRED_MESSAGE,
} from '@/lib/progress/deriveOverallProgressPercent';
import { patchMenteeHasCompleted } from '@/lib/progress/patchMenteeCompletionInCache';
import { usersService } from '@/services/users.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Alert } from 'react-native';

type MarkCompleteParams = {
    userId: string;
    overallProgress: number;
    hasFinalComment: boolean;
    hasCompleted?: boolean;
    menteeName?: string;
};

export function useMentorProgramCompletion() {
    const queryClient = useQueryClient();

    const markCompleteMutation = useMutation({
        mutationFn: (userId: string) => usersService.markUserCompleted(userId),
        onSuccess: (user, userId) => {
            patchMenteeHasCompleted(
                queryClient,
                userId,
                true,
                user.updatedAt,
            );

            void Promise.all([
                queryClient.invalidateQueries({ queryKey: ['mentees'] }),
                queryClient.invalidateQueries({ queryKey: ['progress'] }),
                queryClient.invalidateQueries({ queryKey: ['profile'] }),
            ]);
        },
    });

    const requestMarkComplete = useCallback(
        ({
            userId,
            overallProgress,
            hasFinalComment,
            hasCompleted,
            menteeName,
        }: MarkCompleteParams) => {
            if (!userId) return;

            if (markCompleteMutation.isPending) return;

            if (hasCompleted) {
                Alert.alert('Already completed', 'This programme has already been marked as completed.');
                return;
            }

            if (overallProgress < 100) {
                Alert.alert(
                    'Not ready',
                    'This pastor must reach 100% progress before the programme can be marked complete.',
                );
                return;
            }

            if (!hasFinalComment) {
                Alert.alert('Final comments required', MENTOR_FINAL_COMMENT_REQUIRED_MESSAGE);
                return;
            }

            const label = menteeName?.trim() || 'this pastor';

            Alert.alert(
                'Mark programme as completed',
                `Mark ${label} as completed?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Confirm',
                        onPress: () => {
                            markCompleteMutation.mutate(userId, {
                                onSuccess: () => {
                                    Alert.alert(
                                        'Programme completed',
                                        'The pastor has been marked as completed.',
                                    );
                                },
                                onError: () => {
                                    Alert.alert(
                                        'Error',
                                        'Failed to mark the programme as completed. Please try again.',
                                    );
                                },
                            });
                        },
                    },
                ],
            );
        },
        [markCompleteMutation],
    );

    return {
        markCompleteMutation,
        requestMarkComplete,
        canMarkComplete: canMentorMarkProgramComplete,
        finalCommentRequiredMessage: MENTOR_FINAL_COMMENT_REQUIRED_MESSAGE,
    };
}

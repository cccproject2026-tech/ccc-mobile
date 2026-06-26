import KeyboardSafeContainer from '@/components/layout/KeyboardSafeContainer';
import TopBar from '@/components/director/TopBar';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
    GradientBackground,
    RoadmapNavRow,
    SectionHeader,
} from '@/components/ui/design-system/index';
import { roadmapTheme } from '@/components/ui/design-system/roadmapTheme';
import { useUserProfile } from '@/hooks/profile/useProfile';
import {
    useDeleteRoadmapQuery,
    useRoadmapQueries,
    useSubmitRoadmapQuery,
    useUpdateRoadmapQuery,
} from '@/hooks/roadmaps/useRoadmaps';
import { resolveRoadmapThreadId } from '@/lib/roadmap/helpers';
import {
    formatQuerySubmittedDate,
    type NormalizedRoadmapQuery,
} from '@/lib/roadmap/queryHelpers';
import type { MentorInfo } from '@/lib/roadmap/types';
import { useAuthStore } from '@/stores/auth.store';
import { paramToString } from '@/utils/routerParams';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PASTOR_QUERY_TABS = ['NEW', 'ANSWERED', 'PENDING'] as const;

function getMentorInfo(
    value: MentorInfo | string | undefined,
): MentorInfo | null {
    if (!value || typeof value === 'string') return null;
    return value;
}

export default function QueriesScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        roadmapId?: string | string[];
        taskId?: string | string[];
        phaseId?: string | string[];
        tab?: string | string[];
    }>();
    const threadRoadmapId = resolveRoadmapThreadId(
        paramToString(params.taskId) ?? paramToString(params.roadmapId),
        paramToString(params.phaseId),
    );
    const { user } = useAuthStore();
    const { data: profileUser } = useUserProfile();
    const { bottom } = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const submitQuery = useSubmitRoadmapQuery();
    const updateQuery = useUpdateRoadmapQuery();
    const deleteQuery = useDeleteRoadmapQuery();

    const { data: allQueries = [], isLoading, refetch, isFetching } = useRoadmapQueries(
        threadRoadmapId,
        user?.id,
    );

    const initialTabParam = paramToString(params.tab)?.toUpperCase();
    const [selectedTab, setSelectedTab] = useState<'NEW' | 'ANSWERED' | 'PENDING'>(() => {
        if (initialTabParam === 'ANSWERED' || initialTabParam === 'PENDING') {
            return initialTabParam;
        }
        return 'NEW';
    });
    const [queryText, setQueryText] = useState('');
    const [editingQueryId, setEditingQueryId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const horizontalPadding = Math.max(16, Math.min(24, Math.round(width * 0.05)));
    const maxWidth = width >= 520 ? 520 : undefined;

    const pastorDisplayName = useMemo(() => {
        const first = profileUser?.firstName ?? user?.firstName;
        const last = profileUser?.lastName ?? user?.lastName;
        const full = [first, last].filter(Boolean).join(' ').trim();
        return full || 'Me';
    }, [profileUser?.firstName, profileUser?.lastName, user?.firstName, user?.lastName]);

    const pastorAvatarFields = useMemo(
        () => ({
            profilePicture:
                profileUser?.profilePicture ?? user?.profilePicture ?? undefined,
        }),
        [profileUser?.profilePicture, user?.profilePicture],
    );

    const displayQueries = useMemo(() => {
        if (selectedTab === 'NEW') return [];
        return allQueries.filter((q) => q.status === selectedTab.toLowerCase());
    }, [selectedTab, allQueries]);

    const handleSubmitQuery = async () => {
        if (!queryText.trim()) return;

        if (!threadRoadmapId || !user?.id) {
            Alert.alert('Error', 'Missing roadmap ID or user ID.');
            return;
        }

        try {
            await submitQuery.mutateAsync({
                roadmapId: threadRoadmapId,
                payload: {
                    actualQueryText: queryText.trim(),
                    userId: user.id,
                },
            });

            setQueryText('');
            setSelectedTab('PENDING');
        } catch (err: any) {
            Alert.alert('Submission Failed', err?.message || 'Try again.');
        }
    };

    const startEditing = (item: NormalizedRoadmapQuery) => {
        setEditingQueryId(item._id);
        setEditText(item.actualQueryText);
    };

    const cancelEditing = () => {
        setEditingQueryId(null);
        setEditText('');
    };

    const handleSaveEdit = async (item: NormalizedRoadmapQuery) => {
        if (!editText.trim() || !threadRoadmapId || !user?.id) return;

        try {
            await updateQuery.mutateAsync({
                roadmapId: threadRoadmapId,
                queryId: item._id,
                payload: {
                    userId: user.id,
                    actualQueryText: editText.trim(),
                },
            });
            cancelEditing();
        } catch (err: any) {
            Alert.alert('Update Failed', err?.message || 'Could not update query.');
        }
    };

    const handleDelete = (item: NormalizedRoadmapQuery) => {
        if (!threadRoadmapId || !user?.id) return;

        Alert.alert(
            'Delete query?',
            'This question will be removed permanently.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteQuery.mutateAsync({
                                roadmapId: threadRoadmapId,
                                queryId: item._id,
                                userId: user.id,
                            });
                            if (editingQueryId === item._id) {
                                cancelEditing();
                            }
                        } catch (err: any) {
                            Alert.alert(
                                'Delete Failed',
                                err?.message || 'Could not delete query.',
                            );
                        }
                    },
                },
            ],
        );
    };

    const renderQuery = ({ item }: { item: NormalizedRoadmapQuery }) => {
        const isPending = item.status === 'pending';
        const isEditing = editingQueryId === item._id;
        const mentor = getMentorInfo(item.repliedMentorId);
        const submittedLabel = formatQuerySubmittedDate(item.createdDate);

        return (
            <View style={styles.queryCard}>
                <View style={styles.questionSection}>
                    <View style={styles.queryHeader}>
                        <UserAvatar user={pastorAvatarFields} size={44} />
                        <View style={styles.queryInfo}>
                            <Text style={styles.authorName}>{pastorDisplayName}</Text>
                            <Text style={styles.roleText}>Pastor</Text>
                            <Text style={styles.submittedDate}>
                                Submitted: {submittedLabel}
                            </Text>
                        </View>

                        {isPending && !isEditing ? (
                            <View style={styles.actionRow}>
                                <Pressable
                                    onPress={() => startEditing(item)}
                                    hitSlop={8}
                                    style={styles.iconButton}
                                    accessibilityLabel="Edit query"
                                >
                                    <Ionicons name="pencil-outline" size={18} color="#FFFFFF" />
                                </Pressable>
                                <Pressable
                                    onPress={() => handleDelete(item)}
                                    hitSlop={8}
                                    style={styles.iconButton}
                                    accessibilityLabel="Delete query"
                                >
                                    <Ionicons name="trash-outline" size={18} color="#fecaca" />
                                </Pressable>
                            </View>
                        ) : null}
                    </View>

                    {isEditing ? (
                        <View style={styles.editBlock}>
                            <TextInput
                                style={styles.editInput}
                                multiline
                                value={editText}
                                onChangeText={setEditText}
                                maxLength={250}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                            />
                            <View style={styles.editActions}>
                                <Pressable
                                    onPress={cancelEditing}
                                    style={[styles.editButton, styles.editButtonGhost]}
                                >
                                    <Text style={styles.editButtonGhostText}>Cancel</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => handleSaveEdit(item)}
                                    disabled={!editText.trim() || updateQuery.isPending}
                                    style={[
                                        styles.editButton,
                                        styles.editButtonPrimary,
                                        (!editText.trim() || updateQuery.isPending) &&
                                            styles.editButtonDisabled,
                                    ]}
                                >
                                    {updateQuery.isPending ? (
                                        <ActivityIndicator size="small" color={roadmapTheme.tealDeep} />
                                    ) : (
                                        <Text style={styles.editButtonPrimaryText}>Save</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.queryText}>{item.actualQueryText}</Text>
                    )}
                </View>

                {item.status === 'answered' ? (
                    <View style={styles.responseSection}>
                        <View style={styles.queryHeader}>
                            <UserAvatar user={mentor} size={44} />
                            <View style={styles.queryInfo}>
                                <Text style={styles.authorName}>
                                    {mentor
                                        ? `${mentor.firstName ?? ''} ${mentor.lastName ?? ''}`.trim() ||
                                          'Mentor'
                                        : 'Mentor'}
                                </Text>
                                <Text style={styles.roleText}>
                                    {mentor?.role || 'Mentor'}
                                </Text>
                                {item.repliedDate ? (
                                    <Text style={styles.submittedDate}>
                                        Answered: {formatQuerySubmittedDate(item.repliedDate)}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                        <Text style={styles.responseText}>{item.repliedAnswer}</Text>
                    </View>
                ) : (
                    <View style={styles.waitingBadge}>
                        <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.waitingText}>Waiting for response</Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <GradientBackground decorativeOrbs style={styles.container}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="pastor" showUserName />
            </View>

            <KeyboardSafeContainer mode="avoid" style={styles.keyboardAvoid}>
                <View style={[styles.content, { maxWidth: maxWidth ?? undefined }]}>
                    <View style={{ paddingHorizontal: horizontalPadding, width: '100%' }}>
                        <RoadmapNavRow onBack={() => router.back()} pillLabel="Queries" />
                        <SectionHeader
                            title="Your questions"
                            subtitle="Revitalization Roadmap"
                            showDivider
                        />
                    </View>

                    <View style={[styles.tabRow, { paddingHorizontal: horizontalPadding }]}>
                        {PASTOR_QUERY_TABS.map((tab) => {
                            const label =
                                tab === 'NEW'
                                    ? 'New'
                                    : tab === 'ANSWERED'
                                      ? 'Answered'
                                      : 'Pending';
                            const active = selectedTab === tab;
                            return (
                                <Pressable
                                    key={tab}
                                    onPress={() => setSelectedTab(tab)}
                                    style={[
                                        styles.tabPill,
                                        active ? styles.tabPillActive : styles.tabPillInactive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.tabPillText,
                                            active
                                                ? styles.tabPillTextActive
                                                : styles.tabPillTextInactive,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {selectedTab === 'NEW' ? (
                        <KeyboardSafeContainer
                            style={styles.scrollArea}
                            contentContainerStyle={{
                                flexGrow: 1,
                                paddingHorizontal: horizontalPadding,
                                paddingBottom: bottom + 20,
                            }}
                            extraScrollHeight={24}
                            dismissKeyboardOnTap
                        >
                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>Submit your question here.</Text>

                                <TextInput
                                    style={styles.textInput}
                                    multiline
                                    value={queryText}
                                    maxLength={250}
                                    onChangeText={setQueryText}
                                    placeholder=""
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />

                                <View style={styles.inputFooter}>
                                    <Text style={styles.wordCount}>
                                        ({queryText.length} characters)
                                    </Text>
                                    <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                                </View>

                                <Pressable
                                    onPress={handleSubmitQuery}
                                    disabled={!queryText.trim() || submitQuery.isPending}
                                    style={[
                                        styles.submitButton,
                                        (!queryText.trim() || submitQuery.isPending) &&
                                            styles.submitButtonDisabled,
                                    ]}
                                >
                                    {submitQuery.isPending ? (
                                        <ActivityIndicator size="small" color={roadmapTheme.tealDeep} />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Submit</Text>
                                    )}
                                </Pressable>
                            </View>
                        </KeyboardSafeContainer>
                    ) : (
                        <FlatList
                            style={styles.scrollArea}
                            keyboardShouldPersistTaps="handled"
                            data={displayQueries}
                            renderItem={renderQuery}
                            keyExtractor={(item) => item._id}
                            showsVerticalScrollIndicator={false}
                            refreshing={isFetching}
                            onRefresh={() => refetch()}
                            contentContainerStyle={[
                                styles.listContainer,
                                {
                                    paddingHorizontal: horizontalPadding,
                                    paddingBottom: bottom + 20,
                                },
                            ]}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    {isLoading ? (
                                        <ActivityIndicator size="large" color="#fff" />
                                    ) : (
                                        <Text style={styles.emptyText}>
                                            {selectedTab === 'PENDING'
                                                ? 'No pending queries'
                                                : 'No answered queries yet'}
                                        </Text>
                                    )}
                                </View>
                            }
                        />
                    )}
                </View>
            </KeyboardSafeContainer>
        </GradientBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    content: {
        flex: 1,
        width: '100%',
        alignSelf: 'center',
    },
    scrollArea: {
        flex: 1,
    },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: 16,
        gap: 10,
    },
    tabPill: {
        flex: 1,
        minWidth: 0,
        minHeight: 44,
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabPillActive: {
        backgroundColor: '#FFFFFF',
    },
    tabPillInactive: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
    },
    tabPillText: {
        fontSize: 12,
        fontWeight: '700',
    },
    tabPillTextActive: {
        color: roadmapTheme.tealDeep,
    },
    tabPillTextInactive: {
        color: '#FFFFFF',
    },
    inputSection: {
        flex: 1,
        padding: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    textInput: {
        backgroundColor: roadmapTheme.frostedSurface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        padding: 16,
        minHeight: 200,
        color: '#FFFFFF',
        fontSize: 15,
        textAlignVertical: 'top',
    },
    inputFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    wordCount: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    submitButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.85)',
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: roadmapTheme.tealDeep,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    listContainer: {
        padding: 16,
    },
    queryCard: {
        backgroundColor: roadmapTheme.frostedSurface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: roadmapTheme.frostedBorder,
        padding: 16,
        marginBottom: 12,
    },
    questionSection: {
        marginBottom: 16,
    },
    queryHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    queryInfo: {
        flex: 1,
        minWidth: 0,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    iconButton: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    roleText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    submittedDate: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.65)',
        marginTop: 4,
        fontWeight: '600',
    },
    queryText: {
        fontSize: 15,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    editBlock: {
        gap: 10,
    },
    editInput: {
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.18)',
        padding: 12,
        minHeight: 100,
        color: '#FFFFFF',
        fontSize: 15,
        textAlignVertical: 'top',
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    editButton: {
        minWidth: 88,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    editButtonGhost: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    editButtonGhostText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    editButtonPrimary: {
        backgroundColor: '#FFFFFF',
    },
    editButtonPrimaryText: {
        color: roadmapTheme.tealDeep,
        fontWeight: '700',
        fontSize: 14,
    },
    editButtonDisabled: {
        opacity: 0.5,
    },
    responseSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    responseText: {
        fontSize: 15,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    waitingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
        alignSelf: 'flex-start',
        gap: 6,
    },
    waitingText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
    },
});

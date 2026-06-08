import KeyboardSafeContainer from '@/components/layout/KeyboardSafeContainer';
import TopBar from '@/components/director/TopBar';
import {
    GradientBackground,
    RoadmapNavRow,
    SectionHeader,
} from '@/components/ui/design-system/index';
import { roadmapTheme } from '@/components/ui/design-system/roadmapTheme';
import { resolveRoadmapThreadId } from '@/lib/roadmap/helpers';
import { useRoadmapQueries, useSubmitRoadmapQuery } from '@/hooks/roadmaps/useRoadmaps';
import { paramToString } from '@/utils/routerParams';
import { useAuthStore } from '@/stores/auth.store';
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
    View
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PASTOR_QUERY_TABS = ["NEW", "ANSWERED", "PENDING"] as const;

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
    const { bottom } = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const submitQuery = useSubmitRoadmapQuery();

    const { data: allQueries = [] } = useRoadmapQueries(
        threadRoadmapId,
        user?.id
    );

    const initialTabParam = paramToString(params.tab)?.toUpperCase();
    const [selectedTab, setSelectedTab] = useState<'NEW' | 'ANSWERED' | 'PENDING'>(() => {
        if (initialTabParam === 'ANSWERED' || initialTabParam === 'PENDING') {
            return initialTabParam;
        }
        return 'NEW';
    });
    const [queryText, setQueryText] = useState('');

    const horizontalPadding = Math.max(16, Math.min(24, Math.round(width * 0.05)));
    const maxWidth = width >= 520 ? 520 : undefined;

    const displayQueries = useMemo(() => {
        if (selectedTab === 'NEW') return [];

        return allQueries.filter(q => q.status === selectedTab.toLowerCase());
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
                    userId: user.id
                }
            });

            setQueryText('');
            setSelectedTab('PENDING');
        } catch (err: any) {
            Alert.alert('Submission Failed', err?.message || 'Try again.');
        }
    };

    const formatDate = (timestamp: string): string => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderQuery = ({ item }: { item: any }) => (
        <View style={styles.queryCard}>
            {}
            <View style={styles.questionSection}>
                <View style={styles.queryHeader}>
                    <Ionicons name="person-circle-outline" size={40} color="#FFFFFF" />

                    <View style={styles.queryInfo}>
                        <Text style={styles.authorName}>Me</Text>
                        <Text style={styles.queryDate}>{formatDate(item.createdDate)}</Text>
                    </View>
                </View>

                <Text style={styles.queryText}>{item.actualQueryText}</Text>
            </View>

            {}
            {item.status === "answered" ? (
                <View style={styles.responseSection}>
                    <View style={styles.queryHeader}>
                        <Ionicons
                            name="person-circle-outline"
                            size={40}
                            color="#FFFFFF"
                        />

                        <View style={styles.queryInfo}>
                            <Text style={styles.authorName}>
                                {item.repliedMentorId?.firstName} {item.repliedMentorId?.lastName}
                            </Text>
                            <Text style={styles.roleText}>
                                {item.repliedMentorId?.role || "Mentor"}
                            </Text>
                        </View>

                        <Text style={styles.queryDate}>{formatDate(item.repliedDate)}</Text>
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

    return (
        <GradientBackground decorativeOrbs style={styles.container}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="pastor" showUserName />
            </View>

            <KeyboardSafeContainer mode="avoid" style={styles.keyboardAvoid}>
            <View style={[styles.content, { maxWidth: maxWidth ?? undefined }]}>
            <View style={{ paddingHorizontal: horizontalPadding, width: "100%" }}>
                <RoadmapNavRow onBack={() => router.back()} pillLabel="Queries" />
                <SectionHeader
                    title="Your questions"
                    subtitle="Revitalization Roadmap"
                    showDivider
                />
            </View>

            <View style={[styles.tabRow, { paddingHorizontal: horizontalPadding }]}>
                {PASTOR_QUERY_TABS.map((tab) => {
                    const label = tab === 'NEW' ? 'New' : tab === 'ANSWERED' ? 'Answered' : 'Pending';
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
                                style={[styles.tabPillText, active ? styles.tabPillTextActive : styles.tabPillTextInactive]}
                                numberOfLines={1}
                            >
                                {label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {}
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
                        <Text style={styles.wordCount}>({queryText.length} Words)</Text>
                        <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                    </View>

                    <Pressable
                        onPress={handleSubmitQuery}
                        disabled={!queryText.trim() || submitQuery.isPending}
                        style={[
                            styles.submitButton,
                            (!queryText.trim() || submitQuery.isPending) && styles.submitButtonDisabled
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
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.listContainer,
                        {
                            paddingHorizontal: horizontalPadding,
                            paddingBottom: bottom + 20,
                        },
                    ]}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {selectedTab === "PENDING"
                                    ? "No pending queries"
                                    : "No answered queries yet"}
                            </Text>
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
        width: "100%",
        alignSelf: "center",
    },
    scrollArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerTextContainer: {
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    breadcrumb: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
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
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E0E0',
        marginRight: 12,
    },
    queryInfo: {
        flex: 1,
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
    queryDate: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    queryText: {
        fontSize: 15,
        color: '#FFFFFF',
        lineHeight: 22,
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

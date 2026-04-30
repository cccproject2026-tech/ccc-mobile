import TopBar from '@/components/director/TopBar';
import { useRoadmapQueries, useSubmitRoadmapQuery } from '@/hooks/roadmaps/useRoadmaps';
import { useAuthStore } from '@/stores/auth.store';
import { getFontSize, getSpacing, isAndroid } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QueriesScreen() {
    const router = useRouter();
    const { roadmapId } = useLocalSearchParams<{ roadmapId: string }>();
    const { user } = useAuthStore();
    const { bottom } = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const submitQuery = useSubmitRoadmapQuery();

    const { data: allQueries = [] } = useRoadmapQueries(
        roadmapId,
        user?.id
    );

    const [selectedTab, setSelectedTab] = useState<'NEW' | 'ANSWERED' | 'PENDING'>('NEW');
    const [queryText, setQueryText] = useState('');

    const horizontalPadding = Math.max(16, Math.min(24, Math.round(width * 0.05)));
    const maxWidth = width >= 520 ? 520 : undefined;

    const displayQueries = useMemo(() => {
        if (selectedTab === 'NEW') return [];

        return allQueries.filter(q => q.status === selectedTab.toLowerCase());
    }, [selectedTab, allQueries]);

    const handleSubmitQuery = async () => {
        if (!queryText.trim()) return;

        if (!roadmapId || !user?.id) {
            Alert.alert('Error', 'Missing roadmap ID or user ID.');
            return;
        }

        try {
            await submitQuery.mutateAsync({
                roadmapId,
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
            {/* USER QUESTION */}
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

            {/* RESPONSE */}
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
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
            <View style={{ paddingBottom: 10 }}>
                <TopBar role="pastor" showUserName />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
            <View style={{ width: "100%", maxWidth: maxWidth ?? undefined, alignSelf: "center" }}>
            {/* HEADER */}
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingHorizontal: horizontalPadding,
                    paddingVertical: getSpacing(16),
                    marginBottom: getSpacing(16),
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
                }}
            >
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: getSpacing(8) }}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontSize: isAndroid ? getFontSize(18) : getFontSize(15),
                            fontWeight: '700',
                            color: '#FFFFFF',
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        Queries
                    </Text>

                    <Text
                        style={{
                            marginTop: getSpacing(4),
                            fontSize: getFontSize(12),
                            color: 'rgba(255, 255, 255, 0.8)',
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        Revitalization Roadmap
                    </Text>
                </View>
            </View>

            {/* TABS */}
            <View style={styles.tabContainer}>
                {['NEW', 'ANSWERED', 'PENDING'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, selectedTab === tab && styles.activeTab]}
                        onPress={() => setSelectedTab(tab as any)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedTab === tab && styles.activeTabText
                            ]}
                        >
                            {tab.charAt(0) + tab.slice(1).toLowerCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* CONTENT */}
            {selectedTab === 'NEW' ? (
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: bottom + 20,
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
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

                    <TouchableOpacity
                        onPress={handleSubmitQuery}
                        disabled={!queryText.trim() || submitQuery.isPending}
                        style={[
                            styles.submitButton,
                            (!queryText.trim() || submitQuery.isPending) && styles.submitButtonDisabled
                        ]}
                    >
                        {submitQuery.isPending ? (
                            <ActivityIndicator size="small" color="#1D548D" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit</Text>
                        )}
                    </TouchableOpacity>
                </View>
                </ScrollView>
            ) : (
                <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={displayQueries}
                    renderItem={renderQuery}
                    keyExtractor={item => item._id}
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
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    container: {
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
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    activeTabText: {
        color: '#1D548D',
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        padding: 16,
        minHeight: 200,
        color: '#FFFFFF',
        fontSize: 16,
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
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 16,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D548D',
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    listContainer: {
        padding: 16,
    },
    queryCard: {
        backgroundColor: '#2A5C8B',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(150, 190, 220, 0.3)',
        padding: 20,
        marginBottom: 16,
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
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
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

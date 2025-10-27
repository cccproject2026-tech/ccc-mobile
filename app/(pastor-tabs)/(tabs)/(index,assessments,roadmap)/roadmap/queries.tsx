import TopBar from '@/components/director/TopBar';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { getQueryResponse, getTask, getTaskQueries } from '@/lib/roadmap/selectors';
import { Query, QueryResponse } from '@/lib/roadmap/types';
import { getFontSize, getSpacing, isAndroid } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Extended Query type with response data
type QueryWithResponse = Query & {
    responseData?: QueryResponse;
};

export default function QueriesScreen() {
    const router = useRouter();
    const { taskId } = useLocalSearchParams<{ taskId: string }>(); // ✅ Changed to taskId
    const [selectedTab, setSelectedTab] = useState<'NEW' | 'ANSWERED' | 'PENDING'>('NEW');
    const [queryText, setQueryText] = useState('');

    const task = useMemo(() => getTask(mockRevitalization, taskId), [taskId]);
    const allQueries = useMemo(() => getTaskQueries(mockRevitalization, taskId), [taskId]);

    // Filter queries based on selected tab and populate response data
    const displayQueries = useMemo(() => {
        if (selectedTab === 'NEW') return [];

        const filteredQueries = allQueries.filter(q => q.status === selectedTab);

        // Populate response data for answered queries
        return filteredQueries.map(query => {
            if (query.hasResponse && query.responses && query.responses.length > 0) {
                const responseData = getQueryResponse(mockRevitalization, query.responses[0]);
                return {
                    ...query,
                    responseData
                } as QueryWithResponse;
            }
            return query as QueryWithResponse;
        });
    }, [allQueries, selectedTab]);

    const handleSubmitQuery = () => {
        if (queryText.trim()) {
            console.log('Submitting query:', queryText);
            setQueryText('');
            // After submission, switch to PENDING tab to show the new query
            setSelectedTab('PENDING');
        }
    };

    const formatDate = (timestamp: string): string => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderQuery = ({ item }: { item: QueryWithResponse }) => (
        <View style={styles.queryCard}>
            {/* User Question */}
            <View style={styles.questionSection}>
                <View style={styles.queryHeader}>
                    <Image source={item.author.avatar} style={styles.avatar} />
                    <View style={styles.queryInfo}>
                        <Text style={styles.authorName}>{item.author.name}</Text>
                        <Text style={styles.queryDate}>{formatDate(item.timestamp)}</Text>
                    </View>
                </View>
                <Text style={styles.queryText}>{item.question}</Text>
            </View>

            {/* Response Section */}
            {item.status === 'ANSWERED' && item.responseData ? (
                <View style={styles.responseSection}>
                    <View style={styles.queryHeader}>
                        <Image source={item.responseData.author.avatar} style={styles.avatar} />
                        <View style={styles.queryInfo}>
                            <Text style={styles.authorName}>
                                {item.responseData.author.name}
                            </Text>
                            <Text style={styles.roleText}>{item.responseData.author.role || 'Mentor'}</Text>
                        </View>
                        <Text style={styles.queryDate}>{formatDate(item.responseData.timestamp)}</Text>
                    </View>
                    <Text style={styles.responseText}>{item.responseData.content}</Text>
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
                <TopBar role="pastor" userName="John Ross" showUserName />
            </View>

            {/* Header */}
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Queries</Text>
                    <Text style={styles.breadcrumb}>
                        Revitalization Roadmap › {task?.title}
                    </Text>
                </View>
            </View> */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingHorizontal: getSpacing(8),
                paddingVertical: getSpacing(16),
                marginBottom: getSpacing(16),
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255, 255, 255, 0.2)',
            }}>
                {/* Left side - Back button and Text */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                    marginRight: getSpacing(12), // Add space before right elements
                }}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginRight: getSpacing(8) }}
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Text Container with flex to prevent overflow */}
                    <View style={{ flex: 1, marginRight: getSpacing(8) }}>
                        <Text
                            style={{
                                fontSize: isAndroid ? getFontSize(18) : getFontSize(15),
                                fontWeight: '700',
                                lineHeight: getFontSize(18),
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
                            Revitalization Roadmap &gt; {task?.title}
                        </Text>

                    </View>
                </View>
            </View>


            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'NEW' && styles.activeTab]}
                    onPress={() => setSelectedTab('NEW')}
                >
                    <Text style={[styles.tabText, selectedTab === 'NEW' && styles.activeTabText]}>
                        New
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'ANSWERED' && styles.activeTab]}
                    onPress={() => setSelectedTab('ANSWERED')}
                >
                    <Text style={[styles.tabText, selectedTab === 'ANSWERED' && styles.activeTabText]}>
                        Answered
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'PENDING' && styles.activeTab]}
                    onPress={() => setSelectedTab('PENDING')}
                >
                    <Text style={[styles.tabText, selectedTab === 'PENDING' && styles.activeTabText]}>
                        Pending
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content based on selected tab */}
            {selectedTab === 'NEW' ? (
                <View style={styles.inputSection}>
                    <Text style={styles.inputLabel}>Submit your question here.</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder=""
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        multiline
                        value={queryText}
                        onChangeText={setQueryText}
                        maxLength={250}
                    />
                    <View style={styles.inputFooter}>
                        <Text style={styles.wordCount}>({queryText.length} Words)</Text>
                        <TouchableOpacity>
                            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmitQuery}
                        disabled={!queryText.trim()}
                    >
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={displayQueries}
                    renderItem={renderQuery}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {selectedTab === 'PENDING'
                                    ? 'No pending queries'
                                    : 'No answered queries yet'}
                            </Text>
                        </View>
                    }
                />
            )}
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

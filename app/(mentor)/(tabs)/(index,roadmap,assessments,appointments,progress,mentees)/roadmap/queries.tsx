import { Button, ScreenLayout } from "@/components/build-components";
import TextAreaField from "@/components/build-components/text-area";
import { primary_color } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useReplyRoadmapQuery, useRoadmapQueries } from "@/hooks/roadmaps/useRoadmaps";
import { RoadmapQuery } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function QueriesScreen() {
  const { data: dataParam, roadmapId, userId } = useLocalSearchParams<{
    data?: string;
    roadmapId?: string;
    userId?: string;
  }>();
  const data = dataParam ? JSON.parse(dataParam as string) : null;
  
  // Get roadmapId and userId from params or parsed data
  const finalRoadmapId = roadmapId || data?.roadmapId;
  const menteeId = userId || data?.userId;
  
  const { user } = useAuthStore();
  const replyQueryMutation = useReplyRoadmapQuery();
  
  const { data: allQueries = [], isLoading } = useRoadmapQueries(
    finalRoadmapId,
    menteeId
  );

  const [activeTab, setActiveTab] = useState<"pending" | "answered">("pending");
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Filter queries by status
  const filteredQueries = useMemo(() => {
    return allQueries.filter((query) => query.status === activeTab);
  }, [allQueries, activeTab]);

  const pendingCount = useMemo(() => {
    return allQueries.filter((q) => q.status === "pending").length;
  }, [allQueries]);

  const handleToggleExpand = (queryId: string) => {
    setExpandedQueryId(expandedQueryId === queryId ? null : queryId);
  };

  const handleResponseChange = (queryId: string, text: string) => {
    setResponses((prev) => ({ ...prev, [queryId]: text }));
  };

  const handleSubmit = async (query: RoadmapQuery) => {
    if (!responses[query._id]?.trim()) {
      Alert.alert("Error", "Please enter a response");
      return;
    }

    if (!finalRoadmapId || !user?.id) {
      Alert.alert("Error", "Missing roadmap ID or user ID");
      return;
    }

    try {
      await replyQueryMutation.mutateAsync({
        roadmapId: finalRoadmapId,
        queryId: query._id,
        payload: {
          repliedAnswer: responses[query._id].trim(),
          repliedMentorId: user.id,
        },
      });

      setResponses((prev) => ({ ...prev, [query._id]: "" }));
      setExpandedQueryId(null);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to submit reply");
    }
  };

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getMenteeName = (query: RoadmapQuery): string => {
    // Since queries are fetched for a specific userId, we can get the name from data or use a default
    return data?.menteeName || "Mentee";
  };

  const renderTab = (
    tabName: "pending" | "answered",
    label: string,
    badge?: number
  ) => {
    const isActive = activeTab === tabName;

    return (
      <Pressable
        onPress={() => setActiveTab(tabName)}
        style={[
          styles.tabButton,
          isActive ? styles.activeTab : styles.inactiveTab,
        ]}
      >
        <Text
          style={[
            styles.tabText,
            isActive ? styles.activeTabText : styles.inactiveTabText,
          ]}
        >
          {label}
        </Text>
        {badge !== undefined && badge > 0 && isActive && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderQueryCard = (query: RoadmapQuery) => {
    const isExpanded = expandedQueryId === query._id;
    const isSubmitting = replyQueryMutation.isPending && expandedQueryId === query._id;
    const menteeName = getMenteeName(query);
    const repliedMentor = typeof query.repliedMentorId === "object" 
      ? query.repliedMentorId 
      : null;

    return (
      <View key={query._id} style={styles.queryCard}>
        {/* Query Header */}
        <View style={styles.queryHeader}>
          <View style={styles.queryHeaderLeft}>
            <Image 
              source={icons.myProfile} 
              style={styles.avatar} 
            />
            <View style={styles.queryInfo}>
              <Text style={styles.queryName}>{menteeName}</Text>
              <Text style={styles.queryRole}>Pastor</Text>
              <Text style={styles.queryDate}>{formatDate(query.createdDate)}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => handleToggleExpand(query._id)}
            style={styles.expandButton}
          >
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="rgba(255, 255, 255, 0.7)"
            />
          </Pressable>
        </View>

        {/* Query Message */}
        <Text style={styles.queryMessage}>{query.actualQueryText}</Text>

        {/* Expanded Section - Response Area or Existing Response */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {query.status === "pending" ? (
              <>
                <View style={styles.responseInputContainer}>
                  <TextAreaField
                    label="Write your Response here..."
                    value={responses[query._id] || ""}
                    onChangeText={(text) => handleResponseChange(query._id, text)}
                    inputClass={{ backgroundColor: primary_color }}
                    numberOfLines={5}
                    editable={!isSubmitting}
                  />
                </View>
                <View style={{ width: '100%', alignItems: 'flex-end' }}>
                  <View style={{ width: '45%' }}>
                    <Button
                      onPress={() => {
                        if (!isSubmitting && responses[query._id]?.trim()) {
                          handleSubmit(query);
                        }
                      }}
                      wrapperClass=""
                      buttonClass="!h-11"
                      variant="secondary"
                      buttonStyle={{
                        opacity: (isSubmitting || !responses[query._id]?.trim()) ? 0.5 : 1
                      }}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#1A4882" />
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.responseContainer}>
                <View style={styles.responseHeader}>
                  <Text style={styles.responseLabel}>Response:</Text>
                  {repliedMentor && (
                    <Text style={styles.mentorName}>
                      by {repliedMentor.firstName} {repliedMentor.lastName}
                    </Text>
                  )}
                </View>
                <Text style={styles.responseText}>{query.repliedAnswer}</Text>
                {query.repliedDate && (
                  <Text style={styles.responseDate}>
                    {formatDate(query.repliedDate)}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenLayout
      enablePastorHeader={true}
      showNameTag={true}
      tagName="John Doe"
      enableHeader={true}
      headerTitle="Queries"
      headerSubTitle="John Doe > Jump-start"
      showSettings={true}
      hideSearchBar={true}
      paddingX={0}
    >
      <View style={styles.container}>
        {/* Custom Tabs */}
        <View style={styles.tabsContainer}>
          {renderTab("pending", "Pending", pendingCount)}
          {renderTab("answered", "Answered")}
        </View>

        {/* Queries List */}
        <View style={styles.queriesList}>
          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="white" />
            </View>
          ) : filteredQueries.length > 0 ? (
            filteredQueries.map((query) => renderQueryCard(query))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No {activeTab} queries found
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  tabsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    justifyContent: "center",
  },
  tabButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 140,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeTab: {
    backgroundColor: "white",
  },
  inactiveTab: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#1A4882",
  },
  inactiveTabText: {
    color: "white",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: 20,
    backgroundColor: "#FFD700",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#1A4882",
    fontSize: 12,
    fontWeight: "700",
  },
  queriesList: {
    flex: 1,
    gap: 16,
  },
  queryCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  queryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  queryHeaderLeft: {
    flexDirection: "row",
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  queryInfo: {
    flex: 1,
    justifyContent: "center",
  },
  queryName: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  queryRole: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 2,
  },
  queryDate: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
  },
  expandButton: {
    padding: 4,
  },
  queryMessage: {
    color: "white",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  expandedSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  responseInputContainer: {
    marginBottom: 16,
  },
  responseContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 8,
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  responseLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  mentorName: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontStyle: "italic",
  },
  responseText: {
    color: "white",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  responseDate: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
  },
});


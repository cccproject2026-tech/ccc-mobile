import { Button } from "@/components/build-components";
import TextAreaField from "@/components/build-components/text-area";
import TopBar from "@/components/director/TopBar";
import {
  GradientBackground,
  RoadmapNavRow,
  SectionHeader,
} from "@/components/ui/design-system/index";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";
import { icons } from "@/constants/images";
import { useReplyRoadmapQuery, useRoadmapQueries, useRoadmap } from "@/hooks/roadmaps/useRoadmaps";
import { resolveRoadmapThreadId } from "@/lib/roadmap/helpers";
import { paramToString } from "@/utils/routerParams";
import { RoadmapQuery } from "@/lib/roadmap/types";
import { useAuthStore } from "@/stores/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function QueriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: dataParam, roadmapId, userId, menteeName, taskId, phaseId } = useLocalSearchParams<{
    data?: string;
    roadmapId?: string;
    userId?: string;
    menteeName?: string;
    taskId?: string;
    phaseId?: string;
  }>();
  const data = dataParam ? JSON.parse(dataParam as string) : null;
  
  // Per-task thread id (nested roadmap item), not parent phase id
  const finalRoadmapId = resolveRoadmapThreadId(
    paramToString(taskId) || roadmapId || data?.taskId || data?.roadmapId,
    paramToString(phaseId) || data?.phaseId,
  );
  const menteeId = userId || data?.userId;
  
  const { user } = useAuthStore();
  const replyQueryMutation = useReplyRoadmapQuery();
  const { data: roadmap } = useRoadmap(finalRoadmapId);
  
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
                    inputClass={{
                      backgroundColor: roadmapTheme.frostedSurface,
                      borderWidth: 1,
                      borderColor: roadmapTheme.frostedBorder,
                    }}
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

  // const menteeName = data?.menteeName || "Mentee";

  const menteeTitle =
    typeof menteeName === "string" && menteeName.length > 0 ? menteeName : "Mentee";

  return (
    <GradientBackground decorativeOrbs style={styles.root}>
      <View style={styles.topBarWrap}>
        <TopBar
          role="mentor"
          showUserName
          customTitle={typeof menteeName === "string" ? menteeName : undefined}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
          flexGrow: 1,
        }}
      >
        <View style={styles.chrome}>
          <RoadmapNavRow onBack={() => router.back()} pillLabel="Queries" />
          <SectionHeader
            title="Mentee queries"
            subtitle={
              roadmap?.name
                ? `${menteeTitle} · ${roadmap.name}`
                : menteeTitle
            }
            showDivider
          />
        </View>

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setActiveTab("pending")}
            style={[
              styles.tabPill,
              activeTab === "pending" ? styles.tabPillActive : styles.tabPillInactive,
            ]}
          >
            <View style={styles.tabLabelRow}>
              <Text
                style={[
                  styles.tabPillText,
                  activeTab === "pending" ? styles.tabPillTextActive : styles.tabPillTextInactive,
                ]}
                numberOfLines={1}
              >
                Pending
              </Text>
              {pendingCount > 0 ? (
                <View
                  style={[
                    styles.countBadge,
                    activeTab === "pending" ? styles.countBadgeActive : styles.countBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countBadgeText,
                      activeTab === "pending"
                        ? styles.countBadgeTextActive
                        : styles.countBadgeTextInactive,
                    ]}
                    numberOfLines={1}
                  >
                    {pendingCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab("answered")}
            style={[
              styles.tabPill,
              activeTab === "answered" ? styles.tabPillActive : styles.tabPillInactive,
            ]}
          >
            <View style={styles.tabLabelRow}>
              <Text
                style={[
                  styles.tabPillText,
                  activeTab === "answered" ? styles.tabPillTextActive : styles.tabPillTextInactive,
                ]}
                numberOfLines={1}
              >
                Answered
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.queriesList}>
          {isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#fff" />
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
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBarWrap: { paddingBottom: 10 },
  chrome: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingHorizontal: 16,
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
    justifyContent: "center",
    alignItems: "center",
  },
  tabPillActive: {
    backgroundColor: "#FFFFFF",
  },
  tabPillInactive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    maxWidth: "100%",
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tabPillTextActive: {
    color: roadmapTheme.tealDeep,
  },
  tabPillTextInactive: {
    color: "#FFFFFF",
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeActive: {
    backgroundColor: "rgba(14, 90, 98, 0.14)",
  },
  countBadgeInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  countBadgeTextActive: {
    color: roadmapTheme.tealDeep,
  },
  countBadgeTextInactive: {
    color: "#FFFFFF",
  },
  queriesList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  queryCard: {
    backgroundColor: roadmapTheme.frostedSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
    padding: 16,
    marginBottom: 4,
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
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
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


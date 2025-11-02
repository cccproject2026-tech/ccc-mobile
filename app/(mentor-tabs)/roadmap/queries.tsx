import { Button, ScreenLayout } from "@/components/build-components";
import TextAreaField from "@/components/build-components/text-area";
import { primary_color } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

interface Query {
  id: string;
  name: string;
  role: string;
  avatar: any;
  date: string;
  message: string;
  status: "pending" | "answered";
  response?: string;
}

const mockQueries: Query[] = [
  {
    id: "1",
    name: "John Ross",
    role: "Pastor",
    avatar: icons.myProfile,
    date: "22/09/2024",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing eip ex ea commodo consequat. Duis ?",
    status: "pending",
  },
  {
    id: "2",
    name: "John Ross",
    role: "Pastor",
    avatar: icons.myProfile,
    date: "22/09/2024",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing eip ex ea commodo consequat. Duis ?",
    status: "pending",
  },
  {
    id: "3",
    name: "John Ross",
    role: "Pastor",
    avatar: icons.myProfile,
    date: "22/09/2024",
    message:
      "Lorem ipsum dolor sit amet, consectetur adipiscing eip ex ea commodo consequat. Duis ?",
    status: "pending",
  },
  {
    id: "4",
    name: "Jane Smith",
    role: "Pastor",
    avatar: icons.myProfile,
    date: "20/09/2024",
    message: "How should I proceed with the community outreach program?",
    status: "answered",
    response:
      "You should start by identifying the key stakeholders in your community and scheduling initial meetings with them.",
  },
  {
    id: "5",
    name: "Michael Brown",
    role: "Pastor",
    avatar: icons.myProfile,
    date: "18/09/2024",
    message: "What resources are available for youth ministry development?",
    status: "answered",
    response:
      "Please refer to the Youth Ministry Toolkit document in your library. It contains comprehensive resources and best practices.",
  },
];

export default function QueriesScreen() {
  const { data: dataParam } = useLocalSearchParams();
  const data = dataParam ? JSON.parse(dataParam as string) : null;

  const [activeTab, setActiveTab] = useState<"pending" | "answered">("pending");
  const [expandedQueryId, setExpandedQueryId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const filteredQueries = mockQueries.filter(
    (query) => query.status === activeTab
  );
  const pendingCount = mockQueries.filter((q) => q.status === "pending").length;

  const handleToggleExpand = (queryId: string) => {
    setExpandedQueryId(expandedQueryId === queryId ? null : queryId);
  };

  const handleResponseChange = (queryId: string, text: string) => {
    setResponses((prev) => ({ ...prev, [queryId]: text }));
  };

  const handleSubmit = (queryId: string) => {
    console.log("Submitting response for query:", queryId);
    console.log("Response:", responses[queryId]);
    // Handle submission logic here
    setResponses((prev) => ({ ...prev, [queryId]: "" }));
    setExpandedQueryId(null);
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

  const renderQueryCard = (query: Query) => {
    const isExpanded = expandedQueryId === query.id;

    return (
      <View key={query.id} style={styles.queryCard}>
        {/* Query Header */}
        <View style={styles.queryHeader}>
          <View style={styles.queryHeaderLeft}>
            <Image source={query.avatar} style={styles.avatar} />
            <View style={styles.queryInfo}>
              <Text style={styles.queryName}>{query.name}</Text>
              <Text style={styles.queryRole}>{query.role}</Text>
              <Text style={styles.queryDate}>{query.date}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => handleToggleExpand(query.id)}
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
        <Text style={styles.queryMessage}>{query.message}</Text>

        {/* Expanded Section - Response Area or Existing Response */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {query.status === "pending" ? (
              <>
                <View style={styles.responseInputContainer}>
                  <TextAreaField
                    label="Write your Response here..."
                    value={responses[query.id] || ""}
                    onChangeText={(text) => handleResponseChange(query.id, text)}
                    inputClass={{ backgroundColor: primary_color }}
                    numberOfLines={5}
                  />
                </View>
                <View style={{ width: '100%', alignItems: 'flex-end' }}>
                  <View style={{ width: '45%' }}>
                    <Button
                      onPress={() => handleSubmit(query.id)}
                      wrapperClass=""
                      buttonClass="!h-11"
                      variant="secondary"
                    >
                      Submit
                    </Button>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>Response:</Text>
                <Text style={styles.responseText}>{query.response}</Text>
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
          {filteredQueries.length > 0 ? (
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
  responseLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  responseText: {
    color: "white",
    fontSize: 15,
    lineHeight: 22,
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


import { useMentorshipSessions } from "@/hooks/roadmaps/useMentorshipSessions";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SessionRow = ({
  item,
  onPress,
}: {
  item: MentorshipSession;
  onPress: () => void;
}) => {
  const isCompleted = item.status === "COMPLETED";
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.rowBetween}>
        <Text style={styles.sessionTitle}>
          Session {item.sessionNumber}
          {item.pastorName ? ` · ${item.pastorName}` : ""}
        </Text>
        <View
          style={[
            styles.statusBadge,
            isCompleted ? styles.statusCompleted : styles.statusScheduled,
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.dateText}>Scheduled: {formatSessionDate(item.scheduledDate)}</Text>
    </Pressable>
  );
};

export default function SessionsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    data: sessions = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMentorshipSessions(user?.id);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => a.sessionNumber - b.sessionNumber);
  }, [sessions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Text style={styles.heading}>Mentorship Sessions</Text>

        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.stateText}>Loading sessions...</Text>
          </View>
        ) : isError ? (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>Failed to load sessions.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>
                {isRefetching ? "Retrying..." : "Retry"}
              </Text>
            </Pressable>
          </View>
        ) : sortedSessions.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.stateText}>No sessions found.</Text>
          </View>
        ) : (
          <FlatList
            data={sortedSessions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <SessionRow
                item={item}
                onPress={() => router.push(`/(mentor)/(tabs)/sessions/${item.id}`)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#153C5A",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  sessionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dateText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginTop: 8,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusScheduled: {
    backgroundColor: "rgba(56, 189, 248, 0.25)",
  },
  statusCompleted: {
    backgroundColor: "rgba(34, 197, 94, 0.25)",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  stateText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: {
    color: "#153C5A",
    fontWeight: "700",
  },
});

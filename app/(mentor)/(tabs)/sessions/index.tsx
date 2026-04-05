import {
  formatSessionTime,
  getNextSessionId,
  sessionCardHighlightStyle,
  sessionGradientColors,
  SessionListSkeleton,
  SessionProgressHeader,
  SessionStatusBadge,
} from "@/components/sessions/SessionFlowShared";
import { Colors } from "@/constants/Colors";
import { useMentorshipSessions } from "@/hooks/roadmaps/useMentorshipSessions";
import { useAuthStore } from "@/stores";
import { MentorshipSession } from "@/types/session.types";
import { formatSessionDate } from "@/utils/date";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const SessionRow = ({
  item,
  onPress,
  isCurrent,
}: {
  item: MentorshipSession;
  onPress: () => void;
  isCurrent: boolean;
}) => {
  return (
    <Pressable
      style={[styles.card, sessionCardHighlightStyle(isCurrent)]}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.sessionLabel}>Session {item.sessionNumber}</Text>
          {isCurrent ? (
            <View style={styles.currentPill}>
              <Text style={styles.currentPillText}>Current</Text>
            </View>
          ) : null}
        </View>
        <SessionStatusBadge status={item.status} compact />
      </View>

      <View style={styles.metaBlock}>
        <View style={styles.metaLine}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color="rgba(255,255,255,0.75)"
          />
          <Text style={styles.metaText}>{formatSessionDate(item.scheduledDate)}</Text>
        </View>
        <View style={styles.metaLine}>
          <Ionicons
            name="time-outline"
            size={16}
            color="rgba(255,255,255,0.75)"
          />
          <Text style={styles.metaText}>
            {formatSessionTime(item.scheduledDate) || "Time TBD"}
          </Text>
        </View>
        {item.pastorName ? (
          <View style={styles.metaLine}>
            <Ionicons
              name="person-outline"
              size={16}
              color="rgba(255,255,255,0.75)"
            />
            <Text style={styles.metaText} numberOfLines={1}>
              Pastor {item.pastorName}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const TAB_SCENE_BOTTOM = Colors.darkBlueGradientOne;

export default function SessionsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const listBottomPad = tabBarHeight + Math.max(insets.bottom, 12) + 8;
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

  const nextSessionId = useMemo(
    () => getNextSessionId(sortedSessions),
    [sortedSessions],
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: TAB_SCENE_BOTTOM }]}
      edges={["top"]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={[...sessionGradientColors]} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.heading}>Mentorship Sessions</Text>
          <Text style={styles.subtitle}>
            Review sessions with your pastors and track completion.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.fillRest}>
            <SessionListSkeleton rows={6} />
          </View>
        ) : isError ? (
          <View style={[styles.centerState, styles.fillRest]}>
            <Text style={styles.stateText}>Failed to load sessions.</Text>
            <Pressable onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>
                {isRefetching ? "Retrying..." : "Retry"}
              </Text>
            </Pressable>
          </View>
        ) : sortedSessions.length === 0 ? (
          <View style={[styles.centerState, styles.fillRest]}>
            <Text style={styles.stateText}>No sessions found.</Text>
          </View>
        ) : (
          <>
            <SessionProgressHeader
              sessions={sortedSessions}
              nextSessionId={nextSessionId}
            />
            <FlatList
              style={styles.listFlex}
              data={sortedSessions}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[
                styles.listContent,
                {
                  flexGrow: 1,
                  paddingBottom: listBottomPad,
                },
              ]}
              renderItem={({ item }) => (
                <SessionRow
                  item={item}
                  isCurrent={item.id === nextSessionId}
                  onPress={() =>
                    router.push(`/(mentor)/(tabs)/sessions/${item.id}`)
                  }
                />
              )}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  fillRest: {
    flex: 1,
  },
  listFlex: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  listContent: {
    paddingTop: 0,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  cardTitleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  sessionLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  currentPill: {
    backgroundColor: "rgba(250, 204, 21, 0.28)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentPillText: {
    color: "#FDE68A",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  metaBlock: {
    gap: 8,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
    minHeight: 200,
  },
  stateText: {
    color: "#FFFFFF",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryText: {
    color: "#153C5A",
    fontWeight: "800",
    fontSize: 15,
  },
});

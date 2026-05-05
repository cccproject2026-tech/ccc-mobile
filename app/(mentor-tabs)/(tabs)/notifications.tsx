import { NotificationMentorCard } from "@/components/atom/cards"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Stack } from "expo-router"
import React from "react"
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { GradientBackground } from "@/components/ui/design-system/GradientBackground"
import { SectionHeader } from "@/components/ui/design-system/SectionHeader"
import { CommonCard } from "@/components/ui/design-system/CommonCard"

const dummyNotifications = [
  {
    title: "New roadmap courses",
    description: "Interested in receiving mentoring in community engagement",
    time: "9:43 am",
    type: "course",
    read: false,
  },
  {
    title: "New notes Added",
    description: "Interested in receiving mentoring in community engagement",
    time: "9:43 am",
    type: "note",
    read: false,
  },
  {
    title: "Assignments due today",
    description: "Interested in receiving mentoring in community engagement",
    time: "9:43 am",
    type: "assignment",
    read: true,
  },
  {
    title: "your profile is incomplete",
    description: "Interested in receiving mentoring in community engagement",
    time: "9:43 am",
    type: "profile",
    read: true,
  },
]

export default function NotificationScreen({
  navigation,
}: {
  navigation: any
}) {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "Notifications" }} />
      <GradientBackground>
        <SafeAreaView style={styles.screen}>
          <PastorNavigationHeader />
          <View
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* Header */}
            <SectionHeader title="Notifications" subtitle="Updates and reminders." style={{ width: "100%" }} />
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {dummyNotifications.length === 0 ? (
                <CommonCard>
                  <Text style={styles.emptyTitle}>No notifications</Text>
                  <Text style={styles.emptySubtitle}>
                    When something changes, you&apos;ll see it here.
                  </Text>
                </CommonCard>
              ) : (
                dummyNotifications.map((e, i) => (
                  <View key={i} style={styles.itemWrap}>
                    <NotificationMentorCard
                      data={e}
                      // @ts-ignore - legacy prop used elsewhere
                      type="mentor"
                      iconsStyles={{
                        padding: 0,
                        alignItems: "flex-start",
                      }}
                    />
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </GradientBackground>
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  listContent: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 12,
  },
  itemWrap: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 72, // 4.5rem = 72px
  },
  image: {
    borderRadius: 8,
    margin: 8,
  },
  greetingText: {
    fontFamily: "AlbertSans-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  roleText: {
    fontFamily: "AlbertSans-Medium",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 72,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    marginTop: 8,
    marginHorizontal: 72,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "AlbertSans-Regular",
  },
  progressBarBackground: {
    flex: 1,
    backgroundColor: "#182c5b",
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  progressBarFill: {
    backgroundColor: "#FFFFFF",
    height: 8,
    borderRadius: 4,
    width: "70%",
  },
  progressPercent: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "right",
    fontFamily: "AlbertSans-Regular",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 12,
    padding: 6,
    paddingVertical: 10,
    backgroundColor: "#004B87",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  actionText: {
    fontFamily: "AlbertSans-Regular",
    color: "#FFFFFF",
  },
  icon: {
    width: 18,
    height: 18,
    marginHorizontal: 16,
  },
  sectionMargin: {
    marginVertical: 8,
  },
  whiteText: {
    fontFamily: "AlbertRegular",
    color: "white",
    fontSize: 14,
  },
  summaryContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    marginTop: 8,
  },
  detailedContainer: {
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    marginTop: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  infoBox: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  //   divider: {
  //     height: 1,
  //     backgroundColor: "rgba(255, 255, 255, 0.2)",
  //     marginHorizontal: 56,
  //     marginVertical: 16,
  //   },
  //   whiteText: {
  //     fontFamily: "AlbertRegular",
  //     color: "white",
  //     fontSize: 14,
  //     lineHeight: 24, // Equivalent to leading-6 in Tailwind
  //   },
  //   infoBox: {
  //     flex: 1,
  //     flexDirection: "row",
  //     borderRadius: 8,
  //     padding: 8,
  //     borderWidth: 1,
  //     borderColor: "rgba(255, 255, 255, 0.8)",
  //     marginVertical: 8,
  //   },
  //   rowContainer: {
  //     flexDirection: "row",
  //     justifyContent: "space-between",
  //     alignItems: "center",
  //     gap: 12,
  //     marginVertical: 8,
  //   },
  interestsContainer: {
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    marginVertical: 8,
  },
  commentsContainer: {
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    marginVertical: 8,
  },
})

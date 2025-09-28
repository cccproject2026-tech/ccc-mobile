import { NotificationCard } from "@/components/atom/cards"
import { Header } from "@/components/build-components"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { LinearGradient } from "expo-linear-gradient"
import { Stack } from "expo-router"
import React from "react"
import {
  ScrollView,
  StyleSheet,
  View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

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
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={styles.scrollContainer}>
          <PastorNavigationHeader />
          <View
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* Header */}
            <Header title="Notifications" hideSearchBar={true} showSettings={false} />
            <View style={{ width: "100%" }}>
              <View style={styles.separator} />
            </View>
            <ScrollView
              contentContainerStyle={{
                marginVertical: 10,
                paddingTop: 20,
                paddingHorizontal: 10,
                flexDirection: "column",
                width: "100%",
                gap: 5,
              }}
            >
              {dummyNotifications.map((e, i) => (
                <React.Fragment key={i}>
                  <NotificationCard data={e} key={i} />
                  {dummyNotifications.length - 1 !== i && (
                    <View style={styles.separator} />
                  )}
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    // alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // customWhiteTwenty
    // marginHorizontal: 16,
    marginVertical: 8,
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

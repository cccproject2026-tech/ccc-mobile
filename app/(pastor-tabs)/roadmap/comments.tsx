import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { LinearGradient } from "expo-linear-gradient"
import { Stack, router, useLocalSearchParams } from "expo-router"
import React from "react"
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function CommentsScreen() {
  const { data: dataParam } = useLocalSearchParams()
  const data = dataParam ? JSON.parse(dataParam as string) : null

  const dummyComments = [
    {
      id: 1,
      user: "John Doe (Mentor)",
      avatar: icons.dummyUser,
      message: "Needs improvement. Refer XYZ document",
      timestamp: "9:41 am",
      isHighlighted: true,
    },
    {
      id: 2,
      user: "Robin Roe (Project Manager)",
      avatar: icons.dummyUser,
      message: "Needs improvement. Refer XYZ document",
      timestamp: "Yesterday",
      isHighlighted: false,
    },
    {
      id: 3,
      user: "John Doe (Mentor)",
      avatar: icons.dummyUser,
      message: "No need to spend time researching this area. Focus on the other areas",
      timestamp: "Yesterday",
      isHighlighted: false,
    },
    {
      id: 4,
      user: "John Doe (Mentor)",
      avatar: icons.dummyUser,
      message: "Needs improvement. Refer XYZ document",
      timestamp: "Yesterday",
      isHighlighted: false,
    },
  ]

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <PastorNavigationHeader />

            {/* Header Section */}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 20,
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={() => router.back()}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Image
                    source={icons.forward}
                    style={{
                      width: 18,
                      height: 18,
                      transform: [{ scaleX: -1 }],
                    }}
                  />
                  <View style={{ flexDirection: "column" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "white",
                        fontWeight: "500",
                      }}
                    >
                      Comments
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "white",
                        fontWeight: "200",
                      }}
                    >
                      Revitalization Roadmap {">"} {data?.title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Comments List */}
            <View style={{ flex: 1 }}>
              {dummyComments.map((comment) => (
                <View key={comment.id} style={styles.commentContainer}>
                  {/* Highlight Dot */}
                  {comment.isHighlighted && (
                    <View style={styles.highlightDot} />
                  )}

                  {/* Main Content Row */}
                  <View style={styles.mainContentRow}>
                    {/* Avatar */}
                    <Image source={comment.avatar} style={styles.avatar} />

                    {/* Right Content */}
                    <View style={styles.rightContent}>
                      {/* User Name */}
                      <Text style={styles.userName}>{comment.user}</Text>

                      {/* Message */}
                      <Text style={styles.messageText}>{comment.message}</Text>

                      {/* Action Icons */}
                      <View style={styles.actionIcons}>
                        <TouchableOpacity style={styles.iconButton}>
                          <Image source={icons.phone} style={styles.actionIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                          <Image source={icons.message} style={styles.actionIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                          <Image source={icons.mail} style={styles.actionIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                          <Image source={icons.whatsapp} style={styles.actionIcon} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Timestamp */}
                  <Text style={styles.timestamp}>{comment.timestamp}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
  commentContainer: {
    backgroundColor: "#1A4882",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FFFFFFCC",
    position: "relative",
  },
  mainContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  rightContent: {
    flex: 1,
    paddingRight: 20,
  },
  userName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  highlightDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFD700",
    position: "absolute",
    top: 16,
    right: 16,
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "400",
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  messageText: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionIcons: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    padding: 0,
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: "rgba(255, 255, 255, 0.8)",
  },
})

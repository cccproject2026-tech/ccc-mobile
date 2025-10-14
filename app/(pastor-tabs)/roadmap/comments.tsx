import { CommentCard, Header } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CommentsScreen() {
  const { data: dataParam } = useLocalSearchParams();
  const data = dataParam ? JSON.parse(dataParam as string) : null;

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
      message:
        "No need to spend time researching this area. Focus on the other areas",
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
  ];

  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1">
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <PastorNavigationHeader />
            {/* Header Section */}
            <Header
              title="Comments"
              subTitle="Revitalization Roadmap"
              showSettings={false}
              hideSearchBar={true}
            />
            {/* Comments List */}
            <View className="flex-1 mt-4">
              {dummyComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
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
  );
}


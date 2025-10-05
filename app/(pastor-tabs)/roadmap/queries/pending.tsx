import { Tab } from "@/components/atom/tab";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PendingQueriesScreen() {
  const { data: dataParam } = useLocalSearchParams();
  const data = dataParam ? JSON.parse(dataParam as string) : null;

  const [activeTab, setActiveTab] = React.useState("Pending");

  const availableTabs = [
    { tab: "New" },
    { tab: "Answered" },
    { tab: "Pending" },
  ];

  const pendingQueries = [
    {
      id: 1,
      user: "Me",
      avatar: icons.dummyUser,
      question:
        "Is it possible for you to get me a letter stating that my volunteering is part of this course to submit to my church committee?",
      timestamp: "23/01/2024",
      status: "Waiting for response",
    },
    {
      id: 2,
      user: "Me",
      avatar: icons.dummyUser,
      question:
        "Is it possible for you to get me a letter stating that my volunteering is part of this course to submit to my church committee?",
      timestamp: "23/01/2024",
      status: "Waiting for response",
    },
  ];

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    const routeMap = {
      New: "/(pastor-tabs)/roadmap/queries/new",
      Answered: "/(pastor-tabs)/roadmap/queries/answered",
      Pending: "/(pastor-tabs)/roadmap/queries/pending",
    };

    // router.push({
    //   pathname: routeMap[tabName as keyof typeof routeMap],
    //   params: { data: JSON.stringify(data) }
    // })
  };

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
                      Queries
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: "white",
                        fontWeight: "200",
                      }}
                    >
                      Revitalization Roadmap {data?.title}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Tabs Section */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 15,
                width: "100%",
                justifyContent: "center",
                paddingHorizontal: 16,
              }}
            >
              {availableTabs.map((e, i) => (
                <Tab
                  key={i}
                  data={e}
                  tabs={activeTab}
                  setTabs={setActiveTab}
                  onPress={() => handleTabPress(e.tab)}
                />
              ))}
            </View>

            {/* Pending Queries List */}
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              {pendingQueries.map((query) => (
                <View key={query.id}>
                  {/* Question Section */}
                  <View style={styles.questionSection}>
                    <View style={styles.userInfo}>
                      <Image source={query.avatar} style={styles.avatar} />
                      <View style={styles.userDetails}>
                        <View style={styles.nameTimeRow}>
                          <Text style={styles.userName}>{query.user}</Text>
                          <Text style={styles.timestamp}>
                            {query.timestamp}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text className="font-medium" style={styles.questionText}>
                      {query.question}
                    </Text>
                  </View>

                  {/* Answer Section */}
                  <View style={styles.answerContainer}>
                    <Image
                      source={icons.loadingIcon}
                      style={{ width: 15, height: 15 }}
                    />
                    <Text className="font-medium text-[#FFFFFFCC] text-[16px]">
                      Waiting for response
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
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
  queryContainer: {
    backgroundColor: "#1A4882",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "400",
  },
  questionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  questionText: {
    color: "white",
    fontSize: 14,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 165, 0, 0.2)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFA500",
    marginRight: 8,
  },
  statusText: {
    color: "#FFA500",
    fontSize: 12,
    fontWeight: "500",
  },
  questionSection: {
    marginBottom: 20,
  },
  nameTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  answerContainer: {
    backgroundColor: "#1A4882",
    height: 100,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  answerText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
  },
});

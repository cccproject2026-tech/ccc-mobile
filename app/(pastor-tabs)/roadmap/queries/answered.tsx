import { Tab } from "@/components/atom/tab"
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

export default function AnsweredQueriesScreen() {
  const { data: dataParam } = useLocalSearchParams()
  const data = dataParam ? JSON.parse(dataParam as string) : null

  const [activeTab, setActiveTab] = React.useState("Answered")

  const availableTabs = [
    { tab: "New" },
    { tab: "Answered" },
    { tab: "Pending" },
  ]

  const answeredQueries = [
    {
      id: 1,
      user: "Me",
      avatar: icons.dummyUser,
      question: "Is it possible for you to get me a letter stating that my volunteering is part of this course to submit to my church committee?",
      answer: "I do not have the authority to do that. Please contact Project Manager",
      timestamp: "22/09/2024",
      answeredBy: "John Doe",
      answeredByRole: "Mentor",
      answerTimestamp: "22/09/2024",
    },
  ]

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName)
    const routeMap = {
      "New": "/(pastor-tabs)/roadmap/queries/new",
      "Answered": "/(pastor-tabs)/roadmap/queries/answered", 
      "Pending": "/(pastor-tabs)/roadmap/queries/pending"
    }
    
    router.push({
      pathname: routeMap[tabName as keyof typeof routeMap] as any,
      params: { data: JSON.stringify(data) }
    })
  }

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
                      Revitalization Roadmap  {data?.title}
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

            {/* Answered Queries List */}
            <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
              {answeredQueries.map((query) => (
                <View key={query.id}>
                  {/* Question Section */}
                  <View style={styles.questionSection}>
                    <View style={styles.userInfo}>
                      <Image source={query.avatar} style={styles.avatar} />
                      <View style={styles.userDetails}>
                        <View style={styles.nameTimeRow}>
                          <Text style={styles.userName}>{query.user}</Text>
                          <Text style={styles.timestamp}>{query.timestamp}</Text>
                        </View>
                      </View>
                    </View>
                    <Text className="font-medium" style={styles.questionText}>{query.question}</Text>
                  </View>

                  {/* Answer Section */}
                  <View style={styles.answerContainer}>
                    <View style={styles.answerHeader}>
                      <Image source={query.avatar} style={styles.avatar} />
                      <View style={styles.userDetails}>
                        <View style={styles.nameTimeRow}>
                          <Text style={styles.userName}>{query.answeredBy}</Text>
                          <Text style={styles.timestamp}>{query.answerTimestamp}</Text>
                        </View>
                        <Text style={styles.userRole}>{query.answeredByRole}</Text>
                      </View>
                    </View>
                    <Text className="font-medium" style={styles.answerText}>{query.answer}</Text>
                  </View>
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
  questionSection: {
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  userRole: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "400",
  },
  timestamp: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "400",
  },
  questionText: {
    color: "white",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  answerContainer: {
    backgroundColor: "#1A4882",
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
})

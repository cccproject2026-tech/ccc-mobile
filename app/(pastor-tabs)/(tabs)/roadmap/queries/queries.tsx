import { Tab } from "@/components/atom/tab";
import { Header, QueriesCard, QueryForm } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QueriesScreen() {
  const { data: dataParam } = useLocalSearchParams();
  const data = dataParam ? JSON.parse(dataParam as string) : null;

  const [activeTab, setActiveTab] = React.useState("New");

  const availableTabs = [
    { tab: "New" },
    { tab: "Answered" },
    { tab: "Pending" },
  ];

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
  };

  // Sample data for answered queries
  const answeredQueries = [
    {
      id: "1",
      avatar: icons.dummyUser,
      user: "John Smith",
      timestamp: "2 hours ago",
      question:
        "Is it possible for you to get me a letter stating that my volunteering is part of this course to submit to my church committee?",
      answeredBy: "Pastor Mike",
      answerTimestamp: "1 hour ago",
      answeredByRole: "Senior Pastor",
      answer:
        "I do not have the authority to do that. Please contact Project Manager for official documentation.",
    },
    {
      id: "2",
      avatar: icons.dummyUser,
      user: "Sarah Johnson",
      timestamp: "5 hours ago",
      question:
        "What are the requirements for completing the Jump-start program?",
      answeredBy: "Dr. Williams",
      answerTimestamp: "3 hours ago",
      answeredByRole: "Program Director",
      answer:
        "You need to complete all modules, attend weekly meetings, and submit the final assessment. The program typically takes 8-12 weeks to complete.",
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
              title="Queries"
              subTitle="Revitalization Roadmap  > Jump-start"
              hideSearchBar
              showSettings={false}
            />

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

            {/* Content Section */}
            <View style={{ marginTop: 20 }}>
              {activeTab === "New" && (
                <View className="flex-1">
                  <QueryForm />
                </View>
              )}
              {activeTab === "Answered" && (
                <View className="px-4">
                  <QueriesCard answeredQueries={answeredQueries} />
                </View>
              )}
              {activeTab === "Pending" && (
                <View className="px-4">
                  <QueriesCard answeredQueries={answeredQueries} waiting={true} />
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

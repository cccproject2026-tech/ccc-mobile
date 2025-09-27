import { Button } from "@/components/atom/buttons";
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import { Header, QuestionFields } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AssessmentData {
  type: string;
  title?: string;
  status?: string;
  completionDate?: string;
  taskStatus?: {
    notStarted: boolean;
    started: boolean;
    inProgress: number;
    toComplete: number;
    completed: boolean;
  };
}

export default function AnswerQuestionPage() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");

  const questions = [
    {
      id: "membership",
      question: "What is your current church membership?",
      placeholder: "Enter your church membership details...",
      required: true,
    },
    {
      id: "active_members",
      question: "How many active members do you have currently?",
      placeholder: "Enter number of active members...",
      required: true,
    },
    {
      id: "baptisms",
      question: "How many baptisms in the last two years?",
      placeholder: "Enter number of baptisms...",
      required: false,
    },
  ];

  const handleAnswersChange = (answers: any) => {
    console.log("Answers updated:", answers);
  };

  const handleSubmit = (answers: any) => {
    console.log("Form submitted:", answers);
    // Handle form submission
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
            <Header
              title="Church Assessment Evaluation(CMA)"
              subTitle="Assessment"
              hideSearchBar={true}
            />

            {/* Question Fields */}
            <QuestionFields
              questions={questions}
              onAnswersChange={handleAnswersChange}
              onSubmit={handleSubmit}
              wrapperClass="pt-[30%]"
            />

            {/* Form  Buttons */}
            <View className="flex flex-row mx-auto justify-center items-center gap-6">
              <Button
                style={{
                  maxWidth: 87,
                  width: "100%",
                }}
                type="cancel"
                title={"Cancel"}
                onPress={() => {}}
              />
              <Button
                style={{
                  maxWidth: 87,
                  width: "100%",
                }}
                type="submit"
                title={"Submit"}
                onPress={() => {}}
              />
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Modal */}
        <RoadMapOutcomeModal
          isMenuVisible={isRoadmapModalVisible}
          closeMenu={() => setIsRoadmapModalVisible(false)}
        />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
});

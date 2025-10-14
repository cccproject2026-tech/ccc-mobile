import { Button } from "@/components/atom/buttons";
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import {
  AssessmentMainCard,
  GuidelinesPoints,
  Header
} from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
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

export default function CmaSurvey() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const params = useLocalSearchParams();

  // Parse the data safely
  const dataItems: AssessmentData | undefined = params.data
    ? (JSON.parse(params.data as string) as AssessmentData)
    : undefined;

  console.log("data", dataItems?.type);

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
            <PastorNavigationHeader showNameTag={true} />

            {/* Header Section */}
            <Header
              title="Church Assessment Evaluation(CMA)"
              subTitle="Assessment"
              hideSearchBar={true}
            />

            {/* Tabs Section */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 8,
                marginTop: 15,
                paddingBottom: 5,
              }}
              style={{ maxHeight: 50 }}
            >
             
            </ScrollView>

            {/* Content Section */}
            <AssessmentMainCard
              type={dataItems?.type}
              dueDate={dataItems?.completionDate}
              dueDateClass="text-yellow-500"
            />

            {/* Guidelines points Section */}
            <GuidelinesPoints />

            <Button
              type="start"
              title="Start Now"
              textStyle={{
                color: "#001FC1",
                fontSize: 16,
                fontWeight: 600,
              }}
              style={{
                backgroundColor: "white",
                maxWidth: "50%",
                width: "100%",
                marginHorizontal: "auto",
                marginTop:42
              }}
              onPress={()=>{
                router.push("/(pastor-tabs)/assessments/answer-question-page")
              }}
            />
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

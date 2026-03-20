import { Button } from "@/components/atom/buttons";
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import {
  AssessmentCard,
  GuidelinesPoints,
  Header,
} from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { useAssessment } from "@/hooks/assessments";
import { ApiAssessment, Assessment } from "@/lib/assessments/types";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper function to map API assessment to component Assessment type
const mapApiAssessmentToAssessment = (apiAssessment: ApiAssessment): Assessment => {
  // Infer type from name or default to 'PMP'
  const inferType = (name: string): 'CMA' | 'PMP' => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('cma') || nameLower.includes('church')) {
      return 'CMA';
    }
    return 'PMP';
  };

  return {
    id: apiAssessment._id,
    type: inferType(apiAssessment.name),
    title: apiAssessment.name,
    description: apiAssessment.description,
    status: 'Not Started' as const,
    guidelines: apiAssessment.instructions,
    sections: apiAssessment.sections.map((section) => ({
      title: section.title,
      subtitle: section.description,
      questionGroups: section.layers.map((layer) => ({
        id: layer._id,
        questions: [
          {
            id: layer._id,
            text: layer.title, // Layer title is the question
            type: 'radio' as const,
            options: layer.choices.map((c) => ({
              label: c.text,
              value: c._id,
            })),
            required: false,
          },
        ],
      })),
    })),
  };
};

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

export default function PmpSurvey() {
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const [tabs, setTabs] = React.useState("All");

  const params = useLocalSearchParams();
  const assessmentId = params.assessmentId as string;

  // Use TanStack Query hook
  const { data: assessment, isLoading: loading, error: queryError } = useAssessment(assessmentId);
  const error = queryError ? 'Failed to load assessment. Please try again.' : null;

  // Infer type from name or default to 'PMP'
  const inferType = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('cma') || nameLower.includes('church')) {
      return 'CMA';
    }
    return 'PMP';
  };

  const dummyRoadMaps = [
    {
      title: "Church Assessment Evaluation(CMA)",
      description: "Review the overall health of your church",
      type: "CMA",
      status: "Due",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
    {
      title: "Pastoral Ministry Profile (PMP)",
      description: "Take a deeper look into your ministry",
      type: "PMP",
      status: "Not Started",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 8,
        completed: false,
      },
    },
    {
      title: "Church Empowerment PhasePastoral Ministry Profile (PMP)",
      description: "Take a deeper look into your ministry",
      type: "PMP",
      status: "Submitted",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 18,
        completed: false,
      },
    },
    {
      title: "Church Assessment Evaluation(CMA)",
      description: "Review the overall health of your church ",
      type: "CMA",
      status: "Completed",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
    {
      title: "Pastoral Ministry Profile (PMP)",
      description: "Take a deeper look into your ministry",
      type: "PMP",
      status: "Completed",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
    },
  ];

  const availableTabs = [
    { tab: "All" },
    { tab: "Due" },
    { tab: "Not Started" },
    { tab: "In Progress" },
    { tab: "Completed" },
    { tab: "Overdue" },
    { tab: "Pending Review" },
    { tab: "On Hold" },
  ];

  const filteredRoadMaps = dummyRoadMaps.filter((item) => {
    if (tabs === "All") return true;
    return item.status === tabs;
  });

  if (loading) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', marginTop: 12 }}>
              Loading assessment...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error || !assessment) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }}>
            <Text style={{ color: '#FF6B6B', fontSize: 16, textAlign: 'center' }}>
              {error || 'Assessment not found'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const assessmentData = mapApiAssessmentToAssessment(assessment);

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
              title={assessment.name}
              subTitle="Assessment"
              hideSearchBar={true}
              showSettings={false}
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
            <AssessmentCard
              data={assessmentData}
            />

            {/* Guidelines points Section */}
            <GuidelinesPoints guidelines={assessment.instructions} />

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
                marginTop: 42
              }}
              onPress={() => {
                router.push({
                  pathname: "/(mentor-tabs)/assessments/(pmp)/survey-form",
                  params: { assessmentId: assessment._id },
                });
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

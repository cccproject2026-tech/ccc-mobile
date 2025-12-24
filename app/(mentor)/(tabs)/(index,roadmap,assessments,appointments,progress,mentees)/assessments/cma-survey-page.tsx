import { Button } from "@/components/atom/buttons";
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal";
import {
  AssessmentMainCard,
  GuidelinesPoints,
  Header
} from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { useAssessment } from "@/hooks/assessments";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
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
  const assessmentId = params.assessmentId as string;

  // Use TanStack Query hook
  const { data: assessment, isLoading: loading, error: queryError } = useAssessment(assessmentId);
  const error = queryError ? 'Failed to load assessment. Please try again.' : null;

  // Infer type from name or default to 'CMA'
  const inferType = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('cma') || nameLower.includes('church')) {
      return 'CMA';
    }
    return 'PMP';
  };

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

  const assessmentType = inferType(assessment.name);

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
              title={assessment.name}
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
              type={assessmentType}
              dueDate={undefined}
              dueDateClass="text-yellow-500"
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
                  pathname: "/(mentor)/assessments/answer-question-page" as any,
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

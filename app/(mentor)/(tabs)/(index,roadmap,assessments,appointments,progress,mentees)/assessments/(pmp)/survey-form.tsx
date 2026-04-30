import { SurveyButton } from "@/components/atom/buttons";
import { ChecklistCard } from "@/components/atom/checklistCard";
import ProgressDots from "@/components/atom/dots";
import { SurveyModal } from "@/components/atom/surveyModal";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAssessment, useSubmitAssessmentAnswers } from "@/hooks/assessments";
import { useAuthStore } from "@/stores/auth.store";
import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SurveyForm() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const { user } = useAuthStore();
  const [selections, setSelections] = React.useState<{
    [key: string]: number[];
  }>({}); 
  const [formTab, setFormTab] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Use TanStack Query hooks
  const { data: assessment, isLoading: loading, error: queryError } = useAssessment(assessmentId);
  const submitAssessmentMutation = useSubmitAssessmentAnswers();
  const error = queryError ? "Failed to load assessment. Please try again." : null;
  const totalPages = assessment?.sections.length || 0;

  const handlePageChange = (newIndex: number) => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setFormTab(newIndex);
  };

  const handleSelectionChange = (key: string, indices: number[]) => {
    setSelections((prev) => ({ ...prev, [key]: indices }));
  };

  const clearCurrentTabSelections = () => {
    if (!assessment) return;
    
    const currentSection = assessment.sections[formTab];
    if (!currentSection) return;

    // Get all layer keys for the current section
    const tabKeys = currentSection.layers.map(
      (layer) => `section_${currentSection._id}_layer_${layer._id}`
    );

    setSelections((prev) => {
      const newSelections = { ...prev };
      tabKeys.forEach((key) => {
        delete newSelections[key];
      });
      return newSelections;
    });
  };

  const transformSelectionsToApiFormat = () => {
    if (!assessment || !user) return null;

    const sectionsMap = new Map<string, { layerId: string; selectedChoice: string }[]>();

    Object.entries(selections).forEach(([key, selectedIndices]) => {
      const parts = key.split('_');
      // Format: section_${sectionId}_layer_${layerId}
      if (parts.length >= 4 && parts[0] === 'section' && parts[2] === 'layer') {
        const sectionId = parts[1];
        const layerId = parts.slice(3).join('_');
        
        const section = assessment.sections.find((s) => s._id === sectionId);
        if (section) {
          const layer = section.layers.find((l) => l._id === layerId);
          if (layer) {
            selectedIndices.forEach((index) => {
              const choiceId = layer.choices[index]?._id;
              if (choiceId) {
                let sectionLayers = sectionsMap.get(sectionId);
                if (!sectionLayers) {
                  sectionLayers = [];
                  sectionsMap.set(sectionId, sectionLayers);
                }
                sectionLayers.push({
                  layerId,
                  selectedChoice: choiceId
                });
              }
            });
          }
        }
      }
    });

    const answers = Array.from(sectionsMap.entries()).map(([sectionId, layers]) => ({
      sectionId,
      layers
    }));

    return {
      userId: user.id,
      answers
    };
  };

  const handleSubmitSurvey = () => {
    // Transform selections to API format
    const submissionData = transformSelectionsToApiFormat();

    if (!submissionData) {
      Alert.alert("Error", "Unable to submit assessment. Please check your connection and try again.");
      return;
    }

    // Submit the assessment
    submitAssessmentMutation.mutate(
      {
        assessmentId,
        payload: submissionData,
      },
      {
        onSuccess: () => {
          setIsVisible(true);
        },
        onError: (error: any) => {
          console.error("Failed to submit assessment:", error);
          Alert.alert(
            "Submission Failed",
            "Failed to submit assessment. Please try again.",
            [{ text: "OK" }]
          );
        },
      }
    );
  };

  const RenderFormData = ({
    section,
  }: {
    section: NonNullable<typeof assessment>["sections"][0];
  }) => {
    return (
      <View className="flex gap-5 px-4">
        <ProgressDots
          total={totalPages}
          activeIndex={formTab}
          onChange={handlePageChange}
        />

        <View className="w-full p-5 flex justify-center items-center gap-2 rounded-[10px] bg-[#194F82]">
          <View className="max-w-[105px] px-5 py-2 rounded-[15px] border border-solid border-[#FFFFFF73]">
            <Text className="font-medium text-[15px] leading-[22px] text-white">
              {section.title}
            </Text>
          </View>
          <Text className="font-bold text-[17px] leading-[22px] text-white text-center">
            {section.description}
          </Text>
        </View>

        {/* Render ChecklistCard for each layer */}
        {section.layers.map((layer) => {
          const selectionKey = `section_${section._id}_layer_${layer._id}`;
          const choiceTexts = layer.choices.map((choice) => choice.text);

          return (
            <View key={layer._id} className="flex gap-3">
              <ChecklistCard
                items={choiceTexts}
                selectable
                selectedIndices={selections[selectionKey] || []}
                onSelectionChange={(indices) =>
                  handleSelectionChange(selectionKey, indices)
                }
              />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <AppGradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <PastorNavigationHeader
              showDrawer={false}
              showNotificationIcon={false}
              wrapperClass="!justify-end"
            />

            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white mt-4">Loading assessment...</Text>
              </View>
            ) : error ? (
              <View className="flex-1 justify-center items-center px-4">
                <Text className="text-white text-center text-lg">{error}</Text>
              </View>
            ) : !assessment ? (
              <View className="flex-1 justify-center items-center px-4">
                <Text className="text-white text-center text-lg">
                  No assessment data available
                </Text>
              </View>
            ) : (
              <View className="flex gap-5">
                {assessment.sections.map((section, index) => {
                  if (formTab !== index) return null;
                  return <RenderFormData key={section._id} section={section} />;
                })}
                <View
                  className="flex flex-row justify-center items-center max-w-[40%] mx-auto"
                  style={{ gap: 10 }}
                >
                  <SurveyButton
                    title="Clear Responses"
                    onPress={clearCurrentTabSelections}
                    bgColor="#ffffff"
                    textColor="#001FC1"
                  />
                  <SurveyButton
                    title={
                      formTab === totalPages - 1
                        ? submitAssessmentMutation.isPending
                          ? "Submitting..."
                          : "Submit Survey"
                        : "Next Section"
                    }
                    icon={submitAssessmentMutation.isPending ? undefined : icons.forward}
                    onPress={() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                      if (formTab === totalPages - 1) {
                        handleSubmitSurvey();
                      } else {
                        handlePageChange(formTab + 1);
                      }
                    }}
                    disabled={submitAssessmentMutation.isPending}
                  />
                </View>
              </View>
            )}

            <SurveyModal
              isMenuVisible={isVisible}
              closeMenu={() => setIsVisible(false)}
            />
          </ScrollView>
        </SafeAreaView>
      </AppGradientBackground>
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

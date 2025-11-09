import { SurveyButton } from "@/components/atom/buttons";
import { ChecklistCard } from "@/components/atom/checklistCard";
import ProgressDots from "@/components/atom/dots";
import { SurveyModal } from "@/components/atom/surveyModal";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { useAssessment } from "@/hooks/assessments";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SurveyForm() {
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const [selections, setSelections] = React.useState<{
    [key: string]: number[];
  }>({});
  const [formTab, setFormTab] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Use TanStack Query hook
  const { data: assessment, isLoading: loading, error: queryError } = useAssessment(assessmentId);
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
              {/* Layer title as question header */}
              {layer.title && (
                <Text className="font-semibold text-base leading-[22px] text-white">
                  {layer.title}
                </Text>
              )}
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
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
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
                        ? "Submit Survey"
                        : "Next Section"
                    }
                    icon={icons.forward}
                    onPress={() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                      if (formTab === totalPages - 1) {
                        setIsVisible(true);
                      } else {
                        handlePageChange(formTab + 1);
                      }
                    }}
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

import { SurveyButton } from "@/components/atom/buttons";
import { ChecklistCard } from "@/components/atom/checklistCard";
import ProgressDots from "@/components/atom/dots";
import { SurveyModal } from "@/components/atom/surveyModal";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SurveyForm() {
  const [selections, setSelections] = React.useState<{
    [key: string]: number[];
  }>({});
  const [formTab, setFormTab] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const totalPages = 5;

  const handlePageChange = (newIndex: number) => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setFormTab(newIndex);
  };

  const handleSelectionChange = (key: string, indices: number[]) => {
    setSelections((prev) => ({ ...prev, [key]: indices }));
  };

  const clearCurrentTabSelections = () => {
    const tabKeys = [`tab${formTab}_list1`, `tab${formTab}_list2`];
    setSelections((prev) => {
      const newSelections = { ...prev };
      tabKeys.forEach((key) => {
        delete newSelections[key];
      });
      return newSelections;
    });
  };

  const items = [
    "Many members are home bound due to illness",
    "Church attendance has been dwindling, especially younger people",
    "The church’s attendance has been increasing for the last three years",
    "The congregation has grown significantly younger in the last few years",
  ];

  const RenderFormData = ({
    title,
    subTitle,
    subTitle2,
    description = "",
  }: {
    title: string;
    subTitle: string;
    subTitle2?: string;
    description?: string;
  }) => {
    return (
      <View className="flex gap-5 px-4">
        <ProgressDots
          total={totalPages}
          activeIndex={formTab}
          onChange={handlePageChange}
        />

        <View className="w-full p-5 flex justify-center items-center gap-2 rounded-[10px] bg-[#194F82]">
          <View className="max-w-[105px] px-5 py-2 rounded-[20px] leading-[22px] border border-solid border-[#FFFFFF73]">
            <Text className="font-medium text-[15px] leading-[22px] text-white">
              {title}
            </Text>
          </View>
          <Text className="font-bold text-[17px] leading-[22px] text-white text-center">
            {subTitle}
          </Text>
          {subTitle && (
            <Text className="font-semibold text-[15px] leading-[22px] text-white text-center break-all">
              {subTitle2}
            </Text>
          )}
        </View>

        <Text className="font-medium text-sm leading-[18px] text-white/80">
          {description}
        </Text>

        <ChecklistCard
          items={items}
          selectable
          selectedIndices={selections[`tab${formTab}_list1`] || []}
          onSelectionChange={(indices) =>
            handleSelectionChange(`tab${formTab}_list1`, indices)
          }
        />
        <ChecklistCard
          items={items}
          selectable
          selectedIndices={selections[`tab${formTab}_list2`] || []}
          onSelectionChange={(indices) =>
            handleSelectionChange(`tab${formTab}_list2`, indices)
          }
        />
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

            <View className="flex gap-5">
              {formTab === 0 && (
                <RenderFormData
                  title="Section 1"
                  subTitle="Congregational Well being"
                  subTitle2="(biopsychosocial(BPS)/financial/spiritual filter)"
                  description="Select the option that most accurately reflects the health of your church and its community engagement."
                />
              )}

              {formTab === 1 && (
                <RenderFormData
                  title="Section 2"
                  subTitle="Leadership Style"
                  subTitle2="(Elders, Church Board, etc)"
                  description="Select the option in each box that most accurately reflects the health of your church and its community engagement."
                />
              )}

              {formTab === 2 && (
                <RenderFormData
                  title="Section 3"
                  subTitle="Community Engagement History"
                  description="Select the option in each box that most accurately reflects the health of your church and its community engagement."
                />
              )}

              {formTab === 3 && (
                <RenderFormData
                  title="Section 4"
                  subTitle="Pastoral Leadership"
                  description="Select the option in each box that most accurately reflects the health of the pastor. This  section can be given to an individual or a pastoral team to complete."
                />
              )}

              {formTab === 4 && (
                <RenderFormData
                  title="Section 5"
                  subTitle="Christ's Method Alone (CMA) and Cycle of Evangelism"
                  description="Select the option in each box that relates to how Christ Method Alone is being practiced in your community."
                />
              )}
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
                      setIsVisible(true)
                    } else {
                      handlePageChange(formTab + 1);
                    }
                  }}
                />
              </View>
            </View>

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

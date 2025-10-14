import React from "react";
import { Text, View } from "react-native";

export default function GuidelinesCard({
  title = "Assessment Guidelines",
  subtitle = "173 x 22",
  guidelines = [],
  showSubtitle = true,
}: {
  title?: string | undefined;
  subtitle?: string | undefined;
  guidelines?: string[] | undefined;
  showSubtitle?: boolean | undefined;
}) {
  // Default guidelines if none provided
  const defaultGuidelines = [
    "Please complete the assessment in a single session without taking breaks.",
    "If there is a power outage or loss of internet connection, the assessment will restart from the beginning.",
    "You will not be able to return to previous sections.",
    "This assessment consists of 5 sections to complete.",
    "The assessment should take approximately 45 minutes to complete.",
  ];

  const guidelinesToShow =
    guidelines.length > 0 ? guidelines : defaultGuidelines;

  return (
    <View className="w-full mt-4" style={{
      maxWidth: "93%",
      marginHorizontal: 12
    }}>
      {/* Header */}
      <View className="text-center mb-7">
        <Text className="text-white text-base font-semibold mb-2 text-center">{title}</Text>
        {showSubtitle && (
          <Text className="inline-block  text-white px-4 py-1 rounded-md text-sm font-medium">
            {subtitle === "173 x 22" ? "" : subtitle}
          </Text>
        )}
      </View>

      {/* Guidelines Card */}
      <View
        className="rounded-2xl p-8 border border-white/40"
        style={{}}
      >
        <View className="flex flex-col gap-6">
          {guidelinesToShow.map((guideline, index) => (
            <View key={index} className="flex flex-row items-start  gap-3">
              {/* Bullet Point */}
              <View className="flex-shrink-0 mt-2">
                <View className="w-3 h-3 bg-white rounded-full shadow-sm"></View>
              </View>

              {/* Guideline Text */}
              <Text className="text-white text-base leading-6 font-[500px] flex-1">
                {guideline}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

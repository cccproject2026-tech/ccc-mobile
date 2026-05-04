import React from "react";
import { Text, View } from "react-native";

export default function AssessmentCard({
  type = `PMP`,
  dueDate = ``,
  dueDateClass = ``,
  wrapperClass = ``,
  submitDate = ``,
}: {
  type?: string | undefined;
  dueDate?: string | undefined;
  dueDateClass?: string | undefined;
  wrapperClass?: string | undefined;
  submitDate?: string | undefined;
}) {
  return (
    <View>
      <View className={`my-2.5 px-4 w-full ${wrapperClass}`}>
        <View className="w-full min-h-full max-h-[180px] bg-[#00ABAE] border-[3px] border-white rounded-[16px] items-center justify-center">
          <Text className="text-[#0F4C75] text-[48px] font-extrabold tracking-wide">
            {type}
          </Text>
          <View className="h-0.5 w-1/2 bg-white rounded-sm -mt-1.5" />
          <Text className="text-white text-[15px] font-extrabold text-center mt-2 leading-[22px] max-w-[50%]">
            {type === "CMA"
              ? "CHURCH ASSESSMENT EVALUATION"
              : "PASTORAL MINISTRY PROFILE"}
          </Text>
        </View>
      </View>
      <View className="flex flex-row justify-between">
        <View className="mt-10 px-5">
          {dueDate && (
            <Text className={`text-xs leading-[18px] font-bold ${dueDateClass}`}>
              Due :{dueDate}
            </Text>
          )}
        </View>
        <View className="mt-10 px-5">
          {submitDate && (
            <Text className={`text-xs leading-[18px] font-bold ${dueDateClass}`}>
              Submitted :{submitDate}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}
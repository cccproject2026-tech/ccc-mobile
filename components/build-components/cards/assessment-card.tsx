import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function AssessmentCard({
  data,
  navigation,
}: {
  data: any;
  navigation: any;
}) {
  const progressPercentage =
    ((data?.taskStatus?.inProgress ?? 0) /
      (data?.taskStatus?.toComplete ?? 1)) *
      100 +
    "%";

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.push({
          pathname: "/(pastor-tabs)/assessments/cma-survey-page",
          params: { data: JSON.stringify(data) },
        });
      }}
      className="w-full bg-[#194F82] rounded-[10px] py-2 px-2 my-2.5 border border-[#FFFFFF73]"
    >
      <View className="w-full flex-row items-start">
        <View className="w-[130px] items-center">
          <View className="w-full h-[138px] bg-[#00ABAE] border-[5px] border-[#BFFEFE] rounded-[15px] items-center justify-center">
            <Text className="text-[#001B4A] text-[40px] font-extrabold">
              {data?.type}
            </Text>
            <View className="h-0.5 w-[80%] bg-white rounded-sm -mt-1.5" />
            <Text className="text-white text-[9px] font-extrabold text-center mt-2 leading-[18px] px-1">
              {data?.type === "CMA"
                ? "CHURCH ASSESSMENT EVALUATION"
                : "PASTORAL MINISTRY PROFILE"}
            </Text>
          </View>
          {data?.completionDate && (
            <View className="mt-3 w-full items-center">
              <Text
                className={`text-xs font-bold ${
                  data?.status === "Due" ? "text-yellow-400" : "text-white"
                }`}
              >
                Due :{data?.completionDate}
              </Text>
            </View>
          )}
        </View>

        <View className="ml-2.5 flex-1 gap-1">
          <View>
            <Text
              className="text-white text-base leading-[22px] font-semibold"
              ellipsizeMode="tail"
            >
              {data?.title}
            </Text>
          </View>
          <Text className="py-2 text-[#F4F2F2B5] font-normal text-sm">
            {data?.description}
          </Text>
          <TouchableOpacity className="items-center border border-[#FFFFFF33] py-1 px-2 my-1 rounded-lg max-w-[70%]">
            <Text className="text-sm text-white font-medium">
              Status{" "}
              <Text className="text-white font-black items-center">•</Text>{" "}
              <Text
                className={`text-sm font-medium ${
                  data?.status == "Due" ? "text-yellow-400" : "text-white"
                }`}
              >
                {data?.status}
              </Text>
            </Text>
          </TouchableOpacity>
          <View>
            <Text className="text-sm font-medium text-white">
              Completed on :{data?.completionDate}
            </Text>
          </View>

          {(data && data?.status === "Not Started") ||
          data?.status === "Due" ? (
            <TouchableOpacity className="bg-white items-center rounded-[10px] py-[5px] my-3 w-[70%]">
              <Text className="text-base text-[#001FC1] font-semibold pb-1 leading-[22px]">
                Start Now
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      {data?.type === "PMP" &&
        (data?.status === "Submitted" ? (
          <LinearGradient
            colors={["#B83AF3", "#21B6E9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 10,
              padding: 2,
              marginVertical: 12,
              width: "95%",
              marginHorizontal: "auto",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#233A6F",
                borderRadius: 8,
                alignItems: "center",
                paddingVertical: 7,
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                alignContent: "center",
              }}
            >
              <Text
                className="py-1"
                style={{
                  fontSize: 16,
                  color: "yellow",
                  fontWeight: "600",
                  lineHeight: 20,
                }}
              >
                Customized Development Plans
              </Text>
              <TouchableOpacity
                onPress={() => {
                  console.log("Icon clicked!");
                }}
              >
                <Image
                  source={require("../../../assets/icons/threeDots.png")}
                  style={{ width: 24, height: 24, resizeMode: "contain" }}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </LinearGradient>
        ) : data?.status === "Completed" ? (
          <TouchableOpacity className="mx-auto bg-white rounded-[10px] items-center py-[7px] my-3 w-[95%]">
            <Text className="py-1 text-base text-[#001FC1] font-semibold leading-5">
              Customized Development Plans
            </Text>
          </TouchableOpacity>
        ) : null)}
    </TouchableOpacity>
  );
}

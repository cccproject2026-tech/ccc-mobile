import { Assessment } from "@/lib/assessments/types";
import { getFontSize, getIconSize, getSpacing, moderateScale, verticalScale } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function AssessmentCard({
  data,
  onPress,
  onMeetingPress,
  onMeetingIconPress,
  onCustomizedPress,
}: {
  data: Assessment;
  onPress?: (data: Assessment) => void;
  onMeetingPress?: () => void;
  onMeetingIconPress?: () => void;
  onCustomizedPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(data)} // Use the passed onPress handler
      className="w-full bg-[#194F82] rounded-[10px] py-2 px-2 my-2.5 border border-[#FFFFFF73]"
    >
      <View className="flex-row items-start w-full">
        <View style={{ width: moderateScale(130) }} className="items-center">
          <View
            style={{
              width: "100%",
              height: verticalScale(138),
              backgroundColor: "#00ABAE",
              borderWidth: moderateScale(5),
              borderColor: "#BFFEFE",
              borderRadius: moderateScale(15),
            }}
            className="items-center justify-center"
          >
            <Text
              style={{
                color: "#001B4A",
                fontSize: getFontSize(40),
                fontWeight: "800",
              }}
            >
              {data?.type}
            </Text>
            <View
              style={{
                height: moderateScale(0.5),
                width: "80%",
                backgroundColor: "white",
                borderRadius: moderateScale(1),
                marginTop: moderateScale(-6),
              }}
            />
            <Text
              style={{
                color: "white",
                fontSize: getFontSize(9),
                fontWeight: "800",
                textAlign: "center",
                marginTop: getSpacing(8),
                lineHeight: getFontSize(18),
                paddingHorizontal: getSpacing(4),
              }}
            >
              {data?.type === "CMA"
                ? "CHURCH ASSESSMENT EVALUATION"
                : "PASTORAL MINISTRY PROFILE"}
            </Text>
          </View>
          {data?.dueDate && (
            <View className="items-center w-full mt-3">
              <Text
                style={{
                  fontSize: getFontSize(12),
                  fontWeight: "700",
                  color: data?.status === "Due" ? "#EAB308" : "white",
                }}
              >
                Due : {data?.dueDate}
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginLeft: getSpacing(10) }} className="flex-1 gap-1">
          <View>
            <Text
              style={{
                color: "white",
                fontSize: getFontSize(16),
                lineHeight: getFontSize(22),
                fontWeight: "600",
              }}
              ellipsizeMode="tail"
            >
              {data?.title}
            </Text>
          </View>
          <Text
            style={{
              paddingVertical: getSpacing(8),
              color: "#F4F2F2B5",
              fontSize: getFontSize(14),
            }}
          >
            {data?.description}
          </Text>
          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: "#FFFFFF33",
              paddingVertical: getSpacing(4),
              paddingHorizontal: getSpacing(8),
              marginVertical: getSpacing(4),
              borderRadius: moderateScale(8),
              maxWidth: "70%",
            }}
            className="items-center"
          >
            <Text style={{ fontSize: getFontSize(14), fontWeight: "500", color: "white" }}>
              Status{" "}
              <Text style={{ fontWeight: "900", color: "white" }}>•</Text>{" "}
              <Text
                style={{
                  fontSize: getFontSize(14),
                  fontWeight: "500",
                  color: data?.status === "Due" ? "#EAB308" : "white",
                }}
              >
                {data?.status}
              </Text>
            </Text>
          </TouchableOpacity>
          {data?.completionDate && (
            <View>
              <Text style={{ fontSize: getFontSize(14), fontWeight: "500", color: "white" }}>
                Completed on : {data?.completionDate}
              </Text>
            </View>
          )}

          {((data?.status === "Not Started") || (data?.status === "Due")) && (
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                alignItems: "center",
                borderRadius: moderateScale(10),
                paddingVertical: getSpacing(5),
                marginVertical: getSpacing(12),
                width: "70%",
              }}
              onPress={() => onPress && onPress(data)} // Use onPress for Start Now too
            >
              <Text
                style={{
                  fontSize: getFontSize(16),
                  color: "#001FC1",
                  fontWeight: "600",
                  paddingBottom: getSpacing(4),
                  lineHeight: getFontSize(22),
                }}
              >
                Start Now
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {data?.type === "PMP" && (
        <>
          {data?.status === "Submitted" && data?.meetingDate ? (
            <LinearGradient
              colors={["#B83AF3", "#21B6E9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: moderateScale(10),
                padding: moderateScale(2),
                marginVertical: getSpacing(12),
                width: "95%",
                alignSelf: "center",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#233A6F",
                  borderRadius: moderateScale(8),
                  alignItems: "center",
                  paddingVertical: getSpacing(7),
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: getSpacing(10),
                }}
                onPress={onMeetingPress}
              >
                <Text
                  style={{
                    fontSize: getFontSize(16),
                    color: "#EAB308",
                    fontWeight: "600",
                    lineHeight: getFontSize(20),
                    paddingVertical: getSpacing(4),
                  }}
                >
                  Meeting Scheduled on {data?.meetingDate}
                </Text>
                <TouchableOpacity onPress={onMeetingIconPress}>
                  <Image
                    source={require("../../../assets/icons/threeDots.png")}
                    style={{
                      width: getIconSize(24),
                      height: getIconSize(24),
                      resizeMode: "contain",
                    }}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </LinearGradient>
          ) : data?.status === "Completed" ? (
            <TouchableOpacity
              style={{
                alignSelf: "center",
                backgroundColor: "white",
                borderRadius: moderateScale(10),
                alignItems: "center",
                paddingVertical: getSpacing(7),
                marginVertical: getSpacing(12),
                width: "95%",
              }}
              onPress={onCustomizedPress}
            >
              <Text
                style={{
                  paddingVertical: getSpacing(4),
                  fontSize: getFontSize(16),
                  color: "#001FC1",
                  fontWeight: "600",
                  lineHeight: getFontSize(20),
                }}
              >
                Customized Development Plans
              </Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}
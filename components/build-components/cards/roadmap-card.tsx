import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View, type DimensionValue } from "react-native";

export default function RevitalizationCard({
  data,
  navigation,
}: {
  data: any;
  navigation: any;
}) {
  const progressPercentage: DimensionValue =
    data?.taskStatus?.toComplete > 0
      ? `${(data?.taskStatus?.inProgress / data.taskStatus.toComplete) * 100}%`
      : "0%";
  const [hasVisited, setHasVisited] = useState(false);
  const pathname = usePathname();
  console.log(pathname, "paht");

  const handleNavigation = () => {
    if (pathname === "/roadmap/phase-1/revitalization-roadmap") {
      typeof data.assignment !== "undefined" && data.assignment
        ? navigation.push({
          pathname:
            "/(pastor-tabs)/profile/my-assignment/detailed-assignment",
          params: { data: JSON.stringify(data) },
        })
        : typeof data.subPhase !== "undefined" && data.subPhase
          ? navigation.push({
            pathname: "/(pastor-tabs)/roadmap/sub-phases",
            params: { data: JSON.stringify(data) },
          })
          : navigation.push({
            pathname: "/(pastor-tabs)/roadmap/phase-1/detailed-roadmap",
            params: { data: JSON.stringify(data) },
          });
    } else if (pathname === "/roadmap/phase-2/revitalization-roadmap") {
      typeof data.assignment !== "undefined" && data.assignment
        ? navigation.push({
          pathname:
            "/(pastor-tabs)/profile/my-assignment/detailed-assignment",
          params: { data: JSON.stringify(data) },
        })
        : typeof data.subPhase !== "undefined" && data.subPhase
          ? navigation.push({
            pathname: "/(pastor-tabs)/roadmap/sub-phases",
            params: { data: JSON.stringify(data) },
          })
          : data.empowerment
            ? navigation.push({
              pathname: "/(pastor-tabs)/roadmap/phase-2/detailed-empowerment",
              params: { data: JSON.stringify(data) },
            })
            : navigation.push({
              pathname: "/(pastor-tabs)/roadmap/phase-2/detailed-roadmap",
              params: { data: JSON.stringify(data) },
            });
    } else if (pathname === "/roadmap/landing/landing") {
      typeof data.assignment !== "undefined" && data.assignment
        ? navigation.push({
          pathname:
            "/(mentor)/profile/my-assignment/detailed-assignment",
          params: { data: JSON.stringify(data) },
        })
        : typeof data.subPhase !== "undefined" && data.subPhase
          ? navigation.push({
            pathname: "/(mentor)/roadmap/sub-phases",
            params: { data: JSON.stringify(data) },
          })
          : data.empowerment
            ? navigation.push({
              pathname: "/(mentor)/roadmap/phase-2/detailed-empowerment",
              params: { data: JSON.stringify(data) },
            })
            : navigation.push({
              pathname: "/(mentor)/roadmap/phase-2/detailed-roadmap",
              params: { data: JSON.stringify(data) },
            });
    } else {
      if (data.phase === "Phase 1") {
        router.push("/roadmap/phase-1/revitalization-roadmap");
      } else if (data.phase === "Phase 2") {
        router.push("/roadmap/phase-2/revitalization-roadmap");
      } else {
        router.push("/roadmap/phase-1/revitalization-roadmap");
      }
    }
  }
  return (
    <TouchableOpacity
      onPress={handleNavigation}
      className="w-full  bg-[#46660] rounded-[10px] p-4 my-2.5  border border-white/45"
    >
      {/* Main Content Row */}
      <View className="flex-row w-full">
        {/* Image Section - Fixed Width */}
        <View className="w-[110px]  mr-3 flex-shrink-0">
        <View className="w-[110px] h-[100px] mr-3 flex-shrink-0">
          <View className="relative w-full">
            <Image
              source={data?.image}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
            {data?.phase && (
              <View className="absolute left-0 right-0 mx-2 bottom-2">
                <Text className="text-black font-semibold text-xs text-center bg-[#F1E91A85] py-1 px-2 rounded-lg">
                  {data?.phase}
                </Text>
              </View>
            )}
          </View>
          </View>
          {/* Completion Time */}
          {data?.time && (
            <Text className="mt-2 text-xs font-semibold text-white" numberOfLines={2}>
              {data?.time}
            </Text>
          )}
        </View>

        {/* Content Section - Flexible */}
        <View className="flex-1">
          {/* Title */}
          <Text
            className="mb-1 text-base font-semibold text-white"
            numberOfLines={2}
          >
            {data?.title}
          </Text>

          {/* Description */}
          <Text
            className="text-[#F4F2F2B5] text-sm font-medium leading-[18px] mb-2"
            numberOfLines={2}
          >
            {data?.description}
          </Text>

          {/* Status Badge - Responsive */}
          <View className="self-start px-3 py-1 mb-2 border rounded-lg border-white/20">
            <Text className="text-sm font-medium text-white">
              Status{" "}
              <Text className="font-black">•</Text>{" "}
              <Text
                className={`text-sm font-medium ${data?.status === "Due" ? "text-yellow-400" : "text-white"
                  }`}
              >
                {data?.status}
              </Text>
            </Text>
          </View>

          {/* Conditional Content Based on Status */}
          {data?.sessionDate && data?.status === "Not Started" && (
            <View className="self-start px-3 py-2 border rounded-lg border-white/40">
              <Text className="mb-1 text-sm font-medium text-white">
                Session Date:
              </Text>
              <View className="border border-[#47729b] py-1 px-2 rounded-lg">
                <Text className="text-xs font-light text-center text-white">
                  {data?.sessionDate}
                </Text>
              </View>
            </View>
          )}

          {data?.taskStatus?.started && (
            <View>
              <View className="flex-row items-center mb-1">
                <View className="bg-black rounded-[10px] flex-1 max-w-[70%] h-1.5">
                  <View
                    className="bg-white h-full rounded-[10px]"
                    style={{ width: progressPercentage }}
                  />
                </View>
                <Text className="ml-2 text-xs font-light text-white">
                  {data?.taskStatus?.inProgress} / {data?.taskStatus?.toComplete}
                </Text>
              </View>
              <Text className="text-xs font-light text-white">
                Tasks Completed
              </Text>
            </View>
          )}

          {data.status === "Completed" && data.completionDate && (
            <Text className="text-xs font-light text-white">
              Completed on: {data.completionDate}
            </Text>
          )}
        </View>
      </View>

      {/* Session Dates - Full Width Below */}
      {data?.showBothDate &&
        data?.sessionDate &&
        data?.status === "Not Started Yet" && (
          <View className="px-4 py-3 mt-3 border border-white rounded-lg">
            <View className="flex-row justify-between gap-3">
              <View className="flex-1">
                <Text className="mb-2 text-sm font-medium text-white">
                  Session Date:
                </Text>
                <View className="border border-[#47729b] py-2 px-2 rounded-lg">
                  <Text className="text-xs font-light text-center text-white">
                    {data?.sessionDate}
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-sm font-medium text-white">
                  Session Date:
                </Text>
                <View className="border border-[#47729b] py-2 px-2 rounded-lg">
                  <Text className="text-xs font-light text-center text-white">
                    {data?.sessionDate}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

      {/* Meeting Banner */}
      {data?.showBothDate && data?.meeting && (
        <LinearGradient
          colors={["#B83AF3", "#21B6E9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ marginTop: 10 }}
          className="rounded-lg p-[2px]"
        >
          <View className="bg-[#233A6F] rounded-lg px-3 py-2 flex-row items-center justify-between">
            <Text
              className="flex-1 mr-2 text-sm font-semibold text-yellow-400"
              numberOfLines={2}
            >
              Meeting Scheduled on {data?.meeting?.scheduled}
            </Text>
            <TouchableOpacity onPress={() => console.log("Icon clicked!")}>
              <Image
                source={require("../../../assets/icons/threeDots.png")}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}
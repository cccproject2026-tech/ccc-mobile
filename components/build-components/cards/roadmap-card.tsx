import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function RevitalizationCard({
  data,
  navigation,
}: {
  data: any;
  navigation: any;
}) {
  const progressPercentage =
    (data?.taskStatus?.inProgress / data.taskStatus.toComplete) * 100 + "%";
  const [hasVisited, setHasVisited] = useState(false);
  const pathname = usePathname();
  console.log(pathname, "paht");

  return (
    <TouchableOpacity
      onPress={() => {
        console.log(data.subPhase);
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
        } else {
          if (data.phase === "Phase 1") {
            router.push("/roadmap/phase-1/revitalization-roadmap");
          } else if (data.phase === "Phase 2") {
            router.push("/roadmap/phase-2/revitalization-roadmap");
          } else {
            router.push("/roadmap/phase-1/revitalization-roadmap");
          }
        }
      }}
      className="w-full bg-[#194F82] rounded-[10px] p-4 my-2.5 border border-white/45"
    >
      <View className="w-full flex-row">
        <View className="w-[110px] h-full items-center">
          <View className="relative">
            <Image
              source={data?.image}
              className="w-[110px] h-[100px] rounded-xl"
            />
            {data?.phase && (
              <View className="mx-5">
                <Text className="text-black font-semibold text-xs text-center absolute bottom-2.5 left-0 right-0 bg-[#F1E91A85] p-1 rounded-lg">
                  {data?.phase}
                </Text>
              </View>
            )}
          </View>
          <View className="mt-2 items-start">
            <Text className="text-white font-semibold leading-[22px] text-xs">
              {data?.time}
            </Text>
          </View>
        </View>

        <View className="ml-2.5 flex-1 gap-0.5">
          <View>
            <Text
              className="text-white text-base font-semibold"
              ellipsizeMode="tail"
            >
              {data?.title}
            </Text>
          </View>
          <Text className="py-2 text-[#F4F2F2B5] leading-[18px] font-medium text-sm">
            {data?.description}
          </Text>

          <TouchableOpacity className="items-center border border-white/20 py-1 px-2 my-1 rounded-lg max-w-[80%]">
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

          {data?.sessionDate && data?.status == "Not Started" ? (
            <TouchableOpacity className="items-center border border-white py-2.5 my-3 rounded-lg w-[80%]">
              <Text className="text-sm text-white font-medium pb-1">
                Session Date :{" "}
              </Text>
              <TouchableOpacity className="border border-[#47729b] p-1.5 my-1 w-[75%] rounded-lg">
                <Text className="text-center text-xs text-white font-light w-full">
                  {data?.sessionDate}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ) : data?.taskStatus?.started ? (
            <>
              <View className="flex-row items-center">
                <View className="bg-black rounded-[10px] w-[80%]">
                  <View
                    className="bg-white h-1.5 rounded-[10px]"
                    style={{ width: 50 }}
                  />
                </View>
                <Text className="text-white text-xs font-light pl-1">
                  {" "}
                  {data?.taskStatus?.inProgress} /{" "}
                  {data?.taskStatus?.toComplete}
                </Text>
              </View>
              <Text className="text-white text-xs font-light">
                Tasks Completed
              </Text>
            </>
          ) : data.status == "Completed" ? (
            <Text className="text-xs text-white font-light">
              {" "}
              Completed on : {data.completionDate}
            </Text>
          ) : (
            <></>
          )}
        </View>
      </View>

      {data?.showBothDate &&
        data?.sessionDate &&
        data?.status == "Not Started Yet" && (
          <TouchableOpacity className="items-center border border-white py-2.5 my-3 rounded-lg w-[95%] flex-row justify-evenly mx-auto">
            <View>
              <Text className="text-sm text-white font-medium pb-1">
                Session Date :{" "}
              </Text>
              <TouchableOpacity className="border border-[#47729b] p-1.5 my-1 w-full rounded-lg">
                <Text className="text-center text-xs text-white font-light w-full">
                  {data?.sessionDate}
                </Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-sm text-white font-medium pb-1">
                Session Date :{" "}
              </Text>
              <TouchableOpacity className="border border-[#47729b] p-1.5 my-1 w-full rounded-lg">
                <Text className="text-center text-xs text-white font-light w-full">
                  {data?.sessionDate}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

      {data?.showBothDate && data?.meeting && (
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
              Meeting Scheduled on 25 {data?.meeting?.scheduled}
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
      )}
    </TouchableOpacity>
  );
}

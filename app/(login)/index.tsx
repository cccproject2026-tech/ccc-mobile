import { Button, ScreenLayout, VideoCard } from "@/components/build-components";
import Separator from "@/components/build-components/separator";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";

import {
  Image,
  ImageSourcePropType,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";


interface ProfileData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  profileSummary: string;
  church1: {
    name: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  church2: {
    name: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  title: string;
  yearsInMinistry: string;
  conference: string;
  communityServiceProjects: string;
  interests: string;
  comments: string;
}

export default function Login() {
  const [tabs, setTabs] = React.useState("All");
  const { flag } = useLocalSearchParams();

  const dummyRoadMaps = [
    {
      title: "Jump-start",
      description: "Attend a two-day revitalization jump-start session",
      time: "Completion Time Months 1 - 2",
      type: "course",
      read: false,
      sessionDate: "10 / 11 / 24",
      status: "Not Started",
      completionDate: "20 Oct 2024",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 0,
        completed: false,
      },
      image: require("@/assets/images/jumpstart.png"),
    },
    {
      title: "Self Revitalization Phase",
      description:
        "Take a deeper look into your ministry to bring conflict resolution and theory of change.",
      time: "Completion Time Months 1 - 2",
      type: "note",
      read: false,
      subPhase: true,
      status: "Not Started",
      taskStatus: {
        notStarted: true,
        started: false,
        inProgress: 0,
        toComplete: 8,
        completed: false,
      },
      image: require("@/assets/images/roadmap.jpg"),
      phase: "Phase 1",
    },
  ];

  const filteredRoadMaps = dummyRoadMaps.filter((item) => {
    if (tabs === "All") return true;
    return item.status === tabs;
  });
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenLayout showDrawer={false}>
        {flag !== "waiting-approval" ? (
          <View className="flex-row gap-4 items-center w-full max-w-[92%]">
            <View
              className={`py-2 px-3 flex gap-1 border border-white rounded-[10px] ${flag === "interest-form" ? "ml-5" : "mx-5 w-full"
                } mt-6  bg-white/20 `}
            >
              <Text className="text-base font-medium leading-[22px] text-white">
                Contact Information
              </Text>
              <View className="flex-row items-center">
                <Image
                  source={icons.phone}
                  style={{ width: 17, height: 17 }}
                />
                <Text className="text-white text-[14px] leading-[22px] font-medium">
                  {" "}
                  : 269-471-6159
                </Text>
              </View>
              <View className="flex-row items-center">
                <Image
                  source={icons.message}
                  style={{ width: 17, height: 17 }}
                />
                <Text className="text-white text-[14px] leading-[22px] font-medium">
                  {" "}
                  : communitychange@andrews.edu
                </Text>
              </View>
            </View>
            <View
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 8, // For Android
              }}
            >
              <LinearGradient
                colors={["#5B4FB5", "#2B7AB5", "#3BADC5"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="justify-center items-center"
              >
                {flag === "interest-form" && (
                  <View className="flex-row items-center  py-[7px] px-10 shadow-2xl">
                    <Image
                      source={icons.forward as ImageSourcePropType}
                      style={[
                        {
                          width: 15,
                          height: 15,
                          transform: [{ scaleX: -1 }],
                        },
                      ]}
                    />
                    <Text className="text-base py-1 leading-[22px] text-white font-medium">
                      Status
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          </View>
        ) : (
          <LinearGradient
            colors={["#B83AF3", "#21B6E9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              padding: 2,
              marginVertical: 12,
              width: 300,
              alignSelf: "flex-end",
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#176192",
                borderTopLeftRadius: 8,
                borderBottomLeftRadius: 8,
                alignItems: "center",
                paddingVertical: 7,
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                alignContent: "center",
              }}
            >
              <Image
                source={icons.loader}
                style={{ width: 42, height: 26 }}
              />
              <Text className="font-medium text-[16px] leading-[22px] text-white">
                Waiting for Approval
              </Text>
              <IconSymbol
                name="chevron.right"
                size={15}
                weight="medium"
                color={"#FFFFFFCC"}
              />
            </TouchableOpacity>
          </LinearGradient>
        )}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="w-full"
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 16,
              paddingVertical: 10,
              marginTop: 8,
            }}
          >
            <View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden relative">
              <Image
                source={icons.video}
                className="w-full h-full rounded-[25px]"
                resizeMode="cover"
              />
              <View className="absolute bottom-5 left-5 z-50">
                <Text className="text-[24px] text-white font-extrabold leading-[22px]">
                  Welcome !
                </Text>
                <Text className="text-base text-white font-medium">
                  Learn more about CCC
                </Text>
              </View>
            </View>

            <View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden">
              <Image
                source={icons.video}
                className="w-full h-full rounded-[25px]"
                resizeMode="cover"
              />
              <View className="absolute bottom-5 left-5 z-50">
                <Text className="text-[24px] text-white font-extrabold leading-[22px]">
                  Welcome !
                </Text>
                <Text className="text-base text-white font-medium">
                  Learn more about CCC
                </Text>
              </View>
            </View>

            <View className="w-[313px] h-[183px] rounded-[25px] overflow-hidden">
              <Image
                source={icons.video}
                className="w-full h-full rounded-[25px]"
                resizeMode="cover"
              />
              <View className="absolute bottom-5 left-5 z-50">
                <Text className="text-[24px] text-white font-extrabold leading-[22px]">
                  Welcome !
                </Text>
                <Text className="text-base text-white font-medium">
                  Learn more about CCC
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <Separator />

        <View className="flex-row justify-between items-center mx-6">
          <Text className="text-white text-base  leading-[22px] font-semibold">
            More Videos
          </Text>
          <TouchableOpacity>
            <Text className="text-white text-base leading-[22px] font-semibold">
              Show all
            </Text>
          </TouchableOpacity>
        </View>

        {filteredRoadMaps.map((e, i) => (
          <React.Fragment key={i}>
            <VideoCard data={e} navigation={router} />
            {i < filteredRoadMaps.length - 1 && (
              <View className="h-[0.5px] bg-white/30 my-4" />
            )}
          </React.Fragment>
        ))}

        <Separator />

        <Button
          onPress={() => {
            flag === "interest-form"
              ? router.push("/(login)/approval")
              : router.push("/(login)/interest-form");
          }}
          variant="secondary"
          buttonStyle={{
            maxWidth: "95%"
          }}
        >
          Log In
        </Button>

        <Separator />

        <View className="max-w-[95%] mt-12 w-full mx-auto rounded-[10px] border border-white">
          <View className="rounded-2xl overflow-hidden">
            <LinearGradient
              colors={["#7C3AED", "#3B82F6", "#1E40AF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 23,
              }}
              className="rounded-[20px] border h-full border-white"
            >
              <TouchableOpacity onPress={() => { }} activeOpacity={0.8}>
                <Text className="text-base leading-[22px] font-medium text-white py-3">
                  New User {">>"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (flag === "waiting-approval") {
                    router.push("/(login)/password");
                  } else {
                    router.push("/(login)/approval");
                  }
                }}
                activeOpacity={0.8}
              >
                <Text className="text-base leading-[22px] font-medium text-white py-3">
                  Submit Interest
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        <View className="mx-auto mt-12">
          <Image className="w-auto mt-auto" source={icons.universityIcon} />
        </View>
      </ScreenLayout>

      {/* Modals */}
      {/* <ConfirmationModal
          isVisible={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmSave}
        />

        <SuccessToast
          isVisible={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
        /> */}
    </>
  );
}
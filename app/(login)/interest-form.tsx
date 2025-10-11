import { Button, DropDrawer, ScreenLayout, Separator, TextArea } from "@/components/build-components";
import InputField from "@/components/build-components/input-field";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

export default function InterestForm() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const CountryItems = [
    { label: "USA", value: "usa" },
    { label: "Canada", value: "canada" },
    { label: "Mexico", value: "mexico" },
    { label: "Brazil", value: "brazil" },
  ];

  const TitleItems = [
    { label: "Pastor", value: "pastor" },
    { label: "Layleader", value: "layleader" },
    { label: "Seminarian", value: "seminarian" },
  ];

  const interestItems = [
    {
      label:
        "I would like to find out more about the Center for Community Change",
      value: "community_change",
    },
    {
      label: "I am interested in receiving mentoring in community engagement",
      value: "mentoring",
    },
    {
      label: "I would like to talk to one of the mentors",
      value: "talk_mentor",
    },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenLayout
        navigationTagName="Interest Form"
        showNameTag={true} showDrawer={false}
        showNotificationIcon={false}
        enableScrollView={false}
      >
        <View className="flex gap-5 pt-5">
          <Text className="text-base font-semibold leading-[22px] text-white">
            Personal Information
          </Text>
          <View className="flex-row justify-center items-center gap-[10px]">
            <InputField keyboardType="default" label="First Name" />
            <InputField keyboardType="default" label="Last Name" />
          </View>
          <View className="flex-row justify-center items-center gap-[10px]">
            <InputField keyboardType="phone-pad" label="Phone Number" />
            <InputField keyboardType="email-address" label="Email" />
          </View>
        </View>

        <Separator/>

        <View className="flex gap-5">
          <Text className="text-base font-semibold leading-[22px] text-white">
            Current Church Information
          </Text>
          <InputField keyboardType="default" label="Church Name" />
          <View className="flex-row justify-center items-center gap-[10px]">
            <InputField keyboardType="phone-pad" label="Church Phone" />
            <InputField
              keyboardType="email-address"
              label="Church Website"
            />
          </View>
          <InputField keyboardType="default" label="Church Address" />
          <View className="flex-row justify-center items-center gap-[10px]">
            <InputField keyboardType="default" label="City" />
            <InputField keyboardType="default" label="State" />
          </View>
          <View className="flex-row justify-center items-start gap-3 min-h-[34px] px-1">
            <View className="w-1/2" style={{ height: 34 }}>
              <InputField keyboardType="default" label="Zip Code" />
            </View>
            <View className="w-1/2">
              <DropDrawer
                selectedValues={selectedInterests}
                setSelectedValues={setSelectedInterests}
                items={CountryItems}
                placeholder="Country"
                useCircleIndicator={true}
              />
            </View>
          </View>
          <Button
            wrapperClass="flex items-end"
            variant="primary"
          >
            Add more Church
          </Button>
        </View>

         <Separator/>

        <View className="flex gap-5">
          <Text className="text-base font-semibold leading-[22px] text-white">
            Other Information
          </Text>
          <View className="flex-1">
            <DropDrawer
              selectedValues={selectedInterests}
              setSelectedValues={setSelectedInterests}
              items={TitleItems}
              placeholder="Title"
            />
          </View>
          <View className="flex-row justify-center items-center gap-[10px]">
            <InputField
              keyboardType="phone-pad"
              label="Years in Ministry"
            />
            <InputField keyboardType="email-address" label="Conference" />
          </View>
          <InputField
            keyboardType="default"
            label="Current Community Service Projects"
          />
          <DropDrawer
            selectedValues={selectedInterests}
            setSelectedValues={setSelectedInterests}
            items={interestItems}
            placeholder="Interests"
          />
          <TextArea />
          <Button
            onPress={() => router.push({
              pathname: "/(login)",
              params: { flag: "interest-form" }
            })}
            buttonClass="!max-w-[200px] !h-11"
            variant="secondary"
          >
            Submit
          </Button>
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

import { Button } from "@/components/atom/buttons";
import { DropDrawer, TextArea } from "@/components/build-components";
import InputField from "@/components/build-components/input-field";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

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
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={100}
            keyboardOpeningTime={0}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 150,
            }}
            showsVerticalScrollIndicator={false}
          >
            <PastorNavigationHeader
              showNameTag
              showDrawer={false}
              showNotificationIcon={false}
              tagName="Interest Form"
            />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: 100,
                paddingHorizontal: 25,
              }}
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

              <View
                className="my-7 max-w-[95%] mx-4"
                style={styles.separator}
              />

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
                  title="Add more Church"
                  onPress={() => {
                    router.push("/(login)/interest-form");
                  }}
                  style={{
                    maxWidth: "40%",
                    marginLeft: "auto",
                    width: "100%",
                  }}
                  type={"custom"}
                />
              </View>

              <View
                className="my-7 max-w-[95%] mx-4"
                style={styles.separator}
              />

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
                  title="Submit"
                  onPress={() => {
                    router.push({
                      pathname: "/(login)",
                      params: { flag: "interest-form" },
                    });
                  }}
                  style={{
                    maxWidth: "50%",
                    marginHorizontal: "auto",
                    width: "100%",
                  }}
                  type={"cancel"}
                />
              </View>
            </ScrollView>
          </KeyboardAwareScrollView>
        </SafeAreaView>
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
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    // marginVertical: 18,
  },
});

import { Button } from "@/components/atom/buttons";
import InputField from "@/components/build-components/input-field";
import OtpInputBox from "@/components/form-elements/otp-input-box";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Head from "./(components)/head";

export default function Password() {
  const [otpValue, setOtpValue] = React.useState<string>("");
  const [showOtp, setShowOtp] = React.useState(false);
  return (
    <>
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.scrollContainer}>
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
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: 100,
              }}
            >
              <PastorNavigationHeader
                showDrawer={false}
                showNotificationIcon={false}
                wrapperClass="!justify-end"
              />
              <View className="flex flex-1 gap-14">
                <Head />
                <View className="p-5 flex gap-8 border border-solid border-white/20 rounded-[10px] mx-5">
                  <View className="flex gap-4 py-8">
                    <InputField
                      keyboardType="phone-pad"
                      label="Username (Auto populated) Email ID"
                      boxClass="!max-h-[52px] !h-full"
                      labelTop={34}
                    />
                    {showOtp && (
                      <OtpInputBox
                        label="An OTP has been sent to your Registered Email ID. Please fill the OTP to verify Email ID "
                        type="numeric"
                        onTextValue={(text: string) => setOtpValue(text)}
                        onFilledValue={(text: string) => setOtpValue(text)}
                      />
                    )}
                    {!showOtp && (
                      <LinearGradient
                        colors={["#6948C9", "#1B6598", "#264487"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        locations={[0, 0.4969, 1]}
                        style={styles.gradientButton}
                      >
                        <TouchableOpacity
                          className="rounded-lg border border-solid border-[#A5AFC5] py-4 px-20 flex justify-center items-center"
                          style={{ boxShadow: "0px 4px 8px 0px #00000040" }}
                          onPress={() => setShowOtp(true)}
                        >
                          <Text
                            className="font-semibold text-base leading-[19px] text-white"
                            style={{ fontFamily: "AlbertBold" }}
                          >
                            Verify Email ID
                          </Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    )}
                  </View>
                  <View className="flex gap-4">
                    <View className="h-[1px] bg-[#FFFFFF33]"></View>
                    <InputField
                      keyboardType="phone-pad"
                      label="Create Password"
                      boxClass="!max-h-[52px] !h-full mt-[26px]"
                      labelTop={34}
                    />
                    <InputField
                      keyboardType="phone-pad"
                      label="Confirm Password"
                      boxClass="!max-h-[52px] !h-full"
                      labelTop={34}
                    />
                    <Button
                      title="Submit"
                      onPress={() => {
                        router.push("/(login)/login");
                      }}
                      style={{
                        maxWidth: "100%",
                        marginHorizontal: "auto",
                        width: "100%",
                        height: 44,
                      }}
                      type={"cancel"}
                      textColor="#999999"
                    />
                  </View>
                  <View className="mx-auto mt-12">
                    <Image
                      className="w-auto mt-auto"
                      source={icons.universityIcon}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAwareScrollView>
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
  gradientButton: {
    borderRadius: 10,
    padding: 2,
  },
  touchable: {
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});

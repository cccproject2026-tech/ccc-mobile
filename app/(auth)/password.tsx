import OtpInputBox from "@/components/form-elements/otp-input-box"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack } from "expo-router"
import React from "react"
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Head from "./(components)/head"

export default function Password() {
    const [otpValue, setOtpValue] = React.useState<string>("");
    return (
        <>
            <LinearGradient
                colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
                style={{ flex: 1 }}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <SafeAreaView style={styles.scrollContainer}>
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 40,
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
                                <OtpInputBox
                                    label="An OTP has been sent to your Registered Email ID. Please fill the OTP to verify Email ID "
                                    type="numeric"
                                    onTextValue={(text: string) => setOtpValue(text)}
                                    onFilledValue={(text: string) => setOtpValue(text)}
                                />
                                <View className="flex gap-5 pt-8 border-t border-white/20">
                                    <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="h-[44px] bg-white rounded-[10px] border border-solid border-white flex flex-row justify-center items-center">
                                        <Text className={"font-semibold text-base leading-[22px] text-[#999999]"}>
                                            Submit
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </>
    )
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
});

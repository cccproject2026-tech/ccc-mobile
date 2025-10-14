import InputField from "@/components/build-components/input-field"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack } from "expo-router"
import React from "react"
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Head from "./(components)/head"

export default function Login() {
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
                        <View className="flex flex-1 gap-6">
                            <Head showTitle={false} />
                            <View className="flex gap-[60px]">
                                <View className="p-5 flex gap-8 border border-solid border-white/20 rounded-[10px] mx-5">
                                    <View className="flex gap-[25px] py-8">
                                        <InputField keyboardType="email-address" label="Email or User Name" boxClass="!max-h-[52px] !h-full" labelTop={34} />
                                        <InputField keyboardType="default" label="Password" boxClass="!max-h-[52px] !h-full" labelTop={34} />
                                        <View className="flex gap-[9px] mt-[5px]">
                                            <TouchableOpacity className="h-[44px] bg-white rounded-[10px] border border-solid border-white flex flex-row justify-center items-center" onPress={() => router.push("/(login)/profile")}>
                                                <Text className={"font-semibold text-base leading-[22px] text-[#001FC1]"} style={{ fontFamily: "AlbertBold" }}>
                                                    Login
                                                </Text>
                                            </TouchableOpacity>
                                            <Text className="font-medium text-[15px] leading-[22px] text-[#F4F2F2B5] text-right" style={{ fontFamily: "AlbertBold" }}>
                                                Forgot Password?
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View className="max-w-[90%] mt-12 w-full mx-auto rounded-[10px] border border-white">
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
                                            className="rounded-2xl border border-white"
                                        >
                                            <TouchableOpacity onPress={() => { }} activeOpacity={0.8}>
                                                <Text className="text-base leading-[22px] font-medium text-white py-3">
                                                    New User {">>"}
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => router.push("/(login)/approval")} activeOpacity={0.8}>
                                                <Text className="text-base leading-[22px] font-medium text-white py-3">
                                                    Submit Interest
                                                </Text>
                                            </TouchableOpacity>
                                        </LinearGradient>
                                    </View>
                                </View>
                            </View>
                            <View className="mx-auto mt-12">
                                <Image className="w-auto mt-auto" source={icons.universityIcon} />
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

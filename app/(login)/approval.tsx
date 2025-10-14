import { PastorNavigationHeader } from "@/components/pastor/Header"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack } from "expo-router"
import React from "react"
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function Approval() {
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

                        <View className="flex gap-[10px]">
                            <View className="flex gap-[10px]">
                                <View className="relative w-full">
                                    <Image className="w-auto mt-auto" source={icons.church1} />
                                    <TouchableOpacity className="h-[30px] bg-[#35282896] rounded-lg  absolute top-[16px] left-[11px] max-w-[78px] w-full flex justify-center items-center" style={{
                                        height: 38,
                                        borderColor: "#FFFFFF",
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: 93
                                    }}>
                                        <IconSymbol
                                            name="chevron.left"
                                            size={20}
                                            color="#FFFFFFCC"
                                            style={{ marginTop: 1 }}
                                        />
                                        <Text style={{
                                            fontSize: 16,
                                            fontWeight: 500,
                                            lineHeight: 22,
                                            color: "#FFFFFFCC"
                                        }}>
                                            Back
                                        </Text>
                                    </TouchableOpacity>
                                    <View
                                        className="absolute inset-0 flex flex-row items-center justify-center w-full h-full"
                                        style={{ gap: 40 }}
                                    >
                                        <TouchableOpacity>
                                            <Image
                                                source={icons.prevPlayer}
                                                style={{ width: 40, height: 40 }}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity>
                                            <Image
                                                source={icons.playButton}
                                                style={{ width: 60, height: 60 }}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity>
                                            <Image
                                                source={icons.nextPlayer}
                                                style={{ width: 40, height: 40 }}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <Image
                                        className="absolute bottom-0 left-0 right-0 w-full"
                                        source={icons.player}
                                        style={{ width: '100%' }}
                                        resizeMode="contain"
                                    />
                                </View>

                                <View className="flex gap-2 px-3">
                                    <Text className="font-semibold text-2xl leading-[22px] text-white" style={{ fontFamily: "AlbertBold" }}>
                                        Center for Community Change
                                    </Text>
                                    <Text className="font-medium text-sm leading-[18px] text-[#F4F2F2B5]">
                                        Interested in receiving mentoring in community engagement
                                    </Text>
                                </View>
                            </View>
                            <View className="flex gap-[10px]">
                                <View className="relative">
                                    <Image className="w-auto mt-auto" source={icons.church2} />
                                    <View className="h-[30px] bg-[#352828C9] rounded-lg  absolute bottom-[5px] right-[15px] max-w-[68px] w-full flex justify-center items-center">
                                        <Text className="font-semibold text-[13px] leading-[22px] text-white">
                                            11:00
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex gap-2 px-3">
                                    <Text className="font-semibold text-2xl leading-[22px] text-white" style={{ fontFamily: "AlbertBold" }}>
                                        Center for Community Change
                                    </Text>
                                    <Text className="font-medium text-sm leading-[18px] text-[#F4F2F2B5]">
                                        Interested in receiving mentoring in community engagement
                                    </Text>
                                </View>
                            </View>
                            <View className="flex gap-[10px]">
                                <View className="relative">
                                    <Image className="w-auto mt-auto" source={icons.church2} />
                                    <View className="h-[30px] bg-[#352828C9] rounded-lg  absolute bottom-[5px] right-[15px] max-w-[68px] w-full flex justify-center items-center">
                                        <Text className="font-semibold text-[13px] leading-[22px] text-white">
                                            11:00
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex gap-2 px-3">
                                    <Text className="font-semibold text-2xl leading-[22px] text-white" style={{ fontFamily: "AlbertBold" }}>
                                        Center for Community Change
                                    </Text>
                                    <Text className="font-medium text-sm leading-[18px] text-[#F4F2F2B5]">
                                        Interested in receiving mentoring in community engagement
                                    </Text>
                                </View>
                            </View>

                            <View className="max-w-[90%] mt-12 w-full mx-auto rounded-[10px] border border-white">
                                <View className="overflow-hidden rounded-2xl">
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
                                        className="rounded-[20px] border border-white"
                                    >
                                        <TouchableOpacity onPress={() => router.push({
                                            pathname: '/(login)',
                                            params: {
                                                flag: 'waiting-approval'
                                            }
                                        })} activeOpacity={0.8}>
                                            <Text className="text-base leading-[22px] font-medium text-white py-3">
                                                New {">"}
                                            </Text>
                                        </TouchableOpacity>
                                    </LinearGradient>
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

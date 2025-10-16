import { SurveyButton } from "@/components/atom/buttons"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack } from "expo-router"
import React from "react"
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function Media() {
    const [tabActive, setTabActive] = React.useState<string>("photos");

    const getButtonStyles = (buttonName: string) => ({
        textColor: tabActive === buttonName ? "#14517D" : "#ffffff",
        bgColor: tabActive === buttonName ? "#fff" : "#14517D"
    });
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
                            wrapperClass="!justify-end mt-5"
                            showNameTag={true}
                        />

                        <View className="flex gap-[18px] px-4 mt-5">
                            <TouchableOpacity onPress={() => router.push({
                                pathname: "/(pastor-tabs)/(tabs)/roadmap/phase-2/detailed-roadmap",
                                params: {
                                    flag: 'submit-media'
                                }
                            })} className="border border-solid border-[#FFFFFF73] w-full h-[43px] rounded-[10px] flex justify-center items-center">
                                <Text className="text-base leading-[22px] text-white">Shared Media</Text>
                            </TouchableOpacity>

                            <View className="flex flex-row items-center justify-center gap-1">
                                <SurveyButton
                                    title="Photos"
                                    onPress={() => setTabActive("photos")}
                                    {...getButtonStyles("photos")}
                                    wrapperClass="!max-w-[120px] !w-full !h-[36px]"
                                />
                                <SurveyButton
                                    title="Videos"
                                    onPress={() => setTabActive("videos")}
                                    {...getButtonStyles("videos")}
                                    wrapperClass="!max-w-[120px] !w-full !h-[36px]"
                                />
                            </View>

                            <View className="p-3 mt-4 flex gap-8 border border-solid border-white/20 rounded-[10px] h-full">
                                {tabActive === "photos" ? (
                                    <View className="flex flex-row gap-4">
                                        <View className="flex-1 gap-2">
                                            <Image
                                                source={icons.media2}
                                                style={{ width: '100%', height: 100, borderRadius: 3 }}
                                                resizeMode="cover"
                                            />
                                            <Text className="text-sm font-medium leading-[18px] text-[#FFFFFFD9]">
                                                20 Oct 2024
                                            </Text>
                                        </View>
                                        <View className="flex-1 gap-2">
                                            <Image
                                                source={icons.media2}
                                                style={{ width: '100%', height: 100, borderRadius: 3 }}
                                                resizeMode="cover"
                                            />
                                            <Text className="text-sm font-medium leading-[18px] text-[#FFFFFFD9]">
                                                20 Oct 2024
                                            </Text>
                                        </View>
                                    </View>
                                ) : (
                                    <View className="flex flex-row gap-4">
                                        <View className="flex-1 gap-2">
                                            <Image
                                                source={icons.videoMedia}
                                                style={{ width: '100%', height: 100, borderRadius: 3 }}
                                                resizeMode="cover"
                                            />
                                            <Text className="text-sm font-medium leading-[18px] text-[#FFFFFFD9]">
                                                20 Oct 2024
                                            </Text>
                                        </View>
                                        <View className="flex-1 gap-2">
                                            <Image
                                                source={icons.videoMedia}
                                                style={{ width: '100%', height: 100, borderRadius: 3 }}
                                                resizeMode="cover"
                                            />
                                            <Text className="text-sm font-medium leading-[18px] text-[#FFFFFFD9]">
                                                20 Oct 2024
                                            </Text>
                                        </View>
                                    </View>
                                )}
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

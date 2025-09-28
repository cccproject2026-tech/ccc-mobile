import { SurveyButton } from "@/components/atom/buttons"
import { ChecklistCard } from "@/components/atom/checklistCard"
import ProgressDots from "@/components/atom/dots"
import { AssessmentCard } from "@/components/build-components"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React from "react"
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface AssessmentData {
    type: string;
    title?: string;
    status?: string;
    completionDate?: string;
    taskStatus?: {
        notStarted: boolean;
        started: boolean;
        inProgress: number;
        toComplete: number;
        completed: boolean;
    };
}

export default function Submit() {
    const [selections, setSelections] = React.useState<{ [key: string]: number[] }>({});
    const [formTab, setFormTab] = React.useState(0)
    const [isVisible, setIsVisible] = React.useState(false)
    const totalPages = 5
    const params = useLocalSearchParams();

    // Parse the data safely
    const dataItems: AssessmentData | undefined = params.data
        ? (JSON.parse(params.data as string) as AssessmentData)
        : undefined;


    const handlePageChange = (newIndex: number) => {
        setFormTab(newIndex)
    }

    const handleSelectionChange = (key: string, indices: number[]) => {
        setSelections(prev => ({ ...prev, [key]: indices }));
    };

    const clearCurrentTabSelections = () => {
        const tabKeys = [`tab${formTab}_list1`, `tab${formTab}_list2`];
        setSelections(prev => {
            const newSelections = { ...prev };
            tabKeys.forEach(key => {
                delete newSelections[key];
            });
            return newSelections;
        });
    };

    const items = [
        'Feeling physically drained most of the time.',
        'Often feeling drained',
        'Feeling mostly energized and engaged',
        'Feeling fully energized and enjoying life',
    ];


    const RenderFormData = ({ title, subTitle, subTitle2, description = "" }: { title: string; subTitle: string; subTitle2?: string; description?: string }) => {
        return (
            <View className="flex gap-8 px-4">
                <AssessmentCard
                    type={dataItems?.type}
                    dueDate={dataItems?.completionDate}
                    dueDateClass="text-white !font-normal"
                    wrapperClass="!px-0"
                />
                <View className="flex gap-5">
                    <View className="flex flex-row justify-between items-center">
                        <Text className="text-white font-semibold text-base leading-[22px]">
                            My Responses
                        </Text>
                        <View className="max-w-[190px] h-[34px] rounded-[10px] border border-solid border-white bg-[#233A6F] px-5 py-1 flex flex-row justify-center items-center gap-2">
                            <Text className="text-[#999999] font-medium text-sm leading-[18px]">
                                Waiting for Response
                            </Text>
                        </View>
                    </View>
                    <View className="w-full p-5 flex justify-center items-center gap-2 rounded-[10px] bg-[#194F82]">
                        <View className="max-w-[105px] px-5 py-2 rounded-[15px] border border-solid border-[#FFFFFF73]">
                            <Text className="font-medium text-[15px] leading-[22px] text-white">
                                {title}
                            </Text>
                        </View>
                        <Text className="font-bold text-[17px] leading-[22px] text-white text-center">
                            {subTitle}
                        </Text>
                        {subTitle && (
                            <Text className="font-semibold text-[15px] leading-[22px] text-white text-center break-all">
                                {subTitle2}
                            </Text>
                        )}
                    </View>

                    <Text className="font-medium text-sm leading-[18px] text-white/80">
                        {description}
                    </Text>

                    <ChecklistCard
                        items={items}
                        selectable
                        selectedIndices={selections[`tab${formTab}_list1`] || []}
                        onSelectionChange={(indices) => handleSelectionChange(`tab${formTab}_list1`, indices)}
                    />
                    <ChecklistCard
                        items={items}
                        selectable
                        selectedIndices={selections[`tab${formTab}_list2`] || []}
                        onSelectionChange={(indices) => handleSelectionChange(`tab${formTab}_list2`, indices)}
                    />
                </View>
            </View>
        )
    }

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
                        <PastorNavigationHeader />

                        {/* Header Section */}
                        <View
                            style={{
                                width: "100%",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingHorizontal: 20,
                                paddingTop: 20,
                                alignItems: "center",
                            }}
                        >
                            <TouchableOpacity onPress={() => router.back()}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <Image
                                        source={icons.forward}
                                        style={{
                                            width: 18,
                                            height: 18,
                                            transform: [{ scaleX: -1 }],
                                        }}
                                    />
                                    <Text className="text-white font-semibold text-[17px]">
                                        Pastoral Ministry Profile (PMP)
                                    </Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Ionicons name="ellipsis-vertical" size={20} color="white" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex gap-5">
                            <ProgressDots
                                total={totalPages}
                                activeIndex={formTab}
                                onChange={handlePageChange}
                                wrapperClass="mt-5"
                            />

                            {formTab === 0 && (
                                <RenderFormData
                                    title="Section 1"
                                    subTitle="Personal Well-Being"
                                    subTitle2="(biopsychosocial(BPS)/financial/spiritual filter)"
                                />
                            )}

                            {formTab === 1 && (
                                <RenderFormData
                                    title="Section 2"
                                    subTitle="Professional Development/ Leadership style"
                                />
                            )}

                            {formTab === 2 && (
                                <RenderFormData
                                    title="Section 3"
                                    subTitle="Community Engagement (CE) Experience "
                                />
                            )}

                            {formTab === 3 && (
                                <RenderFormData
                                    title="Section 4"
                                    subTitle="Congregational Health"
                                    description="Select the option in each box that most accurately reflects the health of the pastor. This  section can be given to an individual or a pastoral team to complete."
                                />
                            )}

                            {formTab === 4 && (
                                <RenderFormData
                                    title="Section 5"
                                    subTitle="Continuing Education"
                                />
                            )}


                            <View className="flex flex-row justify-center items-center" style={{ gap: 10 }}>
                                {formTab !== 0 && (
                                    <SurveyButton
                                        title="View Preview Section"
                                        onPress={() => handlePageChange(formTab - 1)}
                                        bgColor="#ffffff"
                                        textColor="#001FC1"
                                        disabled={formTab === 0}
                                        wrapperClass="!max-w-[184px]"
                                    />
                                )}
                                {formTab !== totalPages - 1 && (
                                    <SurveyButton
                                        title={"View Next Section"}
                                        onPress={() => {
                                            if (formTab === totalPages - 1) {
                                                // setIsVisible(true)
                                                router.push("/(pastor-tabs)/assessments/(pmp)/pmp-survey-page")
                                            } else {
                                                handlePageChange(formTab + 1)
                                            }
                                        }}
                                    />
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
})
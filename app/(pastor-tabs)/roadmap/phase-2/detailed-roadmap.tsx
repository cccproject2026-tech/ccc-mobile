import { Button } from "@/components/atom/buttons"
// import { CheckBox } from "@/components/atom/checkBox"
import { OptionsModal } from "@/components/atom/modals"
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal"
import { Tab } from "@/components/atom/tab"
import InputField from "@/components/build-components/input-field"
import TextAreaField from "@/components/build-components/text-area"
import { PastorNavigationHeader } from "@/components/pastor/Header"
import { Colors } from "@/constants/Colors"
import { icons } from "@/constants/images"
import { LinearGradient } from "expo-linear-gradient"
import { Stack, router, useLocalSearchParams } from "expo-router"
import React from "react"
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function DetailedRoadMap() {
  const { data: dataParam, flag } = useLocalSearchParams()
  const data = dataParam ? JSON.parse(dataParam as string) : null

  const [isModalVisible, setIsModalVisible] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState()
  const [isRoadmapModalVisible, setIsRoadmapModalVisible] =
    React.useState(false)

  const availableTabs = [
    { tab: "Over View" },
    { tab: "Comments" },
    { tab: "Queries" },
  ]

  const [tabs, setTabs] = React.useState("Over View")
  const [surveyGuideLines, setSurveyGuideLines] = React.useState(false)
  const [showCommunity, setShowCommunity] = React.useState(false)

  const handleTabPress = (tabName: string) => {
    if (tabName === "Over View") {
      setTabs(tabName)
    } else if (tabName === "Comments") {
      router.push({
        pathname: "/(pastor-tabs)/roadmap/comments",
        params: { data: JSON.stringify(data) },
      })
    } else if (tabName === "Queries") {
      router.push({
        pathname: "/(pastor-tabs)/roadmap/queries",
        params: { data: JSON.stringify(data) },
      })
    }
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
                  <View style={{ flexDirection: "column" }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "white",
                        fontWeight: "500",
                      }}
                    >
                      {data?.navigatedFrom == "assignment"
                        ? "Assignments"
                        : data?.title}
                    </Text>
                    {data?.navigatedFrom == "assignment" ? (
                      <></>
                    ) : (
                      <Text
                        style={{
                          fontSize: 10,
                          color: "white",
                          fontWeight: "200",
                        }}
                      >
                        {" "}
                        Revitalization Roadmap
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <Image
                  source={icons.menuVertical}
                  style={{ width: 20, height: 20 }}
                />
              </TouchableOpacity>
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Tabs Section */}
            {!surveyGuideLines && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  marginTop: 15,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                {availableTabs.map((e, i) => (
                  <Tab
                    key={i}
                    data={e}
                    tabs={tabs}
                    setTabs={setTabs}
                    onPress={() => handleTabPress(e.tab)}
                  />
                ))}
              </View>
            )}

            {/* Content Section */}
            <View
              style={{
                marginVertical: 10,
                paddingTop: 20,
                paddingBottom: 150,
                paddingHorizontal: 10,
                width: "100%",
              }}
            >
              {!surveyGuideLines ? (
                tabs == "Over View" ? (
                  <View style={{ width: "100%" }}>
                    <View style={{ width: "100%", paddingHorizontal: 10 }}>
                      <Image
                        source={icons.detailedRoadmapImage}
                        style={{ width: "100%", height: 181, borderRadius: 20 }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: "absolute",
                          bottom: 15,
                          left: 20,
                          backgroundColor: "#233C7896",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          shadowColor: "#233C7896",
                          shadowOffset: { width: 4, height: 4 },
                          shadowOpacity: 0.9,
                          shadowRadius: 10,
                          elevation: 5,
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: "bold",
                          }}
                        >
                          {data?.title}
                        </Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 10 }}>
                      <View style={{ alignItems: "flex-end", padding: 4 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: "white",
                            fontWeight: "300",
                            marginTop: 10,
                          }}
                        >
                          {data?.time}
                        </Text>
                      </View>
                      {/* Separator */}
                      <View className="h-[0.5px] bg-white/30 mt-3" />


                      {/* Intro Summary */}
                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Church Roadmap</Text>
                      </View>
                      <TextAreaField />


                      {/* Description List */}
                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Description</Text>
                      </View>
                      <TextAreaField />


                      <View className="h-[0.5px] bg-white/30 my-6" />


                      {flag === "submit-media" ? (
                        // showCommunity ? (
                        <View className="p-3 flex gap-8 border border-solid border-white/20 rounded-[10px]">
                          <View>
                            <View style={styles.sectionMargin}>
                              <Text style={styles.whiteText}>Events for Community Engagement Event 1 </Text>
                              <TextAreaField inputClass="!bg-[#15517C]" containerClass="!bg-[#15517C]" label="List here..." />
                            </View>
                          </View>
                          <View className="flex flex-row items-center justify-center w-full gap-3">
                            <Text className="text-sm leading-[22px] text-white flex-1">
                              Community Engagement Event 1 Date:
                            </Text>
                            <View className="border border-solid border-[#FFFFFF73] rounded-[10px] max-w-[142px] w-full justify-center items-center flex-1 h-[45px]">
                              <Text className="text-sm leading-[22px] text-white">
                                20 / 11 / 24
                              </Text>
                            </View>
                          </View>
                          <View className="p-3 flex gap-8 border border-solid border-white/20 rounded-[10px] w-full">
                            <View className="flex flex-row justify-between items-center">
                              <Text className="text-semibold leading-[22px] text-white">
                                Follow up Events
                              </Text>
                              <TouchableOpacity className="rounded-[10px] border border-solid border-[#FFFFFFCC] bg-[#1E366F]  max-w-[88px] w-full flex justify-center items-center">
                                <Text className="text-medium leading-[22px] text-white">Add</Text>
                              </TouchableOpacity>
                            </View>
                            <Text className="text-semibold leading-[22px] text-[#D9D9D9]">
                              Follow up Events
                            </Text>
                            <InputField keyboardType="phone-pad" label="Choose your Follow up Event 1" boxClass="!max-h-[44px] !h-full" />
                            <View className="flex flex-row items-center justify-center w-full gap-3">
                              <Text className="text-sm leading-[22px] text-white">
                                Follow up Event Date 1 :
                              </Text>
                              <View className="border border-solid border-[#FFFFFF73] rounded-[10px] h-[33px] max-w-[137px] w-full justify-center items-center">
                                <Text className="text-sm leading-[22px] text-white">
                                  20 / 11 / 24
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Button
                            type="cancel"
                            title={"Upload Videos / Pictures"}
                            onPress={() => {
                              data?.survey ? setSurveyGuideLines(true) : null
                              if (flag === "submit-media") {
                                router.push("/assessments/pmp-survey-page")
                              } else {
                                router.push("/assessments/pmp-survey-page")
                              }
                            }
                            }
                            style={{ width: 235, margin: "auto" }}
                          />

                          <View className="h-[0.5px] bg-white/30 my-6" />

                          <Button
                            type="cancel"
                            title={"Submit"}
                            onPress={() => {
                              data?.survey ? setSurveyGuideLines(true) : null
                              if (flag === "submit-media") {
                                router.push("/assessments/pmp-survey-page")
                              } else {
                                router.push("/assessments/pmp-survey-page")
                              }
                            }
                            }
                            style={{ width: 162, margin: "auto", marginBottom: 45 }}
                          />
                        </View>
                        // ) : (
                        //   <View className="flex gap-9">
                        //     <View>
                        //       <View style={styles.sectionMargin}>
                        //         <Text style={styles.whiteText}>Adjustments you have made</Text>
                        //       </View>
                        //       <TextAreaField />
                        //     </View>
                        //     <View className="flex flex-row items-center justify-center w-full gap-3">
                        //       <Text className="text-sm leading-[22px] text-white">
                        //         Facility Review Date :
                        //       </Text>
                        //       <View className="border border-solid border-[#FFFFFF73] rounded-[10px] h-[33px] max-w-[194px] w-full justify-center items-center">
                        //         <Text className="text-sm leading-[22px] text-white">
                        //           20 / 11 / 24
                        //         </Text>
                        //       </View>
                        //     </View>
                        //     <View className="h-[0.5px] bg-white/30 my-6" />
                        //   </View>
                        // )
                      ) : (
                        <View className="flex gap-[54px] mt-12">
                          <View className="flex flex-row items-center justify-center w-full gap-3">
                            <Text className="text-sm leading-[22px] text-white">
                              Project Date:
                            </Text>
                            <View className="border border-solid border-[#FFFFFF73] rounded-[10px] h-[33px] max-w-[194px] w-full justify-center items-center">
                              <Text className="text-sm leading-[22px] text-white">
                                20 / 11 / 24
                              </Text>
                            </View>
                          </View>
                          <Text onPress={() => router.push("/(pastor-tabs)/roadmap/phase-2/media")} className="font-medium text-sm leading-[22px] text-[#D9D9D9] underline text-center">
                            View your Shared Media
                          </Text>
                        </View>
                      )}

                      {flag !== "submit-media" && (
                        <View
                          style={{
                            width: "100%",
                            alignItems: "center",
                            marginVertical: 32,
                          }}
                        >
                          <Button
                            type="cancel"
                            title={"Submit"}
                            onPress={() => {
                              data?.survey ? setSurveyGuideLines(true) : null
                              if (flag === "submit-media") {
                                router.push({ pathname: "/assessments/pmp-survey-page" })
                              } else {
                                router.push("/assessments/pmp-survey-page")
                              }
                            }
                            }
                            style={{ width: 200 }}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                ) : (
                  <></>
                )
              ) : (
                <View style={{ width: "100%" }}>
                  <View
                    style={{
                      height: 200,
                      width: "100%",
                      backgroundColor: "#00abae",
                      borderWidth: 5,
                      borderColor: "white",
                      borderRadius: 12,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: "40%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 70,
                          color: "#001b4a",
                          fontWeight: "800",
                        }}
                      >
                        PMP
                      </Text>
                      <View
                        style={{
                          width: "100%",
                          backgroundColor: "white",
                          borderWidth: 2,
                          borderColor: "white",
                        }}
                      ></View>
                      <Text
                        style={{
                          fontSize: 15,
                          color: "white",
                          fontWeight: "700",
                          textAlign: "center",
                        }}
                      >
                        PASTORAL MINISTRY PROFILE
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "white",
                      fontWeight: "500",
                      textAlign: "center",
                      paddingVertical: 20,
                    }}
                  >
                    Assessments Guidelines
                  </Text>
                  {/* <ListCard list={List} /> */}
                  <View
                    style={{
                      width: "100%",
                      alignItems: "center",
                      marginVertical: 20,
                    }}
                  >
                    <Button
                      type="cancel"
                      title={"Start Now"}
                      onPress={() =>
                        // router.push({
                        //   pathname: "/(pastor-tabs)/roadmap/survey",
                        //   params: { data: JSON.stringify(data) }
                        // })

                        console.log("pressed")
                      }
                      style={{ width: 200 }}
                    />
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Modals */}
        <OptionsModal
          isMenuVisible={isModalVisible}
          closeMenu={() => setIsModalVisible(false)}
          onPressForFirstOption={() => {
            setIsRoadmapModalVisible(true)
            setIsModalVisible(false)
          }}
          onPressForSecondOption={() => console.log("pressed 2 ")}
          firstOptionLabel={"Expected outcome - 4 Months"}
          secondOptionLabel={"Expected Outcome - 6 Months"}
          thirdOptionLabel={"Expected Outcome - 9 Months"}
          fourthOptionLabel={"Expected Outcome - End of year"}
        />
        <RoadMapOutcomeModal
          isMenuVisible={isRoadmapModalVisible}
          closeMenu={() => setIsRoadmapModalVisible(false)}
          onPressForFirstOption={() => console.log("pressed 1 ")}
          onPressForSecondOption={() => console.log("pressed 2 ")}
          firstOptionLabel={"Expected outcome - 4 Months"}
          secondOptionLabel={"Expected Outcome - 6 Months"}
          thirdOptionLabel={"Expected Outcome - 9 Months"}
          fourthOptionLabel={"Expected Outcome - End of year"}
        />
      </LinearGradient>
    </>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 18,
  },
  sectionMargin: {
    marginVertical: 8,
  },
  whiteText: {
    color: "#D9D9D9",
    fontSize: 14,
    paddingVertical: 4,
  },
  summaryContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#138BB6",
  },
})

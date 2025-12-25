import { Button } from "@/components/atom/buttons"
// import { CheckBox } from "@/components/atom/checkBox"
import { OptionsModal } from "@/components/atom/modals"
import { RoadMapOutcomeModal } from "@/components/atom/RoadMapOutcomeModal"
import { Tab } from "@/components/atom/tab"
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function DetailedRoadMap() {
  const { data: dataParam } = useLocalSearchParams()
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

  const handleTabPress = (tabName: string) => {
    if (tabName === "Over View") {
      setTabs(tabName)
    } else if (tabName === "Comments") {
      router.push({
        pathname: "/(mentor)/roadmap/comments" as any,
        params: { data: JSON.stringify(data) },
      })
    } else if (tabName === "Queries") {
      router.push({
        pathname: "/(mentor)/roadmap/queries" as any,
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
            <PastorNavigationHeader wrapperClass="mt-5" showNameTag={true} />

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
                    <View style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      width: "100%",
                      paddingHorizontal: 10,
                      position: "relative",
                      overflow: "hidden",  // Clip children to bounds
                      borderRadius: 20      // Match the image's border radius
                    }}>
                      <Image
                        source={icons.detailedRoadmapImage}
                        style={{ width: "100%", height: 181, borderRadius: 20 }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          position: "absolute",
                          bottom: 15,
                          left: 16,
                          backgroundColor: "#233C7896",
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          shadowColor: "#233C7896",
                          shadowOffset: { width: 4, height: 4 },
                          shadowOpacity: 0.9,
                          shadowRadius: 10,
                          elevation: 5,
                          borderRadius: 5,
                          width: "90%"
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

                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Roadmap</Text>
                      </View>

                      {/* Intro Summary */}
                      <View style={styles.summaryContainer}>
                        <Text style={styles.whiteText}>
                          {data?.title == "Jump-start"
                            ? "Attend a Jump-start Session in your area"
                            : data?.title}
                        </Text>
                      </View>
                      <View style={styles.sectionMargin}>
                        <Text style={styles.whiteText}>Description</Text>
                      </View>

                      {/* Description List */}
                      <View
                        style={[
                          styles.summaryContainer,
                          {
                            flexDirection: "column",
                          },
                        ]}
                      >
                        <Text style={styles.whiteText}>
                          1. Christ Method Alone (Why & How)
                        </Text>
                        <Text style={styles.whiteText}>2. Self—Leadership</Text>
                        <Text style={styles.whiteText}>
                          3.Dealing with Resistance
                        </Text>
                        <Text style={styles.whiteText}>
                          4. Empower Others-Spiritual Renewal
                        </Text>
                        <Text style={styles.whiteText}>
                          5. Community Engagement - Need Assessments
                        </Text>
                        <Text style={styles.whiteText}>
                          6. Cycle of Evangelism & Discipleship
                        </Text>
                      </View>

                      <View className="h-[0.5px] bg-white/30 my-6" />

                      {data?.signature ? (
                        <>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={[
                                styles.whiteText,
                                {
                                  textDecorationLine: "underline",
                                  fontWeight: "200",
                                },
                              ]}
                            >
                              View 12 MONTHS MENTORING TIMELINE MONTHS
                            </Text>
                          </View>
                          <View className="h-[0.5px] bg-white/30 mt-3" />
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            {/* <View>
                              <CheckBox style={{ padding: 10 }} />
                            </View> */}
                            <View style={{ width: "80%" }}>
                              <Text
                                style={[
                                  styles.whiteText,
                                  {
                                    fontWeight: "200",
                                  },
                                ]}
                              >
                                I agree to participate in the 12-month
                                revitalization mentoring and church growth
                                roadmap provided by The Center for Community
                                Change
                              </Text>
                            </View>
                          </View>
                        </>
                      ) : (
                        <>
                          <View style={styles.sectionMargin}>
                            <Text style={styles.whiteText}>View 12 MONTHS MENTORING TIMELINE MONTHS</Text>
                          </View>

                          {/* Notes Input */}
                          <View className="h-32 p-2 bg-transparent border rounded-lg border-white/40">
                            <TextInput
                              placeholder="Write Your Notes here..."
                              placeholderTextColor="#D9D9D9"
                              multiline={true}
                              style={{ color: "white", width: "100%" }}
                            />
                          </View>
                        </>
                      )}

                      {data?.sessionDate && (
                        <>
                          <View
                            style={{
                              alignItems: "center",
                              paddingVertical: 2,
                              marginVertical: 18,
                              flexDirection: "row",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                color: "white",
                                fontWeight: "500",
                              }}
                            >
                              Session Date {" "}
                            </Text>
                            <View
                              style={{
                                alignItems: "center",
                                borderWidth: 1,
                                borderColor: "#47729b",
                                paddingVertical: 2,
                                marginVertical: 4,
                                width: 110,
                                borderRadius: 8,
                                marginLeft: 10,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: "white",
                                  fontWeight: "300",
                                }}
                              >
                                {data?.sessionDate}
                              </Text>
                            </View>
                          </View>
                          <View className="h-[0.5px] bg-white/30 my-6" />
                        </>
                      )}

                      <View
                        style={{
                          width: "100%",
                          alignItems: "center",
                          marginVertical: 20,
                        }}
                      >
                        <Button
                          type="cancel"
                          title={
                            data?.signature
                              ? "Signature Required here"
                              : data?.survey
                                ? "Take PMP Survey"
                                : `${data?.title + " Completed"}`
                          }
                          onPress={() => {
                            data?.survey ? setSurveyGuideLines(true) : null
                            router.push("/assessments/pmp-survey-page")
                          }
                          }
                          style={{ width: 200 }}
                        />
                      </View>
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

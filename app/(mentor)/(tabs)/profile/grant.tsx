import { Button } from "@/components/atom/buttons";
import { InputCard } from "@/components/atom/cards";
import CheckBox from "@/components/atom/checkBox";
import { HeaderTitle } from "@/components/atom/header";
import { ResponseModal } from "@/components/atom/modals";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { customColors } from "@/constants/config/customColors";
import { NavigationProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useNavigation } from "expo-router";
import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ProfileData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  profileSummary: string;
  church1: {
    name: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  church2: {
    name: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  label: string;
  yearsInMinistry: string;
  conference: string;
  communityServiceProjects: string;
  interests: string;
  comments: string;
}

interface RootStackParamList {
  scheduleMeeting: {
    data: ProfileData;
    navigatedFrom: string;
  };
  // add other screens here if needed
}

export default function Grant() {
  const availableTabs = [
    { tab: "All" },
    { tab: "Completed" },
    { tab: "Remaining" },
  ];

  const [tabs, setTabs] = React.useState("All");
  const [formAnswers, setFormAnswers] = React.useState<Record<string, string>>({});
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<ProfileData>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    profileSummary: "",
    church1: {
      name: "",
      phone: "",
      website: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    church2: null,
    label: "",
    yearsInMinistry: "",
    conference: "",
    communityServiceProjects: "",
    interests: "",
    comments: "",
  });

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [selectedReportingOption, setSelectedReportingOption] = React.useState<string>("");
  const [responseModal, setResponseModal] = React.useState({
    visible: false,
    message: "",
    buttonText: "",
  });
  const [isVisible, setIsVisible] = React.useState(false);

  const handleClearForm = () => {
    setFormAnswers({});
    setSelectedReportingOption("");
    setStep(1);
  };


  const dummyAppointments = [
    {
      label: "Self Revitalization Phase",
      description:
        "Take a deeper look into your ministry to bring conflict resolution and theory of change.",
      time: "Completion Time Months 1 - 2",
      type: "note",
      read: false,
      subPhase: true,
      status: "Due",
      taskStatus: {
        notStarted: false,
        started: true,
        inProgress: 6,
        toComplete: 8,
        completed: false,
      },
    },
    {
      label: "Church Empowerment Phase",
      description:
        "Create community to empower your church and make a long-term impact on coordinated community service programs.",
      time: "Completion Time Months 3 - 9",
      type: "assignment",
      read: true,
      status: "In-progress",
      taskStatus: {
        notStarted: false,
        started: true,
        inProgress: 12,
        toComplete: 18,
        completed: false,
      },
    },
  ];

  const scheduleMeeting = () => {
    navigation.navigate("scheduleMeeting", {
      data: data,
      navigatedFrom: "surveyScreen",
    });
  };

  const onsubmitPress = () => {
    setResponseModal((prev) => ({
      ...prev,
      visible: true,
      buttonText: "",
      message: "Survey Submitted Successfully",
    }));
    setTimeout(() => {
      setResponseModal((prev) => ({
        ...prev,
        visible: true,
        buttonText: "Schedule Meeting",
        message:
          "On completion of the PMP and CMA assessment tools please schedule a meeting with your mentor.",
      }));
    }, 2000);
  };

  const outComeList = [
    {
      outcome:
        "If approved, you will sign a grant agreement based on the submitted Action Steps—the CCC may modify, suspend, or stop payment of grant funds if the terms of the agreement are changed or not followed",
    },
    {
      outcome:
        "Upon completion of the project,the grantee must submit a grant report regarding the use of funds consisting ofa narrative report and financial accounting—the report ought to include copies of relevant receipts and records of expenditures.",
    },
    {
      outcome:
        "Any grant funds that have not been used for, or committed to, the project upon expiration or termination of the grant agreement must be returned to the CCC.",
    },
  ];
  const outComeList2 = [
    {
      outcome:
        "I have reviewed the application and filled out each the section to the best of my knowledge",
    },
    {
      outcome:
        "I have filled out the application, and I would like to discuss it with a center's director",
    },
    {
      outcome: "Other: __________________",
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
          <PastorNavigationHeader showDrawer={false} showBackButton={true} wrapperClass="mt-5" />
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View
              style={{
                width: "100%",
                alignItems: "center",
                marginTop: 24,
                flex: 1,
              }}
            >
              <ScrollView
                contentContainerStyle={{
                  paddingBottom: 80,
                  paddingHorizontal: 10,
                  flexGrow: 1,
                }}
                keyboardShouldPersistTaps="handled"
              >
              <View
                style={{
                  width: "96%",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <HeaderTitle
                  title="The Center for Community Change Micro-Grant Application"
                  textStyle={{ fontWeight: "700", color: "#ffffff", fontFamily: "AlbertBold" }}
                ></HeaderTitle>

                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      lineHeight: 22,
                      fontWeight: "600",
                      textAlign: "center",
                      marginVertical: 12,
                    }}
                  >
                    Please keep in mind that the church applying for a grant
                    must become a partner with the CCC by signing a MOU.
                  </Text>
                </View>
                {step <= 2 && (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "white",
                      borderRadius: 10,
                      backgroundColor: "#14517d",
                      marginHorizontal: 16,
                      // marginTop: 16,
                      paddingVertical: 10,
                      width: "100%",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        gap: 10,
                        justifyContent: "flex-start",
                        paddingVertical: 10,
                        paddingLeft: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 17,
                          lineHeight: 22,
                          fontWeight: "600",
                        }}
                      >
                        {step}.{" "}
                        {step == 1 ? "Cover Sheet" : "Reporting Procedures"}
                      </Text>
                      {step == 1 && (
                        <Text
                          style={{
                            color: "white",
                            fontSize: 16,
                            lineHeight: 22,
                            fontWeight: "600",
                            paddingLeft: 10,
                          }}
                        >
                          Please answer the questions succinctly following
                          prompts
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {step == 1 && (
                  <View
                    style={{
                      width: "100%",
                      alignItems: "flex-end",
                      justifyContent: "flex-end",
                      paddingVertical: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "yellow",
                        fontSize: 16,
                        lineHeight: 22,
                        fontWeight: "500",
                        paddingLeft: 10,
                      }}
                    >
                      * Indicates required questions
                    </Text>
                  </View>
                )}
                {step == 1 ? (
                  <>
                    <InputCard
                      title={"Name of the church:"}
                      setValue={(val) => setFormAnswers(prev => ({ ...prev, churchName: val }))}
                      description=""
                      value={formAnswers.churchName || ""}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={"Name of the project/program: * "}
                      setValue={(val) => setFormAnswers(prev => ({ ...prev, projectName: val }))}
                      description="[provide a name for the project /program you are seeking for the grant for]"
                      value={formAnswers.projectName || ""}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "Who does the project/program serve and why is it important?"
                      }
                      setValue={(val) => setFormAnswers(prev => ({ ...prev, targetAudience: val }))}
                      description="[Describe the target audience or beneficiaries of your project/program and explain why it is important for them]"
                      value={formAnswers.targetAudience || ""}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={"Amount Requested"}
                      setValue={(val) => setFormAnswers(prev => ({ ...prev, amountRequested: val }))}
                      description="[Specify the amount of grant funds you are requesting]"
                      value={formAnswers.amountRequested || ""}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "Project amount of denominational support (Local Conference, Union, NAD, GC, etc.):"
                      }
                      setValue={(val) => setFormAnswers(prev => ({ ...prev, denominationalSupport: val }))}
                      description="[Provide the projected (if any) cost-sharing contribution from the larger body of the SDA church]"
                      value={formAnswers.denominationalSupport || ""}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "What action steps will you take to achieve your goals?"
                      }
                      setValue={(val) => setFormAnswers(prev => ({ ...prev, actionSteps: val }))}
                      description="[Outline the specific activities or steps you will undertake to achieve the stated goals]"
                      value={formAnswers.actionSteps || ""}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={"What resources do you already have"}
                      setValue={(val) => setFormAnswers(prev => ({ ...prev, existingResources: val }))}
                      description="[Describe the existing resources or assets that your church or project team possesses]"
                      value={formAnswers.existingResources || ""}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "Who will be leading and overseeing the project/program, and what are their qualifications? "
                      }
                      setValue={(val) => setFormAnswers(prev => ({ ...prev, projectLeadership: val }))}
                      description="[Provide information about the individuals who will be responsible for leading and managing the project/program, including their qualifications and relevant experience]"
                      value={formAnswers.projectLeadership || ""}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "What are the measurable markers of your success? "
                      }
                      setValue={(val) => setFormAnswers(prev => ({ ...prev, successMarkers: val }))}
                      description="[Define specific indicators or metrics that will be used to measure the success or progress of your project/program]"
                      value={formAnswers.successMarkers || ""}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "Please upload here any supporting documents or media (photos, videos, publications, etc.)  "
                      }
                      setValue={() => { }}
                      description="[Upload up to 10 supported files. Max 100 MB per file.]"
                      value={""}
                      required={true}
                      fileUpload={true}
                      answer={false}
                    ></InputCard>
                  </>
                ) : step == 2 ? (
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "column",
                      gap: 20,
                      justifyContent: "center",
                      paddingVertical: 20,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        // paddingHorizontal:10,
                        flexDirection: "column",
                        // backgroundColor: "#161b5f", // Same as parent's background
                        borderRadius: 8,
                        // paddingHorizontal: 20,
                        paddingVertical: 8,
                        // gap: 20,
                        borderWidth: 1,
                        borderColor: "white",
                      }}
                    >
                      {outComeList.map((e, i) => (
                        <View
                          key={i}
                          style={{
                            width: "100%",
                            flexDirection: "row",
                            borderRadius: 8,
                            paddingHorizontal: 20,
                            paddingVertical: 8,
                            gap: 20,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 15,
                              fontWeight: "100",
                              fontFamily: "AlbertSans-Medium",
                              color: customColors.customWhiteEighty,
                              textAlign: "center",
                            }}
                          >
                            ⭐
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "500",
                              lineHeight: 28,
                              fontFamily: "AlbertSans-Medium",
                              color: customColors.customWhite,
                              paddingRight: 30,
                              // textAlign: "center",
                            }}
                          >
                            {e.outcome}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <View
                      style={{
                        width: "100%",
                        // paddingHorizontal:10,
                        flexDirection: "column",
                        // backgroundColor: "#161b5f", // Same as parent's background
                        borderRadius: 8,
                        // paddingHorizontal: 20,
                        paddingVertical: 8,
                        // gap: 20,
                        borderWidth: 1,
                        borderColor: "white",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "500",
                          lineHeight: 28,
                          fontFamily: "AlbertSans-Medium",
                          color: customColors.customWhite,
                          paddingLeft: 20,
                          // textAlign: "center",
                        }}
                      >
                        Please review the grant application thoroughly before
                        submission and ensure that all required sections are
                        completed accurately
                      </Text>
                      {outComeList2.map((e, i) => (
                        <View
                          key={i}
                          style={{
                            width: "100%",
                            flexDirection: "row",
                            borderRadius: 8,
                            paddingHorizontal: 20,
                            paddingVertical: 8,
                            gap: 20,
                            alignItems: "center",
                          }}
                        >
                          <CheckBox
                            type={"square"}
                            value={selectedReportingOption === e.outcome}
                            setValue={() => setSelectedReportingOption(e.outcome)}
                          ></CheckBox>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "500",
                              lineHeight: 22,
                              fontFamily: "AlbertSans-Medium",
                              color: customColors.customWhite,
                              paddingRight: 30,
                              // textAlign: "center",
                            }}
                          >
                            {e.outcome}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "column",
                      gap: 20,
                      justifyContent: "center",
                      paddingVertical: 20,
                    }}
                  >
                    <View
                      style={{
                        width: "100%",
                        // paddingHorizontal:10,
                        flexDirection: "column",
                        // backgroundColor: "#161b5f", // Same as parent's background
                        borderRadius: 8,
                        // paddingHorizontal: 20,
                        paddingVertical: 8,
                        // gap: 20,
                        borderWidth: 1,
                        borderColor: "white",
                      }}
                    >
                      <View
                        style={{
                          width: "100%",
                          flexDirection: "column",
                          borderRadius: 8,
                          justifyContent: "center",
                          paddingHorizontal: 20,
                          paddingVertical: 8,
                          gap: 20,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "500",
                            lineHeight: 22,
                            fontFamily: "AlbertSans-Medium",
                            color: customColors.customWhiteEighty,
                            // paddingRight: 30,
                            textAlign: "center",
                          }}
                        >
                          You have successfully submitted the application for
                          the grant. Please check the status of your application
                          for updates.
                        </Text>
                        <View
                          style={{
                            width: "100%",
                            flexDirection: "row",
                            borderRadius: 8,
                            justifyContent: "center",
                            paddingHorizontal: 20,
                            paddingVertical: 8,
                            gap: 20,
                          }}
                        >
                          <Button
                            title={"Check Status"}
                            type={"cancel"}
                            style={{ width: "40%" }}
                            onPress={() => setIsVisible(true)}
                          ></Button>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                {step <= 2 && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <Button
                      title={"Clear Form"}
                      type={"cancel"}
                      onPress={handleClearForm}
                      style={{ width: "30%" }}
                    ></Button>
                    <Button
                      onPress={() => step === 2 ? onsubmitPress() : setStep(step + 1)}
                      title={step == 2 ? "Submit" : "Next"}
                      type={"submit"}
                      style={{ width: "30%" }}
                    ></Button>
                  </View>
                )}
              </View>
            </ScrollView>
            <ResponseModal
              buttonText={responseModal.buttonText}
              buttonPress={scheduleMeeting}
              isModalVisible={responseModal.visible}
              responseText={responseModal.message}
              closeMenu={() =>
                setResponseModal((prev) => ({
                  ...prev,
                  visible: false,
                  message: "",
                }))
              }
            ></ResponseModal>
          </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
        <Modal
          visible={isVisible}
          transparent={true}
          onRequestClose={() => setIsVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-lg p-4 gap-2  max-w-[229px]">
              <Text className="font-semibold text-sm leading-[22px] text-[#176192] text-center">
                Application has Submitted Successfully.
              </Text>
              <Text className="font-semibold text-sm leading-[22px] text-[#1E366F] text-center">
                Check your status for further info.
              </Text>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#221c70", // Change color as needed
  },
  line: {
    flex: 1,
    height: 1,
    // Change color as needed
    //   marginHorizontal: 5,
  },
  scrollContainer: {
    flex: 1,
    justifyContent: "space-between",
    // alignItems: "center",
  },
  text: {
    fontSize: 20,

    fontWeight: "bold",
  },
  separator: {
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)", // customWhiteTwenty
    // marginHorizontal: 16,
    marginVertical: 18,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 72, // 4.5rem = 72px
  },
  image: {
    borderRadius: 8,
    margin: 8,
  },
  greetingText: {
    fontFamily: "AlbertSans-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  roleText: {
    fontFamily: "AlbertSans-Medium",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 72,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    marginTop: 8,
    marginHorizontal: 72,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "AlbertSans-Regular",
  },
  progressBarBackground: {
    flex: 1,
    backgroundColor: "#182c5b",
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  progressBarFill: {
    backgroundColor: "#FFFFFF",
    height: 8,
    borderRadius: 4,
    width: "70%",
  },
  progressPercent: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "right",
    fontFamily: "AlbertSans-Regular",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 12,
    padding: 6,
    paddingVertical: 10,
    backgroundColor: "#004B87",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  actionText: {
    fontFamily: "AlbertSans-Regular",
    color: "#FFFFFF",
  },
  icon: {
    width: 18,
    height: 18,
    marginHorizontal: 16,
  },
  sectionMargin: {
    marginVertical: 8,
  },
  whiteText: {
    fontFamily: "AlbertRegular",
    color: "white",
    fontSize: 14,
  },
  summaryContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    marginTop: 8,
  },
  detailedContainer: {
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    marginTop: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  infoBox: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  interestsContainer: {
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    marginVertical: 8,
  },
  commentsContainer: {
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    marginVertical: 8,
  },
  appointmentsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    position: "relative",

    width: "100%",
    borderWidth: 1,
    borderColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  rowBetween: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  upcomingText: {
    color: "#FFFFFF", // customWhite
    fontSize: 14,
    fontFamily: "AlbertSans-Bold",
    textAlign: "center",
  },
  seeAllText: {
    color: "#FFFFFF", // customWhite
    fontSize: 14,
    fontFamily: "AlbertSans-Medium",
    textAlign: "center",
  },
});

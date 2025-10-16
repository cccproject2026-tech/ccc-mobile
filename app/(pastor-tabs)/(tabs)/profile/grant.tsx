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
import { useNavigation } from "expo-router";
import React from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { top, bottom } = useSafeAreaInsets();

  const [inputValue, setInputValue] = React.useState<string>("");
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

  const [responseModal, setResponseModal] = React.useState({
    visible: false,
    message: "",
    buttonText: "",
  });
  const [isVisible, setIsVisible] = React.useState(false);




  const scheduleMeeting = () => {
    navigation.navigate("scheduleMeeting", {
      data: data,
      navigatedFrom: "surveyScreen",
    });
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
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, paddingTop: top, }}>
          <PastorNavigationHeader showDrawer={false} showBackButton={true} wrapperClass="mt-5" />
          <View
            style={{
              width: "100%",
              alignItems: "center",
              marginTop: 16,
              flex: 1,
            }}
          >
            <ScrollView
              contentContainerStyle={{
                paddingBottom: Platform.OS === 'android' ? bottom : bottom * 1.5,
                paddingHorizontal: 16,
                flexGrow: 1,
              }}
              style={{ width: "100%" }}
            >
              <View
                style={{
                  width: "100%",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "stretch",
                }}
              >
                <HeaderTitle
                  title="The Center for Community Change Micro-Grant Application"
                  textStyle={{
                    fontWeight: "700",
                    color: "#ffffff",
                    fontFamily: "AlbertBold",
                    fontSize: 18,
                    textAlign: "center",
                  }}
                />

                <View
                  style={{
                    width: "100%",
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: "500",
                      textAlign: "left",
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
                      marginVertical: 16,
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      width: "100%",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "column",
                        gap: 8,
                        justifyContent: "flex-start",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          lineHeight: 20,
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
                            fontSize: 14,
                            lineHeight: 18,
                            fontWeight: "500",
                            marginTop: 4,
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
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "yellow",
                        fontSize: 14,
                        lineHeight: 18,
                        fontWeight: "500",
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
                      setValue={setInputValue}
                      description=""
                      value={inputValue}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={"Name of the project/program: * "}
                      setValue={setInputValue}
                      description="[provide a name for the project /program you are seeking for the grant for]"
                      value={inputValue}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "Who does the project/program serve and why is it important?"
                      }
                      setValue={setInputValue}
                      description="[Describe the target audience or beneficiaries of your project/program and explain why it is important for them]"
                      value={inputValue}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={"Amount Requested"}
                      setValue={setInputValue}
                      description="[Specify the amount of grant funds you are requesting]"
                      value={inputValue}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "Project amount of denominational support (Local Conference, Union, NAD, GC, etc.):"
                      }
                      setValue={setInputValue}
                      description="[Provide the projected (if any) cost-sharing contribution from the larger body of the SDA church]"
                      value={inputValue}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "What action steps will you take to achieve your goals?"
                      }
                      setValue={setInputValue}
                      description="[Outline the specific activities or steps you will undertake to achieve the stated goals]"
                      value={inputValue}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={"What resources do you already have"}
                      setValue={setInputValue}
                      description="[Describe the existing resources or assets that your church or project team possesses]"
                      value={inputValue}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "Who will be leading and overseeing the project/program, and what are their qualifications? "
                      }
                      setValue={setInputValue}
                      description="[Provide information about the individuals who will be responsible for leading and managing the project/program, including their qualifications and relevant experience]"
                      value={inputValue}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "What are the measurable markers of your success? "
                      }
                      setValue={setInputValue}
                      description="[Define specific indicators or metrics that will be used to measure the success or progress of your project/program]"
                      value={inputValue}
                      required={true}
                    ></InputCard>
                    <InputCard
                      title={
                        "Please upload here any supporting documents or media (photos, videos, publications, etc.)  "
                      }
                      setValue={setInputValue}
                      description="[Upload up to 10 supported files. Max 100 MB per file.]"
                      value={inputValue}
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
                            value={false}
                            setValue={function (value: boolean): void {
                              throw new Error("Function not implemented.");
                            }}
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
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      marginTop: 24,
                      paddingHorizontal: 16,
                    }}
                  >
                    <Button
                      title={"Clear Form"}
                      type={"cancel"}
                      onPress={() => setStep(1)}
                      style={{ flex: 1 }}
                    ></Button>
                    <Button
                      onPress={() => setStep(step + 1)}
                      title={step == 2 ? "Submit" : "Next"}
                      type={"submit"}
                      style={{ flex: 1 }}
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
        </View>
        <Modal
          visible={isVisible}
          transparent={true}
          onRequestClose={() => setIsVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 16,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
            onPress={() => setIsVisible(false)}
          >
            <Pressable
              style={{
                width: "100%",
                maxWidth: 400,
                gap: 12,
                padding: 24,
                backgroundColor: "white",
                borderRadius: 12,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 16,
                  lineHeight: 24,
                  color: "#176192",
                  textAlign: "center",
                }}
              >
                Application has Submitted Successfully.
              </Text>
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 14,
                  lineHeight: 20,
                  color: "#1E366F",
                  textAlign: "center",
                }}
              >
                Check your status for further info.
              </Text>
            </Pressable>
          </Pressable>
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
    marginHorizontal: 16, // Reduced from 72px to 16px
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
    marginHorizontal: 16, // Reduced from 72px
  },
  progressContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    marginTop: 8,
    marginHorizontal: 16, // Reduced from 72px
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

import { Button } from "@/components/atom/buttons";
import { InputCard } from "@/components/atom/cards";
import { HeaderTitle } from "@/components/atom/header";
import { ResponseModal } from "@/components/atom/modals";
import SimpleSuccessModal from "@/components/atom/SimpleSuccessModal";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { customColors } from "@/constants/config/customColors";
import { useCheckApplication } from "@/hooks/grant/useCheckApplication";
import { useGrant } from "@/hooks/grant/useGrant";
import { useAuthStore } from "@/stores";
import { getFontSize, getSpacing, isSmallDevice } from "@/utils/responsive";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Grant() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    form,
    isLoading,
    isSubmitting,
    error,
    fetchGrantForm,
    submitCompleteApplication,
    resetState,
  } = useGrant();

  const [step, setStep] = React.useState(1);
  const [formAnswers, setFormAnswers] = React.useState<Record<string, string>>({});
  const [selectedReportingOption, setSelectedReportingOption] = React.useState<string>("");
  const [responseModal, setResponseModal] = React.useState({
    visible: false,
    message: "",
    buttonText: "",
  });
  const [isVisible, setIsVisible] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const { data: checkApplicationData, isLoading: isCheckingApplication } =
    useCheckApplication(user?.id);

  // Fetch form
  useEffect(() => {
    fetchGrantForm();
  }, []);

  // If already applied → LOCK to Step 3 forever
  useEffect(() => {
    if (checkApplicationData?.data?.applied) {
      setStep(3);
    }
  }, [checkApplicationData]);

  const reportingProcedureText = [
    "If approved, you will sign a grant agreement based on the submitted Action Steps—the CCC may modify, suspend, or stop payment of grant funds if the terms of the agreement are changed or not followed",
    "Upon completion of the project, the grantee must submit a grant report regarding the use of funds consisting of a narrative report and financial accounting—the report ought to include copies of relevant receipts and records of expenditures.",
    "Any grant funds that have not been used for, or committed to, the project upon expiration or termination of the grant agreement must be returned to the CCC.",
  ];

  const reportingOptions = [
    "I have reviewed the application and filled out each the section to the best of my knowledge",
    "I have filled out the application, and I would like to discuss it with a center's director",
    "Other: __________________",
  ];

  const handleInputChange = (fieldLabel: string, value: string) => {
    setFormAnswers((prev) => ({ ...prev, [fieldLabel]: value }));

    if (validationErrors[fieldLabel]) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldLabel];
        return updated;
      });
    }
  };

  const validateCurrentStep = () => {
    if (step === 1) {
      const errors: Record<string, string> = {};

      form?.data?.fields.forEach((field) => {
        if (field.required) {
          const value = formAnswers[field.label];
          if (!value || value.trim() === "") {
            errors[field.label] = `${field.label} is required`;
          }
        }
      });

      setValidationErrors(errors);

      if (Object.keys(errors).length) {
        Alert.alert("Validation Error", Object.values(errors)[0]);
        return false;
      }
      return true;
    }

    if (step === 2 && !selectedReportingOption) {
      Alert.alert("Validation Error", "Please select a reporting procedure option");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    const finalAnswers = {
      ...formAnswers,
      reportingProcedure: selectedReportingOption,
    };

    try {
      await submitCompleteApplication(user?.id as string, finalAnswers);

      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        setStep(3);
      }, 2000);
    } catch (err: any) {
      setResponseModal({
        visible: true,
        message: err.message || "Failed to submit application",
        buttonText: "OK",
      });
    }
  };

  const handleClearForm = () => {
    Alert.alert("Clear Form", "Are you sure you want to clear all form data?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setFormAnswers({});
          setSelectedReportingOption("");
          setValidationErrors({});
          setStep(1);
          resetState();
        },
      },
    ]);
  };

  const renderFormField = (field: any) => {
    const value = formAnswers[field.label] || "";
    const hasError = !!validationErrors[field.label];

    return (
      <View key={field._id}>
        <InputCard
          title={field.label + (field.required ? "" : "")}
          value={value}
          setValue={(v: string) => handleInputChange(field.label, v)}
          description={field.type === "file" ? "[Upload up to 10 files. Max 100MB.]" : ""}
          required={field.required}
          multiline={field.type === "textarea"}
          fileUpload={field.type === "file"}
          answer={field.type !== "file"}
        />
        {hasError && (
          <Text
            style={{
              color: "#FF6B6B",
              fontSize: getFontSize(12),
              marginTop: getSpacing(-12),
              marginBottom: getSpacing(8),
              marginLeft: getSpacing(4),
            }}
          >
            {validationErrors[field.label]}
          </Text>
        )}
      </View>
    );
  };

  // Loading state
  if (isLoading || isCheckingApplication) {
    return (
      <LinearGradient colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 16, fontSize: getFontSize(16) }}>
            Loading form...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // ❗ BACK BUTTON LOGIC FIXED
  const onBackPress = () => {
    if (checkApplicationData?.data?.applied) {
      // Already applied → DO NOT GO TO FORM
      router.back();
      return;
    }

    if (step > 1) setStep(step - 1);
    else router.back();
  };

  // Error state
  if (error && !form) {
    return (
      <LinearGradient colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32 }}>
          <Text style={{ color: "#fff", fontSize: getFontSize(18), textAlign: "center", marginBottom: 16 }}>
            Failed to load form
          </Text>
          <Text style={{ color: "#fff", fontSize: getFontSize(14), textAlign: "center", marginBottom: 24 }}>
            {error}
          </Text>
          <Button title="Retry" type="submit" onPress={fetchGrantForm} style={{ width: "50%" }} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <LinearGradient colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]} style={{ flex: 1 }}>
        <TopBar
          showDrawer={false}
          showBackButton={true}
          showBackButtonText={true}
          onPressBack={onBackPress}
          showNotifications={true}
          onProfilePress={() => { }}
          role="pastor"
        />

        <View style={{ flex: 1 }}>
          <View style={{ width: "100%", alignItems: "center", marginTop: 16, flex: 1 }}>
            <ScrollView
              contentContainerStyle={{
                paddingBottom: Platform.OS === "android" ? bottom : bottom * 1.5,
                paddingHorizontal: getSpacing(16),
                flexGrow: 1,
              }}
              style={{ width: "100%" }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ width: "100%", flexDirection: "column" }}>

                {/* TITLE */}
                <HeaderTitle
                  title={form?.data?.title || "Micro-Grant Application"}
                  textStyle={{
                    fontWeight: "700",
                    color: "#ffffff",
                    fontFamily: "AlbertBold",
                    fontSize: getFontSize(isSmallDevice ? 16 : 18),
                    textAlign: "center",
                  }}
                />

                <View style={{ width: "100%", paddingVertical: getSpacing(8) }}>
                  <Text
                    style={{
                      color: "white",
                      fontSize: getFontSize(14),
                      lineHeight: getFontSize(20),
                      fontWeight: "500",
                      textAlign: "center",
                    }}
                  >
                    {form?.data?.description ||
                      "Please keep in mind that the church applying for a grant must become a partner with the CCC by signing a MOU."}
                  </Text>
                </View>

                {/* === STEP 3: SHOW ONLY STATUS (if already applied) === */}
                {STEP_3_VIEW()}

                {/* === IF NOT APPLIED → SHOW FORM === */}
                {!checkApplicationData?.data?.applied && (
                  <>
                    {step === 1 && (
                      <>
                        <View
                          style={{
                            borderWidth: 1,
                            borderColor: "white",
                            borderRadius: getSpacing(10),
                            backgroundColor: "#14517d",
                            marginVertical: getSpacing(16),
                            paddingVertical: getSpacing(16),
                            paddingHorizontal: getSpacing(16),
                            width: "100%",
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontSize: getFontSize(16),
                              fontWeight: "600",
                            }}
                          >
                            1. Cover Sheet
                          </Text>
                          <Text
                            style={{
                              color: "white",
                              fontSize: getFontSize(14),
                              marginTop: getSpacing(4),
                            }}
                          >
                            Please answer the questions succinctly following prompts
                          </Text>
                        </View>

                        <View style={{ width: "100%", alignItems: "flex-end", paddingVertical: getSpacing(8) }}>
                          <Text
                            style={{
                              color: "yellow",
                              fontSize: getFontSize(14),
                              fontWeight: "500",
                            }}
                          >
                            * Indicates required questions
                          </Text>
                        </View>

                        {form?.data?.fields?.map((field) => renderFormField(field))}
                      </>
                    )}

                    {step === 2 && (
                      <View style={{ width: "100%", paddingVertical: 20, gap: 20 }}>
                        <View
                          style={{
                            borderWidth: 1,
                            borderColor: "white",
                            borderRadius: 8,
                            paddingVertical: 8,
                          }}
                        >
                          {reportingProcedureText.map((text, i) => (
                            <View
                              key={i}
                              style={{
                                flexDirection: "row",
                                paddingVertical: 8,
                                paddingHorizontal: 20,
                                gap: 20,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 15,
                                  color: customColors.customWhiteEighty,
                                }}
                              >
                                ⭐
                              </Text>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "500",
                                  color: customColors.customWhite,
                                  paddingRight: 30,
                                }}
                              >
                                {text}
                              </Text>
                            </View>
                          ))}
                        </View>

                        <View
                          style={{
                            borderWidth: 1,
                            borderColor: "white",
                            borderRadius: 8,
                            paddingVertical: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "500",
                              color: customColors.customWhite,
                              paddingLeft: 20,
                            }}
                          >
                            Please review the grant application thoroughly before
                            submission and ensure that all required sections are
                            completed accurately
                          </Text>

                          {reportingOptions.map((option, i) => (
                            <Pressable
                              key={i}
                              onPress={() => setSelectedReportingOption(option)}
                              style={{
                                flexDirection: "row",
                                paddingHorizontal: 20,
                                paddingVertical: 8,
                                gap: 20,
                                alignItems: "center",
                              }}
                            >
                              <View
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 10,
                                  borderWidth: 2,
                                  borderColor: "white",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {selectedReportingOption === option && (
                                  <View
                                    style={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: 6,
                                      backgroundColor: "white",
                                    }}
                                  />
                                )}
                              </View>

                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "500",
                                  flex: 1,
                                  color: customColors.customWhite,
                                  paddingRight: 30,
                                }}
                              >
                                {option}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    )}

                    {step <= 2 && (
                      <View
                        style={{
                          flexDirection: isSmallDevice ? "column" : "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: getSpacing(16),
                          marginTop: getSpacing(24),
                          paddingHorizontal: getSpacing(16),
                        }}
                      >
                        <Button
                          title={"Clear Form"}
                          type={"cancel"}
                          onPress={handleClearForm}
                          style={{
                            flex: isSmallDevice ? undefined : 1,
                            width: isSmallDevice ? "100%" : undefined,
                            minHeight: getSpacing(44),
                          }}
                        />

                        <Button
                          onPress={() => (step == 2 ? handleSubmit() : handleNext())}
                          title={step == 2 ? "Submit" : "Next"}
                          type={"submit"}
                          disabled={isSubmitting}
                          style={{
                            flex: isSmallDevice ? undefined : 1,
                            width: isSmallDevice ? "100%" : undefined,
                            minHeight: getSpacing(44),
                          }}
                        />
                      </View>
                    )}
                  </>
                )}
              </View>
            </ScrollView>

            {/* Response modal */}
            <ResponseModal
              buttonText={responseModal.buttonText}
              buttonPress={() => setResponseModal((prev) => ({ ...prev, visible: false }))}
              isModalVisible={responseModal.visible}
              responseText={responseModal.message}
              closeMenu={() =>
                setResponseModal((prev) => ({ ...prev, visible: false, message: "" }))
              }
            />
          </View>
        </View>

        <SimpleSuccessModal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Application has been submitted successfully."
        />

        {/* Status Check Modal */}
        <Pressable
          style={{
            display: isVisible ? "flex" : "none",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 16,
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
              Application Status
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
              Your application is currently under review. We will notify you once it has
              been processed.
            </Text>

            <Button
              title="Close"
              type="submit"
              onPress={() => setIsVisible(false)}
              style={{ marginTop: 12 }}
            />
          </Pressable>
        </Pressable>
      </LinearGradient>
    </>
  );

  // === Extracted Step 3 section for clean code ===
  function STEP_3_VIEW() {
    if (step !== 3) return null;

    return (
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
            flexDirection: "column",
            borderRadius: 8,
            paddingVertical: 8,
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
                color: customColors.customWhiteEighty,
                textAlign: "center",
              }}
            >
              You have successfully submitted the application for the grant.
              Please check the status of your application for updates.
            </Text>

            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                paddingHorizontal: 20,
                paddingVertical: 8,
              }}
            >
              <Button
                title={"Check Status"}
                type={"cancel"}
                style={{ width: "40%" }}
                onPress={() => setIsVisible(true)}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
}






// import { Button } from "@/components/atom/buttons";
// import { InputCard } from "@/components/atom/cards";
// import { HeaderTitle } from "@/components/atom/header";
// import { PastorNavigationHeader } from "@/components/pastor/Header";
// import { Colors } from "@/constants/Colors";
// import { useGrant } from "@/hooks/grant/useGrant";
// import { useAuthStore } from "@/stores";
// import { getFontSize, getSpacing, isSmallDevice } from "@/utils/responsive";
// import { LinearGradient } from "expo-linear-gradient";
// import React from "react";
// import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// export default function Grant() {
//   const { top, bottom } = useSafeAreaInsets();
//   const { user } = useAuthStore(); // Get current user ID
//   const {
//     form,
//     isLoading,
//     isSubmitting,
//     error,
//     fetchGrantForm,
//     submitCompleteApplication,
//   } = useGrant();

//   const [step, setStep] = React.useState(1);
//   const [showSuccessModal, setShowSuccessModal] = React.useState(false);
//   const [formAnswers, setFormAnswers] = React.useState<Record<string, string>>({});
//   const [errorModal, setErrorModal] = React.useState({
//     visible: false,
//     message: ''
//   });

//   // const navigation = useNavigation<NavigationProp<RootStackParamList>>();

//   // Fetch form on mount
//   React.useEffect(() => {
//     fetchGrantForm().catch((err) => {
//       console.error('Failed to load grant form:', err);
//       setErrorModal({
//         visible: true,
//         message: 'Failed to load grant form. Please try again.',
//       });
//     });
//   }, [fetchGrantForm]);

//   const handleInputChange = (fieldLabel: string, value: string) => {
//     setFormAnswers((prev) => ({
//       ...prev,
//       [fieldLabel]: value,
//     }));
//   };

//   const handleSubmit = async () => {
//     if (!user?.id) {
//       setErrorModal({
//         visible: true,
//         message: 'User not authenticated. Please log in again.',
//       });
//       return;
//     }

//     try {
//       await submitCompleteApplication(user.id, formAnswers);

//       setShowSuccessModal(true);

//       setTimeout(() => {
//         setShowSuccessModal(false);
//         setStep(3); // Move to success screen
//         setFormAnswers({}); // Clear form
//       }, 2000);
//     } catch (err: any) {
//       setErrorModal({
//         visible: true,
//         message: err?.response?.data?.message || 'Failed to submit application',
//       });
//     }
//   };

//   // Loading screen
//   if (isLoading) {
//     return (
//       <LinearGradient
//         colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
//         style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
//       >
//         <ActivityIndicator size="large" color="white" />
//         <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>
//           Loading grant form...
//         </Text>
//       </LinearGradient>
//     );
//   }

//   // Error screen if form failed to load
//   if (error && !form) {
//     return (
//       <LinearGradient
//         colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
//         style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}
//       >
//         <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
//           Failed to load grant form
//         </Text>
//         <Button
//           title="Retry"
//           type="submit"
//           onPress={() => fetchGrantForm()}
//         />
//       </LinearGradient>
//     );
//   }

//   return (
//     <>
//       <LinearGradient
//         colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
//         style={{ flex: 1 }}
//       >
//         <View style={{ flex: 1, paddingTop: top }}>
//           <PastorNavigationHeader
//             showDrawer={false}
//             showBackButton={true}
//             wrapperClass="mt-5"
//           />

//           <View
//             style={{
//               width: '100%',
//               alignItems: 'center',
//               marginTop: 16,
//               flex: 1,
//             }}
//           >
//             <ScrollView
//               contentContainerStyle={{
//                 paddingBottom: Platform.OS === 'android' ? bottom : bottom * 1.5,
//                 paddingHorizontal: getSpacing(16),
//                 flexGrow: 1,
//               }}
//               style={{ width: '100%' }}
//             >
//               <View
//                 style={{
//                   width: '100%',
//                   flexDirection: 'column',
//                   justifyContent: 'flex-start',
//                   alignItems: 'stretch',
//                 }}
//               >
//                 <HeaderTitle
//                   title={form?.data.title || 'The Center for Community Change Micro-Grant Application'}
//                   textStyle={{
//                     fontWeight: '700',
//                     color: '#ffffff',
//                     fontFamily: 'AlbertBold',
//                     fontSize: getFontSize(isSmallDevice ? 16 : 18),
//                     textAlign: 'center',
//                   }}
//                 />

//                 <View
//                   style={{
//                     width: '100%',
//                     paddingVertical: getSpacing(8),
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: 'white',
//                       fontSize: getFontSize(14),
//                       lineHeight: getFontSize(20),
//                       fontWeight: '500',
//                       textAlign: 'left',
//                     }}
//                   >
//                     {form?.data.description || 'Form for pastors to apply for grants'}
//                   </Text>
//                 </View>

//                 {/* Step Indicator */}
//                 {step <= 2 && (
//                   <View
//                     style={{
//                       borderWidth: 1,
//                       borderColor: 'white',
//                       borderRadius: getSpacing(10),
//                       backgroundColor: '#14517d',
//                       marginVertical: getSpacing(16),
//                       paddingVertical: getSpacing(16),
//                       paddingHorizontal: getSpacing(16),
//                       width: '100%',
//                     }}
//                   >
//                     <View
//                       style={{
//                         flexDirection: 'column',
//                         gap: getSpacing(8),
//                         justifyContent: 'flex-start',
//                       }}
//                     >
//                       <Text
//                         style={{
//                           color: 'white',
//                           fontSize: getFontSize(16),
//                           lineHeight: getFontSize(20),
//                           fontWeight: '600',
//                         }}
//                       >
//                         {step}. {step == 1 ? 'Application Form' : 'Confirmation'}
//                       </Text>
//                       {step == 1 && (
//                         <Text
//                           style={{
//                             color: 'white',
//                             fontSize: getFontSize(14),
//                             lineHeight: getFontSize(18),
//                             fontWeight: '500',
//                             marginTop: getSpacing(4),
//                           }}
//                         >
//                           Please answer all required fields
//                         </Text>
//                       )}
//                     </View>
//                   </View>
//                 )}

//                 {step == 1 && (
//                   <View
//                     style={{
//                       width: '100%',
//                       alignItems: 'flex-end',
//                       paddingVertical: getSpacing(8),
//                     }}
//                   >
//                     <Text
//                       style={{
//                         color: 'yellow',
//                         fontSize: getFontSize(14),
//                         lineHeight: getFontSize(18),
//                         fontWeight: '500',
//                       }}
//                     >
//                       * Indicates required fields
//                     </Text>
//                   </View>
//                 )}

//                 {/* Render form fields - with null check */}
//                 {step == 1 && form?.data.fields && form.data.fields.length > 0 ? (
//                   <View>
//                     {form.data.fields.map((field) => (
//                       <InputCard
//                         key={field._id}
//                         title={`${field.label}${field.required ? ' *' : ''}`}
//                         value={formAnswers[field.label] || ''}
//                         setValue={(value) => handleInputChange(field.label, value)}
//                         description={
//                           field.type === 'text'
//                             ? `[Enter ${field.label.toLowerCase()}]`
//                             : field.type === 'textarea'
//                               ? `[Describe ${field.label.toLowerCase()}]`
//                               : '[Upload supporting documents]'
//                         }
//                         required={field.required}
//                         fileUpload={field.type === 'file'}
//                         answer={false}
//                       />
//                     ))}
//                   </View>
//                 ) : step == 1 ? (
//                   <View style={{ paddingVertical: 20, alignItems: 'center' }}>
//                     <Text style={{ color: 'white', fontSize: 16 }}>
//                       No form fields available
//                     </Text>
//                   </View>
//                 ) : null}

//                 {/* Step 2: Review/Confirmation */}
//                 {step == 2 && (
//                   <View
//                     style={{
//                       width: '100%',
//                       flexDirection: 'column',
//                       gap: 20,
//                       justifyContent: 'center',
//                       paddingVertical: 20,
//                     }}
//                   >
//                     <View
//                       style={{
//                         width: '100%',
//                         flexDirection: 'column',
//                         borderRadius: 8,
//                         paddingVertical: 8,
//                         borderWidth: 1,
//                         borderColor: 'white',
//                       }}
//                     >
//                       <Text
//                         style={{
//                           fontSize: 16,
//                           fontWeight: '500',
//                           lineHeight: 28,
//                           fontFamily: 'AlbertSans-Medium',
//                           color: '#ffffff',
//                           paddingLeft: 20,
//                         }}
//                       >
//                         Please review your application carefully before submission.
//                       </Text>

//                       {/* Show submitted answers */}
//                       <View style={{ paddingHorizontal: 20, paddingVertical: 12, gap: 12 }}>
//                         {Object.entries(formAnswers).map(([key, value]) => (
//                           <View key={key} style={{ gap: 4 }}>
//                             <Text
//                               style={{
//                                 fontSize: 12,
//                                 fontWeight: '600',
//                                 color: '#ffeb3b',
//                               }}
//                             >
//                               {key}
//                             </Text>
//                             <Text
//                               style={{
//                                 fontSize: 14,
//                                 fontWeight: '400',
//                                 color: '#ffffff',
//                                 lineHeight: 20,
//                               }}
//                             >
//                               {value}
//                             </Text>
//                           </View>
//                         ))}
//                       </View>
//                     </View>
//                   </View>
//                 )}

//                 {/* Step 3: Success */}
//                 {step == 3 && (
//                   <View
//                     style={{
//                       width: '100%',
//                       flexDirection: 'column',
//                       gap: 20,
//                       justifyContent: 'center',
//                       paddingVertical: 20,
//                     }}
//                   >
//                     <View
//                       style={{
//                         width: '100%',
//                         flexDirection: 'column',
//                         borderRadius: 8,
//                         paddingVertical: 8,
//                         borderWidth: 1,
//                         borderColor: 'white',
//                       }}
//                     >
//                       <View
//                         style={{
//                           width: '100%',
//                           flexDirection: 'column',
//                           borderRadius: 8,
//                           justifyContent: 'center',
//                           paddingHorizontal: 20,
//                           paddingVertical: 8,
//                           gap: 20,
//                         }}
//                       >
//                         <Text
//                           style={{
//                             fontSize: 16,
//                             fontWeight: '500',
//                             lineHeight: 22,
//                             fontFamily: 'AlbertSans-Medium',
//                             color: '#ffffff',
//                             textAlign: 'center',
//                           }}
//                         >
//                           You have successfully submitted the application for the grant.
//                           Please check the status of your application for updates.
//                         </Text>
//                         <Button
//                           title="Check Status"
//                           type="cancel"
//                           style={{ width: '100%' }}
//                           onPress={() => {
//                             // Add navigation to status page if available
//                             setStep(1);
//                             setFormAnswers({});
//                           }}
//                         />
//                       </View>
//                     </View>
//                   </View>
//                 )}

//                 {/* Navigation Buttons */}
//                 {step <= 2 && (
//                   <View
//                     style={{
//                       flexDirection: isSmallDevice ? 'column' : 'row',
//                       justifyContent: 'space-between',
//                       alignItems: 'center',
//                       gap: getSpacing(16),
//                       marginTop: getSpacing(24),
//                       paddingHorizontal: getSpacing(16),
//                     }}
//                   >
//                     <Button
//                       title="Clear Form"
//                       type="cancel"
//                       onPress={() => {
//                         setStep(1);
//                         setFormAnswers({});
//                       }}
//                       disabled={isSubmitting}
//                       style={{
//                         flex: isSmallDevice ? undefined : 1,
//                         width: isSmallDevice ? '100%' : undefined,
//                         minHeight: getSpacing(44),
//                       }}
//                     />
//                     <Button
//                       onPress={() =>
//                         step == 2
//                           ? handleSubmit()
//                           : setStep(step + 1)
//                       }
//                       title={step == 2 ? 'Submit' : 'Next'}
//                       type="submit"
//                       disabled={isSubmitting}
//                       loading={isSubmitting}
//                       style={{
//                         flex: isSmallDevice ? undefined : 1,
//                         width: isSmallDevice ? '100%' : undefined,
//                         minHeight: getSpacing(44),
//                       }}
//                     />
//                   </View>
//                 )}
//               </View>
//             </ScrollView>
//           </View>
//         </View>

//         {/* Success Modal */}
//         <Modal
//           visible={showSuccessModal}
//           transparent={true}
//           animationType="fade"
//           onRequestClose={() => setShowSuccessModal(false)}
//         >
//           <Pressable
//             style={{
//               flex: 1,
//               alignItems: 'center',
//               justifyContent: 'center',
//               paddingHorizontal: getSpacing(16),
//               backgroundColor: 'rgba(0, 0, 0, 0.5)',
//             }}
//             onPress={() => setShowSuccessModal(false)}
//           >
//             <Pressable
//               style={{
//                 width: '90%',
//                 maxWidth: 400,
//                 gap: getSpacing(12),
//                 padding: getSpacing(24),
//                 backgroundColor: 'white',
//                 borderRadius: getSpacing(12),
//                 alignItems: 'center',
//               }}
//               onPress={(e) => e.stopPropagation()}
//             >
//               <Text
//                 style={{
//                   fontWeight: '600',
//                   fontSize: getFontSize(18),
//                   lineHeight: getFontSize(24),
//                   color: '#176192',
//                   textAlign: 'center',
//                   marginTop: getSpacing(20),
//                 }}
//               >
//                 Application Submitted Successfully
//               </Text>
//               <Text
//                 style={{
//                   fontWeight: '500',
//                   fontSize: getFontSize(14),
//                   lineHeight: getFontSize(20),
//                   color: '#1E366F',
//                   textAlign: 'center',
//                 }}
//               >
//                 Your grant application has been received and is under review.
//               </Text>
//             </Pressable>
//           </Pressable>
//         </Modal>

//         {/* Error Modal */}
//         <Modal
//           visible={errorModal.visible}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setErrorModal({ visible: false, message: '' })}
//         >
//           <Pressable
//             style={{
//               flex: 1,
//               justifyContent: 'center',
//               alignItems: 'center',
//               backgroundColor: 'rgba(0, 0, 0, 0.5)',
//               paddingHorizontal: 20,
//             }}
//             onPress={() => setErrorModal({ visible: false, message: '' })}
//           >
//             <Pressable
//               style={{
//                 backgroundColor: 'white',
//                 padding: 20,
//                 borderRadius: 12,
//                 maxWidth: '90%',
//               }}
//               onPress={(e) => e.stopPropagation()}
//             >
//               <Text
//                 style={{
//                   fontSize: 16,
//                   fontWeight: '600',
//                   color: '#d32f2f',
//                   marginBottom: 10
//                 }}
//               >
//                 Error
//               </Text>
//               <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
//                 {errorModal.message}
//               </Text>
//               <Button
//                 title="Dismiss"
//                 type="submit"
//                 onPress={() => setErrorModal({ visible: false, message: '' })}
//                 style={{ marginTop: 16 }}
//               />
//             </Pressable>
//           </Pressable>
//         </Modal>
//       </LinearGradient>
//     </>
//   );
// }
// const styles = StyleSheet.create({
//   stepContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   dot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: "#221c70", // Change color as needed
//   },
//   line: {
//     flex: 1,
//     height: 1,
//     // Change color as needed
//     //   marginHorizontal: 5,
//   },
//   scrollContainer: {
//     flex: 1,
//     justifyContent: "space-between",
//     // alignItems: "center",
//   },
//   text: {
//     fontSize: 20,

//     fontWeight: "bold",
//   },
//   separator: {
//     height: 2,
//     backgroundColor: "rgba(255, 255, 255, 0.2)", // customWhiteTwenty
//     // marginHorizontal: 16,
//     marginVertical: 18,
//   },
//   container: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginHorizontal: 16, // Reduced from 72px to 16px
//   },
//   image: {
//     borderRadius: 8,
//     margin: 8,
//   },
//   greetingText: {
//     fontFamily: "AlbertSans-SemiBold",
//     fontSize: 14,
//     color: "#FFFFFF",
//     fontWeight: "300",
//   },
//   roleText: {
//     fontFamily: "AlbertSans-Medium",
//     fontSize: 14,
//     color: "#FFFFFF",
//     fontWeight: "300",
//   },
//   divider: {
//     height: 0.5,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     marginHorizontal: 16, // Reduced from 72px
//   },
//   progressContainer: {
//     flexDirection: "row",
//     gap: 4,
//     alignItems: "center",
//     marginTop: 8,
//     marginHorizontal: 16, // Reduced from 72px
//   },
//   progressText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontFamily: "AlbertSans-Regular",
//   },
//   progressBarBackground: {
//     flex: 1,
//     backgroundColor: "#182c5b",
//     height: 8,
//     borderRadius: 4,
//     marginTop: 4,
//   },
//   progressBarFill: {
//     backgroundColor: "#FFFFFF",
//     height: 8,
//     borderRadius: 4,
//     width: "70%",
//   },
//   progressPercent: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     textAlign: "right",
//     fontFamily: "AlbertSans-Regular",
//   },
//   actionsContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//     padding: 20,
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     borderRadius: 12,
//     padding: 6,
//     paddingVertical: 10,
//     backgroundColor: "#004B87",
//     borderWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.8)",
//   },
//   actionText: {
//     fontFamily: "AlbertSans-Regular",
//     color: "#FFFFFF",
//   },
//   icon: {
//     width: 18,
//     height: 18,
//     marginHorizontal: 16,
//   },
//   sectionMargin: {
//     marginVertical: 8,
//   },
//   whiteText: {
//     fontFamily: "AlbertRegular",
//     color: "white",
//     fontSize: 14,
//   },
//   summaryContainer: {
//     flexDirection: "row",
//     borderRadius: 8,
//     padding: 8,
//     borderWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.45)",
//     marginTop: 8,
//   },
//   detailedContainer: {
//     borderRadius: 8,
//     padding: 8,
//     borderWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.45)",
//     marginTop: 16,
//   },
//   rowContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     gap: 12,
//     marginVertical: 8,
//   },
//   infoBox: {
//     flex: 1,
//     flexDirection: "row",
//     borderRadius: 8,
//     padding: 8,
//     borderWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.8)",
//   },
//   interestsContainer: {
//     borderRadius: 8,
//     padding: 8,
//     borderWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.8)",
//     marginVertical: 8,
//   },
//   commentsContainer: {
//     borderRadius: 8,
//     padding: 8,
//     borderWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.8)",
//     marginVertical: 8,
//   },
//   appointmentsContainer: {
//     marginHorizontal: 16,
//     marginTop: 16,
//     position: "relative",

//     width: "100%",
//     borderWidth: 1,
//     borderColor: "white",
//     paddingVertical: 20,
//     paddingHorizontal: 10,
//     borderRadius: 10,
//   },
//   rowBetween: {
//     marginVertical: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   upcomingText: {
//     color: "#FFFFFF", // customWhite
//     fontSize: 14,
//     fontFamily: "AlbertSans-Bold",
//     textAlign: "center",
//   },
//   seeAllText: {
//     color: "#FFFFFF", // customWhite
//     fontSize: 14,
//     fontFamily: "AlbertSans-Medium",
//     textAlign: "center",
//   },
// });

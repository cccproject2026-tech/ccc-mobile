import { Button } from "@/components/atom/buttons";
import CustomDropdown from "@/components/atom/dropDown";
import {
  DropDrawer,
  Header,
  TextArea,
  TextInput as TextInputField,
} from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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
  title: string;
  yearsInMinistry: string;
  conference: string;
  communityServiceProjects: string;
  interests: string;
  comments: string;
}

export default function ProfileScreen() {
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [hasChurch2, setHasChurch2] = useState(true);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "John",
    lastName: "Ross",
    phoneNumber: "098461313976",
    email: "johnross@gmail.com",
    profileSummary:
      "Lorem ipsum dolor sit amet, consectetur adipiscing eip ex ea commodo consequat. Duis",
    church1: {
      name: "Loma linda University Church",
      phone: "098461313976",
      website: "johnross@gmail.com",
      address: "Loma linda University Church,CA",
      city: "Oakland",
      state: "North American",
      zipCode: "00000",
      country: "USA",
    },
    church2: {
      name: "Loma linda University Church",
      phone: "098461313976",
      website: "johnross@gmail.com",
      address: "Loma linda University Church,CA",
      city: "Oakland",
      state: "North American",
      zipCode: "00000",
      country: "USA",
    },
    title: "Pastor",
    yearsInMinistry: "11",
    conference: "Oakland",
    communityServiceProjects: "11",
    interests:
      "I would like to find out more about the Center for Community Change",
    comments:
      "I am a conference administrator and would like to find out more about partnering with the cent I conference administrator and would like to find out more about partnering with the center",
  });

  const [profileImage, setProfileImage] = useState(icons.myProfile);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleImagePicker = () => {
    Alert.alert("Change Profile Picture", "Choose an option", [
      {
        text: "Camera",
        onPress: () => {
          // Mock camera functionality
          Alert.alert("Camera", "Camera functionality would open here");
        },
      },
      {
        text: "Photo Library",
        onPress: () => {
          // Mock photo library functionality
          Alert.alert("Photo Library", "Photo library would open here");
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const titleOptions = [
    { label: "Pastor", value: "Pastor" },
    { label: "Associate Pastor", value: "Associate Pastor" },
    { label: "Youth Pastor", value: "Youth Pastor" },
    { label: "Senior Pastor", value: "Senior Pastor" },
    { label: "Elder", value: "Elder" },
  ];

  const conferenceOptions = [
    { label: "Oakland", value: "Oakland" },
    { label: "Northern California", value: "Northern California" },
    { label: "Southern California", value: "Southern California" },
    { label: "Central California", value: "Central California" },
  ];

  const handleEditPress = () => {
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset to original data if needed
  };

  const handleSavePress = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSave = () => {
    setShowConfirmation(false);
    setIsEditMode(false);
    setShowSuccessToast(true);
    // Here you would typically save the data to your backend
  };

  const handleAddChurch = () => {
    if (!profileData.church2) {
      setProfileData({
        ...profileData,
        church2: {
          name: "",
          phone: "",
          website: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      });
      setHasChurch2(true);
    }
  };

  const handleRemoveChurch2 = () => {
    setProfileData({
      ...profileData,
      church2: null,
    });
    setHasChurch2(false);
  };

  const updateProfileData = (
    field: string,
    value: string,
    church?: "church1" | "church2",
    churchField?: string
  ) => {
    if (church && churchField) {
      if (church === "church2" && profileData.church2) {
        setProfileData({
          ...profileData,
          church2: {
            ...profileData.church2,
            [churchField]: value,
          },
        });
      } else if (church === "church1") {
        setProfileData({
          ...profileData,
          church1: {
            ...profileData.church1,
            [churchField]: value,
          },
        });
      }
    } else {
      setProfileData({
        ...profileData,
        [field]: value,
      });
    }
  };

  const renderEditableText = (
    value: string,
    field: string,
    church?: "church1" | "church2",
    churchField?: string,
    multiline = false
  ) => {
    if (isEditMode) {
      return (
        <TextInput
          style={[
            styles.whiteText,
            styles.editableInput,
            multiline && styles.multilineInput,
          ]}
          value={value}
          onChangeText={(text) =>
            updateProfileData(field, text, church, churchField)
          }
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
      );
    }
    return <Text style={styles.whiteText}>{value}</Text>;
  };

  const renderDropdown = (
    value: string,
    field: string,
    options: Array<{ label: string; value: string }>
  ) => {
    if (isEditMode) {
      return (
        <CustomDropdown
          selectedValue={value}
          setSelectedValue={(val) => updateProfileData(field, val || "")}
          items={options}
          placeholder={`Select ${field}`}
          containerStyle={styles.dropdownContainer}
        />
      );
    }
    return (
      <Text style={styles.whiteText}>
        {field} : {value}
      </Text>
    );
  };

  // Generic handler
  const handleInputChange = (
    field: keyof ProfileData,
    value: string,
    church?: "church1" | "church2",
    churchField?: keyof ProfileData["church1"]
  ) => {
    if (church && churchField) {
      setProfileData({
        ...profileData,
        [church]: {
          ...profileData[church]!,
          [churchField]: value,
        },
      });
    } else {
      setProfileData({
        ...profileData,
        [field]: value,
      });
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={100}
            keyboardOpeningTime={0}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 150,
            }}
            showsVerticalScrollIndicator={false}
          >
            <PastorNavigationHeader showNameTag />
            <View style={styles.mainContainer}>
              <Header title="Profile" showSettings={false} hideSearchBar />
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.profileSection}>
                  <View style={styles.profileImageContainer}>
                    <Image
                      source={profileImage}
                      style={styles.profileImage}
                      resizeMode="cover"
                    />
                    {!isEditMode && (
                      <TouchableOpacity
                        style={styles.profileEditIcon}
                        onPress={handleImagePicker}
                      >
                        <Image
                          source={icons.edit}
                          style={{ width: 17, height: 17 }}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.profileInfo}>
                    <Text className="font-semibold" style={styles.greetingText}>
                      Good Morning John Ross
                    </Text>
                    <Text style={styles.roleText}>Pastor</Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View
                  style={{
                    ...styles.progressContainer,
                    marginTop: 20,
                    maxWidth: 220,
                    marginHorizontal: "auto",
                  }}
                >
                  <Text className="text-base leading-[22px] font-medium text-white">
                    Progress
                  </Text>
                  <View style={styles.progressBarBackground}>
                    <View style={styles.progressBarFill} />
                  </View>
                  <Text className="text-xs font-bold text-white ">70%</Text>
                </View>
                <View style={styles.actionsContainer}>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionText}>Upload documents</Text>
                    <Image source={icons.attachment} style={styles.icon} />
                  </View>
                  <TouchableOpacity
                    onPress={handleEditPress}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionText}>Edit Profile</Text>
                    <Image source={icons.edit} style={styles.icon} />
                  </TouchableOpacity>
                </View>
                <View className="px-[10px]">
                  <View style={styles.sectionMargin}>
                    <Text style={styles.whiteText}>Profile Information</Text>
                  </View>
                  <View>
                    <TextArea
                      label="profileSummary"
                      value={profileData.profileSummary}
                      onChangeText={(text) =>
                        handleInputChange("profileSummary", text)
                      }
                      editable={isEditMode}
                    />
                    {/* {renderEditableText(
                    profileData.profileSummary,
                    "profileSummary",
                    undefined,
                    undefined,
                    true
                  )} */}
                  </View>

                  {/* Detailed Personal Info */}
                  <View style={styles.detailedContainer}>
                    <View className="gap-6 mt-2">
                      <Text style={styles.whiteText}>Personal Information</Text>
                      <View style={styles.rowContainer}>
                        <TextInputField
                          label="First Name"
                          value={profileData.firstName}
                          editable={isEditMode}
                          onChangeText={(text) =>
                            handleInputChange("firstName", text)
                          }
                        />
                        <TextInputField
                          label="Last Name"
                          value={profileData.lastName}
                          editable={isEditMode}
                          onChangeText={(text) =>
                            handleInputChange("lastName", text)
                          }
                        />
                      </View>
                      <View style={styles.rowContainer}>
                        <TextInputField
                          label="Phone Number"
                          value={profileData.phoneNumber}
                          editable={isEditMode}
                          onChangeText={(text) =>
                            handleInputChange("phoneNumber", text)
                          }
                        />
                        <TextInputField
                          label="Email"
                          value={profileData.email}
                        />
                      </View>
                    </View>
                    <View style={styles.divider} />

                    {/* Church-1 Personal Info */}
                    <View className="flex-1 gap-3">
                      <View className="flex-row items-center justify-between">
                        <Text style={styles.whiteText}>
                          Current Church -1 Information
                        </Text>
                        {!isEditMode && (
                          <Button
                            title="Add Church"
                            textStyle={{
                              fontSize: 12,
                              color: "white",
                              fontWeight: 500,
                            }}
                            style={{
                              maxWidth: 120,
                              borderRadius: 50,
                            }}
                            onPress={() => {
                              {
                              }
                            }}
                            type={"custom"}
                          />
                        )}
                      </View>

                      <View className="gap-6 mt-4">
                        <View>
                          <TextInputField
                            label="Church Name"
                            value={profileData.church1.name}
                            editable={isEditMode}
                            onChangeText={(text) =>
                              handleInputChange(
                                "church1",
                                text,
                                "church1",
                                "name"
                              )
                            }
                          />
                        </View>
                        <View style={styles.rowContainer} className="">
                          <TextInputField
                            label="Church Phone"
                            value={profileData.church1.phone}
                            editable={isEditMode}
                            onChangeText={(text) =>
                              handleInputChange(
                                "church1",
                                text,
                                "church1",
                                "phone"
                              )
                            }
                          />
                          <TextInputField
                            label="Church Website"
                            value={profileData.church1.website}
                            editable={isEditMode}
                            onChangeText={(text) =>
                              handleInputChange(
                                "church1",
                                text,
                                "church1",
                                "website"
                              )
                            }
                          />
                        </View>
                        <View>
                          <TextInputField
                            label="Church Address"
                            value={profileData.church1.address}
                            editable={isEditMode}
                            onChangeText={(text) =>
                              handleInputChange(
                                "church1",
                                text,
                                "church1",
                                "address"
                              )
                            }
                          />
                        </View>
                        <View style={styles.rowContainer}>
                          <TextInputField
                            label="City"
                            value={profileData.church1.city}
                            editable={isEditMode}
                            onChangeText={(text) =>
                              handleInputChange(
                                "church1",
                                text,
                                "church1",
                                "city"
                              )
                            }
                          />
                          <TextInputField
                            label="State"
                            value={profileData.church1.state}
                            editable={isEditMode}
                            onChangeText={(text) =>
                              handleInputChange(
                                "church1",
                                text,
                                "church1",
                                "state"
                              )
                            }
                          />
                        </View>
                        <View style={styles.rowContainer}>
                          <TextInputField
                            label="Zip Code"
                            value={profileData.church1.zipCode}
                            editable={isEditMode}
                            onChangeText={(text) =>
                              handleInputChange(
                                "church1",
                                text,
                                "church1",
                                "zipCode"
                              )
                            }
                          />
                          <TextInputField
                            label="Country"
                            value={profileData.church1.country}
                            editable={isEditMode}
                            onChangeText={(text) =>
                              handleInputChange(
                                "church1",
                                text,
                                "church1",
                                "country"
                              )
                            }
                          />
                        </View>
                      </View>
                    </View>
                    <View style={styles.divider} />

                    {/* church 2 Information */}
                    {profileData.church2 && (
                      <View className="gap-3">
                        <View className="flex-row justify-between items-center">
                          <Text style={styles.whiteText}>
                            Current Church -2 Information
                          </Text>
                          {!isEditMode && (
                            <Button
                              title="Remove Church"
                              textStyle={{
                                fontSize: 12,
                                color: "white",
                                fontWeight: 500,
                              }}
                              style={{
                                maxWidth: 120,
                                borderRadius: 50,
                              }}
                              onPress={() => {
                                {
                                }
                              }}
                              type={"custom"}
                            />
                          )}
                        </View>
                        <View className="gap-6 mt-4">
                          <View>
                            <TextInputField
                              label="Church Name"
                              value={profileData.church2.name}
                            />
                          </View>
                          <View style={styles.rowContainer}>
                            <TextInputField
                              label="Church Phone"
                              value={profileData.church2.phone}
                            />
                            <TextInputField
                              label="Church Website"
                              value={profileData.church2.website}
                            />
                          </View>
                          <View>
                            <TextInputField
                              label="Church Address"
                              value={profileData.church2.address}
                            />
                          </View>
                          <View style={styles.rowContainer}>
                            <TextInputField
                              label="City"
                              value={profileData.church2.city}
                            />
                            <TextInputField
                              label="State"
                              value={profileData.church2.state}
                            />
                          </View>
                          <View style={styles.rowContainer}>
                            <TextInputField
                              label="Zip Code"
                              value={profileData.church2.zipCode}
                            />
                            <TextInputField
                              label="Country"
                              value={profileData.church2.country}
                            />
                          </View>
                        </View>
                      </View>
                    )}

                    <View style={styles.divider} />
                    {/* Other Information */}
                    <View style={styles.sectionMargin}>
                      <Text style={styles.whiteText}>Other Information</Text>
                    </View>

                    {/* Title */}
                    <View className="gap-6">
                      <View>
                        <DropDrawer
                          selectedValues={selectedInterests}
                          setSelectedValues={setSelectedInterests}
                          items={titleOptions}
                          placeholder="Select Title"
                          useCircleIndicator={true}
                          editable={!isEditMode}
                        />
                      </View>
                      <View style={styles.rowContainer}>
                        <TextInputField
                          label="Years in Ministry"
                          value={profileData.yearsInMinistry}
                          onChangeText={(text) =>
                            handleInputChange("yearsInMinistry", text)
                          }
                          editable={isEditMode}
                        />
                        <TextInputField
                          label="Conference"
                          value={profileData.conference}
                          onChangeText={(text) =>
                            handleInputChange("conference", text)
                          }
                          editable={isEditMode}
                        />
                      </View>
                      <View>
                        <TextInputField
                          label="Current Community Service Projects "
                          value={profileData.communityServiceProjects}
                          onChangeText={(text) =>
                            handleInputChange("communityServiceProjects", text)
                          }
                          editable={isEditMode}
                        />
                      </View>
                      <View>
                        {profileData.interests && (
                          <Text className="text-white text-[13px] pl-8">
                            interests
                          </Text>
                        )}
                        <TextArea
                          label="Interest"
                          value={profileData.interests}
                          onChangeText={(text) =>
                            handleInputChange("interests", text)
                          }
                          editable={isEditMode}
                        />
                      </View>
                      <View>
                        {profileData.comments && (
                          <Text className="text-white text-[13px] pl-8">
                            Comments
                          </Text>
                        )}
                        <TextArea
                          label="Comments"
                          value={profileData.comments}
                          onChangeText={(text) =>
                            handleInputChange("comments", text)
                          }
                          editable={isEditMode}
                        />
                      </View>
                    </View>
                  </View>
                </View>
                {!isEditMode && (
                  <View className="flex-row justify-center items-center gap-5 my-10">
                    <Button
                      title="Cancel"
                      textStyle={{
                        fontSize: 12,
                        color: "#001FC1",
                        fontWeight: 500,
                      }}
                      style={{
                        borderRadius: 10,
                        backgroundColor: "white",
                        width: 87,
                      }}
                      onPress={() => {}}
                      type={"custom"}
                    />
                    <Button
                      title="Save"
                      textStyle={{
                        fontSize: 12,
                        color: "white",
                        fontWeight: 500,
                      }}
                      style={{
                        borderRadius: 10,
                        width: 87,
                      }}
                      onPress={() => {}}
                      type={"custom"}
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>

        {/* Modals */}
        {/* <ConfirmationModal
          isVisible={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmSave}
        />

        <SuccessToast
          isVisible={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
        /> */}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    paddingBottom: 80,
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backIcon: {
    width: 18,
    height: 18,
    transform: [{ scaleX: -1 }],
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 20,
    position: "relative",
  },
  profileImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    // overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff2",
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
  },
  profileInfo: {
    alignItems: "center",
    gap: 8,
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
    // marginVertical: 18,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 72, // 4.5rem = 72px
  },
  greetingText: {
    fontFamily: "AlbertSans-SemiBold",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  roleText: {
    fontFamily: "AlbertSans-Medium",
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 50,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
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
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
    marginTop: 16,
    gap: 16,
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
  editableInput: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 4,
    padding: 8,
    minHeight: 35,
    color: "white",
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  profileEditIcon: {
    position: "absolute",
    bottom: -10,
    right: -30,
    backgroundColor: "rgba(0, 75, 135, 0.8)",
    borderRadius: 9,
    width: 42,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  topEditIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0, 75, 135, 0.8)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
  },
  editIconImage: {
    width: 12,
    height: 12,
    tintColor: "white",
  },
  churchHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addChurchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#004B87",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  addChurchText: {
    color: "white",
    fontSize: 12,
    marginRight: 4,
  },
  addIcon: {
    width: 14,
    height: 14,
    tintColor: "white",
  },
  removeChurchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d32f2f",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  removeChurchText: {
    color: "white",
    fontSize: 12,
    marginRight: 4,
  },
  deleteIcon: {
    width: 14,
    height: 14,
    tintColor: "white",
  },
  dropdownContainer: {
    backgroundColor: "transparent",
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#176192",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#176192",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#176192",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

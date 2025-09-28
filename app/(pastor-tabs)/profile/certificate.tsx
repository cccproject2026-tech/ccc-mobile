import { Button } from "@/components/atom/buttons";
import CustomDropdown from "@/components/atom/dropDown";
import { Header } from "@/components/build-components";
import { PastorNavigationHeader } from "@/components/pastor/Header";
import { Colors } from "@/constants/Colors";
import { customColors } from "@/constants/config/customColors";
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

export default function Certificate() {
  const [isEditMode, setIsEditMode] = useState(false);
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
    setIsEditMode(true);
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
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <PastorNavigationHeader />
          <View style={styles.mainContainer}>
            <Header
              title="John Ross"
              subTitle={`Mentor > John Doe > Mentee >Profile`}
              hideSearchBar={true}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop:20
                }}
              >
                <LinearGradient
                  colors={[
                    customColors.lightBlueGradientFour,
                    customColors.darkBlueGradientFour,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    padding: 2, // Border thickness
                    borderRadius: 999999,
                  }}
                >
                  <Image
                    source={icons.dummyUser}
                    style={{ width: 100, height: 100, borderRadius: 999999 }}
                  ></Image>
                </LinearGradient>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 9,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      color: "white",
                      fontWeight: "500",
                    }}
                  >
                    John Doe
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "white",
                      fontWeight: "500",
                    }}
                  >
                    Pastor
                  </Text>
                  <View
                    style={[
                      styles.mentorIconContainer,
                      { ...{ paddingTop: 10 } },
                    ]}
                  >
                    <Image source={icons.phone} style={styles.MentorIcon} />
                    <Image source={icons.message} style={styles.MentorIcon} />
                    <Image source={icons.mail} style={styles.MentorIcon} />
                    <Image source={icons.whatsapp} style={styles.MentorIcon} />
                  </View>
                </View>
              </View>

              <View style={styles.divider} className="mt-12 mb-6" />

              <LinearGradient
                colors={["#21B6E9", "#B83AF3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 2, // Border thickness
                  borderRadius: 10,
                  marginBottom: 16,
                  marginHorizontal: 22,
                }}
              >
                <View
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      backgroundColor: customColors.lightBlueGradientOne, // Same as parent's background
                      borderRadius: 8,
                      paddingHorizontal: 30,
                      paddingVertical: 8,
                    },
                  ]}
                >
                  <Image
                    source={icons.gradientDownload}
                    style={styles.MentorIcon}
                  />
                  <Text
                    style={[
                      {
                        fontSize: 16,
                        fontWeight: "500",
                        fontFamily: "AlbertSans-Medium",
                        color: customColors.customWhiteEighty,
                        textAlign: "center",
                      },
                    ]}
                  >
                    Download Certificate{" "}
                  </Text>
                  <Text
                    style={[
                      {
                        fontSize: 12,
                        fontWeight: "100",
                        fontFamily: "AlbertSans-Medium",
                        color: "black",
                        textAlign: "center",
                        backgroundColor: "white",
                        padding: 2,
                        width: 20,
                        borderRadius: 99999,
                      },
                    ]}
                  >
                    1
                  </Text>
                </View>
              </LinearGradient>
              <LinearGradient
                colors={["#21B6E9", "#B83AF3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 2, // Border thickness
                  borderRadius: 10,
                  marginHorizontal: 22,
                }}
              >
                <View
                  style={[
                    {
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: 10,
                      backgroundColor: customColors.lightBlueGradientOne, // Same as parent's background
                      borderRadius: 8,
                      paddingHorizontal: 30,
                      paddingVertical: 8,
                    },
                  ]}
                >
                  <Text
                    style={[
                      {
                        fontSize: 16,
                        fontWeight: "500",
                        fontFamily: "AlbertSans-Medium",
                        color: customColors.customWhiteEighty,
                        textAlign: "center",
                      },
                    ]}
                  >
                    You have been invited as a Field Mentor.
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      marginVertical: 10,
                    }}
                  >
                    <Button
                      title={"Not Interested"}
                      type={"cancel"}
                      style={{ width: "50%" }}
                      onPress={() => {}}
                    ></Button>
                    <Button
                      title={"Accept"}
                      type={"submit"}
                      style={{ width: "50%" }}
                      onPress={() => {}}
                    ></Button>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.divider} className="mt-6 mb-6" />

              {/* <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Progress</Text>
                <View style={styles.progressBarBackground}>
                  <View style={styles.progressBarFill} />
                </View>
                <Text style={styles.progressPercent}>70%</Text>
              </View> */}
              <View className="px-[10px]">
                <View style={styles.sectionMargin}>
                  <Text style={styles.whiteText}>Profile Information</Text>
                </View>

                {/* Intro Summary */}
                <View style={styles.summaryContainer}>
                  {renderEditableText(
                    profileData.profileSummary,
                    "profileSummary",
                    undefined,
                    undefined,
                    true
                  )}
                </View>

                {/* Detailed Personal Info */}
                <View style={styles.detailedContainer}>
                  <View className="gap-3 mt-2">
                    <Text style={styles.whiteText}>Personal Information</Text>
                    <View style={styles.rowContainer}>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(profileData.firstName, "firstName")
                        ) : (
                          <Text style={styles.whiteText}>
                            First Name : {profileData.firstName}
                          </Text>
                        )}
                      </View>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(profileData.lastName, "lastName")
                        ) : (
                          <Text style={styles.whiteText}>
                            Last Name : {profileData.lastName}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.rowContainer}>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(
                            profileData.phoneNumber,
                            "phoneNumber"
                          )
                        ) : (
                          <Text style={styles.whiteText}>
                            Phone Number : {profileData.phoneNumber}
                          </Text>
                        )}
                      </View>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(profileData.email, "email")
                        ) : (
                          <Text style={styles.whiteText}>
                            Email : {profileData.email}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.divider} />

                  {/* Church-1 Personal Info */}
                  <View className="gap-3">
                    <View
                      style={[
                        styles.sectionMargin,
                        styles.churchHeaderContainer,
                      ]}
                    >
                      <Text style={styles.whiteText}>
                        Current Church -1 Information
                      </Text>
                      {isEditMode && !profileData.church2 && (
                        <TouchableOpacity
                          onPress={handleAddChurch}
                          style={styles.addChurchButton}
                        >
                          <Text style={styles.addChurchText}>Add Church</Text>
                          <Image
                            source={icons.addIcon}
                            style={styles.addIcon}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.infoBox}>
                      {isEditMode ? (
                        renderEditableText(
                          profileData.church1.name,
                          "name",
                          "church1",
                          "name"
                        )
                      ) : (
                        <Text style={styles.whiteText}>
                          Church Name : {profileData.church1.name}
                        </Text>
                      )}
                    </View>
                    <View style={styles.rowContainer}>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(
                            profileData.church1.phone,
                            "phone",
                            "church1",
                            "phone"
                          )
                        ) : (
                          <Text style={styles.whiteText}>
                            Church Phone : {profileData.church1.phone}
                          </Text>
                        )}
                      </View>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(
                            profileData.church1.website,
                            "website",
                            "church1",
                            "website"
                          )
                        ) : (
                          <Text style={styles.whiteText}>
                            Church Website : {profileData.church1.website}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.infoBox}>
                      {isEditMode ? (
                        renderEditableText(
                          profileData.church1.address,
                          "address",
                          "church1",
                          "address"
                        )
                      ) : (
                        <Text style={styles.whiteText}>
                          Church Address : {profileData.church1.address}
                        </Text>
                      )}
                    </View>
                    <View style={styles.rowContainer}>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(
                            profileData.church1.city,
                            "city",
                            "church1",
                            "city"
                          )
                        ) : (
                          <Text style={styles.whiteText}>
                            City : {profileData.church1.city}
                          </Text>
                        )}
                      </View>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(
                            profileData.church1.state,
                            "state",
                            "church1",
                            "state"
                          )
                        ) : (
                          <Text style={styles.whiteText}>
                            State : {profileData.church1.state}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.rowContainer}>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(
                            profileData.church1.zipCode,
                            "zipCode",
                            "church1",
                            "zipCode"
                          )
                        ) : (
                          <Text style={styles.whiteText}>
                            Zip Code : {profileData.church1.zipCode}
                          </Text>
                        )}
                      </View>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(
                            profileData.church1.country,
                            "country",
                            "church1",
                            "country"
                          )
                        ) : (
                          <Text style={styles.whiteText}>
                            Country : {profileData.church1.country}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.divider} />

                  {/* church 2 Information */}
                  {profileData.church2 && (
                    <View className="gap-3">
                      <View
                        style={[
                          styles.sectionMargin,
                          styles.churchHeaderContainer,
                        ]}
                      >
                        <Text style={styles.whiteText}>
                          Current Church -2 Information
                        </Text>
                        {isEditMode && (
                          <TouchableOpacity
                            onPress={handleRemoveChurch2}
                            style={styles.removeChurchButton}
                          >
                            <Text style={styles.removeChurchText}>
                              Remove Church
                            </Text>
                            <Image
                              source={icons.deleteIcon}
                              style={styles.deleteIcon}
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(
                            profileData.church2?.name || "",
                            "name",
                            "church2",
                            "name"
                          )
                        ) : (
                          <Text style={styles.whiteText}>
                            Church Name : {profileData.church2?.name}
                          </Text>
                        )}
                      </View>
                      <View style={styles.rowContainer}>
                        <View style={styles.infoBox}>
                          {isEditMode ? (
                            renderEditableText(
                              profileData.church2?.phone || "",
                              "phone",
                              "church2",
                              "phone"
                            )
                          ) : (
                            <Text style={styles.whiteText}>
                              Church Phone : {profileData.church2?.phone}
                            </Text>
                          )}
                        </View>
                        <View style={styles.infoBox}>
                          {isEditMode ? (
                            renderEditableText(
                              profileData.church2?.website || "",
                              "website",
                              "church2",
                              "website"
                            )
                          ) : (
                            <Text style={styles.whiteText}>
                              Church Website : {profileData.church2?.website}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.infoBox}>
                        {isEditMode ? (
                          renderEditableText(
                            profileData.church2?.address || "",
                            "address",
                            "church2",
                            "address"
                          )
                        ) : (
                          <Text style={styles.whiteText}>
                            Church Address : {profileData.church2?.address}
                          </Text>
                        )}
                      </View>
                      <View style={styles.rowContainer}>
                        <View style={styles.infoBox}>
                          {isEditMode ? (
                            renderEditableText(
                              profileData.church2?.city || "",
                              "city",
                              "church2",
                              "city"
                            )
                          ) : (
                            <Text style={styles.whiteText}>
                              City : {profileData.church2?.city}
                            </Text>
                          )}
                        </View>
                        <View style={styles.infoBox}>
                          {isEditMode ? (
                            renderEditableText(
                              profileData.church2?.state || "",
                              "state",
                              "church2",
                              "state"
                            )
                          ) : (
                            <Text style={styles.whiteText}>
                              State : {profileData.church2?.state}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.rowContainer}>
                        <View style={styles.infoBox}>
                          {isEditMode ? (
                            renderEditableText(
                              profileData.church2?.zipCode || "",
                              "zipCode",
                              "church2",
                              "zipCode"
                            )
                          ) : (
                            <Text style={styles.whiteText}>
                              Zip Code : {profileData.church2?.zipCode}
                            </Text>
                          )}
                        </View>
                        <View style={styles.infoBox}>
                          {isEditMode ? (
                            renderEditableText(
                              profileData.church2?.country || "",
                              "country",
                              "church2",
                              "country"
                            )
                          ) : (
                            <Text style={styles.whiteText}>
                              Country : {profileData.church2?.country}
                            </Text>
                          )}
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
                  <View style={styles.infoBox}>
                    {isEditMode ? (
                      <CustomDropdown
                        selectedValue={profileData.title}
                        setSelectedValue={(val) =>
                          updateProfileData("title", val || "")
                        }
                        items={titleOptions}
                        placeholder="Select Title"
                        containerStyle={styles.dropdownContainer}
                      />
                    ) : (
                      <Text style={styles.whiteText}>
                        Title : {profileData.title}
                      </Text>
                    )}
                  </View>

                  {/* Years in Ministry and Conference */}
                  <View style={styles.rowContainer}>
                    <View style={styles.infoBox}>
                      {isEditMode ? (
                        renderEditableText(
                          profileData.yearsInMinistry,
                          "yearsInMinistry"
                        )
                      ) : (
                        <Text style={styles.whiteText}>
                          Years in Ministry : {profileData.yearsInMinistry}
                        </Text>
                      )}
                    </View>
                    <View style={styles.infoBox}>
                      {isEditMode ? (
                        <CustomDropdown
                          selectedValue={profileData.conference}
                          setSelectedValue={(val) =>
                            updateProfileData("conference", val || "")
                          }
                          items={conferenceOptions}
                          placeholder="Select Conference"
                          containerStyle={styles.dropdownContainer}
                        />
                      ) : (
                        <Text style={styles.whiteText}>
                          Conference : {profileData.conference}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Current Community Service Projects */}
                  <View style={styles.infoBox}>
                    {isEditMode ? (
                      renderEditableText(
                        profileData.communityServiceProjects,
                        "communityServiceProjects"
                      )
                    ) : (
                      <Text style={styles.whiteText}>
                        Current Community Service Projects :{" "}
                        {profileData.communityServiceProjects}
                      </Text>
                    )}
                  </View>

                  {/* Interests */}
                  <View style={styles.interestsContainer}>
                    <Text style={styles.whiteText}>Interests :</Text>
                    {renderEditableText(
                      profileData.interests,
                      "interests",
                      undefined,
                      undefined,
                      true
                    )}
                  </View>

                  {/* Comments */}
                  <View style={styles.commentsContainer}>
                    <Text style={styles.whiteText}>Comments :</Text>
                    {renderEditableText(
                      profileData.comments,
                      "comments",
                      undefined,
                      undefined,
                      true
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Save/Cancel Buttons */}
            {isEditMode && (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSavePress}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    overflow: "hidden",
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
    marginHorizontal: 20,
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
    bottom: -5,
    right: -5,
    backgroundColor: "rgba(0, 75, 135, 0.8)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
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
  mentorIconContainer: {
    flexDirection: "row",
    gap: 14, // gap-1
    // paddingHorizontal: 8, // px-2
  },
  MentorIcon: {
    width: 18,
    height: 18,
  },
});

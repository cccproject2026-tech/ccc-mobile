import {
  Button,
  DropDrawer,
  Header,
  ScreenLayout,
  TextArea,
  TextInput as TextInputField,
} from "@/components/build-components";
import { icons } from "@/constants/images";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

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

  const handleEditPress = () => {
    setIsEditMode(true);
  };

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
      <ScreenLayout
        showNameTag
        tagName="John Ros"
        enableScrollView={false}
        paddingX={0}
      >
        <View className="w-full">
          <Header title="Profile" showSettings={false} hideSearchBar />
          <View className="relative items-center flex-1 py-5">
            <View className="w-[70px] h-[70px] rounded-full justify-center items-center bg-white/12 relative mb-4">
              <Image
                source={profileImage}
                resizeMode="cover"
                className="w-[75px] h-[75px] rounded-full"
              />
              {isEditMode && (
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
            {!isEditMode && (
              <View className="flex items-center gap-2">
                <Text className="font-[AlbertSans-SemiBold] text-[14px] text-white font-semibold">
                  Good Morning John Ross
                </Text>
                <Text className="font-[AlbertSans-Medium] text-[14px] text-white font-semibold">
                  Pastor
                </Text>
              </View>
            )}
          </View>
          {!isEditMode && (
            <>
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
                <View className="flex-1 bg-[#182c5b] h-2 rounded-[4px] mt-1">
                  <View className="bg-white h-2 rounded-[4px] w-[70%]" />
                </View>
                <Text className="text-xs font-bold text-white ">70%</Text>
              </View>
            </>
          )}

          {!isEditMode && (
            <View className="flex flex-row items-center justify-center gap-2 px-5 py-4 mt-2">
              <View className="flex flex-row w-1/2 justify-around items-center rounded-[10px] px-2.5 py-2.5 bg-[#004B87] border border-white/80">
                <Text className="text-white">Upload documents</Text>
                <Image source={icons.attachment} style={styles.icon} />
              </View>
              <TouchableOpacity
                onPress={handleEditPress}
                className="flex flex-row justify-around w-1/2 items-center rounded-[10px] px-2.5 py-2.5 bg-[#004B87] border border-white/80"
              >
                <Text className="text-white">Edit Profile</Text>
                <Image source={icons.edit} style={styles.icon} />
              </TouchableOpacity>
            </View>
          )}

          <View className="px-[10px] flex-1 gap-4">
            <View>
              <Text className="font-[AlbertRegular] text-white text-[14px]">
                Profile Information
              </Text>
            </View>
            <View className="relative">
              <TextArea
                label="profileSummary"
                value={profileData.profileSummary}
                onChangeText={(text) =>
                  handleInputChange("profileSummary", text)
                }
                editable={isEditMode}
              />
              {isEditMode && (
                <TouchableOpacity
                  style={styles.profileInformationIcon}
                  onPress={handleImagePicker}
                >
                  <Image
                    source={icons.edit}
                    style={{ width: 17, height: 17 }}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Detailed Personal Info */}
            <View className="gap-4 p-2 pb-10 mt-4 border rounded-md border-white/45">
              <View className="gap-6 mt-2">
                <Text className="font-[AlbertRegular] text-white text-[14px]">
                  Personal Information
                </Text>
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
                    onChangeText={(text) => handleInputChange("lastName", text)}
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
                  <TextInputField label="Email" value={profileData.email} />
                </View>
              </View>
              <View style={styles.divider} />

              {/* Church-1 Personal Info */}
              <View className="flex-1 gap-3">
                <View className="flex-row items-center justify-between gap-12">
                  <Text className="font-[AlbertRegular] text-white text-[14px]">
                    Current Church -1 Information
                  </Text>
                  {isEditMode && (
                    <Button
                      children="Add Church"
                      buttonClass="mx-0 px-0 rounded-full"
                      wrapperClass="flex-1 rounded-full"
                      labelStyle={{ fontSize: 14, lineHeight: 0 }}
                      onPress={() => { }}
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
                        handleInputChange("church1", text, "church1", "name")
                      }
                    />
                  </View>
                  <View style={styles.rowContainer} className="">
                    <TextInputField
                      label="Church Phone"
                      value={profileData.church1.phone}
                      editable={isEditMode}
                      onChangeText={(text) =>
                        handleInputChange("church1", text, "church1", "phone")
                      }
                    />
                    <TextInputField
                      label="Church Website"
                      value={profileData.church1.website}
                      editable={isEditMode}
                      onChangeText={(text) =>
                        handleInputChange("church1", text, "church1", "website")
                      }
                    />
                  </View>
                  <View>
                    <TextInputField
                      label="Church Address"
                      value={profileData.church1.address}
                      editable={isEditMode}
                      onChangeText={(text) =>
                        handleInputChange("church1", text, "church1", "address")
                      }
                    />
                  </View>
                  <View style={styles.rowContainer}>
                    <TextInputField
                      label="City"
                      value={profileData.church1.city}
                      editable={isEditMode}
                      onChangeText={(text) =>
                        handleInputChange("church1", text, "church1", "city")
                      }
                    />
                    <TextInputField
                      label="State"
                      value={profileData.church1.state}
                      editable={isEditMode}
                      onChangeText={(text) =>
                        handleInputChange("church1", text, "church1", "state")
                      }
                    />
                  </View>
                  <View style={styles.rowContainer}>
                    <TextInputField
                      label="Zip Code"
                      value={profileData.church1.zipCode}
                      editable={isEditMode}
                      onChangeText={(text) =>
                        handleInputChange("church1", text, "church1", "zipCode")
                      }
                    />
                    <TextInputField
                      label="Country"
                      value={profileData.church1.country}
                      editable={isEditMode}
                      onChangeText={(text) =>
                        handleInputChange("church1", text, "church1", "country")
                      }
                    />
                  </View>
                </View>
              </View>
              {/* <View style={styles.divider} /> */}

              {/* church 2 Information */}
              {profileData.church2 && (
                <View className="gap-3">
                  <View className="flex-row items-center justify-between gap-12">
                    <Text className="font-[AlbertRegular] text-white text-[14px]">
                      Current Church -2 Information
                    </Text>
                    {isEditMode && (
                      <Button
                        children="Remove Church"
                        buttonClass="mx-0 px-0 rounded-full"
                        wrapperClass="flex-1 rounded-full"
                        labelStyle={{ fontSize: 14, lineHeight: 0 }}
                        onPress={() => { }}
                      />
                    )}
                  </View>
                  <View className="gap-6 mt-4">
                    <View>
                      <TextInputField
                        label="Church Name"
                        value={profileData.church2.name}
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
                        label="Church Phone"
                        value={profileData.church2.phone}
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
                      <TextInputField
                        label="Church Website"
                        value={profileData.church2.website}
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
                    <View>
                      <TextInputField
                        label="Church Address"
                        value={profileData.church2.address}
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
                        value={profileData.church2.city}
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
                      <TextInputField
                        label="State"
                        value={profileData.church2.state}
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
                        label="Zip Code"
                        value={profileData.church2.zipCode}
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
                      <TextInputField
                        label="Country"
                        value={profileData.church2.country}
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
                  </View>
                </View>
              )}

              <View style={styles.divider} />
              {/* Other Information */}
              <View className="my-2">
                <Text className="font-[AlbertRegular] text-white text-[14px]">
                  Other Information
                </Text>
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
                    editable={isEditMode}
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
                    onChangeText={(text) => handleInputChange("comments", text)}
                    editable={isEditMode}
                  />
                </View>
              </View>
            </View>
          </View>
          {isEditMode && (
            <View className="flex-row items-center justify-center gap-5 my-10">
              <Button
                children="Cancel"
                labelStyle={{
                  fontSize: 12,
                  color: "#001FC1",
                  fontWeight: 500,
                }}
                buttonStyle={{
                  borderRadius: 10,
                  backgroundColor: "white",
                  width: 87,
                }}
                onPress={() => { }}
              />
              <Button
                children="Save"
                labelStyle={{
                  fontSize: 12,
                  color: "white",
                  fontWeight: 500,
                }}
                buttonStyle={{
                  borderRadius: 10,
                  width: 87,
                }}
                onPress={() => { }}
              />
            </View>
          )}
        </View>
      </ScreenLayout>
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
    </>
  );
}

const styles = StyleSheet.create({
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
  icon: {
    width: 18,
    height: 18,
    marginHorizontal: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
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
    borderWidth: 1,
    borderColor: "#233A6F",
  },
  profileInformationIcon: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(0, 75, 135, 0.8)",
    borderRadius: 9,
    width: 42,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#233A6F",
  },
});

import ConfirmModal from '@/components/atom/ConfirmModal';
import SuccessModal from '@/components/atom/SuccessModal';
import {
  Button,
  DropDrawer,
  Header,
  ScreenLayout,
  TextArea,
  TextInput as TextInputField,
} from "@/components/build-components";
import { icons } from "@/constants/images";
import { useProfile, useUpdateProfile, useUploadProfilePicture } from "@/hooks/profile/useProfile";
import { ChurchInfo, UpdateProfileData } from "@/types/profile.types";
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CLEAN_CHURCH_TEMPLATE: ChurchInfo = {
  churchName: '',
  churchPhone: '',
  churchAddress: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  churchWebsite: '',
};

export default function ProfileScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  // Fetch profile data from React Query
  const { data: apiProfileData, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadProfilePicture = useUploadProfilePicture();

  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    churches: [],
    title: '',
    yearsInMinistry: '',
    conference: '',
    currentCommunityServiceProjects: '',
    interests: [],
    comments: '',
    bio: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Initialize form data when data is loaded or when entering edit mode
  useEffect(() => {
    console.log('apiProfileData', apiProfileData);
    if (apiProfileData?.user && !isFormInitialized) {
      const interests = apiProfileData.interest?.interests || [];
      setFormData({
        firstName: apiProfileData.user.firstName || '',
        lastName: apiProfileData.user.lastName || '',
        phoneNumber: apiProfileData.interest?.phoneNumber || '',
        churches: apiProfileData.interest?.churchDetails || [],
        title: apiProfileData.interest?.title || '',
        yearsInMinistry: apiProfileData.interest?.yearsInMinistry || '',
        conference: apiProfileData.interest?.conference || '',
        currentCommunityServiceProjects: apiProfileData.interest?.currentCommunityProjects || '',
        interests: Array.isArray(interests) ? interests : [interests],
        comments: apiProfileData.interest?.comments || '',
        bio: apiProfileData.interest?.profileInfo || '',
      });
      setSelectedInterests(Array.isArray(interests) ? interests : [interests]);
      setProfileImage(apiProfileData.user.profilePicture || null);
      setIsFormInitialized(true);
    }
  }, [apiProfileData, isFormInitialized]);

  // Handle image selection
  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setProfileImage(asset.uri);
        setSelectedImageFile({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || `profile-${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    }
  }, []);

  const handleImagePicker = () => {
    Alert.alert("Change Profile Picture", "Choose an option", [
      {
        text: "Photo Library",
        onPress: pickImage,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const titleOptions = [
    { label: "Mentor", value: "mentor" },
    { label: "Field Mentor", value: "fieldmentor" },
    { label: "Pastor", value: "pastor" },
    { label: "Lay Leader", value: "layleader" },
    { label: "Seminarian", value: "seminarian" },
  ];

  const handleEditPress = () => {
    setIsEditMode(true);
  };

  const handleInputChange = (
    field: keyof UpdateProfileData,
    value: any,
    index?: number,
    churchField?: keyof ChurchInfo
  ) => {
    if (field === 'churches' && index !== undefined && churchField) {
      const updatedChurches = [...(formData.churches || [])];
      updatedChurches[index] = { ...updatedChurches[index], [churchField]: value };
      setFormData({ ...formData, churches: updatedChurches });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const addChurch = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      churches: [
        ...(prev.churches || []),
        { ...CLEAN_CHURCH_TEMPLATE, id: `temp-${Date.now()}` },
      ],
    }));
  }, []);

  const removeChurch = useCallback((index: number) => {
    if ((formData.churches?.length || 0) > 1) {
      setFormData((prev) => ({
        ...prev,
        churches: prev.churches?.filter((_, i) => i !== index),
      }));
    }
  }, [formData.churches]);

  const handleCancel = () => {
    setIsEditMode(false);
    setIsFormInitialized(false); // Trigger re-init from api data
    setSelectedImageFile(null);
  };

  const handleSavePress = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    try {
      if (selectedImageFile) {
        await uploadProfilePicture.mutateAsync(selectedImageFile);
      }

      await updateProfile.mutateAsync({
        ...formData,
        interests: selectedInterests,
      });

      setIsEditMode(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert("Update Failed", error.message || "Failed to update profile.");
    }
  };

  const progressPercentage = useMemo(() => {
    return apiProfileData?.progress?.overallProgress || 0;
  }, [apiProfileData?.progress?.overallProgress]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#176192' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (isError || !apiProfileData?.user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#176192', padding: 20 }}>
        <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 20 }}>Failed to load profile.</Text>
        <Button children="Retry" onPress={() => router.back()} />
      </View>
    );
  }

  const { user, interest } = apiProfileData;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenLayout
        showNameTag
        tagName={`${user.firstName} ${user.lastName}`}
        enableScrollView={true}
        paddingX={0}
      >
        <View className="w-full">
          <Header title="Profile" showSettings={false} hideSearchBar />
          <View className="relative items-center flex-1 py-5">
            <View className="w-[70px] h-[70px] rounded-full justify-center items-center bg-white/12 relative mb-4">
              <Image
                source={profileImage ? { uri: profileImage } : icons.myProfile}
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
                  {greeting} {user.firstName} {user.lastName}----------
                </Text>
                <Text className="font-[AlbertSans-Medium] text-[14px] text-white font-semibold">
                  {interest?.title || "Mentor"}
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
                  <View className="bg-white h-2 rounded-[4px]" style={{ width: `${progressPercentage}%` }} />
                </View>
                <Text className="text-xs font-bold text-white ">{progressPercentage}%</Text>
              </View>
            </>
          )}

          {!isEditMode && (
            <View className="flex flex-row items-center justify-center gap-2 px-5 py-4 mt-2">
              <TouchableOpacity
                onPress={() => router.push("/mentee-documents" as any)}
                className="flex flex-row w-1/2 justify-around items-center rounded-[10px] px-2.5 py-2.5 bg-[#004B87] border border-white/80"
              >
                <Text className="text-white">Documents</Text>
                <Image source={icons.attachment} style={styles.icon} />
              </TouchableOpacity>
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
                label="Profile Info"
                value={isEditMode ? formData.bio : interest?.profileInfo || ""}
                onChangeText={(text) => handleInputChange("bio", text)}
                editable={isEditMode}
              />
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
                    value={isEditMode ? formData.firstName : user.firstName}
                    editable={isEditMode}
                    onChangeText={(text) => handleInputChange("firstName", text)}
                  />
                  <TextInputField
                    label="Last Name"
                    value={isEditMode ? formData.lastName : user.lastName}
                    editable={isEditMode}
                    onChangeText={(text) => handleInputChange("lastName", text)}
                  />
                </View>
                <View style={styles.rowContainer}>
                  <TextInputField
                    label="Phone Number"
                    value={isEditMode ? formData.phoneNumber : interest?.phoneNumber || ""}
                    editable={isEditMode}
                    onChangeText={(text) => handleInputChange("phoneNumber", text)}
                  />
                  <TextInputField label="Email" value={user.email} editable={false} />
                </View>
              </View>
              <View style={styles.divider} />

              {/* Church Information */}
              {(isEditMode ? formData.churches : interest?.churchDetails)?.map((church, idx) => (
                <View key={church.id || idx} className="flex-1 gap-3">
                  <View className="flex-row items-center justify-between gap-12">
                    <Text className="font-[AlbertRegular] text-white text-[14px]">
                      Church - {idx + 1} Information
                    </Text>
                    {isEditMode && (formData.churches?.length || 0) > 1 && (
                      <TouchableOpacity onPress={() => removeChurch(idx)}>
                        <Text className="text-red-400">Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="gap-6 mt-4">
                    <TextInputField
                      label="Church Name"
                      value={church.churchName}
                      editable={isEditMode}
                      onChangeText={(text) => handleInputChange("churches", text, idx, "churchName")}
                    />
                    <View style={styles.rowContainer}>
                      <TextInputField
                        label="Church Phone"
                        value={church.churchPhone || ""}
                        editable={isEditMode}
                        onChangeText={(text) => handleInputChange("churches", text, idx, "churchPhone")}
                      />
                      <TextInputField
                        label="Church Website"
                        value={church.churchWebsite || ""}
                        editable={isEditMode}
                        onChangeText={(text) => handleInputChange("churches", text, idx, "churchWebsite")}
                      />
                    </View>
                    <TextInputField
                      label="Church Address"
                      value={church.churchAddress || ""}
                      editable={isEditMode}
                      onChangeText={(text) => handleInputChange("churches", text, idx, "churchAddress")}
                    />
                    <View style={styles.rowContainer}>
                      <TextInputField
                        label="City"
                        value={church.city || ""}
                        editable={isEditMode}
                        onChangeText={(text) => handleInputChange("churches", text, idx, "city")}
                      />
                      <TextInputField
                        label="State"
                        value={church.state || ""}
                        editable={isEditMode}
                        onChangeText={(text) => handleInputChange("churches", text, idx, "state")}
                      />
                    </View>
                    <View style={styles.rowContainer}>
                      <TextInputField
                        label="Zip Code"
                        value={church.zipCode || ""}
                        editable={isEditMode}
                        onChangeText={(text) => handleInputChange("churches", text, idx, "zipCode")}
                      />
                      <TextInputField
                        label="Country"
                        value={church.country || ""}
                        editable={isEditMode}
                        onChangeText={(text) => handleInputChange("churches", text, idx, "country")}
                      />
                    </View>
                  </View>
                  <View style={styles.divider} className="my-4" />
                </View>
              ))}

              {isEditMode && (
                <Button
                  children="Add Church"
                  buttonClass="mx-auto px-10 rounded-full"
                  onPress={addChurch}
                />
              )}

              <View style={styles.divider} />
              {/* Other Information */}
              <View className="my-2">
                <Text className="font-[AlbertRegular] text-white text-[14px]">
                  Other Information
                </Text>
              </View>

              <View className="gap-6">
                <DropDrawer
                  selectedValues={isEditMode ? [formData.title || ""] : [interest?.title || ""]}
                  setSelectedValues={(vals) => handleInputChange("title", vals[0])}
                  items={titleOptions}
                  placeholder="Select Title"
                  useCircleIndicator={true}
                  editable={isEditMode}
                />
                <View style={styles.rowContainer}>
                  <TextInputField
                    label="Years in Ministry"
                    value={isEditMode ? formData.yearsInMinistry : interest?.yearsInMinistry || ""}
                    onChangeText={(text) => handleInputChange("yearsInMinistry", text)}
                    editable={isEditMode}
                  />
                  <TextInputField
                    label="Conference"
                    value={isEditMode ? formData.conference : interest?.conference || ""}
                    onChangeText={(text) => handleInputChange("conference", text)}
                    editable={isEditMode}
                  />
                </View>
                <TextInputField
                  label="Community Projects"
                  value={isEditMode ? formData.currentCommunityServiceProjects : interest?.currentCommunityProjects || ""}
                  onChangeText={(text) => handleInputChange("currentCommunityServiceProjects", text)}
                  editable={isEditMode}
                />
                <TextArea
                  label="Interests"
                  value={isEditMode ? formData.interests?.join(", ") : interest?.interests?.join(", ") || ""}
                  onChangeText={(text) => handleInputChange("interests", text.split(", ").map(s => s.trim()))}
                  editable={isEditMode}
                />
                <TextArea
                  label="Comments"
                  value={isEditMode ? formData.comments : interest?.comments || ""}
                  onChangeText={(text) => handleInputChange("comments", text)}
                  editable={isEditMode}
                />
              </View>
            </View>
          </View>

          {isEditMode && (
            <View className="flex-row items-center justify-center gap-5 my-10">
              <Button
                children="Cancel"
                labelStyle={{ fontSize: 12, color: "#001FC1", fontWeight: "500" }}
                buttonStyle={{ borderRadius: 10, backgroundColor: "white", width: 87 }}
                onPress={handleCancel}
              />
              <Button
                children={updateProfile.isPending || uploadProfilePicture.isPending ? "Saving..." : "Save"}
                disabled={updateProfile.isPending || uploadProfilePicture.isPending}
                labelStyle={{ fontSize: 12, color: "white", fontWeight: "500" }}
                buttonStyle={{ borderRadius: 10, width: 87 }}
                onPress={handleSavePress}
              />
            </View>
          )}
        </View>
      </ScreenLayout>

      <ConfirmModal
        visible={showConfirmModal}
        title="Save changes?"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmModal(false)}
      />

      <SuccessModal
        visible={showSuccessModal}
        message="Profile updated successfully"
        onClose={() => setShowSuccessModal(false)}
      />
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

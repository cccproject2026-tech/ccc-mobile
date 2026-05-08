import ConfirmModal from '@/components/atom/ConfirmModal';
import SuccessModal from '@/components/atom/SuccessModal';
import {
  Button,
  Header,
  ScreenLayout,
  TextArea,
  TextInput as TextInputField
} from "@/components/build-components";
import { icons } from "@/constants/images";
import { useProfile, useUpdateProfile, useUploadProfilePicture } from "@/hooks/profile/useProfile";
import { ChurchInfo, UpdateProfileData } from "@/types/profile.types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommonCard, GradientBackground, PrimaryButton, SectionHeader } from "@/components/ui/design-system";
import { roadmapTheme } from "@/components/ui/design-system/roadmapTheme";

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

  // Initialize form data when data is loaded or when entering edit mode
  useEffect(() => {
    console.log('apiProfileData', apiProfileData);
    if (apiProfileData?.user && !isFormInitialized) {
      const interests = apiProfileData.interest?.interests || [];
      const interestArray = Array.isArray(interests) ? interests : [interests].filter(Boolean);
      
      setFormData({
        firstName: apiProfileData.user.firstName || '',
        lastName: apiProfileData.user.lastName || '',
        phoneNumber: apiProfileData.interest?.phoneNumber || '',
        churches: apiProfileData.interest?.churchDetails || [],
        title: apiProfileData.interest?.title || '',
        yearsInMinistry: apiProfileData.interest?.yearsInMinistry || '',
        conference: apiProfileData.interest?.conference || '',
        currentCommunityServiceProjects: apiProfileData.interest?.currentCommunityProjects || '',
        interests: interestArray,
        comments: apiProfileData.interest?.comments || '',
        bio: apiProfileData.interest?.profileInfo || '',
      });
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
      const churches = formData.churches || [];
      
      // Validate all church fields are filled for each added church
      for (let i = 0; i < churches.length; i++) {
        const church = churches[i];
        const missingFields = [];
        
        if (!church.churchName?.trim()) missingFields.push("Church Name");
        if (!church.churchPhone?.trim()) missingFields.push("Church Phone");
        if (!church.churchWebsite?.trim()) missingFields.push("Church Website");
        if (!church.churchAddress?.trim()) missingFields.push("Church Address");
        if (!church.city?.trim()) missingFields.push("City");
        if (!church.state?.trim()) missingFields.push("State");
        if (!church.zipCode?.trim()) missingFields.push("Zip Code");
        if (!church.country?.trim()) missingFields.push("Country");

        if (missingFields.length > 0) {
          Alert.alert(
            "Validation Error", 
            `Please fill in all fields for Church ${i + 1}. Missing: ${missingFields.join(", ")}`
          );
          return;
        }
      }

      const validChurches = churches.map(church => {
        // Strip temporary IDs before sending to backend
        const { id, ...churchData } = church;
        if (id && String(id).startsWith('temp-')) {
          return churchData;
        }
        return church;
      });

      if (selectedImageFile) {
        await uploadProfilePicture.mutateAsync(selectedImageFile);
      }

      await updateProfile.mutateAsync({
        ...formData,
        churches: validChurches,
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
      <GradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.stateTitle}>Loading profile...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (isError || !apiProfileData?.user) {
    return (
      <GradientBackground>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Failed to load profile.</Text>
          <Pressable style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]} onPress={() => router.back()}>
            <Text style={styles.ghostBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </GradientBackground>
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
                  {greeting} {user.firstName} {user.lastName}
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
              {/* <View
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
              </View> */}
            </>
          )}

          {!isEditMode && (
            <View style={styles.actionRow}>
              <View style={styles.actionCell}>
                <PrimaryButton
                  label="Documents"
                  onPress={() =>
                    router.push({
                      pathname: "/(mentor)/(tabs)/profile/documents" as any,
                    })
                  }
                  leftIcon={<Ionicons name="document-text-outline" size={18} color="#FFFFFF" />}
                  textColor="#FFFFFF"
                  style={styles.actionPrimary}
                />
              </View>
              <View style={styles.actionCell}>
                <PrimaryButton
                  label="Edit Profile"
                  onPress={handleEditPress}
                  leftIcon={<Ionicons name="create-outline" size={18} color="#FFFFFF" />}
                  textColor="#FFFFFF"
                  style={styles.actionSecondary}
                />
              </View>
            </View>
          )}

          <View className="px-[10px] flex-1 gap-4">
            <View>
              <Text className="font-[AlbertRegular] text-white text-[14px]">
                Profile Information
              </Text>
            </View>
            <View className="relative">
              {isEditMode ? (
                <TextArea
                  label="Profile Info"
                  value={formData.bio}
                  onChangeText={(text) => handleInputChange("bio", text)}
                  editable={true}
                />
              ) : (
                <View style={styles.readOnlyBox}>
                  <Text style={styles.readOnlyLabel}>Profile Info</Text>
                  <Text style={styles.readOnlyValue}>
                    {interest?.profileInfo || ""}
                  </Text>
                </View>
              )}
            </View>

            {/* Detailed Personal Info */}
            <View
              className="gap-4 p-2 pb-10 mt-4 rounded-md"
              style={isEditMode ? styles.personalInfoContainerEdit : styles.personalInfoContainerView}
            >
              <View className="gap-6 mt-2">
                <Text className="font-[AlbertRegular] text-white text-[14px]">
                  Personal Information
                </Text>
                {isEditMode ? (
                  <>
                    <View style={styles.rowContainer}>
                      <TextInputField
                        label="First Name"
                        value={formData.firstName}
                        editable={true}
                        onChangeText={(text) => handleInputChange("firstName", text)}
                      />
                      <TextInputField
                        label="Last Name"
                        value={formData.lastName}
                        editable={true}
                        onChangeText={(text) => handleInputChange("lastName", text)}
                      />
                    </View>
                    <View style={styles.rowContainer}>
                      <TextInputField
                        label="Phone Number"
                        value={formData.phoneNumber}
                        editable={true}
                        onChangeText={(text) => handleInputChange("phoneNumber", text)}
                      />
                      <TextInputField label="Email" value={user.email} editable={false} />
                    </View>
                  </>
                ) : (
                  <View style={styles.readOnlyStack}>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>First Name</Text>
                      <Text style={styles.readOnlyValue}>{user.firstName || ""}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Last Name</Text>
                      <Text style={styles.readOnlyValue}>{user.lastName || ""}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Phone Number</Text>
                      <Text style={styles.readOnlyValue}>{interest?.phoneNumber || ""}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Email</Text>
                      <Text style={styles.readOnlyValue}>{user.email || ""}</Text>
                    </View>
                  </View>
                )}
              </View>
              <View style={styles.divider} />

              {/* Church Information */}
              {(() => {
                const churches = isEditMode ? formData.churches : interest?.churchDetails;
                const churchArray = Array.isArray(churches) ? churches : [];
                
                return churchArray.map((church, idx) => (
                  <View key={church?.id || `church-${idx}`} className="flex-1 gap-3">
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

                    {isEditMode ? (
                      <View className="gap-6 mt-4">
                        <TextInputField
                          label="Church Name *"
                          value={church?.churchName || ""}
                          editable={true}
                          onChangeText={(text) => handleInputChange("churches", text, idx, "churchName")}
                        />
                        <View style={styles.rowContainer}>
                          <TextInputField
                            label="Church Phone *"
                            value={church?.churchPhone || ""}
                            editable={true}
                            onChangeText={(text) => handleInputChange("churches", text, idx, "churchPhone")}
                          />
                          <TextInputField
                            label="Church Website *"
                            value={church?.churchWebsite || ""}
                            editable={true}
                            onChangeText={(text) => handleInputChange("churches", text, idx, "churchWebsite")}
                          />
                        </View>
                        <TextInputField
                          label="Church Address *"
                          value={church?.churchAddress || ""}
                          editable={true}
                          onChangeText={(text) => handleInputChange("churches", text, idx, "churchAddress")}
                        />
                        <View style={styles.rowContainer}>
                          <TextInputField
                            label="City *"
                            value={church?.city || ""}
                            editable={true}
                            onChangeText={(text) => handleInputChange("churches", text, idx, "city")}
                          />
                          <TextInputField
                            label="State *"
                            value={church?.state || ""}
                            editable={true}
                            onChangeText={(text) => handleInputChange("churches", text, idx, "state")}
                          />
                        </View>
                        <View style={styles.rowContainer}>
                          <TextInputField
                            label="Zip Code *"
                            value={church?.zipCode || ""}
                            editable={true}
                            onChangeText={(text) => handleInputChange("churches", text, idx, "zipCode")}
                          />
                          <TextInputField
                            label="Country *"
                            value={church?.country || ""}
                            editable={true}
                            onChangeText={(text) => handleInputChange("churches", text, idx, "country")}
                          />
                        </View>
                      </View>
                    ) : (
                      <View style={styles.readOnlyStack}>
                        <View style={styles.readOnlyField}>
                          <Text style={styles.readOnlyLabel}>Church Name</Text>
                          <Text style={styles.readOnlyValue}>{church?.churchName || ""}</Text>
                        </View>
                        <View style={styles.readOnlyField}>
                          <Text style={styles.readOnlyLabel}>Church Phone</Text>
                          <Text style={styles.readOnlyValue}>{church?.churchPhone || ""}</Text>
                        </View>
                        <View style={styles.readOnlyField}>
                          <Text style={styles.readOnlyLabel}>Church Website</Text>
                          <Text style={styles.readOnlyValue}>{church?.churchWebsite || ""}</Text>
                        </View>
                        <View style={styles.readOnlyField}>
                          <Text style={styles.readOnlyLabel}>Church Address</Text>
                          <Text style={styles.readOnlyValue}>{church?.churchAddress || ""}</Text>
                        </View>
                        <View style={styles.readOnlyField}>
                          <Text style={styles.readOnlyLabel}>City</Text>
                          <Text style={styles.readOnlyValue}>{church?.city || ""}</Text>
                        </View>
                        <View style={styles.readOnlyField}>
                          <Text style={styles.readOnlyLabel}>State</Text>
                          <Text style={styles.readOnlyValue}>{church?.state || ""}</Text>
                        </View>
                        <View style={styles.readOnlyField}>
                          <Text style={styles.readOnlyLabel}>Zip Code</Text>
                          <Text style={styles.readOnlyValue}>{church?.zipCode || ""}</Text>
                        </View>
                        <View style={styles.readOnlyField}>
                          <Text style={styles.readOnlyLabel}>Country</Text>
                          <Text style={styles.readOnlyValue}>{church?.country || ""}</Text>
                        </View>
                      </View>
                    )}
                    {idx < churchArray.length - 1 && (
                      <View style={styles.divider} className="my-4" />
                    )}
                  </View>
                ));
              })()}

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
                {isEditMode ? (
                  <>
                    <View style={styles.rowContainer}>
                      <TextInputField
                        label="Years in Ministry"
                        value={formData.yearsInMinistry}
                        onChangeText={(text) => handleInputChange("yearsInMinistry", text)}
                        editable={true}
                      />
                      <TextInputField
                        label="Conference"
                        value={formData.conference}
                        onChangeText={(text) => handleInputChange("conference", text)}
                        editable={true}
                      />
                    </View>
                    <TextInputField
                      label="Community Projects"
                      value={formData.currentCommunityServiceProjects}
                      onChangeText={(text) => handleInputChange("currentCommunityServiceProjects", text)}
                      editable={true}
                    />
                    <TextArea
                      label="Interests"
                      value={
                        Array.isArray(formData.interests)
                          ? formData.interests.join(", ")
                          : ""
                      }
                      onChangeText={(text) =>
                        handleInputChange(
                          "interests",
                          text.split(", ").map((s: string) => s.trim())
                        )
                      }
                      editable={true}
                    />
                    <TextArea
                      label="Comments"
                      value={formData.comments}
                      onChangeText={(text) => handleInputChange("comments", text)}
                      editable={true}
                    />
                  </>
                ) : (
                  <View style={styles.readOnlyStack}>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Years in Ministry</Text>
                      <Text style={styles.readOnlyValue}>{interest?.yearsInMinistry || ""}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Conference</Text>
                      <Text style={styles.readOnlyValue}>{interest?.conference || ""}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Community Projects</Text>
                      <Text style={styles.readOnlyValue}>{interest?.currentCommunityProjects || ""}</Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Interests</Text>
                      <Text style={styles.readOnlyValue}>
                        {Array.isArray(interest?.interests)
                          ? interest?.interests.join(", ")
                          : ""}
                      </Text>
                    </View>
                    <View style={styles.readOnlyField}>
                      <Text style={styles.readOnlyLabel}>Comments</Text>
                      <Text style={styles.readOnlyValue}>{interest?.comments || ""}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {isEditMode && (
            <View style={styles.editActionsRow}>
              <View style={styles.actionCell}>
                <PrimaryButton
                  label="Cancel"
                  onPress={handleCancel}
                  disabled={updateProfile.isPending || uploadProfilePicture.isPending}
                  textColor="#153C5A"
                  style={styles.editCancelBtn}
                />
              </View>
              <View style={styles.actionCell}>
                <PrimaryButton
                  label={updateProfile.isPending || uploadProfilePicture.isPending ? "Saving..." : "Save"}
                  onPress={handleSavePress}
                  disabled={updateProfile.isPending || uploadProfilePicture.isPending}
                  textColor="#FFFFFF"
                  leftIcon={<Ionicons name="save-outline" size={18} color="#FFFFFF" />}
                  style={styles.editSaveBtn}
                />
              </View>
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
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  stateTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  ghostBtn: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  ghostBtnText: { color: roadmapTheme.textPrimary, fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.88 },

  divider: {
    height: 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 50,
  },
  readOnlyBox: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  readOnlyStack: {
    gap: 12,
  },
  readOnlyField: {
    gap: 4,
  },
  readOnlyLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
  },
  readOnlyValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  personalInfoContainerEdit: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  personalInfoContainerView: {
    borderWidth: 0,
    backgroundColor: "rgba(255,255,255,0.04)",
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

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
  },
  actionCell: { flex: 1 },
  actionPrimary: {
    backgroundColor: "#22C55E",
    borderColor: "rgba(20,83,45,0.35)",
    borderRadius: 14,
  },
  actionSecondary: {
    backgroundColor: roadmapTheme.frostedSurface,
    borderColor: roadmapTheme.frostedBorder,
    borderRadius: 14,
  },

  editActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 22,
  },
  editCancelBtn: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: "rgba(255,255,255,0.32)",
    borderRadius: 14,
  },
  editSaveBtn: {
    backgroundColor: "#22C55E",
    borderColor: "rgba(20,83,45,0.35)",
    borderRadius: 14,
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

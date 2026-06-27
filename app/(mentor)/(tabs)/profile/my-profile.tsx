import ConfirmModal from '@/components/atom/ConfirmModal';
import SuccessModal from '@/components/atom/SuccessModal';
import {
  TextArea,
  TextInput as TextInputField
} from "@/components/build-components";
import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { getAvatarSource } from "@/utils/avatarSource";
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

type PersonalInfoFieldProps = {
  label: string;
  value?: string;
  editable?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address";
  onChangeText?: (text: string) => void;
};

function PersonalInfoField({
  label,
  value,
  editable = true,
  keyboardType = "default",
  onChangeText,
}: PersonalInfoFieldProps) {
  return (
    <View style={styles.personalField}>
      <Text style={styles.personalLabel}>{label}</Text>
      <TextInput
        value={value}
        editable={editable}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="rgba(255,255,255,0.5)"
        style={[styles.personalInput, !editable && styles.personalInputDisabled]}
      />
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  
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

  const handleEditPress = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const profileActions = useMemo(
    () => [
      {
        key: 'documents',
        label: 'Documents',
        icon: 'document-text-outline' as const,
        onPress: () =>
          router.push({
            pathname: '/(mentor)/(tabs)/profile/documents' as any,
          }),
      },
      {
        key: 'notes',
        label: 'Notes',
        icon: 'create-outline' as const,
        onPress: () =>
          router.push({
            pathname: '/(mentor)/(tabs)/profile/notes' as any,
          }),
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: 'pencil-outline' as const,
        onPress: handleEditPress,
      },
    ],
    [handleEditPress, router],
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {profileActions.map((action) => (
        <TouchableOpacity
          key={action.key}
          style={styles.actionTile}
          activeOpacity={0.85}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name={action.icon} size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
    setIsFormInitialized(false);
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
      <GradientBackground decorativeOrbs>
        <TopBar role="mentor" showUserName />
        <SectionHeader
          title={isEditMode ? "Edit Profile" : "Profile"}
          subtitle={isEditMode ? "Update your mentor profile details." : "Manage your profile, documents, and ministry details."}
          showBackButton
          alwaysShowBack
          showDivider
          variant="compact"
          onBackPress={() => (isEditMode ? handleCancel() : router.back())}
          style={styles.pageHeader}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 28 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CommonCard style={styles.heroCard}>
            <View style={styles.avatarWrap}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : getAvatarSource(apiProfileData?.user)
                }
                resizeMode="cover"
                style={styles.avatarImage}
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
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroGreeting}>
                  {greeting} {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.heroRole}>
                  {interest?.title || "Mentor"}
                </Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                  </View>
                  <Text style={styles.progressValue}>{progressPercentage}%</Text>
                </View>
              </View>
            )}
          </CommonCard>

          {!isEditMode && (
            <CommonCard style={styles.actionCard}>
              {renderActionButtons()}
            </CommonCard>
          )}

          <View style={styles.contentStack}>
            <CommonCard style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
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
            </CommonCard>

            {}
            <CommonCard style={styles.sectionCard}>
              <View style={styles.sectionGroup}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                {isEditMode ? (
                  <View style={styles.personalEditStack}>
                    <View style={styles.rowContainer}>
                      <PersonalInfoField
                        label="First Name"
                        value={formData.firstName}
                        editable={true}
                        onChangeText={(text) => handleInputChange("firstName", text)}
                      />
                      <PersonalInfoField
                        label="Last Name"
                        value={formData.lastName}
                        editable={true}
                        onChangeText={(text) => handleInputChange("lastName", text)}
                      />
                    </View>
                    <PersonalInfoField
                      label="Phone Number"
                      value={formData.phoneNumber}
                      editable={true}
                      keyboardType="phone-pad"
                      onChangeText={(text) => handleInputChange("phoneNumber", text)}
                    />
                    <PersonalInfoField
                      label="Email"
                      value={user.email}
                      editable={false}
                      keyboardType="email-address"
                    />
                  </View>
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

              {}
              {(() => {
                const churches = isEditMode ? formData.churches : interest?.churchDetails;
                const churchArray = Array.isArray(churches) ? churches : [];
                
                return churchArray.map((church, idx) => (
                  <View key={church?.id || `church-${idx}`} style={styles.churchGroup}>
                    <View style={styles.churchHeader}>
                      <Text style={styles.sectionTitle}>
                        Church - {idx + 1} Information
                      </Text>
                      {isEditMode && (formData.churches?.length || 0) > 1 && (
                        <TouchableOpacity style={styles.removePill} onPress={() => removeChurch(idx)}>
                          <Text style={styles.removePillText}>Remove</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {isEditMode ? (
                      <View style={styles.editStack}>
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
                      <View style={styles.divider} />
                    )}
                  </View>
                ));
              })()}

              {isEditMode && (
                <PrimaryButton
                  label="Add Church"
                  onPress={addChurch}
                  textColor="#FFFFFF"
                  leftIcon={<Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />}
                  style={styles.addChurchButton}
                />
              )}

              <View style={styles.divider} />
              {}
              <Text style={styles.sectionTitle}>Other Information</Text>

              <View style={styles.editStack}>
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
            </CommonCard>
          </View>

          {isEditMode && (
            <View style={styles.editActionsRow}>
              <View style={styles.actionCell}>
                <PrimaryButton
                  label="Cancel"
                  onPress={handleCancel}
                  disabled={updateProfile.isPending || uploadProfilePicture.isPending}
                  textColor="#FFFFFF"
                  leftIcon={<Ionicons name="close-outline" size={18} color="#FFFFFF" />}
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
        </ScrollView>
      </GradientBackground>

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
  pageHeader: {
    marginBottom: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  heroCard: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 14,
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.22)",
  },
  heroTextBlock: {
    width: "100%",
    alignItems: "center",
    gap: 5,
  },
  heroGreeting: {
    color: roadmapTheme.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  heroRole: {
    color: roadmapTheme.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  progressRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  progressLabel: {
    color: roadmapTheme.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: roadmapTheme.accentMint,
  },
  progressValue: {
    color: roadmapTheme.textPrimary,
    fontSize: 13,
    fontWeight: "800",
  },
  contentStack: {
    gap: 14,
  },
  sectionCard: {
    padding: 16,
  },
  sectionGroup: {
    gap: 12,
  },
  sectionTitle: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.1,
  },
  churchGroup: {
    gap: 12,
  },
  churchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  editStack: {
    gap: 14,
  },
  personalEditStack: {
    gap: 12,
  },
  personalField: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  personalLabel: {
    color: roadmapTheme.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 2,
  },
  personalInput: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: "rgba(255,255,255,0.06)",
    color: roadmapTheme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  personalInputDisabled: {
    opacity: 0.82,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  removePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(248,113,113,0.16)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.28)",
  },
  removePillText: {
    color: "#FECACA",
    fontSize: 12,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: roadmapTheme.divider,
    marginVertical: 16,
  },
  readOnlyBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  readOnlyStack: {
    gap: 10,
  },
  readOnlyField: {
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  readOnlyLabel: {
    fontSize: 12.5,
    color: roadmapTheme.textSubtle,
    fontWeight: "800",
  },
  readOnlyValue: {
    color: roadmapTheme.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
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

  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingVertical: 4,
  },
  actionCard: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  actionTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 0,
    paddingHorizontal: 4,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: roadmapTheme.textPrimary,
    textAlign: 'center',
  },

  editActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 12,
    marginTop: 2,
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  editCancelBtn: {
    minHeight: 48,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: roadmapTheme.frostedBorderStrong,
    borderRadius: 14,
    elevation: 0,
    shadowOpacity: 0,
  },
  editSaveBtn: {
    minHeight: 48,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderColor: roadmapTheme.frostedBorderStrong,
    borderRadius: 14,
    elevation: 0,
    shadowOpacity: 0,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginVertical: 0,
  },
  profileEditIcon: {
    position: "absolute",
    bottom: 0,
    right: -2,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderRadius: 12,
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
  },
  addChurchButton: {
    alignSelf: "center",
    width: 190,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderColor: roadmapTheme.frostedBorderStrong,
    borderRadius: 14,
    elevation: 0,
    shadowOpacity: 0,
  },
});

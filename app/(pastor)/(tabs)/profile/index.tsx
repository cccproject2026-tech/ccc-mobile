import ConfirmModal from '@/components/atom/ConfirmModal';
import SuccessModal from '@/components/atom/SuccessModal';
import { ChurchInfoSection, OtherInfoSection, PersonalInfoSection, ProfileInfoSection } from '@/components/director/ProfileSection';

import TopBar from '@/components/director/TopBar';
import {
  CommonCard,
  GradientBackground,
  PrimaryButton,
  SectionHeader,
  roadmapTheme,
} from '@/components/ui/design-system';
import { icons } from '@/constants/images';
import { useProfile, useUpdateProfile, useUploadProfilePicture } from '@/hooks/profile/useProfile';
import { UpdateProfileData } from '@/types';
import { ChurchInfo } from '@/types/profile.types';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { data: profileData, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadProfilePicture = useUploadProfilePicture();

  // Local UI state
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<any>(null);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false); // NEW: Track initialization

  // Form state (only when editing)
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

  // FIXED: Only initialize form data ONCE when entering edit mode
  useEffect(() => {
    if (isEditing && !isFormInitialized && profileData?.user) {
      console.log('📝 Initializing form data...');
      setFormData({
        firstName: profileData.user.firstName || '',
        lastName: profileData.user.lastName || '',
        phoneNumber: profileData.interest?.phoneNumber || '',
        churches: profileData.interest?.churchDetails || [],
        title: profileData.interest?.title || '',
        yearsInMinistry: profileData.interest?.yearsInMinistry || '',
        conference: profileData.interest?.conference || '',
        currentCommunityServiceProjects:
          profileData.interest?.currentCommunityProjects || '',
        interests: profileData.interest?.interests || [],
        comments: profileData.interest?.comments || '',
        bio: profileData.interest?.profileInfo || '',
      });
      setProfileImage(profileData.user.profilePicture || null);
      setSelectedImageFile(null);
      setIsFormInitialized(true); // Mark as initialized
      console.log('✅ Form initialized');
    }

    // Reset initialization flag when exiting edit mode
    if (!isEditing && isFormInitialized) {
      setIsFormInitialized(false);
    }
  }, [isEditing, isFormInitialized, profileData?.user?.id]); // Only depend on isEditing and user ID

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    return profileData?.progress?.overallProgress || 0;
  }, [profileData?.progress?.overallProgress]); // FIXED: Use specific property

  // Get greeting based on time
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // ============= HANDLERS =============
  const updateField = useCallback(
    (field: keyof UpdateProfileData, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const updateChurch = useCallback((index: number, field: keyof ChurchInfo, value: string) => {
    setFormData((prev) => {
      const churches = [...(prev.churches || [])];
      const validFields: (keyof ChurchInfo)[] = [
        'churchName',
        'churchPhone',
        'churchAddress',
        'city',
        'state',
        'zipCode',
        'country',
        'churchWebsite',
      ];

      if (validFields.includes(field)) {
        churches[index] = { ...churches[index], [field]: value };
      }
      return { ...prev, churches };
    });
  }, []);

  const pickImage = useCallback(async () => {
    try {
      console.log('📸 Starting image picker...');

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        console.log('❌ Permission denied');
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to upload a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Permission granted, launching picker...');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('📷 Image picker result:', result);

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        console.log('✅ Image selected:', asset.uri);

        setProfileImage(asset.uri);

        const fileObj = {
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg', // FIXED: Use mimeType from asset
          fileName: asset.fileName || `profile-${Date.now()}.jpg`,
        };

        console.log('💾 File object created:', fileObj);
        setSelectedImageFile(fileObj);
      } else {
        console.log('ℹ️ Image selection cancelled');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, []);

  const addChurch = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      churches: [
        ...(prev.churches || []),
        {
          ...CLEAN_CHURCH_TEMPLATE,
          id: `temp-${Date.now()}`,
        },
      ],
    }));
  }, []);

  const removeChurch = useCallback(
    (index: number) => {
      if ((formData.churches?.length || 0) > 1) {
        setFormData((prev) => ({
          ...prev,
          churches: prev.churches?.filter((_, i) => i !== index),
        }));
      }
    },
    [formData.churches]
  );

  const handleEditPress = useCallback(() => {
    console.log('✏️ Edit button pressed');
    setShowSuccessModal(false);
    setShowConfirmModal(false);
    setIsEditing(true);
  }, []);

  const handleSavePress = useCallback(() => {
    console.log('💾 Save button pressed');
    setShowConfirmModal(true);
  }, []);

  const sanitizeChurches = (
    churches: ChurchInfo[] | undefined
  ): ChurchInfo[] => {
    if (!churches || churches.length === 0) return [];

    return churches.map((church) => ({
      churchName: church.churchName || '',
      churchPhone: church.churchPhone || '',
      churchAddress: church.churchAddress || '',
      city: church.city || '',
      state: church.state || '',
      zipCode: church.zipCode || '',
      country: church.country || '',
      churchWebsite: church.churchWebsite || '',
    }));
  };

  const handleConfirmSave = useCallback(async () => {
    console.log('🔄 Starting save process...');
    console.log('📸 Selected image file:', selectedImageFile);
    setShowConfirmModal(false);

    try {
      // Step 1: Upload profile picture first if a new one was selected
      if (selectedImageFile) {
        console.log('📤 Uploading profile picture...');
        await uploadProfilePicture.mutateAsync(selectedImageFile);
        console.log('✅ Profile picture uploaded successfully');
      } else {
        console.log('ℹ️ No new profile picture to upload');
      }

      // Step 2: Update other profile fields
      const cleanedChurches = sanitizeChurches(formData.churches);

      const updateData: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        churches: cleanedChurches,
        title: formData.title,
        yearsInMinistry: formData.yearsInMinistry,
        conference: formData.conference,
        currentCommunityServiceProjects:
          formData.currentCommunityServiceProjects,
        interests: formData.interests,
        comments: formData.comments,
        bio: formData.bio,
      };

      console.log('📤 Submitting profile update:', updateData);

      await updateProfile.mutateAsync(updateData);

      setIsEditing(false);
      setSelectedImageFile(null);

      setTimeout(() => {
        setShowSuccessModal(true);
      }, 100);

      console.log('✅ Profile saved successfully');
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      Alert.alert(
        'Update Failed',
        error?.response?.data?.message ||
        error.message ||
        'Failed to update profile. Please try again.'
      );
    }
  }, [formData, selectedImageFile, updateProfile, uploadProfilePicture]);

  const handleCancelSave = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleCancel = useCallback(() => {
    console.log('❌ Cancel button pressed');
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setIsEditing(false);
    setSelectedImageFile(null);
    setIsFormInitialized(false); // Reset initialization flag
    if (profileData?.user) {
      setFormData({
        firstName: profileData.user.firstName || '',
        lastName: profileData.user.lastName || '',
        phoneNumber: profileData.interest?.phoneNumber || '',
        churches: profileData.interest?.churchDetails || [],
        title: profileData.interest?.title || '',
        yearsInMinistry: profileData.interest?.yearsInMinistry || '',
        conference: profileData.interest?.conference || '',
        currentCommunityServiceProjects:
          profileData.interest?.currentCommunityProjects || '',
        interests: profileData.interest?.interests || [],
        comments: profileData.interest?.comments || '',
        bio: profileData.interest?.profileInfo || '',
      });
      setProfileImage(profileData.user.profilePicture || null);
    }
  }, [profileData]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const handleTitleSelect = useCallback(
    (option: string) => {
      updateField('title', option);
      setShowTitleDropdown(false);
    },
    [updateField]
  );

  // ============= RENDER FUNCTIONS =============
  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      <Image
        source={
          profileImage
            ? { uri: profileImage }
            : profileData?.user?.profilePicture
              ? { uri: profileData.user.profilePicture }
              : icons.myProfile
        }
        style={styles.avatarImage}
      />
      {isEditing && (
        <TouchableOpacity
          style={styles.editAvatarBadge}
          onPress={() => {
            console.log('🖼️ Edit avatar button pressed');
            pickImage();
          }}
        >
          <Image source={icons.edit} style={styles.editIcon} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <SectionHeader
      title={isEditing ? 'Edit Profile' : 'My Profile'}
      subtitle={isEditing ? 'Update your profile and ministry details.' : 'Manage your profile, documents, and notes.'}
      showBackButton
      alwaysShowBack
      showDivider
      variant="compact"
      onBackPress={() => (isEditing ? handleCancel() : router.back())}
      style={styles.headerContainer}
    />
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressLabel}>Progress</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
      </View>
      <Text style={styles.progressText}>{progressPercentage}%</Text>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <View style={styles.actionButtonCell}>
        <PrimaryButton
          label="Documents"
          style={styles.actionButton}
          onPress={() => router.push('/(pastor)/(tabs)/profile/documents' as any)}
          textColor="#FFFFFF"
          leftIcon={<Ionicons name="document-text-outline" size={18} color="#FFFFFF" />}
        />
      </View>
      <View style={styles.actionButtonCell}>
        <PrimaryButton
          label="Notes"
          style={styles.actionButton}
          onPress={() => router.push('/(pastor)/(tabs)/profile/notes' as any)}
          textColor="#FFFFFF"
          leftIcon={<Ionicons name="create-outline" size={18} color="#FFFFFF" />}
        />
      </View>
      <View style={styles.actionButtonCell}>
        <PrimaryButton
          label="Edit"
          style={styles.actionButton}
          onPress={handleEditPress}
          textColor="#FFFFFF"
          leftIcon={<Ionicons name="person-circle-outline" size={18} color="#FFFFFF" />}
        />
      </View>
    </View>
  );

  const renderEditActions = () => (
    <View style={styles.editActions}>
      <PrimaryButton
        label="Cancel"
        style={styles.cancelButton}
        onPress={handleCancel}
        disabled={updateProfile.isPending || uploadProfilePicture.isPending}
        textColor="#FFFFFF"
        leftIcon={<Ionicons name="close-outline" size={18} color="#FFFFFF" />}
      />
      <PrimaryButton
        label={
          uploadProfilePicture.isPending || updateProfile.isPending
            ? 'Saving...'
            : 'Save'
        }
        style={styles.saveButton}
        onPress={handleSavePress}
        disabled={updateProfile.isPending || uploadProfilePicture.isPending}
        textColor="#FFFFFF"
        leftIcon={<Ionicons name="save-outline" size={18} color="#FFFFFF" />}
      />
    </View>
  );

  // ============= LOADING & ERROR STATES =============
  if (isLoading) {
    return (
      <GradientBackground decorativeOrbs style={styles.container}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.centerStateText}>Loading profile...</Text>
        </View>
      </GradientBackground>
    );
  }

  if (isError || !profileData?.user) {
    return (
      <GradientBackground decorativeOrbs style={styles.container}>
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline-outline" size={40} color="rgba(255,255,255,0.45)" />
          <Text style={styles.centerStateText}>
            Failed to load profile data. Please try again.
          </Text>
          <PrimaryButton
            label="Go Back"
            onPress={() => router.back()}
            style={styles.centerStateButton}
          />
        </View>
      </GradientBackground>
    );
  }


  console.log('👤 Rendering profile for:', profileData.user);
  console.log('📝 Profile Image:', profileImage);
  // ============= MAIN RENDER =============
  return (
    <GradientBackground decorativeOrbs style={styles.container}>
      <TopBar role="pastor" />
      {renderHeader()}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        {/* VIEW MODE */}
        {!isEditing && (
          <>
            <CommonCard style={styles.profileHeader}>
              {renderAvatar()}
              <Text style={styles.greeting}>
                {greeting} {profileData.user.firstName}{' '}
                {profileData.user.lastName}
              </Text>
              <Text style={styles.role}>
                {profileData.interest?.title || 'Pastor'}
              </Text>

              {renderProgressBar()}
            </CommonCard>
            <CommonCard style={styles.actionCard}>
              {renderActionButtons()}
            </CommonCard>

            <CommonCard style={styles.mainContentBox}>
              <ProfileInfoSection
                isEditing={false}
                profileData={profileData}
                formData={formData}
                onUpdateField={updateField}
                onPickImage={pickImage}
                profileImage={profileData.user.profilePicture as string}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
              />

              <PersonalInfoSection
                isEditing={false}
                profileData={profileData}
                formData={formData}
                onUpdateField={updateField}
                onPickImage={pickImage}
                profileImage={profileImage}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
              />

              <ChurchInfoSection
                isEditing={false}
                profileData={profileData}
                formData={formData}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onPickImage={pickImage}
                profileImage={profileImage}
                onUpdateField={updateField}
              />

              <OtherInfoSection
                isEditing={false}
                profileData={profileData}
                formData={formData}
                showTitleDropdown={showTitleDropdown}
                onUpdateField={updateField}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                onPickImage={pickImage}
                profileImage={profileImage}
              />
            </CommonCard>
          </>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <>
            <CommonCard style={styles.editProfileHeader}>{renderAvatar()}</CommonCard>

            <CommonCard style={styles.mainContentBox}>
              <ProfileInfoSection
                isEditing={true}
                profileData={profileData}
                formData={formData}
                onUpdateField={updateField}
                onPickImage={pickImage}
                profileImage={profileImage}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
              />

              <PersonalInfoSection
                isEditing={true}
                profileData={profileData}
                formData={formData}
                onUpdateField={updateField}
                onPickImage={pickImage}
                profileImage={profileImage}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
              />

              <ChurchInfoSection
                isEditing={true}
                profileData={profileData}
                formData={formData}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                showTitleDropdown={showTitleDropdown}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onPickImage={pickImage}
                profileImage={profileImage}
                onUpdateField={updateField}
              />

              <OtherInfoSection
                isEditing={true}
                profileData={profileData}
                formData={formData}
                showTitleDropdown={showTitleDropdown}
                onUpdateField={updateField}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                onPickImage={pickImage}
                profileImage={profileImage}
              />
            </CommonCard>

            {renderEditActions()}
          </>
        )}
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>

      {/* MODALS */}
      <ConfirmModal
        visible={showConfirmModal}
        title="Are you sure you want to save changes?"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      <SuccessModal
        visible={showSuccessModal}
        message="Profile Updated Successfully"
        onClose={handleSuccessModalClose}
      />
    </GradientBackground>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  centerStateText: {
    color: roadmapTheme.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  centerStateButton: {
    marginTop: 8,
    width: 180,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },

  // Header
  headerContainer: {
    marginBottom: 2,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginTop: 2,
  },
  editProfileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: roadmapTheme.textPrimary,
    marginBottom: 5,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  role: {
    fontSize: 14,
    color: roadmapTheme.textMuted,
    fontWeight: '600',
  },

  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 18,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: roadmapTheme.textMuted,
  },
  progressBarContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: roadmapTheme.accentMint,
    height: 8,
    borderRadius: 999,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '800',
    color: roadmapTheme.textPrimary,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionCard: {
    padding: 10,
  },
  actionButtonCell: {
    flex: 1,
    minWidth: 0,
  },
  actionButton: {
    minHeight: 46,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderColor: roadmapTheme.frostedBorderStrong,
    elevation: 0,
    shadowOpacity: 0,
  },

  // Sections

  mainContentBox: {
    padding: 16,
  },

  // Edit Actions
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
    width: '100%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: roadmapTheme.frostedSurface,
    borderWidth: 1,
    borderColor: roadmapTheme.frostedBorder,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: roadmapTheme.frostedBorderStrong,
    borderRadius: 14,
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: roadmapTheme.frostedSurfaceStrong,
    borderColor: roadmapTheme.frostedBorderStrong,
    borderRadius: 14,
    elevation: 0,
    shadowOpacity: 0,
  },

  // Icons
  editIcon: {
    width: 18,
    height: 18,
  },
  smallIcon: {
    width: 20,
    height: 20,
  },
});

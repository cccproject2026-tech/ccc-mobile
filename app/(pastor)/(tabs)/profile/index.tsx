import ConfirmModal from '@/components/atom/ConfirmModal';
import SuccessModal from '@/components/atom/SuccessModal';
import { ChurchInfoSection, OtherInfoSection, PersonalInfoSection, ProfileInfoSection } from '@/components/director/ProfileSection';

import TopBar from '@/components/director/TopBar';
import { Colors } from '@/constants/Colors';
import { icons } from '@/constants/images';
import { useProfile, useUpdateProfile, useUploadProfilePicture } from '@/hooks/profile/useProfile';
import { UpdateProfileData } from '@/types';
import { ChurchInfo } from '@/types/profile.types';
import { getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
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
    <TouchableOpacity
      onPress={() => (isEditing ? handleCancel() : router.back())}
      style={styles.headerContainer}
    >
      <Ionicons name="chevron-back" size={28} color="#fff" />
      <Text style={styles.headerTitle}>
        {isEditing ? 'Edit Profile' : 'My Profile'}
      </Text>
    </TouchableOpacity>
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
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/profile/documents' as any)}
      >
        <Text style={styles.actionButtonText}>Documents</Text>
        <Image source={icons.attachment} style={styles.smallIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleEditPress}
      >
        <Text style={styles.actionButtonText}>Edit Profile</Text>
        <Image source={icons.edit} style={styles.smallIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderEditActions = () => (
    <View style={styles.editActions}>
      <TouchableOpacity
        style={[styles.actionButton2, styles.cancelButton]}
        onPress={handleCancel}
        disabled={updateProfile.isPending || uploadProfilePicture.isPending}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton2, styles.saveButton]}
        onPress={handleSavePress}
        disabled={updateProfile.isPending || uploadProfilePicture.isPending}
      >
        <Text style={styles.saveButtonText}>
          {uploadProfilePicture.isPending || updateProfile.isPending
            ? 'Saving...'
            : 'Save'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ============= LOADING & ERROR STATES =============
  if (isLoading) {
    return (
      <LinearGradient
        colors={['#176192', '#1D548D', '#264387']}
        style={styles.container}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (isError || !profileData?.user) {
    return (
      <LinearGradient
        colors={['#176192', '#1D548D', '#264387']}
        style={styles.container}
      >
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
            Failed to load profile data. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              marginTop: 20,
              padding: 12,
              backgroundColor: Colors.customBlueOne,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }


  console.log('👤 Rendering profile for:', profileData.user);
  console.log('📝 Profile Image:', profileImage);
  // ============= MAIN RENDER =============
  return (
    <LinearGradient
      colors={['#176192', '#1D548D', '#264387']}
      style={styles.container}
    >
      <TopBar role="pastor" />
      {renderHeader()}

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* VIEW MODE */}
        {!isEditing && (
          <>
            <View style={styles.profileHeader}>
              {renderAvatar()}
              <Text style={styles.greeting}>
                {greeting} {profileData.user.firstName}{' '}
                {profileData.user.lastName}
              </Text>
              <Text style={styles.role}>
                {profileData.interest?.title || 'Pastor'}
              </Text>
            </View>

            {renderProgressBar()}
            {renderActionButtons()}

            <View style={styles.mainContentBox}>
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
            </View>
          </>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <>
            <View style={styles.editProfileHeader}>{renderAvatar()}</View>

            <View style={styles.mainContentBox}>
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
            </View>

            {renderEditActions()}
          </>
        )}
      </KeyboardAwareScrollView>

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
    </LinearGradient>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomStartRadius: 50,
    borderBottomEndRadius: 50,
    paddingBottom: 10,
  },
  editProfileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 5,
    backgroundColor: '#233A6F82',
    borderWidth: 1,
    borderColor: '#233A6F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },

  // Progress Bar
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 72,
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  progressBarContainer: {
    flex: 1,
    backgroundColor: '#182c5b',
    height: 8,
    borderRadius: 4,
  },
  progressBar: {
    backgroundColor: '#fff',
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#14517D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Sections

  mainContentBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },

  // Edit Actions
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: getSpacing(24),
    marginBottom: 24,
    maxWidth: '50%',
    alignSelf: 'center',
  },
  actionButton2: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#1a5b77',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: 'rgba(30, 54, 111, 1)',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

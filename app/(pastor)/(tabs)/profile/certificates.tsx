// app/(director)/certificate.tsx
import { Button } from '@/components/atom/buttons';
import ConfirmModal from '@/components/atom/ConfirmModal';
import SuccessModal from '@/components/atom/SuccessModal';
import {
  ChurchInfoSection,
  OtherInfoSection,
  PersonalInfoSection,
  ProfileInfoSection,
} from '@/components/director/ProfileSection';
import TopBar from '@/components/director/TopBar';
import { Colors } from '@/constants/Colors';
import { customColors } from '@/constants/config/customColors';
import { icons } from '@/constants/images';
import { useProfile, useUpdateProfile } from '@/hooks/profile/useProfile';
import { UpdateProfileData } from '@/types';
import { ChurchInfo } from '@/types/profile.types';
import { getFontSize, getSpacing, isAndroid } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Certificate() {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  // Fetch actual profile data from stores
  const { data: profileData, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();

  // Local UI state
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  // Initialize form data when profile loads or when entering edit mode
  useEffect(() => {
    if (profileData?.user && isEditMode) {
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
  }, [isEditMode, profileData]);

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

  const addChurch = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      churches: [
        ...(prev.churches || []),
        {
          churchName: '',
          churchPhone: '',
          churchAddress: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          churchWebsite: '',
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

  const pickImage = useCallback(async () => {
    Alert.alert('Change Profile Picture', 'Choose an option', [
      {
        text: 'Camera',
        onPress: () => {
          Alert.alert('Camera', 'Camera functionality would open here');
        },
      },
      {
        text: 'Photo Library',
        onPress: () => {
          Alert.alert('Photo Library', 'Photo library would open here');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
    setShowConfirmModal(false);

    try {
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
        avatar: profileImage || undefined,
      };

      console.log('📤 Submitting cleaned profile update:', updateData);

      await updateProfile.mutateAsync(updateData);

      setIsEditMode(false);

      setTimeout(() => {
        setShowSuccessModal(true);
      }, 100);

      console.log('✅ Profile saved and UI updated successfully');
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      Alert.alert(
        'Update Failed',
        error?.response?.data?.message ||
        error.message ||
        'Failed to update profile. Please try again.'
      );
    }
  }, [formData, profileImage, updateProfile]);

  const handleCancelSave = useCallback(() => {
    setShowConfirmModal(false);
  }, []);


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

  // ============= LOADING & ERROR STATES =============
  if (isLoading) {
    return (
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
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
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.container}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
            Failed to load profile data. Please try again.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // ============= MAIN RENDER =============
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
        style={styles.container}
      >
        <View style={{ flex: 1 }}>
          <TopBar role="director" />
          {/* <Header
            title={`${profileData.user.firstName} ${profileData.user.lastName}`}
            subTitle="Mentor > John Doe > Mentee > Profile"
            hideSearchBar={true}
          /> */}
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginRight: getSpacing(8) }}
              >
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>

              <View style={{ flex: 1, marginRight: getSpacing(8) }}>
                <Text
                  style={{
                    fontSize: isAndroid ? getFontSize(18) : getFontSize(15),
                    fontWeight: '700',
                    lineHeight: getFontSize(18),
                    color: '#FFFFFF',
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {profileData.user.firstName} {profileData.user.lastName}
                </Text>
                <Text
                  style={{
                    marginTop: getSpacing(4),
                    fontSize: getFontSize(12),
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Mentor {'>'} John Doe {'>'} Mentee {'>'} Profile
                </Text>
              </View>
            </View>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: bottom + 20 }}
          >
            {/* Profile Header Section */}
            <View style={styles.profileHeaderSection}>
              <LinearGradient
                colors={[
                  customColors.lightBlueGradientFour,
                  customColors.darkBlueGradientFour,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              >
                <Image
                  source={
                    profileImage ? { uri: profileImage } : icons.dummyUser
                  }
                  style={styles.profileImage}
                />
              </LinearGradient>

              <View style={styles.profileNameSection}>
                <Text style={styles.profileName}>
                  {profileData.user.firstName} {profileData.user.lastName}
                </Text>
                <Text style={styles.profileTitle}>
                  {profileData.interest?.title || 'Professional'}
                </Text>
                <View style={styles.contactIconsContainer}>
                  <TouchableOpacity>
                    <Image source={icons.phone} style={styles.contactIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image source={icons.message} style={styles.contactIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image source={icons.mail} style={styles.contactIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Image
                      source={icons.whatsapp}
                      style={styles.contactIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Download Certificate Button */}
            <LinearGradient
              colors={['#21B6E9', '#B83AF3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButtonBorder}
            >
              <View style={styles.downloadButtonContainer}>
                <Image
                  source={icons.gradientDownload}
                  style={styles.buttonIcon}
                />
                <Text style={styles.downloadButtonText}>Download Certificate</Text>
                <View style={styles.badgeNumber}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Mentor Invitation */}
            <LinearGradient
              colors={['#21B6E9', '#B83AF3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButtonBorder}
            >
              <View style={styles.invitationContainer}>
                <Text style={styles.invitationText}>
                  You have been invited as a Field Mentor.
                </Text>
                <View style={styles.invitationButtonsRow}>
                  <Button
                    title="Not Interested"
                    type="cancel"
                    style={{ width: '50%' }}
                    onPress={() => { }}
                  />
                  <Button
                    title="Accept"
                    type="submit"
                    style={{ width: '50%' }}
                    onPress={() => { }}
                  />
                </View>
              </View>
            </LinearGradient>

            <View style={styles.divider} />

            {/* Profile Sections Using Reusable Components */}
            <View style={styles.profileSectionsContainer}>
              <ProfileInfoSection
                isEditing={isEditMode}
                profileData={profileData}
                formData={formData}
                showTitleDropdown={showTitleDropdown}
                onUpdateField={updateField}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                onPickImage={pickImage}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                profileImage={profileImage}
              />

              <PersonalInfoSection
                isEditing={isEditMode}
                profileData={profileData}
                formData={formData}
                showTitleDropdown={showTitleDropdown}
                onUpdateField={updateField}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                onPickImage={pickImage}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                profileImage={profileImage}
              />

              <ChurchInfoSection
                isEditing={isEditMode}
                profileData={profileData}
                formData={formData}
                showTitleDropdown={showTitleDropdown}
                onUpdateField={updateField}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                onPickImage={pickImage}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                profileImage={profileImage}
              />

              <OtherInfoSection
                isEditing={isEditMode}
                profileData={profileData}
                formData={formData}
                showTitleDropdown={showTitleDropdown}
                onUpdateField={updateField}
                onUpdateChurch={updateChurch}
                onAddChurch={addChurch}
                onRemoveChurch={removeChurch}
                onPickImage={pickImage}
                onTitleSelect={handleTitleSelect}
                onToggleTitleDropdown={setShowTitleDropdown}
                profileImage={profileImage}
              />
            </View>

          </ScrollView>
        </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeaderSection: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 999999,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileNameSection: {
    alignItems: 'flex-start',
    gap: 8,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#fff',
  },
  profileTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing(8),
    paddingVertical: getSpacing(16),
    marginBottom: getSpacing(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: getSpacing(12),
  },
  contactIconsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  contactIcon: {
    width: 20,
    height: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  gradientButtonBorder: {
    padding: 2,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  downloadButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: customColors.lightBlueGradientOne,
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  buttonIcon: {
    width: 20,
    height: 20,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'AlbertSans-Medium',
  },
  badgeNumber: {
    backgroundColor: '#fff',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  invitationContainer: {
    backgroundColor: customColors.lightBlueGradientOne,
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 16,
    gap: 12,
  },
  invitationText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontFamily: 'AlbertSans-Medium',
  },
  invitationButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  profileSectionsContainer: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  editProfileButton: {
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(30, 54, 111, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
    maxWidth: '60%',
    alignSelf: 'center',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
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
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

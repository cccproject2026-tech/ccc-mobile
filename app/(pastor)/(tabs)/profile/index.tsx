import ConfirmModal from '@/components/atom/ConfirmModal';
import SuccessModal from '@/components/atom/SuccessModal';
import TopBar from '@/components/director/TopBar';
import { Colors } from '@/constants/Colors';
import { icons } from '@/constants/images';
import { useProfile, useUpdateProfile } from '@/hooks/profile/useProfile';
import { TITLE_OPTIONS } from '@/lib/profile/mock';
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
  TextInput,
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

  // Local UI state
  const [isEditing, setIsEditing] = useState(false);
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
    if (profileData?.user && isEditing) {
      setFormData({
        firstName: profileData.user.firstName || '',
        lastName: profileData.user.lastName || '',
        phoneNumber: profileData.interest?.phoneNumber || '',
        churches: profileData.interest?.churchDetails || [],
        title: profileData.interest?.title || '',
        yearsInMinistry: profileData.interest?.yearsInMinistry || '',
        conference: profileData.interest?.conference || '',
        currentCommunityServiceProjects: profileData.interest?.currentCommunityProjects || '',
        interests: profileData.interest?.interests || [],
        comments: profileData.interest?.comments || '',
        bio: profileData.interest?.profileInfo || '',
      });
      setProfileImage(profileData.user.profilePicture || null);
    }
  }, [isEditing, profileData]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    return profileData?.progress?.percentage || 0;
  }, [profileData?.progress]);

  // Get greeting based on time
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // ============= HANDLERS =============
  const updateField = useCallback((field: keyof UpdateProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateChurch = useCallback((index: number, field: keyof ChurchInfo, value: string) => {
    setFormData(prev => {
      const churches = [...(prev.churches || [])];
      // Only allow valid ChurchInfo properties
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to upload a profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  }, []);

  const addChurch = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      churches: [
        ...(prev.churches || []),
        {
          ...CLEAN_CHURCH_TEMPLATE,
          id: `temp-${Date.now()}`, // Keep temp ID for UI only
        },
      ],
    }));
  }, []);

  const removeChurch = useCallback((index: number) => {
    if ((formData.churches?.length || 0) > 1) {
      setFormData(prev => ({
        ...prev,
        churches: prev.churches?.filter((_, i) => i !== index),
      }));
    }
  }, [formData.churches]);

  const handleEditPress = useCallback(() => {
    setShowSuccessModal(false);
    setShowConfirmModal(false);
    setIsEditing(true);
  }, []);

  const handleSavePress = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  // Sanitize church data before sending to API
  const sanitizeChurches = (churches: ChurchInfo[] | undefined): ChurchInfo[] => {
    if (!churches || churches.length === 0) return [];

    return churches.map(church => ({
      churchName: church.churchName || '',
      churchPhone: church.churchPhone || '',
      churchAddress: church.churchAddress || '',
      city: church.city || '',
      state: church.state || '',
      zipCode: church.zipCode || '',
      country: church.country || '',
      churchWebsite: church.churchWebsite || '',
      // Explicitly exclude: id, address, phone (UI-only or wrong property names)
    }));
  };

  const handleConfirmSave = useCallback(async () => {
    setShowConfirmModal(false);

    try {
      // Clean and sanitize church data
      const cleanedChurches = sanitizeChurches(formData.churches);

      const updateData: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        churches: cleanedChurches, // Use cleaned churches
        title: formData.title,
        yearsInMinistry: formData.yearsInMinistry,
        conference: formData.conference,
        currentCommunityServiceProjects: formData.currentCommunityServiceProjects,
        interests: formData.interests,
        comments: formData.comments,
        bio: formData.bio,
        avatar: profileImage || undefined,
      };

      console.log('📤 Submitting cleaned profile update:', updateData);

      // This now handles invalidation and refetch internally
      await updateProfile.mutateAsync(updateData);

      // Exit edit mode immediately (data is already fresh from refetch)
      setIsEditing(false);

      // Show success modal
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 100);

      console.log('✅ Profile saved and UI updated successfully');
    } catch (error: any) {
      console.error('❌ Failed to update profile:', error);
      Alert.alert(
        'Update Failed',
        error?.response?.data?.message || error.message || 'Failed to update profile. Please try again.'
      );
    }
  }, [formData, profileImage, updateProfile]);

  const handleCancelSave = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  const handleCancel = useCallback(() => {
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setIsEditing(false);
    // Reset form data to original values
    if (profileData?.user) {
      setFormData({
        firstName: profileData.user.firstName || '',
        lastName: profileData.user.lastName || '',
        phoneNumber: profileData.interest?.phoneNumber || '',
        churches: profileData.interest?.churchDetails || [],
        title: profileData.interest?.title || '',
        yearsInMinistry: profileData.interest?.yearsInMinistry || '',
        conference: profileData.interest?.conference || '',
        currentCommunityServiceProjects: profileData.interest?.currentCommunityProjects || '',
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

  const handleTitleSelect = useCallback((option: string) => {
    updateField('title', option);
    setShowTitleDropdown(false);
  }, [updateField]);

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
        <TouchableOpacity style={styles.editAvatarBadge} onPress={pickImage}>
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
      <Text style={styles.headerTitle}>{isEditing ? 'Edit Profile' : 'My Profile'}</Text>
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
      <TouchableOpacity style={styles.actionButton} onPress={handleEditPress}>
        <Text style={styles.actionButtonText}>Edit Profile</Text>
        <Image source={icons.edit} style={styles.smallIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderProfileInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Profile Information</Text>
      <View style={styles.profileInfoBox}>
        <Text style={styles.profileInfoText}>
          {profileData?.interest?.profileInfo || 'No profile information available.'}
        </Text>
      </View>
    </View>
  );

  const renderEditableProfileInfo = () => (
    <View style={styles.editSection}>
      <View style={styles.editSectionHeader}>
        <Text style={styles.editSectionTitle}>Profile Information</Text>
      </View>
      <View style={styles.profileInputContainer}>
        <Text style={styles.fieldLabel}>Profile :</Text>
        <TouchableOpacity style={styles.absoluteEditIcon}>
          <Image source={icons.edit} style={styles.editIcon} />
        </TouchableOpacity>
        <TextInput
          style={styles.profileTextArea}
          value={formData.bio || ''}
          onChangeText={(text) => updateField('bio', text)}
          multiline
          placeholder="Tell us about yourself..."
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
    </View>
  );

  const renderPersonalInfoView = () => (
    <View style={styles.viewSection}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>First Name : {profileData?.user?.firstName}</Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Last Name : {profileData?.user?.lastName}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>
            Phone Number : {profileData?.interest?.phoneNumber}
          </Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Email : {profileData?.user?.email}</Text>
        </View>
      </View>
    </View>
  );

  const renderPersonalInfoEdit = () => (
    <View style={styles.editSection}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>First Name :</Text>
          <TextInput
            style={styles.editInput}
            value={formData.firstName}
            onChangeText={(text) => updateField('firstName', text)}
            placeholder="First name"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Last Name :</Text>
          <TextInput
            style={styles.editInput}
            value={formData.lastName}
            onChangeText={(text) => updateField('lastName', text)}
            placeholder="Last name"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Phone Number :</Text>
          <TextInput
            style={styles.editInput}
            value={formData.phoneNumber}
            onChangeText={(text) => updateField('phoneNumber', text)}
            keyboardType="phone-pad"
            placeholder="Phone"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Email :</Text>
          <TextInput
            style={[styles.editInput, { color: 'rgba(255,255,255,0.5)' }]}
            value={profileData?.user?.email}
            editable={false}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>
    </View>
  );

  const renderChurchView = (church: ChurchInfo) => (
    <View key={church.id || `church-${Math.random()}`} style={styles.viewSection}>
      <Text style={styles.sectionTitle}>Current Church Information</Text>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>Church Name : {church.churchName}</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Church Phone : {church.churchPhone}</Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>City : {church.city}</Text>
        </View>
      </View>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>Church Address : {church.churchAddress}</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>State : {church.state}</Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Country : {church.country}</Text>
        </View>
      </View>
    </View>
  );

  const renderChurchEdit = (church: ChurchInfo, index: number) => (
    <View key={church.id || `church-edit-${index}`} style={styles.editSection}>
      <View style={styles.editSectionHeader}>
        <Text style={styles.sectionTitle}>Current Church - {index + 1} Information</Text>
        {index === 0 ? (
          <TouchableOpacity style={styles.addChurchButton} onPress={addChurch}>
            <Text style={styles.addChurchText}>Add Church</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.removeChurchButton}
            onPress={() => removeChurch(index)}
          >
            <Text style={styles.removeChurchText}>Remove Church</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Church Name */}
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Church Name :</Text>
        <TextInput
          style={styles.editInput}
          value={church.churchName || ''}
          onChangeText={(text) => updateChurch(index, 'churchName', text)}
          placeholder="Enter church name"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>

      {/* Phone and Website */}
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Church Phone :</Text>
          <TextInput
            style={styles.editInput}
            value={church.churchPhone || ''}
            onChangeText={(text) => updateChurch(index, 'churchPhone', text)}
            keyboardType="phone-pad"
            placeholder="Phone"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Church Website :</Text>
          <TextInput
            style={styles.editInput}
            value={church.churchWebsite || ''}
            onChangeText={(text) => updateChurch(index, 'churchWebsite', text)}
            placeholder="Website"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>

      {/* Address */}
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Church Address :</Text>
        <TextInput
          style={styles.editInput}
          value={church.churchAddress || ''}
          onChangeText={(text) => updateChurch(index, 'churchAddress', text)}
          placeholder="Street address"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>

      {/* City and State */}
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>City :</Text>
          <TextInput
            style={styles.editInput}
            value={church.city || ''}
            onChangeText={(text) => updateChurch(index, 'city', text)}
            placeholder="City"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>State :</Text>
          <TextInput
            style={styles.editInput}
            value={church.state || ''}
            onChangeText={(text) => updateChurch(index, 'state', text)}
            placeholder="State"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>

      {/* Zip Code and Country */}
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Zip Code :</Text>
          <TextInput
            style={styles.editInput}
            value={church.zipCode || ''}
            onChangeText={(text) => updateChurch(index, 'zipCode', text)}
            keyboardType="numeric"
            placeholder="Zip code"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Country :</Text>
          <TextInput
            style={styles.editInput}
            value={church.country || ''}
            onChangeText={(text) => updateChurch(index, 'country', text)}
            placeholder="Country"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>
    </View>
  );

  const renderOtherInfoView = () => (
    <View style={styles.viewSection}>
      <Text style={styles.sectionTitle}>Other Information</Text>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>Title : {profileData?.interest?.title}</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>
            Years in Ministry : {profileData?.interest?.yearsInMinistry}
          </Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Conference : {profileData?.interest?.conference}</Text>
        </View>
      </View>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>
          Community Service Projects : {profileData?.interest?.currentCommunityProjects}
        </Text>
      </View>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>
          Interests : {profileData?.interest?.interests?.join(', ')}
        </Text>
      </View>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>Comments : {profileData?.interest?.comments}</Text>
      </View>
    </View>
  );

  const renderOtherInfoEdit = () => (
    <View style={[styles.editSection, styles.lastEditSection]}>
      <Text style={styles.sectionTitle}>Other Information</Text>
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Title :</Text>
        <TouchableOpacity
          style={[styles.editInput, styles.dropdownInput]}
          onPress={() => setShowTitleDropdown(!showTitleDropdown)}
        >
          <Text style={styles.dropdownText}>{formData.title || 'Select Title'}</Text>
          <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        {showTitleDropdown && (
          <View style={styles.dropdownContainer}>
            {TITLE_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownOption}
                onPress={() => handleTitleSelect(option)}
              >
                <Text style={styles.dropdownOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Years in Ministry :</Text>
          <TextInput
            style={styles.editInput}
            value={formData.yearsInMinistry}
            onChangeText={(text) => updateField('yearsInMinistry', text)}
            keyboardType="numeric"
            placeholder="Years"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Conference :</Text>
          <TextInput
            style={styles.editInput}
            value={formData.conference}
            onChangeText={(text) => updateField('conference', text)}
            placeholder="Conference"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Community Service Projects :</Text>
        <TextInput
          style={styles.editInput}
          value={formData.currentCommunityServiceProjects}
          onChangeText={(text) => updateField('currentCommunityServiceProjects', text)}
          placeholder="Projects"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Interests :</Text>
        <TextInput
          style={[styles.editInput, styles.textArea]}
          value={formData.interests?.join(', ')}
          onChangeText={(text) => updateField('interests', text.split(',').map(i => i.trim()))}
          multiline
          placeholder="Separate interests with commas"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Comments :</Text>
        <TextInput
          style={[styles.editInput, styles.textArea]}
          value={formData.comments}
          onChangeText={(text) => updateField('comments', text)}
          multiline
          placeholder="Comments"
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
    </View>
  );

  const renderEditActions = () => (
    <View style={styles.editActions}>
      <TouchableOpacity
        style={[styles.actionButton2, styles.cancelButton]}
        onPress={handleCancel}
        disabled={updateProfile.isPending}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton2, styles.saveButton]}
        onPress={handleSavePress}
        disabled={updateProfile.isPending}
      >
        <Text style={styles.saveButtonText}>{updateProfile.isPending ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );

  // ============= LOADING & ERROR STATES =============
  if (isLoading) {
    return (
      <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Loading profile...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (isError || !profileData?.user) {
    return (
      <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
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

  // ============= MAIN RENDER =============
  return (
    <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
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
                {greeting} {profileData.user.firstName} {profileData.user.lastName}
              </Text>
              <Text style={styles.role}>{profileData.interest?.title || 'Pastor'}</Text>
            </View>

            {renderProgressBar()}
            {renderActionButtons()}
            {renderProfileInfo()}

            <View style={styles.mainContentBox}>
              {renderPersonalInfoView()}
              {profileData.interest?.churchDetails &&
                profileData.interest.churchDetails.length > 0 &&
                profileData.interest.churchDetails.map((church, index) => renderChurchView(church))}
              {renderOtherInfoView()}
            </View>
          </>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <>
            <View style={styles.editProfileHeader}>{renderAvatar()}</View>

            {renderEditableProfileInfo()}

            <View style={styles.mainContentBox}>
              {renderPersonalInfoEdit()}
              {formData.churches &&
                formData.churches.length > 0 &&
                formData.churches.map((church, index) => renderChurchEdit(church, index))}
              {renderOtherInfoEdit()}
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
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  profileInfoBox: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    padding: 16,
  },
  profileInfoText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
  },
  mainContentBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  viewSection: {
    marginBottom: 16,
  },
  editSection: {
    borderBottomColor: '#ccc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomStartRadius: 50,
    borderBottomEndRadius: 50,
    paddingVertical: 10,
    marginBottom: 16,
  },
  lastEditSection: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  editSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },

  // Fields
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  viewField: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  viewFieldText: {
    color: '#fff',
    fontSize: 13,
  },
  editFieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 13,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // Profile Input
  profileInputContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
    padding: 16,
  },
  profileTextArea: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  absoluteEditIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    width: 40,
    height: 36,
    backgroundColor: '#233A6F82',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#233A6F',
    borderWidth: 1,
  },

  // Dropdown
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 13,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#1E366F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    zIndex: 1000,
    marginTop: 4,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  dropdownOptionText: {
    color: '#fff',
    fontSize: 13,
  },

  // Church Buttons
  addChurchButton: {
    backgroundColor: 'rgba(30, 54, 111, 1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  addChurchText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  removeChurchButton: {
    backgroundColor: 'rgba(30, 54, 111, 1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  removeChurchText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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

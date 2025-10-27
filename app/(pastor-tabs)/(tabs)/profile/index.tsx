import ConfirmModal from '@/components/atom/ConfirmModal';
import SuccessModal from '@/components/atom/SuccessModal';
import TopBar from '@/components/director/TopBar';
import { icons } from '@/constants/images';
import { INITIAL_PROFILE_DATA, TITLE_OPTIONS } from '@/lib/profile/mock';
import { ChurchInfo, ProfileData } from '@/lib/profile/types';
import { getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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





export default function ProfileScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  // State
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>(INITIAL_PROFILE_DATA);
  const [selectedTitle, setSelectedTitle] = useState(profileData.title);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ============= HANDLERS =============
  const updateField = useCallback((field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateChurch = useCallback((index: number, field: keyof ChurchInfo, value: string) => {
    setProfileData(prev => {
      const churches = [...prev.churches];
      churches[index] = { ...churches[index], [field]: value };
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
    setProfileData(prev => ({
      ...prev,
      churches: [
        ...prev.churches,
        {
          name: '',
          phone: '',
          website: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          country: '',
        },
      ],
    }));
  }, []);

  const removeChurch = useCallback((index: number) => {
    if (profileData.churches.length > 1) {
      setProfileData(prev => ({
        ...prev,
        churches: prev.churches.filter((_, i) => i !== index),
      }));
    }
  }, [profileData.churches.length]);

  const handleEditPress = useCallback(() => {
    setShowSuccessModal(false);
    setShowConfirmModal(false);
    setIsEditing(true);
  }, []);

  const handleSavePress = useCallback(() => {
    setShowConfirmModal(true);
  }, []);

  // Close confirm and switch to view mode, then show success
  const handleConfirmSave = useCallback(() => {
    setShowConfirmModal(false);
    setIsEditing(false);

    // Show success modal after a brief delay
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 100);
  }, []);

  const handleCancelSave = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  // Reset when canceling
  const handleCancel = useCallback(() => {
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setIsEditing(false);
  }, []);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const handleTitleSelect = useCallback((option: string) => {
    setSelectedTitle(option);
    updateField('title', option);
    setShowTitleDropdown(false);
  }, [updateField]);

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      <Image
        source={profileImage ? { uri: profileImage } : icons.myProfile}
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
      onPress={() => isEditing ? handleCancel() : router.back()}
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
        <View style={[styles.progressBar, { width: '70%' }]} />
      </View>
      <Text style={styles.progressText}>70%</Text>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/profile/documents')}
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

  const renderProfileInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionHeading}>Profile Information</Text>
      <View style={styles.profileInfoBox}>
        <Text style={styles.profileInfoText}>{profileData.profileInfo}</Text>
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
          value={profileData.profileInfo}
          onChangeText={(text) => updateField('profileInfo', text)}
          multiline
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
          <Text style={styles.viewFieldText}>First Name : {profileData.firstName}</Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Last Name : {profileData.lastName}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Phone Number : {profileData.phone}</Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Email : {profileData.email}</Text>
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
            value={profileData.firstName}
            onChangeText={(text) => updateField('firstName', text)}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Last Name :</Text>
          <TextInput
            style={styles.editInput}
            value={profileData.lastName}
            onChangeText={(text) => updateField('lastName', text)}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Phone Number :</Text>
          <TextInput
            style={styles.editInput}
            value={profileData.phone}
            onChangeText={(text) => updateField('phone', text)}
            keyboardType="phone-pad"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Email :</Text>
          <TextInput
            style={styles.editInput}
            value={profileData.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>
    </View>
  );

  const renderChurchView = (church: ChurchInfo, index: number) => (
    <View key={index} style={styles.viewSection}>
      <Text style={styles.sectionTitle}>
        Current Church -{index + 1} Information
      </Text>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>Church Name : {church.name}</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Church Phone : {church.phone}</Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Church Website : {church.website}</Text>
        </View>
      </View>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>Church Address : {church.address}</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>City : {church.city}</Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>State : {church.state}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Zip Code : {church.zip}</Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Country : {church.country}</Text>
        </View>
      </View>
    </View>
  );

  const renderChurchEdit = (church: ChurchInfo, index: number) => (
    <View key={index} style={styles.editSection}>
      <View style={styles.editSectionHeader}>
        <Text style={styles.sectionTitle}>
          Current Church -{index + 1} Information
        </Text>
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
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Church Name :</Text>
        <TextInput
          style={styles.editInput}
          value={church.name}
          onChangeText={(text) => updateChurch(index, 'name', text)}
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Church Phone :</Text>
          <TextInput
            style={styles.editInput}
            value={church.phone}
            onChangeText={(text) => updateChurch(index, 'phone', text)}
            keyboardType="phone-pad"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Church Website :</Text>
          <TextInput
            style={styles.editInput}
            value={church.website}
            onChangeText={(text) => updateChurch(index, 'website', text)}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Church Address :</Text>
        <TextInput
          style={styles.editInput}
          value={church.address}
          onChangeText={(text) => updateChurch(index, 'address', text)}
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>City :</Text>
          <TextInput
            style={styles.editInput}
            value={church.city}
            onChangeText={(text) => updateChurch(index, 'city', text)}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>State :</Text>
          <TextInput
            style={styles.editInput}
            value={church.state}
            onChangeText={(text) => updateChurch(index, 'state', text)}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Zip Code :</Text>
          <TextInput
            style={styles.editInput}
            value={church.zip}
            onChangeText={(text) => updateChurch(index, 'zip', text)}
            keyboardType="numeric"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Country :</Text>
          <TextInput
            style={styles.editInput}
            value={church.country}
            onChangeText={(text) => updateChurch(index, 'country', text)}
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
        <Text style={styles.viewFieldText}>Title : {profileData.title}</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Years in Ministry : {profileData.yearsInMinistry}</Text>
        </View>
        <View style={[styles.viewField, styles.halfInput]}>
          <Text style={styles.viewFieldText}>Conference : {profileData.conference}</Text>
        </View>
      </View>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>
          Community Service Projects : {profileData.communityServiceProjects}
        </Text>
      </View>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>Interests : {profileData.interests}</Text>
      </View>
      <View style={styles.viewField}>
        <Text style={styles.viewFieldText}>Comments : {profileData.comments}</Text>
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
          <Text style={styles.dropdownText}>
            {selectedTitle || 'Select Title'}
          </Text>
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
            value={profileData.yearsInMinistry}
            onChangeText={(text) => updateField('yearsInMinistry', text)}
            keyboardType="numeric"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
        <View style={[styles.editFieldContainer, styles.halfInput]}>
          <Text style={styles.fieldLabel}>Conference :</Text>
          <TextInput
            style={styles.editInput}
            value={profileData.conference}
            onChangeText={(text) => updateField('conference', text)}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      </View>
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Community Service Projects :</Text>
        <TextInput
          style={styles.editInput}
          value={profileData.communityServiceProjects}
          onChangeText={(text) => updateField('communityServiceProjects', text)}
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Interests :</Text>
        <TextInput
          style={[styles.editInput, styles.textArea]}
          value={profileData.interests}
          onChangeText={(text) => updateField('interests', text)}
          multiline
          placeholderTextColor="rgba(255,255,255,0.5)"
        />
      </View>
      <View style={styles.editFieldContainer}>
        <Text style={styles.fieldLabel}>Comments :</Text>
        <TextInput
          style={[styles.editInput, styles.textArea]}
          value={profileData.comments}
          onChangeText={(text) => updateField('comments', text)}
          multiline
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
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton2, styles.saveButton]}
        onPress={handleSavePress} // Changed to handleSavePress
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  // VIEW MODE RENDER
  // if (hasProfile && !isEditing) {
  //   return (
  //     <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
  //       <TopBar role='pastor' />
  //       {renderHeader()}
  //       <KeyboardAwareScrollView
  //         style={styles.scrollView}
  //         contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
  //         showsVerticalScrollIndicator={false}
  //       >
  //         <View style={styles.profileHeader}>
  //           {renderAvatar()}
  //           <Text style={styles.greeting}>Good Morning {profileData.firstName} {profileData.lastName}</Text>
  //           <Text style={styles.role}>{profileData.title}</Text>
  //         </View>

  //         {renderProgressBar()}
  //         {renderActionButtons()}
  //         {renderProfileInfo()}

  //         <View style={styles.mainContentBox}>
  //           {renderPersonalInfoView()}
  //           {profileData.churches.map(renderChurchView)}
  //           {renderOtherInfoView()}
  //         </View>
  //       </KeyboardAwareScrollView>
  //     </LinearGradient>
  //   );
  // }

  // EDIT MODE RENDER 
  return (
    <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
      <TopBar role='pastor' />
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
                Good Morning {profileData.firstName} {profileData.lastName}
              </Text>
              <Text style={styles.role}>{profileData.title}</Text>
            </View>

            {renderProgressBar()}
            {renderActionButtons()}
            {renderProfileInfo()}

            <View style={styles.mainContentBox}>
              {renderPersonalInfoView()}
              {profileData.churches.map(renderChurchView)}
              {renderOtherInfoView()}
            </View>
          </>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <>
            <View style={styles.editProfileHeader}>
              {renderAvatar()}
            </View>

            {renderEditableProfileInfo()}

            <View style={styles.mainContentBox}>
              {renderPersonalInfoEdit()}
              {profileData.churches.map(renderChurchEdit)}
              {renderOtherInfoEdit()}
            </View>

            {renderEditActions()}
          </>
        )}
      </KeyboardAwareScrollView>

      {/* MODALS - Always rendered outside conditional blocks */}
      <ConfirmModal
        visible={showConfirmModal}
        title="Are you sure want to save changes ?"
        onConfirm={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      <SuccessModal
        visible={showSuccessModal}
        message="Edited Profile Successfully"
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

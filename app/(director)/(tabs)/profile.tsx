import TopBar from "@/components/director/TopBar";
import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import KeyboardSafeContainer from "@/components/layout/KeyboardSafeContainer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  title: string;
  yearsInMinistry: string;
  conference: string;
  profileInfo: string;
  churches: ChurchInfo[];
}

interface ChurchInfo {
  name: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const { bottom } = useSafeAreaInsets();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "John",
    lastName: "Ross",
    phone: "09878564398",
    email: "johnross@gmail.com",
    title: "Mentor",
    yearsInMinistry: "11",
    conference: "Oakland",
    profileInfo:
      "Lorem ipsum dolor sit amet, consectetur adipiscing eip ex ea commodo consequat. Duis",
    churches: [
      {
        name: "Loma linda University Church",
        phone: "09878564398",
        website: "johnross@gmail.com",
        address: "Loma linda University Church,CA",
        city: "Oakland",
        state: "North American",
        zip: "00000",
        country: "USA",
      },
      {
        name: "Loma linda University Church",
        phone: "09878564398",
        website: "johnross@gmail.com",
        address: "Loma linda University Church,CA",
        city: "Oakland",
        state: "North American",
        zip: "00000",
        country: "USA",
      },
    ],
  });

  const updateField = (field: keyof ProfileData, value: any) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const updateChurch = (
    index: number,
    field: keyof ChurchInfo,
    value: string
  ) => {
    setProfileData((prev) => {
      const churches = [...prev.churches];
      churches[index] = { ...churches[index], [field]: value };
      return { ...prev, churches };
    });
  };

  const pickImage = async () => {
    try {
      
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library to upload a profile picture.",
          [{ text: "OK" }]
        );
        return;
      }

      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
        setHasProfile(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const addChurch = () => {
    setProfileData((prev) => ({
      ...prev,
      churches: [
        ...prev.churches,
        {
          name: "",
          phone: "",
          website: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          country: "",
        },
      ],
    }));
  };

  const removeChurch = (index: number) => {
    if (profileData.churches.length > 1) {
      setProfileData((prev) => ({
        ...prev,
        churches: prev.churches.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    setHasProfile(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = () => {
    setHasProfile(true);
  };

  
  if (!hasProfile && !isEditing) {
    return (
      <LinearGradient
        colors={["#176192", "#1D548D", "#264387"]}
        style={{ flex: 1 }}
      >
        <TopBar
          userName="David Roe"
          showUserName={true}
          showNotifications={true}
          notifications={3}
          showDrawer={true}
          showBackButton={false}
        />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.profileButtonContainer}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
          <Text style={styles.profileButtonText}>
            My Profile
          </Text>
        </TouchableOpacity>
        <KeyboardSafeContainer
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.emptyAvatar}>
                {/* <Ionicons name="person-outline" size={50} color="rgba(255,255,255,0.6)" /> */}
                <Image
                  source={icons.profileUpload}
                  style={{ width: 100, height: 100 }}
                />
              </View>
              <TouchableOpacity
                style={styles.editAvatarBadge}
                onPress={pickImage}
              >
                <Image
                  source={icons.upload}
                  style={{ width: 14, height: 14, tintColor: "#fff" }}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.greeting}>Good Morning David Roe</Text>
            <Text style={styles.role}>Director</Text>
          </View>

          {}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => router.push("/(director)/(tabs)/documents")}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Upload documents</Text>
              <Image
                source={icons.attachment}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.actionButtonText}>Edit Profile</Text>
              <Image source={icons.edit} style={{ width: 20, height: 18 }} />
            </TouchableOpacity>
          </View>

          {}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Profile Information..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
              numberOfLines={3}
            />
          </View>
          <View>
            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="First Name : John"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Last Name : Ross"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
              </View>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Phone Number :"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Email :"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Current Church Information
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Church Name"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Church Phone"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Church Website"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Church Address"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="City"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="State"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Zip Code"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                />
                <View
                  style={[styles.input, styles.halfInput, styles.dropdownInput]}
                >
                  <Text style={styles.dropdownPlaceholder}>Country</Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.addChurchButtonStyle}>
                <Text style={styles.addChurchButtonText}>Add a Church</Text>
              </TouchableOpacity>
            </View>

            {}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Other Information</Text>
              <View style={[styles.input, styles.dropdownInput]}>
                <Text style={styles.dropdownPlaceholder}>Title</Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color="rgba(255,255,255,0.7)"
                />
              </View>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Years in Ministry"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Conference"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
            </View>

            {}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  width: "50%",
                  alignSelf: "center",
                },
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardSafeContainer>
      </LinearGradient>
    );
  }

  
  if (hasProfile && !isEditing) {
    return (
      <LinearGradient
        colors={["#176192", "#1D548D", "#264387"]}
        style={{ flex: 1 }}
      >
        <TopBar
          userName="David Roe"
          showUserName={true}
          showNotifications={true}
          notifications={3}
          showDrawer={true}
          showBackButton={false}
        />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.profileButtonContainer}
        >
          <Ionicons name="chevron-back" size={28} color="#fff" />
          <Text style={styles.profileButtonText}>
            My Profile
          </Text>
        </TouchableOpacity>
        <KeyboardSafeContainer
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Image source={icons.myProfile} style={styles.avatarImage} />
              )}
            </View>
            <Text style={styles.greeting}>Good Morning David Roe</Text>
            <Text style={styles.role}>Director</Text>
          </View>

          {}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push("/(director)/(tabs)/documents")}
            >
              <Text style={styles.actionButtonText}>Documents</Text>
              <Image
                source={icons.attachment}
                style={{ width: 20, height: 20 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.actionButtonText}>Edit Profile</Text>
              <Image source={icons.edit} style={{ width: 18, height: 18 }} />
            </TouchableOpacity>
          </View>

          {}
          <View
            style={{
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Profile Information
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.4)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 14,
                  lineHeight: 22,
                }}
              >
                {profileData.profileInfo}
              </Text>
            </View>
          </View>

          <View
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: "#fff",
              padding: 16,
              borderRadius: 12,
            }}
          >
            {}
            <View style={styles.viewSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.row}>
                <View style={[styles.viewField, styles.halfInput]}>
                  <Text style={styles.viewFieldText}>
                    First Name : {profileData.firstName}
                  </Text>
                </View>
                <View style={[styles.viewField, styles.halfInput]}>
                  <Text style={styles.viewFieldText}>
                    Last Name : {profileData.lastName}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.viewField, styles.halfInput]}>
                  <Text style={styles.viewFieldText}>
                    Phone Number : {profileData.phone}
                  </Text>
                </View>
                <View style={[styles.viewField, styles.halfInput]}>
                  <Text style={styles.viewFieldText}>
                    Email : {profileData.email}
                  </Text>
                </View>
              </View>
            </View>

            {}
            {profileData.churches.map((church, index) => (
              <View key={index} style={styles.viewSection}>
                <Text style={styles.sectionTitle}>
                  Current Church -{index + 1} Information
                </Text>
                <View style={styles.viewField}>
                  <Text style={styles.viewFieldText}>
                    Church Name : {church.name}
                  </Text>
                </View>
                <View style={styles.row}>
                  <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                      Church Phone : {church.phone}
                    </Text>
                  </View>
                  <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                      Church Website : {church.website}
                    </Text>
                  </View>
                </View>
                <View style={styles.viewField}>
                  <Text style={styles.viewFieldText}>
                    Church Address : {church.address}
                  </Text>
                </View>
                <View style={styles.row}>
                  <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                      City : {church.city}
                    </Text>
                  </View>
                  <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                      State : {church.state}
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                      Zip Code : {church.zip}
                    </Text>
                  </View>
                  <View style={[styles.viewField, styles.halfInput]}>
                    <Text style={styles.viewFieldText}>
                      Country : {church.country}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {}
            <View style={styles.viewSection}>
              <Text style={styles.sectionTitle}>Other Information</Text>
              <View style={styles.viewField}>
                <Text style={styles.viewFieldText}>
                  Title : {profileData.title}
                </Text>
              </View>
              <View style={styles.row}>
                <View style={[styles.viewField, styles.halfInput]}>
                  <Text style={styles.viewFieldText}>
                    Years in Ministry : {profileData.yearsInMinistry}
                  </Text>
                </View>
                <View style={[styles.viewField, styles.halfInput]}>
                  <Text style={styles.viewFieldText}>
                    Conference : {profileData.conference}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </KeyboardSafeContainer>
      </LinearGradient>
    );
  }

  
  return (
    <LinearGradient
      colors={["#176192", "#1D548D", "#264387"]}
      style={{ flex: 1 }}
    >
      <TopBar
        userName="David Roe"
        showUserName={true}
        showNotifications={true}
        notifications={3}
        showDrawer={true}
        showBackButton={false}
      />
      <TouchableOpacity
        onPress={handleCancel}
        style={styles.editButtonContainer}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
        <Text style={styles.editButtonText}>
          Edit Profile
        </Text>
      </TouchableOpacity>
      <KeyboardSafeContainer
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View
          style={{
            alignItems: "center",
            marginTop: 20,
            marginBottom: 24,
          }}
        >
          <View style={styles.avatarContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <Image source={icons.myProfile} style={styles.avatarImage} />
            )}
            <TouchableOpacity
              style={styles.editAvatarBadge}
              onPress={pickImage}
            >
              <Image source={icons.edit} style={{ width: 18, height: 18 }} />
            </TouchableOpacity>
          </View>
        </View>

        {}
        <View style={styles.editSection}>
          <View style={styles.editSectionHeader}>
            <Text style={styles.editSectionTitle}>Profile Information</Text>
          </View>
          <View style={styles.profileInputContainer}>
            <Text style={styles.profileLabel}>Profile :</Text>
            <TouchableOpacity
              style={[
                styles.editIconButton,
                { position: "absolute", top: 8, right: 8, zIndex: 10 },
              ]}
            >
              <Image source={icons.edit} style={{ width: 18, height: 18 }} />
            </TouchableOpacity>
            <TextInput
              style={styles.profileTextArea}
              value={profileData.profileInfo}
              onChangeText={(text) => updateField("profileInfo", text)}
              multiline
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
        </View>

        <View
          style={{
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "#fff",
            padding: 16,
            borderRadius: 12,
          }}
        >
          {}
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.row}>
              <View style={[styles.editFieldContainer, styles.halfInput]}>
                <Text style={styles.fieldLabel}>First Name :</Text>
                <TextInput
                  style={styles.editInput}
                  value={profileData.firstName}
                  onChangeText={(text) => updateField("firstName", text)}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
              <View style={[styles.editFieldContainer, styles.halfInput]}>
                <Text style={styles.fieldLabel}>Last Name :</Text>
                <TextInput
                  style={styles.editInput}
                  value={profileData.lastName}
                  onChangeText={(text) => updateField("lastName", text)}
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
                  onChangeText={(text) => updateField("phone", text)}
                  keyboardType="phone-pad"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
              <View style={[styles.editFieldContainer, styles.halfInput]}>
                <Text style={styles.fieldLabel}>Email :</Text>
                <TextInput
                  style={styles.editInput}
                  value={profileData.email}
                  onChangeText={(text) => updateField("email", text)}
                  keyboardType="email-address"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
            </View>
          </View>

          {}
          {profileData.churches.map((church, index) => (
            <View key={index} style={styles.editSection}>
              <View style={styles.editSectionHeader}>
                <Text style={styles.sectionTitle}>
                  Current Church -{index + 1} Information
                </Text>
                {index === 0 ? (
                  <TouchableOpacity
                    style={styles.addChurchButton}
                    onPress={addChurch}
                  >
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
                  onChangeText={(text) => updateChurch(index, "name", text)}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.editFieldContainer, styles.halfInput]}>
                  <Text style={styles.fieldLabel}>Church Phone :</Text>
                  <TextInput
                    style={styles.editInput}
                    value={church.phone}
                    onChangeText={(text) => updateChurch(index, "phone", text)}
                    keyboardType="phone-pad"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
                <View style={[styles.editFieldContainer, styles.halfInput]}>
                  <Text style={styles.fieldLabel}>Church Website :</Text>
                  <TextInput
                    style={styles.editInput}
                    value={church.website}
                    onChangeText={(text) =>
                      updateChurch(index, "website", text)
                    }
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              </View>
              <View style={styles.editFieldContainer}>
                <Text style={styles.fieldLabel}>Church Address :</Text>
                <TextInput
                  style={styles.editInput}
                  value={church.address}
                  onChangeText={(text) => updateChurch(index, "address", text)}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.editFieldContainer, styles.halfInput]}>
                  <Text style={styles.fieldLabel}>City :</Text>
                  <TextInput
                    style={styles.editInput}
                    value={church.city}
                    onChangeText={(text) => updateChurch(index, "city", text)}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
                <View style={[styles.editFieldContainer, styles.halfInput]}>
                  <Text style={styles.fieldLabel}>State :</Text>
                  <TextInput
                    style={styles.editInput}
                    value={church.state}
                    onChangeText={(text) => updateChurch(index, "state", text)}
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
                    onChangeText={(text) => updateChurch(index, "zip", text)}
                    keyboardType="numeric"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
                <View style={[styles.editFieldContainer, styles.halfInput]}>
                  <Text style={styles.fieldLabel}>Country :</Text>
                  <TextInput
                    style={styles.editInput}
                    value={church.country}
                    onChangeText={(text) =>
                      updateChurch(index, "country", text)
                    }
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              </View>
            </View>
          ))}

          {}
          <View
            style={[
              styles.editSection,
              {
                marginBottom: 0,
                paddingBottom: 0,
                borderBottomWidth: 0,
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Other Information</Text>
            <View style={styles.editFieldContainer}>
              <Text style={styles.fieldLabel}>Title :</Text>
              <TextInput
                style={styles.editInput}
                value={profileData.title}
                onChangeText={(text) => updateField("title", text)}
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.editFieldContainer, styles.halfInput]}>
                <Text style={styles.fieldLabel}>Years in Ministry :</Text>
                <TextInput
                  style={styles.editInput}
                  value={profileData.yearsInMinistry}
                  onChangeText={(text) => updateField("yearsInMinistry", text)}
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
              <View style={[styles.editFieldContainer, styles.halfInput]}>
                <Text style={styles.fieldLabel}>Conference :</Text>
                <TextInput
                  style={styles.editInput}
                  value={profileData.conference}
                  onChangeText={(text) => updateField("conference", text)}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              </View>
            </View>
          </View>
        </View>

        {}
        <View style={styles.editActions}>
          <TouchableOpacity
            style={[styles.actionButton2, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton2, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardSafeContainer>
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
  profileButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  profileButtonText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  editButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
    borderBottomColor: "#ccc",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomStartRadius: 50,
    borderBottomEndRadius: 50,
    paddingBottom: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  emptyAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 5,
    backgroundColor: "#233A6F82",
    borderWidth: 1,
    borderColor: "#233A6F",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#14517D",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    
    
    
    
    
    marginBottom: 16,
  },
  viewSection: {
    
    
    
    
    
    marginBottom: 16,
  },

  editSection: {
    
    
    
    
    
    borderBottomColor: "#ccc",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomStartRadius: 50,
    borderBottomEndRadius: 50,
    paddingVertical: 10,
    marginBottom: 16,
  },
  editSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  editIconButton: {
    width: 40,
    height: 36,
    backgroundColor: "#233A6F82",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#233A6F",
    borderWidth: 1,
  },
  profileInputContainer: {
    
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 12,
    padding: 16,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginBottom: 12,
  },
  profileTextArea: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },

  
  
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 12,
  },
  
  
  
  
  
  
  input: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 13,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  dropdownInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownPlaceholder: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },
  addChurchButtonStyle: {
    backgroundColor: "#1E366F",
    borderWidth: 1,
    width: "50%",
    alignSelf: "flex-end",
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  addChurchButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  viewText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 20,
  },
  viewField: {
    
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  viewFieldText: {
    color: "#fff",
    fontSize: 13,
  },
  editField: {
    marginBottom: 12,
  },
  editLabel: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 8,
  },
  editTextArea: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: "top",
  },
  editFieldContainer: {
    marginBottom: 12,
  },
  editInput: {
    
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 13,
  },
  addChurchButton: {
    backgroundColor: "rgba(58, 124, 165, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  addChurchText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  removeChurchButton: {
    backgroundColor: "rgba(220, 53, 69, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  removeChurchText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  submitButtonText: {
    color: "#1a5b77",
    fontSize: 16,
    fontWeight: "700",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton2: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1a5b77",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "rgba(30, 54, 111, 1)",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  fieldLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
  },
});

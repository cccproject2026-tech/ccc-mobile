import ActionBottomSheet from '@/components/director/ActionSheetModal';
import TopBar from '@/components/director/TopBar';
import { icons } from '@/constants/images';
import {
    getButtonHeight,
    getFontSize,
    getSpacing,
    isAndroid
} from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function MentorProfile() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const { bottom } = useSafeAreaInsets();
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const menuItems = [
        { icon: 'people-outline', label: 'List of Mentees', onPress: router.push.bind(router, '/(director)/(tabs)/mentors/mentor-mentees') },
        { icon: 'person-add-outline', label: 'Assign New Mentee', onPress: router.push.bind(router, '/(director)/(tabs)/mentors/assign-mentee') },
        { icon: 'person-remove-outline', label: 'Remove a Mentee', onPress: router.push.bind(router, '/(director)/(tabs)/mentors/remove-mentee') },
        { icon: 'clipboard-outline', label: 'Roadmaps of Mentees', onPress: () => console.log('Roadmaps of Mentees') },
        { icon: 'checkmark-done-outline', label: 'Assessments of Mentees', onPress: () => console.log('Assessments of Mentees') },
        { icon: 'book-outline', label: 'Assignments of Mentees', onPress: () => console.log('Assignments of Mentees') },
        { icon: 'stats-chart-outline', label: 'Progress of Mentees', onPress: () => console.log('Progress of Mentees') },
        { icon: 'calendar-outline', label: 'Schedule a Meeting', onPress: () => console.log('Schedule a Meeting') },
        { icon: 'create-outline', label: 'Edit Profile', onPress: () => console.log('Edit Profile') },
    ];


    const [profileData, setProfileData] = useState<ProfileData>({
        firstName: 'John',
        lastName: 'Ross',
        phone: '09878564398',
        email: 'johnross@gmail.com',
        title: 'Mentor',
        yearsInMinistry: '11',
        conference: 'Oakland',
        profileInfo: 'Lorem ipsum dolor sit amet, consectetur adipiscing eip ex ea commodo consequat. Duis',
        churches: [
            {
                name: 'Loma linda University Church',
                phone: '09878564398',
                website: 'johnross@gmail.com',
                address: 'Loma linda University Church,CA',
                city: 'Oakland',
                state: 'North American',
                zip: '00000',
                country: 'USA',
            },
            {
                name: 'Loma linda University Church',
                phone: '09878564398',
                website: 'johnross@gmail.com',
                address: 'Loma linda University Church,CA',
                city: 'Oakland',
                state: 'North American',
                zip: '00000',
                country: 'USA',
            },
        ],
    });

    // Bottom Sheet Handlers
    const handleOpenMenu = useCallback(() => {
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleCloseMenu = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, []);

    const updateField = (field: keyof ProfileData, value: any) => {
        setProfileData(prev => ({ ...prev, [field]: value }));
    };

    const updateChurch = (index: number, field: keyof ChurchInfo, value: string) => {
        setProfileData(prev => {
            const churches = [...prev.churches];
            churches[index] = { ...churches[index], [field]: value };
            return { ...prev, churches };
        });
    };

    const pickImage = async () => {
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

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };



    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
    }, []);



    const handleSave = () => {
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };


    // STATE 2: Filled Profile (View Mode)
    if (!isEditing) {
        return (
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>John Doe</Text>
                        <Text style={styles.headerBreadcrumb}>Mentor {'>'} Profile</Text>
                    </View>
                    <TouchableOpacity style={styles.menuButton} onPress={handleOpenMenu}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.profileHeader}>
                        <LinearGradient
                            colors={["#7C3AED", "#38BDF8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.avatarContainerNew}>
                                {profileImage ? (
                                    <Image source={{ uri: profileImage }} style={styles.avatarImageNew} />
                                ) : (
                                    <Image source={icons.myProfile} style={styles.avatarImageNew} />
                                )}
                            </View>
                        </LinearGradient>

                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>John Doe</Text>
                            <View style={styles.roleRow}>
                                <Text style={styles.profileRole}>Field Mentor</Text>
                                <View style={styles.menteeDot} />
                                <Text style={styles.menteesText}>5 Mentees</Text>
                            </View>

                            <View style={styles.contactIcons}>
                                <TouchableOpacity style={styles.contactIcon}>
                                    <Ionicons name="call-outline" size={24} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactIcon}>
                                    <Ionicons name="chatbubble-outline" size={24} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactIcon}>
                                    <Ionicons name="mail-outline" size={24} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactIcon}>
                                    <Ionicons name="logo-whatsapp" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(director)/(tabs)/mentors/mentor-documents')}>
                            <Text style={styles.actionButtonText}>Documents</Text>
                            <Image source={icons.attachment} style={{ width: 20, height: 20 }} />
                            <View className="absolute -top-2 -right-2 bg-[#fff] w-7 h-7 rounded-full items-center justify-center border-2 border-white">
                                <Text className="text-xs font-bold text-[#1a5b77]">3</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => setIsEditing(true)}
                        >
                            <Text style={styles.actionButtonText}>Edit Profile</Text>
                            <Image source={icons.edit} style={{ width: 18, height: 18 }} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ marginBottom: 16 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#fff',
                            marginBottom: 12,
                        }}>
                            Profile Information
                        </Text>
                        <View style={{
                            borderWidth: 1,
                            borderColor: 'rgba(255, 255, 255, 0.4)',
                            borderRadius: 12,
                            padding: 16,
                        }}>
                            <Text style={{
                                color: '#fff',
                                fontSize: 14,
                                lineHeight: 22,
                            }}>
                                {profileData.profileInfo}
                            </Text>
                        </View>
                    </View>

                    <View style={{
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: '#fff',
                        padding: 16,
                        borderRadius: 12,
                    }}>
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

                        {profileData.churches.map((church, index) => (
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
                        ))}

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
                        </View>
                    </View>

                    <View style={styles.deleteAction}>
                        <TouchableOpacity
                            style={[styles.deleteActionButton]}
                            onPress={handleCancel}
                        >
                            <Ionicons name="trash" size={18} color="red" />
                            <Text style={styles.deleteActionButtonText}>Delete Profile</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={profileData.firstName + ' ' + profileData.lastName}
                    subtitle={`5 Mentees`}
                    image={profileImage || undefined}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />
            </LinearGradient>
        );
    }
    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
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
            <TouchableOpacity onPress={handleCancel} className="flex-row items-center px-4 py-4 border-b border-white/30 ">
                <Ionicons name="chevron-back" size={28} color="#fff" />
                <Text className="ml-2 text-xl font-semibold text-white">Edit Profile</Text>
            </TouchableOpacity>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    alignItems: 'center',
                    marginTop: 20,
                    marginBottom: 24,
                }}>
                    <View style={styles.avatarContainer}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
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

                <View style={styles.editSection}>
                    <View style={styles.editSectionHeader}>
                        <Text style={styles.editSectionTitle}>Profile Information</Text>
                    </View>
                    <View style={styles.profileInputContainer}>
                        <Text style={styles.profileLabel}>Profile :</Text>
                        <TouchableOpacity style={[styles.editIconButton, { position: 'absolute', top: 8, right: 8, zIndex: 10 }]}>
                            <Image source={icons.edit} style={{ width: 18, height: 18 }} />
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

                <View style={{
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: '#fff',
                    padding: 16,
                    borderRadius: 12,
                }}>
                    <View style={styles.editSection}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.row}>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`First Name : ${profileData.firstName}`}
                                    onChangeText={(text) => updateField('firstName', text.replace('First Name : ', ''))}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Last Name : ${profileData.lastName}`}
                                    onChangeText={(text) => updateField('lastName', text.replace('Last Name : ', ''))}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Phone Number : ${profileData.phone}`}
                                    onChangeText={(text) => updateField('phone', text.replace('Phone Number : ', ''))}
                                    keyboardType="phone-pad"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Email : ${profileData.email}`}
                                    onChangeText={(text) => updateField('email', text.replace('Email : ', ''))}
                                    keyboardType="email-address"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                        </View>
                    </View>
                    {profileData.churches.map((church, index) => (
                        <View key={index} style={styles.editSection}>
                            <View style={styles.editSectionHeader}>
                                <Text style={styles.sectionTitle}>
                                    Current Church -{index + 1} Information
                                </Text>
                            </View>
                            <View style={styles.editFieldContainer}>
                                <TextInput
                                    style={styles.editInput}
                                    value={church.name ? `Current Church : ${church.name}` : 'Current Church :'}
                                    onChangeText={(text) => updateChurch(index, 'name', text.replace('Current Church : ', ''))}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <TextInput
                                        style={styles.editInput}
                                        value={`Church Phone : ${church.phone}`}
                                        onChangeText={(text) => updateChurch(index, 'phone', text.replace('Church Phone : ', ''))}
                                        keyboardType="phone-pad"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <TextInput
                                        style={styles.editInput}
                                        value={`Church Website : ${church.website}`}
                                        onChangeText={(text) => updateChurch(index, 'website', text.replace('Church Website : ', ''))}
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                            </View>
                            <View style={styles.editFieldContainer}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Church Address : ${church.address}`}
                                    onChangeText={(text) => updateChurch(index, 'address', text.replace('Church Address : ', ''))}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <TextInput
                                        style={styles.editInput}
                                        value={`City : ${church.city}`}
                                        onChangeText={(text) => updateChurch(index, 'city', text.replace('City : ', ''))}
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <TextInput
                                        style={styles.editInput}
                                        value={`State : ${church.state}`}
                                        onChangeText={(text) => updateChurch(index, 'state', text.replace('State : ', ''))}
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <TextInput
                                        style={styles.editInput}
                                        value={`Zip Code : ${church.zip}`}
                                        onChangeText={(text) => updateChurch(index, 'zip', text.replace('Zip Code : ', ''))}
                                        keyboardType="numeric"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                                <View style={[styles.editFieldContainer, styles.halfInput]}>
                                    <TextInput
                                        style={styles.editInput}
                                        value={`Country : ${church.country}`}
                                        onChangeText={(text) => updateChurch(index, 'country', text.replace('Country : ', ''))}
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                    <View style={[styles.editSection, {
                        marginBottom: 0,
                        paddingBottom: 0,
                        borderBottomWidth: 0,
                    }]}>
                        <Text style={styles.sectionTitle}>Other Information</Text>
                        <View style={styles.editFieldContainer}>
                            <TextInput
                                style={styles.editInput}
                                value={`Title : ${profileData.title}`}
                                onChangeText={(text) => updateField('title', text.replace('Title : ', ''))}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                            />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Years in Ministry : ${profileData.yearsInMinistry}`}
                                    onChangeText={(text) => updateField('yearsInMinistry', text.replace('Years in Ministry : ', ''))}
                                    keyboardType="numeric"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Conference : ${profileData.conference}`}
                                    onChangeText={(text) => updateField('conference', text.replace('Conference : ', ''))}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                        </View>
                    </View>
                </View>
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
            </ScrollView>
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
        paddingHorizontal: getSpacing(16),
        paddingBottom: getSpacing(40),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(isAndroid ? 12 : 16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: {
        padding: getSpacing(4),
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: getSpacing(12),
    },
    headerTitle: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        color: '#fff',
        marginBottom: getSpacing(2),
    },
    headerBreadcrumb: {
        fontSize: getFontSize(12),
        color: 'rgba(255, 255, 255, 0.8)',
    },
    menuButton: {
        padding: getSpacing(4),
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: getSpacing(12),
    },
    emptyAvatar: {
        width: getSpacing(isAndroid ? 80 : 100),
        height: getSpacing(isAndroid ? 80 : 100),
        borderRadius: getSpacing(isAndroid ? 40 : 50),
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: getSpacing(isAndroid ? 80 : 100),
        height: getSpacing(isAndroid ? 80 : 100),
        borderRadius: getSpacing(isAndroid ? 40 : 50),
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: getSpacing(isAndroid ? 28 : 32),
        height: getSpacing(isAndroid ? 28 : 32),
        borderRadius: getSpacing(5),
        backgroundColor: '#233A6F82',
        borderWidth: 1,
        borderColor: '#233A6F',
        alignItems: 'center',
        justifyContent: 'center',
    },
    greeting: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#fff',
        marginBottom: getSpacing(4),
    },
    role: {
        fontSize: getFontSize(12),
        color: 'rgba(255,255,255,0.9)',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: getSpacing(12),
        marginBottom: getSpacing(24),
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#14517D',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: getSpacing(12),
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(isAndroid ? 10 : 12),
    },
    actionButtonText: {
        color: '#fff',
        fontSize: getFontSize(14),
        fontWeight: '500',
    },
    section: {
        marginBottom: getSpacing(16),
    },
    viewSection: {
        marginBottom: getSpacing(16),
    },

    editSection: {
        paddingVertical: getSpacing(10),
        marginBottom: getSpacing(16),
    },
    editSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: getSpacing(16),
    },
    editSectionTitle: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#fff',
    },
    editIconButton: {
        width: getSpacing(isAndroid ? 36 : 40),
        height: getSpacing(isAndroid ? 32 : 36),
        backgroundColor: '#233A6F82',
        borderRadius: getSpacing(8),
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#233A6F',
        borderWidth: 1,
    },
    profileInputContainer: {
        // backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: getSpacing(12),
        padding: getSpacing(16),
    },
    profileLabel: {
        fontSize: getFontSize(14),
        fontWeight: '500',
        color: '#fff',
        marginBottom: getSpacing(12),
    },
    profileTextArea: {
        color: '#fff',
        fontSize: getFontSize(14),
        lineHeight: getFontSize(20),
        minHeight: getSpacing(isAndroid ? 70 : 80),
        textAlignVertical: 'top',
    },

    // editSection: {
    //   marginBottom: 16,
    // },
    sectionTitle: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#fff',
        marginBottom: getSpacing(12),
    },
    // editSectionHeader: {
    //   flexDirection: 'row',
    //   justifyContent: 'space-between',
    //   alignItems: 'center',
    //   marginBottom: 12,
    // },
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: getSpacing(8),
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(isAndroid ? 10 : 12),
        color: '#fff',
        fontSize: getFontSize(13),
        marginBottom: getSpacing(12),
    },
    textArea: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: getSpacing(8),
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(12),
        color: '#fff',
        fontSize: getFontSize(13),
        minHeight: getSpacing(isAndroid ? 60 : 70),
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        gap: getSpacing(12),
    },
    halfInput: {
        flex: 1,
    },
    dropdownInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownPlaceholder: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: getFontSize(13),
    },
    addChurchButtonStyle: {
        backgroundColor: '#1E366F',
        borderWidth: 1,
        width: '50%',
        alignSelf: 'flex-end',
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: getSpacing(8),
        paddingVertical: getSpacing(isAndroid ? 10 : 12),
        alignItems: 'center',
        marginTop: getSpacing(4),
    },
    addChurchButtonText: {
        color: '#fff',
        fontSize: getFontSize(13),
        fontWeight: '500',
    },
    viewText: {
        color: '#fff',
        fontSize: getFontSize(13),
        lineHeight: getFontSize(20),
    },
    viewField: {
        // backgroundColor: 'rgba(58, 124, 165, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: getSpacing(8),
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(isAndroid ? 10 : 12),
        marginBottom: getSpacing(12),
    },
    viewFieldText: {
        color: '#fff',
        fontSize: getFontSize(13),
    },
    editField: {
        marginBottom: getSpacing(12),
    },
    editLabel: {
        color: '#fff',
        fontSize: getFontSize(13),
        marginBottom: getSpacing(8),
    },
    editTextArea: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: getSpacing(8),
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(12),
        color: '#fff',
        fontSize: getFontSize(13),
        minHeight: getSpacing(isAndroid ? 60 : 70),
        textAlignVertical: 'top',
    },
    editFieldContainer: {
        marginBottom: getSpacing(12),
    },
    editInput: {
        // backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        borderRadius: getSpacing(8),
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(isAndroid ? 10 : 12),
        color: '#fff',
        fontSize: getFontSize(13),
    },
    addChurchButton: {
        backgroundColor: 'rgba(58, 124, 165, 0.6)',
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(6),
        borderRadius: getSpacing(6),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    addChurchText: {
        color: '#fff',
        fontSize: getFontSize(12),
        fontWeight: '500',
    },
    removeChurchButton: {
        backgroundColor: 'rgba(220, 53, 69, 0.6)',
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(6),
        borderRadius: getSpacing(6),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    removeChurchText: {
        color: '#fff',
        fontSize: getFontSize(12),
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#fff',
        borderRadius: getSpacing(12),
        paddingVertical: getButtonHeight(16),
        alignItems: 'center',
        marginTop: getSpacing(16),
        marginBottom: getSpacing(24),

    },
    submitButtonText: {
        color: '#1a5b77',
        fontSize: getFontSize(16),
        fontWeight: '700',
    },
    editActions: {
        flexDirection: 'row',
        gap: getSpacing(12),
        marginTop: getSpacing(16),
        marginBottom: getSpacing(24),
        width: '50%',
        alignSelf: 'center',
    },
    actionButton2: {
        flex: 1,
        paddingVertical: getButtonHeight(isAndroid ? 12 : 16),
        borderRadius: getSpacing(12),
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: getButtonHeight(isAndroid ? 12 : 14),
        backgroundColor: '#fff',
        borderRadius: getSpacing(10),
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#1a5b77',
        fontSize: getFontSize(16),
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        paddingVertical: getButtonHeight(isAndroid ? 12 : 14),
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: getSpacing(10),
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: getFontSize(16),
        fontWeight: '600',
    },
    deleteAction: {
        alignItems: 'flex-end',
        marginTop: getSpacing(30),
    },
    deleteActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(10),
        borderRadius: getSpacing(8),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    deleteActionButtonText: {
        color: 'red',
        fontSize: getFontSize(14),
        fontWeight: '500',
        marginLeft: getSpacing(8),
    },

    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: getSpacing(24),
        marginBottom: getSpacing(32),
        paddingBottom: getSpacing(24),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    gradientBorder: {
        padding: getSpacing(4),
        borderRadius: getSpacing(100),
    },
    avatarContainerNew: {
        width: getSpacing(isAndroid ? 80 : 100),
        height: getSpacing(isAndroid ? 80 : 100),
        borderRadius: getSpacing(isAndroid ? 40 : 80),
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    avatarImageNew: {
        width: '100%',
        height: '100%',
        borderRadius: getSpacing(isAndroid ? 40 : 80),
    },
    profileInfo: {
        flex: 1,
        marginLeft: getSpacing(24),
        justifyContent: 'center',
    },
    profileName: {
        fontSize: getFontSize(isAndroid ? 18 : 20),
        fontWeight: '700',
        color: '#fff',
        marginBottom: getSpacing(8),
    },
    roleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getSpacing(16),
    },
    profileRole: {
        fontSize: getFontSize(14),
        color: '#fff',
        marginRight: getSpacing(12),
    },
    menteeDot: {
        width: getSpacing(6),
        height: getSpacing(6),
        borderRadius: getSpacing(3),
        backgroundColor: '#FFC107',
        marginRight: getSpacing(6),
    },
    menteesText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#FFC107',
    },
    contactIcons: {
        flexDirection: 'row',
        gap: getSpacing(6),
    },
    contactIcon: {
        width: getSpacing(isAndroid ? 38 : 44),
        height: getSpacing(isAndroid ? 38 : 44),
        alignItems: 'center',
        justifyContent: 'center',
    },
});

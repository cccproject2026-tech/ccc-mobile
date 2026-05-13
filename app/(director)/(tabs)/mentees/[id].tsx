import ActionBottomSheet from '@/components/director/ActionSheetModal';
import TopBar from '@/components/director/TopBar';
import { icons } from '@/constants/images';
import { useMenteeByEmail } from '@/hooks/mentees/useMenteeByEmail';
import {
    getButtonHeight,
    getFontSize,
    getIconSize,
    getSpacing,
    isAndroid
} from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import AppGradientBackground from '@/components/layout/AppGradientBackground';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
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

interface MenteeData extends ProfileData {
    role: string;
    phase?: string;
    phaseNumber?: number;
    progress?: number;
    isCompleted: boolean;
    completedOn?: string;
    hasCertificate: boolean;
    isFieldMentor: boolean;
    fieldMentorStatus?: 'invited' | 'accepted' | 'not_invited';
    totalMentors: number;
    lastContacted?: string;
}

export default function MenteeProfile() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email?: string }>();
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<ProfileData & { role?: string }>>({});
    const { bottom } = useSafeAreaInsets();
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    // Fetch mentee data by email
    const { data: menteeDataFromApi, isLoading, isError } = useMenteeByEmail(email);

    const menuItems = [
        { icon: 'people-outline', label: 'List of Mentors', onPress: () => console.log('List of Mentors') },
        { icon: 'person-add-outline', label: 'Assign New Mentor', onPress: () => console.log('Assign New Mentor') },
        { icon: 'person-remove-outline', label: 'Remove a Mentor', onPress: () => console.log('Remove a Mentor') },
        { icon: 'clipboard-outline', label: 'View Roadmap', onPress: () => console.log('View Roadmap') },
        { icon: 'checkmark-done-outline', label: 'View Assessments', onPress: () => router.push.bind(router, '/(director)/(tabs)/assessments') },
        { icon: 'book-outline', label: 'View Assignments', onPress: () => console.log('View Assignments') },
        { icon: 'calendar-outline', label: 'Schedule a Meeting', onPress: () => console.log('Schedule a Meeting') },
        { icon: 'create-outline', label: 'Edit Profile', onPress: () => setIsEditing(true) },
    ];

    // Map API data to MenteeData format
    const initialMenteeData = useMemo<MenteeData>(() => {
        if (!menteeDataFromApi) {
            return {
                firstName: '',
                lastName: '',
                phone: '',
                email: email || '',
                role: '',
                title: '',
                yearsInMinistry: '',
                conference: '',
                profileInfo: '',
                phase: undefined,
                phaseNumber: undefined,
                progress: undefined,
                isCompleted: false,
                completedOn: undefined,
                hasCertificate: false,
                isFieldMentor: false,
                fieldMentorStatus: 'not_invited',
                totalMentors: 0,
                lastContacted: undefined,
                churches: [],
            };
        }

        return {
            firstName: menteeDataFromApi.firstName || '',
            lastName: menteeDataFromApi.lastName || '',
            phone: menteeDataFromApi.phoneNumber || '',
            email: menteeDataFromApi.email || email || '',
            role: menteeDataFromApi.role || 'Pastor',
            title: menteeDataFromApi.title || '',
            yearsInMinistry: menteeDataFromApi.yearsInMinistry || '',
            conference: menteeDataFromApi.conference || '',
            profileInfo: menteeDataFromApi.profileInfo || '',
            phase: undefined, // API doesn't provide phase
            phaseNumber: undefined, // API doesn't provide phaseNumber
            progress: undefined, // API doesn't provide progress
            isCompleted: false, // API doesn't provide isCompleted
            completedOn: undefined, // API doesn't provide completedOn
            hasCertificate: false, // API doesn't provide hasCertificate
            isFieldMentor: false, // API doesn't provide isFieldMentor
            fieldMentorStatus: 'not_invited', // API doesn't provide fieldMentorStatus
            totalMentors: 0, // API doesn't provide totalMentors
            lastContacted: undefined, // API doesn't provide lastContacted
            churches: menteeDataFromApi.churchDetails?.map((church: any) => ({
                name: church.churchName || church.name || '',
                phone: church.churchPhone || church.phone || '',
                website: church.churchWebsite || church.website || '',
                address: church.churchAddress || church.address || '',
                city: church.city || '',
                state: church.state || '',
                zip: church.zip || church.zipCode || '',
                country: church.country || '',
            })) || [],
        };
    }, [menteeDataFromApi, email]);

    const [menteeData, setMenteeData] = useState<MenteeData>(initialMenteeData);

    // Update mentee data when API data loads
    useEffect(() => {
        if (menteeDataFromApi) {
            setMenteeData(initialMenteeData);
        }
    }, [menteeDataFromApi, initialMenteeData]);

    // Bottom Sheet Handlers
    const handleOpenMenu = useCallback(() => {
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);
    const updateField = (field: keyof ProfileData, value: any) => {
        setMenteeData(prev => ({ ...prev, [field]: value }));
    };

    const updateChurch = (index: number, field: keyof ChurchInfo, value: string) => {
        setMenteeData(prev => {
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
        // Merge edit form into mentee data
        setMenteeData(prev => ({ ...prev, ...editForm } as MenteeData));
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleIssueCertificate = () => {
        setMenteeData(prev => ({ ...prev, hasCertificate: true }));
        Alert.alert('Success', 'Certificate issued successfully!');
    };

    const handleInviteAsFieldMentor = () => {
        if (menteeData.fieldMentorStatus === 'not_invited') {
            setMenteeData(prev => ({ ...prev, fieldMentorStatus: 'invited' }));
            Alert.alert('Success', 'Invitation sent successfully!');
        }
    };

    const handleAcceptFieldMentor = () => {
        // Mock accepting the invitation
        setMenteeData(prev => ({ ...prev, isFieldMentor: true, fieldMentorStatus: 'accepted' }));
        Alert.alert('Accepted', 'Field Mentor role accepted (mock).');
    };

    // Loading state
    if (isLoading) {
        return (
            <AppGradientBackground style={{ flex: 1 }}>
                <TopBar
                    userName="David Roe"
                    showUserName={true}
                    showNotifications={true}
                    notifications={3}
                    showDrawer={true}
                    showBackButton={false}
                />
                <View style={[styles.header, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 16 }}>Loading mentee profile...</Text>
                </View>
            </AppGradientBackground>
        );
    }

    // Error state
    if (isError) {
        return (
            <AppGradientBackground style={{ flex: 1 }}>
                <TopBar
                    userName="David Roe"
                    showUserName={true}
                    showNotifications={true}
                    notifications={3}
                    showDrawer={true}
                    showBackButton={false}
                />
                <View style={[styles.header, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
                    <Text style={{ color: '#fff', marginBottom: 16 }}>Failed to load mentee profile</Text>
                    <TouchableOpacity onPress={() => router.back()} style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </AppGradientBackground>
        );
    }

    const menteeName = menteeDataFromApi ? `${menteeDataFromApi.firstName} ${menteeDataFromApi.lastName}`.trim() : 'Mentee';

    // Determine which button to show
    const getActionButton = () => {
        // If not completed or progress < 100, show Edit Profile
        if (!menteeData.isCompleted || (menteeData.progress && menteeData.progress < 100)) {
            return (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setIsEditing(true)}
                >
                    <Text style={styles.actionButtonText}>Edit Profile</Text>
                    <Image source={icons.edit} style={{ width: getIconSize(18), height: getIconSize(18) }} />
                </TouchableOpacity>
            );
        }

        // If completed but no certificate, show Issue Certificate
        if (menteeData.isCompleted && !menteeData.hasCertificate) {
            return (
                <TouchableOpacity
                    style={[styles.actionButton]}
                    onPress={handleIssueCertificate}
                >
                    <Text style={styles.actionButtonText}>Issue Certificate</Text>
                    <Image source={icons.certificateBadge} style={{ width: getIconSize(18), height: getIconSize(18) }} />
                </TouchableOpacity>
            );
        }

        // If has certificate but not field mentor, show Invite as Field Mentor
        if (menteeData.hasCertificate && !menteeData.isFieldMentor) {
            const isInvited = menteeData.fieldMentorStatus === 'invited';
            // If invited, show Accept button to mock acceptance instead of Invite button
            if (isInvited) {
                return (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleAcceptFieldMentor}
                    >
                        <Text style={[styles.actionButtonText, { flex: 1, marginRight: 8 }]}>Accept Field Mentor Role</Text>
                        <Image source={icons.fieldMentorIcon} style={{ width: getIconSize(18), height: getIconSize(18) }} />
                    </TouchableOpacity>
                );
            }

            return (
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                    ]}
                    onPress={handleInviteAsFieldMentor}
                >
                    <Text
                        style={[styles.actionButtonText, { flex: 1, marginRight: 8 }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        Invite as Field Mentor
                    </Text>
                    <Image
                        source={icons.fieldMentorIcon}
                        style={{ width: getIconSize(18), height: getIconSize(18), flexShrink: 0 }}
                    />
                </TouchableOpacity>
            );
        }

        // If is field mentor, show Edit Profile
        return (
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsEditing(true)}
            >
                <Text style={styles.actionButtonText}>Edit Profile</Text>
                <Image source={icons.edit} style={{ width: getIconSize(18), height: getIconSize(18) }} />
            </TouchableOpacity>
        );
    };

    if (!isEditing) {
        return (
            <AppGradientBackground style={{ flex: 1 }}>
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
                        <Ionicons name="chevron-back" size={getIconSize(28)} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>{menteeName}</Text>
                        <Text style={styles.headerBreadcrumb}>Mentee {'>'} Profile</Text>
                    </View>
                    <TouchableOpacity style={styles.menuButton} onPress={handleOpenMenu}>
                        <Ionicons name="ellipsis-vertical" size={getIconSize(24)} color="#fff" />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.profileHeader}>
                        <LinearGradient
                            colors={['#7C3AED', '#38BDF8']}
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
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.profileName}>{menteeName}</Text>
                                <View style={styles.nameBadges}>
                                    {menteeData.hasCertificate && (
                                        <Image source={icons.certificateBadge} style={[styles.nameBadgeIcon, { width: getIconSize(20), height: getIconSize(20) }]} />
                                    )}
                                    {menteeData.isFieldMentor && (
                                        <Image source={icons.fieldMentorIcon} style={[styles.nameBadgeIcon, { width: getIconSize(20), height: getIconSize(20) }]} />
                                    )}
                                </View>
                            </View>
                            <View style={styles.roleRow}>
                                <Text style={styles.profileRole}>{menteeData.role}</Text>
                                {menteeData.lastContacted && (
                                    <>
                                        <View style={styles.menteeDot} />
                                        <Text style={styles.menteesText}>{menteeData.lastContacted}</Text>
                                    </>
                                )}
                            </View>

                            <Text style={styles.menteesText}>Total Mentors: {menteeData.totalMentors}</Text>

                            {/* Contact Icons */}
                            <View style={styles.contactIcons}>
                                <TouchableOpacity style={styles.contactIcon}>
                                    <Ionicons name="call-outline" size={getIconSize(24)} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactIcon}>
                                    <Ionicons name="chatbubble-outline" size={getIconSize(24)} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactIcon}>
                                    <Ionicons name="mail-outline" size={getIconSize(24)} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.contactIcon}>
                                    <Ionicons name="logo-whatsapp" size={getIconSize(24)} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {(!menteeData.isCompleted || (menteeData.progress && menteeData.progress < 100)) && menteeData.phase && (
                        <View style={styles.progressSection}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Progress</Text>
                                <Text style={styles.progressPercentage}>{menteeData.progress}%</Text>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View style={[
                                    styles.progressBar,
                                    { width: menteeData.progress !== undefined ? `${menteeData.progress}%` : '0%' }
                                ]} />
                            </View>

                            <TouchableOpacity
                                style={[styles.actionButton, { marginTop: 12 }]}
                                onPress={() => {
                                    setMenteeData(prev => ({ ...prev, progress: 100, isCompleted: true }));
                                    Alert.alert('Mock', 'Progress set to 100% (mock).');
                                }}
                            >
                                <Text style={styles.actionButtonText}>Mark Progress Complete (Mock)</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => console.log('Documents')}
                        >
                            <Text style={styles.actionButtonText}>Documents</Text>
                            <Image source={icons.documentsIcon} style={{ width: getIconSize(20), height: getIconSize(20) }} />
                            <View className="absolute -top-2 -right-2 bg-[#fff] w-7 h-7 rounded-full items-center justify-center border-2 border-white">
                                <Text className="text-xs font-bold text-[#1a5b77]">3</Text>
                            </View>
                        </TouchableOpacity>
                        {getActionButton()}
                    </View>

                    <View style={{ marginBottom: 16 }}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: '#fff',
                                marginBottom: 12,
                            }}
                        >
                            Profile Information
                        </Text>
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                                borderRadius: 12,
                                padding: 16,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#fff',
                                    fontSize: 14,
                                    lineHeight: 22,
                                }}
                            >
                                {menteeData.profileInfo}
                            </Text>
                        </View>
                    </View>

                    <View
                        style={{
                            borderWidth: StyleSheet.hairlineWidth,
                            borderColor: '#fff',
                            padding: 16,
                            borderRadius: 12,
                        }}
                    >
                        <View style={styles.viewSection}>
                            <Text style={styles.sectionTitle}>Personal Information</Text>
                            <View style={styles.row}>
                                <View style={[styles.viewField, styles.halfInput]}>
                                    <Text style={styles.viewFieldText}>
                                        First Name : {menteeData.firstName}
                                    </Text>
                                </View>
                                <View style={[styles.viewField, styles.halfInput]}>
                                    <Text style={styles.viewFieldText}>
                                        Last Name : {menteeData.lastName}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.viewField, styles.halfInput]}>
                                    <Text style={styles.viewFieldText}>
                                        Phone Number : {menteeData.phone}
                                    </Text>
                                </View>
                                <View style={[styles.viewField, styles.halfInput]}>
                                    <Text style={styles.viewFieldText}>Email : {menteeData.email}</Text>
                                </View>
                            </View>
                        </View>

                        {menteeData.churches.map((church, index) => (
                            <View key={index} style={styles.viewSection}>
                                <Text style={styles.sectionTitle}>
                                    Current Church -{index + 1} Information
                                </Text>
                                <View style={styles.viewField}>
                                    <Text style={styles.viewFieldText}>Church Name : {church.name}</Text>
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
                                <Text style={styles.viewFieldText}>Title : {menteeData.title}</Text>
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.viewField, styles.halfInput]}>
                                    <Text style={styles.viewFieldText}>
                                        Years in Ministry : {menteeData.yearsInMinistry}
                                    </Text>
                                </View>
                                <View style={[styles.viewField, styles.halfInput]}>
                                    <Text style={styles.viewFieldText}>
                                        Conference : {menteeData.conference}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.deleteAction}>
                        <TouchableOpacity style={[styles.deleteActionButton]} onPress={handleCancel}>
                            <Ionicons name="trash" size={getIconSize(18)} color="red" />
                            <Text style={styles.deleteActionButtonText}>Delete Profile</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* Bottom Sheet Modal */}
                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={menteeName}
                    subtitle={`${menteeData.totalMentors} Mentors`}
                    image={profileImage || undefined}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />
            </AppGradientBackground>
        );
    }

    return (
        <AppGradientBackground style={{ flex: 1 }}>
            <TopBar
                userName="David Roe"
                showUserName={true}
                showNotifications={true}
                notifications={3}
                showDrawer={true}
                showBackButton={false}
            />
            <TouchableOpacity onPress={handleCancel} className="flex-row items-center px-4 py-4 border-b border-white/30 ">
                <Ionicons name="chevron-back" size={getIconSize(28)} color="#fff" />
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
                            <Image source={icons.edit} style={{ width: getIconSize(18), height: getIconSize(18) }} />
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
                            <Image source={icons.edit} style={{ width: getIconSize(18), height: getIconSize(18) }} />
                        </TouchableOpacity>
                        <TextInput
                            style={styles.profileTextArea}
                            value={menteeData.profileInfo}
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

                    {/* Personal Information Section */}
                    <View style={styles.editSection}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.row}>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`First Name : ${menteeData.firstName}`}
                                    onChangeText={(text) => updateField('firstName', text.replace('First Name : ', ''))}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Last Name : ${menteeData.lastName}`}
                                    onChangeText={(text) => updateField('lastName', text.replace('Last Name : ', ''))}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Phone Number : ${menteeData.phone}`}
                                    onChangeText={(text) => updateField('phone', text.replace('Phone Number : ', ''))}
                                    keyboardType="phone-pad"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Email : ${menteeData.email}`}
                                    onChangeText={(text) => updateField('email', text.replace('Email : ', ''))}
                                    keyboardType="email-address"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                        </View>
                    </View>

                    {menteeData.churches.map((church, index) => (
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
                                value={`Title : ${menteeData.title}`}
                                onChangeText={(text) => updateField('title', text.replace('Title : ', ''))}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                            />
                        </View>
                        <View style={styles.row}>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Years in Ministry : ${menteeData.yearsInMinistry}`}
                                    onChangeText={(text) => updateField('yearsInMinistry', text.replace('Years in Ministry : ', ''))}
                                    keyboardType="numeric"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />
                            </View>
                            <View style={[styles.editFieldContainer, styles.halfInput]}>
                                <TextInput
                                    style={styles.editInput}
                                    value={`Conference : ${menteeData.conference}`}
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
        </AppGradientBackground>
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
    sectionTitle: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#fff',
        marginBottom: getSpacing(12),
    },
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
    progressSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: getSpacing(12),
        padding: getSpacing(16),
        marginBottom: getSpacing(16),
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: getSpacing(8),
    },
    progressLabel: {
        color: '#fff',
        fontSize: getFontSize(14),
        fontWeight: '600',
    },
    progressPercentage: {
        color: '#fff',
        fontSize: getFontSize(16),
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: getSpacing(8),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: getSpacing(4),
        overflow: 'hidden',
        marginBottom: getSpacing(8),
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: getSpacing(4),
    },
    phaseText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: getFontSize(12),
    },
    completionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: getSpacing(8),
        padding: getSpacing(12),
        marginBottom: getSpacing(16),
        gap: getSpacing(8),
    },
    completionText: {
        color: '#10B981',
        fontSize: getFontSize(14),
        fontWeight: '600',
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: getSpacing(8),
        marginBottom: getSpacing(16),
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getSpacing(12),
        paddingVertical: getSpacing(6),
        borderRadius: getSpacing(16),
        gap: getSpacing(4),
    },
    badgeText: {
        color: '#fff',
        fontSize: getFontSize(12),
        fontWeight: '600',
    },
    nameBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: getSpacing(8),
    },
    nameBadgeIcon: {
        marginLeft: getSpacing(6),
    },
    compactActionButton: {
        flex: 0,
        paddingHorizontal: getSpacing(12),
    },
});

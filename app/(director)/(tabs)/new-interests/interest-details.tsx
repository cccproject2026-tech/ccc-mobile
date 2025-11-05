import InterestRejectedModal from '@/components/director/InterestRejectedModal';
import RejectInterestModal from '@/components/director/RejectInterestModal';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('@/assets/logos/CCClogo.png');

export default function InterestFormScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectedConfirmation, setShowRejectedConfirmation] = useState(false);

    const [formData, setFormData] = useState({
        firstName: 'John',
        lastName: 'Ross',
        phoneNumber: '09878564398',
        email: 'johnross@gmail.com',
        churchName: 'Loma linda University Church',
        churchPhone: '09878564398',
        churchWebsite: 'johnross@gmail.com',
        churchAddress: 'Loma linda University Church,CA',
        city: 'Oakland',
        state: 'North American',
        zipCode: '00000',
        country: 'USA',
        church2Name: 'Loma linda University Church',
        church2Phone: '09878564398',
        church2Website: 'johnross@gmail.com',
        church2Address: 'Loma linda University Church,CA',
        city2: 'Oakland',
        state2: 'North American',
        zipCode2: '00000',
        country2: 'USA',
        title: 'Pastor',
        yearsInMinistry: 'Years in Ministry : 11',
        conference: 'Okhland',
        serviceProjects: 'Current Community Service Projects : 11',
        interests: 'I would like to find out more about the Center for Community Change\n\nI am a conference administrator and would like to find out more about partnering with the center',
        comments: 'I am a conference administrator and would like to find out more about partnering with the center I conference administrator and would like to find out more about partnering with the center',
    });

    const handleReject = () => setShowRejectModal(true);
    // const handleNext = () => setShowAcceptModal(true);
    const handleNext = () => router.push('/(director)/(tabs)/new-interests/assign-scholorship');
    const handleAddToPending = () => router.back();
    const handleConfirmReject = () => {
        setShowRejectModal(false);
        setShowRejectedConfirmation(true);
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: bottom + 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={styles.headerCenter}>
                            <LinearGradient
                                colors={["#7C3AED", "#38BDF8"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBorder}
                            >
                                <View style={styles.titleContainer}>
                                    <Text style={styles.titleText}>Interest Form</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        <Pressable hitSlop={10} style={styles.logoButton}>
                            <Image source={LOGO} style={styles.logo} />
                        </Pressable>
                    </View>


                    {/* User Info Card */}
                    <View style={styles.userCard}>
                        <View style={styles.userCardTop}>
                            <View style={styles.avatarContainer}>
                                <Ionicons name="person-outline" size={Platform.OS === 'android' ? 24 : 28} color="#fff" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.userName}>John Doe</Text>
                                <Text style={styles.userRole}>Pastor</Text>
                            </View>
                        </View>

                        {/* Contact Icons */}
                        <View style={styles.contactIcons}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="call-outline" size={Platform.OS === 'android' ? 20 : 22} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="chatbubble-outline" size={Platform.OS === 'android' ? 20 : 22} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="mail-outline" size={Platform.OS === 'android' ? 20 : 22} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="logo-whatsapp" size={Platform.OS === 'android' ? 20 : 22} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Personal Information */}
                    <View style={{
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.3)',
                        borderRadius: Platform.OS === 'android' ? 16 : 20,
                        marginHorizontal: Platform.OS === 'android' ? 12 : 16,
                        paddingVertical: Platform.OS === 'android' ? 12 : 16,
                    }}>

                        <View style={styles.sectionBorder}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Personal Information</Text>

                                <View style={styles.row}>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>First Name</Text>
                                        <Text style={styles.fieldValue}>{formData.firstName}</Text>
                                    </View>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Last Name</Text>
                                        <Text style={styles.fieldValue}>{formData.lastName}</Text>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Phone Number</Text>
                                        <Text style={styles.fieldValue}>{formData.phoneNumber}</Text>
                                    </View>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Email</Text>
                                        <Text style={styles.fieldValue}>{formData.email}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {/* Current Church -1 Information */}
                        <View style={styles.sectionBorder}>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Current Church -1 Information</Text>

                                <View style={[styles.input, styles.readOnlyField]}>
                                    <Text style={styles.fieldLabel}>Church Name</Text>
                                    <Text style={styles.fieldValue}>{formData.churchName}</Text>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Church Phone</Text>
                                        <Text style={styles.fieldValue}>{formData.churchPhone}</Text>
                                    </View>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Church Website</Text>
                                        <Text style={styles.fieldValue}>{formData.churchWebsite}</Text>
                                    </View>
                                </View>

                                <View style={[styles.input, styles.readOnlyField]}>
                                    <Text style={styles.fieldLabel}>Church Address</Text>
                                    <Text style={styles.fieldValue}>{formData.churchAddress}</Text>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>City</Text>
                                        <Text style={styles.fieldValue}>{formData.city}</Text>
                                    </View>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>State</Text>
                                        <Text style={styles.fieldValue}>{formData.state}</Text>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Zip Code</Text>
                                        <Text style={styles.fieldValue}>{formData.zipCode}</Text>
                                    </View>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Country</Text>
                                        <Text style={styles.fieldValue}>{formData.country}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {/* Current Church -2 Information */}
                        <View style={styles.sectionBorder}>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Current Church -2 Information</Text>

                                <View style={[styles.input, styles.readOnlyField]}>
                                    <Text style={styles.fieldLabel}>Current Church</Text>
                                    <Text style={styles.fieldValue}>{formData.church2Name}</Text>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Church Phone</Text>
                                        <Text style={styles.fieldValue}>{formData.church2Phone}</Text>
                                    </View>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Church Website</Text>
                                        <Text style={styles.fieldValue}>{formData.church2Website}</Text>
                                    </View>
                                </View>

                                <View style={[styles.input, styles.readOnlyField]}>
                                    <Text style={styles.fieldLabel}>Church Address</Text>
                                    <Text style={styles.fieldValue}>{formData.church2Address}</Text>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>City</Text>
                                        <Text style={styles.fieldValue}>{formData.city2}</Text>
                                    </View>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>State</Text>
                                        <Text style={styles.fieldValue}>{formData.state2}</Text>
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Zip Code</Text>
                                        <Text style={styles.fieldValue}>{formData.zipCode2}</Text>
                                    </View>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Country</Text>
                                        <Text style={styles.fieldValue}>{formData.country2}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {/* Other Information */}
                        <View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Other Information</Text>

                                <View style={[styles.input, styles.readOnlyField]}>
                                    <Text style={styles.fieldLabel}>Title</Text>
                                    <Text style={styles.fieldValue}>{formData.title}</Text>
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Years in Ministry</Text>
                                        <Text style={styles.fieldValue}>{formData.yearsInMinistry}</Text>
                                    </View>
                                    <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                        <Text style={styles.fieldLabel}>Conference</Text>
                                        <Text style={styles.fieldValue}>{formData.conference}</Text>
                                    </View>
                                </View>

                                <View style={[styles.input, styles.readOnlyField]}>
                                    <Text style={styles.fieldLabel}>Current Community Service Projects</Text>
                                    <Text style={styles.fieldValue}>{formData.serviceProjects}</Text>
                                </View>

                                <View style={[styles.input, styles.textArea, styles.readOnlyField]}>
                                    <Text style={styles.fieldLabel}>Interests</Text>
                                    <Text style={styles.fieldValue}>{formData.interests}</Text>
                                </View>

                                <View style={[styles.input, styles.textArea, styles.readOnlyField]}>
                                    <Text style={styles.fieldLabel}>Comments</Text>
                                    <Text style={styles.fieldValue}>{formData.comments}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <Pressable style={styles.rejectButton} onPress={handleReject}>
                            <Text style={styles.buttonText}>REJECT</Text>
                        </Pressable>
                        <Pressable style={styles.nextButton} onPress={handleNext}>
                            <Text style={[styles.buttonText, { color: '#fff' }]}>NEXT</Text>
                        </Pressable>
                    </View>

                    <View style={styles.pendingButtonContainer}>
                        <Pressable style={styles.pendingButton} onPress={handleAddToPending}>
                            <Ionicons name="arrow-back" size={Platform.OS === 'android' ? 18 : 20} color="#fff" />
                            <Text style={styles.pendingButtonText}>Add to Pending</Text>
                        </Pressable>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modals */}
            <RejectInterestModal
                visible={showRejectModal}
                onCancel={() => setShowRejectModal(false)}
                onConfirmReject={handleConfirmReject}
            />

            <InterestRejectedModal
                visible={showRejectedConfirmation}
                onClose={() => {
                    setShowRejectedConfirmation(false);
                    router.back();
                }}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2563A8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
        paddingTop: Platform.OS === 'android' ? 16 : 24,
        paddingBottom: Platform.OS === 'android' ? 12 : 16,
        position: 'relative',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
    },
    titleContainer: {
        backgroundColor: '#176192',
        borderRadius: Platform.OS === 'android' ? 8 : 11,
        paddingVertical: Platform.OS === 'android' ? 6 : 9,
        paddingHorizontal: Platform.OS === 'android' ? 20 : 28,
    },
    titleText: {
        color: '#E2E8F0',
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: '600',
    },
    logoButton: {
        width: Platform.OS === 'android' ? 32 : 36,
        height: Platform.OS === 'android' ? 32 : 36,
        borderRadius: Platform.OS === 'android' ? 16 : 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.65)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: Platform.OS === 'android' ? 24 : 27,
        height: Platform.OS === 'android' ? 24 : 27,
        borderRadius: Platform.OS === 'android' ? 12 : 15,
    },
    userCard: {
        marginHorizontal: Platform.OS === 'android' ? 12 : 16,
        marginBottom: Platform.OS === 'android' ? 16 : 24,
        padding: Platform.OS === 'android' ? 12 : 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: Platform.OS === 'android' ? 12 : 16,
    },
    userCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Platform.OS === 'android' ? 12 : 16,
    },
    avatarContainer: {
        width: Platform.OS === 'android' ? 48 : 56,
        height: Platform.OS === 'android' ? 48 : 56,
        backgroundColor: '#14517D',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: Platform.OS === 'android' ? 24 : 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Platform.OS === 'android' ? 10 : 12,
    },
    userName: {
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    userRole: {
        fontSize: Platform.OS === 'android' ? 14 : 16,
        color: 'rgba(255,255,255,0.8)',
    },
    contactIcons: {
        flexDirection: 'row',
        gap: Platform.OS === 'android' ? 12 : 16,
    },
    iconButton: {
        width: Platform.OS === 'android' ? 36 : 40,
        height: Platform.OS === 'android' ? 36 : 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    section: {
        paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
        marginBottom: Platform.OS === 'android' ? 8 : 12,
    },
    sectionTitle: {
        fontSize: Platform.OS === 'android' ? 14 : 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: Platform.OS === 'android' ? 8 : 10,
    },
    row: {
        flexDirection: 'row',
        gap: Platform.OS === 'android' ? 8 : 12,
    },
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: Platform.OS === 'android' ? 8 : 10,
        paddingHorizontal: Platform.OS === 'android' ? 10 : 12,
        paddingVertical: Platform.OS === 'android' ? 8 : 10,
        fontSize: Platform.OS === 'android' ? 14 : 15,
        color: '#fff',
        marginBottom: Platform.OS === 'android' ? 8 : 10,
    },
    halfInput: {
        flex: 1,
    },
    textArea: {
        minHeight: Platform.OS === 'android' ? 80 : 100,
        paddingTop: Platform.OS === 'android' ? 8 : 10,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: Platform.OS === 'android' ? 12 : 16,
        marginVertical: Platform.OS === 'android' ? 16 : 24,
        width: Platform.OS === 'android' ? '60%' : '50%',
        alignSelf: 'center',
    },
    rejectButton: {
        flex: 1,
        paddingVertical: Platform.OS === 'android' ? 10 : 14,
        backgroundColor: '#fff',
        borderRadius: Platform.OS === 'android' ? 8 : 10,
        alignItems: 'center',
    },
    nextButton: {
        flex: 1,
        paddingVertical: Platform.OS === 'android' ? 10 : 14,
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: Platform.OS === 'android' ? 8 : 10,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: Platform.OS === 'android' ? 14 : 16,
        fontWeight: '600',
        color: '#1a5b77',
    },
    pendingButtonContainer: {
        marginHorizontal: 16,
        marginBottom: Platform.OS === 'android' ? 16 : 24,
        alignItems: 'flex-start',
    },
    pendingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.16)',
        paddingVertical: Platform.OS === 'android' ? 8 : 12,
        paddingHorizontal: Platform.OS === 'android' ? 16 : 20,
        borderRadius: Platform.OS === 'android' ? 8 : 10,
    },
    pendingButtonText: {
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: '500',
        color: '#fff',
        marginLeft: Platform.OS === 'android' ? 8 : 12,
    },


    sectionBorder: {
        borderBottomColor: '#ccc',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomStartRadius: 50,
        borderBottomEndRadius: 50,
        marginBottom: Platform.OS === 'android' ? 12 : 20,
    },
    readOnlyField: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.3)',
    },
    fieldLabel: {
        fontSize: Platform.OS === 'android' ? 11 : 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: Platform.OS === 'android' ? 2 : 4,
    },
    fieldValue: {
        fontSize: Platform.OS === 'android' ? 13 : 14,
        color: '#fff',
        fontWeight: '500',
        lineHeight: Platform.OS === 'android' ? 16 : 18,
    },
});

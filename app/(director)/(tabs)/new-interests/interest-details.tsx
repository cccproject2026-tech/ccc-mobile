import InterestRejectedModal from '@/components/director/InterestRejectedModal';
import RejectInterestModal from '@/components/director/RejectInterestModal';
import { useInterests, useUpdateInterestStatus } from '@/hooks/interests/useInterests';
import { InterestItem } from '@/types/interest.types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import KeyboardSafeContainer from '@/components/layout/KeyboardSafeContainer';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('@/assets/logos/CCClogo.png');

/**
 * Maps API InterestItem to form data structure
 */
const mapInterestToFormData = (interest: InterestItem) => {
    const church1 = interest.churchDetails?.[0] || {};
    const church2 = interest.churchDetails?.[1] || {};

    return {
        firstName: interest.firstName || '',
        lastName: interest.lastName || '',
        phoneNumber: interest.phoneNumber || '',
        email: interest.email || '',
        churchName: church1.churchName || '',
        churchPhone: church1.churchPhone || '',
        churchWebsite: church1.churchWebsite || '',
        churchAddress: church1.churchAddress || '',
        city: church1.city || '',
        state: church1.state || '',
        zipCode: church1.zipCode || '',
        country: church1.country || '',
        church2Name: church2.churchName || '',
        church2Phone: church2.churchPhone || '',
        church2Website: church2.churchWebsite || '',
        church2Address: church2.churchAddress || '',
        city2: church2.city || '',
        state2: church2.state || '',
        zipCode2: church2.zipCode || '',
        country2: church2.country || '',
        title: interest.title || '',
        yearsInMinistry: interest.yearsInMinistry ? `${interest.yearsInMinistry}` : '',
        conference: interest.conference || '',
        serviceProjects: interest.currentCommunityProjects || '',
        interests: interest.interests?.join('\n\n') || '',
        comments: interest.comments || '',
    };
};

export default function InterestFormScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const { interestId } = useLocalSearchParams<{ interestId: string }>();

    // Fetch all interests
    const { data: interestsData, isLoading } = useInterests();

    // Find the specific interest by ID (using _id from backend)
    const interest: InterestItem | undefined = useMemo(() => {
        if (!interestsData || !interestId) return undefined;
        return interestsData.find((item) => item._id === interestId);
    }, [interestsData, interestId]);

    // Map interest to form data
    const formData = useMemo(() => {
        if (!interest) {
            // Return empty defaults if no interest found
            return {
                firstName: '',
                lastName: '',
                phoneNumber: '',
                email: '',
                churchName: '',
                churchPhone: '',
                churchWebsite: '',
                churchAddress: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                church2Name: '',
                church2Phone: '',
                church2Website: '',
                church2Address: '',
                city2: '',
                state2: '',
                zipCode2: '',
                country2: '',
                title: '',
                yearsInMinistry: '',
                conference: '',
                serviceProjects: '',
                interests: '',
                comments: '',
            };
        }
        return mapInterestToFormData(interest);
    }, [interest]);

    // Get user name and role for display
    const userName = useMemo(() => {
        if (!interest) return 'Unknown';
        const name = [interest.firstName, interest.lastName].filter(Boolean).join(' ');
        return name || 'Unknown';
    }, [interest]);

    const userRole = interest?.title || 'N/A';

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showRejectedConfirmation, setShowRejectedConfirmation] = useState(false);

    // Mutation for updating interest status
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateInterestStatus();

    const handleReject = () => setShowRejectModal(true);

    const handleAccept = () => {
        if (!interest?._id) {
            Alert.alert('Error', 'Interest ID not found');
            return;
        }

        updateStatus(
            { interestId: interest._id, status: 'accepted' },
            {
                onSuccess: () => {
                    Alert.alert('Success', 'Interest request accepted successfully', [
                        {
                            text: 'OK',
                            onPress: () => router.push('/(director)/(tabs)/new-interests/assign-scholorship'),
                        },
                    ]);
                },
                onError: (error) => {
                    Alert.alert('Error', error.message || 'Failed to accept interest request');
                },
            }
        );
    };


    const handleAddToPending = () => router.back();

    const handleConfirmReject = () => {
        if (!interest?._id) {
            Alert.alert('Error', 'Interest ID not found');
            return;
        }

        updateStatus(
            { interestId: interest._id, status: 'rejected' },
            {
                onSuccess: () => {
                    setShowRejectModal(false);
                    setShowRejectedConfirmation(true);
                },
                onError: (error) => {
                    Alert.alert('Error', error.message || 'Failed to reject interest request');
                    setShowRejectModal(false);
                },
            }
        );
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}>
            <KeyboardSafeContainer
                contentContainerStyle={{ paddingBottom: bottom + 20 }}
                useSafeAreaBottom
                extraScrollHeight={24}
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

                    {/* Loading State */}
                    {isLoading ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <ActivityIndicator color="#fff" size="large" />
                            <Text style={{ color: '#fff', marginTop: 12 }}>Loading interest details...</Text>
                        </View>
                    ) : !interest ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>
                                Interest not found
                            </Text>
                            <Pressable
                                onPress={() => router.back()}
                                style={{
                                    marginTop: 16,
                                    paddingHorizontal: 20,
                                    paddingVertical: 10,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    borderRadius: 8,
                                }}
                            >
                                <Text style={{ color: '#fff' }}>Go Back</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            {/* User Info Card */}
                            <View style={styles.userCard}>
                                <View style={styles.userCardTop}>
                                    <View style={styles.avatarContainer}>
                                        <Ionicons name="person-outline" size={Platform.OS === 'android' ? 24 : 28} color="#fff" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.userName}>{userName}</Text>
                                        <Text style={styles.userRole}>{userRole}</Text>
                                    </View>
                                </View>

                                {/* Contact Icons */}
                                <View style={styles.contactIcons}>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => {
                                            if (interest?.phoneNumber) {
                                                // Open phone dialer
                                                const phoneUrl = `tel:${interest.phoneNumber.replace(/[^0-9+]/g, '')}`;
                                                // Linking.openURL(phoneUrl); // Uncomment if Linking is imported
                                                console.log('Call:', interest.phoneNumber);
                                            }
                                        }}
                                    >
                                        <Ionicons name="call-outline" size={Platform.OS === 'android' ? 20 : 22} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => console.log('Chat:', interest?.email)}
                                    >
                                        <Ionicons name="chatbubble-outline" size={Platform.OS === 'android' ? 20 : 22} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => {
                                            if (interest?.email) {
                                                // Open email client
                                                const emailUrl = `mailto:${interest.email}`;
                                                // Linking.openURL(emailUrl); // Uncomment if Linking is imported
                                                console.log('Email:', interest.email);
                                            }
                                        }}
                                    >
                                        <Ionicons name="mail-outline" size={Platform.OS === 'android' ? 20 : 22} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        onPress={() => {
                                            if (interest?.phoneNumber) {
                                                // Open WhatsApp
                                                const phone = interest.phoneNumber.replace(/[^0-9+]/g, '');
                                                const whatsappUrl = `https://wa.me/${phone}`;
                                                // Linking.openURL(whatsappUrl); // Uncomment if Linking is imported
                                                console.log('WhatsApp:', interest.phoneNumber);
                                            }
                                        }}
                                    >
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
                                                <Text style={styles.fieldValue}>{formData.firstName || 'N/A'}</Text>
                                            </View>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Last Name</Text>
                                                <Text style={styles.fieldValue}>{formData.lastName || 'N/A'}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Phone Number</Text>
                                                <Text style={styles.fieldValue}>{formData.phoneNumber || 'N/A'}</Text>
                                            </View>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Email</Text>
                                                <Text style={styles.fieldValue}>{formData.email || 'N/A'}</Text>
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
                                            <Text style={styles.fieldValue}>{formData.churchName || 'N/A'}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Church Phone</Text>
                                                <Text style={styles.fieldValue}>{formData.churchPhone || 'N/A'}</Text>
                                            </View>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Church Website</Text>
                                                <Text style={styles.fieldValue}>{formData.churchWebsite || 'N/A'}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.input, styles.readOnlyField]}>
                                            <Text style={styles.fieldLabel}>Church Address</Text>
                                            <Text style={styles.fieldValue}>{formData.churchAddress || 'N/A'}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>City</Text>
                                                <Text style={styles.fieldValue}>{formData.city || 'N/A'}</Text>
                                            </View>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>State</Text>
                                                <Text style={styles.fieldValue}>{formData.state || 'N/A'}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Zip Code</Text>
                                                <Text style={styles.fieldValue}>{formData.zipCode || 'N/A'}</Text>
                                            </View>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Country</Text>
                                                <Text style={styles.fieldValue}>{formData.country || 'N/A'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* Current Church -2 Information */}
                                {formData.church2Name && (
                                    <View style={styles.sectionBorder}>
                                        <View style={styles.section}>
                                            <Text style={styles.sectionTitle}>Current Church -2 Information</Text>

                                            <View style={[styles.input, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Current Church</Text>
                                                <Text style={styles.fieldValue}>{formData.church2Name || 'N/A'}</Text>
                                            </View>

                                            <View style={styles.row}>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>Church Phone</Text>
                                                    <Text style={styles.fieldValue}>{formData.church2Phone || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>Church Website</Text>
                                                    <Text style={styles.fieldValue}>{formData.church2Website || 'N/A'}</Text>
                                                </View>
                                            </View>

                                            <View style={[styles.input, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Church Address</Text>
                                                <Text style={styles.fieldValue}>{formData.church2Address || 'N/A'}</Text>
                                            </View>

                                            <View style={styles.row}>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>City</Text>
                                                    <Text style={styles.fieldValue}>{formData.city2 || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>State</Text>
                                                    <Text style={styles.fieldValue}>{formData.state2 || 'N/A'}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.row}>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>Zip Code</Text>
                                                    <Text style={styles.fieldValue}>{formData.zipCode2 || 'N/A'}</Text>
                                                </View>
                                                <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                    <Text style={styles.fieldLabel}>Country</Text>
                                                    <Text style={styles.fieldValue}>{formData.country2 || 'N/A'}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {/* Other Information */}
                                <View>
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>Other Information</Text>

                                        <View style={[styles.input, styles.readOnlyField]}>
                                            <Text style={styles.fieldLabel}>Title</Text>
                                            <Text style={styles.fieldValue}>{formData.title || 'N/A'}</Text>
                                        </View>

                                        <View style={styles.row}>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Years in Ministry</Text>
                                                <Text style={styles.fieldValue}>{formData.yearsInMinistry || 'N/A'}</Text>
                                            </View>
                                            <View style={[styles.input, styles.halfInput, styles.readOnlyField]}>
                                                <Text style={styles.fieldLabel}>Conference</Text>
                                                <Text style={styles.fieldValue}>{formData.conference || 'N/A'}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.input, styles.readOnlyField]}>
                                            <Text style={styles.fieldLabel}>Current Community Service Projects</Text>
                                            <Text style={styles.fieldValue}>{formData.serviceProjects || 'N/A'}</Text>
                                        </View>

                                        <View style={[styles.input, styles.textArea, styles.readOnlyField]}>
                                            <Text style={styles.fieldLabel}>Interests</Text>
                                            <Text style={styles.fieldValue}>{formData.interests || 'N/A'}</Text>
                                        </View>

                                        <View style={[styles.input, styles.textArea, styles.readOnlyField]}>
                                            <Text style={styles.fieldLabel}>Comments</Text>
                                            <Text style={styles.fieldValue}>{formData.comments || 'N/A'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <Pressable
                                    style={[styles.rejectButton, isUpdatingStatus && styles.buttonDisabled]}
                                    onPress={handleReject}
                                    disabled={isUpdatingStatus}
                                >
                                    <Text style={styles.buttonText}>REJECT</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.nextButton, isUpdatingStatus && styles.buttonDisabled]}
                                    onPress={handleAccept}
                                    disabled={isUpdatingStatus}
                                >
                                    {isUpdatingStatus ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={[styles.buttonText, { color: '#fff' }]}>ACCEPT</Text>
                                    )}
                                </Pressable>
                            </View>

                            <View style={styles.pendingButtonContainer}>
                                <Pressable style={styles.pendingButton} onPress={handleAddToPending}>
                                    <Ionicons name="arrow-back" size={Platform.OS === 'android' ? 18 : 20} color="#fff" />
                                    <Text style={styles.pendingButtonText}>Add to Pending</Text>
                                </Pressable>
                            </View>
                        </>
                    )}
            </KeyboardSafeContainer>

            {/* Modals */}
            <RejectInterestModal
                visible={showRejectModal}
                onCancel={() => setShowRejectModal(false)}
                onConfirmReject={handleConfirmReject}
            // isLoading={isUpdatingStatus}
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
    buttonDisabled: {
        opacity: 0.6,
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

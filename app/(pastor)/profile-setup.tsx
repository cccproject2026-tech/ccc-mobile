// app/(pastor)/profile-upload.tsx
import TopBar from '@/components/director/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { icons } from '@/constants/images';
import { useUploadDocument, useUploadProfilePicture } from '@/hooks/profile/useProfile';
import { useAuthStore } from '@/stores/auth.store';
import { markPastorMentorIntroStart } from '@/utils/pastorMentorIntro';
import { useOnboardingStore } from '@/stores/onboarding.store';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';


export default function ProfileUpload() {
    const router = useRouter();

    // Store hooks
    const { setCurrentStep, setHasProfilePicture } = useOnboardingStore();
    const { user } = useAuthStore();

    // Backend upload mutations
    const uploadProfilePicture = useUploadProfilePicture();
    const uploadDocument = useUploadDocument();

    // Loading states
    const [imageLoading, setImageLoading] = useState(false);
    const [documentLoading, setDocumentLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Upload states
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [documentName, setDocumentName] = useState<string | null>(null);

    const hasUploaded = !!profileImage || !!documentName;

    // ⭐ REAL BACKEND: IMAGE UPLOAD
    const handleImageUpload = useCallback(async () => {
        try {
            setImageLoading(true);

            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'We need access to your photos to upload an image.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const imageUri = asset.uri;

                setProfileImage(imageUri);

                // ⬇️ SEND TO REAL BACKEND
                await uploadProfilePicture.mutateAsync({
                    uri: asset.uri,
                    type: asset.mimeType || 'image/jpeg',
                    name: asset.fileName || `profile-${Date.now()}.jpg`,
                });

                Alert.alert('Success', 'Profile image uploaded successfully!');
                console.log('✅ Uploaded:', asset.uri);
            }
        } catch (error) {
            console.error('❌ Image upload error:', error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
            setImageLoading(false);
        }
    }, [uploadProfilePicture]);

    // ⭐ REAL BACKEND: DOCUMENT UPLOAD
    const handleDocumentUpload = useCallback(async () => {
        try {
            setDocumentLoading(true);

            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const doc = result.assets[0];

                setDocumentName(doc.name);

                // ⬇️ SEND DOCUMENT TO BACKEND
                await uploadDocument.mutateAsync({
                    uri: doc.uri,
                    name: doc.name,
                    type: doc.mimeType || 'application/pdf',
                });

                Alert.alert('Success', 'Document uploaded successfully!');
                console.log('✅ Document uploaded:', doc.name);
            }
        } catch (error) {
            console.error('❌ Document upload error:', error);
            Alert.alert('Error', 'Failed to upload document. Please try again.');
        } finally {
            setDocumentLoading(false);
        }
    }, [uploadDocument]);

    // Handle continue
    const handleContinue = useCallback(async () => {
        try {
            setActionLoading(true);

            // nothing to upload here — uploads already happened in handlers above

            setHasProfilePicture(true);
            setCurrentStep('complete');

            if (user?.id) {
                try {
                    await markPastorMentorIntroStart(user.id);
                } catch {
                    /* non-blocking */
                }
            }

            router.replace('/(pastor)/(tabs)');
        } catch (error) {
            console.error('❌ Continue error:', error);
            Alert.alert('Error', 'Something went wrong while completing setup.');
        } finally {
            setActionLoading(false);
        }
    }, [setCurrentStep, setHasProfilePicture, router, user?.id]);

    return (
        <LinearGradient
            colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
            style={{ flex: 1, justifyContent: 'space-between' }}
        >
            <View style={styles.scrollContainer}>
                <TopBar role="pastor" showUserName />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.content}>
                        {/* Header */}
                        <View style={styles.headerRow}>
                            <Text style={styles.incompleteText}>Your profile is incomplete</Text>

                            <TouchableOpacity
                                style={styles.skipButton}
                                onPress={handleContinue}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFFCC" />
                                ) : (
                                    <>
                                        <Text style={styles.skipText}>
                                            {hasUploaded ? 'Continue' : 'Skip'}
                                        </Text>
                                        <IconSymbol
                                            name="chevron.right"
                                            size={12}
                                            weight="medium"
                                            color={'#FFFFFFCC'}
                                        />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Upload Card */}
                        <View style={styles.uploadCard}>
                            <View style={styles.avatarContainer}>
                                {profileImage ? (
                                    <Image
                                        source={{ uri: profileImage }}
                                        style={{ width: 100, height: 100, borderRadius: 50 }}
                                    />
                                ) : (
                                    <Image
                                        source={icons.profileUpload}
                                        style={{ width: 80, height: 80 }}
                                    />
                                )}
                            </View>
                            <Text style={styles.sectionTitle}>Upload your profile photo</Text>
                           

                            {/* Upload Image Button */}
                            <TouchableOpacity
                                style={styles.uploadImageButton}
                                onPress={handleImageUpload}
                                disabled={imageLoading || actionLoading}
                            >
                                {imageLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={styles.uploadImageText}>Upload Image</Text>
                                        <Image
                                            source={icons.gradientUpload}
                                            style={{ width: 18, height: 18 }}
                                        />
                                    </>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.sectionTitle}>Upload supporting documents</Text>
                            <Text style={styles.sectionHint}>
                                Examples: ID proof, church letter, certificates
                            </Text>

                            {/* Upload Document Button */}
                            <TouchableOpacity
                                style={styles.uploadDocButton}
                                onPress={handleDocumentUpload}
                                disabled={documentLoading || actionLoading}
                            >
                                {documentLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Text style={styles.uploadDocText}>
                                            {documentName
                                                ? 'Uploaded: ' + documentName
                                                : 'Upload Documents'}
                                        </Text>
                                        <Image
                                            source={icons.gradientClip}
                                            style={{ width: 18, height: 18 }}
                                        />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Bottom Logo */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={icons.universityIcon}
                                resizeMode="contain"
                                style={{ height: 40 }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    content: {
        flex: 1,
        marginTop: 52,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    incompleteText: {
        fontFamily: 'AlbertBold',
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
        color: '#E9E010',
    },
    skipButton: {
        height: 38,
        width: 120,
        borderColor: '#FFFFFF',
        borderWidth: 1,
        borderRadius: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
        color: '#FFFFFFCC',
    },
    uploadCard: {
        marginTop: 70,
        borderRadius: 15,
        paddingVertical: 50,
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
    },
    avatarContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        textAlign: 'center',
    },
    sectionHint: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 14,
    },
    uploadImageButton: {
        backgroundColor: '#304C89',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    uploadImageText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    uploadDocButton: {
        backgroundColor: '#1A5490',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    uploadDocText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 80,
        marginBottom: 60,
    },
});

// app/(pastor)/profile-upload.tsx
import TopBar from '@/components/director/TopBar';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { icons } from '@/constants/images';
import { useAuthStore } from '@/stores/auth.store';
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

    // Loading states
    const [imageLoading, setImageLoading] = useState(false);
    const [documentLoading, setDocumentLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Upload states
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [documentName, setDocumentName] = useState<string | null>(null);

    const hasUploaded = !!profileImage || !!documentName;

    // Mock backend upload function
    const mockBackendUpload = useCallback(
        async (fileUri: string, type: 'image' | 'document') => {
            console.log(`📤 Uploading ${type} to backend:`, fileUri);
            await new Promise((resolve) => setTimeout(resolve, 1200));
            console.log(`✅ ${type} uploaded successfully`);
        },
        []
    );

    // Handle image upload
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
                const imageUri = result.assets[0].uri;
                setProfileImage(imageUri);

                // Simulate backend upload
                await mockBackendUpload(imageUri, 'image');

                Alert.alert('Success', 'Profile image uploaded successfully!');
                console.log('✅ Profile image set');
            }
        } catch (error) {
            console.error('❌ Image upload error:', error);
            Alert.alert('Error', 'Failed to upload image. Please try again.');
        } finally {
            setImageLoading(false);
        }
    }, [mockBackendUpload]);

    // Handle document upload
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

                // Simulate backend upload
                await mockBackendUpload(doc.uri, 'document');

                Alert.alert('Success', 'Document uploaded successfully!');
                console.log('✅ Document uploaded:', doc.name);
            }
        } catch (error) {
            console.error('❌ Document upload error:', error);
            Alert.alert('Error', 'Failed to upload document. Please try again.');
        } finally {
            setDocumentLoading(false);
        }
    }, [mockBackendUpload]);

    // Handle continue
    const handleContinue = useCallback(async () => {
        try {
            setActionLoading(true);

            if (hasUploaded) {
                // Mock backend sync
                await new Promise((resolve) => setTimeout(resolve, 1000));
                console.log('✅ Profile uploads synced to backend');
            }

            // ✅ NEW: Mark that user has uploaded profile picture
            setHasProfilePicture(true);

            // Update onboarding step
            setCurrentStep('complete');

            // Navigate to pastor dashboard
            router.replace('/(pastor)/(tabs)');
        } catch (error) {
            console.error('❌ Continue error:', error);
            Alert.alert('Error', 'Something went wrong while completing setup.');
        } finally {
            setActionLoading(false);
        }
    }, [hasUploaded, setCurrentStep, setHasProfilePicture, router]);

    const userName = user?.firstName || 'User';

    return (
        <LinearGradient
            colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
            style={{ flex: 1, justifyContent: 'space-between' }}
        >
            <View style={styles.scrollContainer}>
                <TopBar role="pastor" showUserName userName={userName} />
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
                                                : 'Upload documents'}
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
        marginBottom: 40,
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

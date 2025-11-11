import { icons } from '@/constants/images';
import { useMicrograntApplication } from '@/hooks/grant/useMicrograntApplications';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface FormData {
    churchName: string;
    projectName: string;
    projectImportance: string;
    amountRequested: string;
    denominationalSupport: string;
    actionSteps: string;
    resources: string;
    leadership: string;
    successMarkers: string;
}

/**
 * Maps API application data to form data structure
 */
const mapApplicationToFormData = (answers: Record<string, string | string[] | null>): FormData => {
    return {
        churchName: (answers['Church Name'] as string) || '',
        projectName: (answers['Purpose of Grant'] as string) || '',
        projectImportance: (answers['Who does the project/program serve and why is it important?'] as string) || '',
        amountRequested: (answers['Amount requested'] as string) || '',
        denominationalSupport: (answers['Project amount of denominational support'] as string) || '',
        actionSteps: (answers['What action steps will you take to achieve your goals?'] as string) || '',
        resources: (answers['What resources do you already have?'] as string) || '',
        leadership: (answers['Who will be leading and overseeing the project/program?'] as string) || '',
        successMarkers: (answers['What are the measurable markers of your success?'] as string) || '',
    };
};

/**
 * Formats date from ISO string to US format
 */
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric' 
    });
};

export default function MicroGrantApplicationScreen() {
    const router = useRouter();
    const { applicationId } = useLocalSearchParams<{ applicationId: string }>();
    const { bottom } = useSafeAreaInsets();

    // Fetch application data from API
    const { data: applicationData, isLoading, error } = useMicrograntApplication(applicationId || '');

    // Map API data to form data
    const formData = useMemo(() => {
        if (!applicationData?.application?.answers) {
            return {
                churchName: '',
                projectName: '',
                projectImportance: '',
                amountRequested: '',
                denominationalSupport: '',
                actionSteps: '',
                resources: '',
                leadership: '',
                successMarkers: '',
            };
        }
        return mapApplicationToFormData(applicationData.application.answers);
    }, [applicationData]);

    const handleDownloadFile = async () => {
        const docUrl = applicationData?.application?.supportingDoc;
        if (docUrl) {
            try {
                const canOpen = await Linking.canOpenURL(docUrl);
                if (canOpen) {
                    await Linking.openURL(docUrl);
                } else {
                    console.log('Cannot open URL:', docUrl);
                }
            } catch (error) {
                console.error('Error opening file:', error);
            }
        }
    };

    const handleNext = () => {
        router.push('/(director)/(tabs)/micro-grant/reporting-procedure');
    };

    const handleCall = () => {
        // Phone number would need to be in the user data or answers
        console.log('Call user');
    };

    const handleChat = () => {
        console.log('Chat with user');
    };

    const handleMail = () => {
        const email = applicationData?.user?.email;
        if (email) {
            Linking.openURL(`mailto:${email}`);
        }
    };

    const handleWhatsApp = () => {
        console.log('WhatsApp user');
    };

    return (
        <>
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={styles.container}
            >
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={[styles.scrollContent, {
                            paddingBottom: bottom + 20,
                        }]}
                        showsVerticalScrollIndicator={false}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator color="#fff" size="large" />
                                <Text style={styles.loadingText}>Loading application...</Text>
                            </View>
                        ) : error ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Error loading application</Text>
                                <Text style={styles.errorSubtext}>{error.message}</Text>
                            </View>
                        ) : !applicationData ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Application not found</Text>
                            </View>
                        ) : (
                            <>
                                {/* Header */}
                                <View style={styles.headerContainer}>
                                    <View style={styles.headerCard}>
                                        <Text style={styles.headerText}>
                                            The Center for Community Change{'\n'}
                                            Micro-Grant Application
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.profileCard}>
                                    <View style={styles.profileHeader}>
                                        <View style={styles.profileInfo}>
                                            <Image
                                                source={icons.myProfile}
                                                style={styles.avatar}
                                                resizeMode="cover"
                                            />
                                            <View>
                                                <Text style={styles.userName}>
                                                    {applicationData.user?.email || 'Unknown User'}
                                                </Text>
                                                <Text style={styles.userRole}>
                                                    {applicationData.application.formId.title || 'Applicant'}
                                                </Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity style={styles.viewProfileButton}>
                                            <Text style={styles.viewProfileText}>View Profile</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.contactIcons}>
                                        <TouchableOpacity onPress={handleCall}>
                                            <Ionicons name="call-outline" size={18} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleChat}>
                                            <Ionicons name="chatbubble-outline" size={18} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleMail}>
                                            <Ionicons name="mail-outline" size={18} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleWhatsApp}>
                                            <Ionicons name="logo-whatsapp" size={18} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.applicationDate}>
                                        Application received on {formatDate(applicationData.application.createdAt)}
                                    </Text>
                                </View>

                        <View style={styles.formContainer}>
                            <View style={styles.formCard}>
                                <Text style={styles.sectionTitle}>1. Cover Sheet</Text>
                                <Text style={styles.sectionSubtitle}>
                                    Please answer the questions succinctly following{'\n'}
                                    Prompts
                                </Text>
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    Name of the church: <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    value={formData.churchName}
                                    editable={false}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                />
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    Name of the project/program: <Text style={styles.required}>*</Text>
                                </Text>
                                <Text style={styles.helperText}>
                                    [Provide a name for the project/program you are{'\n'}
                                    seeking to fund for]
                                </Text>
                                <TextInput
                                    value={formData.projectName}
                                    editable={false}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                />
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    Who does the project/program serve and why is it{'\n'}
                                    important? <Text style={styles.required}>*</Text>
                                </Text>
                                <Text style={styles.helperText}>
                                    [Describe the target audience or beneficiaries of your{'\n'}
                                    project/program and explain why it is important for{'\n'}
                                    them]
                                </Text>
                                <TextInput
                                    value={formData.projectImportance}
                                    editable={false}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                />
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    Amount requested: <Text style={styles.required}>*</Text>
                                </Text>
                                <Text style={styles.helperText}>
                                    [Specify the amount of grant funds you are requesting]
                                </Text>
                                <TextInput
                                    value={formData.amountRequested}
                                    editable={false}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                />
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    Project amount of denominational support (Local{'\n'}
                                    Conference, Union, NAD, GC, etc.): <Text style={styles.required}>*</Text>
                                </Text>
                                <Text style={styles.helperText}>
                                    [Provide the percentage of denominational financial{'\n'}
                                    contribution from the larger body of the SDA church]
                                </Text>
                                <TextInput
                                    value={formData.denominationalSupport}
                                    editable={false}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                />
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    What action steps will you take to achieve your{'\n'}
                                    goals? <Text style={styles.required}>*</Text>
                                </Text>
                                <Text style={styles.helperText}>
                                    [Outline the specific activities or steps you will{'\n'}
                                    undertake to achieve the stated goals]
                                </Text>
                                <TextInput
                                    value={formData.actionSteps}
                                    editable={false}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                />
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    What resources do you already have? <Text style={styles.required}>*</Text>
                                </Text>
                                <Text style={styles.helperText}>
                                    [Describe the existing resources, assets, or support that your{'\n'}
                                    church or project team possesses]
                                </Text>
                                <TextInput
                                    value={formData.resources}
                                    editable={false}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                />
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    Who will be leading and overseeing the project/{'\n'}
                                    program, and what are their qualifications? <Text style={styles.required}>*</Text>
                                </Text>
                                <Text style={styles.helperText}>
                                    [Provide information about the individuals who will be{'\n'}
                                    responsible for managing and overseeing the project/{'\n'}
                                    program, including their qualifications and relevant{'\n'}
                                    experience]
                                </Text>
                                <TextInput
                                    value={formData.leadership}
                                    editable={false}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                />
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    What are the measurable markers of your{'\n'}
                                    success? <Text style={styles.required}>*</Text>
                                </Text>
                                <Text style={styles.helperText}>
                                    [Define specific indicators or metrics that will be used to{'\n'}
                                    measure the success or progress of your project/{'\n'}
                                    program]
                                </Text>
                                <TextInput
                                    value={formData.successMarkers}
                                    editable={false}
                                    style={styles.textInput}
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    multiline
                                />
                            </View>

                            <View style={styles.formCard}>
                                <Text style={styles.fieldLabel}>
                                    Please upload here any supporting documents or{'\n'}
                                    media (photos, videos, publications, etc.)
                                </Text>
                                <TouchableOpacity onPress={handleDownloadFile} style={styles.downloadButton}>
                                    <Ionicons name="download-outline" size={20} color="white" />
                                    <Text style={styles.downloadText}>Download File</Text>
                                </TouchableOpacity>
                                <Text style={styles.uploadHelperText}>
                                    [Upload up to 10 supported files. Max 100 MB per file.]
                                </Text>
                            </View>

                            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                                <Text style={styles.nextButtonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                            </>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        marginBottom: 20,
    },
    headerCard: {
        borderWidth: 2,
        borderColor: 'rgba(123, 47, 247, 0.5)',
        borderRadius: 16,
        padding: 16,
    },
    headerText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
    },
    profileCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 16,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    userName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    userRole: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    viewProfileButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    viewProfileText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    contactIcons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    applicationDate: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
    formContainer: {
        marginHorizontal: 16,
        gap: 20,
    },
    formCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 16,
        padding: 16,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    sectionSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        lineHeight: 20,
    },
    fieldLabel: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        lineHeight: 20,
    },
    required: {
        color: '#FF6B6B',
    },
    helperText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
        marginBottom: 12,
        lineHeight: 16,
    },
    textInput: {
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.4)',
        color: 'white',
        paddingBottom: 8,
        fontSize: 14,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 12,
        paddingVertical: 12,
        marginTop: 12,
    },
    downloadText: {
        color: 'white',
        fontWeight: '600',
    },
    uploadHelperText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginTop: 12,
        textAlign: 'center',
    },
    nextButton: {
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    nextButtonText: {
        color: '#1C4ED8',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#fff',
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    errorSubtext: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        textAlign: 'center',
    },
});

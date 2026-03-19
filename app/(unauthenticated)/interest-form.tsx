import TopBar from "@/components/director/TopBar";
import { useInterestMetadata } from "@/hooks/interests/useInterests";
import { useSubmitInterest } from "@/hooks/onboarding/useOnboarding";
import { useOnboardingStore } from "@/stores";
import { ChurchInfo, InterestFormData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const INITIAL_CHURCH: ChurchInfo = {
    churchName: '',
    churchPhone: '',
    churchWebsite: '',
    churchAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
};

const INITIAL_FORM_DATA: Partial<InterestFormData> = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    churchDetails: [INITIAL_CHURCH],
    title: '',
    yearsInMinistry: '',
    conference: '',
    currentCommunityProjects: '',
    interests: [],
    comments: '',
};

export default function InterestFormScreen() {
    const { bottom } = useSafeAreaInsets();
    const { mutate: submitInterest, isPending: isLoading } = useSubmitInterest();
    const { setCurrentStep } = useOnboardingStore();

    // Fetch metadata from API
    const { data: metadata, isLoading: isLoadingMetadata } = useInterestMetadata();

    console.log('Metadata:', metadata?.countryStates);
    // Form state
    const [formData, setFormData] = useState<Partial<InterestFormData>>(
        INITIAL_FORM_DATA
    );
    const [showTitleDropdown, setShowTitleDropdown] = useState(false);
    const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState<number | null>(
        null
    );
    const [showStateDropdown, setShowStateDropdown] = useState<number | null>(
        null
    );

    // Transform metadata to form options
    const TITLE_OPTIONS = useMemo(() => metadata?.titles || [], [metadata]);
    const INTEREST_OPTIONS = useMemo(() => metadata?.interests || [], [metadata]);
    const COUNTRY_OPTIONS = useMemo(() => {
        if (!metadata?.countries) return [];
        return metadata.countries.map(country => ({ label: country, value: country }));
    }, [metadata]);

    // Get states for a specific country
    const getStatesForCountry = useCallback(
        (country: string) => {
            if (!metadata?.countryStates) return [];

            // FIX: normalize for exact match
            const match = metadata.countryStates.find(
                (c) => c.country.trim().toLowerCase() === country.trim().toLowerCase()
            );

            return match?.states || [];
        },
        [metadata]
    );


    // Auto-fill function for testing
    // Removed - no longer needed

    // Input handlers
    const handleInputChange = useCallback((field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleChurchChange = useCallback(
        (index: number, field: keyof ChurchInfo, value: string) => {
            setFormData((prev) => {
                const churches = [...(prev.churchDetails || [])];
                churches[index] = { ...churches[index], [field]: value };
                return { ...prev, churchDetails: churches };
            });
        },
        []
    );

    const addChurch = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            churchDetails: [...(prev.churchDetails || []), INITIAL_CHURCH],
        }));
    }, []);

    const removeChurch = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            churchDetails:
                prev.churchDetails?.filter((_, i) => i !== index) || [],
        }));
    }, []);

    const toggleInterest = useCallback((interest: string) => {
        setFormData((prev) => {
            const interests = (prev.interests || []).includes(interest)
                ? (prev.interests || []).filter((i) => i !== interest)
                : [...(prev.interests || []), interest];
            return { ...prev, interests };
        });
    }, []);

    // Form validation
    const validateForm = useCallback((): boolean => {
        if (!formData.firstName?.trim()) {
            Alert.alert('Error', 'Please enter your first name');
            return false;
        }
        if (!formData.lastName?.trim()) {
            Alert.alert('Error', 'Please enter your last name');
            return false;
        }
        if (!formData.email?.trim()) {
            Alert.alert('Error', 'Please enter your email');
            return false;
        }
        if (!formData.phoneNumber?.trim()) {
            Alert.alert('Error', 'Please enter your phone number');
            return false;
        }
        if (!formData.churchDetails || formData.churchDetails.length === 0) {
            Alert.alert('Error', 'Please add at least one church');
            return false;
        }
        if (!formData.title) {
            Alert.alert('Error', 'Please select a title');
            return false;
        }
        return true;
    }, [formData]);

    // Submit handler
    const handleSubmit = useCallback(() => {
        if (!validateForm()) return;

        console.log('📤 Submitting interest form:', formData);
        setCurrentStep('submitted');

        submitInterest(formData as InterestFormData);
    }, [formData, validateForm, submitInterest, setCurrentStep]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={styles.container}
            >
                <TopBar
                    showDrawer={false}
                    showNotifications={false}
                    showUserName
                    customTitle="Interest Form"
                    showBackButton={true}
                />

                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: bottom + 20 },
                    ]}
                >
                    {/* Loading Metadata */}
                    {isLoadingMetadata && (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ActivityIndicator color="#FFD700" />
                            <Text style={{ color: '#fff', marginTop: 8 }}>Loading form options...</Text>
                        </View>
                    )}

                    {/* Personal Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="First Name *"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.firstName}
                                onChangeText={(text) => handleInputChange('firstName', text)}
                                editable={!isLoading}
                            />
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="Last Name *"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.lastName}
                                onChangeText={(text) => handleInputChange('lastName', text)}
                                editable={!isLoading}
                            />
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="Phone Number *"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.phoneNumber}
                                onChangeText={(text) => handleInputChange('phoneNumber', text)}
                                keyboardType="phone-pad"
                                editable={!isLoading}
                            />
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="Email *"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.email}
                                onChangeText={(text) => handleInputChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!isLoading}
                            />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Church Information Sections */}
                    {(formData.churchDetails || []).map((church, index) => (
                        <React.Fragment key={`church-${index}`}>
                            <View style={styles.section}>
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.sectionTitle}>
                                        Church Information
                                        {(formData.churchDetails?.length || 0) > 1 &&
                                            ` #${index + 1}`}
                                    </Text>
                                    {(formData.churchDetails?.length || 0) > 1 && (
                                        <TouchableOpacity onPress={() => removeChurch(index)}>
                                            <Ionicons
                                                name="close-circle"
                                                size={24}
                                                color="#FF6B6B"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Church Name"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={church.churchName}
                                    onChangeText={(text) =>
                                        handleChurchChange(index, 'churchName', text)
                                    }
                                    editable={!isLoading}
                                />

                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.halfWidth]}
                                        placeholder="Church Phone"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.churchPhone}
                                        onChangeText={(text) =>
                                            handleChurchChange(index, 'churchPhone', text)
                                        }
                                        keyboardType="phone-pad"
                                        editable={!isLoading}
                                    />
                                    <TextInput
                                        style={[styles.input, styles.halfWidth]}
                                        placeholder="Church Website"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.churchWebsite}
                                        onChangeText={(text) =>
                                            handleChurchChange(index, 'churchWebsite', text)
                                        }
                                        autoCapitalize="none"
                                        editable={!isLoading}
                                    />
                                </View>

                                <TextInput
                                    style={styles.input}
                                    placeholder="Church Address"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={church.churchAddress}
                                    onChangeText={(text) =>
                                        handleChurchChange(index, 'churchAddress', text)
                                    }
                                    editable={!isLoading}
                                />

                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.halfWidth]}
                                        placeholder="City"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.city}
                                        onChangeText={(text) =>
                                            handleChurchChange(index, 'city', text)
                                        }
                                        editable={!isLoading}
                                    />
                                    {/* State Dropdown */}
                                    <View style={[styles.halfWidth, styles.countryDropdownWrapper]}>
                                        <TouchableOpacity
                                            style={styles.dropdown}
                                            onPress={() =>
                                                setShowStateDropdown(
                                                    showStateDropdown === index ? null : index
                                                )
                                            }
                                            disabled={isLoading || !church.country}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownText,
                                                    !church.state && styles.placeholderText,
                                                ]}
                                            >
                                                {church.state || 'State'}
                                            </Text>
                                            <Ionicons
                                                name={
                                                    showStateDropdown === index
                                                        ? 'chevron-up'
                                                        : 'chevron-down'
                                                }
                                                size={20}
                                                color="rgba(255,255,255,0.6)"
                                            />
                                        </TouchableOpacity>
                                        {showStateDropdown === index && church.country && (
                                            <View style={styles.countryDropdownMenu}>
                                                {getStatesForCountry(church.country).map((state) => (
                                                    <TouchableOpacity
                                                        key={state}
                                                        style={styles.countryDropdownItem}
                                                        onPress={() => {
                                                            handleChurchChange(index, 'state', state);
                                                            setShowStateDropdown(null);
                                                        }}
                                                    >
                                                        <View style={styles.countryRadio}>
                                                            {church.state === state && (
                                                                <View style={styles.countryRadioSelected} />
                                                            )}
                                                        </View>
                                                        <Text style={styles.countryDropdownItemText}>
                                                            {state}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.halfWidth]}
                                        placeholder="Zip Code"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.zipCode}
                                        onChangeText={(text) =>
                                            handleChurchChange(index, 'zipCode', text)
                                        }
                                        keyboardType="number-pad"
                                        editable={!isLoading}
                                    />

                                    {/* Country Dropdown */}
                                    <View style={[styles.halfWidth, styles.countryDropdownWrapper]}>
                                        <TouchableOpacity
                                            style={styles.dropdown}
                                            onPress={() =>
                                                setShowCountryDropdown(
                                                    showCountryDropdown === index ? null : index
                                                )
                                            }
                                            disabled={isLoading}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownText,
                                                    !church.country && styles.placeholderText,
                                                ]}
                                            >
                                                {church.country || 'Country'}
                                            </Text>
                                            <Ionicons
                                                name={
                                                    showCountryDropdown === index
                                                        ? 'chevron-up'
                                                        : 'chevron-down'
                                                }
                                                size={20}
                                                color="rgba(255,255,255,0.6)"
                                            />
                                        </TouchableOpacity>
                                        {showCountryDropdown === index && (
                                            <View style={styles.countryDropdownMenu}>
                                                {COUNTRY_OPTIONS.map((option) => (
                                                    <TouchableOpacity
                                                        key={option.value}
                                                        style={styles.countryDropdownItem}
                                                        onPress={() => {
                                                            handleChurchChange(
                                                                index,
                                                                'country',
                                                                option.value
                                                            );
                                                            // Clear state when country changes
                                                            handleChurchChange(index, 'state', '');
                                                            setShowCountryDropdown(null);
                                                        }}
                                                    >
                                                        <View style={styles.countryRadio}>
                                                            {church.country === option.value && (
                                                                <View style={styles.countryRadioSelected} />
                                                            )}
                                                        </View>
                                                        <Text style={styles.countryDropdownItemText}>
                                                            {option.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Add More Church Button */}
                                {index === (formData.churchDetails?.length || 1) - 1 && (
                                    <TouchableOpacity
                                        style={styles.addMoreButton}
                                        onPress={addChurch}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.addMoreButtonText}>Add Church</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {index < (formData.churchDetails?.length || 0) - 1 && (
                                <View style={styles.divider} />
                            )}
                        </React.Fragment>
                    ))}

                    <View style={styles.divider} />

                    {/* Other Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Other Information</Text>

                        {/* Title Dropdown */}
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowTitleDropdown(!showTitleDropdown)}
                            disabled={isLoading}
                        >
                            <Text
                                style={[
                                    styles.dropdownText,
                                    !formData.title && styles.placeholderText,
                                ]}
                            >
                                {formData.title || 'Title *'}
                            </Text>
                            <Ionicons
                                name={showTitleDropdown ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="rgba(255,255,255,0.6)"
                            />
                        </TouchableOpacity>
                        {showTitleDropdown && (
                            <View style={styles.titleDropdownMenu}>
                                {TITLE_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.titleDropdownItem}
                                        onPress={() => {
                                            handleInputChange('title', option);
                                            setShowTitleDropdown(false);
                                        }}
                                    >
                                        <View style={styles.titleRadio}>
                                            {formData.title === option && (
                                                <View style={styles.titleRadioSelected} />
                                            )}
                                        </View>
                                        <Text style={styles.titleDropdownItemText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="Years in Ministry"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.yearsInMinistry}
                                onChangeText={(text) =>
                                    handleInputChange('yearsInMinistry', text)
                                }
                                keyboardType="number-pad"
                                editable={!isLoading}
                            />
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="Conference"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.conference}
                                onChangeText={(text) => handleInputChange('conference', text)}
                                editable={!isLoading}
                            />
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Current Community Service Projects"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={formData.currentCommunityProjects}
                            onChangeText={(text) =>
                                handleInputChange('currentCommunityProjects', text)
                            }
                            editable={!isLoading}
                        />

                        {/* Interests Dropdown */}
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowInterestsDropdown(!showInterestsDropdown)}
                            disabled={isLoading}
                        >
                            <Text
                                style={[
                                    styles.dropdownText,
                                    (formData.interests?.length || 0) === 0 &&
                                    styles.placeholderText,
                                ]}
                            >
                                {(formData.interests?.length || 0) > 0
                                    ? `${formData.interests?.length} selected`
                                    : 'Interests'}
                            </Text>
                            <Ionicons
                                name={showInterestsDropdown ? 'chevron-up' : 'chevron-down'}
                                size={20}
                                color="rgba(255,255,255,0.6)"
                            />
                        </TouchableOpacity>
                        {showInterestsDropdown && (
                            <View style={styles.interestsMenu}>
                                {INTEREST_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.interestItem}
                                        onPress={() => toggleInterest(option)}
                                        disabled={isLoading}
                                    >
                                        <View style={styles.checkbox}>
                                            {(formData.interests || []).includes(option) && (
                                                <Ionicons name="checkmark" size={16} color="#60A5FA" />
                                            )}
                                        </View>
                                        <Text style={styles.interestItemText}>{option}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Comments */}
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Comments"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={formData.comments}
                            onChangeText={(text) => handleInputChange('comments', text)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            editable={!isLoading}
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isLoading && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#1A5490" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </LinearGradient>
        </>
    );
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.3)",
    },
    headerTitle: {
        marginLeft: 12,
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
        flex: 1,
    },
    autoFillButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 215, 0, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FFD700",
        gap: 6,
    },
    autoFillButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFD700",
    },
    scrollContent: {
        paddingHorizontal: 16,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        marginBottom: 16,
    },
    input: {
        // backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: "#fff",
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    textArea: {
        height: 100,
        paddingTop: 14,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.3)",
        marginVertical: 20,
    },
    addMoreButton: {
        alignSelf: "flex-end",
        backgroundColor: "rgba(26, 42, 89, 1)",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    addMoreButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
    dropdown: {
        // backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dropdownText: {
        fontSize: 15,
        color: "#fff",
    },
    placeholderText: {
        color: "rgba(255,255,255,0.5)",
    },
    titleDropdownMenu: {
        backgroundColor: "#1E3A5F",
        borderRadius: 10,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    titleDropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    titleDropdownItemText: {
        fontSize: 15,
        color: "#fff",
        marginLeft: 12,
    },
    titleRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    titleRadioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    countryDropdownMenu: {
        backgroundColor: "#1E3A5F",
        borderRadius: 10,
        marginTop: 4,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        position: "absolute",
        top: 60,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    countryDropdownWrapper: {
        position: 'relative',
    },
    countryDropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    countryDropdownItemText: {
        fontSize: 15,
        color: "#fff",
        marginLeft: 12,
    },
    countryRadio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    countryRadioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    interestsMenu: {
        // backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 10,
        marginBottom: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
    },
    interestItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#1A5490",
        borderRadius: 6,
        marginRight: 12,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    interestItemText: {
        flex: 1,
        fontSize: 14,
        color: "#fff",
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        alignItems: "center",
        marginTop: 20,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A5490",
    },
});


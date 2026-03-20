import TopBar from "@/components/director/TopBar";
import { useInterestMetadata } from "@/hooks/interests/useInterests";
import { useSubmitInterest } from "@/hooks/onboarding/useOnboarding";
import { useOnboardingStore } from "@/stores";
import { ChurchInfo, InterestFormData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
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

type PhoneCountryOption = {
    id: string;
    name: string;
    dialCode: string;
    minLength: number;
};

const PHONE_COUNTRY_OPTIONS: PhoneCountryOption[] = [
    { id: "US", name: "United States", dialCode: "+1", minLength: 10 },
    { id: "CA", name: "Canada", dialCode: "+1", minLength: 10 },
];

const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRY_OPTIONS[0];

const findPhoneCountryByName = (countryName?: string | null): PhoneCountryOption | null => {
    if (!countryName) return null;
    const trimmed = countryName.trim().toLowerCase();
    return (
        PHONE_COUNTRY_OPTIONS.find((c) => c.name.toLowerCase() === trimmed) ||
        PHONE_COUNTRY_OPTIONS.find((c) =>
            trimmed.includes(c.name.toLowerCase())
        ) ||
        null
    );
};

type PhoneInputWithCountryProps = {
    value: string;
    onChangeText: (value: string) => void;
    selectedCountry: PhoneCountryOption;
    onSelectCountry: (country: PhoneCountryOption) => void;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
};

const PhoneInputWithCountry = React.forwardRef<TextInput, PhoneInputWithCountryProps>(
    (
        {
            value,
            onChangeText,
            selectedCountry,
            onSelectCountry,
            placeholder = "Enter phone number",
            disabled,
            hasError,
        },
        ref
    ) => {
        const [showDropdown, setShowDropdown] = useState(false);

        return (
            <View style={[styles.halfWidth, styles.phoneCountryDropdownWrapper]}>
                <View
                    style={[
                        styles.phoneInputContainer,
                        hasError && styles.inputError,
                        disabled && styles.inputDisabled,
                    ]}
                >
                    <TouchableOpacity
                        style={styles.phoneCountryButton}
                        onPress={() => setShowDropdown((prev) => !prev)}
                        disabled={disabled}
                    >
                        <Text style={styles.phoneCountryCodeText}>
                            {selectedCountry.dialCode}
                        </Text>
                        <Ionicons
                            name={showDropdown ? "chevron-up" : "chevron-down"}
                            size={16}
                            color="rgba(255,255,255,0.8)"
                        />
                    </TouchableOpacity>
                    <TextInput
                        ref={ref}
                        style={styles.phoneTextInput}
                        placeholder={placeholder}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={value}
                        onChangeText={(text) => {
                            const numericOnly = text.replace(/[^\d]/g, "");
                            onChangeText(numericOnly);
                        }}
                        keyboardType="phone-pad"
                        editable={!disabled}
                    />
                </View>
                {showDropdown && (
                    <View style={styles.phoneCountryDropdownMenu}>
                        {PHONE_COUNTRY_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.countryDropdownItem}
                                onPress={() => {
                                    onSelectCountry(option);
                                    setShowDropdown(false);
                                }}
                            >
                                <View style={styles.countryRadio}>
                                    {selectedCountry.id === option.id && (
                                        <View style={styles.countryRadioSelected} />
                                    )}
                                </View>
                                <Text style={styles.countryDropdownItemText}>
                                    {option.name} ({option.dialCode})
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    }
);

PhoneInputWithCountry.displayName = "PhoneInputWithCountry";

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
    const { role } = useLocalSearchParams<{ role?: string }>();

    // Fetch metadata from API
    const { data: metadata, isLoading: isLoadingMetadata } = useInterestMetadata();

    console.log('Metadata:', metadata?.countryStates);

    const prefillTitle = useMemo(() => {
        switch (role) {
            case "pastor":
                return "Pastor";
            case "layleader":
                return "Lay Leader";
            case "seminarian":
                return "Seminarian";
            default:
                return "";
        }
    }, [role]);

    // Form state
    const [formData, setFormData] = useState<Partial<InterestFormData>>(() => ({
        ...INITIAL_FORM_DATA,
        title: prefillTitle || "",
    }));

    // Once metadata loads, ensure the prefilled title exists in the backend dropdown options.
    useEffect(() => {
        if (!prefillTitle) return;
        if (!metadata?.titles?.length) return;

        const safeTitle = metadata.titles.includes(prefillTitle)
            ? prefillTitle
            : "";
        setFormData((prev) => ({ ...prev, title: safeTitle }));
    }, [metadata?.titles, prefillTitle]);
    const [showTitleDropdown, setShowTitleDropdown] = useState(false);
    const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState<number | null>(
        null
    );
    const [showStateDropdown, setShowStateDropdown] = useState<number | null>(
        null
    );

    const [personalPhoneCountry, setPersonalPhoneCountry] = useState<PhoneCountryOption>(
        DEFAULT_PHONE_COUNTRY
    );
    const [churchPhoneCountries, setChurchPhoneCountries] = useState<PhoneCountryOption[]>([
        DEFAULT_PHONE_COUNTRY,
    ]);

    const [personalPhoneError, setPersonalPhoneError] = useState(false);
    const [churchPhoneErrors, setChurchPhoneErrors] = useState<boolean[]>([]);
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [emailError, setEmailError] = useState(false);
    const [titleError, setTitleError] = useState(false);

    const firstNameRef = useRef<TextInput | null>(null);
    const lastNameRef = useRef<TextInput | null>(null);
    const emailRef = useRef<TextInput | null>(null);
    const personalPhoneRef = useRef<TextInput | null>(null);
    const churchPhoneRefs = useRef<(TextInput | null)[]>([]);

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
        setChurchPhoneCountries((prev) => [...prev, DEFAULT_PHONE_COUNTRY]);
        setChurchPhoneErrors((prev) => [...prev, false]);
    }, []);

    const removeChurch = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            churchDetails:
                prev.churchDetails?.filter((_, i) => i !== index) || [],
        }));
        setChurchPhoneCountries((prev) =>
            prev.filter((_, i) => i !== index)
        );
        setChurchPhoneErrors((prev) => prev.filter((_, i) => i !== index));
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
        setFirstNameError(false);
        setLastNameError(false);
        setEmailError(false);
        setTitleError(false);
        setPersonalPhoneError(false);
        setChurchPhoneErrors([]);

        if (!formData.firstName?.trim()) {
            setFirstNameError(true);
            firstNameRef.current?.focus();
            return false;
        }
        if (!formData.lastName?.trim()) {
            setLastNameError(true);
            lastNameRef.current?.focus();
            return false;
        }
        if (!formData.email?.trim()) {
            setEmailError(true);
            emailRef.current?.focus();
            return false;
        }

        const rawPersonal = (formData.phoneNumber || "").replace(/[^\d]/g, "");
        if (!rawPersonal) {
            setPersonalPhoneError(true);
            personalPhoneRef.current?.focus();
            return false;
        }
        if (rawPersonal.length < personalPhoneCountry.minLength) {
            setPersonalPhoneError(true);
            personalPhoneRef.current?.focus();
            return false;
        }

        const newChurchErrors: boolean[] = [];
        const churches = formData.churchDetails || [];
        churches.forEach((church, index) => {
            const rawChurchPhone = (church.churchPhone || "").replace(/[^\d]/g, "");
            const country = churchPhoneCountries[index] || DEFAULT_PHONE_COUNTRY;

            if (rawChurchPhone) {
                if (rawChurchPhone.length < country.minLength) {
                    newChurchErrors[index] = true;
                } else {
                    newChurchErrors[index] = false;
                }
            } else {
                newChurchErrors[index] = false;
            }
        });

        if (newChurchErrors.some(Boolean)) {
            setChurchPhoneErrors(newChurchErrors);
            const firstInvalidIndex = newChurchErrors.findIndex(Boolean);
            if (firstInvalidIndex !== -1) {
                setTimeout(() => {
                    const ref = churchPhoneRefs.current[firstInvalidIndex];
                    ref?.focus();
                }, 50);
            }
            return false;
        }

        if (!formData.churchDetails || formData.churchDetails.length === 0) {
            return false;
        }
        if (!formData.title) {
            setTitleError(true);
            return false;
        }
        return true;
    }, [formData, personalPhoneCountry, churchPhoneCountries]);

    // Submit handler
    const handleSubmit = useCallback(() => {
        if (!validateForm()) return;

        const rawPersonal = (formData.phoneNumber || "").replace(/[^\d]/g, "");
        const fullPersonalPhone = `${personalPhoneCountry.dialCode}${rawPersonal}`;

        const updatedChurches: ChurchInfo[] = (formData.churchDetails || []).map(
            (church, index) => {
                const rawChurchPhone = (church.churchPhone || "").replace(/[^\d]/g, "");
                const country = churchPhoneCountries[index] || DEFAULT_PHONE_COUNTRY;
                const fullChurchPhone = rawChurchPhone
                    ? `${country.dialCode}${rawChurchPhone}`
                    : "";

                // Optional enhancement: sync phone country from selected church country
                const syncedCountry =
                    findPhoneCountryByName(church.country) || country;

                const usedCountry = syncedCountry || country;
                const finalChurchPhone = rawChurchPhone
                    ? `${usedCountry.dialCode}${rawChurchPhone}`
                    : "";

                return {
                    ...church,
                    churchPhone: finalChurchPhone || fullChurchPhone,
                };
            }
        );

        const payload: InterestFormData = {
            ...(formData as InterestFormData),
            phoneNumber: fullPersonalPhone,
            churchDetails: updatedChurches,
        };

        console.log('📤 Submitting interest form:', payload);
        setCurrentStep('submitted');

        submitInterest(payload);
    }, [formData, validateForm, personalPhoneCountry, churchPhoneCountries, setCurrentStep, submitInterest]);

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#0D3B6E", "#0A5C8A", "#0B84B0"]}
                locations={[0, 0.5, 1]}
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
                                ref={firstNameRef}
                                style={[
                                    styles.input,
                                    styles.halfWidth,
                                    firstNameError && styles.inputError,
                                ]}
                                placeholder="First Name *"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.firstName}
                                onChangeText={(text) => handleInputChange('firstName', text)}
                                editable={!isLoading}
                            />
                            <TextInput
                                ref={lastNameRef}
                                style={[
                                    styles.input,
                                    styles.halfWidth,
                                    lastNameError && styles.inputError,
                                ]}
                                placeholder="Last Name *"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.lastName}
                                onChangeText={(text) => handleInputChange('lastName', text)}
                                editable={!isLoading}
                            />
                        </View>
                        <View style={styles.row}>
                            <PhoneInputWithCountry
                                ref={personalPhoneRef}
                                value={formData.phoneNumber || ''}
                                onChangeText={(text) => {
                                    setPersonalPhoneError(false);
                                    handleInputChange('phoneNumber', text);
                                }}
                                selectedCountry={personalPhoneCountry}
                                onSelectCountry={(country) =>
                                    setPersonalPhoneCountry(country)
                                }
                                placeholder="Phone Number *"
                                disabled={isLoading}
                                hasError={personalPhoneError}
                            />
                            <TextInput
                                ref={emailRef}
                                style={[
                                    styles.input,
                                    styles.halfWidth,
                                    emailError && styles.inputError,
                                ]}
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
                                    <PhoneInputWithCountry
                                        ref={(el) => {
                                            churchPhoneRefs.current[index] = el;
                                        }}
                                        value={church.churchPhone || ''}
                                        onChangeText={(text) => {
                                            setChurchPhoneErrors((prev) => {
                                                const copy = [...prev];
                                                copy[index] = false;
                                                return copy;
                                            });
                                            handleChurchChange(index, 'churchPhone', text);
                                        }}
                                        selectedCountry={
                                            churchPhoneCountries[index] ||
                                            DEFAULT_PHONE_COUNTRY
                                        }
                                        onSelectCountry={(country) =>
                                            setChurchPhoneCountries((prev) => {
                                                const copy = [...prev];
                                                copy[index] = country;
                                                return copy;
                                            })
                                        }
                                        placeholder="Church Phone"
                                        disabled={isLoading}
                                        hasError={churchPhoneErrors[index]}
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
                                    titleError && styles.dropdownErrorText,
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
    phoneInputContainer: {
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        overflow: 'hidden',
        backgroundColor: "transparent",
    },
    phoneCountryButton: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        borderRightWidth: 1,
        borderRightColor: "rgba(255,255,255,0.3)",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    phoneCountryCodeText: {
        fontSize: 15,
        color: "#fff",
    },
    phoneTextInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 14,
        fontSize: 15,
        color: "#fff",
    },
    phoneCountryDropdownWrapper: {
        position: 'relative',
    },
    phoneCountryDropdownMenu: {
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
    inputError: {
        borderColor: "#F87171",
    },
    dropdownErrorText: {
        color: "#FCA5A5",
    },
    inputDisabled: {
        opacity: 0.6,
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


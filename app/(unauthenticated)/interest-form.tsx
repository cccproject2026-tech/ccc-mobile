import TopBar from "@/components/director/TopBar";
import SearchableSelectModal from "@/components/form/SearchableSelectModal";
import KeyboardSafeContainer from '@/components/layout/KeyboardSafeContainer';
import { useInterestMetadata } from "@/hooks/interests/useInterests";
import { useSubmitInterest } from "@/hooks/onboarding/useOnboarding";
import { useOnboardingStore } from "@/stores";
import { ChurchInfo, InterestFormData } from "@/types";
import {
    getCountryOptions,
    getPhoneCountryFromName,
    getStateNamesForCountry,
    PhoneCountryOption,
} from "@/utils/countryState";
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const PHONE_COUNTRY_OPTIONS: PhoneCountryOption[] = getCountryOptions()
    .map((country) => {
        const dialCode = country.phonecode
            ? `+${country.phonecode.replace(/^\+/, "")}`
            : "";
        if (!dialCode) return null;
        return {
            id: country.isoCode,
            name: country.name,
            dialCode,
            minLength:
                country.isoCode === "US" || country.isoCode === "CA" ? 10 : 7,
        } satisfies PhoneCountryOption;
    })
    .filter((option): option is PhoneCountryOption => option !== null);

const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRY_OPTIONS[0];

const findPhoneCountryByName = (countryName?: string | null): PhoneCountryOption | null => {
    if (!countryName) return null;
    return getPhoneCountryFromName(countryName) || PHONE_COUNTRY_OPTIONS.find(
        (c) => c.name.trim().toLowerCase() === countryName.trim().toLowerCase()
    ) || null;
};

type LocationPickerTarget =
    | { type: "country" | "state"; churchIndex: number }
    | { type: "churchPhoneCountry"; churchIndex: number }
    | { type: "personalPhoneCountry" }
    | null;

type PhoneInputWithCountryProps = {
    value: string;
    onChangeText: (value: string) => void;
    selectedCountry: PhoneCountryOption;
    placeholder?: string;
    disabled?: boolean;
    hasError?: boolean;
    /** When true, dial code is read-only (synced from address country). */
    lockCountrySelector?: boolean;
    onOpenCountryPicker?: () => void;
};

const PhoneInputWithCountry = React.forwardRef<TextInput, PhoneInputWithCountryProps>(
    (
        {
            value,
            onChangeText,
            selectedCountry,
            placeholder = "Enter phone number",
            disabled,
            hasError,
            lockCountrySelector,
            onOpenCountryPicker,
        },
        ref
    ) => {
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
                        onPress={onOpenCountryPicker}
                        disabled={disabled || lockCountrySelector}
                    >
                        <Text style={styles.phoneCountryCodeText}>
                            {selectedCountry.dialCode}
                        </Text>
                        {!lockCountrySelector && (
                            <Ionicons
                                name="chevron-down"
                                size={16}
                                color="rgba(255,255,255,0.8)"
                            />
                        )}
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
                        multiline={false}
                        numberOfLines={1}
                        editable={!disabled}
                    />
                </View>
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
    const {
        mutate: submitInterest,
        isPending: isLoading,
        error: submitError,
        isError: isSubmitError,
    } = useSubmitInterest();
    const { setCurrentStep } = useOnboardingStore();
    const { role } = useLocalSearchParams<{ role?: string }>();

    // Fetch metadata from API
    const { data: metadata, isLoading: isLoadingMetadata } = useInterestMetadata();

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
    const [locationPicker, setLocationPicker] = useState<LocationPickerTarget>(null);

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
    const [interestsError, setInterestsError] = useState(false);
    const [churchEntriesError, setChurchEntriesError] = useState(false);
    const [churchNameErrors, setChurchNameErrors] = useState<boolean[]>([]);
    const [churchAddressErrors, setChurchAddressErrors] = useState<boolean[]>([]);
    const [churchCityErrors, setChurchCityErrors] = useState<boolean[]>([]);
    const [churchStateErrors, setChurchStateErrors] = useState<boolean[]>([]);
    const [churchZipErrors, setChurchZipErrors] = useState<boolean[]>([]);
    const [churchCountryErrors, setChurchCountryErrors] = useState<boolean[]>([]);
    const [emailErrorText, setEmailErrorText] = useState<string>("");
    const [personalPhoneErrorText, setPersonalPhoneErrorText] = useState<string>("");
    const [submitErrorText, setSubmitErrorText] = useState<string>("");
    const [yearsInMinistryError, setYearsInMinistryError] = useState(false);
    const [conferenceError, setConferenceError] = useState(false);
    const [currentCommunityProjectsError, setCurrentCommunityProjectsError] = useState(false);

    const firstNameRef = useRef<TextInput | null>(null);
    const lastNameRef = useRef<TextInput | null>(null);
    const emailRef = useRef<TextInput | null>(null);
    const personalPhoneRef = useRef<TextInput | null>(null);
    const churchPhoneRefs = useRef<(TextInput | null)[]>([]);
    const churchNameRefs = useRef<(TextInput | null)[]>([]);
    const churchAddressRefs = useRef<(TextInput | null)[]>([]);
    const churchCityRefs = useRef<(TextInput | null)[]>([]);
    const churchZipRefs = useRef<(TextInput | null)[]>([]);
    const yearsInMinistryRef = useRef<TextInput | null>(null);
    const conferenceRef = useRef<TextInput | null>(null);
    const currentCommunityProjectsRef = useRef<TextInput | null>(null);

    // KeyboardAwareScrollView typing differs across RN/expo versions; keep ref typed loosely.
    const scrollViewRef = useRef<any>(null);
    const fieldLayoutsRef = useRef<Record<string, number>>({});

    const registerFieldLayout = useCallback(
        (key: string) => (e: any) => {
            fieldLayoutsRef.current[key] = e?.nativeEvent?.layout?.y;
        },
        []
    );

    const scrollToField = useCallback((key: string) => {
        const y = fieldLayoutsRef.current[key];
        if (y == null || !scrollViewRef.current) return;

        // Keep it slightly above the field so the user can see the label + error.
        (scrollViewRef.current as any)?.scrollTo?.({ y: Math.max(0, y - 24), animated: true });
    }, []);

    const scrollToAndFocus = useCallback(
        (key: string, focusFn: () => void) => {
            scrollToField(key);
            setTimeout(focusFn, 60);
        },
        [scrollToField]
    );

    
    useEffect(() => {
        if (!isSubmitError) return;

        const message =
            (submitError as any)?.message ||
            (typeof submitError === "string" ? submitError : null) ||
            "Failed to submit interest form. Please try again.";

        setSubmitErrorText(message);

        // If backend says email already exists, map it to the email field UX.
        const lower = message.toLowerCase();
        if (lower.includes("email") && (lower.includes("already") || lower.includes("exists"))) {
            setEmailError(true);
            setEmailErrorText(message);
            
            if (emailRef.current) {
                scrollToAndFocus("email", () => emailRef.current?.focus());
            }
        }
    }, [isSubmitError, submitError, scrollToAndFocus]);

    
    const TITLE_OPTIONS = useMemo(() => metadata?.titles || [], [metadata]);
    const INTEREST_OPTIONS = useMemo(() => metadata?.interests || [], [metadata]);
    // Full country/state lists from country-state-city (matches CCC-Web interest form).
    const COUNTRY_OPTIONS = useMemo(
        () =>
            getCountryOptions().map((country) => ({
                label: country.name,
                value: country.name,
            })),
        []
    );

    const getStateOptionsForCountry = useCallback((countryName: string) => {
        return getStateNamesForCountry(countryName).map((name) => ({
            label: name,
            value: name,
        }));
    }, []);

    const handleChurchCountrySelect = useCallback(
        (index: number, countryName: string) => {
            setChurchCountryErrors((prev) => {
                const copy = [...prev];
                copy[index] = false;
                return copy;
            });
            setChurchStateErrors((prev) => {
                const copy = [...prev];
                copy[index] = false;
                return copy;
            });
            setFormData((prev) => {
                const churches = [...(prev.churchDetails || [])];
                churches[index] = {
                    ...churches[index],
                    country: countryName,
                    state: "",
                };
                return { ...prev, churchDetails: churches };
            });
            const phoneCountry = getPhoneCountryFromName(countryName);
            if (phoneCountry) {
                setChurchPhoneCountries((prev) => {
                    const copy = [...prev];
                    copy[index] = phoneCountry;
                    return copy;
                });
            }
            setLocationPicker(null);
        },
        []
    );

    const handleChurchStateSelect = useCallback((index: number, stateName: string) => {
        setChurchStateErrors((prev) => {
            const copy = [...prev];
            copy[index] = false;
            return copy;
        });
        setFormData((prev) => {
            const churches = [...(prev.churchDetails || [])];
            churches[index] = { ...churches[index], state: stateName };
            return { ...prev, churchDetails: churches };
        });
        setLocationPicker(null);
    }, []);

    const handleChurchPhoneCountrySelect = useCallback(
        (index: number, phoneCountry: PhoneCountryOption) => {
            setChurchPhoneCountries((prev) => {
                const copy = [...prev];
                copy[index] = phoneCountry;
                return copy;
            });

            // Prefill church country from selected phone country code.
            
            setFormData((prev) => {
                const churches = [...(prev.churchDetails || [])];
                const current = churches[index] || INITIAL_CHURCH;
                const isCountryChanged =
                    (current.country || "").trim().toLowerCase() !==
                    phoneCountry.name.trim().toLowerCase();

                churches[index] = {
                    ...current,
                    country: phoneCountry.name,
                    // If country changed, reset state to avoid stale state/province.
                    state: isCountryChanged ? "" : current.state,
                };
                return { ...prev, churchDetails: churches };
            });

            setChurchCountryErrors((prev) => {
                const copy = [...prev];
                copy[index] = false;
                return copy;
            });
            setChurchStateErrors((prev) => {
                const copy = [...prev];
                copy[index] = false;
                return copy;
            });

            setLocationPicker(null);
        },
        []
    );

    const activeChurchForPicker =
        locationPicker != null && "churchIndex" in locationPicker
            ? formData.churchDetails?.[locationPicker.churchIndex]
            : undefined;

    
    

    
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
        setChurchNameErrors((prev) => [...prev, false]);
        setChurchAddressErrors((prev) => [...prev, false]);
        setChurchCityErrors((prev) => [...prev, false]);
        setChurchStateErrors((prev) => [...prev, false]);
        setChurchZipErrors((prev) => [...prev, false]);
        setChurchCountryErrors((prev) => [...prev, false]);
        setChurchEntriesError(false);
    }, []);

    const removeChurch = useCallback((index: number) => {
        setFormData((prev) => {
            const nextChurchDetails =
                prev.churchDetails?.filter((_, i) => i !== index) || [];
            setChurchEntriesError(nextChurchDetails.length === 0);
            return { ...prev, churchDetails: nextChurchDetails };
        });
        setChurchPhoneCountries((prev) =>
            prev.filter((_, i) => i !== index)
        );
        setChurchPhoneErrors((prev) => prev.filter((_, i) => i !== index));
        setChurchNameErrors((prev) => prev.filter((_, i) => i !== index));
        setChurchAddressErrors((prev) => prev.filter((_, i) => i !== index));
        setChurchCityErrors((prev) => prev.filter((_, i) => i !== index));
        setChurchStateErrors((prev) => prev.filter((_, i) => i !== index));
        setChurchZipErrors((prev) => prev.filter((_, i) => i !== index));
        setChurchCountryErrors((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const toggleInterest = useCallback((interest: string) => {
        // Keep interests error message in sync so it disappears as soon as the user selects.
        setFormData((prev) => {
            const current = prev.interests || [];
            const interests = current.includes(interest)
                ? current.filter((i) => i !== interest)
                : [...current, interest];

            setInterestsError(interests.length === 0);
            return { ...prev, interests };
        });
    }, []);

    
    const validateForm = useCallback((): boolean => {
        setFirstNameError(false);
        setLastNameError(false);
        setEmailError(false);
        setEmailErrorText("");
        setTitleError(false);
        setPersonalPhoneError(false);
        setPersonalPhoneErrorText("");
        setChurchPhoneErrors([]);
        setChurchAddressErrors([]);
        setChurchCityErrors([]);
        setChurchStateErrors([]);
        setChurchZipErrors([]);
        setChurchCountryErrors([]);
        setInterestsError(false);
        setChurchNameErrors([]);
        setChurchEntriesError(false);
        setYearsInMinistryError(false);
        setConferenceError(false);
        setCurrentCommunityProjectsError(false);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.firstName?.trim()) {
            setFirstNameError(true);
            scrollToAndFocus("firstName", () => firstNameRef.current?.focus());
            return false;
        }

        if (!formData.lastName?.trim()) {
            setLastNameError(true);
            scrollToAndFocus("lastName", () => lastNameRef.current?.focus());
            return false;
        }

        if (!formData.email?.trim()) {
            setEmailError(true);
            setEmailErrorText("Email is required");
            scrollToAndFocus("email", () => emailRef.current?.focus());
            return false;
        }

        if (!emailRegex.test(formData.email.trim())) {
            setEmailError(true);
            setEmailErrorText("Enter a valid email address");
            scrollToAndFocus("email", () => emailRef.current?.focus());
            return false;
        }

        const rawPersonal = (formData.phoneNumber || "").replace(/[^\d]/g, "");
        if (!rawPersonal) {
            setPersonalPhoneError(true);
            setPersonalPhoneErrorText("Phone number is required");
            scrollToAndFocus("personalPhone", () => personalPhoneRef.current?.focus());
            return false;
        }
        if (rawPersonal.length < personalPhoneCountry.minLength) {
            setPersonalPhoneError(true);
            setPersonalPhoneErrorText(`Phone number must be at least ${personalPhoneCountry.minLength} digits`);
            scrollToAndFocus("personalPhone", () => personalPhoneRef.current?.focus());
            return false;
        }

        const churches = formData.churchDetails || [];

        
        if (!churches || churches.length === 0) {
            setChurchEntriesError(true);
            scrollToField("churchList");
            return false;
        }

        // All church fields are mandatory except `churchWebsite` and `comments`.
        
        const nextChurchNameErrors = churches.map((church) => !church.churchName?.trim());
        const nextChurchPhoneErrors = churches.map((church, index) => {
            const rawChurchPhone = (church.churchPhone || "").replace(/[^\d]/g, "");
            const country =
                getPhoneCountryFromName(church.country) ||
                churchPhoneCountries[index] ||
                DEFAULT_PHONE_COUNTRY;

            
            if (!rawChurchPhone) return true;
            return rawChurchPhone.length < country.minLength;
        });
        const nextChurchAddressErrors = churches.map((church) => !church.churchAddress?.trim());
        const nextChurchCityErrors = churches.map((church) => !church.city?.trim());
        const nextChurchCountryErrors = churches.map((church) => !church.country?.trim());
        const nextChurchStateErrors = churches.map((church) => !church.state?.trim());
        const nextChurchZipErrors = churches.map((church) => !church.zipCode?.trim());

        const hasChurchErrors =
            nextChurchNameErrors.some(Boolean) ||
            nextChurchPhoneErrors.some(Boolean) ||
            nextChurchAddressErrors.some(Boolean) ||
            nextChurchCityErrors.some(Boolean) ||
            nextChurchCountryErrors.some(Boolean) ||
            nextChurchStateErrors.some(Boolean) ||
            nextChurchZipErrors.some(Boolean);

        if (hasChurchErrors) {
            // Set all church errors once so the UI updates consistently.
            setChurchNameErrors(nextChurchNameErrors);
            setChurchPhoneErrors(nextChurchPhoneErrors);
            setChurchAddressErrors(nextChurchAddressErrors);
            setChurchCityErrors(nextChurchCityErrors);
            setChurchCountryErrors(nextChurchCountryErrors);
            setChurchStateErrors(nextChurchStateErrors);
            setChurchZipErrors(nextChurchZipErrors);

            
            for (let index = 0; index < churches.length; index++) {
                if (nextChurchNameErrors[index]) {
                    scrollToField(`churchName-${index}`);
                    setTimeout(() => churchNameRefs.current[index]?.focus(), 60);
                    return false;
                }
                if (nextChurchPhoneErrors[index]) {
                    scrollToField(`churchPhone-${index}`);
                    setTimeout(() => churchPhoneRefs.current[index]?.focus(), 60);
                    return false;
                }
                if (nextChurchAddressErrors[index]) {
                    scrollToAndFocus(`churchAddress-${index}`, () => churchAddressRefs.current[index]?.focus());
                    return false;
                }
                if (nextChurchCityErrors[index]) {
                    scrollToAndFocus(`churchCity-${index}`, () => churchCityRefs.current[index]?.focus());
                    return false;
                }
                if (nextChurchCountryErrors[index]) {
                    scrollToField(`churchCountry-${index}`);
                    setLocationPicker({ type: "country", churchIndex: index });
                    return false;
                }
                if (nextChurchStateErrors[index]) {
                    scrollToField(`churchState-${index}`);
                    setLocationPicker({ type: "state", churchIndex: index });
                    return false;
                }
                if (nextChurchZipErrors[index]) {
                    scrollToAndFocus(`churchZip-${index}`, () => churchZipRefs.current[index]?.focus());
                    return false;
                }
            }
        }

        if (!formData.title) {
            setTitleError(true);
            scrollToField("title");
            setShowTitleDropdown(true);
            return false;
        }

        if (!formData.yearsInMinistry?.trim()) {
            setYearsInMinistryError(true);
            scrollToAndFocus("yearsInMinistry", () => yearsInMinistryRef.current?.focus());
            return false;
        }

        if (!formData.conference?.trim()) {
            setConferenceError(true);
            scrollToAndFocus("conference", () => conferenceRef.current?.focus());
            return false;
        }

        if (!formData.currentCommunityProjects?.trim()) {
            setCurrentCommunityProjectsError(true);
            scrollToAndFocus(
                "currentCommunityProjects",
                () => currentCommunityProjectsRef.current?.focus()
            );
            return false;
        }

        const interestsCount = formData.interests?.length || 0;
        if (interestsCount === 0) {
            setInterestsError(true);
            scrollToField("interests");
            setShowInterestsDropdown(true);
            return false;
        }
        return true;
    }, [
        formData,
        personalPhoneCountry,
        churchPhoneCountries,
        scrollToAndFocus,
        scrollToField
    ]);

    
    const handleSubmit = useCallback(() => {
        if (!validateForm()) return;

        
        setSubmitErrorText("");

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

                <KeyboardSafeContainer
                    innerRef={scrollViewRef as React.Ref<KeyboardAwareScrollView>}
                    showsVerticalScrollIndicator={false}
                    extraScrollHeight={20}
                    useSafeAreaBottom
                    bottomPadding={96}
                    contentContainerStyle={[
                        styles.scrollContent,
                    ]}
                >
                    {}
                    {isLoadingMetadata && (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ActivityIndicator color="#FFD700" />
                            <Text style={{ color: '#fff', marginTop: 8 }}>Loading form options...</Text>
                        </View>
                    )}

                    {}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.row}>
                            <View style={styles.halfWidth} onLayout={registerFieldLayout("firstName")}>
                                <TextInput
                                    ref={firstNameRef}
                                    style={[styles.input, firstNameError && styles.inputError]}
                                    placeholder="First Name *"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={formData.firstName}
                                    onChangeText={(text) => {
                                        setFirstNameError(false);
                                        handleInputChange('firstName', text);
                                    }}
                                    editable={!isLoading}
                                />
                                {firstNameError && (
                                    <Text style={styles.errorText}>First name is required</Text>
                                )}
                            </View>
                            <View style={styles.halfWidth} onLayout={registerFieldLayout("lastName")}>
                                <TextInput
                                    ref={lastNameRef}
                                    style={[styles.input, lastNameError && styles.inputError]}
                                    placeholder="Last Name *"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={formData.lastName}
                                    onChangeText={(text) => {
                                        setLastNameError(false);
                                        handleInputChange('lastName', text);
                                    }}
                                    editable={!isLoading}
                                />
                                {lastNameError && (
                                    <Text style={styles.errorText}>Last name is required</Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.row}>
                            <View
                                style={styles.halfWidth}
                                onLayout={registerFieldLayout("personalPhone")}
                            >
                                <PhoneInputWithCountry
                                    ref={personalPhoneRef}
                                    value={formData.phoneNumber || ''}
                                    onChangeText={(text) => {
                                        setPersonalPhoneError(false);
                                        setPersonalPhoneErrorText('');
                                        handleInputChange('phoneNumber', text);
                                    }}
                                    selectedCountry={personalPhoneCountry}
                                    onOpenCountryPicker={() =>
                                        setLocationPicker({ type: "personalPhoneCountry" })
                                    }
                                    // Keep placeholders clean; required state is shown via inline error text.
                                    placeholder="Number"
                                    disabled={isLoading}
                                    hasError={personalPhoneError}
                                />
                                {personalPhoneError && (
                                    <Text style={styles.errorText}>
                                        {personalPhoneErrorText || "Phone number is required"}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.halfWidth} onLayout={registerFieldLayout("email")}>
                                <TextInput
                                    ref={emailRef}
                                    style={[styles.input, emailError && styles.inputError]}
                                    placeholder="Email *"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={formData.email}
                                    onChangeText={(text) => {
                                        setEmailError(false);
                                        setEmailErrorText('');
                                        setSubmitErrorText("");
                                        handleInputChange('email', text);
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                />
                                {emailError && (
                                    <Text style={styles.errorText}>
                                        {emailErrorText || "Email is required"}
                                    </Text>
                                )}
                            {!emailError && (
                                <Text style={styles.helperText}>
                                    Your email address will be used as your username for login.
                                </Text>
                            )}
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {}
                    <View onLayout={registerFieldLayout("churchList")}>
                        {churchEntriesError && (
                            <Text style={styles.errorText}>
                                At least one church entry is required
                            </Text>
                        )}
                    </View>
                    {(formData.churchDetails || []).map((church, index) => (
                        <React.Fragment key={`church-${index}`}>
                            <View style={styles.section}>
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.sectionTitle}>
                                        Church Information *
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

                                <View onLayout={registerFieldLayout(`churchName-${index}`)}>
                                    <TextInput
                                        ref={(el) => {
                                            churchNameRefs.current[index] = el;
                                        }}
                                        style={[
                                            styles.input,
                                            churchNameErrors[index] && styles.inputError,
                                        ]}
                                        placeholder="Church Name *"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.churchName}
                                        onChangeText={(text) => {
                                            setChurchNameErrors((prev) => {
                                                const copy = [...prev];
                                                copy[index] = false;
                                                return copy;
                                            });
                                            handleChurchChange(index, 'churchName', text);
                                        }}
                                        editable={!isLoading}
                                    />
                                    {churchNameErrors[index] && (
                                        <Text style={styles.errorText}>
                                            Church name is required
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.row}>
                                    <View
                                        style={styles.halfWidth}
                                        onLayout={registerFieldLayout(`churchPhone-${index}`)}
                                    >
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
                                                getPhoneCountryFromName(church.country) ||
                                                DEFAULT_PHONE_COUNTRY
                                            }
                                            onOpenCountryPicker={() =>
                                                setLocationPicker({
                                                    type: "churchPhoneCountry",
                                                    churchIndex: index,
                                                })
                                            }
                                            placeholder="Number"
                                            disabled={isLoading}
                                            hasError={churchPhoneErrors[index]}
                                        />
                                        {churchPhoneErrors[index] && (
                                            <Text style={styles.errorText}>
                                                {church.churchPhone?.trim()
                                                    ? `Church phone must be at least ${
                                                          (churchPhoneCountries[index] || DEFAULT_PHONE_COUNTRY).minLength
                                                      } digits`
                                                    : "Church phone is required"}
                                            </Text>
                                        )}
                                    </View>
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

                                <View
                                    onLayout={registerFieldLayout(`churchAddress-${index}`)}
                                >
                                    <TextInput
                                        ref={(el) => {
                                            churchAddressRefs.current[index] = el;
                                        }}
                                        style={[
                                            styles.input,
                                            churchAddressErrors[index] && styles.inputError,
                                        ]}
                                        placeholder="Church Address"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.churchAddress}
                                        onChangeText={(text) => {
                                            setChurchAddressErrors((prev) => {
                                                const copy = [...prev];
                                                copy[index] = false;
                                                return copy;
                                            });
                                            handleChurchChange(index, 'churchAddress', text);
                                        }}
                                        editable={!isLoading}
                                    />
                                    {churchAddressErrors[index] && (
                                        <Text style={styles.errorText}>Church address is required</Text>
                                    )}
                                </View>

                                <View style={styles.row}>
                                    <View
                                        style={styles.halfWidth}
                                        onLayout={registerFieldLayout(`churchCity-${index}`)}
                                    >
                                        <TextInput
                                            ref={(el) => {
                                                churchCityRefs.current[index] = el;
                                            }}
                                            style={[
                                                styles.input,
                                                churchCityErrors[index] && styles.inputError,
                                            ]}
                                            placeholder="City"
                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                            value={church.city}
                                            onChangeText={(text) => {
                                                setChurchCityErrors((prev) => {
                                                    const copy = [...prev];
                                                    copy[index] = false;
                                                    return copy;
                                                });
                                                handleChurchChange(index, 'city', text);
                                            }}
                                            editable={!isLoading}
                                        />
                                        {churchCityErrors[index] && (
                                            <Text style={styles.errorText}>City is required</Text>
                                        )}
                                    </View>
                              

                                       {}
                                       <View
                                        style={styles.halfWidth}
                                        onLayout={registerFieldLayout(`churchCountry-${index}`)}
                                    >
                                        <TouchableOpacity
                                            style={[
                                                styles.dropdown,
                                                churchCountryErrors[index] && styles.inputError,
                                            ]}
                                            onPress={() =>
                                                setLocationPicker({
                                                    type: "country",
                                                    churchIndex: index,
                                                })
                                            }
                                            disabled={isLoading}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownText,
                                                    !church.country && styles.placeholderText,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {church.country || "Country *"}
                                            </Text>
                                            <Ionicons
                                                name="chevron-down"
                                                size={20}
                                                color="rgba(255,255,255,0.6)"
                                            />
                                        </TouchableOpacity>
                                        {churchCountryErrors[index] && (
                                            <Text style={styles.errorText}>Country is required</Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.row}>
                                    <View
                                        style={styles.halfWidth}
                                        onLayout={registerFieldLayout(`churchZip-${index}`)}
                                    >
                                        <TextInput
                                            ref={(el) => {
                                                churchZipRefs.current[index] = el;
                                            }}
                                            style={[
                                                styles.input,
                                                churchZipErrors[index] && styles.inputError,
                                            ]}
                                            placeholder="Zip Code"
                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                            value={church.zipCode}
                                            onChangeText={(text) => {
                                                setChurchZipErrors((prev) => {
                                                    const copy = [...prev];
                                                    copy[index] = false;
                                                    return copy;
                                                });
                                                handleChurchChange(index, 'zipCode', text);
                                            }}
                                            keyboardType="number-pad"
                                            editable={!isLoading}
                                        />
                                        {churchZipErrors[index] && (
                                            <Text style={styles.errorText}>Zip code is required</Text>
                                        )}
                                    </View>

                               

                                        {}
                                        <View
                                        style={styles.halfWidth}
                                        onLayout={registerFieldLayout(`churchState-${index}`)}
                                    >
                                        <TouchableOpacity
                                            style={[
                                                styles.dropdown,
                                                churchStateErrors[index] && styles.inputError,
                                                !church.country && styles.inputDisabled,
                                            ]}
                                            onPress={() =>
                                                setLocationPicker({
                                                    type: "state",
                                                    churchIndex: index,
                                                })
                                            }
                                            disabled={isLoading || !church.country}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownText,
                                                    !church.state && styles.placeholderText,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {church.state || "State / Province *"}
                                            </Text>
                                            <Ionicons
                                                name="chevron-down"
                                                size={20}
                                                color="rgba(255,255,255,0.6)"
                                            />
                                        </TouchableOpacity>
                                        {churchStateErrors[index] && (
                                            <Text style={styles.errorText}>State is required</Text>
                                        )}
                                    </View>
                                </View>

                                {}
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

                    {}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Other Information</Text>

                        {}
                        <View onLayout={registerFieldLayout("title")}>
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
                            {titleError && (
                                <Text style={styles.errorText}>Title is required</Text>
                            )}
                        </View>
                        {showTitleDropdown && (
                            <View style={styles.titleDropdownMenu}>
                                {TITLE_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.titleDropdownItem}
                                        onPress={() => {
                                            setTitleError(false);
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
                            <View
                                style={styles.halfWidth}
                                onLayout={registerFieldLayout("yearsInMinistry")}
                            >
                                <TextInput
                                    ref={yearsInMinistryRef}
                                    style={[
                                        styles.input,
                                        yearsInMinistryError && styles.inputError,
                                    ]}
                                    placeholder="Years in Ministry"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={formData.yearsInMinistry}
                                    onChangeText={(text) => {
                                        setYearsInMinistryError(false);
                                        handleInputChange('yearsInMinistry', text);
                                    }}
                                    keyboardType="number-pad"
                                    editable={!isLoading}
                                />
                                {yearsInMinistryError && (
                                    <Text style={styles.errorText}>Years in Ministry is required</Text>
                                )}
                            </View>
                            <View
                                style={styles.halfWidth}
                                onLayout={registerFieldLayout("conference")}
                            >
                                <TextInput
                                    ref={conferenceRef}
                                    style={[
                                        styles.input,
                                        conferenceError && styles.inputError,
                                    ]}
                                    placeholder="Conference"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={formData.conference}
                                    onChangeText={(text) => {
                                        setConferenceError(false);
                                        handleInputChange('conference', text);
                                    }}
                                    editable={!isLoading}
                                />
                                {conferenceError && (
                                    <Text style={styles.errorText}>Conference is required</Text>
                                )}
                            </View>
                        </View>

                        <View onLayout={registerFieldLayout("currentCommunityProjects")}>
                            <TextInput
                                ref={currentCommunityProjectsRef}
                                style={[
                                    styles.input,
                                    currentCommunityProjectsError && styles.inputError,
                                ]}
                                placeholder="Current Community Service Projects"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.currentCommunityProjects}
                                onChangeText={(text) => {
                                    setCurrentCommunityProjectsError(false);
                                    handleInputChange('currentCommunityProjects', text);
                                }}
                                editable={!isLoading}
                            />
                            {currentCommunityProjectsError && (
                                <Text style={styles.errorText}>
                                    Current Community Service Projects is required
                                </Text>
                            )}
                        </View>

                        {}
                        <View onLayout={registerFieldLayout("interests")}>
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
                                        interestsError && styles.dropdownErrorText,
                                    ]}
                                >
                                    {(formData.interests?.length || 0) > 0
                                        ? `${formData.interests?.length} selected`
                                        : 'Interests *'}
                                </Text>
                                <Ionicons
                                    name={showInterestsDropdown ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color="rgba(255,255,255,0.6)"
                                />
                            </TouchableOpacity>
                            {interestsError && (
                                <Text style={styles.errorText}>
                                    Select at least one interest
                                </Text>
                            )}
                        </View>
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

                        {}
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

                        {}
                        {submitErrorText && !emailError && (
                            <Text style={styles.errorText}>{submitErrorText}</Text>
                        )}

                        {}
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
                        {/* Extra space so Submit is never under Android system bar */}
                        <View style={{ height: bottom + 120 }} />
                    </View>
                </KeyboardSafeContainer>

                <SearchableSelectModal
                    visible={locationPicker?.type === "personalPhoneCountry"}
                    title="Select Mobile Country Code"
                    options={PHONE_COUNTRY_OPTIONS.map((option) => ({
                        label: `${option.name} (${option.dialCode})`,
                        value: option.id,
                    }))}
                    selectedValue={personalPhoneCountry.id}
                    onSelect={(value) => {
                        const selected = PHONE_COUNTRY_OPTIONS.find(
                            (option) => option.id === value
                        );
                        if (selected) {
                            setPersonalPhoneCountry(selected);
                        }
                        setLocationPicker(null);
                    }}
                    onClose={() => setLocationPicker(null)}
                    searchPlaceholder="Search countries..."
                />

                <SearchableSelectModal
                    visible={locationPicker?.type === "churchPhoneCountry"}
                    title="Select Church Phone Country Code"
                    options={PHONE_COUNTRY_OPTIONS.map((option) => ({
                        label: `${option.name} (${option.dialCode})`,
                        value: option.id,
                    }))}
                    selectedValue={
                        locationPicker?.type === "churchPhoneCountry"
                            ? (
                                  churchPhoneCountries[locationPicker.churchIndex] ||
                                  getPhoneCountryFromName(
                                      formData.churchDetails?.[locationPicker.churchIndex]?.country
                                  ) ||
                                  DEFAULT_PHONE_COUNTRY
                              ).id
                            : undefined
                    }
                    onSelect={(value) => {
                        if (locationPicker?.type === "churchPhoneCountry") {
                            const selected = PHONE_COUNTRY_OPTIONS.find(
                                (option) => option.id === value
                            );
                            if (selected) {
                                handleChurchPhoneCountrySelect(
                                    locationPicker.churchIndex,
                                    selected
                                );
                                return;
                            }
                        }
                        setLocationPicker(null);
                    }}
                    onClose={() => setLocationPicker(null)}
                    searchPlaceholder="Search countries..."
                />

                <SearchableSelectModal
                    visible={locationPicker?.type === "country"}
                    title="Select Country"
                    options={COUNTRY_OPTIONS}
                    selectedValue={activeChurchForPicker?.country}
                    onSelect={(value) => {
                        if (locationPicker?.type === "country") {
                            handleChurchCountrySelect(locationPicker.churchIndex, value);
                        }
                    }}
                    onClose={() => setLocationPicker(null)}
                    searchPlaceholder="Search countries..."
                />

                <SearchableSelectModal
                    visible={locationPicker?.type === "state"}
                    title="Select State / Province"
                    options={
                        activeChurchForPicker?.country
                            ? getStateOptionsForCountry(activeChurchForPicker.country)
                            : []
                    }
                    selectedValue={activeChurchForPicker?.state}
                    onSelect={(value) => {
                        if (locationPicker?.type === "state") {
                            handleChurchStateSelect(locationPicker.churchIndex, value);
                        }
                    }}
                    onClose={() => setLocationPicker(null)}
                    searchPlaceholder="Search states..."
                    emptyMessage={
                        activeChurchForPicker?.country
                            ? "No states found for this country"
                            : "Select a country first"
                    }
                />
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
        // Prevent the placeholder from wrapping when the input gets narrow.
        minWidth: 0,
        flexShrink: 1,
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
    errorText: {
        color: "#FCA5A5",
        marginTop: -6,
        marginBottom: 12,
        fontSize: 12,
    },
    helperText: {
        color: "rgba(255,255,255,0.65)",
        marginTop: -6,
        marginBottom: 12,
        fontSize: 12,
    },
    inputDisabled: {
        opacity: 0.6,
    },
    interestsMenu: {
        
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


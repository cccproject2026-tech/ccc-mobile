import TopBar from "@/components/director/TopBar";
import { useSubmitInterest } from "@/hooks/onboarding/useSubmitInterest";
import { ChurchInfo, InterestFormData } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React, { useState } from "react";
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

export default function InterestFormScreen() {
    const { top, bottom } = useSafeAreaInsets();

    const { mutate: submitInterest, isPending: isLoading } = useSubmitInterest();

    const [formData, setFormData] = useState<Partial<InterestFormData>>({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        churchDetails: [
            {
                churchName: "",
                churchPhone: "",
                churchWebsite: "",
                churchAddress: "",
                city: "",
                state: "",
                zipCode: "",
                country: "USA",
            },
        ] as ChurchInfo[],
        title: "",
        yearsInMinistry: "",
        conference: "",
        currentCommunityProjects: "",
        interests: [] as string[],
        comments: "",
    });

    const [showTitleDropdown, setShowTitleDropdown] = useState(false);
    const [showInterestsDropdown, setShowInterestsDropdown] = useState(false);
    const [showCountryDropdown, setShowCountryDropdown] = useState<number | null>(null);

    const titleOptions = ["Pastor", "Lay Leader", "Seminarian"];
    const interestOptions = [
        "I would like to find out more about the Center for Community Change",
        "I am interested in receiving mentoring in community engagement",
        "I would like to talk to one of the mentors",
        "I am a conference administrator and would like to find out more about partnering with the center",
    ];
    const countryOptions = [
        { label: "USA", value: "USA" },
        { label: "Canada", value: "Canada" },
        { label: "Mexico", value: "Mexico" },
        { label: "Brazil", value: "Brazil" },
    ];

    // Auto-fill function for testing
    const autoFillForm = () => {
        setFormData({
            firstName: "John",
            lastName: "Doe",
            phoneNumber: "269-471-6159",
            email: "john.doe@example.com",
            churchDetails: [
                {
                    churchName: "First Community Church",
                    churchPhone: "269-555-0123",
                    churchWebsite: "www.firstcommunitychurch.org",
                    churchAddress: "123 Main Street",
                    city: "Berrien Springs",
                    state: "Michigan",
                    zipCode: "49103",
                    country: "USA",
                },
            ],
            title: "Pastor",
            yearsInMinistry: "5",
            conference: "Lake Union Conference",
            currentCommunityProjects: "Food bank ministry, Youth mentoring program, Community outreach events",
            interests: [
                "I would like to find out more about the Center for Community Change",
                "I am interested in receiving mentoring in community engagement",
            ],
            comments: "I am excited to learn more about community engagement opportunities and would love to connect with other pastors doing similar work.",
        });

        Alert.alert(
            "Form Auto-Filled!",
            "All fields have been populated with sample data. You can now submit or modify the information.",
            [{ text: "OK" }]
        );
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleChurchChange = (
        index: number,
        field: keyof ChurchInfo,
        value: string
    ) => {
        const updatedChurches = [...(formData.churchDetails || [])];
        updatedChurches[index] = { ...updatedChurches[index], [field]: value };
        setFormData((prev) => ({ ...prev, churches: updatedChurches }));
    };

    const addChurch = () => {
        const newChurch: ChurchInfo = {
            id: `${Date.now()}`,
            churchName: "",
            churchPhone: "",
            churchWebsite: "",
            churchAddress: "",
            city: "",
            state: "",
            zipCode: "",
            country: "USA",
        };
        setFormData((prev) => ({
            ...prev,
            churches: [...(prev.churchDetails || []), newChurch],
        }));
    };

    const toggleInterest = (interest: string) => {
        setFormData((prev) => {
            const interests = (prev.interests || []).includes(interest)
                ? (prev.interests || []).filter((i) => i !== interest)
                : [...(prev.interests || []), interest];
            return { ...prev, interests };
        });
    };

    // ✅ UPDATED: Use mutation hook
    const handleSubmit = () => {
        // Validation
        if (
            !formData.firstName ||
            !formData.lastName ||
            !formData.email ||
            !formData.phoneNumber
        ) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        // Submit with success/error handling
        submitInterest(formData as InterestFormData, {
            onSuccess: () => {
                Alert.alert(
                    "Success!",
                    "Your interest form has been submitted successfully. You will receive an email once your application is approved.",
                    // [
                    //     {
                    //         text: "OK",
                    //         onPress: () => router.replace("/(unauthenticated)"),
                    //     },
                    // ]
                );
            },
            onError: (error: any) => {
                Alert.alert(
                    "Error",
                    error.message || "Failed to submit interest form. Please try again."
                );
            },
        });
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={["#176192", "#1D548D", "#264387"]}
                style={[styles.container]}
            >
                {/* Header */}
                <TopBar showDrawer={false} showNotifications={false} showUserName userName="Interest Form" />

                <KeyboardAwareScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: bottom + 20 },
                    ]}
                >
                    <View style={styles.header}>
                        {/* Auto-Fill Button */}
                        <TouchableOpacity
                            style={styles.autoFillButton}
                            onPress={autoFillForm}
                        >
                            <Ionicons name="flash" size={18} color="#FFD700" />
                            <Text style={styles.autoFillButtonText}>Auto-Fill</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Personal Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="First Name"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.firstName}
                                onChangeText={(text) => handleInputChange("firstName", text)}
                            />
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="Last Name"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.lastName}
                                onChangeText={(text) => handleInputChange("lastName", text)}
                            />
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="Phone Number"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.phoneNumber}
                                onChangeText={(text) => handleInputChange("phoneNumber", text)}
                                keyboardType="phone-pad"
                            />
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="Email"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.email}
                                onChangeText={(text) => handleInputChange("email", text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Current Church Information */}
                    {(formData.churchDetails || []).map((church, index) => (
                        <React.Fragment key={church.id}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    Current Church Information
                                    {(formData.churchDetails?.length || 0) > 1 && ` #${index + 1}`}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Church Name"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={church.churchName}
                                    onChangeText={(text) =>
                                        handleChurchChange(index, "churchName", text)
                                    }
                                />
                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.halfWidth]}
                                        placeholder="Church Phone"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.churchPhone}
                                        onChangeText={(text) =>
                                            handleChurchChange(index, "churchPhone", text)
                                        }
                                        keyboardType="phone-pad"
                                    />
                                    <TextInput
                                        style={[styles.input, styles.halfWidth]}
                                        placeholder="Church Website"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.churchWebsite}
                                        onChangeText={(text) =>
                                            handleChurchChange(index, "churchWebsite", text)
                                        }
                                        autoCapitalize="none"
                                    />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Church Address"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    value={church.churchAddress}
                                    onChangeText={(text) =>
                                        handleChurchChange(index, "churchAddress", text)
                                    }
                                />
                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.halfWidth]}
                                        placeholder="City"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.city}
                                        onChangeText={(text) =>
                                            handleChurchChange(index, "city", text)
                                        }
                                    />
                                    <TextInput
                                        style={[styles.input, styles.halfWidth]}
                                        placeholder="State"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.state}
                                        onChangeText={(text) =>
                                            handleChurchChange(index, "state", text)
                                        }
                                    />
                                </View>
                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, styles.halfWidth]}
                                        placeholder="Zip Code"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={church.zipCode}
                                        onChangeText={(text) =>
                                            handleChurchChange(index, "zipCode", text)
                                        }
                                        keyboardType="number-pad"
                                    />

                                    {/* Country Dropdown */}
                                    <View style={styles.halfWidth}>
                                        <TouchableOpacity
                                            style={styles.dropdown}
                                            onPress={() => setShowCountryDropdown(showCountryDropdown === index ? null : index)}
                                        >
                                            <Text
                                                style={[
                                                    styles.dropdownText,
                                                    !church.country && styles.placeholderText,
                                                ]}
                                            >
                                                {church.country || "Country"}
                                            </Text>
                                            <Ionicons
                                                name={showCountryDropdown === index ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color="rgba(255,255,255,0.6)"
                                            />
                                        </TouchableOpacity>
                                        {showCountryDropdown === index && (
                                            <View style={styles.countryDropdownMenu}>
                                                {countryOptions.map((option) => (
                                                    <TouchableOpacity
                                                        key={option.value}
                                                        style={styles.countryDropdownItem}
                                                        onPress={() => {
                                                            handleChurchChange(index, "country", option.value);
                                                            setShowCountryDropdown(null);
                                                        }}
                                                    >
                                                        <View style={styles.countryRadio}>
                                                            {church.country === option.value && (
                                                                <View style={styles.countryRadioSelected} />
                                                            )}
                                                        </View>
                                                        <Text style={styles.countryDropdownItemText}>{option.label}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.addMoreButton} onPress={addChurch}>
                                    <Text style={styles.addMoreButtonText}>Add more Church</Text>
                                </TouchableOpacity>
                            </View>
                            {index < (formData.churchDetails?.length || 0) - 1 && (
                                <View style={styles.divider} />
                            )}
                        </React.Fragment>
                    ))}

                    <View style={styles.divider} />

                    {/* Other Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Other Information</Text>

                        {/* Title Dropdown */}
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowTitleDropdown(!showTitleDropdown)}
                        >
                            <Text
                                style={[
                                    styles.dropdownText,
                                    !formData.title && styles.placeholderText,
                                ]}
                            >
                                {formData.title || "Title"}
                            </Text>
                            <Ionicons
                                name={showTitleDropdown ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="rgba(255,255,255,0.6)"
                            />
                        </TouchableOpacity>
                        {showTitleDropdown && (
                            <View style={styles.titleDropdownMenu}>
                                {titleOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.titleDropdownItem}
                                        onPress={() => {
                                            handleInputChange("title", option);
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
                                    handleInputChange("yearsInMinistry", text)
                                }
                                keyboardType="number-pad"
                            />
                            <TextInput
                                style={[styles.input, styles.halfWidth]}
                                placeholder="Conference"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.conference}
                                onChangeText={(text) => handleInputChange("conference", text)}
                            />
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="Current Community Service Projects"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={formData.currentCommunityProjects}
                            onChangeText={(text) =>
                                handleInputChange("currentCommunityServiceProjects", text)
                            }
                        />

                        {/* Interests Dropdown */}
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowInterestsDropdown(!showInterestsDropdown)}
                        >
                            <Text
                                style={[
                                    styles.dropdownText,
                                    (formData.interests?.length || 0) === 0 && styles.placeholderText,
                                ]}
                            >
                                {(formData.interests?.length || 0) > 0
                                    ? `${formData.interests?.length} selected`
                                    : "Interests"}
                            </Text>
                            <Ionicons
                                name={showInterestsDropdown ? "chevron-up" : "chevron-down"}
                                size={20}
                                color="rgba(255,255,255,0.6)"
                            />
                        </TouchableOpacity>
                        {showInterestsDropdown && (
                            <View style={styles.interestsMenu}>
                                {interestOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={styles.interestItem}
                                        onPress={() => toggleInterest(option)}
                                    >
                                        <View style={styles.checkbox}>
                                            {(formData.interests || []).includes(option) && (
                                                <Ionicons name="checkmark" size={18} color="#1A5490" />
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
                            onChangeText={(text) => handleInputChange("comments", text)}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
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


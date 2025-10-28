import { usePhaseCreation } from '@/context/PhaseCreationContext';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface CreateRoadmapModalProps {
    onClose: () => void;
    onNext: (data: RoadmapFormData) => void;
    onCancel: () => void;
}

export interface RoadmapFormData {
    type: 'Single Roadmap' | 'Phase';
    name: string;
    subheading: string;
    completionTime: string;
    divisions: string[];
    bannerImage?: string;
}

const CreateRoadmapModal = forwardRef<BottomSheetModal, CreateRoadmapModalProps>(
    ({ onClose, onNext, onCancel }, ref) => {
        const { bottom } = useSafeAreaInsets();
        const router = useRouter();
        const { setPhaseDetails } = usePhaseCreation();
        const snapPoints = useMemo(() => ['90%'], []);

        const [formData, setFormData] = useState<RoadmapFormData>({
            type: 'Single Roadmap',
            name: '',
            subheading: '',
            completionTime: '',
            divisions: [],
            bannerImage: undefined
        });

        const [showTypeDropdown, setShowTypeDropdown] = useState(false);
        const [newDivision, setNewDivision] = useState('');

        const resetForm = () => {
            setFormData({
                type: 'Single Roadmap',
                name: '',
                subheading: '',
                completionTime: '',
                divisions: [],
                bannerImage: undefined
            });
            setNewDivision('');
            setShowTypeDropdown(false);
        };

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                    pressBehavior="close"
                />
            ),
            []
        );

        const handleTypeSelect = (type: 'Single Roadmap' | 'Phase') => {
            setFormData(prev => ({ ...prev, type }));
            setShowTypeDropdown(false);
        };

        const handleAddDivision = () => {
            if (newDivision.trim()) {
                console.log('Adding division:', newDivision.trim());
                setFormData(prev => ({
                    ...prev,
                    divisions: [...prev.divisions, newDivision.trim()]
                }));
                setNewDivision('');
                console.log('Division input reset to empty');
            }
        };

        const handleRemoveDivision = (index: number) => {
            setFormData(prev => ({
                ...prev,
                divisions: prev.divisions.filter((_, i) => i !== index)
            }));
        };

        const handleImagePicker = async () => {
            try {
                const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [16, 9],
                    quality: 0.8,
                });
                console.log('Image picker result:', result);

                if (!result.canceled && result.assets[0]) {
                    setFormData(prev => ({
                        ...prev,
                        bannerImage: result.assets[0].uri
                    }));
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to pick image');
                console.error('Image picker error:', error);
            }
        };

        const validateForm = () => {
            const errors: string[] = [];

            // Check required fields based on type
            const nameLabel = formData.type === 'Phase' ? 'Name of Phase' : 'Roadmap Name';
            const subheadingLabel = formData.type === 'Phase' ? 'Name of Subtitle for Phase' : 'Roadmap Subheading';
            const completionLabel = formData.type === 'Phase' ? 'Completion Time for the Phase' : 'Completion Time for the Roadmap';

            if (!formData.name.trim()) {
                errors.push(`${nameLabel} is required`);
            }

            if (!formData.subheading.trim()) {
                errors.push(`${subheadingLabel} is required`);
            }

            if (!formData.completionTime.trim()) {
                errors.push(`${completionLabel} is required`);
            }

            // For Phase type, at least one division should be added
            if (formData.type === 'Phase' && formData.divisions.length === 0) {
                errors.push('At least one division is required for Phase type');
            }

            return errors;
        };

        const isFormValid = () => {
            return validateForm().length === 0;
        };

        const handleNext = () => {
            const validationErrors = validateForm();

            if (validationErrors.length > 0) {
                Alert.alert(
                    'Validation Error',
                    validationErrors.join('\n'),
                    [{ text: 'OK' }]
                );
                return;
            }

            if (formData.type === 'Phase') {
                // For Phase type, save to context and navigate to create-roadmap page
                setPhaseDetails({
                    phaseName: formData.name,
                    phaseSubheading: formData.subheading,
                    phaseCompletionTime: formData.completionTime,
                    phaseDivisions: formData.divisions,
                    phaseBannerImage: formData.bannerImage || ''
                });
                
                resetForm();
                onCancel();
                
                router.push({
                    // @ts-ignore - grouped route path
                    pathname: '/(director-tabs)/(tabs)/revitalization-roadmaps/(creation)/create-roadmap',
                    params: { isPhaseFlow: 'true' }
                } as any);
            } else {
                // For Single Roadmap type, navigate to roadmap-form page
                const queryParams = {
                    name: formData.name,
                    subheading: formData.subheading,
                    completionTime: formData.completionTime,
                    bannerImage: formData.bannerImage || ''
                };

                resetForm();
                onCancel();
                
                router.push({
                    // @ts-ignore - grouped route path
                    pathname: '/(director-tabs)/(tabs)/revitalization-roadmaps/(creation)/roadmap-form',
                    params: queryParams
                } as any);
            }
        };

        const handleCancel = () => {
            resetForm();
            onCancel();
        };

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
                onDismiss={() => {
                    resetForm();
                    onClose();
                }}
            >
                <BottomSheetView
                    style={[styles.contentContainer, { paddingBottom: bottom + 20 }]}
                >
                    {/* Close Button */}
                    <Pressable style={styles.closeButton} onPress={handleCancel}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </Pressable>

                    {/* Header */}
                    <LinearGradient
                        colors={["#7C3AED", "#38BDF8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Create New Roadmap</Text>
                        </View>
                    </LinearGradient>

                    {/* Form Content */}
                    <View style={styles.formWrapper}>
                        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            <View style={styles.formContainer}>
                                {/* Type Dropdown */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>Type</Text>
                                    <Pressable
                                        style={styles.dropdown}
                                        onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                                    >
                                        <Text style={styles.dropdownText}>{formData.type}</Text>
                                        <Ionicons
                                            name={
                                                showTypeDropdown ? "chevron-up" : "chevron-down"
                                            }
                                            size={20}
                                            color="#fff"
                                        />
                                    </Pressable>

                                    {showTypeDropdown && (
                                        <View style={styles.dropdownOptions}>
                                            <TouchableOpacity
                                                style={styles.dropdownOption}
                                                onPress={() => handleTypeSelect("Single Roadmap")}
                                            >
                                                <Text style={styles.dropdownOptionText}>
                                                    Single Roadmap
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.dropdownOption}
                                                onPress={() => handleTypeSelect("Phase")}
                                            >
                                                <Text style={styles.dropdownOptionText}>Phase</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>

                                {/* Dynamic Name Field */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {formData.type === "Phase"
                                            ? "Name of Phase"
                                            : "Roadmap Name"}
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder={
                                            formData.type === "Phase"
                                                ? "Enter Name of Phase"
                                                : "Enter Name"
                                        }
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={formData.name}
                                        onChangeText={(text) =>
                                            setFormData((prev) => ({ ...prev, name: text }))
                                        }
                                    />
                                </View>

                                {/* Dynamic Subheading Field */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {formData.type === "Phase"
                                            ? "Name of Subtitle for Phase"
                                            : "Roadmap Subheading"}
                                    </Text>
                                    <TextInput
                                        style={[styles.textInput, styles.textArea]}
                                        placeholder={
                                            formData.type === "Phase"
                                                ? "Enter Subtitle"
                                                : "Enter Subheading"
                                        }
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={formData.subheading}
                                        onChangeText={(text) =>
                                            setFormData((prev) => ({ ...prev, subheading: text }))
                                        }
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </View>

                                {/* Dynamic Completion Time Field */}
                                <View style={styles.fieldContainer}>
                                    <Text style={styles.fieldLabel}>
                                        {formData.type === "Phase"
                                            ? "Completion Time for the Phase"
                                            : "Completion Time for the Roadmap"}
                                    </Text>
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Months :"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        value={formData.completionTime}
                                        onChangeText={(text) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                completionTime: text,
                                            }))
                                        }
                                    />
                                </View>

                                {/* Division of Phase - Always show */}
                                {formData.type === "Phase" && (
                                    <View style={styles.fieldContainer}>
                                        <Text style={styles.fieldLabel}>Division of Phase</Text>

                                        {/* Add Division Input */}
                                        <View style={styles.divisionInputContainer}>
                                            <TextInput
                                                key={`division-input-${formData.divisions.length}`}
                                                style={[styles.textInput, styles.divisionInput]}
                                                placeholder="None"
                                                placeholderTextColor="rgba(255,255,255,0.5)"
                                                value={newDivision}
                                                onChangeText={setNewDivision}
                                            />
                                            <TouchableOpacity
                                                style={styles.addButton}
                                                onPress={handleAddDivision}
                                            >
                                                <Ionicons name="add" size={20} color="#fff" />
                                                <Text style={styles.addButtonText}>Add</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Division Tags */}
                                        {formData.divisions.length > 0 && (
                                            <View style={styles.tagsContainer}>
                                                {formData.divisions.map((division, index) => (
                                                    <View key={index} style={styles.tag}>
                                                        <Text style={styles.tagText}>{division}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => handleRemoveDivision(index)}
                                                            style={styles.tagRemove}
                                                        >
                                                            <Ionicons
                                                                name="close"
                                                                size={16}
                                                                color="#fff"
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                )}

                                {/* Upload Banner Button */}
                                {formData.bannerImage ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image source={{ uri: formData.bannerImage }} style={styles.imagePreview} />
                                        <TouchableOpacity style={styles.changeImageButton} onPress={handleImagePicker}>
                                            <Text style={styles.changeImageText}>Change Image</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.uploadButton} onPress={handleImagePicker}>
                                        <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                                        <Text style={styles.uploadButtonText}>
                                            {formData.type === "Phase"
                                                ? "Upload Banner Image for the Phase"
                                                : "Upload Banner Image for the Roadmap"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={handleCancel}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.nextButton,
                                    !isFormValid() && styles.nextButtonDisabled,
                                ]}
                                onPress={handleNext}
                                disabled={!isFormValid()}
                            >
                                <Text
                                    style={[
                                        styles.nextButtonText,
                                        !isFormValid() && styles.nextButtonTextDisabled,
                                    ]}
                                >
                                    Create
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetBackground: {
        backgroundColor: "#1E3A6F",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handleIndicator: {
        display: "none",
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    formWrapper: {
        flex: 1,
    },
    closeButton: {
        // position: 'absolute',
        // top: 20,
        // right: 20,
        // zIndex: 10,
        // width: 40,
        // height: 40,
        alignItems: "flex-end",
        justifyContent: "center",
        marginVertical: 15,
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
        marginBottom: 10,
    },
    header: {
        alignItems: "center",
        backgroundColor: "#1E3A6F",
        borderRadius: 11,
        paddingVertical: 9,
        paddingHorizontal: 28,
        borderBottomWidth: 1.5,
        borderBottomColor: "#4A90E2",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
    },
    scrollContainer: {
        flex: 1,
        maxHeight: "65%",
    },
    formContainer: {
        gap: 20,
        paddingBottom: 20,
    },
    fieldContainer: {
        gap: 8,
        position: "relative",
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
    },
    dropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    dropdownText: {
        fontSize: 16,
        color: "#fff",
    },
    dropdownOptions: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "#2A4A7F",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        marginTop: 4,
        zIndex: 1000,
        overflow: "hidden",
    },
    dropdownOption: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    dropdownOptionText: {
        fontSize: 16,
        color: "#fff",
    },
    textInput: {
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: "#fff",
    },
    textArea: {
        height: 100,
        paddingTop: 16,
    },
    uploadButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.3)",
        borderStyle: "dashed",
        borderRadius: 12,
        paddingVertical: 20,
        gap: 12,
        marginTop: 8,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 16,
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.1)",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E3A6F",
    },
    nextButton: {
        flex: 1,
        backgroundColor: "#2A4A7F",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    nextButtonDisabled: {
        backgroundColor: "rgba(42, 74, 127, 0.5)",
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    nextButtonTextDisabled: {
        color: "rgba(255, 255, 255, 0.5)",
    },
    divisionInputContainer: {
        flexDirection: "row",
        gap: 12,
        alignItems: "flex-end",
    },
    divisionInput: {
        flex: 1,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.4)",
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 14,
        gap: 8,
        minWidth: 80,
        justifyContent: "center",
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 12,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        gap: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 15,
        color: "#fff",
        fontWeight: "600",
    },
    tagRemove: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    imagePreviewContainer: {
        marginTop: 8,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.3)",
    },
    imagePreview: {
        width: "100%",
        height: 100,
        resizeMode: "cover",
    },
    changeImageButton: {
        backgroundColor: "rgba(255,255,255,0.1)",
        paddingVertical: 12,
        alignItems: "center",
        borderTopWidth: 1.5,
        borderTopColor: "rgba(255,255,255,0.3)",
    },
    changeImageText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
    },
});

export default CreateRoadmapModal;
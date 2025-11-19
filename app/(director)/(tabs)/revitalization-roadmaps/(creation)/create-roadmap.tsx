import { usePhaseCreation } from '@/context/PhaseCreationContext';
import { useRoadmap } from '@/hooks/roadmaps/useRoadmaps';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function CreateRoadmapScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const { state, addRoadmap, updateRoadmap, setCurrentRoadmap } = usePhaseCreation();

    const isPhaseFlow = params.isPhaseFlow === 'true';
    const isNestedRoadmap = params.isNestedRoadmap === 'true';
    const isEditMode = params.isEditMode === 'true';
    const isNestedEdit = params.isNestedEdit === 'true';
    const roadmapId = params.roadmapId as string;
    const parentRoadmapId = params.parentRoadmapId as string;
    const nestedRoadmapId = params.nestedRoadmapId as string;
    const parentPhase = params.phase as string;
    const phaseLoopActive = params.phaseLoopActive === 'true';
    const phaseLoopIndex = params.phaseLoopIndex ? parseInt(params.phaseLoopIndex as string, 10) : undefined;
    const phaseLoopTotal = params.phaseLoopTotal ? parseInt(params.phaseLoopTotal as string, 10) : undefined;
    const isTaskFlow = isNestedRoadmap || isNestedEdit || phaseLoopActive;

    // Fetch roadmap data if in edit mode
    // For nested edit, we fetch the parent to get phase context and nested roadmap data
    // For regular edit, we fetch the roadmap directly
    const roadmapQuery = useRoadmap(
        isEditMode && roadmapId ? roadmapId : undefined
    );
    const editRoadmapData = roadmapQuery.data;
    const isLoadingRoadmap = roadmapQuery.isLoading;
    
    // For nested edit, extract the specific nested roadmap being edited
    const editingNestedRoadmap = useMemo(() => {
        if (isNestedEdit && nestedRoadmapId && editRoadmapData?.roadmaps) {
            return editRoadmapData.roadmaps.find((r: any) => r._id === nestedRoadmapId);
        }
        return null;
    }, [isNestedEdit, nestedRoadmapId, editRoadmapData]);

    // Get available divisions from phase context or use default (reactive to state changes)
    const availableDivisions = useMemo(() => {
        if (isPhaseFlow && state.phaseDetails?.phaseDivisions && state.phaseDetails.phaseDivisions.length > 0) {
            return state.phaseDetails.phaseDivisions;
        }
        return ['Church', 'Pastor'];
    }, [isPhaseFlow, state.phaseDetails?.phaseDivisions]);

    const [formData, setFormData] = useState<{
        name: string;
        subheading: string;
        completionTime: string;
        bannerImage: string | null;
        selectedDivision: string;
    }>({
        name: '',
        subheading: '',
        completionTime: '',
        bannerImage: null,
        selectedDivision: ''
    });

    const handleImagePicker = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

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

    const handleDivisionSelect = (division: string) => {
        setFormData(prev => ({
            ...prev,
            selectedDivision: division
        }));
    };

    const handleCancel = () => {
        if (isTaskFlow || isEditMode) {
            router.back();
        } else {
            router.replace('/(director)/(tabs)/revitalization-roadmaps');
        }
    };

    const validateForm = () => {
        const errors: string[] = [];

        if (!formData.name.trim()) {
            errors.push(isTaskFlow ? 'Task Name is required' : 'Roadmap Name is required');
        }

        if (!formData.subheading.trim()) {
            errors.push(isTaskFlow ? 'Task Description is required' : 'Roadmap Subheading is required');
        }

        if (!formData.completionTime.trim()) {
            errors.push(isTaskFlow ? 'Duration is required' : 'Completion Time is required');
        }

        if (!isTaskFlow && !formData.selectedDivision) {
            errors.push('Please select a division');
        }

        return errors;
    }; const isFormValid = () => {
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

        if (isTaskFlow) {
            // For Nested Roadmap (Task), navigate to roadmap-form with nested params
            const queryParams: any = {
                name: formData.name,
                subheading: formData.subheading,
                completionTime: formData.completionTime,
                selectedDivision: formData.selectedDivision,
                bannerImage: formData.bannerImage || '',
                isNestedRoadmap: 'true',
                parentRoadmapId: parentRoadmapId || roadmapId,
                phase: parentPhase || '',
            };

            if (isNestedEdit) {
                queryParams.isNestedEdit = 'true';
                queryParams.nestedRoadmapId = nestedRoadmapId;
            }

            if (phaseLoopActive) {
                queryParams.phaseLoopActive = 'true';
                if (typeof phaseLoopIndex === 'number') {
                    queryParams.phaseLoopIndex = String(phaseLoopIndex);
                }
                if (typeof phaseLoopTotal === 'number') {
                    queryParams.phaseLoopTotal = String(phaseLoopTotal);
                }
            }

            router.push({
                pathname: '/(director)/(tabs)/revitalization-roadmaps/(creation)/roadmap-form',
                params: queryParams
            });
        } else if (isPhaseFlow) {
            // For Phase flow, add roadmap to context and navigate to roadmap-form
            const roadmap = addRoadmap({
                name: formData.name,
                subheading: formData.subheading,
                completionTime: formData.completionTime,
                selectedDivision: formData.selectedDivision,
                bannerImage: formData.bannerImage
            });

            setCurrentRoadmap(roadmap);

            router.push({
                pathname: '/(director)/(tabs)/revitalization-roadmaps/(creation)/roadmap-form',
                params: {
                    isPhaseFlow: 'true',
                    roadmapId: roadmap.id
                }
            });
        } else {
            // For Single Roadmap, navigate to roadmap-form with params
            const queryParams: any = {
                name: formData.name,
                subheading: formData.subheading,
                completionTime: formData.completionTime,
                selectedDivision: formData.selectedDivision,
                bannerImage: formData.bannerImage || ''
            };

            if (isEditMode) {
                queryParams.isEditMode = 'true';
                queryParams.roadmapId = roadmapId;
            }

            router.push({
                pathname: '/(director)/(tabs)/revitalization-roadmaps/(creation)/roadmap-form',
                params: queryParams
            });
        }
    };

    useEffect(() => {
        // Initialize selectedDivision with first available division if not set
        if (!formData.selectedDivision && availableDivisions.length > 0) {
            setFormData(prev => ({
                ...prev,
                selectedDivision: availableDivisions[0]
            }));
        }
        // Update selected division if current selection is not in available divisions
        else if (formData.selectedDivision && !availableDivisions.includes(formData.selectedDivision) && availableDivisions.length > 0) {
            setFormData(prev => ({
                ...prev,
                selectedDivision: availableDivisions[0]
            }));
        }
    }, [availableDivisions, formData.selectedDivision]);

    useEffect(() => {
        // Load current roadmap data if in phase flow
        if (isPhaseFlow && state.currentRoadmap) {
            setFormData({
                name: state.currentRoadmap.name,
                subheading: state.currentRoadmap.subheading,
                completionTime: state.currentRoadmap.completionTime,
                bannerImage: state.currentRoadmap.bannerImage,
                selectedDivision: state.currentRoadmap.selectedDivision || availableDivisions[0] || 'Church'
            });
        }
    }, [isPhaseFlow, state.currentRoadmap, availableDivisions]);

    useEffect(() => {
        // Pre-fill form data when in edit mode
        if (isEditMode) {
            if (isNestedEdit && editingNestedRoadmap) {
                // Editing a nested roadmap within a phase
                setFormData({
                    name: editingNestedRoadmap.name,
                    subheading: editingNestedRoadmap.roadMapDetails || editingNestedRoadmap.description || '',
                    completionTime: editingNestedRoadmap.duration,
                    bannerImage: editingNestedRoadmap.imageUrl || null,
                    selectedDivision: editingNestedRoadmap.phase || availableDivisions[0] || 'Church'
                });
            } else if (editRoadmapData && !isNestedEdit) {
                // Edit main/single roadmap
                setFormData({
                    name: editRoadmapData.name,
                    subheading: editRoadmapData.roadMapDetails || editRoadmapData.description || '',
                    completionTime: editRoadmapData.duration,
                    bannerImage: editRoadmapData.imageUrl || null,
                    selectedDivision: editRoadmapData.divisions?.[0] 
                        ? editRoadmapData.divisions[0]
                        : availableDivisions[0] || 'Church'
                });
            }
        }
    }, [isEditMode, isNestedEdit, editingNestedRoadmap, editRoadmapData, availableDivisions]);

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingBottom: bottom }]}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isEditMode 
                            ? 'Edit Roadmap' 
                            : isPhaseFlow 
                            ? 'Add Roadmap to Phase' 
                            : isTaskFlow 
                            ? 'Create Task' 
                            : 'Create Roadmap'}
                    </Text>
                </View>

                {phaseLoopActive && typeof phaseLoopIndex === 'number' && typeof phaseLoopTotal === 'number' && (
                    <Text style={styles.loopProgressText}>
                        {`Editing Task ${phaseLoopIndex + 1} of ${phaseLoopTotal}`}
                    </Text>
                )}

                {(isLoadingRoadmap && isEditMode) ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                        <Text style={{ color: '#fff', fontSize: 16 }}>Loading roadmap...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Banner Section - Show Phase Context Banner for Phase Flow */}
                        {isPhaseFlow && state.phaseDetails && (
                            <View style={styles.phaseBannerSection}>
                                <View style={styles.phaseBannerContainer}>
                                    <Image
                                        source={
                                            state.phaseDetails.phaseBannerImage
                                                ? { uri: state.phaseDetails.phaseBannerImage }
                                                : require('@/assets/images/church-2.png')
                                        }
                                        style={styles.phaseBannerImage}
                                    />
                                    <BlurView intensity={10} style={styles.phaseBlurOverlay}>
                                        <View style={styles.phaseBannerOverlay}>
                                            <Text style={styles.phaseBannerTitle}>
                                                {state.phaseDetails.phaseName}
                                            </Text>
                                        </View>
                                    </BlurView>
                                </View>
                                <Text style={styles.phaseBannerSubtitle}>
                                    Creating roadmap {state.roadmaps.length + 1} for this phase
                                </Text>
                            </View>
                        )}

                        {/* Banner Section - Show for Edit Mode */}
                        {isEditMode && editRoadmapData && (
                            <View style={styles.bannerSection}>
                                <View style={styles.bannerImageContainer}>
                                    <Image
                                        source={
                                            editRoadmapData?.imageUrl
                                                ? { uri: editRoadmapData.imageUrl }
                                                : require('@/assets/images/church-2.png')
                                        }
                                        style={styles.bannerImage}
                                    />
                                    <BlurView intensity={10} style={styles.blurOverlay}>
                                        <View style={styles.bannerOverlay}>
                                            <Text style={styles.bannerTitle}>
                                                {editRoadmapData.name}
                                            </Text>
                                        </View>
                                    </BlurView>
                                </View>
                                <Text style={styles.bannerSubtitle}>
                                    Editing roadmap details
                                </Text>
                            </View>
                        )}

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Name */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                {isTaskFlow ? 'Task Name' : 'Roadmap Name'}
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder={isTaskFlow ? "Enter Task Name" : "Enter Roadmap Name"}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                            />
                        </View>

                        {/* Subheading/Description */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                {isTaskFlow ? 'Task Description' : 'Roadmap Subheading'}
                            </Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder={isTaskFlow ? "Enter Task Description" : "Enter Roadmap Subheading"}
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.subheading}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, subheading: text }))}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Duration/Completion Time */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>
                                {isTaskFlow ? 'Duration' : 'Completion Time for the Roadmap'}
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Months :"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.completionTime}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, completionTime: text }))}
                            />
                        </View>

                        {/* Division Selection - Only show for non-task roadmaps */}
                        {!isTaskFlow && (
                            <View style={styles.fieldContainer}>
                                <Text style={styles.fieldLabel}>
                                    Select the Division in which this Roadmap belongs to :
                                </Text>
                                <View style={styles.radioContainer}>
                                    {availableDivisions.map((division) => {
                                        // Capitalize first letter of each word for display
                                        const displayName = division
                                            .split(' ')
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                            .join(' ');
                                        
                                        return (
                                            <Pressable
                                                key={division}
                                                style={styles.radioOption}
                                                onPress={() => handleDivisionSelect(division)}
                                            >
                                                <View style={styles.radioButton}>
                                                    {formData.selectedDivision === division && (
                                                        <View style={styles.radioButtonSelected} />
                                                    )}
                                                </View>
                                                <Text style={styles.radioText}>{displayName}</Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Banner Image Section */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Banner Image for the Roadmap</Text>
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
                                    <Text style={styles.uploadButtonText}>Upload Banner Image for the Roadmap</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.nextButton,
                                !isFormValid() && styles.nextButtonDisabled
                            ]}
                            onPress={handleNext}
                            disabled={!isFormValid()}
                        >
                            <Text style={[
                                styles.nextButtonText,
                                !isFormValid() && styles.nextButtonTextDisabled
                            ]}>
                                Next
                            </Text>
                        </TouchableOpacity>
                    </View>
                    </ScrollView>
                )}

            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60,
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    loopProgressText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    bannerSection: {
        marginBottom: 24,
    },
    bannerImageContainer: {
        position: 'relative',
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    blurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 12,
        overflow: 'hidden',
    },
    bannerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    bannerPlaceholder: {
        height: 160,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    bannerTitle: {
        fontSize: 18,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        fontWeight: '700',
        borderRadius: 6,
        color: '#fff',
        textAlign: 'center',
    },
    bannerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 20,
    },
    phaseBannerSection: {
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.3)',
    },
    phaseBannerContainer: {
        position: 'relative',
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
    },
    phaseBannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    phaseBlurOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 8,
        overflow: 'hidden',
    },
    phaseBannerOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'rgba(124, 58, 237, 0.4)',
    },
    phaseBannerTitle: {
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        fontWeight: '700',
        borderRadius: 6,
        color: '#fff',
        textAlign: 'center',
    },
    phaseBannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        fontWeight: '500',
    },
    formContainer: {
        gap: 20,
    },
    fieldContainer: {
        gap: 8,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    textInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#fff',
    },
    textArea: {
        height: 80,
        paddingTop: 16,
    },
    radioContainer: {
        flexDirection: 'row',
        gap: 24,
        paddingVertical: 8,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    radioText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    imagePreviewContainer: {
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    changeImageText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: 20,
        gap: 12,
    },
    uploadButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E3A6F',
    },
    nextButton: {
        flex: 1,
        backgroundColor: '#2A4A7F',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
    },
    nextButtonDisabled: {
        backgroundColor: 'rgba(42, 74, 127, 0.5)',
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    nextButtonTextDisabled: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
});
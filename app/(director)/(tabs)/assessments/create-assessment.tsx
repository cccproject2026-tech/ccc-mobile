import AssessmentCreatedSuccessModal from '@/components/build-components/AssessmentCreatedSuccessModal';
import TopBar from '@/components/director/TopBar';
import { icons } from '@/constants/images';
import { useCreateAssessment } from '@/hooks/assessments';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Instruction {
    id: string;
    text: string;
}

interface Choice {
    id: string;
    text: string;
}

interface Layer {
    id: string;
    title: string;
    choices: Choice[];
}

interface Section {
    id: string;
    name: string;
    guidelines: string;
    layers: Layer[];
}

interface Plan {
    id: string;
    text: string;
}

export default function CreateAssessmentPage() {
    const { bottom } = useSafeAreaInsets();
    const router = useRouter();

    // Assessment Details
    const [assessmentName, setAssessmentName] = useState('');
    const [briefDescription, setBriefDescription] = useState('');

    // General Instructions
    const [instructions, setInstructions] = useState<Instruction[]>([
        { id: '1', text: '' },
    ]);

    // Sections
    const [sections, setSections] = useState<Section[]>([
        {
            id: '1',
            name: '',
            guidelines: '',
            layers: [
                { id: '1', title: 'Assessment Layer', choices: [{ id: '1', text: '' }] },
                { id: '2', title: 'Assessment Layer', choices: [{ id: '1', text: '' }] },
            ],
        },
    ]);

    // Dropdown states for each section
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

    // Loading and success states
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const createAssessmentMutation = useCreateAssessment();

    // Customized Development Plans
    const [level1Plans, setLevel1Plans] = useState<Plan[]>([{ id: '1', text: '' }]);
    const [level2Plans, setLevel2Plans] = useState<Plan[]>([{ id: '1', text: '' }]);

    // Image Upload
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const handleImagePicker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            setUploadedImage(result.assets[0].uri);
        }
    };

    const addInstruction = () => {
        setInstructions([
            ...instructions,
            { id: Date.now().toString(), text: '' },
        ]);
    };

    const updateInstruction = (id: string, text: string) => {
        setInstructions(
            instructions.map((inst) => (inst.id === id ? { ...inst, text } : inst))
        );
    };

    const addSection = () => {
        setSections([
            ...sections,
            {
                id: Date.now().toString(),
                name: '',
                guidelines: '',
                layers: [{ id: '1', title: 'Assessment Layer', choices: [{ id: '1', text: '' }] }],
            },
        ]);
    };

    const updateSectionName = (sectionId: string, name: string) => {
        setSections(
            sections.map((s) => (s.id === sectionId ? { ...s, name } : s))
        );
    };

    const updateSectionGuidelines = (sectionId: string, guidelines: string) => {
        setSections(
            sections.map((s) => (s.id === sectionId ? { ...s, guidelines } : s))
        );
    };

    const updateLayerCount = (sectionId: string, count: number) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                const newLayers: Layer[] = [];
                for (let i = 0; i < count; i++) {
                    const existingLayer = s.layers[i];
                    newLayers.push(
                        existingLayer || {
                            id: `${Date.now()}-${i}`,
                            title: 'Assessment Layer',
                            choices: [{ id: `${Date.now()}-choice-${i}`, text: '' }],
                        }
                    );
                }
                return { ...s, layers: newLayers };
            })
        );
        setOpenDropdowns((prev) => {
            const next = new Set(prev);
            next.delete(sectionId);
            return next;
        });
    };

    const toggleDropdown = (sectionId: string) => {
        setOpenDropdowns((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const updateLayerTitle = (sectionId: string, layerId: string, title: string) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    layers: s.layers.map((l) =>
                        l.id === layerId ? { ...l, title } : l
                    ),
                };
            })
        );
    };

    const addChoice = (sectionId: string, layerId: string) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    layers: s.layers.map((l) => {
                        if (l.id !== layerId) return l;
                        return {
                            ...l,
                            choices: [
                                ...l.choices,
                                { id: Date.now().toString(), text: '' },
                            ],
                        };
                    }),
                };
            })
        );
    };

    const updateChoice = (
        sectionId: string,
        layerId: string,
        choiceId: string,
        text: string
    ) => {
        setSections(
            sections.map((s) => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    layers: s.layers.map((l) => {
                        if (l.id !== layerId) return l;
                        return {
                            ...l,
                            choices: l.choices.map((c) =>
                                c.id === choiceId ? { ...c, text } : c
                            ),
                        };
                    }),
                };
            })
        );
    };

    const addPlan = (level: 1 | 2) => {
        if (level === 1) {
            setLevel1Plans([
                ...level1Plans,
                { id: Date.now().toString(), text: '' },
            ]);
        } else {
            setLevel2Plans([
                ...level2Plans,
                { id: Date.now().toString(), text: '' },
            ]);
        }
    };

    const updatePlan = (level: 1 | 2, planId: string, text: string) => {
        if (level === 1) {
            setLevel1Plans(
                level1Plans.map((p) => (p.id === planId ? { ...p, text } : p))
            );
        } else {
            setLevel2Plans(
                level2Plans.map((p) => (p.id === planId ? { ...p, text } : p))
            );
        }
    };

    const handleCreate = async () => {
        // Validation
        if (!assessmentName.trim()) {
            Alert.alert('Error', 'Please enter an assessment name.');
            return;
        }

        if (!briefDescription.trim()) {
            Alert.alert('Error', 'Please enter a description.');
            return;
        }

        // Filter out empty instructions
        const validInstructions = instructions
            .map((inst) => inst.text.trim())
            .filter((text) => text.length > 0);

        if (validInstructions.length === 0) {
            Alert.alert('Error', 'Please add at least one instruction.');
            return;
        }

        // Validate sections
        const validSections = sections
            .map((section) => {
                // Filter out empty layers and choices
                const validLayers = section.layers
                    .map((layer) => {
                        const validChoices = layer.choices
                            .map((choice) => choice.text.trim())
                            .filter((text) => text.length > 0);

                        if (validChoices.length === 0 || !layer.title.trim()) {
                            return null;
                        }

                        return {
                            title: layer.title.trim(),
                            choices: validChoices.map((text) => ({ text })),
                        };
                    })
                    .filter(
                        (layer): layer is { title: string; choices: { text: string }[] } =>
                            layer !== null
                    );

                if (validLayers.length === 0 || !section.name.trim()) {
                    return null;
                }

                return {
                    title: section.name.trim(),
                    description: section.guidelines.trim(),
                    layers: validLayers,
                };
            })
            .filter(
                (section): section is {
                    title: string;
                    description: string;
                    layers: { title: string; choices: { text: string }[] }[];
                } => section !== null
            );

        if (validSections.length === 0) {
            Alert.alert(
                'Error',
                'Please add at least one section with layers and choices.'
            );
            return;
        }

        const requestData = {
            name: assessmentName.trim(),
            description: briefDescription.trim(),
            instructions: validInstructions,
            sections: validSections,
        };

        createAssessmentMutation.mutate(requestData, {
            onSuccess: () => {
                setShowSuccessModal(true);
            },
            onError: (err) => {
                console.error('Failed to create assessment:', err);
                Alert.alert('Error', 'Failed to create assessment. Please try again.');
            },
        });
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        router.back();
    };

    return (
        <LinearGradient colors={['#155C93', '#1B2B60']} style={{ flex: 1 }}>
            <TopBar
                userName="David Roe"
                showUserName
                notifications={3}
                role="director"
            />

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} hitSlop={10}>
                    <Ionicons name="arrow-back" size={24} color="#E2E8F0" />
                </Pressable>
                <Text style={styles.headerTitle}>Create Assessment</Text>
            </View>

            {/* Form Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: bottom + 100,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Assessment Details */}
                <View style={styles.section}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name of Assessment"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={assessmentName}
                        onChangeText={setAssessmentName}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Brief Description for Thumbnail"
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        value={briefDescription}
                        onChangeText={setBriefDescription}
                    />
                </View>

                {/* General Instructions */}
                <View style={styles.section}>
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>
                            General Instructions for the Assessment
                        </Text>
                        {instructions.map((inst, index) => (
                            <View key={inst.id} style={styles.instructionRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder={`Instruction ${index + 1}`}
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={inst.text}
                                    onChangeText={(text) => updateInstruction(inst.id, text)}
                                />
                            </View>
                        ))}
                        {instructions.length === 1 && (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={addInstruction}
                            >
                                <Text style={styles.addButtonText}>+ Instruction</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Sections */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Sections</Text>
                        <TouchableOpacity style={styles.addButton} onPress={addSection}>
                            <Text style={styles.addButtonText}>+ Section</Text>
                        </TouchableOpacity>
                    </View>

                    {sections.map((section, sectionIndex) => (
                        <View key={section.id} style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>
                                Section {sectionIndex + 1}
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder={`Name of Section ${sectionIndex + 1}`}
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={section.name}
                                onChangeText={(text) => updateSectionName(section.id, text)}
                            />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder={`Guidelines for Section ${sectionIndex + 1}`}
                                placeholderTextColor="rgba(255,255,255,0.6)"
                                value={section.guidelines}
                                onChangeText={(text) =>
                                    updateSectionGuidelines(section.id, text)
                                }
                                multiline
                                numberOfLines={3}
                            />

                            {/* Number of Layers Dropdown */}
                            <View style={styles.dropdownContainer}>
                                <Text style={styles.dropdownLabel}>Number of Layers:</Text>
                                <View style={{ position: 'relative' }}>
                                    <Pressable
                                        style={styles.dropdown}
                                        onPress={() => toggleDropdown(section.id)}
                                    >
                                        <Text style={styles.dropdownText}>
                                            {section.layers.length}
                                        </Text>
                                        <Ionicons
                                            name={
                                                openDropdowns.has(section.id)
                                                    ? 'chevron-up'
                                                    : 'chevron-down'
                                            }
                                            size={20}
                                            color="#E2E8F0"
                                        />
                                    </Pressable>
                                    {openDropdowns.has(section.id) && (
                                        <View style={styles.dropdownMenu}>
                                            <ScrollView
                                                style={styles.dropdownScrollView}
                                                nestedScrollEnabled
                                                showsVerticalScrollIndicator={false}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                                    (num, index) => (
                                                        <Pressable
                                                            key={num}
                                                            style={[
                                                                styles.dropdownOption,
                                                                section.layers.length === num &&
                                                                    styles.dropdownOptionSelected,
                                                                index === 9 &&
                                                                    styles.dropdownOptionLast,
                                                            ]}
                                                            onPress={() =>
                                                                updateLayerCount(section.id, num)
                                                            }
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.dropdownOptionText,
                                                                    section.layers.length ===
                                                                        num &&
                                                                        styles.dropdownOptionTextSelected,
                                                                ]}
                                                            >
                                                                {num}
                                                            </Text>
                                                        </Pressable>
                                                    )
                                                )}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Layers */}
                            {section.layers.map((layer, layerIndex) => (
                                <View key={layer.id} style={styles.layerSection}>
                                    <Text style={styles.layerTitle}>
                                        Layer {layerIndex + 1}
                                    </Text>
                                    {layer.choices.map((choice, choiceIndex) => (
                                        <View key={choice.id} style={styles.choiceRow}>
                                            <TextInput
                                                style={[styles.input, { flex: 1 }]}
                                                placeholder={`Choice ${choiceIndex + 1}`}
                                                placeholderTextColor="rgba(255,255,255,0.6)"
                                                value={choice.text}
                                                onChangeText={(text) =>
                                                    updateChoice(
                                                        section.id,
                                                        layer.id,
                                                        choice.id,
                                                        text
                                                    )
                                                }
                                            />
                                        </View>
                                    ))}
                                    {layer.choices.length === 1 && (
                                        <TouchableOpacity
                                            style={styles.addButton}
                                            onPress={() => addChoice(section.id, layer.id)}
                                        >
                                            <Text style={styles.addButtonText}>+ Choice</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Customized Development Plans */}
                <View style={styles.section}>
                    {/* Level 1 Plans */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>
                            Level 1 - Customized Development Plans
                        </Text>
                        {level1Plans.map((plan, index) => (
                            <View key={plan.id} style={styles.planRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder={`Plan ${index + 1}`}
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={plan.text}
                                    onChangeText={(text) => updatePlan(1, plan.id, text)}
                                />
                            </View>
                        ))}
                        {level1Plans.length === 1 && (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => addPlan(1)}
                            >
                                <Text style={styles.addButtonText}>+ Plan</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* Level 2 Plans */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>
                            Level 2 - Customized Development Plans
                        </Text>
                        {level2Plans.map((plan, index) => (
                            <View key={plan.id} style={styles.planRow}>
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    placeholder={`Plan ${index + 1}`}
                                    placeholderTextColor="rgba(255,255,255,0.6)"
                                    value={plan.text}
                                    onChangeText={(text) => updatePlan(2, plan.id, text)}
                                />
                            </View>
                        ))}
                        {level2Plans.length === 1 && (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => addPlan(2)}
                            >
                                <Text style={styles.addButtonText}>+ Plan</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Image Upload */}
                <View style={styles.uploadContainer}>
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={handleImagePicker}
                    >
                        <Image source={icons.attachment} style={styles.uploadIcon} />
                        <Text style={styles.uploadText}>Upload Image</Text>
                    </TouchableOpacity>
                    {uploadedImage && (
                        <Image
                            source={{ uri: uploadedImage }}
                            style={styles.previewImage}
                        />
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreate}
                        disabled={createAssessmentMutation.isPending}
                    >
                        {createAssessmentMutation.isPending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.createButtonText}>Create Assessment</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Success Modal */}
            <AssessmentCreatedSuccessModal
                visible={showSuccessModal}
                onClose={handleSuccessModalClose}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    headerTitle: {
        color: '#E2E8F0',
        fontSize: 18,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#FFFFFF73',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionContainer: {
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#FFFFFF73',
        borderRadius: 12,
        padding: 12,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    input: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#FFFFFF',
        marginBottom: 12,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    addButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignSelf: 'flex-end',
        width: 'auto',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    subSection: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    subSectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    dropdownLabel: {
        color: '#E2E8F0',
        fontSize: 15,
        fontWeight: '500',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 100,
        gap: 8,
        width: '57%',
    },
    dropdownText: {
        color: '#FFFFFF',
        fontSize: 15,
        flex: 1,
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#1B2B60',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        marginTop: 4,
        maxHeight: 300,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    dropdownScrollView: {
        maxHeight: 300,
    },
    dropdownOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        minHeight: 44,
        justifyContent: 'center',
    },
    dropdownOptionLast: {
        borderBottomWidth: 0,
    },
    dropdownOptionSelected: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dropdownOptionText: {
        color: '#FFFFFF',
        fontSize: 15,
    },
    dropdownOptionTextSelected: {
        color: '#5EB3D1',
        fontWeight: '600',
    },
    layerSection: {
        marginTop: 16,
        padding: 16,
        borderColor: 'rgba(255,255,255,0.5)',
        borderWidth: 1,
        borderRadius: 12,
    },
    layerTitle: {
        color: '#E2E8F0',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 12,
    },
    choiceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    planRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    uploadContainer: {
        marginBottom: 24,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        justifyContent: 'center',
    },
    uploadIcon: {
        width: 20,
        height: 20,
        tintColor: '#FFFFFF',
    },
    uploadText: {
        color: '#FFFFFF',
        fontSize: 15,
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 12,
        resizeMode: 'cover',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        marginBottom: 24,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#155C93',
        fontSize: 16,
        fontWeight: '600',
    },
    createButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});


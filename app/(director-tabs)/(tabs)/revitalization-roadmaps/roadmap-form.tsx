import AddFieldSheet, { AddFieldSheetRef, FieldType } from '@/components/director/forms/AddFieldSheet';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RoadmapFormScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const addFieldSheetRef = useRef<AddFieldSheetRef>(null);

    const roadmapData = {
        name: params.name as string || '',
        subheading: params.subheading as string || '',
        completionTime: params.completionTime as string || '',
        selectedDivision: params.selectedDivision as string || '',
        bannerImage: params.bannerImage as string || null,
    };

    const [formData, setFormData] = useState({
        churchVerbiage: '',
        descriptionVerbiage: '',
        customFields: [] as any[]
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const validateForm = () => {
        const valid = !!(formData.churchVerbiage.trim() && formData.descriptionVerbiage.trim());
        setIsFormValid(valid);
        return valid;
    };

    React.useEffect(() => {
        validateForm();
    }, [formData.churchVerbiage, formData.descriptionVerbiage]);

    const handleFieldInsert = (result: any) => {
        console.log('Field insert result:', result);
        const { type, data } = result;

        // Create a new field based on type
        let newField: any = {
            id: `field_${Date.now()}`,
            type: type,
        };

        if (type === 'text' || type === 'textarea') {
            newField = {
                ...newField,
                label: data.placeholder || `New ${type}`,
                placeholder: data.placeholder || `Enter ${type}`,
                value: '',
            };
        } else if (type === 'checkbox' || type === 'radio') {
            newField = {
                ...newField,
                label: data.name || 'New Field',
                choices: data.choices || [],
            };
        } else if (type === 'section') {
            newField = {
                ...newField,
                label: data.name || 'New Section',
                showDuplicateButton: data.addDuplicateButton || false,
                buttonName: data.buttonName || '',
            };
        }

        setFormData(prev => ({
            ...prev,
            customFields: [...prev.customFields, newField]
        }));

        console.log('Field added:', newField);
    };

    const handleMenuItemPress = (fieldType: FieldType) => {
        console.log('Menu item pressed with type:', fieldType);

        setMenuVisible(false);

        setTimeout(() => {
            console.log('Opening AddFieldSheet with type:', fieldType);
            addFieldSheetRef.current?.open(fieldType);
        }, 300);
    };

    const menuItems = [
        {
            id: 'text',
            label: 'Text Field',
            icon: 'text-outline' as keyof typeof Ionicons.glyphMap,
            fieldType: 'text' as FieldType,
        },
        {
            id: 'textarea',
            label: 'Text Area',
            icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
            fieldType: 'textarea' as FieldType,
        },
        {
            id: 'checkbox',
            label: 'Check Box',
            icon: 'checkbox-outline' as keyof typeof Ionicons.glyphMap,
            fieldType: 'checkbox' as FieldType,
        },
        {
            id: 'radio',
            label: 'Radio Button',
            icon: 'radio-button-on-outline' as keyof typeof Ionicons.glyphMap,
            fieldType: 'radio' as FieldType,
        },
        {
            id: 'section',
            label: 'Section',
            icon: 'grid-outline' as keyof typeof Ionicons.glyphMap,
            fieldType: 'section' as FieldType,
        },
    ];

    const handleAddField = () => {
        setMenuVisible(true);
    };

    const handleCancel = () => {
        router.back();
    };

    const handleCreateRoadmap = () => {
        if (!validateForm()) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        const finalRoadmapData = {
            ...roadmapData,
            ...formData
        };

        console.log('Final roadmap data:', finalRoadmapData);
        Alert.alert(
            'Success',
            'Roadmap created successfully!',
            [{ text: 'OK', onPress: () => router.push('/(director-tabs)/(tabs)/revitalization-roadmaps') }]
        );
    };

    const renderCustomField = (field: any, index: number) => {
        switch (field.type) {
            case 'text':
                return (
                    <View key={field.id} style={styles.customFieldItem}>
                        <Text style={styles.customFieldLabel}>{field.label}</Text>
                        <TextInput
                            style={styles.customFieldInput}
                            placeholder={field.placeholder}
                            placeholderTextColor="rgba(255,255,255,0.5)"
                        />
                    </View>
                );
            case 'textarea':
                return (
                    <View key={field.id} style={styles.customFieldItem}>
                        <Text style={styles.customFieldLabel}>{field.label}</Text>
                        <TextInput
                            style={[styles.customFieldInput, styles.textArea]}
                            placeholder={field.placeholder}
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                );
            case 'section':
                return (
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitleEdit}>{field.title}</Text>
                            <TouchableOpacity
                                // onPress={() => handleMenuPress(section.id)}
                                hitSlop={10}
                            >
                                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return (
                    <View key={field.id} style={styles.customFieldItem}>
                        <Text style={styles.customFieldText}>
                            {field.type}: {field.label}
                        </Text>
                    </View>
                );
        }
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingBottom: bottom }]}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Roadmap</Text>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Banner Preview */}
                    <View style={styles.bannerSection}>
                        {roadmapData.bannerImage ? (
                            <View style={styles.bannerImageContainer}>
                                <Image
                                    source={{ uri: roadmapData.bannerImage }}
                                    style={styles.bannerImage}
                                />
                                <View style={styles.bannerOverlay}>
                                    <Text style={styles.bannerTitle}>{roadmapData.name}</Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.bannerImageContainer}>
                                <Image
                                    source={require('@/assets/images/church-2.png')}
                                    style={styles.bannerImage}
                                />
                                <View style={styles.bannerOverlay}>
                                    <Text style={styles.bannerTitle}>{roadmapData.name}</Text>
                                </View>
                            </View>
                        )}
                        <Text style={styles.bannerSubtitle}>
                            These information will be shown in the Roadmap page
                        </Text>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Church Roadmap Verbiage */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Church Roadmap Verbiage</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter Verbiage"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.churchVerbiage}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, churchVerbiage: text }))}
                            />
                        </View>

                        {/* Description Verbiage */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.fieldLabel}>Description Verbiage</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Enter Verbiage"
                                placeholderTextColor="rgba(255,255,255,0.5)"
                                value={formData.descriptionVerbiage}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, descriptionVerbiage: text }))}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Insert Field Section */}
                        <View style={styles.insertFieldSection}>
                            <View style={styles.insertFieldHeader}>
                                <Text style={styles.insertFieldTitle}>Insert Field</Text>
                                <TouchableOpacity
                                    style={styles.addFieldButton}
                                    onPress={handleAddField}
                                >
                                    <Ionicons name="add" size={16} color="#fff" />
                                    <Text style={styles.addFieldText}>Add Field</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Custom Fields List */}
                            {formData.customFields.map((field, index) => renderCustomField(field, index))}
                        </View>
                    </View>
                </ScrollView>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.createButton,
                            !isFormValid && styles.createButtonDisabled
                        ]}
                        onPress={handleCreateRoadmap}
                        disabled={!isFormValid}
                    >
                        <Text style={[
                            styles.createButtonText,
                            !isFormValid && styles.createButtonTextDisabled
                        ]}>
                            Create Roadmap
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Field Type Selection Modal */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.modalContent}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.menuItem,
                                    index === menuItems.length - 1 && styles.menuItemLast
                                ]}
                                onPress={() => handleMenuItemPress(item.fieldType)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={item.icon}
                                    size={22}
                                    color="#1A4882"
                                    style={styles.menuIcon}
                                />
                                <Text style={styles.menuItemText}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Add Field Bottom Sheet */}
            <AddFieldSheet
                ref={addFieldSheetRef}
                onInsert={handleFieldInsert}
                onClose={() => {
                    console.log('AddFieldSheet closed');
                }}
            />
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
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    bannerSection: {
        marginBottom: 24,
    },
    bannerImageContainer: {
        position: 'relative',
        height: 180,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 12,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    bannerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 20,
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
        height: 100,
        paddingTop: 16,
        textAlignVertical: 'top',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 8,
    },
    insertFieldSection: {
        marginTop: 8,
    },
    insertFieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
    },
    insertFieldTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    addFieldButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(74, 144, 226, 1)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 6,
    },
    addFieldText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    customFieldItem: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    customFieldText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
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
    createButton: {
        flex: 1,
        backgroundColor: 'rgba(38, 67, 135, 1)',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    createButtonDisabled: {
        backgroundColor: 'rgba(38, 67, 135, 0.5)',
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    createButtonTextDisabled: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingRight: 16,
        paddingBottom: 180,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        minWidth: 240,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuIcon: {
        marginRight: 16,
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A4882',
    },
    customFieldLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
        marginBottom: 8,
    },
    customFieldInput: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#fff',
    },
    sectionDivider: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 16,
        overflow: 'visible',
        position: 'relative',
    },
    sectionDividerText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    sectionCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 16,
        overflow: 'visible',
        position: 'relative',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionTitleEdit: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

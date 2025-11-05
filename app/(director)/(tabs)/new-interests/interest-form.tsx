
import ContextMenu, { MenuItem, TextIcon } from '@/components/director/ContextMenu';
import AddFieldSheet, { AddFieldSheetRef, FieldType } from '@/components/director/forms/AddFieldSheet';
import FormCheckbox from '@/components/director/forms/FormCheckBox';
import FormDropdown from '@/components/director/forms/FormDropDown';
import FormTextArea from '@/components/director/forms/FormTextArea';
import FormTextField from '@/components/director/forms/FormTextField';
import { FormField, FormSection, interestFormConfig } from '@/constants/interestFormConfig';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { JSX, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InterestFormScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeMenuSection, setActiveMenuSection] = useState<string | null>(null);
    const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
    const [sections, setSections] = useState<FormSection[]>(interestFormConfig);
    const [formValues, setFormValues] = useState<Record<string, string | boolean>>(() => {
        const initialValues: Record<string, string | boolean> = {};
        sections.forEach(section => {
            section.fields.forEach(field => {
                initialValues[field.id] = field.defaultValue;
            });
        });
        return initialValues;
    });

    const addFieldSheetRef = useRef<AddFieldSheetRef>(null);

    const handleFieldInsert = (result: any) => {
        const { type, data } = result;

        if (!targetSectionId) {
            return;
        }

        if (type === 'text' || type === 'textarea') {
            const newField: FormField = {
                id: `field_${Date.now()}`,
                type: type,
                label: data.placeholder || `New ${type}`,
                placeholder: data.placeholder || `Enter ${type}`,
                defaultValue: '',
                width: 'full',
            };

            setSections(prevSections => {
                const newSections = prevSections.map(section => {
                    if (section.id === targetSectionId) {
                        return {
                            ...section,
                            fields: [...section.fields, newField],
                        };
                    }
                    return section;
                });
                return newSections;
            });

            setFormValues(prev => ({
                ...prev,
                [newField.id]: newField.defaultValue
            }));

            setTargetSectionId(null);

        } else if (type === 'checkbox' || type === 'radio') {
            if (data.choices && Array.isArray(data.choices)) {
                data.choices.forEach((choice: string, index: number) => {
                    if (choice.trim()) {
                        const newField: FormField = {
                            id: `field_${Date.now()}_${index}`,
                            type: 'checkbox',
                            label: choice.trim(),
                            placeholder: '',
                            defaultValue: false,
                            width: 'full',
                        };

                        setSections(prevSections =>
                            prevSections.map(section => {
                                if (section.id === targetSectionId) {
                                    return {
                                        ...section,
                                        fields: [...section.fields, newField],
                                    };
                                }
                                return section;
                            })
                        );

                        setFormValues(prev => ({
                            ...prev,
                            [newField.id]: newField.defaultValue
                        }));
                    }
                });
            }

            setTargetSectionId(null);

        } else if (type === 'section') {
            const sectionIndex = sections.findIndex(s => s.id === targetSectionId);
            const newSection: FormSection = {
                id: `section_${Date.now()}`,
                title: data.name || 'New Section',
                fields: [],
                showAddMoreButton: data.addDuplicateButton || false,
            };

            const newSections = [...sections];
            newSections.splice(sectionIndex + 1, 0, newSection);
            setSections(newSections);

            setTargetSectionId(null);
        }
    };

    const handleMenuItemPress = (sectionId: string, type: FieldType) => {
        setTargetSectionId(sectionId);

        try {
            addFieldSheetRef.current?.open(type);
            setTimeout(() => {
                setActiveMenuSection(null);
            }, 300);
        } catch (error) {
            setActiveMenuSection(null);
        }
    };

    const handleEdit = () => setIsEditMode(true);
    const handleCancel = () => setIsEditMode(false);
    const handleSaveChanges = () => {
        // Save logic here
        setIsEditMode(false);
    };

    const handleFieldChange = (fieldId: string, value: string | boolean) => {
        setFormValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleMenuPress = (sectionId: string) => {
        setActiveMenuSection(activeMenuSection === sectionId ? null : sectionId);
    };

    const getMenuItems = (sectionId: string): MenuItem[] => [
        {
            id: 'add-text',
            label: 'Add Text Field',
            customIcon: <TextIcon text="Aa" />,
            onPress: () => handleMenuItemPress(sectionId, 'text'),
        },
        {
            id: 'add-textarea',
            label: 'Add Text Area',
            icon: 'document-text-outline',
            onPress: () => handleMenuItemPress(sectionId, 'textarea'),
        },
        {
            id: 'add-checkbox',
            label: 'Add Check Box',
            icon: 'checkbox-outline',
            onPress: () => handleMenuItemPress(sectionId, 'checkbox'),
        },
        {
            id: 'add-radio',
            label: 'Add Radio Button',
            icon: 'radio-button-on-outline',
            onPress: () => handleMenuItemPress(sectionId, 'radio'),
        },
        {
            id: 'add-section',
            label: 'Add New Section below',
            icon: 'apps-outline',
            onPress: () => handleMenuItemPress(sectionId, 'section'),
            showDividerAfter: true,
        },
        {
            id: 'delete-section',
            label: 'Delete this Section',
            icon: 'trash-outline',
            onPress: () => handleDeleteSection(sectionId),
            textColor: '#DC2626',
        },
    ];



    const handleDeleteSection = (sectionId: string) => {
        setSections(prevSections => prevSections.filter(s => s.id !== sectionId));
        setActiveMenuSection(null);
    };

    const renderField = (field: FormField) => {
        const value = formValues[field.id];

        switch (field.type) {
            case 'text':
                return (
                    <FormTextField
                        key={field.id}
                        value={value as string}
                        placeholder={field.placeholder}
                        onChangeText={(text) => handleFieldChange(field.id, text)}
                        isEditMode={isEditMode}
                        showClearButton={field.showClearButton}
                        keyboardType={field.keyboardType}
                    />
                );
            case 'textarea':
                return (
                    <FormTextArea
                        key={field.id}
                        value={value as string}
                        placeholder={field.placeholder}
                        onChangeText={(text) => handleFieldChange(field.id, text)}
                        isEditMode={isEditMode}
                    />
                );
            case 'checkbox':
                return (
                    <FormCheckbox
                        key={field.id}
                        label={field.label}
                        value={value as boolean}
                        onToggle={() => handleFieldChange(field.id, !value)}
                        isEditMode={isEditMode}
                    />
                );
            case 'dropdown':
                return (
                    <FormDropdown
                        key={field.id}
                        value={value as string}
                        placeholder={field.placeholder}
                        onPress={() => { }}
                        isEditMode={isEditMode}
                    />
                );
            default:
                return null;
        }
    };

    const renderFields = (fields: FormField[]) => {
        const rows: JSX.Element[] = [];
        let currentRow: FormField[] = [];

        fields.forEach((field, index) => {
            if (field.type === 'checkbox') {
                // Render previous row if exists
                if (currentRow.length > 0) {
                    rows.push(
                        <View key={`row-${index}`} style={styles.row}>
                            {currentRow.map(f => (
                                <View key={f.id} style={styles.halfWidth}>
                                    {renderField(f)}
                                </View>
                            ))}
                        </View>
                    );
                    currentRow = [];
                }
                return; // Handle checkboxes separately
            }

            if (field.width === 'full') {
                if (currentRow.length > 0) {
                    rows.push(
                        <View key={`row-${index}`} style={styles.row}>
                            {currentRow.map(f => (
                                <View key={f.id} style={styles.halfWidth}>
                                    {renderField(f)}
                                </View>
                            ))}
                        </View>
                    );
                    currentRow = [];
                }
                const fieldElement = renderField(field);
                if (fieldElement) {
                    rows.push(fieldElement);
                }
            } else {
                currentRow.push(field);
                if (currentRow.length === 2) {
                    rows.push(
                        <View key={`row-${index}`} style={styles.row}>
                            {currentRow.map(f => (
                                <View key={f.id} style={styles.halfWidth}>
                                    {renderField(f)}
                                </View>
                            ))}
                        </View>
                    );
                    currentRow = [];
                }
            }
        });

        if (currentRow.length > 0) {
            rows.push(
                <View key="last-row" style={styles.row}>
                    {currentRow.map(f => (
                        <View key={f.id} style={styles.halfWidth}>
                            {renderField(f)}
                        </View>
                    ))}
                </View>
            );
        }

        return rows;
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: bottom + 120 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>
                            {isEditMode ? 'Edit - Interest Form' : 'Interest Form'}
                        </Text>
                    </View>

                    {/* Render Sections */}
                    {sections.map((section, sectionIndex) => {
                        const checkboxFields = section.fields.filter(f => f.type === 'checkbox');
                        const otherFields = section.fields.filter(f => f.type !== 'checkbox');

                        return (
                            <React.Fragment key={section.id}>
                                {isEditMode ? (
                                    // EDIT MODE
                                    <View style={styles.sectionCard}>
                                        <View style={styles.sectionHeader}>
                                            <Text style={styles.sectionTitleEdit}>{section.title}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleMenuPress(section.id)}
                                                hitSlop={10}
                                            >
                                                <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Section Menu */}
                                        <ContextMenu
                                            visible={activeMenuSection === section.id}
                                            items={getMenuItems(section.id)}
                                            onClose={() => setActiveMenuSection(null)}
                                            position={{ top: 50, right: 16 }}
                                            minWidth={250}
                                        />

                                        <View style={styles.sectionContent}>
                                            {renderFields(otherFields)}

                                            {/* CHECKBOXES WITH INTERESTS WRAPPER IN EDIT MODE */}
                                            {checkboxFields.length > 0 && (
                                                <>
                                                    <View style={[styles.interestsHeader, {
                                                        marginBottom: 0
                                                    }]}>
                                                        <Text style={styles.interestsHeaderText}>Interests</Text>
                                                        <Ionicons name="chevron-down" size={20} color="#fff" />
                                                    </View>
                                                    <View style={styles.interestsContainer}>
                                                        {checkboxFields.map((field, index) => (
                                                            <View key={field.id} style={index === checkboxFields.length - 1 ? {} : { marginBottom: 20 }}>
                                                                {renderField(field)}
                                                            </View>
                                                        ))}
                                                    </View>
                                                </>
                                            )}

                                            {section.showAddMoreButton && (
                                                <TouchableOpacity style={styles.addMoreButton}>
                                                    <Text style={styles.addMoreButtonText}>Add More Church</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                ) : (
                                    // VIEW MODE
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>{section.title}</Text>
                                        {renderFields(otherFields)}

                                        {/* CHECKBOXES WITH INTERESTS WRAPPER IN VIEW MODE */}
                                        {checkboxFields.length > 0 && (
                                            <>
                                                <View style={[styles.interestsHeader, {
                                                    marginBottom: 0
                                                }]}>
                                                    <Text style={styles.interestsHeaderText}>Interests</Text>
                                                    <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.6)" />
                                                </View>
                                                <View style={styles.interestsContainer}>
                                                    {checkboxFields.map((field, index) => (
                                                        <View key={field.id} style={index === checkboxFields.length - 1 ? {} : { marginBottom: 20 }}>
                                                            {renderField(field)}
                                                        </View>
                                                    ))}
                                                </View>
                                            </>
                                        )}

                                        {section.showAddMoreButton && (
                                            <TouchableOpacity style={styles.addMoreButton}>
                                                <Text style={styles.addMoreButtonText}>Add More Church</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}

                                {!isEditMode && sectionIndex < sections.length - 1 && (
                                    <View style={styles.divider} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </ScrollView>

                {/* Bottom Buttons */}
                {isEditMode ? (
                    <View style={[styles.bottomButtons, { paddingBottom: bottom + 20 }]}>
                        <Pressable style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.saveButton} onPress={handleSaveChanges}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={[styles.bottomContainer, { paddingBottom: bottom + 20 }]}>
                        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                            <Ionicons name="create-outline" size={20} color="#1A4882" />
                            <Text style={styles.editButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>

            <AddFieldSheet
                ref={addFieldSheetRef}
                onInsert={handleFieldInsert}
                onClose={() => {
                    addFieldSheetRef.current?.dismiss();
                }}
            />

        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 20,
    },
    headerTitle: {
        marginLeft: 12,
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },

    // VIEW MODE STYLES
    sectionContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    interestsContainer: {
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        padding: 16,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginVertical: 4,
        marginHorizontal: 16,
    },

    // EDIT MODE STYLES
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
    sectionContent: {
        padding: 16,
        paddingTop: 0,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    addMoreButton: {
        alignSelf: 'flex-end',
        backgroundColor: 'rgba(26, 42, 89, 1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 4,
    },
    addMoreButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },

    // BOTTOM BUTTONS
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A4882',
    },
    bottomButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#176192',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A4882',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: 'rgba(26, 42, 89, 1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },


    interestsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 12,
    },
    interestsHeaderText: {
        fontSize: 15,
        color: '#fff',
    },

});

// components/roadmap/tasks/FormTask.tsx
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { FormSchema, Task } from '@/lib/roadmap/types';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    item: Task;
}

export function FormTask({ item }: Props) {
    const { progress, updateItem } = useRoadmapProgress();
    const schema = item.schema as FormSchema;
    const p = progress[item.id];
    const [formData, setFormData] = useState<Record<string, any>>(p?.formValues || {});

    function handleChange(fieldId: string, value: any) {
        const updated = { ...formData, [fieldId]: value };
        setFormData(updated);
        updateItem(item.id, { formValues: updated, status: 'IN_PROGRESS' });
    }

    function handleSubmit() {
        updateItem(item.id, { formValues: formData, status: 'COMPLETED' });
    }

    return (
        <>
            {/* Form fields */}
            {schema.fields.map(field => (
                <View key={field.id} style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>
                        {field.label}{field.required && ' *'}
                    </Text>
                    <TextInput
                        style={[styles.input, field.type === 'textarea' && { height: 100, textAlignVertical: 'top' }]}
                        placeholder={field.placeholder}
                        placeholderTextColor="#9cc2ff"
                        multiline={field.type === 'textarea'}
                        value={formData[field.id] || ''}
                        onChangeText={v => handleChange(field.id, v)}
                        keyboardType={
                            field.type === 'number' ? 'numeric' :
                                field.type === 'email' ? 'email-address' : 'default'
                        }
                    />
                </View>
            ))}

            {/* Submit button */}
            <Pressable style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>
                    {schema.submitLabel || 'Submit'}
                </Text>
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    fieldContainer: { marginBottom: 16 },
    fieldLabel: { color: 'white', fontSize: 14, marginBottom: 8, fontWeight: '500' },
    input: {
        backgroundColor: '#153f6d',
        padding: 14,
        borderRadius: 8,
        color: 'white',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#2a5a8a'
    },
    submitButton: { backgroundColor: 'white', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
    submitText: { color: '#0b2447', fontSize: 16, fontWeight: '600' },
});

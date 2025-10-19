// components/roadmap/tasks/FormTask.tsx
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { FormField, FormSchema, Task } from '@/lib/roadmap/types';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface Props {
    item: Task;
}

export function FormTask({ item }: Props) {
    const { progress, updateItem } = useRoadmapProgress();
    const schema = item.schema as FormSchema;
    const p = progress[item.id];
    const [formData, setFormData] = useState<Record<string, any>>(p?.formValues || {});

    function handleChange(fieldId: string, value: any) {
        setFormData(prev => ({ ...prev, [fieldId]: value }));
        updateItem(item.id, { formValues: { ...formData, [fieldId]: value }, status: 'IN_PROGRESS' });
    }

    function handleSubmit() {
        updateItem(item.id, { formValues: formData, status: 'COMPLETED' });
    }

    function renderField(field: FormField) {
        const value = formData[field.id] || '';

        if (field.type === 'textarea') {
            return (
                <TextInput
                    key={field.id}
                    style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                    placeholder={field.placeholder}
                    placeholderTextColor="#9cc2ff"
                    multiline
                    value={value}
                    onChangeText={v => handleChange(field.id, v)}
                />
            );
        }

        if (field.type === 'date') {
            return (
                <Pressable key={field.id} style={styles.input} onPress={() => {/* Show date picker */ }}>
                    <Text style={{ color: value ? 'white' : '#9cc2ff' }}>
                        {value || field.placeholder || 'Select date'}
                    </Text>
                </Pressable>
            );
        }

        if (field.type === 'dropdown') {
            return (
                <View key={field.id} style={styles.input}>
                    <Text style={{ color: value ? 'white' : '#9cc2ff' }}>
                        {value || `Select ${field.label}`}
                    </Text>
                    {/* Implement dropdown picker */}
                </View>
            );
        }

        return (
            <TextInput
                key={field.id}
                style={styles.input}
                placeholder={field.placeholder}
                placeholderTextColor="#9cc2ff"
                value={value}
                onChangeText={v => handleChange(field.id, v)}
                keyboardType={field.type === 'number' ? 'numeric' : field.type === 'email' ? 'email-address' : 'default'}
            />
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {item.meta?.coverImage && (
                <Image source={{ uri: item.meta.coverImage }} style={styles.coverImage} />
            )}

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.completionTime}>
                Completion Time Months {item.meta?.completionTimeMonths || '1 - 2'}
            </Text>

            {/* Roadmap */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Roadmap</Text>
                <View style={styles.box}>
                    <Text style={styles.boxText}>{item.meta?.roadmapText || item.title}</Text>
                </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.box}>
                    <Text style={styles.descriptionText}>{item.description}</Text>
                </View>
            </View>

            {/* Form fields */}
            <View style={styles.section}>
                {schema.fields.map(field => (
                    <View key={field.id} style={{ marginBottom: 16 }}>
                        <Text style={styles.fieldLabel}>{field.label}{field.required && ' *'}</Text>
                        {renderField(field)}
                    </View>
                ))}
            </View>

            {/* Submit */}
            <Pressable style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>{schema.submitLabel || 'Submit'}</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#0b1e33' },
    coverImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    completionTime: { color: '#9cc2ff', fontSize: 14, marginBottom: 16 },
    section: { marginBottom: 20 },
    sectionTitle: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 8 },
    box: { backgroundColor: '#153f6d', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#2a5a8a' },
    boxText: { color: 'white', fontSize: 15 },
    descriptionText: { color: '#9cc2ff', fontSize: 14, lineHeight: 20 },
    fieldLabel: { color: 'white', fontSize: 14, marginBottom: 6 },
    input: { backgroundColor: '#153f6d', padding: 14, borderRadius: 8, color: 'white', fontSize: 15 },
    submitButton: { backgroundColor: 'white', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
    submitText: { color: '#0b2447', fontSize: 16, fontWeight: '600' },
});

import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { Task, UploadSchema } from '@/lib/roadmap/types';
import * as DocumentPicker from 'expo-document-picker';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
    item: Task;
}

export function UploadTask({ item }: Props) {
    const { progress, updateItem } = useRoadmapProgress();
    const schema = item.schema as UploadSchema;
    const p = progress[item.id];
    const attachments = p?.attachments || [];

    async function handleUpload() {
        const res = await DocumentPicker.getDocumentAsync({
            type: schema.accept || '*/*',
            multiple: (schema.maxFiles ?? 1) > 1
        });

        if (!res.canceled) {
            const newFiles = res.assets.map(a => ({
                id: `${a.name}-${Date.now()}`,
                uri: a.uri,
                name: a.name
            }));
            updateItem(item.id, {
                attachments: [...attachments, ...newFiles].slice(0, schema.maxFiles),
                status: 'IN_PROGRESS'
            });
        }
    }

    function handleRemove(id: string) {
        updateItem(item.id, {
            attachments: attachments.filter(f => f.id !== id)
        });
    }

    function handleSubmit() {
        if (attachments.length > 0) {
            updateItem(item.id, { status: 'COMPLETED' });
        }
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Cover Image */}
            {item.meta?.coverImage && (
                <Image source={{ uri: item.meta.coverImage }} style={styles.coverImage} />
            )}

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.completionTime}>
                Completion Time Months {item.meta?.completionTimeMonths || '1 - 2'}
            </Text>

            {/* Roadmap section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Roadmap</Text>
                <View style={styles.roadmapBox}>
                    <Text style={styles.roadmapText}>{item.meta?.roadmapText || schema.label}</Text>
                </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.descriptionBox}>
                    <Text style={styles.descriptionText}>{schema.description || item.description}</Text>
                </View>
            </View>

            {/* Upload button */}
            <Pressable style={styles.uploadButton} onPress={handleUpload}>
                <Text style={styles.uploadButtonText}>{schema.label || 'Upload Document'}</Text>
            </Pressable>

            {/* Uploaded files */}
            {attachments.map(file => (
                <View key={file.id} style={styles.fileRow}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Pressable onPress={() => handleRemove(file.id)}>
                        <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                </View>
            ))}

            {/* Submit */}
            {attachments.length > 0 && (
                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Submit</Text>
                </Pressable>
            )}
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
    roadmapBox: { backgroundColor: '#153f6d', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#2a5a8a' },
    roadmapText: { color: 'white', fontSize: 15 },
    descriptionBox: { backgroundColor: '#153f6d', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#2a5a8a' },
    descriptionText: { color: '#9cc2ff', fontSize: 14, lineHeight: 20 },
    uploadButton: { backgroundColor: 'white', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
    uploadButtonText: { color: '#0b2447', fontSize: 16, fontWeight: '600' },
    fileRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#153f6d', borderRadius: 8, marginBottom: 8 },
    fileName: { color: 'white', flex: 1 },
    removeText: { color: '#f87171', fontSize: 14 },
    submitButton: { backgroundColor: '#34d399', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
    submitText: { color: 'white', fontSize: 16, fontWeight: '600' },
});


import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { Task, UploadSchema } from '@/lib/roadmap/types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        <>
            {}
            <Pressable style={styles.uploadButton} onPress={handleUpload}>
                <Ionicons name="cloud-upload-outline" size={20} color="#0b2447" style={{ marginRight: 8 }} />
                <Text style={styles.uploadButtonText}>
                    {schema.label || 'Upload Document'}
                </Text>
            </Pressable>

            {}
            {attachments.map(file => (
                <View key={file.id} style={styles.fileRow}>
                    <Ionicons name="document-outline" size={20} color="white" />
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Pressable onPress={() => handleRemove(file.id)}>
                        <Ionicons name="close-circle" size={20} color="#f87171" />
                    </Pressable>
                </View>
            ))}

            {}
            {attachments.length > 0 && (
                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Submit</Text>
                </Pressable>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    uploadButton: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12
    },
    uploadButtonText: { color: '#0b2447', fontSize: 16, fontWeight: '600' },
    fileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: '#153f6d',
        borderRadius: 8,
        marginBottom: 8
    },
    fileName: { color: 'white', flex: 1, fontSize: 14 },
    submitButton: { backgroundColor: '#34d399', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 12 },
    submitText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

// components/roadmap/tasks/SignatureTask.tsx
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { SignSchema, Task } from '@/lib/roadmap/types';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
    item: Task;
}

export function SignatureTask({ item }: Props) {
    const { progress, updateItem } = useRoadmapProgress();
    const schema = item.schema as SignSchema;
    const p = progress[item.id];
    const [agreed, setAgreed] = useState(p?.formValues?.agreed || false);

    function handleSign() {
        if (agreed) {
            updateItem(item.id, {
                signedAt: new Date().toISOString(),
                status: 'COMPLETED',
                formValues: { agreed: true }
            });
        }
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

            {/* View timeline link if exists */}
            {item.meta?.viewTimelineUrl && (
                <Pressable style={styles.timelineLink}>
                    <Text style={styles.timelineLinkText}>VIEW 12 MONTHS MENTORING TIMELINE MONTHS</Text>
                </Pressable>
            )}

            {/* Agreement checkbox */}
            <Pressable
                style={styles.checkboxRow}
                onPress={() => setAgreed(!agreed)}
            >
                <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                    {agreed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.agreementText}>{schema.agreementText}</Text>
            </Pressable>

            {/* Signature button */}
            <Pressable
                style={[styles.signButton, !agreed && styles.signButtonDisabled]}
                onPress={handleSign}
                disabled={!agreed}
            >
                <Text style={styles.signButtonText}>{schema.signatureLabel || 'Sign Here'}</Text>
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
    timelineLink: { padding: 12, marginBottom: 20 },
    timelineLinkText: { color: '#60a5fa', fontSize: 14, textDecorationLine: 'underline' },
    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: 'white', borderRadius: 4, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#34d399', borderColor: '#34d399' },
    checkmark: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    agreementText: { flex: 1, color: 'white', fontSize: 14, lineHeight: 20 },
    signButton: { backgroundColor: 'white', padding: 16, borderRadius: 8, alignItems: 'center' },
    signButtonDisabled: { backgroundColor: '#4a5568', opacity: 0.6 },
    signButtonText: { color: '#0b2447', fontSize: 16, fontWeight: '600' },
});

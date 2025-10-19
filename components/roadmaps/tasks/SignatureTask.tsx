// components/roadmap/tasks/SignatureTask.tsx
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { SignSchema, Task } from '@/lib/roadmap/types';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        <>
            {/* View timeline link */}
            {item.meta?.viewTimelineUrl && (
                <Pressable style={styles.timelineLink}>
                    <Text style={styles.timelineLinkText}>
                        VIEW 12 MONTHS MENTORING TIMELINE MONTHS
                    </Text>
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
                <Text style={styles.agreementText}>
                    {schema.agreementText}
                </Text>
            </Pressable>

            {/* Signature button */}
            <Pressable
                style={[styles.signButton, !agreed && styles.signButtonDisabled]}
                onPress={handleSign}
                disabled={!agreed}
            >
                <Text style={styles.signButtonText}>
                    {schema.signatureLabel || 'Signature Required here'}
                </Text>
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    timelineLink: { padding: 12, marginBottom: 20 },
    timelineLinkText: { color: '#60a5fa', fontSize: 14, textDecorationLine: 'underline' },
    checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
    checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: 'white', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
    checkboxChecked: { backgroundColor: '#34d399', borderColor: '#34d399' },
    checkmark: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    agreementText: { flex: 1, color: 'white', fontSize: 14, lineHeight: 20 },
    signButton: { backgroundColor: 'white', padding: 16, borderRadius: 8, alignItems: 'center' },
    signButtonDisabled: { backgroundColor: '#4a5568', opacity: 0.6 },
    signButtonText: { color: '#0b2447', fontSize: 16, fontWeight: '600' },
});

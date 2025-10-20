import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { SignSchema, Task } from '@/lib/roadmap/types';
import { getSpacing } from '@/utils/responsive';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
    item: Task;
    onSuccess?: () => void;
}

export function SignatureTask({ item, onSuccess }: Props) {
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
            onSuccess && onSuccess();
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
                    I agree to participate in the 12-month revitalization mentoring and church growth roadmap provided by The Center for Community Change
                </Text>
            </Pressable>

            {/* Signature button */}
            <Pressable
                style={[styles.signButton, !agreed && styles.signButtonDisabled]}
                onPress={handleSign}
                disabled={!agreed}
            >
                <Text style={styles.signButtonText}>
                    Signature Required here
                </Text>
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    timelineLink: {
        paddingVertical: getSpacing(20),
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ffffff40',
        borderTopWidth: 1,
        borderTopColor: '#ffffff40',
        marginHorizontal: -20,
        marginBottom: 24,
    },
    timelineLinkText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        marginBottom: 32,
        gap: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: '#ffffff',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#ffffff',
        borderColor: '#ffffff',
    },
    checkmark: {
        color: '#1e40af',
        fontSize: 18,
        fontWeight: 'bold',
    },
    agreementText: {
        flex: 1,
        color: '#ffffff',
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
    },
    signButton: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    signButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.6,
    },
    signButtonText: {
        color: '#1e40af',
        fontSize: 16,
        fontWeight: '600',
    },
});
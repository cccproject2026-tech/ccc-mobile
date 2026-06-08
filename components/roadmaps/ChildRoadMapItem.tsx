
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { ChildRoadmap } from '@/lib/roadmap/types';
import { Button, Pressable, ScrollView, Text, TextInput } from 'react-native';

export function ChildRoadmapItem({ item }: { item: ChildRoadmap }) {
    const { progress, toggleChecklist, updateItem } = useRoadmapProgress();
    const p = progress[item.id];

    return (
        <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#0b1e33' }}>
            <Text style={{ color: 'white', fontSize: 18, marginBottom: 8 }}>{item.title}</Text>
            {item.steps.map(step => (
                <Pressable key={step.id} onPress={() => toggleChecklist(item.id, step.id)} style={{ padding: 12, backgroundColor: '#102b4a', borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{ color: 'white' }}>{step.title}</Text>
                    <Text style={{ color: '#9cc2ff' }}>{(p?.checklist?.[step.id] ?? step.done) ? 'Done' : 'Pending'}</Text>
                </Pressable>
            ))}
            <TextInput
                placeholder="Write your notes here…"
                placeholderTextColor="#9cc2ff"
                multiline
                style={{ color: 'white', backgroundColor: '#0e2540', borderRadius: 8, padding: 12, minHeight: 120 }}
                value={p?.notes || ''}
                onChangeText={(t) => updateItem(item.id, { notes: t })}
            />
            <Button title="Mark Completed" onPress={() => updateItem(item.id, { status: 'COMPLETED' })} />
        </ScrollView>
    );
}

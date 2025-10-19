import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { Task } from '@/lib/roadmap/types';
import { Button, Pressable, ScrollView, Text } from 'react-native';

export function TaskChecklistItem({ item }: { item: Task }) {
    const { progress, toggleChecklist, updateItem } = useRoadmapProgress();
    const p = progress[item.id];

    return (
        <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#0b1e33' }}>
            <Text style={{ color: 'black', fontSize: 18 }}>{item.title}</Text>
            {(item.checklist || []).map(c => (
                <Pressable key={c.id} onPress={() => toggleChecklist(item.id, c.id)} style={{ padding: 12, backgroundColor: '#0e2540', borderRadius: 8, marginTop: 8 }}>
                    <Text style={{ color: 'white' }}>{c.text}</Text>
                    <Text style={{ color: '#9cc2ff' }}>{(p?.checklist?.[c.id] ?? c.done) ? 'Done' : 'Pending'}</Text>
                </Pressable>
            ))}
            <Button title="Mark Completed" onPress={() => updateItem(item.id, { status: 'COMPLETED' })} />
        </ScrollView>
    );
}

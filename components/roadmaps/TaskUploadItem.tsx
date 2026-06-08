
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { Task } from '@/lib/roadmap/types';
import * as DocumentPicker from 'expo-document-picker';
import { Button, ScrollView, Text, View } from 'react-native';

export function TaskUploadItem({ item }: { item: Task }) {
    const { progress, updateItem } = useRoadmapProgress();
    const p = progress[item.id];

    async function pick() {
        const res = await DocumentPicker.getDocumentAsync({ type: item.schema?.accept ?? '*/*', multiple: true });
        if (!res.canceled) {
            const files = res.assets.map(a => ({ id: a.name + Date.now(), uri: a.uri, name: a.name }));
            updateItem(item.id, { attachments: [...(p?.attachments || []), ...files], status: 'IN_PROGRESS' });
        }
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#0b1e33' }}>
            <Text style={{ color: 'black', fontSize: 18 }}>{item.title}</Text>
            <Text style={{ color: '#9cc2ff', marginBottom: 12 }}>{item.description}</Text>
            <Button title="Choose Files" onPress={pick} />
            {(p?.attachments || []).map(f => (
                <View key={f.id} style={{ padding: 10, backgroundColor: '#0f2946', borderRadius: 8, marginTop: 8 }}>
                    <Text style={{ color: 'white' }}>{f.name}</Text>
                </View>
            ))}
            <Button title="Submit" onPress={() => updateItem(item.id, { status: 'COMPLETED' })} />
        </ScrollView>
    );
}

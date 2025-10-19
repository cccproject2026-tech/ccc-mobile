// app/(pastor-tabs)/(tabs)/new-roadmap/[phaseId]/[itemId].tsx
import { ChildRoadmapItem } from '@/components/roadmaps/ChildRoadMapItem';
import { FormTask } from '@/components/roadmaps/tasks/FormTask';
import { SignatureTask } from '@/components/roadmaps/tasks/SignatureTask';
import { UploadTask } from '@/components/roadmaps/tasks/UploadTask';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { Task } from '@/lib/roadmap/types';
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function ItemDetail() {
    const { itemId } = useLocalSearchParams<{ itemId: string }>();
    const item = mockRevitalization.items[itemId!];

    if (!item) return <Text>Not found</Text>;

    // Route to correct component based on taskType
    if (item.kind === 'TASK') {
        const task = item as Task;
        switch (task.taskType) {
            case 'UPLOAD': return <UploadTask item={task} />;
            case 'FORM': return <FormTask item={task} />;
            case 'SIGN': return <SignatureTask item={task} />;
            // case 'CHECKLIST': return <ChecklistTask item={task} />;
            // case 'LINK': return <LinkTask item={task} />;
            // case 'MEETING': return <MeetingTask item={task} />;
            default: return <Text>Unsupported task</Text>;
        }
    }

    // Handle child roadmaps (Jump-start)
    return <ChildRoadmapItem item={item} />;
}

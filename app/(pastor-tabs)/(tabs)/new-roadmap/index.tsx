import RoadmapCard from '@/components/director/ProgressRoadmapCard';
import { useRoadmapProgress } from '@/context/RoadmapProgressContext';
import { usePhaseToCard } from '@/lib/roadmap/mappers';
import { mockRevitalization } from '@/lib/roadmap/mock';
import { selectPhase, selectProgram } from '@/lib/roadmap/selectors';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PhaseList() {
    const program = selectProgram(mockRevitalization);
    const { resetAll } = useRoadmapProgress();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1e33' }}>
            <ScrollView contentContainerStyle={{ padding: 16, backgroundColor: '#0b1e33' }}>
                <View style={{ marginBottom: 16 }}>
                    <Pressable
                        onPress={resetAll}
                        style={{
                            backgroundColor: '#264387',
                            paddingVertical: 10,
                            paddingHorizontal: 18,
                            borderRadius: 8,
                            alignSelf: 'flex-start',
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Clear Roadmap Progress</Text>
                    </Pressable>
                </View>
                {program.phases.map(pid => {
                    const phase = selectPhase(mockRevitalization, pid);
                    const card = usePhaseToCard(mockRevitalization, phase);

                    // IMPORTANT: Jump-start has 1 item, go direct to detail
                    // Phases 1-3 have multiple items, go to list
                    const isSingleItem = phase.items.length === 1;

                    const handlePress = () => {
                        if (isSingleItem) {
                            router.push(`/new-roadmap/${pid}/${phase.items[0]}`);
                        } else {
                            // Show task list for Phases 1-3
                            router.push(`/new-roadmap/${pid}`);
                        }
                    };

                    return (
                        <Pressable key={pid} onPress={handlePress}>
                            <RoadmapCard data={card} />
                        </Pressable>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

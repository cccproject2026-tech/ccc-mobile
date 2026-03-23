// import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
// import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
// import TopBar from '@/components/director/TopBar';
// import { DynamicFormTask } from '@/components/roadmaps/DynamicFormTask';
// import { mockRevitalization } from '@/lib/roadmap/mock';
// import { getPhase, getTask } from '@/lib/roadmap/selectors';
// import { getFontSize, getSpacing, isAndroid } from '@/utils/responsive';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useCallback, useState } from 'react';
// import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// export default function ItemDetail() {
//     const { itemId } = useLocalSearchParams<{ itemId: string; returnTo?: string }>();
//     const router = useRouter();

//     const task = getTask(mockRevitalization, itemId!);
//     const phase = getPhase(mockRevitalization, task?.phaseId || '');

//     const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
//     const [showOutcomeModal, setShowOutcomeModal] = useState(false);
//     const [selectedOutcome, setSelectedOutcome] = useState('');
//     const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'queries'>('overview');

//     const outcomeMenuItems = useCallback((): MenuItem[] => [
//         {
//             id: 'outcome-4-months',
//             label: 'Expected Outcome - 4 Months',
//             onPress: () => {
//                 setSelectedOutcome('Expected Outcome - First Four Months');
//                 setShowOutcomeMenu(false);
//                 setShowOutcomeModal(true);
//             },
//         },
//         {
//             id: 'outcome-6-months',
//             label: 'Expected Outcome - 6 Months',
//             onPress: () => {
//                 setSelectedOutcome('Expected Outcome - Six Months');
//                 setShowOutcomeMenu(false);
//                 setShowOutcomeModal(true);
//             },
//         },
//         {
//             id: 'outcome-9-months',
//             label: 'Expected Outcome - 9 Months',
//             onPress: () => {
//                 setSelectedOutcome('Expected Outcome - Nine Months');
//                 setShowOutcomeMenu(false);
//                 setShowOutcomeModal(true);
//             },
//         },
//         {
//             id: 'outcome-end-year',
//             label: 'Expected Outcome - End of Year',
//             onPress: () => {
//                 setSelectedOutcome('Expected Outcome - End of Year');
//                 setShowOutcomeMenu(false);
//                 setShowOutcomeModal(true);
//             },
//         },
//     ], []);

//     const outcomeData = useCallback(() => [
//         { id: '1', text: 'The church is committed to the revitalization process.' },
//         { id: '2', text: 'The Church is praying consistently and intentionally for revitalization.' },
//         { id: '3', text: 'The church understands its current health and is committed to making improvements.' },
//         { id: '4', text: 'The church is beginning to feel like a warm and welcoming place for new attendees.' },
//         { id: '5', text: 'Church members have begun to build new relationships.' },
//         { id: '6', text: 'Church members will begin to feel a sense of hope for the future.' },
//     ], []);

//     if (!task)
//         return (
//             <View style={styles.notFoundContainer}>
//                 <Text style={styles.notFoundText}>Task not found</Text>
//             </View>
//         );

//     return (
// <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
//     <View style={styles.topBarWrapper}>
//         <TopBar role="pastor" userName="John Ross" showUserName />
//     </View>

//     {/* Header */}
//     <View style={styles.headerContainer}>
//         <View style={styles.headerLeft}>
//             <TouchableOpacity
//                 onPress={() => router.back()}
//                 style={{ marginRight: getSpacing(8) }}
//             >
//                 <Ionicons name="chevron-back" size={28} color="#fff" />
//             </TouchableOpacity>

//             <View style={{ flex: 1, marginRight: getSpacing(8) }}>
//                 <Text
//                     style={{
//                         fontSize: isAndroid ? getFontSize(18) : getFontSize(15),
//                         fontWeight: '700',
//                         lineHeight: getFontSize(18),
//                         color: '#FFFFFF',
//                     }}
//                     numberOfLines={1}
//                     ellipsizeMode="tail"
//                 >
//                     {phase.title}
//                 </Text>
//                 {phase.subtitle && (
//                     <Text
//                         style={{
//                             marginTop: getSpacing(4),
//                             fontSize: getFontSize(12),
//                             color: 'rgba(255, 255, 255, 0.8)',
//                         }}
//                         numberOfLines={1}
//                         ellipsizeMode="tail"
//                     >
//                         {phase.subtitle}
//                     </Text>
//                 )}
//             </View>
//         </View>

//         <View style={styles.headerRight}>
//             <TouchableOpacity
//                 onPress={() => setShowOutcomeMenu(true)}
//                 style={{ padding: getSpacing(4) }}
//             >
//                 <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
//             </TouchableOpacity>
//         </View>
//     </View>

//     {/* Tabs */}
//     <View style={styles.tabRow}>
//         <TouchableOpacity
//             onPress={() => setActiveTab('overview')}
//             style={[
//                 styles.tabButton,
//                 activeTab === 'overview' ? styles.tabActive : styles.tabInactive,
//                 { marginRight: 8 },
//             ]}
//         >
//             <Text
//                 style={[
//                     styles.tabText,
//                     activeTab === 'overview' ? styles.tabTextActive : styles.tabTextInactive,
//                 ]}
//             >
//                 Overview
//             </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//             onPress={() =>
//                 router.push({
//                     pathname: '/roadmap/comments',
//                     params: { taskId: task.id, phaseId: task.phaseId },
//                 })
//             }
//             style={[
//                 styles.tabButton,
//                 activeTab === 'comments' ? styles.tabActive : styles.tabInactive,
//                 styles.tabWithBadge,
//             ]}
//         >
//             <Text
//                 style={[
//                     styles.tabText,
//                     activeTab === 'comments' ? styles.tabTextActive : styles.tabTextInactive,
//                 ]}
//             >
//                 Comments
//             </Text>
//             <View
//                 style={[
//                     styles.badge,
//                     activeTab === 'comments' ? styles.badgeActive : styles.badgeInactive,
//                 ]}
//             >
//                 <Text
//                     style={[
//                         styles.badgeText,
//                         activeTab === 'comments' ? styles.badgeTextActive : styles.badgeTextInactive,
//                     ]}
//                 >
//                     2
//                 </Text>
//             </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//             onPress={() =>
//                 router.push({
//                     pathname: '/roadmap/queries',
//                     params: { taskId: task.id, phaseId: task.phaseId },
//                 })
//             }
//             style={[
//                 styles.tabButton,
//                 activeTab === 'queries' ? styles.tabActive : styles.tabInactive,
//                 styles.tabWithBadge,
//             ]}
//         >
//             <Text
//                 style={[
//                     styles.tabText,
//                     activeTab === 'queries' ? styles.tabTextActive : styles.tabTextInactive,
//                 ]}
//             >
//                 Queries
//             </Text>
//             <View
//                 style={[
//                     styles.badge,
//                     activeTab === 'queries' ? styles.badgeActive : styles.badgeInactive,
//                 ]}
//             >
//                 <Text
//                     style={[
//                         styles.badgeText,
//                         activeTab === 'queries' ? styles.badgeTextActive : styles.badgeTextInactive,
//                     ]}
//                 >
//                     3
//                 </Text>
//             </View>
//         </TouchableOpacity>
//     </View>

//     {/* Content */}
//     <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {/* Cover Image */}
//         <View style={styles.coverImageContainer}>
//             {task.meta?.coverImage ? (
//                 <Image
//                     source={
//                         typeof task.meta.coverImage === 'string'
//                             ? { uri: task.meta.coverImage }
//                             : task.meta.coverImage
//                     }
//                     style={styles.coverImage}
//                     resizeMode="cover"
//                 />
//             ) : (
//                 <View style={styles.coverPlaceholder} />
//             )}

//             <View style={styles.coverTitleOverlay}>
//                 <View style={styles.coverTitleBox}>
//                     <Text style={styles.coverTitleText}>{task.title}</Text>
//                 </View>
//             </View>
//         </View>

//         {/* Completion Time */}
//         <View style={styles.completionBox}>
//             <Text style={styles.completionText}>
//                 Completion Time Months {task.meta?.completionTimeMonths || '1 - 2'}
//             </Text>
//         </View>

//         {/* Roadmap Section */}
//         <Text style={styles.sectionTitle}>Roadmap</Text>
//         <View style={styles.sectionBox}>
//             <Text style={styles.sectionText}>
//                 {task.meta?.roadmapText || phase?.subtitle || task.title}
//             </Text>
//         </View>

//         {/* Description Section */}
//         <Text style={styles.sectionTitle}>Description</Text>
//         <View style={styles.sectionBox}>
//             <Text style={styles.sectionText}>
//                 {task.description || 'No description provided'}
//             </Text>
//         </View>

//         <DynamicFormTask item={task} />
//     </ScrollView>

//     {/* Modals */}
//     <ContextMenu
//         visible={showOutcomeMenu}
//         items={outcomeMenuItems()}
//         onClose={() => setShowOutcomeMenu(false)}
//         position={{ top: 60, right: 16 }}
//         minWidth={280}
//         showIcons={false}
//         itemTextStyle={{ fontSize: 15, fontWeight: '500', color: '#1A4882' }}
//     />

//     <ExpectedOutcomeModal
//         visible={showOutcomeModal}
//         onClose={() => setShowOutcomeModal(false)}
//         title={selectedOutcome}
//         outcomes={outcomeData()}
//         onSelect={() => setShowOutcomeModal(false)}
//         onEdit={() => setShowOutcomeModal(false)}
//         onDownload={() => console.log('Download outcome')}
//     />
// </LinearGradient>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//     notFoundText: { color: 'white' },
//     topBarWrapper: { paddingBottom: 10 },
//     headerContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: getSpacing(8),
//         paddingVertical: getSpacing(16),
//         marginBottom: getSpacing(16),
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(255, 255, 255, 0.2)',
//     },
//     headerLeft: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         flex: 1,
//         marginRight: getSpacing(12),
//     },
//     headerRight: { flexDirection: 'row', alignItems: 'center', gap: getSpacing(8) },
//     tabRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingHorizontal: 16,
//         marginBottom: 16,
//     },
//     tabButton: {
//         borderRadius: 999,
//         paddingVertical: 10,
//         paddingHorizontal: 20,
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     tabActive: { backgroundColor: '#FFFFFF' },
//     tabInactive: {
//         backgroundColor: 'transparent',
//         borderWidth: 1,
//         borderColor: 'rgba(255,255,255,0.4)',
//     },
//     tabText: { fontSize: 15, fontWeight: '500' },
//     tabTextActive: { color: '#1A4882' },
//     tabTextInactive: { color: '#FFFFFF' },
//     tabWithBadge: { marginRight: 8 },
//     badge: {
//         marginLeft: 8,
//         width: 20,
//         height: 20,
//         borderRadius: 10,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     badgeActive: { backgroundColor: '#1A4882' },
//     badgeInactive: { backgroundColor: '#FFFFFF' },
//     badgeText: { fontSize: 11, fontWeight: '700' },
//     badgeTextActive: { color: '#FFFFFF' },
//     badgeTextInactive: { color: '#1A4882' },
//     scrollContainer: { paddingHorizontal: 16, paddingBottom: 24 },
//     coverImageContainer: {
//         position: 'relative',
//         marginBottom: 0,
//         overflow: 'hidden',
//         borderRadius: 24,
//         height: 220,
//         backgroundColor: '#1a1a1a',
//     },
//     coverImage: { width: '100%', height: '100%', position: 'absolute' },
//     coverPlaceholder: { width: '100%', height: '100%', backgroundColor: '#2a2a2a' },
//     coverTitleOverlay: { position: 'absolute', bottom: 24, left: 0, paddingHorizontal: 24 },
//     coverTitleBox: {
//         backgroundColor: 'rgba(50,50,80,0.7)',
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         borderRadius: 8,
//         alignSelf: 'flex-start',
//     },
//     coverTitleText: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
//     completionBox: {
//         paddingHorizontal: 24,
//         paddingVertical: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(255,255,255,0.2)',
//         borderBottomLeftRadius: 50,
//         borderBottomRightRadius: 50,
//     },
//     completionText: { fontSize: 16, fontWeight: '400', color: '#FFFFFF', textAlign: 'right' },
//     sectionTitle: { paddingHorizontal: 4, marginTop: 24, marginBottom: 12, fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
//     sectionBox: {
//         padding: 20,
//         marginBottom: 24,
//         borderRadius: 16,
//         backgroundColor: 'rgba(64,156,186,0.5)',
//     },
//     sectionText: { fontSize: 16, lineHeight: 22, color: '#FFFFFF' },
// });


// app/roadmap/[roadmapId]/[itemId].tsx
import ContextMenu, { MenuItem } from '@/components/director/ContextMenu';
import ExpectedOutcomeModal from '@/components/director/ExpectedOutcomeModal';
import TopBar from '@/components/director/TopBar';
import { DynamicFormTask } from '@/components/roadmaps/DynamicFormTask';
import { useRoadmap, useRoadmapComments, useRoadmapQueries } from '@/hooks/roadmaps/useRoadmaps';
import { getTasks } from '@/lib/roadmap/helpers';
import { NestedRoadmap } from '@/lib/roadmap/types';
import { useAuthStore } from '@/stores';
import { getFontSize, getSpacing, isAndroid } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { paramToString } from '@/utils/routerParams';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ItemDetail() {
    const { phaseId: phaseIdParam, itemId } = useLocalSearchParams<{
        phaseId: string | string[];
        itemId: string | string[];
    }>();
    const phaseId = paramToString(phaseIdParam);
    const itemIdNorm = paramToString(itemId);
    const router = useRouter();
    // Fetch parent roadmap
    const { data: roadmap, isLoading, error } = useRoadmap(phaseId);
    const { user } = useAuthStore();

    const { data: comments } = useRoadmapComments(phaseId, user?.id);
    const { data: queries } = useRoadmapQueries(phaseId, user?.id);

    const [showOutcomeMenu, setShowOutcomeMenu] = useState(false);
    const [showOutcomeModal, setShowOutcomeModal] = useState(false);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'comments' | 'queries'>('overview');

    // Find the specific nested roadmap (task)
    const task = useMemo<NestedRoadmap | undefined>(() => {
        if (!roadmap) return undefined;
        const allTasks = getTasks(roadmap);
        console.log(allTasks);
        return allTasks.find(r => r._id === itemIdNorm);
    }, [roadmap, itemIdNorm]);
    // Get phase number
    const phaseNumber = useMemo(() => {
        if (!roadmap?.phase) return null;
        const match = roadmap.phase.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    }, [roadmap]);

    const outcomeMenuItems = useCallback((): MenuItem[] => [
        {
            id: 'outcome-4-months',
            label: 'Expected Outcome - 4 Months',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - First Four Months');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: 'outcome-6-months',
            label: 'Expected Outcome - 6 Months',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - Six Months');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: 'outcome-9-months',
            label: 'Expected Outcome - 9 Months',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - Nine Months');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
        {
            id: 'outcome-end-year',
            label: 'Expected Outcome - End of Year',
            onPress: () => {
                setSelectedOutcome('Expected Outcome - End of Year');
                setShowOutcomeMenu(false);
                setShowOutcomeModal(true);
            },
        },
    ], []);

    const outcomeData = useCallback(() => [
        { id: '1', text: 'The church is committed to the revitalization process.' },
        { id: '2', text: 'The Church is praying consistently and intentionally for revitalization.' },
        { id: '3', text: 'The church understands its current health and is committed to making improvements.' },
        { id: '4', text: 'The church is beginning to feel like a warm and welcoming place for new attendees.' },
        { id: '5', text: 'Church members have begun to build new relationships.' },
        { id: '6', text: 'Church members will begin to feel a sense of hope for the future.' },
    ], []);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = date.getDate();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    // Loading state
    if (isLoading) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
                <View style={styles.topBarWrapper}>
                    <TopBar role="pastor" showUserName />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 16 }}>Loading task details...</Text>
                </View>
            </LinearGradient>
        );
    }

    // Error or not found state
    if (error || !roadmap || !task) {
        return (
            <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
                <View style={styles.topBarWrapper}>
                    <TopBar role="pastor" showUserName />
                </View>
                <View style={styles.notFoundContainer}>
                    <Ionicons name="alert-circle" size={48} color="#fff" />
                    <Text style={[styles.notFoundText, { marginTop: 16 }]}>
                        {error ? 'Failed to load task' : 'Task not found'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginTop: 20, padding: 12, backgroundColor: '#264387', borderRadius: 8 }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#176192', '#1D548D', '#264387']} style={styles.container}>
            <View style={styles.topBarWrapper}>
                <TopBar role="pastor" showUserName />
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginRight: getSpacing(8) }}
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={{ flex: 1, marginRight: getSpacing(8) }}>
                        <Text
                            style={{
                                fontSize: isAndroid ? getFontSize(18) : getFontSize(15),
                                fontWeight: '700',
                                lineHeight: getFontSize(18),
                                color: '#FFFFFF',
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {roadmap.name}
                        </Text>
                        {roadmap.roadMapDetails && (
                            <Text
                                style={{
                                    marginTop: getSpacing(4),
                                    fontSize: getFontSize(12),
                                    color: 'rgba(255, 255, 255, 0.8)',
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {roadmap.roadMapDetails}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.headerRight}>
                    {phaseNumber && (
                        <View style={{
                            backgroundColor: '#F7E35F',
                            borderRadius: 10,
                            paddingHorizontal: getSpacing(10),
                            paddingVertical: getSpacing(2),
                            marginRight: getSpacing(8),
                        }}>
                            <Text style={{
                                color: '#1D1D1D',
                                fontWeight: '700',
                                fontSize: getFontSize(13),
                            }}>
                                Phase {phaseNumber}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => setShowOutcomeMenu(true)}
                        style={{ padding: getSpacing(4) }}
                    >
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    onPress={() => setActiveTab('overview')}
                    style={[
                        styles.tabButton,
                        activeTab === 'overview' ? styles.tabActive : styles.tabInactive,
                        { marginRight: 8 },
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'overview' ? styles.tabTextActive : styles.tabTextInactive,
                        ]}
                    >
                        Overview
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        if (!phaseId) return;
                        router.push(
                            `/roadmap/comments?roadmapId=${encodeURIComponent(phaseId)}` as any,
                        );
                    }}
                    style={[
                        styles.tabButton,
                        activeTab === 'comments' ? styles.tabActive : styles.tabInactive,
                        styles.tabWithBadge,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'comments' ? styles.tabTextActive : styles.tabTextInactive,
                        ]}
                    >
                        Comments
                    </Text>
                    {comments && comments.comments.length > 0 && (

                        <View
                            style={[
                                styles.badge,
                                activeTab === 'comments' ? styles.badgeActive : styles.badgeInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    activeTab === 'comments' ? styles.badgeTextActive : styles.badgeTextInactive,
                                ]}
                            >
                                {comments && comments.comments.length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() =>
                        router.push({
                            pathname: '/roadmap/queries',
                            params: { taskId: task._id, roadmapId: phaseId },
                        })
                    }
                    style={[
                        styles.tabButton,
                        activeTab === 'queries' ? styles.tabActive : styles.tabInactive,
                        styles.tabWithBadge,
                    ]}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'queries' ? styles.tabTextActive : styles.tabTextInactive,
                        ]}
                    >
                        Queries
                    </Text>
                    {queries && queries.length > 0 && (
                        <View
                            style={[
                                styles.badge,
                                activeTab === 'queries' ? styles.badgeActive : styles.badgeInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    activeTab === 'queries' ? styles.badgeTextActive : styles.badgeTextInactive,
                                ]}
                            >
                                {queries && queries.length}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Cover Image */}
                <View style={styles.coverImageContainer}>
                    {task.imageUrl ? (
                        <Image
                            source={{ uri: task.imageUrl }}
                            style={styles.coverImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.coverPlaceholder}>
                            <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.3)" />
                        </View>
                    )}

                    <View style={styles.coverTitleOverlay}>
                        <View style={styles.coverTitleBox}>
                            <Text style={styles.coverTitleText}>{task.name}</Text>
                        </View>
                    </View>
                </View>

                {/* Completion Time / Status */}
                <View style={styles.completionBox}>
                    {task.status === 'completed' ? (
                        <View style={styles.completionContainer}>
                            <Text style={styles.completionStatusText}>Completed</Text>
                            <View style={styles.completionInfoColumn}>
                                <Text style={styles.completionInfoText}>
                                    Completed on : {formatDate(task.completedOn)}
                                </Text>
                                <Text style={styles.completionInfoText}>
                                    Last Updated : {formatDate(roadmap.updatedAt)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.completionText}>
                            Duration: {task.duration}
                        </Text>
                    )}
                </View>

                {/* Roadmap Section */}
                <Text style={styles.sectionTitle}>Roadmap</Text>
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionText}>
                        {task.roadMapDetails || roadmap.roadMapDetails || task.name}
                    </Text>
                </View>

                {/* Description Section */}
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionText}>
                        {task.description || 'No description provided'}
                    </Text>
                </View>

                {/* Status */}
                {/* <Text style={styles.sectionTitle}>Status</Text>
                <View style={styles.sectionBox}>
                    <Text style={[styles.sectionText, { textTransform: 'capitalize' }]}>
                        {task.status.replace('-', ' ')}
                    </Text>
                </View> */}

                {/* Dynamic Form - Render extras */}
                {task.extras && task.extras.length > 0 && (
                    <DynamicFormTask task={task} phaseId={phaseId} itemId={itemIdNorm} />
                )}
            </ScrollView>

            {/* Modals */}
            <ContextMenu
                visible={showOutcomeMenu}
                items={outcomeMenuItems()}
                onClose={() => setShowOutcomeMenu(false)}
                position={{ top: 60, right: 16 }}
                minWidth={280}
                showIcons={false}
                itemTextStyle={{ fontSize: 15, fontWeight: '500', color: '#1A4882' }}
            />

            <ExpectedOutcomeModal
                visible={showOutcomeModal}
                onClose={() => setShowOutcomeModal(false)}
                title={selectedOutcome}
                outcomes={outcomeData()}
                onSelect={() => setShowOutcomeModal(false)}
                onEdit={() => setShowOutcomeModal(false)}
                onDownload={() => console.log('Download outcome')}
            />
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
    notFoundContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    notFoundText: { color: 'white' },
    topBarWrapper: { paddingBottom: 10 },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: getSpacing(8),
        paddingVertical: getSpacing(16),
        marginBottom: getSpacing(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: getSpacing(12),
    },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: getSpacing(8) },
    tabRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    tabButton: {
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabActive: { backgroundColor: '#FFFFFF' },
    tabInactive: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    tabText: { fontSize: 15, fontWeight: '500' },
    tabTextActive: { color: '#1A4882' },
    tabTextInactive: { color: '#FFFFFF' },
    tabWithBadge: { marginRight: 8 },
    badge: {
        marginLeft: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeActive: { backgroundColor: '#1A4882' },
    badgeInactive: { backgroundColor: '#FFFFFF' },
    badgeText: { fontSize: 11, fontWeight: '700' },
    badgeTextActive: { color: '#FFFFFF' },
    badgeTextInactive: { color: '#1A4882' },
    scrollContainer: { paddingHorizontal: 16, paddingBottom: 24 },
    coverImageContainer: {
        position: 'relative',
        marginBottom: 0,
        overflow: 'hidden',
        borderRadius: 24,
        height: 220,
        backgroundColor: '#1a1a1a',
    },
    coverImage: { width: '100%', height: '100%', position: 'absolute' },
    coverPlaceholder: { width: '100%', height: '100%', backgroundColor: '#2a2a2a' },
    coverTitleOverlay: { position: 'absolute', bottom: 24, left: 0, paddingHorizontal: 24 },
    coverTitleBox: {
        backgroundColor: 'rgba(50,50,80,0.7)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    coverTitleText: { fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
    completionBox: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    completionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    completionStatusText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    completionInfoColumn: {
        alignItems: 'flex-end',
    },
    completionInfoText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#FFFFFF',
        marginTop: 2,
    },
    completionText: { fontSize: 16, fontWeight: '400', color: '#FFFFFF', textAlign: 'right' },
    sectionTitle: { paddingHorizontal: 4, marginTop: 24, marginBottom: 12, fontSize: 20, fontWeight: '600', color: '#FFFFFF' },
    sectionBox: {
        padding: 20,
        marginBottom: 24,
        borderRadius: 16,
        backgroundColor: 'rgba(64,156,186,0.5)',
    },
    sectionText: { fontSize: 16, lineHeight: 22, color: '#FFFFFF' },
});
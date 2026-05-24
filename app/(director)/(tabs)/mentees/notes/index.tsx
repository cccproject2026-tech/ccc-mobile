import KeyboardSafeContainer from '@/components/layout/KeyboardSafeContainer';
import TopBar from '@/components/director/TopBar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { JSX, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
    actions,
    RichEditor,
    RichToolbar,
} from 'react-native-pell-rich-editor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


interface Note {
    id: string;
    content: string;
    preview: string;
    date: string;
    time: string;
}

export default function MenteeNotes(): JSX.Element {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const richText = useRef<RichEditor | null>(null);
    const [activeTab, setActiveTab] = useState<'new' | 'previous'>('new');
    const [noteContent, setNoteContent] = useState<string>('');

    const [previousNotes, setPreviousNotes] = useState<Note[]>([
        {
            id: '1',
            content: '<p>Lorem ipsum dolor sit amet, consectetur sed do eiusadipiscing elit, sed do eiusmod ut labore et dolore magna aliqua. Ut enim ad minim veniam...</p>',
            preview: 'Lorem ipsum dolor sit amet, consectetur sed do eiusadipiscing elit, sed do eiusmod ut labore et dolore magna aliqua. Ut enim ad minim veniam...',
            date: 'Yesterday',
            time: '09:15 AM',
        },
        {
            id: '2',
            content: '<p>Lorem ipsum dolor sit amet, consectetur sed do eiusadipiscing elit, sed do eiusmod ut labore et dolore magna aliqua. Ut enim ad minim veniam...</p>',
            preview: 'Lorem ipsum dolor sit amet, consectetur sed do eiusadipiscing elit, sed do eiusmod ut labore et dolore magna aliqua. Ut enim ad minim veniam...',
            date: '09/11/24',
            time: '09:15 AM',
        },
        {
            id: '3',
            content: '<p>Lorem ipsum dolor sit amet, consectetur sed do eiusadipiscing elit, sed do eiusmod ut labore et dolore magna aliqua. Ut enim ad minim veniam...</p>',
            preview: 'Lorem ipsum dolor sit amet, consectetur sed do eiusadipiscing elit, sed do eiusmod ut labore et dolore magna aliqua. Ut enim ad minim veniam...',
            date: '09/11/24',
            time: '09:15 AM',
        },
        {
            id: '4',
            content: '<p>Lorem ipsum dolor sit amet, consectetur sed do eiusadipiscing elit, sed do eiusmod ut labore et dolore magna aliqua. Ut enim ad minim veniam...</p>',
            preview: 'Lorem ipsum dolor sit amet, consectetur sed do eiusadipiscing elit, sed do eiusmod ut labore et dolore magna aliqua. Ut enim ad minim veniam...',
            date: '09/11/24',
            time: '09:15 AM',
        },
    ]);

    const handleContentChange = (html: string) => {
        setNoteContent(html || '');
    };

    const handleSave = (): void => {
        const replaceHTML = noteContent.replace(/<(.|\n)*?>/g, '').trim();
        const replaceWhiteSpace = replaceHTML.replace(/&nbsp;/g, '').trim();

        if (replaceWhiteSpace.length > 0) {
            const preview = replaceWhiteSpace.substring(0, 150) + (replaceWhiteSpace.length > 150 ? '...' : '');

            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const date = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

            const newNote: Note = {
                id: Date.now().toString(),
                content: noteContent,
                preview,
                date,
                time,
            };

            setPreviousNotes([newNote, ...previousNotes]);
            setNoteContent('');
            richText.current?.setContentHTML('');
            Alert.alert('Success', 'Note saved successfully!');
        } else {
            Alert.alert('Empty Note', 'Please write some content before saving');
        }
    };

    const handleNotePress = (note: Note): void => {
        router.push({
            pathname: '/(director)/(tabs)/mentees/notes/[id]',
            params: {
                id: note.id,
                content: note.content,
                date: note.date,
                time: note.time,
            },
        });
    };

    const renderNoteItem = ({ item }: { item: Note }) => (
        <TouchableOpacity
            onPress={() => handleNotePress(item)}
            className="p-4 mx-4 mb-4 border-2 rounded-2xl border-white/30 bg-white/5"
            activeOpacity={0.7}
        >
            <View className="flex-row items-start justify-between">
                <Text className="flex-1 mr-3 text-base leading-6 text-white/85" numberOfLines={3}>
                    {item.preview}
                </Text>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.6)" />
            </View>
            <View className="flex-row items-center justify-end gap-4 mt-3">
                <Text className="text-sm text-white/60">{item.date}</Text>
                <Text className="text-sm text-white/60">{item.time}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1, paddingBottom: bottom }}
        >
            <View className="flex-1">
                <TopBar
                    userName="David Roe"
                    notifications={3}
                    showUserName={true}
                    showNotifications={true}
                />
                <View className="px-4 pt-4 pb-3 border-b border-white/20">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mb-1"
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                        <Text className="ml-2 text-xl font-semibold text-white">Notes</Text>
                    </TouchableOpacity>
                    <Text className="ml-10 text-sm text-white/70">Mentee › John Doe</Text>
                </View>

                {/* Tab Buttons */}
                <View className="flex-row gap-3 px-4 mt-6 mb-4">
                    <TouchableOpacity
                        onPress={() => setActiveTab('new')}
                        className={`flex-1 py-3.5 rounded-xl ${activeTab === 'new' ? 'bg-white' : 'bg-white/20'
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold text-base ${activeTab === 'new' ? 'text-[#264387]' : 'text-white/90'
                                }`}
                        >
                            New
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab('previous')}
                        className={`flex-1 py-3.5 rounded-xl ${activeTab === 'previous' ? 'bg-white' : 'bg-white/20'
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold text-base ${activeTab === 'previous' ? 'text-[#264387]' : 'text-white/90'
                                }`}
                        >
                            Previous
                        </Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'new' ? (
                    // New Note Editor
                    <KeyboardSafeContainer
                        mode="avoid"
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    >
                        <KeyboardSafeContainer
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                            extraScrollHeight={24}
                            scrollEnabled
                        >
                            <Pressable
                                onPress={() => richText.current?.dismissKeyboard()}
                            >
                                <View className="mt-3 mb-3 overflow-hidden border-2 rounded-2xl border-white/30 bg-white/5">
                                    <RichToolbar
                                        editor={richText}
                                        actions={[
                                            'fontSize',
                                            actions.keyboard,
                                            actions.setBold,
                                            actions.setUnderline,
                                            actions.insertBulletsList,
                                            actions.insertOrderedList,
                                            actions.alignLeft,
                                            actions.alignCenter,
                                            actions.alignRight,
                                            actions.alignFull,
                                        ]}
                                        iconMap={{
                                            fontSize: ({ tintColor }: { tintColor?: string }) => (
                                                <Text style={{ color: tintColor, fontSize: 18, fontWeight: '600' }}>
                                                    AA
                                                </Text>
                                            ),
                                            [actions.keyboard]: ({ tintColor }: { tintColor?: string }) => (
                                                <MaterialCommunityIcons
                                                    name="keyboard-outline"
                                                    size={22}
                                                    color={tintColor}
                                                />
                                            ),
                                            [actions.setBold]: ({ tintColor }: { tintColor?: string }) => (
                                                <MaterialCommunityIcons
                                                    name="format-bold"
                                                    size={22}
                                                    color={tintColor}
                                                />
                                            ),
                                            [actions.setUnderline]: ({ tintColor }: { tintColor?: string }) => (
                                                <MaterialCommunityIcons
                                                    name="format-underline"
                                                    size={22}
                                                    color={tintColor}
                                                />
                                            ),
                                            [actions.insertBulletsList]: ({ tintColor }: { tintColor?: string }) => (
                                                <MaterialCommunityIcons
                                                    name="format-list-bulleted"
                                                    size={22}
                                                    color={tintColor}
                                                />
                                            ),
                                            [actions.insertOrderedList]: ({ tintColor }: { tintColor?: string }) => (
                                                <MaterialCommunityIcons
                                                    name="format-list-numbered"
                                                    size={22}
                                                    color={tintColor}
                                                />
                                            ),
                                            [actions.alignLeft]: ({ tintColor }: { tintColor?: string }) => (
                                                <MaterialCommunityIcons
                                                    name="format-align-left"
                                                    size={22}
                                                    color={tintColor}
                                                />
                                            ),
                                            [actions.alignCenter]: ({ tintColor }: { tintColor?: string }) => (
                                                <MaterialCommunityIcons
                                                    name="format-align-center"
                                                    size={22}
                                                    color={tintColor}
                                                />
                                            ),
                                            [actions.alignRight]: ({ tintColor }: { tintColor?: string }) => (
                                                <MaterialCommunityIcons
                                                    name="format-align-right"
                                                    size={22}
                                                    color={tintColor}
                                                />
                                            ),
                                            [actions.alignFull]: ({ tintColor }: { tintColor?: string }) => (
                                                <MaterialCommunityIcons
                                                    name="format-align-justify"
                                                    size={22}
                                                    color={tintColor}
                                                />
                                            ),
                                        }}
                                        iconTint="rgba(255,255,255,0.7)"
                                        selectedIconTint="white"
                                        disabledIconTint="rgba(255,255,255,0.3)"
                                        style={{
                                            backgroundColor: 'transparent',
                                            borderRadius: 12,
                                            height: 50,
                                        }}
                                    />
                                </View>

                                <View
                                    className="mb-4 overflow-hidden border-2 rounded-3xl border-white/30"
                                    style={{
                                        height: 400,
                                        backgroundColor: 'rgba(30, 74, 111, 0.3)',
                                    }}
                                >
                                    <ScrollView
                                        contentContainerStyle={{ flexGrow: 1 }}
                                        nestedScrollEnabled
                                        showsVerticalScrollIndicator={false}
                                    >
                                        <RichEditor
                                            ref={richText}
                                            onChange={handleContentChange}
                                            placeholder="Write the Notes here..."
                                            style={{
                                                backgroundColor: 'transparent',
                                            } as any}
                                            useContainer={true}
                                            initialHeight={400}
                                            editorStyle={{
                                                backgroundColor: 'transparent',
                                                placeholderColor: 'rgba(255,255,255,0.4)',
                                                contentCSSText: `
                                                    font-size: 16px; 
                                                    color: rgba(255, 255, 255, 0.85); 
                                                    padding: 16px;
                                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                                `,
                                            } as any}
                                        />
                                    </ScrollView>
                                </View>

                                <TouchableOpacity
                                    className="py-4 bg-white rounded-2xl"
                                    activeOpacity={0.8}
                                    onPress={handleSave}
                                    style={{ marginBottom: 16 }}
                                >
                                    <Text className="text-[#264387] text-center font-bold text-lg">
                                        Save
                                    </Text>
                                </TouchableOpacity>
                            </Pressable>
                        </KeyboardSafeContainer>
                    </KeyboardSafeContainer>
                ) : (
                    <FlatList
                        data={previousNotes}
                        renderItem={renderNoteItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: bottom + 16 }}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center flex-1 py-20">
                                <Text className="text-base text-white/60">No previous notes</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </LinearGradient>
    );
}
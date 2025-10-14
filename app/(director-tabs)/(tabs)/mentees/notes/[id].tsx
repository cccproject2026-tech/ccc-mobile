import TopBar from '@/components/director/TopBar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { JSX, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {
    actions,
    RichEditor,
    RichToolbar,
} from 'react-native-pell-rich-editor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function MenteeNoteDetail(): JSX.Element {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const params = useLocalSearchParams();

    const viewRichText = useRef<RichEditor | null>(null);
    const editRichText = useRef<RichEditor | null>(null);

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [noteContent, setNoteContent] = useState<string>(params.content as string || '');
    const [originalContent, setOriginalContent] = useState<string>(params.content as string || '');
    const [noteData] = useState({
        id: params.id as string,
        date: params.date as string,
        time: params.time as string,
    });

    useEffect(() => {
        if (viewRichText.current && noteContent) {
            viewRichText.current?.setContentHTML(noteContent);
        }
    }, []);

    useEffect(() => {
        if (isEditMode && editRichText.current) {
            editRichText.current?.setContentHTML(noteContent);
        }
    }, [isEditMode]);

    const handleContentChange = (html: string) => {
        setNoteContent(html || '');
    };

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setNoteContent(originalContent);
    };

    const handleSaveEdit = () => {
        const replaceHTML = noteContent.replace(/<(.|\n)*?>/g, '').trim();
        const replaceWhiteSpace = replaceHTML.replace(/&nbsp;/g, '').trim();

        if (replaceWhiteSpace.length > 0) {
            setOriginalContent(noteContent);
            setIsEditMode(false);
            Alert.alert('Success', 'Note updated successfully!');

            // Update view mode content
            setTimeout(() => {
                viewRichText.current?.setContentHTML(noteContent);
            }, 300);
        } else {
            Alert.alert('Empty Note', 'Please write some content before saving');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Success', 'Note deleted successfully!', [
                            {
                                text: 'OK',
                                onPress: () => router.back(),
                            },
                        ]);
                    },
                },
            ]
        );
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1, paddingBottom: bottom }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <TopBar
                    userName="David Roe"
                    notifications={3}
                    showUserName={true}
                    showNotifications={true}
                />

                <View className="px-4 pt-4 pb-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mb-1"
                    >
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                        <Text className="ml-2 text-xl font-semibold text-white">Notes</Text>
                    </TouchableOpacity>
                    <Text className="ml-10 text-sm text-white/70">Mentee › John Doe</Text>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-row items-center justify-between px-4 mt-4 mb-4">
                        <View className="px-6 py-3 border-2 rounded-2xl border-white/30 bg-white/5">
                            <Text className="text-base font-medium text-white/90">
                                {noteData.date}  -  {noteData.time}
                            </Text>
                        </View>

                        <View className="flex-row gap-3">
                            {/* Edit Button */}
                            <TouchableOpacity
                                onPress={handleEdit}
                                className="p-3"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="pencil" size={24} color="white" />
                            </TouchableOpacity>

                            {/* Delete Button */}
                            <TouchableOpacity
                                onPress={handleDelete}
                                className="p-3"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="trash-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="px-4">
                        {isEditMode ? (
                            <>
                                <View className="mb-3 overflow-hidden border-2 rounded-2xl border-white/30 bg-white/5">
                                    <RichToolbar
                                        editor={editRichText}
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
                                        height: height * 0.5,
                                        backgroundColor: 'rgba(30, 74, 111, 0.3)',
                                    }}
                                >
                                    <RichEditor
                                        ref={editRichText}
                                        onChange={handleContentChange}
                                        placeholder="Write the Notes here..."
                                        disabled={false}
                                        initialContentHTML={noteContent}
                                        style={{
                                            backgroundColor: 'transparent',
                                            flex: 1,
                                        }}
                                        useContainer={true}
                                        initialHeight={height * 0.5}
                                        editorStyle={{
                                            backgroundColor: 'transparent',
                                            placeholderColor: 'rgba(255,255,255,0.4)',
                                            contentCSSText: `
                                                font-size: 16px; 
                                                color: rgba(255, 255, 255, 0.85); 
                                                padding: 16px;
                                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                            `,
                                        }}
                                    />
                                </View>

                                <View className="flex-row gap-3 mb-6" style={{ paddingBottom: bottom }}>
                                    <TouchableOpacity
                                        className="flex-1 py-4 border-2 rounded-2xl border-white/30 bg-white/10"
                                        activeOpacity={0.8}
                                        onPress={handleCancelEdit}
                                    >
                                        <Text className="text-lg font-bold text-center text-white/90">
                                            Cancel
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-1 py-4 bg-white rounded-2xl"
                                        activeOpacity={0.8}
                                        onPress={handleSaveEdit}
                                    >
                                        <Text className="text-[#264387] text-center font-bold text-lg">
                                            Save
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <View
                                className="p-5 mb-6 border-2 rounded-3xl border-white/30 bg-white/5"
                                style={{ minHeight: height * 0.6 }}
                            >
                                <RichEditor
                                    ref={viewRichText}
                                    disabled={true}
                                    initialContentHTML={noteContent}
                                    style={{
                                        backgroundColor: 'transparent',
                                        minHeight: height * 0.55,
                                    }}
                                    useContainer={false}
                                    editorStyle={{
                                        backgroundColor: 'transparent',
                                        contentCSSText: `
                                            font-size: 16px; 
                                            color: rgba(255, 255, 255, 0.85); 
                                            padding: 0px;
                                            line-height: 1.6;
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                        `,
                                    }}
                                />
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

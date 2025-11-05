import TopBar from '@/components/director/TopBar';
import { icons } from '@/constants/images';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Document {
    id: string;
    name: string;
    date: string;
    uri: string;
    size: number;
    mimeType: string;
}

export default function DocumentsScreen() {
    const router = useRouter();
    const { bottom } = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'myDocuments' | 'mentees'>('myDocuments');
    const [documents, setDocuments] = useState<Document[]>([
        {
            id: '1',
            name: 'My Educational Documents 1.pdf',
            date: '15 / 09 / 2024',
            uri: '',
            size: 0,
            mimeType: 'application/pdf',
        },
        {
            id: '2',
            name: 'My Experience Document 1.pdf',
            date: '15 / 09 / 2024',
            uri: '',
            size: 0,
            mimeType: 'application/pdf',
        },
        {
            id: '3',
            name: 'My Educational Certificate 1.pdf',
            date: '15 / 09 / 2024',
            uri: '',
            size: 0,
            mimeType: 'application/pdf',
        },
    ]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const newDocument: Document = {
                    id: Date.now().toString(),
                    name: file.name,
                    date: new Date().toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    }).replace(/\//g, ' / '),
                    uri: file.uri,
                    size: file.size || 0,
                    mimeType: file.mimeType || 'application/octet-stream',
                };
                setDocuments([newDocument, ...documents]);
                Alert.alert('Success', 'Document uploaded successfully!');
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document. Please try again.');
        }
    };

    const deleteDocument = (id: string) => {
        Alert.alert(
            'Delete Document',
            'Are you sure you want to delete this document?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setDocuments(documents.filter(doc => doc.id !== id));
                    },
                },
            ]
        );
    };

    const isImage = (mimeType: string) => {
        return mimeType.startsWith('image/');
    };

    const renderDocument = ({ item }: { item: Document }) => (
        <View style={styles.documentItem}>
            <View style={styles.documentIcon}>
                {isImage(item.mimeType) && item.uri ? (
                    <Image source={{ uri: item.uri }} style={styles.documentThumbnail} />
                ) : (
                    <Image source={icons.certificateImage} style={styles.pdfIcon} />
                )}
            </View>
            <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.documentDate}>{item.date}</Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteDocument(item.id)}
            >
                <Ionicons name="trash-outline" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1 }}
        >
            <TopBar
                userName="David Roe"
                showUserName={true}
                showNotifications={true}
                notifications={3}
                showDrawer={true}
                showBackButton={false}
            />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.push('/(director)/(tabs)/profile')} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Documents</Text>
                        <Text style={styles.headerSubtitle}>David Roe</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                    {/* <Image source={icons.upload} style={{ width: 20, height: 20, tintColor: '#fff' }} /> */}
                    <Text style={styles.uploadButtonText}>Upload</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <Pressable
                    style={[
                        styles.tab,
                        activeTab === 'myDocuments' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('myDocuments')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'myDocuments' && styles.activeTabText,
                        ]}
                    >
                        My Documents
                    </Text>
                </Pressable>
                <Pressable
                    style={[
                        styles.tab,
                        activeTab === 'mentees' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('mentees')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'mentees' && styles.activeTabText,
                        ]}
                    >
                        Mentees
                    </Text>
                </Pressable>
            </View>

            {/* Documents List */}
            {
                activeTab === 'myDocuments' ? (
                    <FlatList
                        data={documents}
                        renderItem={renderDocument}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[
                            styles.listContent,
                            { paddingBottom: bottom + 20 },
                        ]}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-outline" size={64} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyText}>No documents uploaded yet</Text>
                                <TouchableOpacity style={styles.emptyButton} onPress={pickDocument}>
                                    <Text style={styles.emptyButtonText}>Upload Document</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.emptyText}>No mentees documents</Text>
                    </View>
                )
            }
        </LinearGradient >
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 2,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        gap: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: 'transparent',
        borderRadius: 25,
        padding: 4,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#fff',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    activeTabText: {
        color: '#1E3A5F',
    },
    listContent: {
        paddingHorizontal: 16,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    documentIcon: {
        width: 56,
        height: 56,
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    pdfIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    documentThumbnail: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    documentDate: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 16,
        marginBottom: 24,
    },
    emptyButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#1E3A5F',
        fontSize: 16,
        fontWeight: '600',
    },
});

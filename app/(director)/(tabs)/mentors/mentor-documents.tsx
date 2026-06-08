import TopBar from '@/components/director/TopBar';
import { icons } from '@/constants/images';
import { getFontSize, getIconSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Document {
    id: string;
    name: string;
    time?: string;
    date?: string;
    type: 'uploaded' | 'library';
}

export default function MentorDocumentsScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();

    const uploadedDocuments: Document[] = [
        { id: '1', name: 'My Educational Documents 1.pdf', time: '9 :41 am', type: 'uploaded' },
        { id: '2', name: 'My Experience Document 1.pdf', time: '9 :41 am', type: 'uploaded' },
        { id: '3', name: 'My Educational Certificate 1.pdf', time: '9 :41 am', type: 'uploaded' },
    ];

    const libraryDocuments: Document[] = [
        { id: '4', name: 'My Educational Documents 1.pdf', date: '15 / 09 / 2024', type: 'library' },
        { id: '5', name: 'My Experience Document 1.pdf', date: '15 / 09 / 2024', type: 'library' },
        { id: '6', name: 'My Educational Certificate 1.pdf', date: '15 / 09 / 2024', type: 'library' },
    ];

    const handleDownloadAll = () => {
        Alert.alert('Download', 'Downloading all new documents...');
    };

    const handleDownload = (docName: string) => {
        Alert.alert('Download', `Downloading ${docName}`);
    };

    const handleDelete = (docName: string) => {
        Alert.alert('Delete', `Delete ${docName}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => console.log('Deleted') },
        ]);
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container]}
        >
            <TopBar
                userName="David Roe"
                showUserName={true}
                showNotifications={true}
                notifications={3}
                showDrawer={true}
                showBackButton={false}
            />

            {}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={getIconSize(28)} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Documents</Text>
                    <Text style={styles.headerBreadcrumb}>Mentor {'>'} John Doe</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                {}
                <Pressable style={styles.sectionHeader} onPress={handleDownloadAll}>
                    <Text style={styles.sectionHeaderText}>3 New Documents Uploaded</Text>
                    <Ionicons name="download-outline" size={getIconSize(24)} color="#fff" />
                </Pressable>

                {}
                <View style={styles.section}>
                    {uploadedDocuments.map((doc, index) => (
                        <View key={doc.id}>
                            <View style={styles.documentItem}>
                                <Image source={icons.certificateImage} style={styles.pdfIcon} />
                                <View style={styles.documentInfo}>
                                    <Text style={styles.documentName} numberOfLines={1}>
                                        {doc.name}
                                    </Text>
                                    <Text style={styles.documentTime}>{doc.time}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDownload(doc.name)}>
                                    <Ionicons name="download-outline" size={getIconSize(24)} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            {index < uploadedDocuments.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>

                {}
                <View style={styles.libraryHeader}>
                    <Text style={styles.libraryHeaderText}>Document Library • John Doe</Text>
                </View>

                {}
                <View style={styles.section}>
                    {libraryDocuments.map((doc, index) => (
                        <View key={doc.id}>
                            <View style={styles.documentItem}>
                                <Image source={icons.certificateImage} style={styles.pdfIcon} />
                                <View style={styles.documentInfo}>
                                    <Text style={styles.documentName} numberOfLines={1}>
                                        {doc.name}
                                    </Text>
                                    <Text style={styles.documentDate}>{doc.date}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleDelete(doc.name)}>
                                    <Ionicons name="trash-outline" size={getIconSize(24)} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            {index < libraryDocuments.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    backButton: {
        padding: getSpacing(4),
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: getSpacing(12),
    },
    headerTitle: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        color: '#fff',
        marginBottom: getSpacing(2),
    },
    headerBreadcrumb: {
        fontSize: getFontSize(12),
        color: 'rgba(255, 255, 255, 0.8)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: getSpacing(16),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: getSpacing(30),
        paddingVertical: getSpacing(12),
        paddingHorizontal: getSpacing(20),
        marginBottom: getSpacing(20),
    },
    sectionHeaderText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#fff',
    },
    section: {
        marginBottom: getSpacing(28),
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: getSpacing(14),
    },
    pdfIcon: {
        width: getIconSize(54),
        height: getIconSize(54),
        marginRight: getSpacing(14),
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: getFontSize(14),
        fontWeight: '500',
        color: '#fff',
        marginBottom: getSpacing(5),
    },
    documentTime: {
        fontSize: getFontSize(12),
        color: 'rgba(255, 255, 255, 0.7)',
    },
    documentDate: {
        fontSize: getFontSize(12),
        color: 'rgba(255, 255, 255, 0.7)',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginLeft: getSpacing(68),
    },
    libraryHeader: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: getSpacing(30),
        paddingVertical: getSpacing(12),
        paddingHorizontal: getSpacing(20),
        marginBottom: getSpacing(20),
        alignItems: 'center',
    },
    libraryHeaderText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#fff',
    },
});

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OutcomeItem {
    id: string;
    text: string;
}

interface ExpectedOutcomeModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    outcomes: OutcomeItem[];
    onSelect?: () => void;
    onEdit?: () => void;
    onDownload?: () => void;
}

export const ExpectedOutcomeModal: React.FC<ExpectedOutcomeModalProps> = ({
    visible,
    onClose,
    title,
    outcomes,
    onSelect,
    onEdit,
    onDownload,
}) => {
    const { top, bottom } = useSafeAreaInsets();
    const [showDownloadView, setShowDownloadView] = useState(false);

    const handleDownloadPress = () => {
        setShowDownloadView(true);
        onDownload?.();
    };

    const handleSavePDF = () => {
        console.log('Saving PDF...');
        setShowDownloadView(false);
        onClose();
    };

    const handleModalClose = () => {
        setShowDownloadView(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleModalClose}
        >
            {showDownloadView ? (
                
                <View
                    style={[styles.container, { paddingTop: Platform.OS === 'android' ? top : 10, paddingBottom: bottom }]}
                >
                    {}
                    <View style={styles.pdfHeader}>
                        <TouchableOpacity style={styles.pdfCloseButton} onPress={handleModalClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {}
                    <ScrollView style={styles.pdfContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.pdfCard}>
                            {}
                            <View style={styles.logoContainer}>
                                <View style={styles.logoPlaceholder}>
                                    <View style={styles.logoIcon}>
                                        <View style={styles.logoCircle1} />
                                        <View style={styles.logoCircle2} />
                                        <View style={styles.logoCircle3} />
                                    </View>
                                    <View style={styles.logoText}>
                                        <Text style={styles.logoTitle}>The Center</Text>
                                        <Text style={styles.logoTitle}>for Community</Text>
                                        <Text style={styles.logoTitle}>Change</Text>
                                        <Text style={styles.logoSubtitle}>The Seventh-day Adventist Theological Seminary</Text>
                                        <Text style={styles.logoSubtitle}>at Andrews University</Text>
                                    </View>
                                </View>
                            </View>

                            {}
                            <View style={styles.pdfTitleContainer}>
                                <Text style={styles.pdfTitle}>{title}</Text>
                                <View style={styles.titleUnderline} />
                            </View>

                            {}
                            <View style={styles.pdfOutcomesContainer}>
                                {outcomes.map((outcome, index) => (
                                    <View key={outcome.id} style={styles.pdfOutcomeItem}>
                                        <Text style={styles.pdfStarIcon}>★</Text>
                                        <Text style={styles.pdfOutcomeText}>{outcome.text}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    {}
                    <View style={styles.pdfBottomContainer}>
                        <TouchableOpacity style={styles.savePdfButton} onPress={handleSavePDF}>
                            <Ionicons name="download-outline" size={20} color="#007AFF" />
                            <Text style={styles.savePdfText}>Save PDF</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                
                <LinearGradient
                    colors={['#1a237e', '#283593', '#3949ab']}
                    style={[styles.container, { paddingTop: Platform.OS === 'android' ? top : 10, }]}
                >
                    {}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeButton} onPress={handleModalClose}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {}
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{title}</Text>
                    </View>

                    {}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionButton} onPress={onSelect}>
                            <Ionicons name="checkmark" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Select</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
                            <Ionicons name="create-outline" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    {}
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottom }}>
                        <View style={styles.outcomeContainer}>
                            {outcomes.map((outcome, index) => (
                                <View key={outcome.id} style={styles.outcomeItem}>
                                    <Ionicons name="star" size={20} color="#FFD700" style={styles.starIcon} />
                                    <Text style={styles.outcomeText}>{outcome.text}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.downloadContainer}>
                            <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPress}>
                                <Ionicons name="download-outline" size={20} color="#fff" />
                                <Text style={styles.downloadText}>Download</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {}
                </LinearGradient>
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        
        
    },
    closeButton: {
        padding: 8,
    },
    titleContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#9C27B0',
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        gap: 8,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    outcomeContainer: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 20,
        marginBottom: 24,
    },
    outcomeItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingRight: 8,
    },
    starIcon: {
        marginRight: 12,
        marginTop: 2,
        flexShrink: 0,
    },
    outcomeText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#fff',
        flex: 1,
    },
    downloadContainer: {
        paddingHorizontal: 20,
        
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    downloadText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
        textDecorationLine: 'underline',
    },

    
    pdfContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    pdfHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    pdfCloseButton: {
        padding: 8,
    },
    pdfContent: {
        flex: 1,
        
    },
    pdfCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        margin: 16,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoPlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoIcon: {
        position: 'relative',
        width: 60,
        height: 60,
    },
    logoCircle1: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#00BCD4',
        top: 0,
        left: 20,
    },
    logoCircle2: {
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#2196F3',
        top: 15,
        left: 0,
    },
    logoCircle3: {
        position: 'absolute',
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#03A9F4',
        top: 25,
        left: 25,
    },
    logoText: {
        alignItems: 'flex-start',
    },
    logoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        lineHeight: 22,
    },
    logoSubtitle: {
        fontSize: 12,
        color: '#666',
        lineHeight: 14,
        marginTop: 4,
    },
    pdfTitleContainer: {
        marginBottom: 24,
    },
    pdfTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1976D2',
        textAlign: 'center',
        marginBottom: 8,
    },
    titleUnderline: {
        height: 2,
        backgroundColor: '#00BCD4',
        marginHorizontal: 20,
    },
    pdfOutcomesContainer: {
        marginTop: 24,
    },
    pdfOutcomeItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingRight: 8,
    },
    pdfStarIcon: {
        fontSize: 16,
        color: '#FFD700',
        marginRight: 12,
        marginTop: 2,
        flexShrink: 0,
    },
    pdfOutcomeText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        flex: 1,
    },
    pdfBottomContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        alignItems: 'flex-end',
    },
    savePdfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    savePdfText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
});

export default ExpectedOutcomeModal;
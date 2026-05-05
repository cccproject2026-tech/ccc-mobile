import { getFontSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export interface CdpSection {
    sectionId: string;
    title: string;
    score?: number;
    recommendations: string[];
}

type CdpModalMode = 'mentor' | 'pastor';

interface CdpPlansModalProps {
    visible: boolean;
    onClose: () => void;
    /** Shown at top of modal (e.g. "Pastoral Ministry Profile (PMP)") */
    assessmentTitle?: string;
    mode: CdpModalMode;
    sections: CdpSection[];
    /** Mentor only: selected recommendation texts per sectionId */
    selectedRecommendations?: Record<string, string[]>;
    /** Mentor only: toggle a recommendation */
    onToggleRecommendation?: (sectionId: string, text: string) => void;
    /** Mentor only: update recommendation text by index */
    onUpdateRecommendation?: (
        sectionId: string,
        recommendationIndex: number,
        nextText: string,
    ) => void;
    /** Mentor only: add a recommendation row */
    onAddRecommendation?: (sectionId: string) => void;
    /** Mentor only: send CDP */
    onSendCdp?: () => void;
    /** Pastor only: download CDP as PDF */
    onDownloadCdp?: () => void;
}

export default function CdpPlansModal({
    visible,
    onClose,
    assessmentTitle = 'Customized Development Plans',
    mode,
    sections,
    selectedRecommendations = {},
    onToggleRecommendation,
    onUpdateRecommendation,
    onAddRecommendation,
    onSendCdp,
    onDownloadCdp,
}: CdpPlansModalProps) {
    const [mentorActionMode, setMentorActionMode] = React.useState<'select' | 'edit'>('select');

    React.useEffect(() => {
        if (visible) {
            setMentorActionMode('select');
        }
    }, [visible]);

    if (!sections?.length) {
        return null;
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <KeyboardAwareScrollView
                    style={styles.keyboardAwareWrapper}
                    contentContainerStyle={styles.keyboardAwareContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.container}>
                        <LinearGradient
                            colors={['#1D548D', '#264387', '#264387']}
                            style={styles.gradient}
                        >
                            <View style={styles.headerRow}>
                                <View style={styles.titleWrap}>
                                    <Text style={styles.title} numberOfLines={1}>{assessmentTitle}</Text>
                                </View>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={12}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.scroll}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                            {sections.map((section, sectionIndex) => {
                                const sectionNumber = sectionIndex + 1;
                                const hasScore = section.score != null;
                                const selectedForSection = selectedRecommendations[section.sectionId] ?? [];
                                const totalRecommendations = (section.recommendations ?? []).length;
                                const allSelected =
                                    mode === 'mentor' &&
                                    totalRecommendations > 0 &&
                                    selectedForSection.length > 0 &&
                                    selectedForSection.length >= totalRecommendations;

                                return (
                                    <View key={section.sectionId} style={styles.sectionBlock}>
                                        <View style={styles.sectionHeaderBox}>
                                            <Text style={styles.sectionHeader}>
                                                {mode === 'mentor'
                                                    ? `Section ${sectionNumber} ( ${section.title} ) - CDP`
                                                    : `Section ${sectionNumber} - ${section.title}`}
                                            </Text>
                                        </View>

                                        {mode === 'pastor' && hasScore && (
                                            <Text style={styles.levelText}>
                                                You are at Level {section.score}!
                                            </Text>
                                        )}

                                        {mode === 'mentor' && hasScore && (
                                            <Text style={styles.levelText}>
                                                Pastor Level: {section.score}
                                            </Text>
                                        )}

                                        {mode === 'mentor' && (
                                            <Text style={styles.subtext}>
                                                Pastor Chose more Options from Layer {sectionNumber}
                                            </Text>
                                        )}

                                        {mode === 'mentor' && (
                                            <View style={styles.controlsRow}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.controlButton,
                                                        mentorActionMode === 'select' && styles.controlButtonActive,
                                                    ]}
                                                    onPress={() => setMentorActionMode('select')}
                                                >
                                                    <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                                                    <Text style={styles.controlButtonText}>Select</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.controlButton,
                                                        mentorActionMode === 'edit' && styles.controlButtonActive,
                                                    ]}
                                                    onPress={() => setMentorActionMode('edit')}
                                                >
                                                    <Ionicons name="pencil-outline" size={18} color="#fff" />
                                                    <Text style={styles.controlButtonText}>Edit</Text>
                                                </TouchableOpacity>

                                                {onAddRecommendation && (
                                                    <TouchableOpacity
                                                        style={styles.controlButton}
                                                        onPress={() => {
                                                            setMentorActionMode('edit');
                                                            onAddRecommendation(section.sectionId);
                                                        }}
                                                    >
                                                        <Ionicons name="add-circle-outline" size={18} color="#fff" />
                                                        <Text style={styles.controlButtonText}>Add</Text>
                                                    </TouchableOpacity>
                                                )}

                                                {mentorActionMode === 'select' && onToggleRecommendation && (
                                                    <TouchableOpacity
                                                        style={styles.controlButton}
                                                        onPress={() => {
                                                            const items = section.recommendations ?? [];
                                                            if (!items.length) return;

                                                            if (allSelected) {
                                                                selectedForSection.forEach((text) => {
                                                                    onToggleRecommendation(section.sectionId, text);
                                                                });
                                                                return;
                                                            }

                                                            const selectedSet = new Set(selectedForSection);
                                                            items.forEach((text) => {
                                                                if (!selectedSet.has(text)) {
                                                                    onToggleRecommendation(section.sectionId, text);
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <Ionicons name="checkbox-outline" size={18} color="#fff" />
                                                        <Text style={styles.controlButtonText}>
                                                            {allSelected ? 'Clear all' : 'Select all'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}

                                        <Text style={styles.listTitle}>Customized Development Plans</Text>
                                        <View style={styles.listTitleUnderline} />
                                        <View style={styles.listBox}>
                                            {(section.recommendations ?? []).map((item, idx) => {
                                                const isSelected = mode === 'mentor' && (selectedRecommendations[section.sectionId] ?? []).includes(item);
                                                return (
                                                    <View key={`${section.sectionId}-${idx}`} style={styles.itemRow}>
                                                        <Text style={styles.star}>⭐</Text>
                                                        {mode === 'mentor' && mentorActionMode === 'edit' && onUpdateRecommendation ? (
                                                            <TextInput
                                                                value={item}
                                                                onChangeText={(nextText) =>
                                                                    onUpdateRecommendation(
                                                                        section.sectionId,
                                                                        idx,
                                                                        nextText,
                                                                    )
                                                                }
                                                                style={styles.itemInput}
                                                                placeholder="Edit recommendation"
                                                                placeholderTextColor="rgba(255,255,255,0.5)"
                                                            />
                                                        ) : mode === 'mentor' && onToggleRecommendation ? (
                                                            <TouchableOpacity
                                                                style={styles.itemTouch}
                                                                onPress={() => onToggleRecommendation(section.sectionId, item)}
                                                                activeOpacity={0.7}
                                                            >
                                                                <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>{item}</Text>
                                                            </TouchableOpacity>
                                                        ) : (
                                                            <Text style={styles.itemText}>{item}</Text>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                );
                            })}
                            </ScrollView>

                            <View style={styles.footer}>
                                {mode === 'mentor' && onSendCdp ? (
                                    <TouchableOpacity style={styles.sendButton} onPress={onSendCdp} activeOpacity={0.8}>
                                        <Text style={styles.sendButtonText}>Send</Text>
                                    </TouchableOpacity>
                                ) : mode === 'pastor' ? (
                                    <TouchableOpacity
                                        style={styles.downloadButton}
                                        activeOpacity={0.8}
                                        onPress={onDownloadCdp}
                                    >
                                        <Ionicons name="download-outline" size={20} color="#fff" />
                                        <Text style={styles.downloadButtonText}>Download</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </LinearGradient>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: getSpacing(20),
    },
    keyboardAwareWrapper: {
        width: '100%',
    },
    keyboardAwareContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        borderRadius: 16,
        maxHeight: '85%',
        width: '100%',
        overflow: 'hidden',
    },
    gradient: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: getSpacing(20),
        paddingTop: getSpacing(20),
        paddingBottom: getSpacing(12),
    },
    titleWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: getFontSize(18),
        fontWeight: '700',
        color: '#fff',
    },
    closeButton: {
        padding: getSpacing(4),
    },
    scroll: {
        maxHeight: 400,
    },
    scrollContent: {
        padding: getSpacing(20),
        paddingBottom: getSpacing(24),
    },
    sectionBlock: {
        marginBottom: getSpacing(24),
    },
    sectionHeaderBox: {
        borderWidth: 2,
        borderColor: 'rgba(168, 85, 247, 0.8)',
        borderRadius: 12,
        paddingVertical: getSpacing(12),
        paddingHorizontal: getSpacing(16),
        marginBottom: getSpacing(12),
    },
    sectionHeader: {
        fontSize: getFontSize(15),
        fontWeight: '700',
        color: '#fff',
        textAlign: 'center',
    },
    levelText: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#FFFFFF',
        marginVertical: getSpacing(8),
    },
    subtext: {
        fontSize: getFontSize(13),
        color: 'rgba(255,255,255,0.9)',
        marginBottom: getSpacing(12),
    },
    controlsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: getSpacing(10),
        marginBottom: getSpacing(16),
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: getSpacing(6),
        paddingVertical: getSpacing(6),
        paddingHorizontal: getSpacing(14),
        borderRadius: 8,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.9)',
        flexGrow: 1,
        flexBasis: '48%',
    },
    controlButtonActive: {
        backgroundColor: 'rgba(148,163,184,0.25)',
    },
    controlButtonText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#fff',
    },
    listTitle: {
        fontSize: getFontSize(14),
        fontWeight: '700',
        color: '#fff',
        marginBottom: getSpacing(4),
    },
    listTitleUnderline: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.5)',
        marginBottom: getSpacing(12),
    },
    listBox: {
        borderWidth: 1,
        borderColor: 'rgba(148, 163, 184, 0.7)',
        borderRadius: 14,
        paddingVertical: getSpacing(10),
        paddingHorizontal: getSpacing(14),
        backgroundColor: 'rgba(15,23,42,0.45)',
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getSpacing(10),
        gap: getSpacing(8),
    },
    star: {
        fontSize: getFontSize(14),
    },
    itemTouch: {
        flex: 1,
    },
    itemText: {
        flex: 1,
        fontSize: getFontSize(14),
        color: '#fff',
        lineHeight: getFontSize(20),
    },
    itemInput: {
        flex: 1,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.8)',
        borderRadius: 8,
        paddingVertical: getSpacing(8),
        paddingHorizontal: getSpacing(10),
        fontSize: getFontSize(14),
    },
    itemTextSelected: {
        fontWeight: '600',
        color: '#A5B4FC',
    },
    footer: {
        padding: getSpacing(20),
        paddingTop: getSpacing(12),
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    sendButton: {
        alignSelf: 'center',
        paddingVertical: getSpacing(10),
        paddingHorizontal: getSpacing(32),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(148,163,184,0.9)',
        backgroundColor: 'rgba(15,23,42,0.9)',
    },
    sendButtonText: {
        fontSize: getFontSize(16),
        fontWeight: '700',
        color: '#fff',
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: getSpacing(8),
        backgroundColor: 'transparent',
        paddingVertical: getSpacing(14),
    },
    downloadButtonText: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#fff',
        textDecorationLine: 'underline',
    },
});

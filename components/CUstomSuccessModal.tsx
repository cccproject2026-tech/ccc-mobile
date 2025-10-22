import { getFontSize, getSpacing } from '@/utils/responsive';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomSuccessModalProps {
    visible: boolean;
    title: string;
    onClose: () => void;
    onAssignMentor: () => void;
}

const CustomSuccessModal: React.FC<CustomSuccessModalProps> = ({ visible, title, onClose, onAssignMentor }) => {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <TouchableOpacity style={styles.assignButton} onPress={onAssignMentor}>
                        <Text style={styles.assignButtonText}>Assign Mentor</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#264387',
        borderRadius: 20,
        padding: getSpacing(24),
        alignItems: 'center',
    },
    title: {
        fontSize: getFontSize(20),
        fontWeight: '700',
        color: '#fff',
        marginBottom: getSpacing(24),
        textAlign: 'center',
    },
    assignButton: {
        backgroundColor: '#FFC107',
        borderRadius: 25,
        paddingVertical: getSpacing(14),
        paddingHorizontal: getSpacing(48),
        marginBottom: getSpacing(16),
    },
    assignButtonText: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#1E3A6F',
        textAlign: 'center',
    },
    closeButton: {
        paddingVertical: getSpacing(12),
        paddingHorizontal: getSpacing(32),
    },
    closeButtonText: {
        fontSize: getFontSize(14),
        color: '#fff',
        textAlign: 'center',
    }
});

export default CustomSuccessModal;

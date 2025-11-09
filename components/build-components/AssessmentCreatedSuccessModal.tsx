import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AssessmentCreatedSuccessModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function AssessmentCreatedSuccessModal({
    visible,
    onClose,
}: AssessmentCreatedSuccessModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={onClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <View style={styles.content}>
                        <Text style={styles.firstLine}>Survey Created</Text>
                        <Text style={styles.secondLine}>Successfully</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxWidth: 320,
        paddingVertical: 32,
        paddingHorizontal: 24,
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    closeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    firstLine: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2563EB',
        textAlign: 'center',
        lineHeight: 24,
    },
    secondLine: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2563EB',
        textAlign: 'center',
        lineHeight: 24,
        marginTop: 2,
    },
});


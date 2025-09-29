import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UploadSection() {
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [profileImage, setProfileImage] = useState("");

    const handleImageUpload = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleDocumentUpload = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true,
        });

        if (!result.canceled) {
            //   setUploadedDocs([...uploadedDocs, result.assets[0]]);
        }
    };

    const getInitials = (index: number) => {
        const letters = ['V', 'T', 'A', 'B', 'C'];
        return letters[index % letters.length];
    };

    const getDocColor = (index: number) => {
        const colors = [
            ['#4CAF50', '#2E7D32'],
            ['#E91E63', '#C2185B'],
            ['#FF9800', '#F57C00'],
            ['#2196F3', '#1976D2'],
        ];
        return colors[index % colors.length];
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {/* Profile Avatar */}
                <View style={styles.avatarContainer}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                    ) : (
                        <LinearGradient
                            colors={['#7B9FE8', '#E891C5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.avatar}
                        >
                            <View style={styles.avatarIcon}>
                                <View style={styles.avatarHead} />
                                <View style={styles.avatarBody} />
                            </View>
                        </LinearGradient>
                    )}
                </View>

                {/* Upload Image Button */}
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={handleImageUpload}
                    activeOpacity={0.8}
                >
                    <Text style={styles.uploadButtonText}>Upload Image</Text>
                    <View style={styles.uploadIcon}>
                        <Text style={styles.uploadIconText}>↑</Text>
                    </View>
                </TouchableOpacity>

                {/* Upload Documents Button */}
                <TouchableOpacity
                    style={styles.documentButton}
                    onPress={handleDocumentUpload}
                    activeOpacity={0.8}
                >
                    <Text style={styles.documentButtonText}>Upload documents</Text>
                    <View style={styles.attachIcon}>
                        <Text style={styles.attachIconText}>📎</Text>
                    </View>

                    {/* Document Badges */}
                    {uploadedDocs.length > 0 && (
                        <View style={styles.badgeContainer}>
                            {uploadedDocs.slice(0, 2).map((doc, index) => (
                                // <LinearGradient
                                //   key={index}
                                //   colors={getDocColor(index)}
                                //   style={[
                                //     styles.badge,
                                //     index === 1 && styles.badgeSecond
                                //   ]}
                                // >
                                <Text style={styles.badgeText}>{getInitials(index)}</Text>
                                // </LinearGradient>
                            ))}
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A2647',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'rgba(30, 58, 95, 0.6)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(100, 150, 200, 0.3)',
        padding: 40,
        width: '100%',
        maxWidth: 500,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    avatarIcon: {
        alignItems: 'center',
    },
    avatarHead: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },
    avatarBody: {
        width: 40,
        height: 28,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    uploadButton: {
        backgroundColor: 'rgba(70, 90, 140, 0.8)',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        minWidth: 250,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(100, 130, 180, 0.5)',
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginRight: 10,
    },
    uploadIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadIconText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    documentButton: {
        backgroundColor: 'rgba(40, 70, 110, 0.8)',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 250,
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(80, 120, 170, 0.5)',
        position: 'relative',
    },
    documentButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
        marginRight: 10,
    },
    attachIcon: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    attachIconText: {
        fontSize: 18,
    },
    badgeContainer: {
        position: 'absolute',
        right: -15,
        top: -8,
        flexDirection: 'row',
    },
    badge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0A2647',
    },
    badgeSecond: {
        marginLeft: -8,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
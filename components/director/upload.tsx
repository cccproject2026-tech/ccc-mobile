import { icons } from '@/constants/images';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
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
        <View className='flex justify-center' style={{ width: "100%", margin: "auto", borderRadius: 10 }}>
            <View className='border border-solid w-full rounded-[10px] flex justify-center items-center' style={{ paddingVertical: 52, gap: 38, borderColor: "#FFFFFF26" }}>
                {}
                <View>
                    {profileImage ? (
                        <Image className="w-[100px] h-[100px] mt-auto rounded-full" source={{ uri: profileImage }} />
                    ) : (
                        <Image className="w-auto mt-auto" source={icons.profileUpload} />
                    )}
                </View>

                <View className='flex' style={{ gap: 31 }}>
                    <TouchableOpacity
                        onPress={handleImageUpload}
                        activeOpacity={0.8}
                        className='flex flex-row items-center justify-center border border-solid' style={{
                            height: "100%",
                            maxHeight: 38,
                            gap: 11,
                            maxWidth: 192,
                            width: 192,
                            borderColor: "#FFFFFF14",
                            backgroundColor: "#264387",
                            borderRadius: 10
                        }}>
                        <Text
                            className='text-base font-medium leading-[22px]'
                            style={{
                                fontFamily: "AlbertBold",
                                color: "#FFFFFFE5"
                            }}
                        >
                            Upload Image
                        </Text>
                        <Image
                            source={icons.gradientUpload}
                            style={{ width: 18, height: 18 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDocumentUpload}
                        activeOpacity={0.8}
                        className='flex flex-row items-center justify-center border border-solid' style={{
                            height: "100%",
                            maxHeight: 38,
                            gap: 11,
                            maxWidth: 192,
                            width: 192,
                            borderColor: "#FFFFFF14",
                            backgroundColor: "#14517D",
                            borderRadius: 10
                        }}>
                        <Text
                            className='text-base font-medium leading-[22px]'
                            style={{ fontFamily: "AlbertBold", color: "#FFFFFFE5" }}
                        >
                            Upload documents
                        </Text>
                        <Image
                            source={icons.gradientClip}
                            style={{ width: 18, height: 18 }}
                        />
                        {uploadedDocs.length > 0 && (
                            <View>
                                {uploadedDocs.slice(0, 2).map((doc, index) => (
                                    <Text >{getInitials(index)}</Text>
                                ))}
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
});
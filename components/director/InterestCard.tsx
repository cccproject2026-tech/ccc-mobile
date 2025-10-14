import { Colors } from '@/constants/Colors';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

export type Interest = {
    id: string;
    name: string;
    role: string;
    time: string;
};

type Props = {
    data: Interest;
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onPress?: () => void;
    onWhatsApp?: () => void;
};

const InterestCard: React.FC<Props> = ({
    data,
    onCall,
    onChat,
    onMail,
    onPress,
    onWhatsApp,
}) => {
    const router = useRouter();
    const handleCardPress = () => {
        router.push({
            pathname: '/(director-tabs)/(tabs)/new-interests/interest-details',
            params: { interestId: data.id }
        });
    };

    return (
        <Pressable onPress={handleCardPress} style={styles.card}>
            {/* Avatar Icon */}
            <View style={styles.avatarCircle}>
                <Ionicons
                    name="person-outline"
                    size={isSmallDevice ? 16 : 18}
                    color="#EAF7FF"
                />
            </View>

            {/* Name and Role */}
            <View style={styles.infoBlock}>
                <Text style={styles.name} numberOfLines={1}>
                    {data.name}
                </Text>
                <Text style={styles.role} numberOfLines={1}>
                    {data.role}
                </Text>
            </View>

            {/* Action Icons */}
            <View style={styles.actions}>
                <Pressable hitSlop={12} onPress={onCall}>
                    <Ionicons
                        name="call-outline"
                        size={isSmallDevice ? 16 : 18}
                        color="#EAF7FF"
                    />
                </Pressable>
                <Pressable hitSlop={12} onPress={onChat}>
                    <MaterialCommunityIcons
                        name="message-outline"
                        size={isSmallDevice ? 16 : 18}
                        color="#EAF7FF"
                    />
                </Pressable>
                <Pressable hitSlop={12} onPress={onMail}>
                    <MaterialIcons
                        name="mail-outline"
                        size={isSmallDevice ? 16 : 18}
                        color="#EAF7FF"
                    />
                </Pressable>
                <Pressable hitSlop={12} onPress={onWhatsApp}>
                    <Ionicons
                        name="logo-whatsapp"
                        size={isSmallDevice ? 16 : 18}
                        color="#EAF7FF"
                    />
                </Pressable>
            </View>

            {/* Time */}
            <Text style={styles.time}>{data.time}</Text>

            {/* Chevron */}
            <Pressable hitSlop={12} onPress={onPress}>
                <Ionicons
                    name="chevron-forward"
                    size={isSmallDevice ? 16 : 18}
                    color="#EAF7FF"
                />
            </Pressable>
        </Pressable>
    );
};

export default InterestCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.customBlueOne,
        borderRadius: 12,
        padding: isSmallDevice ? 6 : 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        gap: isSmallDevice ? 6 : 8,
        marginBottom: isSmallDevice ? 8 : 10,
    },
    avatarCircle: {
        width: isSmallDevice ? 44 : 48,
        height: isSmallDevice ? 44 : 48,
        borderRadius: isSmallDevice ? 22 : 24,
        backgroundColor: '#1a5b77',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    infoBlock: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        color: '#EAF7FF',
        fontSize: isSmallDevice ? 15 : 16,
        fontWeight: '600',
        marginBottom: 1,
    },
    role: {
        color: '#CFE9F3',
        fontSize: isSmallDevice ? 12 : 13,
        marginTop: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 3 : 4,
    },
    time: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: isSmallDevice ? 11 : 12,
        marginLeft: isSmallDevice ? 6 : 8,
        flexShrink: 0,
    },
});

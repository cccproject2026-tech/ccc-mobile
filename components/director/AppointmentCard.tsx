import { Colors } from '@/constants/Colors';
import { icons } from '@/constants/images';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    date: string;
    time: string;
    tz: string;
    person: string;
    mode: string;
    platformIcon: any;
    avatar?: any;
    onPressChevron?: () => void;
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
};

const AppointmentCard: React.FC<Props> = ({
    date,
    time,
    tz,
    person,
    mode,
    platformIcon,
    avatar = icons.myProfile,
    onPressChevron,
    onCall,
    onChat,
    onMail,
}) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardInner}>
                <View style={styles.thumbnailWrap}>
                    <Image source={platformIcon} resizeMode="cover" style={styles.thumbnail} />
                </View>

                <View style={styles.content}>
                    <View style={styles.topRow}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.dateTime} numberOfLines={1}>
                                {date}{' '}
                                <Text style={styles.timeHighlight}>Time</Text> {time} hrs {tz}
                            </Text>
                        </View>
                        <Pressable onPress={onPressChevron} hitSlop={12}>
                            <Ionicons name="chevron-forward" size={20} color="#EAF7FF" />
                        </Pressable>
                    </View>

                    <View style={styles.personRow}>
                        <Image source={avatar} style={styles.avatar} />
                        <Text style={styles.personName} numberOfLines={1}>
                            {person}
                        </Text>
                    </View>

                    <View style={styles.modeRow}>
                        <Text style={styles.modeLabel}>
                            Mode :{' '}
                            <Text style={styles.modeValue}>{mode}</Text>
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <Pressable onPress={onCall} hitSlop={12}>
                            <Ionicons name="call-outline" size={20} color="#EAF7FF" />
                        </Pressable>
                        <Pressable onPress={onChat} hitSlop={12}>
                            <MaterialCommunityIcons name="message-outline" size={20} color="#EAF7FF" />
                        </Pressable>
                        <Pressable onPress={onMail} hitSlop={12}>
                            <MaterialIcons name="mail-outline" size={20} color="#EAF7FF" />
                        </Pressable>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.customBlueOne,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: 16,
        padding: 8,
    },
    cardInner: {
        flexDirection: 'row',
        gap: 12,
    },
    thumbnailWrap: {
        width: 85,
        height: 85,
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateTime: {
        color: '#EAF7FF',
        fontSize: 14,
        fontWeight: '600',
    },
    timeHighlight: {
        color: '#d7f96c',
        fontWeight: '700',
    },
    personRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    personName: {
        color: '#EAF7FF',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    modeRow: {
        marginTop: 6,
    },
    modeLabel: {
        color: '#CFE9F3',
        fontSize: 13,
    },
    modeValue: {
        color: '#EAF7FF',
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
    },
});

export default AppointmentCard;

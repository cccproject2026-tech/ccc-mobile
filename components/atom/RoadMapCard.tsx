import { icons } from '@/constants/images';
import { getImageSize, isMediumDevice, isSmallDevice } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


type Props = {

    metricLabel?: string; // "5 Mentees" or "Last Contacted"
    metricValue?: string; // "" or "5 Days Ago"
    avatar?: any;
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    onPress?: () => void;
    data: any
    dataKey: string
};

const RoadMapCard: React.FC<Props> = ({

    metricLabel,
    metricValue,
    avatar = icons.dummyUser,
    onCall,
    onChat,
    onMail,
    onWhatsApp,
    onPress,
    data,
    dataKey
}) => {
    return (
        <View style={styles.card}>

            <View style={styles.leftSection}>
                <Image source={
                    data.title == "Survey" ? icons.Assessments2 : icons.Revitalization2
                } style={styles.avatar} resizeMode="cover" />
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {data.phase} – {data.title}                    </Text>
                    <Text style={styles.role} numberOfLines={1}>
                        Task : {data.title}
                    </Text>
                </View>
            </View>


            <View style={styles.rightSection}>
                {data.status && (
                    <View style={styles.metricContainer}>

                        <Text style={[styles.metricLabel, {
                            color: data.status === 'Due' ? 'yellow' : 'white'
                        }]}>      {data.status}</Text>

                    </View>
                )}
                <Pressable hitSlop={12} onPress={onPress} style={styles.chevronContainer}>
                    <Ionicons
                        name="chevron-forward"
                        size={isSmallDevice ? 16 : 18}
                        color="#EAF7FF"
                    />
                </Pressable>
            </View>
        </View>
    );
};

export default RoadMapCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
        padding: isSmallDevice ? 8 : 10,
        marginBottom: isSmallDevice ? 8 : 10,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 8 : 10,
        flex: 1,
        minWidth: 0, // Prevent overflow
    },
    avatar: {
        width: getImageSize(isSmallDevice ? 16 : isMediumDevice ? 17 : 25),
        height: isSmallDevice ? 16 : isMediumDevice ? 17 : 25,
    },
    info: {
        flex: 1,
        minWidth: 0, // Prevent overflow
    },
    name: {
        color: '#EAF7FF',
        fontSize: isSmallDevice ? 14 : 15,
        fontWeight: '700',
        marginBottom: 2,
        maxWidth: SCREEN_WIDTH * 0.5, // Limit to 40% of screen width
    },
    role: {
        color: '#CFE9F3',
        fontSize: isSmallDevice ? 12 : 13,
        marginBottom: isSmallDevice ? 4 : 6,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 8 : 10,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 4 : 6,
        flexShrink: 0,
        maxWidth: SCREEN_WIDTH * 0.4, // Limit to 40% of screen width
    },
    metricContainer: {
        alignItems: 'flex-end',
        flexShrink: 1,
        minWidth: 0,
    },
    metricLabel: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: isSmallDevice ? 12 : 13,
        textAlign: 'right',
        lineHeight: isSmallDevice ? 12 : 14,
    },
    metricValue: {
        color: '#d7f96c',
        fontWeight: '700',
        fontSize: isSmallDevice ? 10 : 11,
        textAlign: 'right',
        lineHeight: isSmallDevice ? 12 : 14,
    },
    singleMetric: {
        color: '#d7f96c',
        fontWeight: '700',
        fontSize: isSmallDevice ? 10 : 11,
        textAlign: 'right',
        lineHeight: isSmallDevice ? 12 : 14,
    },
    chevronContainer: {
        padding: 2,
        flexShrink: 0,
    },
});

import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;

type Props = {
    onClick?: () => void;
    avatar: any;
    message: string;
    bg?: string;
    borderColor?: string;
};

const WelcomeCard: React.FC<Props> = ({ avatar, message, bg = '#14517d', borderColor = '#fff', onClick }) => {
    return (
        <TouchableOpacity onPress={onClick} style={[styles.container, { backgroundColor: bg, borderColor }]}>
            <View style={styles.content}>
                <Image source={avatar} style={styles.avatar} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default WelcomeCard;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 12,
        padding: isSmallDevice ? 10 : 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: isSmallDevice ? 10 : 12,
    },
    avatar: {
        width: isSmallDevice ? 36 : 40,
        height: isSmallDevice ? 36 : 40,
        borderRadius: isSmallDevice ? 18 : 20,
    },
    message: {
        color: '#e7f6fc',
        fontWeight: '600',
        fontSize: isSmallDevice ? 14 : 15,
        flex: 1,
    },
});

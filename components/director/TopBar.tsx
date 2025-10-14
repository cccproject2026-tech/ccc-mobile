import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO = require('@/assets/logos/CCClogo.png');

type Props = {
    userName?: string;
    showUserName?: boolean;
    notifications?: number;
    showNotifications?: boolean;
    showDrawer?: boolean;
    showBackButton?: boolean;
    size?: number;
    color?: string;
    onProfilePress?: () => void;
};

const TopBar: React.FC<Props> = ({
    userName,
    showUserName = false,
    notifications = 0,
    showNotifications = true,
    showDrawer = true,
    showBackButton = false,
    size = 36,
    color = "#fff",
    onProfilePress,
}) => {
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation();
    const router = useRouter();

    const onMenuPress = () => navigation.dispatch(DrawerActions.openDrawer());
    const handleNotificationsPress = () => router.push('/(director-tabs)/(tabs)/notification');

    return (
        <View style={[styles.headerRow, { paddingTop: top + 10, minHeight: top + 54 }]}>
            {/* Left */}
            <View style={styles.leftIconBox}>
                {showDrawer && (
                    <Pressable hitSlop={10} onPress={onMenuPress}>
                        <Ionicons name="menu" size={size} color={color} />
                    </Pressable>
                )}
                {showBackButton && (
                    <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backButtonBox}>
                        <Ionicons name="arrow-back" size={size - 8} color={color} />
                    </Pressable>
                )}
            </View>
            {/* Center */}
            <View style={styles.centerArea}>
                {showUserName && userName && (
                    <LinearGradient
                        colors={["#7C3AED", "#38BDF8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={styles.innerNameContainer}>
                            <Text style={styles.nameText} numberOfLines={1}>{userName}</Text>
                        </View>
                    </LinearGradient>
                )}
            </View>
            {/* Right */}
            <View style={styles.rightIconBox}>
                {showNotifications && (
                    <Pressable onPress={handleNotificationsPress} hitSlop={10} style={{ position: 'relative', marginRight: 7 }}>
                        <Ionicons name="notifications-outline" size={size - 10} color={color} />
                        {notifications > 0 && (
                            <View style={styles.notificationBadge}>
                                <Text style={styles.notificationBadgeText}>
                                    {notifications > 9 ? '9+' : notifications}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                )}
                <Pressable onPress={onProfilePress} hitSlop={10}>
                    <View style={styles.profileBox}>
                        <Image source={LOGO} style={{ width: 27, height: 27, borderRadius: 15 }} />
                    </View>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        width: "100%",
        backgroundColor: "transparent",
    },
    leftIconBox: {
        // minWidth: 44,
        // alignItems: "flex-start",
        // justifyContent: "center",
        flexDirection: "row",
        flex: 0.2,
    },
    backButtonBox: {
        paddingHorizontal: 4,
    },
    centerArea: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 13,
    },
    innerNameContainer: {
        backgroundColor: "#176192",
        borderRadius: 11,
        paddingVertical: 9,
        paddingHorizontal: 28,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 85,
        maxWidth: 210,
    },
    nameText: {
        color: "#E2E8F0",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    rightIconBox: {
        // minWidth: 55,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        flex: 0.2,
        gap: 8,
    },
    notificationBadge: {
        position: "absolute",
        backgroundColor: "#FACC15",
        width: 18,
        height: 18,
        borderRadius: 9,
        right: -10,
        top: -7,
        alignItems: "center",
        justifyContent: "center",
    },
    notificationBadgeText: {
        color: "#000",
        fontWeight: "700",
        fontSize: 11,
    },
    profileBox: {
        width: 28,
        height: 28,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.65)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
});

export default TopBar;

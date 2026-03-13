import { useAuthStore } from '@/stores';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, getIconSize, getFontSize, isSmallDevice } from '@/utils/responsive';

const LOGO = require('@/assets/logos/CCClogo.png');

type Props = {
    showUserName?: boolean;
    notifications?: number;
    showNotifications?: boolean;
    showDrawer?: boolean;
    showBackButton?: boolean;
    showBackButtonText?: boolean;
    onPressBack?: () => void;
    size?: number;
    color?: string;
    onProfilePress?: () => void;
    role?: string;
    customTitle?: string;
    showSearch?: boolean;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TopBar: React.FC<Props> = ({
    showUserName = false,
    notifications = 0,
    showNotifications = true,
    showDrawer = true,
    showBackButton = false,
    showBackButtonText = false,
    onPressBack,
    size = 36,
    color = "#fff",
    onProfilePress,
    role,
    customTitle
}) => {
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    // Always show search icon for authenticated users. Avoid referencing an undefined `showSearch`.
    const showSearchIcon = !!isAuthenticated;
    
    // Responsive icon sizes
    const menuIconSize = getIconSize(size);
    const searchIconSize = getIconSize(size - 6);
    const notificationIconSize = getIconSize(size - 10);
    const backIconSize = getIconSize(size - 8);
    
    // Calculate max width for name container based on screen width
    const maxNameWidth = Math.min(moderateScale(180), SCREEN_WIDTH * 0.4);
    const onMenuPress = () => navigation.dispatch(DrawerActions.openDrawer());
    const handleNotificationsPress = () => {
        if (role === 'director') {
            router.push('/(director)/(tabs)/notification');
        } else if (role === 'pastor') {
            router.push('/(pastor)/(tabs)/notifications');
        } else {
            router.push('/(mentor)/(tabs)/notifications');
        }
    }

    const handleBackPress = () => {
        if (onPressBack) {
            onPressBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.headerRow, { paddingTop: top + 10, minHeight: top + 54 }]}>
            {/* Left */}
            <View style={styles.leftIconBox}>
                {showDrawer && (
                    <Pressable hitSlop={10} onPress={onMenuPress}>
                        <Ionicons name="menu" size={menuIconSize} color={color} />
                    </Pressable>
                )}
                {showBackButton && (
                    <>
                        {showBackButtonText ? (
                            <Pressable
                                hitSlop={10}
                                onPress={handleBackPress}
                                style={styles.backButtonWithText}
                            >
                                <Ionicons name="chevron-back" size={getIconSize(24)} color="#fff" />
                                <Text style={styles.backButtonTextStyle}>Back</Text>
                            </Pressable>
                        ) : (
                            <Pressable
                                hitSlop={10}
                                onPress={handleBackPress}
                                style={styles.backButtonBox}
                            >
                                <Ionicons name="arrow-back" size={backIconSize} color={color} />
                            </Pressable>
                        )}
                    </>
                )}
            </View>
            {/* Center */}
            <View style={styles.centerArea}>
                {showUserName && (
                    <LinearGradient
                        colors={["#7C3AED", "#38BDF8"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientBorder}
                    >
                        <View style={[styles.innerNameContainer, { maxWidth: maxNameWidth }]}>
                            <Text style={styles.nameText} numberOfLines={1} ellipsizeMode="tail">
                                {customTitle ? customTitle : user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.firstName || user?.lastName || 'User'}
                            </Text>
                        </View>
                    </LinearGradient>
                )}
            </View>
            {/* Right */}
            <View style={styles.rightIconBox}>
                {showSearchIcon && (
                    <Pressable onPress={() => router.push('/search')} hitSlop={10} style={styles.iconButton}>
                        <Ionicons name="search" size={searchIconSize} color={color} />
                    </Pressable>
                )}
                {showNotifications && (
                    <Pressable onPress={handleNotificationsPress} hitSlop={10} style={[styles.iconButton, { position: 'relative' }]}>
                        <Ionicons name="notifications-outline" size={notificationIconSize} color={color} />
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
                        <Image source={LOGO} style={styles.profileImage} />
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
        paddingHorizontal: moderateScale(12),
        width: "100%",
        backgroundColor: "transparent",
    },
    leftIconBox: {
        flexDirection: "row",
        alignItems: "center",
        minWidth: moderateScale(40),
        flexShrink: 0,
    },
    backButtonBox: {
        paddingHorizontal: moderateScale(4),
    },
    backButtonWithText: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(139, 168, 189, 0.8)",
        paddingVertical: moderateScale(8),
        paddingHorizontal: moderateScale(12),
        paddingLeft: moderateScale(8),
        paddingRight: moderateScale(14),
        borderRadius: moderateScale(12),
        gap: moderateScale(6),
        minWidth: moderateScale(80),
    },
    backButtonTextStyle: {
        color: "#fff",
        fontSize: getFontSize(18),
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    centerArea: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: moderateScale(8),
        flexShrink: 1,
    },
    gradientBorder: {
        padding: 2,
        borderRadius: moderateScale(13),
        flexShrink: 1,
    },
    innerNameContainer: {
        backgroundColor: "#176192",
        borderRadius: moderateScale(11),
        paddingVertical: moderateScale(7),
        paddingHorizontal: isSmallDevice ? moderateScale(16) : moderateScale(24),
        alignItems: "center",
        justifyContent: "center",
        minWidth: moderateScale(70),
    },
    nameText: {
        color: "#E2E8F0",
        fontSize: getFontSize(16),
        fontWeight: "600",
        textAlign: "center",
    },
    rightIconBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        minWidth: moderateScale(90),
        flexShrink: 0,
    },
    iconButton: {
        paddingHorizontal: moderateScale(6),
    },
    notificationBadge: {
        position: "absolute",
        backgroundColor: "#FACC15",
        width: moderateScale(16),
        height: moderateScale(16),
        borderRadius: moderateScale(8),
        right: moderateScale(-6),
        top: moderateScale(-5),
        alignItems: "center",
        justifyContent: "center",
    },
    notificationBadgeText: {
        color: "#000",
        fontWeight: "700",
        fontSize: getFontSize(10),
    },
    profileBox: {
        width: moderateScale(26),
        height: moderateScale(26),
        borderRadius: moderateScale(14),
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.65)",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    profileImage: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
    },
});

export default TopBar;

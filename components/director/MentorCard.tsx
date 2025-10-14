import {
    getCardImageSize,
    getFontSize,
    getIconSize,
    getListItemHeight,
    getSpacing,
    isAndroid,
    isSmallDevice
} from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface MentorData {
    id: string;
    name: string;
    role: string;
    menteesCount: number;
    description: string;
    profileImage?: string;
}

interface MentorCardProps {
    mentor: MentorData;
    layout?: 'card' | 'list';
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    onMenuPress?: () => void;
    selectable?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    onPress?: () => void;
}

export default function MentorCard({
    mentor,
    layout = 'card',
    onCall,
    onChat,
    onMail,
    onWhatsApp,
    onMenuPress,
    selectable = false,
    isSelected = false,
    onToggleSelect,
    onPress
}: MentorCardProps) {
    const isSelectionMode = onToggleSelect !== undefined;
    const imageSize = getCardImageSize();
    const listHeight = getListItemHeight();

    if (layout === 'list') {
        // If this card itself should handle presses (selection mode or a provided onPress), use a Pressable.
        // Otherwise render a plain View so a parent Touchable can receive the touch (e.g. when parent wraps this card for navigation).
        if (isSelectionMode || onPress) {
            return (
                <Pressable style={[styles.listContainer, isSelected && styles.selectedCard]}
                    onPress={isSelectionMode ? onToggleSelect : onPress}>

                    <View style={styles.listImageContainer}>
                        {mentor.profileImage ? (
                            <Image
                                source={{ uri: mentor.profileImage }}
                                style={styles.profileImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="person-outline" size={getIconSize(28)} color="#fff" />
                            </View>
                        )}
                    </View>


                    <View style={styles.listInfoSection}>
                        <Text style={styles.listName} numberOfLines={1}>
                            {mentor.name}
                        </Text>
                        <View style={styles.listMenteesContainer}>
                            <View style={styles.menteeDot} />
                            <Text style={styles.listMenteesText}>{mentor.menteesCount} Mentees</Text>
                        </View>
                    </View>


                    <TouchableOpacity style={styles.listIconButton} onPress={onCall}>
                        <Ionicons name="call-outline" size={getIconSize(18)} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listIconButton} onPress={onChat}>
                        <Ionicons name="chatbubble-outline" size={getIconSize(18)} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.listIconButton} onPress={onMail}>
                        <Ionicons name="mail-outline" size={getIconSize(18)} color="#fff" />
                    </TouchableOpacity>
                    {isSelectionMode && !onMenuPress ? (

                        <View style={[styles.listIconButton, {
                            marginLeft: getSpacing(5)
                        }]}>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                            </View>
                        </View>

                    ) : (
                        <TouchableOpacity style={styles.listMenuButton} onPress={onMenuPress}>
                            <Ionicons name="ellipsis-vertical" size={getIconSize(18)} color="#fff" />
                        </TouchableOpacity>
                    )}
                </Pressable>
            );
        }

        return (
            <View style={[styles.listContainer, isSelected && styles.selectedCard]}>

                <View style={styles.listImageContainer}>
                    {mentor.profileImage ? (
                        <Image
                            source={{ uri: mentor.profileImage }}
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="person-outline" size={28} color="#fff" />
                        </View>
                    )}
                </View>


                <View style={styles.listInfoSection}>
                    <Text style={styles.listName} numberOfLines={1}>
                        {mentor.name}
                    </Text>
                    <View style={styles.listMenteesContainer}>
                        <View style={styles.menteeDot} />
                        <Text style={styles.listMenteesText}>{mentor.menteesCount} Mentees</Text>
                    </View>
                </View>


                <TouchableOpacity style={styles.listIconButton} onPress={onCall}>
                    <Ionicons name="call-outline" size={getIconSize(18)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.listIconButton} onPress={onChat}>
                    <Ionicons name="chatbubble-outline" size={getIconSize(18)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.listIconButton} onPress={onMail}>
                    <Ionicons name="mail-outline" size={getIconSize(18)} color="#fff" />
                </TouchableOpacity>


                {isSelectionMode && !onMenuPress ? (

                    <View style={[styles.listIconButton, {
                        marginLeft: getSpacing(5)
                    }]}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                        </View>
                    </View>

                ) : (
                    <TouchableOpacity style={styles.listMenuButton} onPress={onMenuPress}>
                        <Ionicons name="ellipsis-vertical" size={getIconSize(18)} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    // Card Layout (Default)
    // If card should handle presses itself (selection mode or provided onPress), render a TouchableOpacity.
    // Otherwise render a plain View so parent wrappers can handle taps.
    if (isSelectionMode || onPress) {
        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={isSelectionMode ? onToggleSelect : onPress}
            >
                <View style={styles.cardContent}>

                    <View style={[styles.profileImageContainer, {
                        width: imageSize,
                        height: imageSize
                    }]}>
                        {mentor.profileImage ? (
                            <Image
                                source={{ uri: mentor.profileImage }}
                                style={styles.profileImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons name="person-outline" size={imageSize * 0.4} color="#fff" />
                            </View>
                        )}
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.headerRow}>
                            <Text style={styles.mentorName} numberOfLines={1}>
                                {mentor.name}
                            </Text>
                            <View style={styles.menteesContainer}>
                                <View style={styles.menteeDot} />
                                <Text style={styles.menteesText}>
                                    {mentor.menteesCount} Mentees
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.roleText} numberOfLines={1}>
                            -{mentor.role}
                        </Text>

                        <Text style={styles.descriptionText} numberOfLines={2}>
                            {mentor.description}
                        </Text>
                    </View>

                    {isSelectionMode && !onMenuPress ? (
                        <View style={styles.checkboxContainer}>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.menuButton} onPress={(e) => { e.stopPropagation(); onMenuPress && onMenuPress(); }}>
                            <Ionicons name="ellipsis-vertical" size={getIconSize(20)} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.contactIcons}>
                    <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onCall && onCall(); }}>
                        <Ionicons name="call-outline" size={getIconSize(isSmallDevice ? 20 : 22)} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onChat && onChat(); }}>
                        <Ionicons name="chatbubble-outline" size={getIconSize(isSmallDevice ? 20 : 22)} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onMail && onMail(); }}>
                        <Ionicons name="mail-outline" size={getIconSize(isSmallDevice ? 20 : 22)} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onWhatsApp && onWhatsApp(); }}>
                        <Ionicons name="logo-whatsapp" size={getIconSize(isSmallDevice ? 20 : 22)} color="#fff" />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>

                <View style={[styles.profileImageContainer, {
                    width: imageSize,
                    height: imageSize
                }]}>
                    {mentor.profileImage ? (
                        <Image
                            source={{ uri: mentor.profileImage }}
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="person-outline" size={imageSize * 0.4} color="#fff" />
                        </View>
                    )}
                </View>


                <View style={styles.infoSection}>
                    <View style={styles.headerRow}>
                        <Text style={styles.mentorName} numberOfLines={1}>
                            {mentor.name}
                        </Text>
                        <View style={styles.menteesContainer}>
                            <View style={styles.menteeDot} />
                            <Text style={styles.menteesText}>
                                {mentor.menteesCount} Mentees
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.roleText} numberOfLines={1}>
                        -{mentor.role}
                    </Text>

                    <Text style={styles.descriptionText} numberOfLines={2}>
                        {mentor.description}
                    </Text>
                </View>


                {isSelectionMode && !onMenuPress ? (
                    <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.menuButton} onPress={(e) => { e.stopPropagation(); onMenuPress && onMenuPress(); }}>
                        <Ionicons name="ellipsis-vertical" size={getIconSize(18)} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>


            <View style={styles.contactIcons}>
                <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onCall && onCall(); }}>
                    <Ionicons name="call-outline" size={getIconSize(isSmallDevice ? 20 : 22)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onChat && onChat(); }}>
                    <Ionicons name="chatbubble-outline" size={getIconSize(isSmallDevice ? 20 : 22)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onMail && onMail(); }}>
                    <Ionicons name="mail-outline" size={getIconSize(isSmallDevice ? 20 : 22)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onWhatsApp && onWhatsApp(); }}>
                    <Ionicons name="logo-whatsapp" size={getIconSize(isSmallDevice ? 20 : 22)} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Card Layout Styles
    card: {
        backgroundColor: 'rgba(33, 58, 115, 1)',
        borderRadius: getSpacing(16),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        padding: getSpacing(16),
        marginBottom: getSpacing(16),
    },
    selectedCard: {
        borderColor: '#38BDF8',
        borderWidth: 2,
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: getSpacing(16),
    },
    profileImageContainer: {
        borderRadius: getSpacing(12),
        overflow: 'hidden',
        marginRight: getSpacing(12),
        flexShrink: 0,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2A5080',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoSection: {
        flex: 1,
        justifyContent: 'flex-start',
        minWidth: 0,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: getSpacing(4),
    },
    mentorName: {
        fontSize: getFontSize(isSmallDevice ? 16 : 18),
        fontWeight: '600',
        color: '#fff',
        flex: 1,
        marginRight: getSpacing(8),
    },
    menteesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
    },
    menteeDot: {
        width: getSpacing(6),
        height: getSpacing(6),
        borderRadius: getSpacing(3),
        backgroundColor: '#FFC107',
        marginRight: getSpacing(6),
    },
    menteesText: {
        fontSize: getFontSize(isSmallDevice ? 12 : 14),
        fontWeight: '500',
        color: '#FFC107',
    },
    roleText: {
        fontSize: getFontSize(isSmallDevice ? 14 : 15),
        color: '#fff',
        marginBottom: getSpacing(8),
    },
    descriptionText: {
        fontSize: getFontSize(isSmallDevice ? 13 : 14),
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: getFontSize(isSmallDevice ? 18 : 20),
    },
    menuButton: {
        padding: getSpacing(4),
        marginLeft: getSpacing(4),
        alignSelf: 'flex-start',
    },
    contactIcons: {
        flexDirection: 'row',
        gap: getSpacing(8),
    },
    iconButton: {
        width: isAndroid ? getSpacing(32) : getSpacing(isSmallDevice ? 36 : 40),
        height: isAndroid ? getSpacing(32) : getSpacing(isSmallDevice ? 36 : 40),
        alignItems: 'center',
        justifyContent: 'center',
    },

    // List Layout Styles
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(24, 68, 123, 1)',
        borderRadius: getSpacing(16),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        padding: getSpacing(10),
        marginBottom: getSpacing(10),
        minHeight: isAndroid ? getSpacing(58) : getSpacing(68),
    },
    listImageContainer: {
        width: isAndroid ? getSpacing(42) : getSpacing(48),
        height: isAndroid ? getSpacing(42) : getSpacing(48),
        borderRadius: getSpacing(12),
        overflow: 'hidden',
        marginRight: getSpacing(10),
        flexShrink: 0,
    },
    listInfoSection: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
    },
    listName: {
        fontSize: getFontSize(isSmallDevice ? 14 : 15),
        fontWeight: '600',
        color: '#fff',
        marginBottom: getSpacing(3),
    },
    listMenteesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listMenteesText: {
        fontSize: getFontSize(isSmallDevice ? 11 : 12),
        fontWeight: '500',
        color: '#FFC107',
    },
    listContactIcons: {
        flexDirection: 'row',
        gap: getSpacing(4),
        marginLeft: getSpacing(8),
    },
    listIconButton: {
        width: isAndroid ? getSpacing(24) : getSpacing(28),
        height: isAndroid ? getSpacing(24) : getSpacing(28),
        alignItems: 'center',
        justifyContent: 'center',
    },
    listMenuButton: {
        width: isAndroid ? getSpacing(24) : getSpacing(28),
        height: isAndroid ? getSpacing(24) : getSpacing(28),
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    checkbox: {
        width: getSpacing(24),
        height: getSpacing(24),
        borderRadius: getSpacing(6),
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxSelected: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    checkboxContainer: {
        marginLeft: getSpacing(10)
    },
});

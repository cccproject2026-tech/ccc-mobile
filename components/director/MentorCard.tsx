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
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

export interface MentorData {
    id: string;
    name: string;
    role: string;
    menteesCount?: number;
    description: string;
    profileImage?: string;
}

export interface MenuItem {
    key: string;
    title: string;
    destructive?: boolean;
    icon?: { ios?: string; android?: string };
    onSelect: () => void;
}

interface MentorCardProps {
    mentor: MentorData;
    layout?: 'card' | 'list';
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    onMenuPress?: () => void;
    menuItems?: MenuItem[]; // Optional: If provided, shows custom menu. If not, uses onMenuPress
    selectable?: boolean;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    onPress?: () => void;
}

// Reusable ContactIcons component
interface ContactIconsProps {
    layout: 'card' | 'list';
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
}

const ContactIcons: React.FC<ContactIconsProps> = ({ layout, onCall, onChat, onMail, onWhatsApp }) => {
    const isCardLayout = layout === 'card';

    if (isCardLayout) {
        return (
            <View style={styles.contactIcons}>
                <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onCall && onCall(); }}>
                    <Ionicons name="call-outline" size={getIconSize(isSmallDevice ? 18 : 20)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onChat && onChat(); }}>
                    <Ionicons name="chatbubble-outline" size={getIconSize(isSmallDevice ? 18 : 20)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onMail && onMail(); }}>
                    <Ionicons name="mail-outline" size={getIconSize(isSmallDevice ? 18 : 20)} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onWhatsApp && onWhatsApp(); }}>
                    <Ionicons name="logo-whatsapp" size={getIconSize(isSmallDevice ? 18 : 20)} color="#fff" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <TouchableOpacity style={styles.listIconButton} onPress={onCall}>
                <Ionicons name="call-outline" size={getIconSize(16)} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listIconButton} onPress={onChat}>
                <Ionicons name="chatbubble-outline" size={getIconSize(16)} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.listIconButton} onPress={onMail}>
                <Ionicons name="mail-outline" size={getIconSize(16)} color="#fff" />
            </TouchableOpacity>
        </>
    );
};

// Zeego Dropdown Menu Component
const ZeegoDropdownMenu: React.FC<{
    menuItems?: MenuItem[];
    onPressMenu?: () => void;
}> = ({ menuItems, onPressMenu }) => {
    const handleMenuPress = () => {
        if (!menuItems && onPressMenu) {
            onPressMenu();
        }
    };

    if (menuItems) {
        return (
            <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                    <Pressable hitSlop={12} style={styles.menuButton}>
                        <Ionicons name="ellipsis-vertical" size={getIconSize(20)} color="#fff" />
                    </Pressable>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                    {menuItems.map((item) => (
                        item.key.startsWith('separator') ? (
                            <DropdownMenu.Separator key={item.key} />
                        ) : (
                            <DropdownMenu.Item
                                key={item.key}
                                destructive={item.destructive}
                                onSelect={item.onSelect}
                            >
                                <DropdownMenu.ItemTitle>{item.title}</DropdownMenu.ItemTitle>
                                {item.icon && (
                                    <DropdownMenu.ItemIcon
                                        ios={{
                                            name: Platform.OS === 'android' ? item.icon.android || 'ic_menu_view' : item.icon.ios || 'circle',
                                            destructive: item.destructive,
                                        }}
                                    />
                                )}
                            </DropdownMenu.Item>
                        )
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        );
    }

    // Fallback to regular TouchableOpacity for onPressMenu
    return (
        <TouchableOpacity style={styles.menuButton} onPress={(e) => { e.stopPropagation(); handleMenuPress(); }}>
            <Ionicons name="ellipsis-vertical" size={getIconSize(20)} color="#fff" />
        </TouchableOpacity>
    );
};

export default function MentorCard({
    mentor,
    layout = 'card',
    onCall,
    onChat,
    onMail,
    onWhatsApp,
    onMenuPress,
    menuItems,
    selectable = false,
    isSelected = false,
    onToggleSelect,
    onPress
}: MentorCardProps) {
    const isSelectionMode = onToggleSelect !== undefined;
    const imageSize = getCardImageSize() * 0.8; // Make image 20% smaller
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
                        {mentor.menteesCount !== undefined && mentor.menteesCount > 0 && (
                            <View style={styles.listMenteesContainer}>
                                <View style={styles.menteeDot} />
                                <Text style={styles.listMenteesText}>{mentor.menteesCount} Mentees</Text>
                            </View>
                        )}
                    </View>


                    <ContactIcons
                        layout="list"
                        onCall={onCall}
                        onChat={onChat}
                        onMail={onMail}
                    />

                    {isSelectionMode && !onMenuPress && !menuItems ? (

                        <View style={[styles.listIconButton, {
                            marginLeft: getSpacing(5)
                        }]}>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                            </View>
                        </View>

                    ) : (
                        <View style={styles.listMenuButton}>
                            <ZeegoDropdownMenu
                                menuItems={menuItems}
                                onPressMenu={onMenuPress}
                            />
                        </View>
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
                    {mentor.menteesCount !== undefined && mentor.menteesCount > 0 && (
                        <View style={styles.listMenteesContainer}>
                            <View style={styles.menteeDot} />
                            <Text style={styles.listMenteesText}>{mentor.menteesCount} Mentees</Text>
                        </View>
                    )}
                </View>


                <ContactIcons
                    layout="list"
                    onCall={onCall}
                    onChat={onChat}
                    onMail={onMail}
                />

                <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onWhatsApp && onWhatsApp(); }}>
                    <Ionicons name="logo-whatsapp" size={getIconSize(isSmallDevice ? 20 : 22)} color="#fff" />
                </TouchableOpacity>
                {isSelectionMode && !onMenuPress && !menuItems ? (

                    <View style={[styles.listIconButton, {
                        marginLeft: getSpacing(5)
                    }]}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                        </View>
                    </View>

                ) : (
                    <View style={styles.listMenuButton}>
                        <ZeegoDropdownMenu
                            menuItems={menuItems}
                            onPressMenu={onMenuPress}
                        />
                    </View>
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
                            {mentor.menteesCount !== undefined && mentor.menteesCount > 0 && (
                                <View style={styles.menteesContainer}>
                                    <View style={styles.menteeDot} />
                                    <Text style={styles.menteesText}>
                                        {mentor.menteesCount} Mentees
                                    </Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.roleText} numberOfLines={1}>
                            -{mentor.role}
                        </Text>

                        <Text style={styles.descriptionText} numberOfLines={2}>
                            {mentor.description}
                        </Text>
                    </View>

                    {isSelectionMode && !onMenuPress && !menuItems ? (
                        <View style={styles.checkboxContainer}>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                            </View>
                        </View>
                    ) : (
                        <ZeegoDropdownMenu
                            menuItems={menuItems}
                            onPressMenu={onMenuPress}
                        />
                    )}
                </View>

                <ContactIcons
                    layout="card"
                    onCall={onCall}
                    onChat={onChat}
                    onMail={onMail}
                    onWhatsApp={onWhatsApp}
                />
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
                        {mentor.menteesCount !== undefined && mentor.menteesCount > 0 && (
                            <View style={styles.menteesContainer}>
                                <View style={styles.menteeDot} />
                                <Text style={styles.menteesText}>
                                    {mentor.menteesCount} Mentees
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.roleText} numberOfLines={1}>
                        -{mentor.role}
                    </Text>

                    <Text style={styles.descriptionText} numberOfLines={2}>
                        {mentor.description}
                    </Text>
                </View>


                {isSelectionMode && !onMenuPress && !menuItems ? (
                    <View style={styles.checkboxContainer}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                            {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                        </View>
                    </View>
                ) : (
                    <ZeegoDropdownMenu
                        menuItems={menuItems}
                        onPressMenu={onMenuPress}
                    />
                )}
            </View>


            <ContactIcons
                layout="card"
                onCall={onCall}
                onChat={onChat}
                onMail={onMail}
                onWhatsApp={onWhatsApp}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // Card Layout Styles
    card: {
        backgroundColor: 'rgba(33, 58, 115, 1)',
        borderRadius: getSpacing(12),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        padding: getSpacing(12),
        marginBottom: getSpacing(12),
    },
    selectedCard: {
        borderColor: '#38BDF8',
        borderWidth: 2,
    },
    cardContent: {
        flexDirection: 'row',
        marginBottom: getSpacing(12),
    },
    profileImageContainer: {
        borderRadius: getSpacing(10),
        overflow: 'hidden',
        marginRight: getSpacing(10),
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
        flexDirection: 'row'
    },
    iconButton: {
        width: isAndroid ? getSpacing(36) : getSpacing(isSmallDevice ? 30 : 32),
        height: isAndroid ? getSpacing(36) : getSpacing(isSmallDevice ? 30 : 32),
        alignItems: 'center',
        justifyContent: 'center',
    },
    // List Layout Styles
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(24, 68, 123, 1)',
        borderRadius: getSpacing(12),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        padding: isAndroid ? getSpacing(12) : getSpacing(8), // More padding on Android
        marginBottom: getSpacing(8),
        minHeight: isAndroid ? getSpacing(68) : getSpacing(56), // Taller on Android
        // gap: isAndroid ? getSpacing(10) : getSpacing(8), // Add gap between items
    },
    listImageContainer: {
        width: isAndroid ? getSpacing(48) : getSpacing(40), // Larger on Android
        height: isAndroid ? getSpacing(48) : getSpacing(40),
        borderRadius: getSpacing(10),
        overflow: 'hidden',
        marginRight: getSpacing(10),
        flexShrink: 0,
    },
    listInfoSection: {
        flex: 1,
        justifyContent: 'center',
        minWidth: 0,
        marginRight: getSpacing(8), // Add margin for breathing room
    },
    listName: {
        fontSize: getFontSize(isSmallDevice ? 15 : 16), // Slightly larger
        fontWeight: '600',
        color: '#fff',
        marginBottom: getSpacing(4),
    },
    listMenteesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listMenteesText: {
        fontSize: getFontSize(isSmallDevice ? 12 : 13), // Slightly larger
        fontWeight: '500',
        color: '#FFC107',
    },
    listIconButton: {
        width: isAndroid ? getSpacing(36) : getSpacing(24), // Much larger on Android
        height: isAndroid ? getSpacing(36) : getSpacing(24),
        alignItems: 'center',
        justifyContent: 'center',
        // marginLeft: isAndroid ? getSpacing(2) : 0, // Small margin between icons
    },
    listMenuButton: {
        width: isAndroid ? getSpacing(36) : getSpacing(28), // Larger on Android
        height: isAndroid ? getSpacing(36) : getSpacing(28),
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        // marginLeft: isAndroid ? getSpacing(4) : 0,
    },
    checkbox: {
        width: getSpacing(26), // Slightly larger
        height: getSpacing(26),
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

import { icons } from '@/constants/images';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuItem {
    id: string;
    label: string;
    icon: string | any;
    iconType?: 'ionicon' | 'image';
    route?: string;
    badge?: number;
    showChevron?: boolean;
    children?: MenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
    { id: 'new-interests', label: 'New Interests', icon: 'people-outline', route: '/(director-tabs)/(tabs)/new-interests', badge: 6 },
    { id: 'all-mentors', label: 'All Mentors', icon: 'school-outline', route: '/(director-tabs)/(tabs)/mentors' },
    { id: 'all-pastors', label: 'All Pastors', icon: 'people-outline', route: '/(director-tabs)/(tabs)/mentees' },
    { id: 'course-completed', label: 'Course Completed', icon: 'ribbon-outline', route: '/(director-tabs)/(tabs)', badge: 6 },
    { id: 'track-progress', label: 'Track Progress', icon: 'bar-chart-outline', route: '/(director-tabs)/(tabs)/progress-tracker' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar-outline', route: '/(director-tabs)/(tabs)' },
    { id: 'roadmaps', label: 'Revitalization Roadmaps', icon: 'clipboard-outline', route: '/(director-tabs)/(tabs)/revitalization-roadmaps' },
    { id: 'assessments', label: 'Assessments', icon: 'list-outline', route: '/(director-tabs)/(tabs)' },
    { id: 'courses', label: 'Courses', icon: 'book-outline', route: '/(director-tabs)/(tabs)' },
    {
        id: 'ccc',
        label: 'CCC',
        icon: 'flame-outline',
        children: [
            { id: 'micro-grant', label: 'Micro Grant', icon: 'trophy-outline', route: '/(director-tabs)/(tabs)/micro-grant' },
            { id: 'invite-mentor', label: 'Invite to be a Field Mentor', icon: 'person-add-outline', route: '/(director-tabs)/(tabs)' },
            { id: 'interest-form', label: 'Interest Form', icon: 'document-text-outline', route: '/(director-tabs)/(tabs)/new-interests/interest-form' },
            { id: 'products', label: 'Product and Services', icon: 'cart-outline', route: '/(director-tabs)/(tabs)/product-and-services', showChevron: true },
            { id: 'videos', label: 'CCC - Videos', icon: 'videocam-outline', route: '/(director-tabs)/(tabs)', showChevron: true },
            { id: 'contact-details', label: 'CCC - Contact Details', icon: 'call-outline', route: '/(director-tabs)/(tabs)', showChevron: true },
            { id: 'reports', label: 'Reports', icon: 'document-outline', route: '/(director-tabs)/(tabs)' },
        ],
    },
    {
        id: 'profile',
        label: 'Profile',
        icon: 'person-outline',
        children: [
            { id: 'my-profile', label: 'My Profile', icon: icons.myProfile, iconType: 'image', route: '/(director-tabs)/(tabs)/profile' },
            { id: 'documents', label: 'Documents', icon: 'folder-outline', route: '/(director-tabs)/(tabs)/documents' },
            { id: 'notes', label: 'Notes', icon: 'document-text-outline', route: '/(director-tabs)/(tabs' },
        ],
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: 'settings-outline',
        children: [
            { id: 'change-password', label: 'Change Password', icon: 'lock-closed-outline', route: '/(director-tabs)/(tabs)' },
            { id: 'notifications', label: 'Turn Off Notifications', icon: 'notifications-off-outline', route: '/(director-tabs)/(tabs)' },
        ],
    },
    { id: 'logout', label: 'Log out', icon: 'log-out-outline', route: '/' },
];

export default function CustomDrawerContent(props: any) {
    const router = useRouter();
    const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderMenuItem = (item: MenuItem, isNested = false, index: number, totalItems: number) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems[item.id];
        const isLastItem = index === totalItems - 1;

        return (
            <View key={item.id}>
                <TouchableOpacity
                    style={[styles.drawerItem, isNested && styles.nestedItem]}
                    onPress={() => {
                        if (hasChildren) {
                            toggleExpand(item.id);
                        } else if (item.route) {
                            router.push(item.route as any);
                        }
                    }}
                >
                    <View style={styles.drawerItemLeft}>
                        {item.iconType === 'image' ? (
                            <Image source={item.icon} style={styles.itemIcon} />
                        ) : (
                            <Ionicons name={item.icon as any} size={Platform.OS === 'android' ? 20 : 22} color="#0A5A8A" />
                        )}
                        <Text style={styles.drawerLabel}>{item.label}</Text>
                        {item.badge !== undefined && item.badge > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{item.badge}</Text>
                            </View>
                        )}
                    </View>
                    {item.showChevron && !hasChildren && (
                        <Ionicons name="chevron-forward" size={Platform.OS === 'android' ? 16 : 18} color="#999" />
                    )}
                    {hasChildren && (
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={Platform.OS === 'android' ? 18 : 20}
                            color="#0A5A8A"
                        />
                    )}
                </TouchableOpacity>

                {/* Divider after each item except the last one */}
                {!isLastItem && <View style={styles.divider} />}

                {/* Render children if expanded */}
                {hasChildren && isExpanded && (
                    <>
                        {item.children?.map((child, childIndex) => (
                            <View key={child.id}>
                                {renderMenuItem(child, true, childIndex, item.children!.length)}
                            </View>
                        ))}
                    </>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Image source={icons.myProfile} style={styles.avatar} />
                </View>
                <Text style={styles.userName}>David Roe</Text>
                <TouchableOpacity style={styles.logoButton}>
                    <Image
                        source={require('@/assets/logos/CCClogo.png')}
                        style={styles.logoImage}
                    />
                </TouchableOpacity>
            </View>

            {/* Drawer Items */}
            <ScrollView
                style={styles.drawerItemsContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {MENU_ITEMS.map((item, index) => renderMenuItem(item, false, index, MENU_ITEMS.length))}
            </ScrollView>

            {/* Footer - Contact Information */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>Contact Information</Text>
                <View style={styles.contactRow}>
                    <Ionicons name="call" size={Platform.OS === 'android' ? 14 : 16} color="#FFFFFF" />
                    <Text style={styles.contactText}>: 269-471-0159</Text>
                </View>
                <View style={styles.contactRow}>
                    <Ionicons name="mail" size={Platform.OS === 'android' ? 14 : 16} color="#FFFFFF" />
                    <Text style={styles.contactText}>: communitychange@andrews.edu</Text>
                </View>
                <View style={styles.footerLogo}>
                    <Image
                        source={require('@/assets/icons/footerIcon.png')}
                        style={styles.footerLogoImage}
                        resizeMode='contain'
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#14517D',
        paddingTop: Platform.OS === 'android' ? 45 : 50,
        paddingBottom: Platform.OS === 'android' ? 12 : 16,
        paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: Platform.OS === 'android' ? 10 : 12,
    },
    avatar: {
        width: Platform.OS === 'android' ? 44 : 50,
        height: Platform.OS === 'android' ? 44 : 50,
        borderRadius: Platform.OS === 'android' ? 22 : 25,
        backgroundColor: '#E5E5E5',
    },
    userName: {
        flex: 1,
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    logoButton: {
        width: Platform.OS === 'android' ? 32 : 36,
        height: Platform.OS === 'android' ? 32 : 36,
        borderRadius: Platform.OS === 'android' ? 16 : 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: Platform.OS === 'android' ? 24 : 28,
        height: Platform.OS === 'android' ? 24 : 28,
    },
    drawerItemsContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: Platform.OS === 'android' ? 6 : 8,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Platform.OS === 'android' ? 12 : 14,
        paddingHorizontal: Platform.OS === 'android' ? 16 : 20,
    },
    nestedItem: {
        paddingLeft: Platform.OS === 'android' ? 44 : 52,
    },
    drawerItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemIcon: {
        width: Platform.OS === 'android' ? 20 : 22,
        height: Platform.OS === 'android' ? 20 : 22,
        borderRadius: Platform.OS === 'android' ? 10 : 11,
    },
    drawerLabel: {
        fontSize: Platform.OS === 'android' ? 14 : 15,
        marginLeft: Platform.OS === 'android' ? 12 : 14,
        color: '#0A5A8A',
        fontWeight: '500',
        flex: 1,
    },
    badge: {
        backgroundColor: '#0A5A8A',
        borderRadius: Platform.OS === 'android' ? 10 : 12,
        minWidth: Platform.OS === 'android' ? 20 : 24,
        height: Platform.OS === 'android' ? 20 : 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Platform.OS === 'android' ? 6 : 8,
        marginLeft: Platform.OS === 'android' ? 6 : 8,
    },
    badgeText: {
        fontSize: Platform.OS === 'android' ? 11 : 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginHorizontal: Platform.OS === 'android' ? 16 : 20,
    },
    footer: {
        backgroundColor: '#14517D',
        padding: Platform.OS === 'android' ? 16 : 20,
        paddingBottom: Platform.OS === 'android' ? 16 : 20,
    },
    footerTitle: {
        fontSize: Platform.OS === 'android' ? 14 : 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: Platform.OS === 'android' ? 10 : 12,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Platform.OS === 'android' ? 6 : 8,
    },
    contactText: {
        fontSize: Platform.OS === 'android' ? 12 : 13,
        color: '#FFFFFF',
        marginLeft: 4,
    },
    footerLogo: {
        alignItems: 'center',
        marginTop: Platform.OS === 'android' ? 18 : 24,
        paddingBottom: Platform.OS === 'android' ? 8 : 10,
    },
    footerLogoImage: {
        width: Platform.OS === 'android' ? 26 : 30,
        height: Platform.OS === 'android' ? 26 : 30,
        tintColor: '#FFFFFF',
    },
});
import {
    getFontSize,
    getSpacing,
    isAndroid
} from '@/utils/responsive';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface TabItem {
    key: string;
    label: string;
    badge?: number;
}

interface TabSwitcherProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (key: string) => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ tabs, activeTab, onChange }) => {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollContainer}
            >
                {tabs.map((tab, index) => {
                    const isActive = activeTab === tab.key;
                    const hasBadge = tab.badge !== undefined && tab.badge > 0;

                    return (
                        <View
                            key={tab.key}
                            style={[
                                styles.tabWrapper,
                                index > 0 && styles.tabMarginLeft,
                            ]}
                        >
                            <Pressable
                                onPress={() => onChange(tab.key)}
                                style={[
                                    styles.tabButton,
                                    isActive ? styles.activeTabButton : styles.inactiveTabButton,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        isActive ? styles.activeTabText : styles.inactiveTabText
                                    ]}
                                    numberOfLines={1}
                                >
                                    {tab.label}
                                </Text>
                            </Pressable>

                            {/* Badge only shows on ACTIVE tab with count */}
                            {isActive && hasBadge && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {tab.badge}
                                    </Text>
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: getSpacing(16),
    },
    scrollContainer: {
        flexGrow: 0,
    },
    scrollContent: {
        paddingHorizontal: getSpacing(16),
        paddingVertical: getSpacing(4), // Add vertical padding for badge space
    },
    tabWrapper: {
        position: 'relative', // Added wrapper for badge positioning
    },
    tabButton: {
        paddingHorizontal: getSpacing(isAndroid ? 16 : 20),
        paddingVertical: getSpacing(12),
        borderRadius: getSpacing(isAndroid ? 12 : 14),
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        // minHeight: getSpacing(isAndroid ? 44 : 48),
    },
    tabMarginLeft: {
        marginLeft: getSpacing(8),
    },
    activeTabButton: {
        backgroundColor: '#fff',
    },
    inactiveTabButton: {
        backgroundColor: '#14517D',
    },
    tabText: {
        textAlign: 'center',
        fontSize: getFontSize(isAndroid ? 13 : 15),
        fontWeight: '600',
    },
    activeTabText: {
        color: '#1a5b77',
    },
    inactiveTabText: {
        color: '#fff',
    },
    badge: {
        position: 'absolute',
        top: getSpacing(-4),
        right: getSpacing(-4),
        backgroundColor: '#1a5b77',
        minWidth: getSpacing(isAndroid ? 22 : 24),
        height: getSpacing(isAndroid ? 22 : 24),
        borderRadius: getSpacing(isAndroid ? 11 : 12),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: getSpacing(6),
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        fontSize: getFontSize(isAndroid ? 10 : 11),
        fontWeight: 'bold',
        color: '#fff',
    },
});

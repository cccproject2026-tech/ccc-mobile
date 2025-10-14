import {
    getFontSize,
    getIconSize,
    getSpacing,
    isAndroid
} from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ActionItem {
    icon: string;
    label: string;
    onPress: () => void;
}

export interface ActionBottomSheetProps {
    title: string;
    subtitle?: string;
    image?: string;
    actions: ActionItem[];
    onClose: () => void;
    colorScheme?: {
        background?: string;
        text?: string;
        accent?: string;
    };
}

const ActionBottomSheet = forwardRef<BottomSheetModal, ActionBottomSheetProps>(
    (
        {
            title,
            subtitle,
            image,
            actions,
            onClose,
            colorScheme = {
                background: '#1E3A6F',
                text: '#FFFFFF',
                accent: '#FFC107',
            },
        },
        ref
    ) => {
        const { bottom } = useSafeAreaInsets();
        const snapPoints = useMemo(() => ['85%'], []);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                    pressBehavior="close"
                />
            ),
            []
        );

        return (
            <BottomSheetModal
                ref={ref}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={[styles.bottomSheetBackground, { backgroundColor: colorScheme.background }]}
                handleIndicatorStyle={styles.handleIndicator}
                onDismiss={onClose}
            >
                <BottomSheetView style={[styles.contentContainer, { paddingBottom: bottom + 20 }]}>
                    {/* Close Button */}
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={getIconSize(28)} color={colorScheme.text} />
                    </Pressable>

                    {/* Header */}
                    <View style={[styles.header, { borderColor: colorScheme.text + '40' }]}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profilePlaceholder, { backgroundColor: colorScheme.text + '20' }]}>
                                <Ionicons name="person" size={getIconSize(32)} color={colorScheme.text} />
                            </View>
                        )}
                        <View style={styles.headerInfo}>
                            <Text style={[styles.title, { color: colorScheme.text }]}>{title}</Text>
                            {subtitle ? (
                                <View style={styles.subtitleContainer}>
                                    <View style={[styles.dot, { backgroundColor: colorScheme.accent }]} />
                                    <Text style={[styles.subtitle, { color: colorScheme.accent }]}>{subtitle}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.menuContainer}>
                        {actions.map((item, index) => (
                            <Pressable
                                key={index}
                                style={styles.menuItem}
                                onPress={() => {
                                    onClose();
                                    item.onPress();
                                }}
                            >
                                <Ionicons name={item.icon as any} size={getIconSize(24)} color={colorScheme.text} />
                                <Text style={[styles.menuItemText, { color: colorScheme.text }]}>{item.label}</Text>
                            </Pressable>
                        ))}
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetBackground: {
        borderTopLeftRadius: getSpacing(20),
        borderTopRightRadius: getSpacing(20),
    },
    handleIndicator: {
        display: 'none',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: getSpacing(20),
    },
    closeButton: {
        position: 'absolute',
        top: getSpacing(20),
        right: getSpacing(20),
        zIndex: 10,
        width: getSpacing(isAndroid ? 36 : 40),
        height: getSpacing(isAndroid ? 36 : 40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: getSpacing(isAndroid ? 16 : 20),
        paddingHorizontal: getSpacing(16),
        marginBottom: getSpacing(16),
        borderWidth: 1,
        borderRadius: getSpacing(16),
        marginTop: getSpacing(16),
    },
    profileImage: {
        width: getSpacing(isAndroid ? 50 : 60),
        height: getSpacing(isAndroid ? 50 : 60),
        borderRadius: getSpacing(isAndroid ? 25 : 30),
        marginRight: getSpacing(16),
    },
    profilePlaceholder: {
        width: getSpacing(isAndroid ? 50 : 60),
        height: getSpacing(isAndroid ? 50 : 60),
        borderRadius: getSpacing(isAndroid ? 25 : 30),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: getSpacing(16),
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: getFontSize(isAndroid ? 18 : 20),
        fontWeight: '700',
        marginBottom: getSpacing(6),
    },
    subtitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: getSpacing(6),
        height: getSpacing(6),
        borderRadius: getSpacing(3),
        marginRight: getSpacing(8),
    },
    subtitle: {
        fontSize: getFontSize(16),
        fontWeight: '600',
    },
    menuContainer: {
        flex: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: getSpacing(isAndroid ? 14 : 18),
        paddingHorizontal: getSpacing(16),
    },
    menuItemText: {
        fontSize: getFontSize(isAndroid ? 16 : 18),
        fontWeight: '500',
        marginLeft: getSpacing(20),
    },
});

export default ActionBottomSheet;

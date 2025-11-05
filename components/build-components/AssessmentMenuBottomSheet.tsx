import { Assessment } from "@/lib/assessments/types";
import { getFontSize, getIconSize, getSpacing, isIOS, moderateScale } from "@/utils/responsive";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AssessmentMenuBottomSheetProps {
    assessment: Assessment | null;
    onClose: () => void;
    onAssignTo?: (assessment: Assessment) => void;
    onEditSurvey?: (assessment: Assessment) => void;
    onDeleteSurvey?: (assessment: Assessment) => void;
}

const AssessmentMenuBottomSheet = forwardRef<BottomSheetModal, AssessmentMenuBottomSheetProps>(
    ({ assessment, onClose, onAssignTo, onEditSurvey, onDeleteSurvey }, ref) => {
        const { bottom } = useSafeAreaInsets();
        const snapPoints = useMemo(() => ["40%"], []);
        const internalRef = useRef<BottomSheetModal>(null);

        const fontCompress = isIOS ? 0.92 : 1;
        const spacingCompress = isIOS ? 0.85 : 1;
        const imageCompress = isIOS ? 0.92 : 1;

        // Forward the ref
        useImperativeHandle(ref, () => internalRef.current as BottomSheetModal, []);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.7}
                    pressBehavior="close"
                />
            ),
            []
        );

        const handleAssignTo = () => {
            if (assessment) {
                onAssignTo?.(assessment);
                onClose();
            }
        };

        const handleEditSurvey = () => {
            if (assessment) {
                onEditSurvey?.(assessment);
                onClose();
            }
        };

        const handleDeleteSurvey = () => {
            if (assessment) {
                onDeleteSurvey?.(assessment);
                onClose();
            }
        };

        const handleClose = () => {
            internalRef.current?.dismiss();
            onClose();
        };

        return (
            <BottomSheetModal
                ref={internalRef}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.bottomSheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
                onDismiss={onClose}
            >
                <BottomSheetView style={styles.bottomSheetView}>
                    <LinearGradient
                        colors={["#1B2B60", "#155C93", "#176192"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={[styles.contentContainer, { paddingBottom: bottom + 20 }]}
                    >
                        {/* Close Button */}
                        <Pressable style={styles.closeButton} onPress={handleClose}>
                            <Ionicons name="close" size={getIconSize(28)} color="#FFFFFF" />
                        </Pressable>

                        {/* Assessment Header */}
                        {assessment && (
                            <>
                                <View style={styles.header}>
                                    <View
                                        style={{
                                            width: moderateScale(60 * imageCompress),
                                            height: moderateScale(60 * imageCompress),
                                            borderRadius: moderateScale(30 * imageCompress),
                                            backgroundColor: "#00ABAE",
                                            borderWidth: moderateScale(3),
                                            borderColor: "#BFFEFE",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: getSpacing(12 * spacingCompress),
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: "#001B4A",
                                                fontSize: getFontSize(24 * fontCompress),
                                                fontWeight: "800",
                                            }}
                                        >
                                            {assessment.type}
                                        </Text>
                                    </View>
                                    <View style={styles.headerInfo}>
                                        <Text style={styles.title} numberOfLines={2}>
                                            {assessment.title}
                                        </Text>
                                    </View>
                                </View>

                                {/* Menu Items */}
                                <View style={styles.menuContainer}>
                                    <Pressable style={styles.menuItem} onPress={handleAssignTo}>
                                        <Ionicons name="share-outline" size={getIconSize(24)} color="#FFFFFF" />
                                        <Text style={styles.menuItemText}>Assign to</Text>
                                    </Pressable>

                                    <Pressable style={styles.menuItem} onPress={handleEditSurvey}>
                                        <Ionicons name="pencil-outline" size={getIconSize(24)} color="#FFFFFF" />
                                        <Text style={styles.menuItemText}>Edit Survey</Text>
                                    </Pressable>

                                    <Pressable style={styles.menuItem} onPress={handleDeleteSurvey}>
                                        <Ionicons name="trash-outline" size={getIconSize(24)} color="#FFFFFF" />
                                        <Text style={styles.menuItemText}>Delete Survey</Text>
                                    </Pressable>
                                </View>
                            </>
                        )}
                    </LinearGradient>
                </BottomSheetView>
            </BottomSheetModal>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetBackground: {
        borderTopLeftRadius: getSpacing(20),
        borderTopRightRadius: getSpacing(20),
        backgroundColor: "transparent",
    },
    handleIndicator: {
        display: "none",
    },
    bottomSheetView: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: getSpacing(20),
        paddingTop: getSpacing(40),
    },
    closeButton: {
        position: "absolute",
        top: getSpacing(20),
        right: getSpacing(20),
        zIndex: 10,
        width: getSpacing(40),
        height: getSpacing(40),
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: getSpacing(16),
        paddingHorizontal: getSpacing(16),
        marginBottom: getSpacing(20),
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: getSpacing(16),
        backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: getFontSize(16),
        fontWeight: "700",
        color: "#FFFFFF",
        lineHeight: getFontSize(22),
    },
    menuContainer: {
        gap: getSpacing(4),
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: getSpacing(18),
        paddingHorizontal: getSpacing(16),
    },
    menuItemText: {
        fontSize: getFontSize(18),
        fontWeight: "500",
        color: "#FFFFFF",
        marginLeft: getSpacing(20),
    },
});

AssessmentMenuBottomSheet.displayName = "AssessmentMenuBottomSheet";

export default AssessmentMenuBottomSheet;


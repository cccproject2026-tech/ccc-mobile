import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React, { forwardRef, useCallback, useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
}

const GRADIENT_COLORS = ["#0F3B5C", "#1A4F7A", "#2389C2"] as const;

const ActionBottomSheet = forwardRef<BottomSheetModal, ActionBottomSheetProps>(
  ({ title, subtitle, image, actions, onClose }, ref) => {
    const { bottom } = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["55%", "70%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          pressBehavior="close"
        />
      ),
      []
    );

    const handlePress = (fn: () => void) => {
      onClose();
      setTimeout(() => fn(), 200);
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        onDismiss={onClose}
        enableDynamicSizing={false}
      >
        <BottomSheetView style={{ flex: 1 }}>
          <LinearGradient
            colors={[...GRADIENT_COLORS]}
            style={[styles.gradient, { paddingBottom: bottom + 20 }]}
          >
            {/* Close */}
            <View style={styles.closeBtn}>
              <Pressable onPress={onClose} hitSlop={8}>
                <View style={styles.closeBtnBg}>
                  <Ionicons name="close" size={18} color="rgba(255,255,255,0.9)" />
                </View>
              </Pressable>
            </View>

            {/* Header */}
            <View style={styles.header}>
              {image ? (
                <Image source={{ uri: image }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person-outline" size={28} color="rgba(255,255,255,0.7)" />
                </View>
              )}
              <View style={styles.headerText}>
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Actions */}
            <View style={styles.actionsWrap}>
              {actions.map((item, i) => (
                <Pressable
                  key={i}
                  onPress={() => handlePress(item.onPress)}
                  style={({ pressed }) => [
                    styles.actionRow,
                    pressed && styles.actionRowPressed,
                  ]}
                >
                  <View style={styles.actionRowInner}>
                    <View style={styles.actionIcon}>
                      <Ionicons name={item.icon as any} size={20} color="#fff" />
                    </View>
                    <Text style={styles.actionLabel}>{item.label}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="rgba(255,255,255,0.3)"
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </LinearGradient>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default ActionBottomSheet;

const styles = StyleSheet.create({
  sheetBg: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#0F3B5C",
  },
  handle: {
    backgroundColor: "rgba(255,255,255,0.3)",
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 16,
    zIndex: 10,
  },
  closeBtnBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 16,
    paddingRight: 44,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
  },
  headerText: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.65)",
    marginTop: 3,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 8,
  },
  actionsWrap: {gap: 10},
  actionRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
  },
  actionRowPressed: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionRowInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginRight: 14,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

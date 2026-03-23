import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface PastorFocusRoute {
  pathname: string;
  params?: Record<string, string>;
}

export interface PastorFocusItem {
  id: string;
  title: string;
  description: string;
  meta?: string;
  accentColor?: string;
  route: PastorFocusRoute;
}

export interface PastorFocusSection {
  id: string;
  title: string;
  emptyMessage: string;
  items: PastorFocusItem[];
}

interface PastorFocusBottomSheetProps {
  title?: string;
  sections: PastorFocusSection[];
  isLoading?: boolean;
  onClose?: () => void;
  onNewMeeting?: () => void;
  onSelectItem: (item: PastorFocusItem) => void;
}

const PastorFocusBottomSheet = forwardRef<
  BottomSheetModal,
  PastorFocusBottomSheetProps
>(({ title = "Things to focus on", sections, isLoading = false, onClose, onNewMeeting, onSelectItem }, ref) => {
  const { bottom } = useSafeAreaInsets();
  const { dismiss } = useBottomSheetModal();
  const snapPoints = useMemo(() => ["82%"], []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.65}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      enablePanDownToClose
      handleComponent={null}
      backgroundStyle={styles.background}
    >
      <View style={styles.floatingCloseWrap}>
        <Pressable style={styles.floatingCloseButton} onPress={() => dismiss()}>
          <Ionicons name="close" size={32} color="#FFFFFF" />
        </Pressable>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.headerDivider} />
          <Text style={styles.subtitle}>
            Focus on these items first to keep your journey moving.
          </Text>
          {!!onNewMeeting && (
            <Pressable style={styles.newMeetingButton} onPress={onNewMeeting}>
              <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.newMeetingButtonText}>New Meeting</Text>
            </Pressable>
          )}
        </View>

        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            {isLoading ? (
              <>
                {[0, 1].map((i) => (
                  <View key={`${section.id}-skeleton-${i}`} style={styles.itemRow}>
                    <View style={styles.timelineColumn}>
                      <View style={styles.timelineDot} />
                      <View style={styles.timelineLine} />
                    </View>
                    <View style={styles.itemCard}>
                      <View style={styles.skeletonTitle} />
                      <View style={styles.skeletonLine} />
                      <View style={[styles.skeletonLine, { width: "58%" }]} />
                    </View>
                  </View>
                ))}
              </>
            ) : section.items.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>{section.emptyMessage}</Text>
              </View>
            ) : (
              section.items.map((item, index) => {
                const isPrimary = index === 0;

                return (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={styles.timelineColumn}>
                      <View
                        style={[
                          styles.timelineDot,
                          isPrimary && styles.timelineDotPrimary,
                        ]}
                      />
                      {index !== section.items.length - 1 ? (
                        <View style={styles.timelineLine} />
                      ) : null}
                    </View>

                    <Pressable
                      style={[styles.itemCard, isPrimary && styles.itemCardPrimary]}
                      onPress={() => onSelectItem(item)}
                    >
                      <View style={styles.itemHeader}>
                        <Text
                          style={[
                            styles.itemTitle,
                            isPrimary && styles.itemTitlePrimary,
                          ]}
                        >
                          {item.title}
                        </Text>
                        <View style={styles.openBadge}>
                          <Text style={styles.openText}>Open</Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.itemDescription,
                          isPrimary && styles.itemDescriptionPrimary,
                        ]}
                      >
                        {item.description}
                      </Text>

                      {!!item.meta && (
                        <View style={styles.metaPill}>
                          <Text style={styles.itemMeta}>{item.meta}</Text>
                        </View>
                      )}

                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: isPrimary ? "22%" : "8%" },
                          ]}
                        />
                      </View>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

PastorFocusBottomSheet.displayName = "PastorFocusBottomSheet";

const styles = StyleSheet.create({
  background: {
    backgroundColor: Colors.lightBlueGradientOne,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 14,
  },
  floatingCloseWrap: {
    position: "absolute",
    top: -56,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99,
  },
  floatingCloseButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(9, 20, 42, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(220, 236, 255, 0.35)",
  },
  headerRow: {
    gap: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },
  headerDivider: {
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(190, 220, 255, 0.25)",
    marginTop: 4,
  },
  subtitle: {
    color: "rgba(225, 241, 255, 0.85)",
    fontSize: 12,
    lineHeight: 18,
  },
  newMeetingButton: {
    alignSelf: "flex-start",
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(58, 136, 229, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(190, 220, 255, 0.45)",
  },
  newMeetingButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: "#E9F5FF",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  timelineColumn: {
    width: 22,
    alignItems: "center",
    paddingTop: 14,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(92, 123, 162, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(223, 237, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotPrimary: {
    backgroundColor: "#3A88E5",
    borderColor: "#A7D1FF",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 8,
    marginBottom: -4,
    backgroundColor: "rgba(156, 195, 236, 0.4)",
  },
  itemCard: {
    flex: 1,
    backgroundColor: "#1B4C81",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(200, 225, 255, 0.18)",
    padding: 12,
    gap: 6,
  },
  itemCardPrimary: {
    borderColor: "#A5D3FF",
    backgroundColor: "#215A97",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  itemDescription: {
    color: "rgba(226, 239, 255, 0.92)",
    fontSize: 14,
    lineHeight: 21,
  },
  itemTitlePrimary: {
    color: "#FFFFFF",
  },
  itemDescriptionPrimary: {
    color: "rgba(226, 239, 255, 0.92)",
  },
  openBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(7, 24, 53, 0.35)",
  },
  openText: {
    color: "#DDE9F7",
    fontSize: 12,
    fontWeight: "700",
  },
  metaPill: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(200, 225, 255, 0.35)",
    backgroundColor: "rgba(8, 29, 64, 0.25)",
  },
  itemMeta: {
    color: "#D4E9FF",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  emptyCard: {
    backgroundColor: "rgba(15, 47, 92, 0.55)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(196, 221, 249, 0.2)",
  },
  emptyText: {
    color: "rgba(220, 237, 255, 0.82)",
    fontSize: 14,
    lineHeight: 20,
  },
  progressTrack: {
    marginTop: 6,
    height: 9,
    borderRadius: 999,
    backgroundColor: "rgba(230, 238, 250, 0.3)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#34C759",
  },
  skeletonTitle: {
    height: 16,
    width: "70%",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  skeletonLine: {
    height: 12,
    width: "86%",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.16)",
    marginTop: 8,
  },
});

export { PastorFocusBottomSheet };
export default PastorFocusBottomSheet;

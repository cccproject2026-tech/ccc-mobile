import AppGradientBackground from "@/components/layout/AppGradientBackground";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  /** When set, home focus opens this URL directly (e.g. mentorship join link). */
  joinUrl?: string;
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
  subtitle?: string;
  sections: PastorFocusSection[];
  isLoading?: boolean;
  onClose?: () => void;
  onNewMeeting?: () => void;
  onSelectItem: (item: PastorFocusItem) => void;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated pressable card for each focus item */
function FocusItemCard({
  item,
  isPrimary,
  isLast,
  onPress,
}: {
  item: PastorFocusItem;
  isPrimary: boolean;
  isLast: boolean;
  onPress: () => void;
}) {
  const scale = useMemo(() => new Animated.Value(1), []);

  const handlePressIn = () =>
    Animated.spring(scale, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();

  return (
    <View style={styles.itemRow}>
      {/* Timeline column */}
      <View style={styles.timelineColumn}>
        <View style={[styles.timelineDot, isPrimary && styles.timelineDotPrimary]}>
          {isPrimary && (
            <View style={styles.timelineDotInner} />
          )}
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Card */}
      <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.itemCard, isPrimary && styles.itemCardPrimary]}
        >
          {/* Header row */}
          <View style={styles.itemHeader}>
            <Text
              style={[styles.itemTitle, isPrimary && styles.itemTitlePrimary]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <View style={[styles.openBadge, isPrimary && styles.openBadgePrimary]}>
              <Text style={styles.openText}>Open</Text>
              <Ionicons name="arrow-forward" size={11} color="#DDE9F7" />
            </View>
          </View>

          {/* Description */}
          <Text
            style={[
              styles.itemDescription,
              isPrimary && styles.itemDescriptionPrimary,
            ]}
            numberOfLines={3}
          >
            {item.description}
          </Text>

          {/* Meta pill */}
          {!!item.meta && (
            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={11} color="#A8CFFF" />
              <Text style={styles.itemMeta}>{item.meta}</Text>
            </View>
          )}

        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

/** Skeleton placeholder row */
function SkeletonRow({ id }: { id: string | number }) {
  return (
    <View key={`skeleton-${id}`} style={styles.itemRow}>
      <View style={styles.timelineColumn}>
        <View style={[styles.timelineDot, styles.skeletonDot]} />
        <View style={styles.timelineLine} />
      </View>
      <View style={[styles.itemCard, styles.skeletonCard]}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: "55%" }]} />
        <View style={[styles.skeletonLine, { width: "30%", marginTop: 4 }]} />
      </View>
    </View>
  );
}

/** Empty state card */
function EmptyCard({ message }: { message: string }) {
  return (
    <View style={styles.emptyCard}>
      <Ionicons
        name="checkmark-circle-outline"
        size={28}
        color="rgba(130, 190, 255, 0.6)"
      />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PastorFocusBottomSheet = forwardRef<
  BottomSheetModal,
  PastorFocusBottomSheetProps
>(
  (
    {
      title = "Things to focus on",
      subtitle = "Focus on these items first to keep your journey moving forward.",
      sections,
      isLoading = false,
      onClose,
      onNewMeeting,
      onSelectItem,
    },
    ref,
  ) => {
    const { bottom } = useSafeAreaInsets();
    const { dismiss } = useBottomSheetModal();
    const snapPoints = useMemo(() => ["82%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.72}
          pressBehavior="close"
        />
      ),
      [],
    );

    // Total item count across all sections
    const totalItems = sections.reduce((acc, s) => acc + s.items.length, 0);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={onClose}
        enablePanDownToClose
        handleComponent={null}
        backgroundComponent={() => null}
      >
        <AppGradientBackground style={styles.sheetGradient}>
        {/* Floating close button above the sheet */}
        <View style={styles.floatingCloseWrap}>
          <Pressable
            style={styles.floatingCloseButton}
            onPress={() => dismiss()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Drag indicator */}
        <View style={styles.dragHandle} />

        <BottomSheetScrollView
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.headerBlock}>
            <View style={styles.headerTopRow}>
              <View style={styles.headerIconWrap}>
                <Ionicons name="compass" size={18} color="#7EC8FF" />
              </View>
              {!isLoading && totalItems > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{title}</Text>

            <View style={styles.headerDivider} />

            <Text style={styles.subtitle}>{subtitle}</Text>

            {/* New Meeting CTA */}
            {!!onNewMeeting && (
              <TouchableOpacity
                style={styles.newMeetingButton}
                onPress={onNewMeeting}
                activeOpacity={0.82}
              >
                <View style={styles.newMeetingIconWrap}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.newMeetingButtonText}>Schedule New Meeting</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Sections ── */}
          {sections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.section}>
              {/* Section header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {!isLoading && section.items.length > 0 && (
                  <View style={styles.sectionCount}>
                    <Text style={styles.sectionCountText}>
                      {section.items.length}
                    </Text>
                  </View>
                )}
              </View>

              {/* Items */}
              {isLoading ? (
                [0, 1].map((i) => <SkeletonRow key={`${section.id}-sk-${i}`} id={i} />)
              ) : section.items.length === 0 ? (
                <EmptyCard message={section.emptyMessage} />
              ) : (
                section.items.map((item, index) => (
                  <FocusItemCard
                    key={item.id}
                    item={item}
                    isPrimary={index === 0}
                    isLast={index === section.items.length - 1}
                    onPress={() => onSelectItem(item)}
                  />
                ))
              )}
            </View>
          ))}
        </BottomSheetScrollView>
        </AppGradientBackground>
      </BottomSheetModal>
    );
  },
);

PastorFocusBottomSheet.displayName = "PastorFocusBottomSheet";

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_RADIUS = 18;
const ACCENT = "#3A88E5";

const styles = StyleSheet.create({
  // ── Sheet shell (matches pastor home `Colors.appBgGradient`) ──
  sheetGradient: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  dragHandle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(190, 220, 255, 0.28)",
    marginTop: 12,
    marginBottom: 4,
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 20,
  },

  // ── Floating close ──
  floatingCloseWrap: {
    position: "absolute",
    top: -52,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99,
  },
  floatingCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 59, 92, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(220, 236, 255, 0.28)",
  },

  // ── Header block ──
  headerBlock: {
    gap: 8,
    paddingTop: 4,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(62, 140, 230, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(126, 200, 255, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: "rgba(58, 136, 229, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(90, 165, 255, 0.35)",
  },
  countBadgeText: {
    color: "#90CAFF",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  headerDivider: {
    height: 1,
    borderRadius: 999,
    backgroundColor: "rgba(150, 200, 255, 0.18)",
    marginVertical: 2,
  },
  subtitle: {
    color: "rgba(200, 225, 255, 0.72)",
    fontSize: 13,
    lineHeight: 19,
  },
  newMeetingButton: {
    alignSelf: "flex-start",
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  newMeetingIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  newMeetingButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // ── Section ──
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: "#C8DEFF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  sectionCount: {
    width: 20,
    height: 20,
    borderRadius: 99,
    backgroundColor: "rgba(58, 136, 229, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCountText: {
    color: "#90CAFF",
    fontSize: 11,
    fontWeight: "800",
  },

  // ── Timeline ──
  itemRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  timelineColumn: {
    width: 20,
    alignItems: "center",
    paddingTop: 16,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(80, 115, 160, 0.6)",
    borderWidth: 1.5,
    borderColor: "rgba(180, 215, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotPrimary: {
    backgroundColor: ACCENT,
    borderColor: "#A7D1FF",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  timelineDotInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FFFFFF",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 6,
    marginBottom: -4,
    backgroundColor: "rgba(130, 180, 230, 0.22)",
    borderRadius: 1,
  },

  // ── Item card ──
  itemCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: "rgba(180, 215, 255, 0.13)",
    padding: 14,
    gap: 7,
  },
  itemCardPrimary: {
    backgroundColor: "rgba(58, 136, 229, 0.14)",
    borderColor: "rgba(120, 185, 255, 0.38)",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    color: "rgba(220, 238, 255, 0.92)",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  itemTitlePrimary: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  itemDescription: {
    color: "rgba(190, 220, 255, 0.72)",
    fontSize: 13,
    lineHeight: 20,
  },
  itemDescriptionPrimary: {
    color: "rgba(215, 237, 255, 0.88)",
  },
  openBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(200,225,255,0.15)",
    flexShrink: 0,
  },
  openBadgePrimary: {
    backgroundColor: "rgba(58, 136, 229, 0.28)",
    borderColor: "rgba(120, 190, 255, 0.45)",
  },
  openText: {
    color: "#DDE9F7",
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Meta pill ──
  metaPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(180, 220, 255, 0.22)",
    backgroundColor: "rgba(8, 29, 64, 0.3)",
  },
  itemMeta: {
    color: "#A8CFFF",
    fontSize: 11,
    fontWeight: "700",
  },


  // ── Empty state ──
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(14, 44, 88, 0.45)",
    borderRadius: CARD_RADIUS,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(180, 220, 255, 0.14)",
  },
  emptyText: {
    flex: 1,
    color: "rgba(200, 225, 255, 0.7)",
    fontSize: 13,
    lineHeight: 19,
  },

  // ── Skeleton ──
  skeletonDot: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "transparent",
  },
  skeletonCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  skeletonTitle: {
    height: 14,
    width: "65%",
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  skeletonLine: {
    height: 10,
    width: "85%",
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.09)",
    marginTop: 7,
  },
});

export { PastorFocusBottomSheet };
export default PastorFocusBottomSheet;
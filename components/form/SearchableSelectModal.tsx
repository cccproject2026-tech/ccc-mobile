import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoadmapSearchField } from "@/components/ui/design-system/RoadmapSearchField";

export type SelectOption = {
    label: string;
    value: string;
};

type SearchableSelectModalProps = {
    visible: boolean;
    title: string;
    options: SelectOption[];
    selectedValue?: string;
    onSelect: (value: string) => void;
    onClose: () => void;
    searchPlaceholder?: string;
    emptyMessage?: string;
};

export default function SearchableSelectModal({
    visible,
    title,
    options,
    selectedValue,
    onSelect,
    onClose,
    searchPlaceholder = "Search...",
    emptyMessage = "No results found",
}: SearchableSelectModalProps) {
    const { top, bottom } = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredOptions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(q)
        );
    }, [options, searchQuery]);

    const handleClose = () => {
        setSearchQuery("");
        onClose();
    };

    const handleSelect = (value: string) => {
        setSearchQuery("");
        onSelect(value);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
            onShow={() => setSearchQuery("")}
        >
            <View style={[styles.container, { paddingTop: top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{title}</Text>
                    <TouchableOpacity
                        onPress={handleClose}
                        style={styles.closeButton}
                        hitSlop={8}
                    >
                        <Ionicons name="close" size={26} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <RoadmapSearchField
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={searchPlaceholder}
                    />
                </View>

                <FlatList
                    data={filteredOptions}
                    keyExtractor={(item) => item.value}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: bottom + 16 },
                    ]}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>{emptyMessage}</Text>
                    }
                    renderItem={({ item }) => {
                        const isSelected = item.value === selectedValue;
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.optionItem,
                                    isSelected && styles.itemSelected,
                                ]}
                                onPress={() => handleSelect(item.value)}
                            >
                                <View style={styles.radio}>
                                    {isSelected && (
                                        <View style={styles.radioSelected} />
                                    )}
                                </View>
                                <Text style={styles.itemText}>{item.label}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D3B6E",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.15)",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    listContent: {
        paddingHorizontal: 16,
        flexGrow: 1,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.08)",
    },
    itemSelected: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 8,
    },
    itemText: {
        flex: 1,
        fontSize: 15,
        color: "#fff",
        marginLeft: 12,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    radioSelected: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
    emptyText: {
        color: "rgba(255,255,255,0.6)",
        textAlign: "center",
        marginTop: 32,
        fontSize: 15,
    },
});

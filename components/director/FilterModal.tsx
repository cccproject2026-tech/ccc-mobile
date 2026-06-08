import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';

export type FilterOption = {
    label: string;
    options?: string[];
    isExpandable?: boolean;
};

type FilterModalProps = {
    visible: boolean;
    onClose: () => void;
    selectedFilter: string;
    onFilterSelect: (filter: string) => void;
    filterOptions: FilterOption[];
    title?: string;
};

const FilterModal: React.FC<FilterModalProps> = ({
    visible,
    onClose,
    selectedFilter,
    onFilterSelect,
    filterOptions,
    title = 'Filters',
}) => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const handleFilterSelect = (filter: string) => {
        onFilterSelect(filter);
        const selectedOption = filterOptions.find(f =>
            f.label === filter || f.options?.includes(filter)
        );
        if (!selectedOption?.isExpandable && !selectedOption?.options) {
            onClose();
        }
    };

    const handleClearSort = () => {
        onFilterSelect('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="items-center justify-center flex-1 bg-black/50"
                onPress={onClose}
            >
                <Pressable
                    style={{
                        width: '90%',
                        maxWidth: Platform.OS === 'android' ? 350 : 400,
                        backgroundColor: '#fff',
                        borderRadius: Platform.OS === 'android' ? 16 : 20,
                    }}
                    onPress={(e) => e.stopPropagation()}
                >
                    {}
                    {filterOptions.map((filterOption, index) => (
                        <View
                            key={index}
                            style={{
                                padding: Platform.OS === 'android' ? 16 : 24,
                                borderBottomWidth: index < filterOptions.length - 1 ? 1 : 0,
                                borderBottomColor: '#e5e7eb',
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: Platform.OS === 'android' ? 12 : 16,
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#1a5b77',
                                        fontSize: Platform.OS === 'android' ? 16 : 20,
                                        fontWeight: '600',
                                    }}
                                >
                                    {filterOption.label}
                                </Text>
                                {filterOption.isExpandable || filterOption.options ? (
                                    <Pressable
                                        onPress={() => setExpandedSection(
                                            expandedSection === filterOption.label ? null : filterOption.label
                                        )}
                                        style={{
                                            width: Platform.OS === 'android' ? 36 : 48,
                                            height: Platform.OS === 'android' ? 36 : 48,
                                            borderRadius: Platform.OS === 'android' ? 8 : 12,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: expandedSection === filterOption.label ? '#1a5b77' : 'transparent',
                                            borderWidth: 2,
                                            borderColor: '#1a5b77',
                                        }}
                                    >
                                        <Ionicons
                                            name={expandedSection === filterOption.label ? 'chevron-up' : 'chevron-down'}
                                            size={Platform.OS === 'android' ? 18 : 24}
                                            color={expandedSection === filterOption.label ? '#fff' : '#1a5b77'}
                                        />
                                    </Pressable>
                                ) : (
                                    <Pressable
                                        onPress={() => handleFilterSelect(filterOption.label)}
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: Platform.OS === 'android' ? 20 : 24,
                                            height: Platform.OS === 'android' ? 20 : 24,
                                            backgroundColor: '#d1d5db',
                                            borderWidth: 2,
                                            borderColor: '#9ca3af',
                                            borderRadius: Platform.OS === 'android' ? 10 : 12,
                                        }}
                                    >
                                        {selectedFilter === filterOption.label && (
                                            <View
                                                style={{
                                                    width: Platform.OS === 'android' ? 10 : 12,
                                                    height: Platform.OS === 'android' ? 10 : 12,
                                                    backgroundColor: '#1a5b77',
                                                    borderRadius: Platform.OS === 'android' ? 5 : 6,
                                                }}
                                            />
                                        )}
                                    </Pressable>
                                )}
                            </View>

                            {}
                            {(filterOption.isExpandable || filterOption.options) &&
                                expandedSection === filterOption.label && (
                                    <View>
                                        {filterOption.options?.map((option, optIndex) => (
                                            <Pressable
                                                key={optIndex}
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    paddingVertical: Platform.OS === 'android' ? 8 : 12,
                                                }}
                                                onPress={() => handleFilterSelect(option)}
                                            >
                                                <View
                                                    style={{
                                                        width: Platform.OS === 'android' ? 20 : 24,
                                                        height: Platform.OS === 'android' ? 20 : 24,
                                                        borderRadius: Platform.OS === 'android' ? 10 : 12,
                                                        borderWidth: 2,
                                                        marginRight: Platform.OS === 'android' ? 12 : 16,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderColor: selectedFilter === option ? '#1a5b77' : '#9ca3af',
                                                        backgroundColor: selectedFilter === option ? '#1a5b77' : '#d1d5db',
                                                    }}
                                                >
                                                    {selectedFilter === option && (
                                                        <View
                                                            style={{
                                                                width: Platform.OS === 'android' ? 8 : 10,
                                                                height: Platform.OS === 'android' ? 8 : 10,
                                                                backgroundColor: '#fff',
                                                                borderRadius: Platform.OS === 'android' ? 4 : 5,
                                                            }}
                                                        />
                                                    )}
                                                </View>
                                                <Text
                                                    style={{
                                                        color: '#1a5b77',
                                                        fontSize: Platform.OS === 'android' ? 14 : 18,
                                                        fontWeight: '500',
                                                    }}
                                                >
                                                    {option}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                        </View>
                    ))}

                    {}
                    <View
                        style={{
                            padding: Platform.OS === 'android' ? 16 : 24,
                            borderTopWidth: 1,
                            borderTopColor: '#e5e7eb',
                        }}
                    >
                        <Pressable
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: Platform.OS === 'android' ? 8 : 12,
                            }}
                            onPress={handleClearSort}
                        >
                            <View
                                style={{
                                    width: Platform.OS === 'android' ? 20 : 24,
                                    height: Platform.OS === 'android' ? 20 : 24,
                                    marginRight: Platform.OS === 'android' ? 12 : 16,
                                    backgroundColor: '#d1d5db',
                                    borderWidth: 2,
                                    borderColor: '#9ca3af',
                                    borderRadius: Platform.OS === 'android' ? 10 : 12,
                                }}
                            />
                            <Text
                                style={{
                                    color: '#1a5b77',
                                    fontSize: Platform.OS === 'android' ? 14 : 18,
                                    fontWeight: '500',
                                }}
                            >
                                Clear Sort
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default FilterModal;
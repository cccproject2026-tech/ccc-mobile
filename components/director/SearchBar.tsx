import { icons } from '@/constants/images';
import React from 'react';
import { Image, Platform, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface SearchBarProps extends Omit<TextInputProps, 'onChange'> {
    value: string;
    onChangeValue: (q: string) => void;
    placeholder?: string;
    style?: object;
    backgroundColor?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChangeValue,
    placeholder = "Search",
    style,
    backgroundColor = '#14517D',
    ...inputProps
}) => (
    <View style={[styles.wrapper, { backgroundColor }]}>
        <TextInput
            value={value}
            onChangeText={onChangeValue}
            placeholder={placeholder}
            placeholderTextColor="#e1e8f0"
            style={[styles.input, style]}
            {...inputProps}
        />
        <Image source={icons.search} style={styles.icon} />
    </View>
);

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Platform.OS === 'android' ? 12 : 16,
        // backgroundColor: '#14517D',
        borderColor: '#d0edf8',
        borderWidth: 1,
        paddingHorizontal: Platform.OS === 'android' ? 14 : 18,
        paddingVertical: Platform.OS === 'android' ? 0 : 11,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: Platform.OS === 'android' ? 14 : 16,
        backgroundColor: 'transparent',
    },
    icon: {
        marginLeft: Platform.OS === 'android' ? 8 : 10,
        width: Platform.OS === 'android' ? 22 : 26,
        height: Platform.OS === 'android' ? 22 : 26,
        tintColor: '#fff',
    },
});
export default SearchBar;

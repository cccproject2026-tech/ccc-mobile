// ChecklistCard.tsx
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

type ChecklistCardProps = {
  items: string[];
  selectable?: boolean;
  selectedIndices?: number[];
  defaultSelectedIndices?: number[];
  onSelectionChange?: (indices: number[]) => void;
  containerStyle?: ViewStyle;
  itemTextStyle?: TextStyle;
};

export function ChecklistCard({
  items,
  selectable = true,
  selectedIndices,
  defaultSelectedIndices = [],
  onSelectionChange,
  containerStyle,
  itemTextStyle,
}: ChecklistCardProps) {
  const isControlled = selectedIndices !== undefined;
  const [internalSelected, setInternalSelected] = useState<number[]>(
    isControlled ? selectedIndices! : defaultSelectedIndices
  );

  useEffect(() => {
    if (isControlled) setInternalSelected(selectedIndices || []);
  }, [isControlled, selectedIndices]);

  const toggle = useCallback(
    (index: number) => {
      if (!selectable) return;
      const current = isControlled ? selectedIndices || [] : internalSelected;
      const exists = current.includes(index);
      const next = exists ? current.filter((i) => i !== index) : [...current, index];
      if (!isControlled) setInternalSelected(next);
      onSelectionChange?.(next);
    },
    [internalSelected, isControlled, onSelectionChange, selectable, selectedIndices]
  );

  // 3–5 color palette
  const theme = useMemo(
    () => ({
      outline: '#FFFFFF73',
      text: '#EAF3F7',
      checkboxBase: '#D9D9D9',
      accent: '#5EB3D1',
    }),
    []
  );

  return (
    <View style={[styles.card, { borderColor: theme.outline }, containerStyle]}>

      {items.map((text, idx) => {
        const checked = internalSelected.includes(idx);
        return (
          <Pressable
            key={idx}
            onPress={() => toggle(idx)}
            disabled={!selectable}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            className='flex flex-row items-start'
          >
            {/* Checkbox */}
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: theme.checkboxBase,
                  borderColor: checked ? theme.accent : 'rgba(0,0,0,0.12)',
                },
              ]}
            >
              {checked ? (
                <MaterialIcons name="check" size={18} color="#0E2C3A" />
              ) : null}
            </View>

            {/* Text */}
            <Text
              style={[
                styles.text,
                { color: theme.text },
                itemTextStyle,
              ]}
              className='font-medium text-[15px] leading-[22px]'
            >
              {text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    margin: 16
  },

  rowSpacing: {
    marginBottom: 22,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  text: {
    flex: 1,
    flexShrink: 1, // allow wrapping on multiple lines without pushing checkbox to next line
    fontSize: 16,
    lineHeight: 24,
  },
});
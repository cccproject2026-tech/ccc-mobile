import React, { useState } from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: 'DD/MM/YY' | 'DD/MM/YYYY' | 'MM/DD/YY' | 'MM/DD/YYYY';
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select Date',
  minDate,
  maxDate,
  format = 'DD/MM/YY',
  containerStyle,
  inputStyle,
  textStyle
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const yearShort = String(year).slice(-2);

    switch (format) {
      case 'DD/MM/YY':
        return `${day} / ${month} / ${yearShort}`;
      case 'DD/MM/YYYY':
        return `${day} / ${month} / ${year}`;
      case 'MM/DD/YY':
        return `${month} / ${day} / ${yearShort}`;
      case 'MM/DD/YYYY':
        return `${month} / ${day} / ${year}`;
      default:
        return `${day} / ${month} / ${yearShort}`;
    }
  };

  const handleDateChange = (type: 'day' | 'month' | 'year', delta: number) => {
    const newDate = new Date(selectedDate);
    
    if (type === 'day') {
      newDate.setDate(newDate.getDate() + delta);
    } else if (type === 'month') {
      newDate.setMonth(newDate.getMonth() + delta);
    } else if (type === 'year') {
      newDate.setFullYear(newDate.getFullYear() + delta);
    }

    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;

    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    onChange(selectedDate);
    setIsVisible(false);
  };

  const handleOpen = () => {
    setSelectedDate(value || new Date());
    setIsVisible(true);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.input, inputStyle]}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <Text style={[styles.dateText, textStyle]}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.pickerContainer}>
              {/* Day Picker */}
              <View style={styles.column}>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => handleDateChange('day', 1)}
                >
                  <Text style={styles.arrowText}>▲</Text>
                </TouchableOpacity>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {String(selectedDate.getDate()).padStart(2, '0')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => handleDateChange('day', -1)}
                >
                  <Text style={styles.arrowText}>▼</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.separator}>/</Text>

              {/* Month Picker */}
              <View style={styles.column}>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => handleDateChange('month', 1)}
                >
                  <Text style={styles.arrowText}>▲</Text>
                </TouchableOpacity>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {String(selectedDate.getMonth() + 1).padStart(2, '0')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => handleDateChange('month', -1)}
                >
                  <Text style={styles.arrowText}>▼</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.separator}>/</Text>

              {/* Year Picker */}
              <View style={styles.column}>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => handleDateChange('year', 1)}
                >
                  <Text style={styles.arrowText}>▲</Text>
                </TouchableOpacity>
                <View style={styles.valueContainer}>
                  <Text style={styles.valueText}>
                    {format.includes('YYYY')
                      ? selectedDate.getFullYear()
                      : String(selectedDate.getFullYear()).slice(-2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => handleDateChange('year', -1)}
                >
                  <Text style={styles.arrowText}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // width: '100%',
  },
  input: {
    borderWidth: 2,
    borderColor: '#8BA3C7',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2C4A7C',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  column: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButton: {
    padding: 12,
  },
  arrowText: {
    color: '#8BA3C7',
    fontSize: 20,
    fontWeight: 'bold',
  },
  valueContainer: {
    backgroundColor: '#3A5A99',
    borderWidth: 2,
    borderColor: '#8BA3C7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minWidth: 70,
    alignItems: 'center',
    marginVertical: 8,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
  },
  separator: {
    color: '#8BA3C7',
    fontSize: 32,
    fontWeight: '300',
    marginHorizontal: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8BA3C7',
  },
  cancelButtonText: {
    color: '#8BA3C7',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4A7BC8',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomDatePicker;

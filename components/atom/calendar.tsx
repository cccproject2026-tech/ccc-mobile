import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ColorValue, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

interface GradientCalendarProps {
  selected: string;
  setSelected: (date: string) => void;
  containerStyle?: ViewStyle;
  gradientColors?: string[];
  showDateTime?: boolean;
}

const GradientCalendar: React.FC<GradientCalendarProps> = ({
  selected,
  setSelected,
  containerStyle,
  gradientColors = ["#244889", "#0D255E"],
  showDateTime = true
}) => {
  const handleDayPress = (day: DateData): void => {
    setSelected(day.dateString);
  };

  const renderHeader = (date?: Date): React.ReactElement => {
    const headerDate = date || new Date();
    return (
      <View style={styles.monthHeader}>
        <Text style={styles.monthText}>
          {headerDate.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={[{ height: 340 }, containerStyle]}>
      <LinearGradient colors={gradientColors as [ColorValue, ColorValue, ...ColorValue[]]} style={styles.container}>
        <View style={styles.calendarWrapper}>
          <Calendar
            onDayPress={handleDayPress}
            markingType="custom"
            markedDates={{
              [selected]: {
                customStyles: {
                  container: {
                    borderWidth: 2,
                    borderColor: "white",
                    borderRadius: 20,
                  },
                  text: { color: "white", fontWeight: "bold" },
                },
              },
            }}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: "#fff",
              selectedDayBackgroundColor: "#FFD700",
              todayTextColor: "#FFD700",
              dayTextColor: "#fff",
              arrowColor: "transparent",
              monthTextColor: "#FFD700",
              textDisabledColor: "rgba(255,255,255,0.5)",
            }}
            renderHeader={() => showDateTime ? renderHeader() : null}
            hideArrows={true}
            disableArrowLeft={true}
            disableArrowRight={true}
            hideDayNames={false}
            hideExtraDays={true}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    borderRadius: 10
  },
  calendarWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden"
  },
  monthHeader: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    backgroundColor: "#213a73",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff"
  },
});

export default GradientCalendar;
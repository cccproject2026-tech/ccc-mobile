/**
 * ========================================================================
 * GRADIENT CALENDAR - USAGE EXAMPLES & DOCUMENTATION
 * ========================================================================
 * 
 * A fully reusable calendar component with support for:
 * - Specific available dates
 * - Recurring availability (weekly, monthly, custom)
 * - Booked/unavailable dates
 * - Past date disabling
 * - Date range restrictions
 * - Current date marking
 * 
 * Perfect for: Scheduling, Appointments, Availability Management
 * ========================================================================
 */

import GradientCalendar from '@/components/atom/calendar'; // Adjust import path
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// ========================================================================
// EXAMPLE 1: SPECIFIC AVAILABLE DATES
// ========================================================================
// Use Case: You have specific dates when appointments are available
// Works across multiple months
// ========================================================================
export const Example1_SpecificDates = () => {
    const [selectedDate, setSelectedDate] = useState('2024-08-05');

    // Define specific dates that are available for booking
    // All other dates will be disabled
    const availableDates = [
        // August 2024
        '2024-08-05',
        '2024-08-08',
        '2024-08-14',
        '2024-08-22',

        // September 2024
        '2024-09-02',
        '2024-09-10',
        '2024-09-15',
        '2024-09-25',

        // October 2024
        '2024-10-01',
        '2024-10-12',
        '2024-10-20',
        '2024-10-28',
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 1: Specific Available Dates</Text>
            <Text style={styles.description}>
                Only predefined dates are selectable. Navigate months freely.
            </Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                availableDates={availableDates}
                disablePastDates={true} // Can't select past dates
                showHeader={true}
                markToday={true}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
        </View>
    );
};

// ========================================================================
// EXAMPLE 2: WEEKLY RECURRING AVAILABILITY
// ========================================================================
// Use Case: Available every Monday, Wednesday, Friday
// Automatically applies pattern to all months
// ========================================================================
export const Example2_WeeklyRecurring = () => {
    const [selectedDate, setSelectedDate] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 2: Weekly Recurring (Mon, Wed, Fri)</Text>
            <Text style={styles.description}>
                Available on specific days of the week, recurring forever.
            </Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                recurringAvailability={{
                    type: 'weekly',
                    // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
                    daysOfWeek: [1, 3, 5], // Monday, Wednesday, Friday
                }}
                disablePastDates={true}
                showHeader={true}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
        </View>
    );
};

// ========================================================================
// EXAMPLE 3: MONTHLY RECURRING AVAILABILITY
// ========================================================================
// Use Case: Available on 1st, 15th, and last day of every month
// ========================================================================
export const Example3_MonthlyRecurring = () => {
    const [selectedDate, setSelectedDate] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 3: Monthly Recurring (1st, 15th, 30th)</Text>
            <Text style={styles.description}>
                Available on specific days of the month, every month.
            </Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                recurringAvailability={{
                    type: 'monthly',
                    daysOfMonth: [1, 15, 30, 31], // 1st, 15th, and last days
                }}
                disablePastDates={true}
                showHeader={true}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
        </View>
    );
};

// ========================================================================
// EXAMPLE 4: CUSTOM RECURRING LOGIC (WEEKDAYS ONLY)
// ========================================================================
// Use Case: Available Monday to Friday, excluding weekends
// Custom function for complex availability rules
// ========================================================================
export const Example4_CustomRecurring = () => {
    const [selectedDate, setSelectedDate] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 4: Custom Logic (Weekdays Only)</Text>
            <Text style={styles.description}>
                Available Monday-Friday using custom function.
            </Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                recurringAvailability={{
                    type: 'custom',
                    // Custom function to determine availability
                    customCheck: (dateStr) => {
                        const date = new Date(dateStr);
                        const dayOfWeek = date.getDay();
                        // Return true for Monday (1) to Friday (5)
                        return dayOfWeek >= 1 && dayOfWeek <= 5;
                    },
                }}
                disablePastDates={true}
                showHeader={true}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
        </View>
    );
};

// ========================================================================
// EXAMPLE 5: RECURRING + BOOKED SLOTS (UNAVAILABLE DATES)
// ========================================================================
// Use Case: Recurring availability but some slots are already booked
// Combines recurring pattern with specific unavailable dates
// ========================================================================
export const Example5_RecurringWithBookings = () => {
    const [selectedDate, setSelectedDate] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 5: Recurring + Booked Slots</Text>
            <Text style={styles.description}>
                Available Mon-Fri, but some dates are already booked.
            </Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                recurringAvailability={{
                    type: 'weekly',
                    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
                }}
                // These dates are unavailable even though they match the pattern
                unavailableDates={[
                    '2024-08-05', // Already booked
                    '2024-08-12', // Holiday
                    '2024-08-19', // Fully booked
                    '2024-08-26', // Team meeting
                    '2024-09-02', // Labor Day
                    '2024-09-16', // Booked
                ]}
                disablePastDates={true}
                showHeader={true}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
        </View>
    );
};

// ========================================================================
// EXAMPLE 6: VIEW PAST APPOINTMENTS (ALLOW PAST DATES)
// ========================================================================
// Use Case: View and select past appointments/dates
// Useful for viewing history or rescheduling past appointments
// ========================================================================
export const Example6_AllowPastDates = () => {
    const [selectedDate, setSelectedDate] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 6: View Past Appointments</Text>
            <Text style={styles.description}>
                Can select past dates. Current date marked with red dot.
            </Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                disablePastDates={false} // Allow selecting past dates
                markToday={true} // Show red dot on today
                showHeader={true}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
        </View>
    );
};

// ========================================================================
// EXAMPLE 7: DATE RANGE RESTRICTION (NEXT 3 MONTHS ONLY)
// ========================================================================
// Use Case: Limit bookings to next 3 months
// Combines recurring availability with date range limits
// ========================================================================
export const Example7_DateRangeRestriction = () => {
    const [selectedDate, setSelectedDate] = useState('');

    // Calculate date range
    const today = new Date();
    const threeMonthsLater = new Date(today);
    threeMonthsLater.setMonth(today.getMonth() + 3);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 7: Limited to Next 3 Months</Text>
            <Text style={styles.description}>
                Recurring Mon/Wed/Fri but only for next 3 months.
            </Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                recurringAvailability={{
                    type: 'weekly',
                    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
                }}
                minDate={today.toISOString().split('T')[0]}
                maxDate={threeMonthsLater.toISOString().split('T')[0]}
                disablePastDates={true}
                showHeader={true}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
            <Text style={styles.info}>
                Range: {today.toLocaleDateString()} - {threeMonthsLater.toLocaleDateString()}
            </Text>
        </View>
    );
};

// ========================================================================
// EXAMPLE 8: COMBINED AVAILABILITY (SPECIFIC + RECURRING)
// ========================================================================
// Use Case: Mix specific dates with recurring pattern
// If specific dates provided, recurring is ignored
// ========================================================================
export const Example8_CombinedAvailability = () => {
    const [selectedDate, setSelectedDate] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 8: Specific Dates Override Recurring</Text>
            <Text style={styles.description}>
                When both provided, specific dates take priority.
            </Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                // Specific dates take priority over recurring
                availableDates={[
                    '2024-08-05',
                    '2024-08-12',
                    '2024-08-19',
                ]}
                // This will be ignored because availableDates is provided
                recurringAvailability={{
                    type: 'weekly',
                    daysOfWeek: [1, 3, 5],
                }}
                disablePastDates={true}
                showHeader={true}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
        </View>
    );
};

// ========================================================================
// EXAMPLE 9: CUSTOM STYLING & NO HEADER
// ========================================================================
// Use Case: Integrate calendar into custom UI design
// Hide header and use custom gradient colors
// ========================================================================
export const Example9_CustomStyling = () => {
    const [selectedDate, setSelectedDate] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 9: Custom Styling</Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                recurringAvailability={{
                    type: 'weekly',
                    daysOfWeek: [1, 2, 3, 4, 5], // Weekdays
                }}
                gradientColors={["#2a5298", "#1e3a5f"]} // Custom gradient
                showHeader={false} // Hide "Select Available Date" header
                disablePastDates={true}
                markToday={false} // Don't mark today
                containerStyle={{ marginVertical: 20 }}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
        </View>
    );
};

// ========================================================================
// EXAMPLE 10: ADVANCED - BUSINESS HOURS AVAILABILITY
// ========================================================================
// Use Case: Available weekdays, excluding holidays and specific dates
// Real-world scheduling scenario
// ========================================================================
export const Example10_BusinessHours = () => {
    const [selectedDate, setSelectedDate] = useState('');

    // Company holidays
    const holidays = [
        '2024-09-02', // Labor Day
        '2024-11-28', // Thanksgiving
        '2024-12-25', // Christmas
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Example 10: Business Hours Availability</Text>
            <Text style={styles.description}>
                Weekdays only, excluding holidays and booked dates.
            </Text>

            <GradientCalendar
                selected={selectedDate}
                setSelected={setSelectedDate}
                recurringAvailability={{
                    type: 'custom',
                    customCheck: (dateStr) => {
                        const date = new Date(dateStr);
                        const dayOfWeek = date.getDay();
                        // Monday to Friday only
                        return dayOfWeek >= 1 && dayOfWeek <= 5;
                    },
                }}
                unavailableDates={[
                    ...holidays,
                    // Already booked slots
                    '2024-08-15',
                    '2024-08-22',
                    '2024-08-29',
                ]}
                disablePastDates={true}
                showHeader={true}
                markToday={true}
            />

            <Text style={styles.result}>Selected: {selectedDate || 'None'}</Text>
        </View>
    );
};

// ========================================================================
// PROPS REFERENCE
// ========================================================================
/**
 * REQUIRED PROPS:
 * - selected: string                    Current selected date (YYYY-MM-DD)
 * - setSelected: (date: string) => void Callback when date is selected
 * 
 * AVAILABILITY PROPS:
 * - availableDates?: string[]           Specific available dates (takes priority)
 * - unavailableDates?: string[]         Specific unavailable/booked dates
 * - recurringAvailability?: {           Recurring availability pattern
 *     type: 'weekly' | 'monthly' | 'custom'
 *     daysOfWeek?: number[]             For weekly (0-6, 0=Sunday)
 *     daysOfMonth?: number[]            For monthly (1-31)
 *     customCheck?: (date: string) => boolean  For custom logic
 *   }
 * 
 * BEHAVIOR PROPS:
 * - disablePastDates?: boolean          Default: true (can't select past)
 * - showHeader?: boolean                Default: true (show "Select Available Date")
 * - markToday?: boolean                 Default: true (red dot on today)
 * - minDate?: string                    Minimum selectable date (YYYY-MM-DD)
 * - maxDate?: string                    Maximum selectable date (YYYY-MM-DD)
 * 
 * STYLING PROPS:
 * - gradientColors?: string[]           Default: ["#1a4d7a", "#0d2847"]
 * - containerStyle?: ViewStyle          Custom container styling
 */

// ========================================================================
// STYLES
// ========================================================================
const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 32,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 16,
    },
    result: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    info: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 8,
    },
});

// ========================================================================
// MAIN DEMO COMPONENT - ALL EXAMPLES IN ONE SCROLLABLE VIEW
// ========================================================================
export default function GradientCalendarDemo() {
    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: '#0a1929' }}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 }}>
                    Gradient Calendar Examples
                </Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>
                    Complete usage documentation with 10 real-world examples
                </Text>
            </View>

            <Example1_SpecificDates />
            <Example2_WeeklyRecurring />
            <Example3_MonthlyRecurring />
            <Example4_CustomRecurring />
            <Example5_RecurringWithBookings />
            <Example6_AllowPastDates />
            <Example7_DateRangeRestriction />
            <Example8_CombinedAvailability />
            <Example9_CustomStyling />
            <Example10_BusinessHours />
        </ScrollView>
    );
}

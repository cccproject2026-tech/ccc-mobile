import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportingProceduresScreen() {
    const router = useRouter();
    const [checkboxes, setCheckboxes] = useState({
        reviewed: false,
        discuss: false,
        other: false,
    });
    const [otherText, setOtherText] = useState('Lorem ipsum dolor sit amet');

    const toggleCheckbox = (key: keyof typeof checkboxes) => {
        setCheckboxes(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleReject = () => {
        console.log('Rejected');
        router.back();
    };

    const handleAccept = () => {
        console.log('Accepted');
        // Navigate to next page or show success
    };

    const handleAddToPending = () => {
        console.log('Add to Pending');
        router.back();
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={styles.container}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.topBar}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="white" />
                            <Text style={styles.backText}>Back</Text>
                        </TouchableOpacity>
                        <View style={styles.topBarIcons}>
                            <View style={styles.notificationBadge}>
                                <Ionicons name="notifications-outline" size={24} color="white" />
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>3</Text>
                                </View>
                            </View>
                            <Ionicons name="person-circle-outline" size={28} color="white" />
                        </View>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.headerContainer}>
                            <LinearGradient
                                colors={['#7B2FF7', '#00D4FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBorder}
                            >
                                <View style={styles.headerCard}>
                                    <Text style={styles.headerText}>
                                        The Center for Community Change{'\n'}
                                        Micro-Grant Application
                                    </Text>
                                </View>
                            </LinearGradient>
                        </View>

                        <View style={styles.sectionTitleCard}>
                            <Text style={styles.sectionTitle}>2. Reporting Procedures</Text>
                        </View>

                        <View style={styles.reportingCard}>
                            <View style={styles.reportingItem}>
                                <Ionicons name="star" size={20} color="#FFD700" style={styles.starIcon} />
                                <Text style={styles.reportingText}>
                                    Upon approval, a grant agreement will be signed based on the submitted Action Steps—
                                    the CCC may modify, suspend, or stop payment of grant funds if the terms of the
                                    agreement are changed or not followed.
                                </Text>
                            </View>

                            <View style={styles.reportingItem}>
                                <Ionicons name="star" size={20} color="#FFD700" style={styles.starIcon} />
                                <Text style={styles.reportingText}>
                                    Upon completion of the project,  the grantee must submit a grant report regarding the use
                                    of funds consisting of  a narrative report and financial accounting—the report ought to
                                    include copies of relevant receipts and records of expenditures.
                                </Text>
                            </View>

                            <View style={styles.reportingItem}>
                                <Ionicons name="star" size={20} color="#FFD700" style={styles.starIcon} />
                                <Text style={styles.reportingText}>
                                    Any grant funds that have not been used for, or committed to, the project upon expiration
                                    or termination of the grant agreement must be returned to the CCC.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.reviewCard}>
                            <Text style={styles.reviewTitle}>
                                Please review the grant application thoroughly before submission and ensure that all required
                                sections are completed accurately
                            </Text>

                            <Pressable
                                onPress={() => toggleCheckbox('reviewed')}
                                style={styles.checkboxRow}
                            >
                                <View style={[styles.checkbox, checkboxes.reviewed && styles.checkboxChecked]}>
                                    {checkboxes.reviewed && (
                                        <Ionicons name="checkmark" size={18} color="white" />
                                    )}
                                </View>
                                <Text style={styles.checkboxLabel}>
                                    I have reviewed the application and filled out each the section to the best of my knowledge
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => toggleCheckbox('discuss')}
                                style={styles.checkboxRow}
                            >
                                <View style={[styles.checkbox, checkboxes.discuss && styles.checkboxChecked]}>
                                    {checkboxes.discuss && (
                                        <Ionicons name="checkmark" size={18} color="white" />
                                    )}
                                </View>
                                <Text style={styles.checkboxLabel}>
                                    I have filled out the application, and I would like to discuss it with a center's director
                                </Text>
                            </Pressable>

                            <View style={styles.otherCheckboxContainer}>
                                <Pressable
                                    onPress={() => toggleCheckbox('other')}
                                    style={styles.checkboxRow}
                                >
                                    <View style={[styles.checkbox, checkboxes.other && styles.checkboxChecked]}>
                                        {checkboxes.other && (
                                            <Ionicons name="checkmark" size={18} color="white" />
                                        )}
                                    </View>
                                    <Text style={styles.checkboxLabel}>Other:</Text>
                                </Pressable>
                                <View style={styles.otherTextContainer}>
                                    <Text style={styles.otherText}>{otherText}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity onPress={handleReject} style={styles.rejectButton}>
                                <Text style={styles.rejectText}>REJECT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAccept} style={styles.acceptButton}>
                                <Text style={styles.acceptText}>ACCEPT</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={handleAddToPending} style={styles.pendingButton}>
                            <Ionicons name="chevron-back" size={20} color="white" />
                            <Text style={styles.pendingText}>Add to Pending</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    backText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    topBarIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    notificationBadge: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FFD700',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        color: '#1D548D',
        fontSize: 12,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        marginBottom: 20,
    },
    gradientBorder: {
        padding: 2,
        borderRadius: 16,
    },
    headerCard: {
        backgroundColor: '#1D548D',
        borderRadius: 14,
        padding: 20,
    },
    headerText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
    },
    sectionTitleCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 16,
        padding: 16,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    reportingCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 16,
        padding: 20,
        gap: 24,
    },
    reportingItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    starIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    reportingText: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        lineHeight: 22,
    },
    reviewCard: {
        marginHorizontal: 16,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 16,
        padding: 20,
    },
    reviewTitle: {
        color: 'white',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 20,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 4,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#1C4ED8',
        borderColor: '#1C4ED8',
    },
    checkboxLabel: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        lineHeight: 22,
    },
    otherCheckboxContainer: {
        marginBottom: 0,
    },
    otherTextContainer: {
        marginLeft: 36,
        marginTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.4)',
        paddingBottom: 8,
    },
    otherText: {
        color: 'white',
        fontSize: 14,
    },
    actionButtons: {
        flexDirection: 'row',
        marginHorizontal: 16,
        gap: 12,
        marginBottom: 16,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    rejectText: {
        color: '#1C4ED8',
        fontSize: 16,
        fontWeight: 'bold',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: 'white',
        alignItems: 'center',
    },
    acceptText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pendingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        gap: 8,
        paddingVertical: 12,
    },
    pendingText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});

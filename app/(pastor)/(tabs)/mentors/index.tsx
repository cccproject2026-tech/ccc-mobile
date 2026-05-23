import MentorCard from "@/components/director/MentorCard";
import MentorProfileSwiper from "@/components/director/MentorProfileSwiper";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { Mentor, useAssignedMentors } from "@/hooks/mentors/useGetAssignedMentors";
import { Mentor as MentorData } from "@/hooks/mentors/useMentors";
import { openScheduleMeeting } from "@/lib/scheduling/scheduleMeetingNavigation";
import { useAuthStore } from "@/stores";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function MyMentorsScreen() {
    const [listToggle, setListToggle] = useState(false);
    const [searchText, setSearchText] = useState("");

    // Get the current user's ID
    const { user } = useAuthStore();
    if (!user) return null;

    const { mentors, isLoading, isError, isEmpty } = useAssignedMentors(user.id);

    // Filter mentors based on search text
    const filteredMentors = useMemo(() => {
        if (!mentors || mentors.length === 0) return [];
        if (!searchText.trim()) return mentors;
        const searchLower = searchText.toLowerCase();
        return mentors.filter(
            (mentor) =>
                mentor.name.toLowerCase().includes(searchLower) ||
                mentor.role.toLowerCase().includes(searchLower) ||
                mentor.email?.toLowerCase().includes(searchLower)
        );
    }, [mentors, searchText]);

    // Separate current and prior mentors based on status
    const currentMentors = useMemo(() => {
        return filteredMentors.filter(mentor =>
            mentor.status === 'new' || mentor.status === 'pending' || mentor.status === 'accepted'
        );
    }, [filteredMentors]);

    const priorMentors = useMemo(() => {
        return filteredMentors.filter(mentor =>
            mentor.status === 'inactive' || mentor.status === 'completed'
        );
    }, [filteredMentors]);

    const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

    const handleMentorProfilePress = (mentor: Mentor | MentorData) => {
        router.push({
            pathname: "/(pastor)/(tabs)/mentors/[id]",
            params: {
                id: mentor.id,
                ...(mentor.email ? { email: mentor.email } : {}),
            },
        } as never);
    };

    const handleCall = (mentor: MentorData) => {
        if (!mentor.phoneNumber) {
            return Alert.alert("Phone number not available");
        }
        const url = `tel:${mentor.phoneNumber}`;
        Linking.openURL(url);
    };

    const handleChat = (mentor: MentorData) => {
        if (!mentor.phoneNumber) {
            return Alert.alert("Phone number not available");
        }
        const url = `sms:${mentor.phoneNumber}`;
        Linking.openURL(url);

    };

    const handleMail = async (mentor: Mentor) => {
        if (!mentor.email) {
            return Alert.alert("Email not available");
        }

        const gmailApp = `googlegmail://co?to=${mentor.email}`;
        const gmailWeb = `https://mail.google.com/mail/?view=cm&fs=1&to=${mentor.email}`;

        try {
            // Try Gmail app first
            const canOpenGmail = await Linking.canOpenURL(gmailApp);
            if (canOpenGmail) {
                console.log("Opening Gmail app");
                await Linking.openURL(gmailApp);
                return;
            }

            // Always open Gmail Web as fallback (100% works)
            console.log("Opening Gmail web");
            await Linking.openURL(gmailWeb);
        } catch (error) {
            console.log("Mail open error:", error);
            // Final fallback: Gmail web again (just in case)
            await Linking.openURL(gmailWeb);
        }
    };




    const handleWhatsApp = async (mentor: MentorData) => {
        if (!mentor.phoneNumber) {
            return Alert.alert("Phone number not available");
        }

        const url = `whatsapp://send?phone=${mentor.phoneNumber}`;

        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
            // Fallback to WhatsApp web
            return Linking.openURL(`https://wa.me/${mentor.phoneNumber}`);
        }

        Linking.openURL(url);

    };

    const handleScheduleAppointment = (mentor: MentorData) => {
        openScheduleMeeting(router, user?.role, {
            mode: "schedule",
            personData: JSON.stringify(mentor),
        });
    };

    if (isLoading) {
        return (
            <LinearGradient
                colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
                style={{ flex: 1 }}
            >
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            </LinearGradient>
        );
    }

    if (isError) {
        return (
            <LinearGradient
                colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
                style={{ flex: 1 }}
            >
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text className="text-center text-white">Failed to load mentors. Please try again.</Text>
                </View>
            </LinearGradient>
        );
    }

    // Empty state when no mentors are assigned
    const EmptyMentorsState = () => (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
            <Ionicons name="people-outline" size={80} color="rgba(255, 255, 255, 0.3)" style={{ marginBottom: 20 }} />
            <Text style={{ color: "white", fontSize: 20, fontWeight: "600", marginBottom: 12, textAlign: "center" }}>
                No Mentors Assigned
            </Text>
            <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 16, textAlign: "center", lineHeight: 24 }}>
                You don't have any mentors assigned yet. Please contact your administrator to get assigned to a mentor.
            </Text>
        </View>
    );

    console.log("👥 Total Mentors:", mentors);
    return (
        <>
            <LinearGradient
                colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
                style={{ flex: 1 }}
            >
                <>
                    <View style={{ paddingBottom: 10 }}>
                        <TopBar role="pastor" showUserName />
                    </View>

                    {isEmpty ? (
                        <EmptyMentorsState />
                    ) : (
                        <View style={{ flex: 1 }}>
                            {/* Header Section */}
                            <View style={styles.headerContainer}>
                                <View style={styles.headerContent}>
                                    <TouchableOpacity
                                        onPress={() => router.back()}
                                        style={styles.backButton}
                                    >
                                        <Image source={icons.forward} style={styles.backIcon} />
                                        <Text style={styles.myMentorsText}>
                                            My Mentors
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setListToggle(!listToggle)}
                                        style={styles.toggleButton}
                                    >
                                        <Image
                                            source={listToggle ? icons.list : icons.grid}
                                            style={styles.toggleIcon}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Separator */}
                            <View style={styles.dividerLine} />

                            {/* Search Section */}
                            <View style={[styles.searchContainer, styles.searchContainerMargin]}>
                                <View style={styles.searchBox}>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search"
                                        placeholderTextColor="white"
                                        value={searchText}
                                        onChangeText={setSearchText}
                                    />
                                    <Ionicons
                                        name="search"
                                        size={20}
                                        color="rgba(255, 255, 255, 0.6)"
                                        style={styles.searchIcon}
                                    />
                                </View>
                            </View>

                            {/* Quick Access Mentors - Pass actual mentor data */}
                            <View style={styles.quickAccessContainer}>
                                <MentorProfileSwiper
                                    mentors={mentors}
                                    onMentorPress={(m) =>
                                        handleMentorProfilePress(m as Mentor)
                                    }
                                />
                            </View>

                            {/* Mentors List */}
                            <ScrollView
                                style={{ flex: 1 }}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Current Mentors */}
                                {currentMentors.length > 0 && (
                                    <View style={[styles.mentorsListContainer, styles.mentorsListContainerMargin]}>
                                        <View style={styles.mentorsHeader}>
                                            <Text style={styles.mentorTabText}>
                                                Current Mentors
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                listToggle ? styles.mentorsListView : styles.mentorsGrid
                                            }
                                        >
                                            {currentMentors.map((mentor) => (
                                                <MentorCard
                                                    key={mentor.id}
                                                    mentor={mentor as MentorData}
                                                    layout={listToggle ? 'list' : 'card'}
                                                    onCall={() => handleCall(mentor as MentorData)}
                                                    onChat={() => handleChat(mentor as MentorData)}
                                                    onMail={() => handleMail(mentor as MentorData)}
                                                    onWhatsApp={() => handleWhatsApp(mentor as MentorData)}
                                                    onNamePress={() =>
                                                        handleMentorProfilePress(mentor)
                                                    }
                                                    onPress={() => handleMentorProfilePress(mentor)}
                                                    menuItems={[
                                                        {
                                                            key: 'schedule',
                                                            title: 'Schedule Appointment',
                                                            icon: { ios: 'calendar', android: 'ic_menu_today' },
                                                            onSelect: () => handleScheduleAppointment(mentor as MentorData)
                                                        }
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Prior Mentors */}
                                {priorMentors.length > 0 && (
                                    <View style={[styles.mentorsListContainer, styles.mentorsListContainerMargin]}>
                                        <View style={styles.mentorsHeader}>
                                            <Text style={styles.mentorTabText}>
                                                Prior Mentors
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                listToggle ? styles.mentorsListView : styles.mentorsGrid
                                            }
                                        >
                                            {priorMentors.map((mentor) => (
                                                <MentorCard
                                                    key={mentor.id}
                                                    mentor={mentor as MentorData}
                                                    layout={listToggle ? 'list' : 'card'}
                                                    onNamePress={() =>
                                                        handleMentorProfilePress(mentor)
                                                    }
                                                    onPress={() => handleMentorProfilePress(mentor)}
                                                    onCall={() => handleCall(mentor as MentorData)}
                                                    onChat={() => handleChat(mentor as MentorData)}
                                                    onMail={() => handleMail(mentor as MentorData)}
                                                    onWhatsApp={() => handleWhatsApp(mentor as MentorData)}
                                                    menuItems={[
                                                        {
                                                            key: 'schedule',
                                                            title: 'Schedule Appointment',
                                                            icon: { ios: 'calendar', android: 'ic_menu_today' },
                                                            onSelect: () => handleScheduleAppointment(mentor as MentorData)
                                                        }
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Empty search results */}
                                {filteredMentors.length === 0 && searchText.trim() !== "" && (
                                    <View style={{ paddingVertical: 40, paddingHorizontal: 20, alignItems: "center" }}>
                                        <Ionicons name="search-outline" size={60} color="rgba(255, 255, 255, 0.3)" style={{ marginBottom: 16 }} />
                                        <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>
                                            No mentors found matching "{searchText}"
                                        </Text>
                                        <Text style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 14, marginTop: 8, textAlign: "center" }}>
                                            Try adjusting your search terms
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    )}
                </>
            </LinearGradient>
        </>
    );
}


const styles = StyleSheet.create({
    headerContainer: {
        width: "100%",
        alignItems: "center",
    },
    headerContent: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    backIcon: {
        width: 18,
        height: 18,
        transform: [{ scaleX: -1 }],
    },
    toggleButton: {
        padding: 8,
        borderRadius: 8,
    },
    toggleIcon: {
        width: 22,
        height: 22,
        tintColor: "white",
    },
    separator: {
        height: 2,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        marginHorizontal: 16,
        marginVertical: 4,
    },
    searchContainer: {
        marginHorizontal: 16,
        marginBottom: 10,
    },
    searchBox: {
        backgroundColor: "#14517D",
        borderRadius: 10,
        height: 45,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        color: "white",
        fontSize: 16,
        fontWeight: "400",
    },
    quickAccessContainer: {
    },
    quickAccessScroll: {
        paddingRight: 20,
    },
    quickAccessItem: {
        alignItems: "center",
        minWidth: 80,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "rgba(255, 255, 255, 0.3)",
    },
    avatar: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
    },
    mentorsListContainer: {
        marginHorizontal: 16,
        marginBottom: 20,
    },
    mentorsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    mentorsGrid: {
        gap: 0,
    },
    mentorsListView: {
        gap: 0,
    },

    // Converted Styles
    myMentorsText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 17,
    },
    dividerLine: {
        height: 0.5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginTop: 4,
    },
    searchContainerMargin: {
        marginTop: 16,
    },
    mentorTabText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 16,
    },
    mentorsListContainerMargin: {
        marginTop: 16,
    },
});
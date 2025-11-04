import MentorCard, { MentorData } from "@/components/director/MentorCard";
import MentorProfileSwiper from "@/components/director/MentorProfileSwiper";
import TopBar from "@/components/director/TopBar";
import { Colors } from "@/constants/Colors";
import { icons } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const dummyMentors: MentorData[] = [
    {
        id: "1",
        name: "John Doe",
        role: "Mentor",
        description: "Sub text area write something here. That you can read more",
        profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        id: "2",
        name: "John Ross",
        role: "Mentor",
        description: "Sub text area write something here. That you can read more",
        profileImage: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
        id: "3",
        name: "Sarah Johnson",
        role: "Mentor",
        description: "Sub text area write something here. That you can read more",
        profileImage: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
        id: "4",
        name: "Michael Brown",
        role: "Mentor",
        description: "Sub text area write something here. That you can read more",
        profileImage: "https://randomuser.me/api/portraits/men/22.jpg",
    },
    {
        id: "5",
        name: "Emily Davis",
        role: "Mentor",
        description: "Sub text area write something here. That you can read more",
        profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        id: "6",
        name: "David Wilson",
        role: "Field Mentor",
        description: "Sub text area write something here. That you can read more",
        profileImage: "https://randomuser.me/api/portraits/men/58.jpg",
    },
];

export default function MyMentorsScreen() {
    const [listToggle, setListToggle] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [selectedMentor, setSelectedMentor] = useState<MentorData | null>(null);

    const handleCardPress = (mentor: MentorData) => {
        router.push({
            pathname: "/(pastor-tabs)/(tabs)/mentors/schedule-meeting",
            params: { mentorData: JSON.stringify(mentor) },
        });
    };

    const handleCall = (mentor: MentorData) => {
        console.log("Calling", mentor.name);

    };

    const handleChat = (mentor: MentorData) => {
        console.log("Chatting with", mentor.name);

    };

    const handleMail = (mentor: MentorData) => {
        console.log("Emailing", mentor.name);

    };

    const handleWhatsApp = (mentor: MentorData) => {
        console.log("WhatsApp", mentor.name);

    };

    const handleScheduleAppointment = (mentor: MentorData) => {
        console.log("Schedule appointment with", mentor.name);
        router.push({
            pathname: "/(pastor-tabs)/(tabs)/mentors/schedule-meeting",
            params: { mentorData: JSON.stringify(mentor) },
        });
    };
    return (
        <>
            <LinearGradient
                colors={[Colors.lightBlueGradientOne, Colors.darkBlueGradientOne]}
                style={{ flex: 1 }}
            >
                <>
                    <View style={{ paddingBottom: 10 }}>
                        <TopBar role="pastor" userName="John Ross" showUserName />
                    </View>
                    <View style={{ flex: 1 }}>
                        {/* Header Section */}
                        <View style={styles.headerContainer}>
                            <View style={styles.headerContent}>
                                <TouchableOpacity
                                    onPress={() => router.back()}
                                    style={styles.backButton}
                                >
                                    <Image source={icons.forward} style={styles.backIcon} />
                                    <Text className="text-white font-semibold text-[17px]">
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
                        <View className="h-[0.5px] bg-white/30 mt-1" />

                        {/* Search Section */}
                        <View style={styles.searchContainer} className="mt-4">
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

                        {/* Quick Access Mentors */}
                        <View style={styles.quickAccessContainer}>
                            <MentorProfileSwiper />
                        </View>

                        {/* Mentors List */}
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.mentorsListContainer} className="mt-4">
                                <View style={styles.mentorsHeader}>
                                    <Text className="text-white  font-medium text-[16px]">
                                        Current Mentors
                                    </Text>
                                </View>

                                <View
                                    style={
                                        listToggle ? styles.mentorsListView : styles.mentorsGrid
                                    }
                                >
                                    {dummyMentors.map((mentor) => (
                                        <MentorCard
                                            key={mentor.id}
                                            mentor={mentor}
                                            layout={listToggle ? 'list' : 'card'}
                                            onCall={() => handleCall(mentor)}
                                            onChat={() => handleChat(mentor)}
                                            onMail={() => handleMail(mentor)}
                                            onWhatsApp={() => handleWhatsApp(mentor)}
                                            onPress={() => handleCardPress(mentor)}
                                            menuItems={[
                                                {
                                                    key: 'schedule',
                                                    title: 'Schedule Appointment',
                                                    icon: { ios: 'calendar', android: 'ic_menu_today' },
                                                    onSelect: () => handleScheduleAppointment(mentor)
                                                }
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Prior Mentors */}
                            <View style={styles.mentorsListContainer} className="mt-4">
                                <View style={styles.mentorsHeader}>
                                    <Text className="text-white  font-medium text-[16px]">
                                        Prior Mentors
                                    </Text>
                                </View>

                                <View
                                    style={
                                        listToggle ? styles.mentorsListView : styles.mentorsGrid
                                    }
                                >
                                    {dummyMentors.map((mentor) => (
                                        <MentorCard
                                            key={mentor.id}
                                            mentor={mentor}
                                            layout={listToggle ? 'list' : 'card'}
                                            onCall={() => handleCall(mentor)}
                                            onChat={() => handleChat(mentor)}
                                            onMail={() => handleMail(mentor)}
                                            onWhatsApp={() => handleWhatsApp(mentor)}
                                            menuItems={[
                                                {
                                                    key: 'schedule',
                                                    title: 'Schedule Appointment',
                                                    icon: { ios: 'calendar', android: 'ic_menu_today' },
                                                    onSelect: () => handleScheduleAppointment(mentor)
                                                }
                                            ]}
                                        />
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
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
        // marginHorizontal: 16,
        // marginBottom: 20,
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
});

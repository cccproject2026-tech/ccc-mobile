import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const profiles = [
    { name: 'John Ross', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'John Ross', image: 'https://randomuser.me/api/portraits/men/33.jpg' },
    { name: 'John Ross', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'John Ross', image: 'https://randomuser.me/api/portraits/men/33.jpg' },
    { name: 'John Ross', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'John Ross', image: 'https://randomuser.me/api/portraits/men/33.jpg' },
];

export default function MentorProfileSwiper() {
    return (
        <View style={{ backgroundColor: "transparent" }}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {profiles.map((profile, idx) => (
                    <View style={styles.profileItem} key={idx}>
                        <LinearGradient
                            colors={["#7C3AED", "#38BDF8"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientBorder}
                        >
                            <View style={styles.avatarInner}>
                                <Image source={{ uri: profile.image }} style={styles.avatarImg} />
                            </View>
                        </LinearGradient>
                        <Text style={styles.profileName} numberOfLines={1}>{profile.name}</Text>
                    </View>
                ))}
            </ScrollView>
            {/* thin divider */}
            <View style={styles.divider} />
        </View>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 12,
        paddingTop: 14,
        paddingBottom: 2,
    },
    profileItem: {
        alignItems: 'center',
        marginRight: 20,
    },
    gradientBorder: {
        width: 66,
        height: 66,
        borderRadius: 33,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 3,
    },
    avatarInner: {
        backgroundColor: "#EFEFEF",
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
        resizeMode: 'cover',
    },
    profileName: {
        color: '#F3F4F6',
        fontSize: 15,
        fontWeight: '400',
        marginTop: 5,
        marginBottom: 1,
        maxWidth: 80,
        textAlign: "center",
    },
    divider: {
        marginTop: 6,
        marginHorizontal: 16,
        borderBottomColor: 'rgba(255,255,255,0.2)',
        borderBottomWidth: 1,
    },
});

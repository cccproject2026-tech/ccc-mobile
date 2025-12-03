import MentorProfileSwiper from '@/components/director/MentorProfileSwiper';
import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const mockMentees = [
    {
        id: '1',
        name: 'John Ross',
        role: 'Pastor',
        description: 'Sub text area write something here',
        profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
        latitude: 37.7749,
        longitude: -122.4194,
    },
    {
        id: '2',
        name: 'John Ross',
        role: 'Pastor',
        description: 'Sub text area',
        profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
        latitude: 37.8044,
        longitude: -122.2712,
    },
    {
        id: '3',
        name: 'John Ross',
        role: 'Pastor',
        description: 'Sub text area',
        profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
        latitude: 37.3382,
        longitude: -121.8863,
    },
    {
        id: '4',
        name: 'John Ross',
        role: 'Pastor',
        description: 'Sub text area',
        profileImage: 'https://randomuser.me/api/portraits/men/35.jpg',
        latitude: 37.3861,
        longitude: -122.0839,
    },
    {
        id: '5',
        name: 'John Ross',
        role: 'Pastor',
        description: 'Sub text area',
        profileImage: 'https://randomuser.me/api/portraits/men/36.jpg',
        latitude: 37.5485,
        longitude: -121.9886,
    },
    {
        id: '6',
        name: 'John Ross',
        role: 'Pastor',
        description: 'Sub text area',
        profileImage: 'https://randomuser.me/api/portraits/men/37.jpg',
        latitude: 37.6879,
        longitude: -122.4702,
    },
    {
        id: '7',
        name: 'John Ross',
        role: 'Pastor',
        description: 'Sub text area',
        profileImage: 'https://randomuser.me/api/portraits/men/38.jpg',
        latitude: 38.5816,
        longitude: -121.4944,
    },
    {
        id: '8',
        name: 'John Ross',
        role: 'Pastor',
        description: 'Sub text area',
        profileImage: 'https://randomuser.me/api/portraits/men/39.jpg',
        latitude: 37.9577,
        longitude: -122.0493,
    },
];

export default function MenteesLocation() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [viewMode, setViewMode] = useState<'list' | 'card'>('card');

    const initialRegion = {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 1.5,
        longitudeDelta: 1.5,
    };

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1, paddingBottom: bottom + height * 0.05 }}
        >
            <View className="flex-1">
                <TopBar notifications={3} showUserName={true} showNotifications={true} />

                <View className="flex-1 pt-6">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-4 pb-3 mb-4 border-b border-white/30">
                        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center">
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <Text className="text-xl font-semibold text-white">Mentees</Text>
                            <Text className="text-xl font-semibold text-white"> {''}• In-progress</Text>


                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                onPress={() => setViewMode(viewMode === 'card' ? 'list' : 'card')}
                                style={{ padding: 4 }}
                            >
                                <Ionicons name={viewMode === 'card' ? 'list' : 'grid'} size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Profile Swiper */}
                    <View
                        className="mb-4"
                        style={{
                            borderBottomLeftRadius: 20,
                            borderBottomRightRadius: 20,
                        }}
                    >
                        <MentorProfileSwiper />
                    </View>

                    {/* Map View */}
                    <View style={styles.mapContainer}>
                        <MapView
                            provider={PROVIDER_DEFAULT}
                            style={styles.map}
                            initialRegion={initialRegion}
                            showsUserLocation={false}
                            showsMyLocationButton={false}
                        >
                            {mockMentees.map((mentee) => (
                                <Marker
                                    key={mentee.id}
                                    coordinate={{
                                        latitude: mentee.latitude || 0,
                                        longitude: mentee.longitude || 0,
                                    }}
                                    onPress={() => console.log('Marker pressed:', mentee.name)}
                                >
                                    <View style={styles.markerContainer}>
                                        <View style={styles.markerImageWrapper}>
                                            {mentee.profileImage ? (
                                                <Image
                                                    source={{ uri: mentee.profileImage }}
                                                    style={styles.markerImage}
                                                />
                                            ) : (
                                                <View style={styles.markerPlaceholder}>
                                                    <Ionicons name="person-outline" size={20} color="#fff" />
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.markerPointer} />
                                    </View>
                                </Marker>
                            ))}
                        </MapView>

                        {/* Fullscreen Button */}
                        <TouchableOpacity style={styles.fullscreenButton}>
                            <Ionicons name="expand-outline" size={24} color="#1A5B77" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerImageWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFC107',
        padding: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    markerImage: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    markerPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#14517D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerPointer: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFC107',
        marginTop: -1,
    },
    fullscreenButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

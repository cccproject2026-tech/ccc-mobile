import ActionBottomSheet from '@/components/director/ActionSheetModal';
import InterestCard, { Interest } from '@/components/director/InterestCard';
import SearchBar from '@/components/director/SearchBar';
import TopBar from '@/components/director/TopBar';
import { useMicrograntApplications } from '@/hooks/grant/useMicrograntApplications';
import { MicrograntApplication } from '@/types/grant.type';
import { mapMicrograntApplicationToInterest } from '@/utils/interests';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MicroGrant() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'new' | 'pending' | 'approved'>('new');
    const { bottom } = useSafeAreaInsets();
    const { height } = Dimensions.get('window');
    const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);

    // Fetch microgrant applications from API with status filter
    const { data: applicationsData, isLoading: isLoadingApplications } = useMicrograntApplications(activeTab);

    // Map API data to component format
    const applications = useMemo(() => {
        if (!applicationsData) return [];
        return applicationsData.map((application) => 
            mapMicrograntApplicationToInterest(application)
        );
    }, [applicationsData]);

    const styles = StyleSheet.create({
        tabsContainer: {
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 16,
            marginBottom: 16,
            paddingVertical: 8,
        },
        tabButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'white/50',
            alignItems: 'center',
            justifyContent: 'center',
        },
        tabButtonActive: {
            backgroundColor: 'white',
        },
        tabButtonInactive: {
            backgroundColor: '#14517D',
        },
        tabButtonText: {
            fontSize: 16,
            fontWeight: 'semibold',
            color: 'white',
            textAlign: 'center',
        },
        tabButtonTextActive: {
            color: '#1a5b77',
        },
        tabButtonTextInactive: {
            color: 'white',
        },
    });
    const menuItems = [
        {
            icon: 'people-outline',
            label: 'Revitalization Roadmaps',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentors/mentor-mentees');
                }, 300);
            }
        },
        {
            icon: 'person-add-outline',
            label: 'Assign Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/assign-mentor');
                }, 300);
            }
        },
        {
            icon: 'person-remove-outline',
            label: 'Remove Mentor',
            onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push('/(director)/(tabs)/mentees/remove-mentor');
                }, 300);
            }
        },
        { icon: 'person-add-outline', label: 'Assessments', onPress: () => router.push('/(director)/(tabs)/assessments') },
        { icon: 'person-remove-outline', label: 'Assignments', onPress: () => console.log('Assignments') },
        { icon: 'clipboard-outline', label: 'Roadmaps of Mentees', onPress: () => console.log('Roadmaps of Mentees') },
        {
            icon: 'checkmark-done-outline', label: 'Mentor Notes', onPress: () => {
                handleCloseModal();
                setTimeout(() => {
                    router.push(`/(director)/(tabs)/mentees/notes`);
                }, 300);
            }
        },
        { icon: 'book-outline', label: 'View Progress Report', onPress: () => console.log('Assignments of Mentees') },
        { icon: 'stats-chart-outline', label: 'Micro Grant', onPress: () => console.log('Progress of Mentees') },
        { icon: 'calendar-outline', label: 'Product and Services', onPress: () => console.log('Schedule a Meeting') },
    ];

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleMenuPress = useCallback((interest: Interest) => {
        setSelectedInterest(interest);
        setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 0);
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setTimeout(() => {
            setSelectedInterest(null);
        }, 300);
    }, []);

    const handleTabChange = (tab: 'new' | 'pending' | 'approved') => {
        setActiveTab(tab);
    };

    
    const { data: allApplicationsData } = useMicrograntApplications();
    
    const allApplications = useMemo(() => {
        if (!allApplicationsData) return [];
        return allApplicationsData.map((application) => 
            mapMicrograntApplicationToInterest(application)
        );
    }, [allApplicationsData]);

    const filteredApplications = useMemo(() => {
        let filtered = applications;

        if (search) {
            filtered = filtered.filter((application) =>
                application.name.toLowerCase().includes(search.toLowerCase()) ||
                application.role.toLowerCase().includes(search.toLowerCase())
            );
        }

        // Applications are already filtered by status from the API
        return filtered;
    }, [search, applications]);

    const newCount = allApplications.filter((application) => application.status === 'new').length;
    const pendingCount = allApplications.filter((application) => application.status === 'pending').length;
    const approvedCount = allApplications.filter((application) => application.status === 'approved').length;

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={{ flex: 1, paddingBottom: bottom + height * 0.05 }}
        >
            <View className="flex-1">
                <TopBar notifications={3} showUserName={true} showNotifications={true} />

                <View className="flex-1 pt-6">
                    {}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)' }}>
                        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="chevron-back" size={28} color="#fff" />
                            <Text style={{ fontSize: 16, fontWeight: 'semibold', color: 'white', marginLeft: 8 }} className="ml-2 text-lg font-semibold text-white">
                                Micro Grant - Application Received
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {}
                    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {}
                    <View style={styles.tabsContainer}>
                        <Pressable
                            onPress={() => handleTabChange('new')}
                            style={[
                                styles.tabButton,
                                activeTab === 'new' ? styles.tabButtonActive : styles.tabButtonInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === 'new' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
                                ]}
                            >
                                New
                            </Text>
                            {newCount > 0 && (
                                <View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#1C4ED8', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }} >
                                        {newCount}
                                    </Text>
                                </View>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => handleTabChange('pending')}
                            style={[
                                styles.tabButton,
                                activeTab === 'pending' ? styles.tabButtonActive : styles.tabButtonInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === 'pending' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
                                ]}
                            >
                                Pending
                            </Text>
                            {pendingCount > 0 && (
                                <View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#1C4ED8', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }} >
                                        {pendingCount}
                                    </Text>
                                </View>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => handleTabChange('approved')}
                            style={[
                                styles.tabButton,
                                activeTab === 'approved' ? styles.tabButtonActive : styles.tabButtonInactive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === 'approved' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
                                ]}
                            >
                                Approved
                            </Text>
                            {approvedCount > 0 && (
                                <View style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#1C4ED8', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: 'white' }} >
                                        {approvedCount}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    </View>

                    {}
                    <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                        {isLoadingApplications ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <ActivityIndicator color="#fff" size="large" />
                                <Text style={{ color: '#fff', marginTop: 12 }}>Loading applications...</Text>
                            </View>
                        ) : filteredApplications.length > 0 ? (
                            filteredApplications.map((application) => (
                                <InterestCard
                                    key={application.id}
                                    data={application}
                                    onPress={() => router.push({
                                        pathname: '/(director)/(tabs)/micro-grant/micro-grand-application',
                                        params: { applicationId: application.id }
                                    })}
                                    onCall={() => {
                                        const applicationdata: MicrograntApplication | undefined = applicationsData?.find(app => app._id === application.id);
                                        const uid = applicationdata?.userId;
                                        const email = uid && typeof uid === 'object' ? uid.email : undefined;
                                        console.log('Call', email || 'Unknown', applicationdata);
                                    }}
                                    onChat={() => console.log('Chat', application.name)}
                                    onMail={() => {
                                        const applicationData: MicrograntApplication | undefined = applicationsData?.find(app => app._id === application.id);
                                        const uid = applicationData?.userId;
                                        const email = uid && typeof uid === 'object' ? uid.email : undefined;
                                        if (email) {
                                            console.log('Mail', email);
                                        }
                                    }}
                                    onWhatsApp={() => console.log('WhatsApp', application.name)}
                                />
                            ))
                        ) : (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <Text style={{ color: '#cfe9f3', textAlign: 'center' }}>
                                    No applications found
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                <ActionBottomSheet
                    ref={bottomSheetModalRef}
                    title={selectedInterest?.name || ''}
                    image={undefined}
                    actions={menuItems}
                    onClose={handleCloseModal}
                />
            </View>
        </LinearGradient>
    );

}

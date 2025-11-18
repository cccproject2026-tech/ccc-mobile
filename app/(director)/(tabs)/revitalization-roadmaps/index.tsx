import ActionBottomSheet from '@/components/director/ActionSheetModal';
import CreateRoadmapModal, { RoadmapFormData } from '@/components/director/CreateRoadmapModal';
import FilterModal, { FilterOption } from '@/components/director/FilterModal';
import MenteeCard, { Mentee } from '@/components/director/MenteeCard';
import MentorCard, { MentorData } from '@/components/director/MentorCard';
import MentorProfileSwiper from '@/components/director/MentorProfileSwiper';
import RoadmapCard from '@/components/director/ProgressRoadmapCard';
import RoadmapHeader from '@/components/director/RoadmapHeader';
import SearchBar from '@/components/director/SearchBar';
import { TabSwitcher } from '@/components/director/TabSwitcher';
import TopBar from '@/components/director/TopBar';
import { mockMentees, STATES } from '@/constants/mockData';
import { useRoadmaps } from '@/hooks/roadmaps/useRoadmaps';
import { getRoadmapCard } from '@/lib/roadmap/mappers';
import { RoadmapCardData } from '@/lib/roadmap/types';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



// Mock data for Mentors
const mockMentors: MentorData[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Mentor',
    menteesCount: 5,
    description: 'Sub text area write something here. That you can read more about him',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    role: 'Field Mentor',
    menteesCount: 8,
    description: 'Experienced field mentor with expertise in community engagement',
    profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    role: 'Mentor',
    menteesCount: 3,
    description: 'Specializes in leadership development and ministry skills',
    profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
  },
];

export default function RevitalizationRoadmap() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'roadmap-library' | 'mentors' | 'mentees'>('roadmap-library');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Course Completion : Oldest');
  const { bottom } = useSafeAreaInsets();
  const { height } = Dimensions.get('window');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorData | null>(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapCardData | null>(null);

  // Fetch roadmaps from API - use 'director' role to get all roadmaps
  const { data: roadmaps = [], isLoading: isLoadingRoadmaps, error: roadmapsError } = useRoadmaps('director');

  // Transform roadmaps to RoadmapCardData
  const roadmapLibrary: RoadmapCardData[] = useMemo(() => {
    console.log("🔄 Transforming roadmaps to cards. Total roadmaps:", roadmaps.length);
    const transformed = roadmaps
      .filter(roadmap => roadmap != null) // Filter out null/undefined roadmaps
      .map(roadmap => {
        try {
          return getRoadmapCard(roadmap);
        } catch (error) {
          console.error("❌ Error transforming roadmap:", roadmap?._id, error);
          return null;
        }
      })
      .filter(card => card != null) as RoadmapCardData[];
    console.log("✅ Transformed roadmaps count:", transformed.length);
    return transformed;
  }, [roadmaps]);

  const getFilterOptions = (): FilterOption[] => {
    return [
      {
        label: 'Course Completion',
        options: ['Latest', 'Oldest'],
        isExpandable: true
      },
      {
        label: 'State',
        options: STATES,
        isExpandable: true
      },
      {
        label: 'Conference',
        isExpandable: true
      }
    ];
  };



  // Menu items for mentees
  const menteeMenuItems = [
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
    { icon: 'person-add-outline', label: 'Assessments', onPress: () => console.log('Assessments') },
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

  // Menu items for mentors
  const mentorMenuItems = [
    { icon: 'people-outline', label: 'List of Mentees', onPress: () => router.push('/(director)/(tabs)/mentors/mentor-mentees') },
    { icon: 'person-add-outline', label: 'Assign New Mentee', onPress: () => router.push('/(director)/(tabs)/mentors/assign-mentee') },
    { icon: 'person-remove-outline', label: 'Remove a Mentee', onPress: () => router.push('/(director)/(tabs)/mentors/remove-mentee') },
    { icon: 'clipboard-outline', label: 'Roadmaps of Mentees', onPress: () => console.log('Roadmaps of Mentees') },
    { icon: 'checkmark-done-outline', label: 'Assessments of Mentees', onPress: () => console.log('Assessments of Mentees') },
    { icon: 'book-outline', label: 'Assignments of Mentees', onPress: () => console.log('Assignments of Mentees') },
    { icon: 'stats-chart-outline', label: 'Progress of Mentees', onPress: () => console.log('Progress of Mentees') },
    { icon: 'calendar-outline', label: 'Schedule a Meeting', onPress: () => console.log('Schedule a Meeting') },
    { icon: 'create-outline', label: 'Edit Profile', onPress: () => console.log('Edit Profile') },
  ];

  const fieldMentorMenuItems = [
    { icon: 'people-outline', label: 'List of Mentees', onPress: () => router.push('/(director)/(tabs)/mentors/mentor-mentees') },
    { icon: 'person-add-outline', label: 'Assign New Mentee', onPress: () => router.push('/(director)/(tabs)/mentors/assign-mentee') },
    { icon: 'person-remove-outline', label: 'Remove a Mentee', onPress: () => router.push('/(director)/(tabs)/mentors/remove-mentee') },
    { icon: 'calendar-outline', label: 'Schedule a Meeting', onPress: () => console.log('Schedule a Meeting') },
    { icon: 'create-outline', label: 'Edit Profile', onPress: () => console.log('Edit Profile') },
    { icon: 'person-remove-outline', label: 'Remove as Field Mentor', onPress: () => console.log('Remove as Field Mentor') },
  ];

  // Menu items for roadmaps
  const roadmapMenuItems = [
    {
      icon: 'person-add-outline',
      label: 'Assign to',
      onPress: () => {
        if (!selectedRoadmap) return;
        // Find the roadmap ID from the roadmap data
        const roadmap = roadmaps.find(r => r.name === selectedRoadmap.title);
        if (!roadmap) return;
        
        handleCloseModal();
        setTimeout(() => {
          router.push({
            pathname: '/(director)/(tabs)/revitalization-roadmaps/assign-mentee',
            params: { roadmapId: roadmap._id }
          });
        }, 300);
      }
    },
    {
      icon: 'create-outline',
      label: 'Edit Roadmap',
      onPress: () => {
        if (!selectedRoadmap) return;
        const roadmap = roadmaps.find(r => r.name === selectedRoadmap.title);
        if (!roadmap) return;
        
        handleCloseModal();
        
        // For phase type, start the phase edit loop from first nested roadmap
        if (roadmap.type === 'phase' && roadmap.roadmaps && roadmap.roadmaps.length > 0) {
          setTimeout(() => {
            const firstNested = roadmap.roadmaps[0];
            router.push({
              pathname: '/(director)/(tabs)/revitalization-roadmaps/(creation)/create-roadmap',
              params: {
                isEditMode: 'true',
                roadmapId: roadmap._id,
                parentRoadmapId: roadmap._id,
                nestedRoadmapId: firstNested._id,
                isNestedEdit: 'true',
                phase: firstNested.phase || '',
                phaseLoopActive: 'true',
                phaseLoopIndex: '0',
                phaseLoopTotal: String(roadmap.roadmaps.length),
              },
            });
          }, 300);
        } else {
          // For single roadmap, go directly to edit
          setTimeout(() => {
            router.push({
              pathname: '/(director)/(tabs)/revitalization-roadmaps/(creation)/create-roadmap',
              params: {
                isEditMode: 'true',
                roadmapId: roadmap._id,
              },
            });
          }, 300);
        }
      }
    },
    {
      icon: 'trash-outline',
      label: 'Delete Roadmap',
      onPress: () => {
        handleCloseModal();
        console.log('Delete Roadmap:', selectedRoadmap?.title);
      }
    },
  ];

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const createRoadmapModalRef = useRef<BottomSheetModal>(null);



  const handleMenuPress = useCallback((mentee: Mentee) => {
    setSelectedMentee(mentee);
    setSelectedMentor(null);
    setSelectedRoadmap(null);
    setTimeout(() => {
      bottomSheetModalRef.current?.present();
    }, 0);
  }, []);

  const handleMentorMenuPress = useCallback((mentor: MentorData) => {
    setSelectedMentor(mentor);
    setSelectedMentee(null);
    setSelectedRoadmap(null);
    setTimeout(() => {
      bottomSheetModalRef.current?.present();
    }, 0);
  }, []);

  const handleRoadmapMenuPress = useCallback((roadmap: RoadmapCardData) => {
    setSelectedRoadmap(roadmap);
    setSelectedMentee(null);
    setSelectedMentor(null);
    setTimeout(() => {
      bottomSheetModalRef.current?.present();
    }, 0);
  }, []);



  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    setTimeout(() => {
      setSelectedMentee(null);
      setSelectedMentor(null);
      setSelectedRoadmap(null);
    }, 300);
  }, []);

  // Create Roadmap Modal Handlers
  const handleOpenCreateRoadmapModal = useCallback(() => {
    createRoadmapModalRef.current?.present();
  }, []);

  const handleCloseCreateRoadmapModal = useCallback(() => {
    createRoadmapModalRef.current?.dismiss();
  }, []);

  const handleCreateRoadmapNext = useCallback((data: RoadmapFormData) => {
    console.log('Create Roadmap Data:', data);
    // Here you would typically save the roadmap data
    handleCloseCreateRoadmapModal();
    // Show success message or navigate to next step
  }, [handleCloseCreateRoadmapModal]);

  const handleCreateRoadmapCancel = useCallback(() => {
    handleCloseCreateRoadmapModal();
  }, [handleCloseCreateRoadmapModal]);

  const handleTabChange = (tab: 'roadmap-library' | 'mentors' | 'mentees') => {
    setActiveTab(tab);
  };

  const handlePhasePress = useCallback((roadmapData: RoadmapCardData) => {
    // Find the corresponding roadmap by title
    const roadmap = roadmaps.find(r => r.name === roadmapData.title);
    console.log('roadmap', roadmap);
    
    if (!roadmap) return;

    const roadmapId = roadmap._id;

    // Phase type roadmaps always navigate to phase detail page
    if (roadmap.type === 'phase') {
      router.push(`/(director)/(tabs)/revitalization-roadmaps/${roadmapId}`);
      return;
    }

    // Single type roadmaps always navigate directly to task detail page
    // If it has nested roadmaps, navigate to the first one
    if (roadmap.haveNextedRoadMaps && roadmap.roadmaps && roadmap.roadmaps.length > 0) {
      router.push(`/(director)/(tabs)/revitalization-roadmaps/${roadmapId}/${roadmap.roadmaps[0]._id}`);
    } else {
      // Fallback: if no nested roadmaps, still navigate to phase detail page
      router.push(`/(director)/(tabs)/revitalization-roadmaps/${roadmapId}`);
    }
  }, [roadmaps, router]);





  const getFilterDisplayText = () => {
    if (STATES.includes(selectedFilter)) {
      return `State: ${selectedFilter}`;
    }
    return selectedFilter || `Course Completion : ${selectedFilter}`;
  };

  const filterOptions = useMemo(() => getFilterOptions(), []);

  const filteredMentors = useMemo(() => {
    let filtered = mockMentors;

    if (search) {
      filtered = filtered.filter((mentor) =>
        mentor.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  }, [search]);

  const filteredMentees = useMemo(() => {
    let filtered = mockMentees;

    if (search) {
      filtered = filtered.filter((mentee) =>
        mentee.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    return filtered;
  }, [search]);

  const filteredRoadmaps = useMemo(() => {
    let filtered = roadmapLibrary;
    console.log("🔍 Filtering roadmaps. Library count:", roadmapLibrary.length, "Search:", search);

    if (search) {
      filtered = filtered.filter((roadmap: RoadmapCardData) =>
        roadmap.title.toLowerCase().includes(search.toLowerCase()) ||
        roadmap.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    console.log("✅ Filtered roadmaps count:", filtered.length);
    return filtered;
  }, [roadmapLibrary, search]);

  const tabData = [
    { key: 'roadmap-library', label: 'Roadmap Library' },
    { key: 'mentors', label: "Mentor's" },
    { key: 'mentees', label: 'Mentees' }
  ];

  return (
    <LinearGradient
      colors={["#176192", "#1D548D", "#264387"]}
      style={{ flex: 1 }}
    >
      <View className="flex-1">
        <TopBar
          userName="David Roe"
          notifications={3}
          showUserName={true}
          showNotifications={true}
        />
        {/* Header */}
        <RoadmapHeader
          handleOpenCreateRoadmapModal={handleOpenCreateRoadmapModal}
          activeTab={activeTab}
        />
        {/* Search Bar - Fixed */}
        <View
          style={{ paddingHorizontal: 16 }}
        >
          <SearchBar value={search} onChangeValue={setSearch} />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: bottom + height * 0.05,
            paddingTop: 6,
          }}
        >
          <View
            className="mb-4 border-b border-white/30"
            style={{
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
          >
            <MentorProfileSwiper />
          </View>
          {/* Tabs */}
          <TabSwitcher
            tabs={tabData}
            activeTab={activeTab}
            onChange={(key) =>
              handleTabChange(
                key as "roadmap-library" | "mentors" | "mentees"
              )
            }
          />

          {/* Profile Swiper */}

          {/* Sort By */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 16, marginBottom: 16, alignItems: 'center' }} className="flex-row items-center justify-end gap-2 px-4 mb-4">
            <Text style={{ fontSize: 16, color: 'white' }} className="text-base text-white">Sort by</Text>
            <Pressable
              onPress={() => setFilterModalVisible(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'transparent', borderRadius: 8, borderWidth: 1, borderColor: 'white' }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: 'medium', color: 'white' }}
                numberOfLines={1}
              >
                {getFilterDisplayText()}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Content List */}
          <View className="px-4">
            {activeTab === "roadmap-library" && (
              <>
                {isLoadingRoadmaps ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
                      Loading roadmaps...
                    </Text>
                  </View>
                ) : roadmapsError ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 }}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ff6b6b" />
                    <Text style={{ color: '#ff6b6b', marginTop: 16, fontSize: 16, textAlign: 'center', fontWeight: '600' }}>
                      Failed to load roadmaps
                    </Text>
                    <Text style={{ color: '#fff', marginTop: 8, fontSize: 14, textAlign: 'center', opacity: 0.8 }}>
                      {roadmapsError instanceof Error ? roadmapsError.message : 'An unexpected error occurred'}
                    </Text>
                  </View>
                ) : filteredRoadmaps.length === 0 ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
                    <Ionicons name="document-outline" size={48} color="#fff" style={{ opacity: 0.5 }} />
                    <Text style={{ color: '#fff', marginTop: 16, fontSize: 16, textAlign: 'center', opacity: 0.7 }}>
                      No roadmaps found
                    </Text>
                  </View>
                ) : (
                  filteredRoadmaps.map((roadmap: RoadmapCardData, index: number) => (
                    <RoadmapCard
                      key={`roadmap-${index}`}
                      data={roadmap}
                      showMenu={true}
                      onMenuPress={() => handleRoadmapMenuPress(roadmap)}
                      onPress={() => handlePhasePress(roadmap)}
                    />
                  ))
                )}
              </>
            )}

            {activeTab === "mentors" &&
              /* Mentors List */
              filteredMentors.map((mentor) => (
                <TouchableOpacity
                  key={mentor.id}
                  onPress={() =>
                    router.push(
                      `/(director)/(tabs)/mentors/${mentor.id}`
                    )
                  }
                  activeOpacity={0.8}
                >
                  <MentorCard
                    mentor={mentor}
                    layout={viewMode}
                    onCall={() => console.log("Call", mentor.name)}
                    onChat={() => console.log("Chat", mentor.name)}
                    onMail={() => console.log("Mail", mentor.name)}
                    onWhatsApp={() => console.log("WhatsApp", mentor.name)}
                    onMenuPress={() => handleMentorMenuPress(mentor)}
                  />
                </TouchableOpacity>
              ))}

            {activeTab === "mentees" &&
              /* Mentees List */
              filteredMentees.map((mentee) => (
                <MenteeCard
                  key={mentee.id}
                  data={mentee}
                  layout={viewMode}
                  onPress={() =>
                    router.push(
                      `/(director)/(tabs)/revitalization-roadmaps/${mentee.id}`
                    )
                  }
                  onCall={() => console.log("Call", mentee.name)}
                  onChat={() => console.log("Chat", mentee.name)}
                  onMail={() => console.log("Mail", mentee.name)}
                  onWhatsApp={() => console.log("WhatsApp", mentee.name)}
                  onMenuPress={() => handleMenuPress(mentee)}
                  onMarkComplete={() =>
                    console.log("Mark complete", mentee.name)
                  }
                  onIssueCertificate={() =>
                    console.log("Issue certificate", mentee.name)
                  }
                  onInviteAsFieldMentor={() =>
                    console.log("Invite as field mentor", mentee.name)
                  }
                />
              ))}
          </View>
        </ScrollView>

        <ActionBottomSheet
          ref={bottomSheetModalRef}
          title={
            selectedMentee?.name ||
            selectedMentor?.name ||
            selectedRoadmap?.title ||
            ""
          }
          subtitle={
            selectedMentor
              ? `${selectedMentor.menteesCount} Mentees`
              : selectedRoadmap
                ? selectedRoadmap.completionTime
                : undefined
          }
          image={selectedMentee?.profileImage || selectedMentor?.profileImage}
          actions={
            selectedRoadmap
              ? roadmapMenuItems
              : selectedMentor
                ? selectedMentor.role === "Field Mentor"
                  ? fieldMentorMenuItems
                  : mentorMenuItems
                : menteeMenuItems
          }
          onClose={handleCloseModal}
        />
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          selectedFilter={selectedFilter}
          onFilterSelect={(filter) => {
            setSelectedFilter(filter);
            setFilterModalVisible(false);
          }}
          filterOptions={filterOptions}
        />

        <CreateRoadmapModal
          ref={createRoadmapModalRef}
          onClose={handleCloseCreateRoadmapModal}
          onNext={handleCreateRoadmapNext}
          onCancel={handleCreateRoadmapCancel}
        />
      </View>
    </LinearGradient>
  );
}

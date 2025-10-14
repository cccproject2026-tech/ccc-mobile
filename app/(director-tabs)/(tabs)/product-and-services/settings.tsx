import ScholarshipCard from '@/components/director/ScholorshipCard';
import SearchBar from '@/components/director/SearchBar';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const PIE_RADIUS = width * 0.20;

interface ScholarshipType {
    id: string;
    name: string;
    amount: number;
    totalAwarded: number;
    totalMentees: number;
    color: string; // Added for pie chart
}

const scholarshipData: ScholarshipType[] = [
    {
        id: '1',
        name: 'Full Scholarship',
        amount: 500,
        totalAwarded: 5800,
        totalMentees: 10,
        color: '#5B4B8A',
    },
    {
        id: '2',
        name: 'Partial Scholarship',
        amount: 300,
        totalAwarded: 5800,
        totalMentees: 10,
        color: '#E879F9',
    },
    {
        id: '3',
        name: 'Full Cost',
        amount: 1000,
        totalAwarded: 6600,
        totalMentees: 10,
        color: '#22D3EE',
    },
    {
        id: '4',
        name: 'Half Scholarship',
        amount: 250,
        totalAwarded: 4700,
        totalMentees: 10,
        color: '#C4B5FD',
    },
    {
        id: '5',
        name: 'ADRA Discount',
        amount: 150,
        totalAwarded: 6600,
        totalMentees: 10,
        color: '#D946EF',
    },
];

export default function ProductAndServices() {
    const router = useRouter();
    const { bottom, top } = useSafeAreaInsets();
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'info'>('all');
    const [expandedId, setExpandedId] = useState<string | null>('1');
    const [scholarships, setScholarships] = useState(scholarshipData);
    const [editingScholarship, setEditingScholarship] = useState<ScholarshipType | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [selectedYear, setSelectedYear] = useState('2023');

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const handleEditPress = useCallback((scholarship: ScholarshipType) => {
        setEditingScholarship(scholarship);
        setEditAmount(scholarship.amount.toString());
        bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModal = useCallback(() => {
        bottomSheetModalRef.current?.dismiss();
        setEditingScholarship(null);
        setEditAmount('');
    }, []);

    const handleSaveChanges = useCallback(() => {
        if (editingScholarship && editAmount) {
            const newAmount = parseFloat(editAmount);
            if (!isNaN(newAmount)) {
                setScholarships(prev =>
                    prev.map(scholarship =>
                        scholarship.id === editingScholarship.id
                            ? { ...scholarship, amount: newAmount }
                            : scholarship
                    )
                );
            }
        }
        handleCloseModal();
    }, [editingScholarship, editAmount, handleCloseModal]);

    const handleToggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const filteredScholarships = scholarships.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    // Calculate totals
    const totalMoneyAwarded = useMemo(() => {
        return scholarships.reduce((sum, s) => sum + s.totalAwarded, 0);
    }, [scholarships]);

    const totalMenteesAwarded = useMemo(() => {
        return scholarships.reduce((sum, s) => sum + s.totalMentees, 0);
    }, [scholarships]);

    // Prepare pie chart data
    const pieData = useMemo(() => {
        return scholarships.map(scholarship => ({
            value: scholarship.totalAwarded,
            color: scholarship.color,
            text: `$${scholarship.totalAwarded}`,
        }));
    }, [scholarships]);

    return (
        <>
            <LinearGradient
                colors={['#176192', '#1D548D', '#264387']}
                style={{ flex: 1, paddingBottom: bottom, paddingTop: top }}
            >
                <View style={{ flex: 1 }}>
                    {/* Header */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                    >
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text
                            style={{
                                marginLeft: 12,
                                fontSize: 18,
                                fontWeight: '600',
                                color: '#fff',
                            }}
                        >
                            Settings - Product and Services
                        </Text>
                    </View>

                    {/* Search Bar */}
                    <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                        <SearchBar value={search} onChangeValue={setSearch} />
                    </View>

                    {/* Tabs */}
                    <View
                        style={{
                            flexDirection: 'row',
                            paddingHorizontal: 16,
                            marginBottom: 20,
                            gap: 12,
                        }}
                    >
                        <Pressable
                            onPress={() => setActiveTab('all')}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                backgroundColor:
                                    activeTab === 'all' ? '#fff' : 'rgba(255, 255, 255, 0.15)',
                                borderRadius: 12,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor:
                                    activeTab === 'all'
                                        ? '#fff'
                                        : 'rgba(255, 255, 255, 0.3)',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: activeTab === 'all' ? '#1A4882' : '#fff',
                                }}
                            >
                                All Scholarships
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setActiveTab('info')}
                            style={{
                                flex: 1,
                                paddingVertical: 12,
                                backgroundColor:
                                    activeTab === 'info' ? '#fff' : 'rgba(255, 255, 255, 0.15)',
                                borderRadius: 12,
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor:
                                    activeTab === 'info'
                                        ? '#fff'
                                        : 'rgba(255, 255, 255, 0.3)',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '600',
                                    color: activeTab === 'info' ? '#1A4882' : '#fff',
                                }}
                            >
                                Info
                            </Text>
                        </Pressable>
                    </View>

                    {/* Content - Toggle between All Scholarships and Info */}
                    <ScrollView
                        style={{ flex: 1, paddingHorizontal: 16 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {activeTab === 'all' ? (
                            <>
                                {filteredScholarships.map((scholarship, index) => (
                                    <ScholarshipCard
                                        key={scholarship.id}
                                        scholarship={scholarship}
                                        isExpanded={expandedId === scholarship.id}
                                        onToggleExpand={() => handleToggleExpand(scholarship.id)}
                                        onEditPress={() => handleEditPress(scholarship)}
                                        isFirst={index === 0}
                                    />
                                ))}
                            </>
                        ) : (
                            <InfoSection
                                totalMoneyAwarded={totalMoneyAwarded}
                                totalMenteesAwarded={totalMenteesAwarded}
                                pieData={pieData}
                                scholarships={scholarships}
                                selectedYear={selectedYear}
                                setSelectedYear={setSelectedYear}
                            />
                        )}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>

                {/* Bottom Sheet Modal */}
                <BottomSheetModal
                    ref={bottomSheetModalRef}
                    snapPoints={['45%']}
                    backgroundStyle={{
                        backgroundColor: '#1A4882',
                    }}
                    handleIndicatorStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    }}
                >
                    <LinearGradient
                        colors={['#264387', '#1D548D', '#176192']}
                        style={{ flex: 1, borderRadius: 16, padding: 20 }}
                    >
                        <BottomSheetView style={{ flex: 1, padding: 20 }}>
                            {/* Header */}
                            <View style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 30,
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                            }}>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: '600',
                                    color: '#fff',
                                    textAlign: 'center',
                                }}>
                                    {editingScholarship?.name}
                                </Text>
                            </View>

                            {/* Input Section */}
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: '#fff',
                                marginBottom: 16,
                            }}>
                                Enter Amount of Scholarship
                            </Text>

                            <View style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                marginBottom: 40,
                            }}>
                                <TextInput
                                    style={{
                                        fontSize: 24,
                                        fontWeight: '600',
                                        color: '#FFC107',
                                        padding: 20,
                                    }}
                                    value={`$ ${editAmount}`}
                                    onChangeText={(text) => {
                                        const numericValue = text.replace(/[^0-9]/g, '');
                                        setEditAmount(numericValue);
                                    }}
                                    keyboardType="numeric"
                                    placeholder="$ 1500"
                                    placeholderTextColor="rgba(255, 193, 7, 0.5)"
                                />
                            </View>

                            {/* Buttons */}
                            <View style={{
                                flexDirection: 'row',
                                gap: 16,
                                marginTop: 'auto',
                            }}>
                                <TouchableOpacity
                                    onPress={handleCloseModal}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#fff',
                                        paddingVertical: 16,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 18,
                                        fontWeight: '600',
                                        color: '#1A4882',
                                    }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleSaveChanges}
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        paddingVertical: 16,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 18,
                                        fontWeight: '600',
                                        color: '#fff',
                                    }}>
                                        Save Changes
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </BottomSheetView>
                    </LinearGradient>
                </BottomSheetModal>
            </LinearGradient>
        </>
    );
}

// Info Section Component
interface InfoSectionProps {
    totalMoneyAwarded: number;
    totalMenteesAwarded: number;
    pieData: any[];
    scholarships: ScholarshipType[];
    selectedYear: string;
    setSelectedYear: (year: string) => void;
}

function InfoSection({
    totalMoneyAwarded,
    totalMenteesAwarded,
    pieData,
    scholarships,
    selectedYear,
    setSelectedYear,
}: InfoSectionProps) {
    return (
        <View>
            {/* Summary Card */}
            <View
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
            >
                <Text
                    style={{
                        fontSize: 16,
                        color: '#fff',
                        marginBottom: 12,
                    }}
                >
                    <Text style={{ fontWeight: '400' }}>Total Money Awarded so far : </Text>
                    <Text style={{ fontWeight: '700', color: '#FFC107' }}>
                        ${totalMoneyAwarded}
                    </Text>
                </Text>

                <Text
                    style={{
                        fontSize: 16,
                        color: '#fff',
                    }}
                >
                    <Text style={{ fontWeight: '400' }}>Total Number of Mentees Awarded : </Text>
                    <Text style={{ fontWeight: '700', color: '#FFC107' }}>
                        {totalMenteesAwarded}
                    </Text>
                </Text>
            </View>

            {/* Divider */}
            <View
                style={{
                    height: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    marginBottom: 24,
                }}
            />

            {/* Chart Section */}
            <View>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: '#fff',
                        }}
                    >
                        Total Amount of Scholarships Awarded so far
                    </Text>
                </View>

                {/* Chart Card */}
                <View
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                >
                    {/* Year Selector */}
                    <View
                        style={{
                            alignSelf: 'flex-end',
                            marginBottom: 20,
                        }}
                    >
                        <Pressable
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                gap: 8,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: '#fff',
                                    fontWeight: '600',
                                }}
                            >
                                {selectedYear}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#fff" />
                        </Pressable>
                    </View>

                    {/* Pie Chart with Legend */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        {/* Pie Chart */}
                        <View style={{ alignItems: 'center' }}>
                            <PieChart
                                data={pieData}
                                radius={PIE_RADIUS}
                                innerRadius={PIE_RADIUS * 0.5}
                                donut
                                showText
                                textColor="#fff"
                                textSize={12}
                                fontWeight="600"
                                innerCircleColor="transparent"
                                centerLabelComponent={() => null}
                            />
                        </View>

                        {/* Legend */}
                        <View style={{ flex: 1, paddingLeft: 20 }}>
                            {scholarships.map((scholarship) => (
                                <View
                                    key={scholarship.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: 12,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 16,
                                            height: 16,
                                            borderRadius: 4,
                                            backgroundColor: scholarship.color,
                                            marginRight: 10,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            color: '#fff',
                                            fontWeight: '500',
                                            flex: 1,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {scholarship.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
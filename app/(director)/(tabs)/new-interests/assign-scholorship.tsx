import AcceptInterestModal from '@/components/director/AcceptInterestModal';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScholarshipType = 'full' | 'partial' | 'fullCost' | 'half' | 'adra';

export default function AssignScholarshipScreen() {
    const router = useRouter();
    const { top, bottom } = useSafeAreaInsets();
    const [isRural, setIsRural] = useState(true);
    const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipType>('full');
    const [amount, setAmount] = useState('500');
    const [isProductExpanded, setIsProductExpanded] = useState(true);
    const [showAcceptModal, setShowAcceptModal] = useState(false);

    const handleAccept = () => setShowAcceptModal(true);
    const handleAcceptLater = () => {
        setShowAcceptModal(false);
        router.push('/(director)/(tabs)/new-interests');
    };

    const handleAssignMentor = () => {
        setShowAcceptModal(false);
        router.push('/(director)/(tabs)/mentees/assign-mentor');
    };
    const scholarships = [
        { id: 'full', label: 'Full Scholarship' },
        { id: 'partial', label: 'Partial Scholarship' },
        { id: 'fullCost', label: 'Full Cost' },
        { id: 'half', label: 'Half Scholarship' },
        { id: 'adra', label: 'ADRA Discount' },
    ];

    return (
        <LinearGradient
            colors={['#176192', '#1D548D', '#264387']}
            style={[styles.container, { paddingTop: Platform.OS === 'ios' ? top : top + 10 }]}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: bottom + 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.header}
                    className='pb-3 mb-4 border-b border-white/30'
                >
                    <Ionicons name="chevron-back" size={Platform.OS === 'android' ? 24 : 28} color="#fff" />
                    <Text style={styles.headerTitle}>Interest Received</Text>
                </TouchableOpacity>

                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Ionicons name="person-outline" size={Platform.OS === 'android' ? 24 : 28} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.userName}>John Doe</Text>
                            <Text style={styles.userRole}>Pastor</Text>
                        </View>
                    </View>

                    {/* Contact Icons */}
                    <View style={styles.contactIcons}>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="call-outline" size={Platform.OS === 'android' ? 18 : 20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="chatbubble-outline" size={Platform.OS === 'android' ? 18 : 20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="mail-outline" size={Platform.OS === 'android' ? 18 : 20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Ionicons name="logo-whatsapp" size={Platform.OS === 'android' ? 18 : 20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Rural/Urban Toggle */}
                <View style={styles.toggleCard}>
                    <Text style={styles.toggleLabel}>Choose Rural or Urban :</Text>
                    <View style={styles.toggleOptions}>
                        <Text style={styles.toggleText}>Rural</Text>
                        <Switch
                            value={!isRural}
                            onValueChange={(value) => setIsRural(!value)}
                            trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.3)' }}
                            thumbColor="#fff"
                            ios_backgroundColor="rgba(255,255,255,0.3)"
                        />
                        <Text style={styles.toggleText}>Urban</Text>
                    </View>
                </View>

                {/* Product and Services */}
                <View style={styles.productCard}>
                    <Pressable
                        style={styles.productHeader}
                        onPress={() => setIsProductExpanded(!isProductExpanded)}
                    >
                        <Text style={styles.productTitle}>Product and Services</Text>
                        <Ionicons
                            name={isProductExpanded ? 'chevron-up' : 'chevron-down'}
                            size={Platform.OS === 'android' ? 20 : 24}
                            color="#fff"
                        />
                    </Pressable>

                    {isProductExpanded && (
                        <View style={styles.scholarshipList}>
                            {scholarships.map((scholarship) => (
                                <TouchableOpacity
                                    key={scholarship.id}
                                    style={styles.scholarshipItem}
                                    onPress={() => setSelectedScholarship(scholarship.id as ScholarshipType)}
                                >
                                    <View style={styles.radioOuter}>
                                        {selectedScholarship === scholarship.id && (
                                            <View style={styles.radioInner} />
                                        )}
                                    </View>
                                    <Text style={styles.scholarshipLabel}>{scholarship.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Amount Section */}
                <View style={styles.amountSection}>
                    <View style={styles.amountCard}>
                        <View style={styles.amountTextContainer}>
                            <Text style={styles.amountLabel}>Amount under{'\n'}Full Scholarship:</Text>
                            <Text style={styles.amountValue}>${amount}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons name="create-outline" size={Platform.OS === 'android' ? 16 : 18} color="#fff" />
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>BACK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                        <Text style={styles.acceptButtonText}>ACCEPT</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <AcceptInterestModal
                visible={showAcceptModal}
                onLater={handleAcceptLater}
                onAssignMentor={handleAssignMentor}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
        paddingVertical: Platform.OS === 'android' ? 12 : 16,
    },
    headerTitle: {
        fontSize: Platform.OS === 'android' ? 18 : 20,
        fontWeight: '600',
        color: '#fff',
        marginLeft: Platform.OS === 'android' ? 6 : 8,
    },
    userCard: {
        marginHorizontal: Platform.OS === 'android' ? 12 : 16,
        marginBottom: Platform.OS === 'android' ? 12 : 16,
        padding: Platform.OS === 'android' ? 12 : 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: Platform.OS === 'android' ? 12 : 16,
        backgroundColor: 'transparent',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Platform.OS === 'android' ? 12 : 16,
    },
    avatar: {
        width: Platform.OS === 'android' ? 40 : 48,
        height: Platform.OS === 'android' ? 40 : 48,
        borderRadius: Platform.OS === 'android' ? 20 : 24,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Platform.OS === 'android' ? 10 : 12,
    },
    userName: {
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    userRole: {
        fontSize: Platform.OS === 'android' ? 14 : 15,
        color: '#fff',
    },
    contactIcons: {
        flexDirection: 'row',
        gap: Platform.OS === 'android' ? 8 : 12,
    },
    iconButton: {
        width: Platform.OS === 'android' ? 32 : 36,
        height: Platform.OS === 'android' ? 32 : 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleCard: {
        marginHorizontal: Platform.OS === 'android' ? 12 : 16,
        marginBottom: Platform.OS === 'android' ? 12 : 16,
        padding: Platform.OS === 'android' ? 12 : 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: Platform.OS === 'android' ? 12 : 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleLabel: {
        fontSize: Platform.OS === 'android' ? 14 : 16,
        fontWeight: '500',
        color: '#fff',
    },
    toggleOptions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Platform.OS === 'android' ? 8 : 12,
    },
    toggleText: {
        fontSize: Platform.OS === 'android' ? 14 : 16,
        fontWeight: '500',
        color: '#fff',
    },
    productCard: {
        marginHorizontal: Platform.OS === 'android' ? 12 : 16,
        marginBottom: Platform.OS === 'android' ? 12 : 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: Platform.OS === 'android' ? 12 : 16,
        overflow: 'hidden',
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Platform.OS === 'android' ? 12 : 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.5)',
    },
    productTitle: {
        fontSize: Platform.OS === 'android' ? 15 : 17,
        fontWeight: '600',
        color: '#fff',
    },
    scholarshipList: {
        padding: Platform.OS === 'android' ? 16 : 20,
    },
    scholarshipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Platform.OS === 'android' ? 20 : 24,
    },
    radioOuter: {
        width: Platform.OS === 'android' ? 20 : 24,
        height: Platform.OS === 'android' ? 20 : 24,
        borderRadius: Platform.OS === 'android' ? 10 : 12,
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Platform.OS === 'android' ? 12 : 16,
    },
    radioInner: {
        width: Platform.OS === 'android' ? 10 : 12,
        height: Platform.OS === 'android' ? 10 : 12,
        borderRadius: Platform.OS === 'android' ? 5 : 6,
        backgroundColor: '#000',
    },
    scholarshipLabel: {
        fontSize: Platform.OS === 'android' ? 14 : 16,
        fontWeight: '500',
        color: '#fff',
    },
    amountSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Platform.OS === 'android' ? 12 : 16,
        marginBottom: Platform.OS === 'android' ? 16 : 20,
        gap: Platform.OS === 'android' ? 6 : 8,
    },
    amountCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Platform.OS === 'android' ? 10 : 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: Platform.OS === 'android' ? 10 : 12,
    },
    amountTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    amountLabel: {
        fontSize: Platform.OS === 'android' ? 11 : 13,
        fontWeight: '500',
        color: '#fff',
        lineHeight: Platform.OS === 'android' ? 14 : 16,
        flex: 1,
    },
    amountValue: {
        fontSize: Platform.OS === 'android' ? 16 : 18,
        fontWeight: '700',
        color: '#FFC107',
        marginLeft: Platform.OS === 'android' ? 8 : 12,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Platform.OS === 'android' ? 3 : 4,
        paddingHorizontal: Platform.OS === 'android' ? 12 : 16,
        paddingVertical: Platform.OS === 'android' ? 8 : 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: Platform.OS === 'android' ? 8 : 10,
        minWidth: Platform.OS === 'android' ? 60 : 70,
    },
    editButtonText: {
        fontSize: Platform.OS === 'android' ? 12 : 14,
        fontWeight: '600',
        color: '#fff',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: Platform.OS === 'android' ? 10 : 12,
        marginHorizontal: Platform.OS === 'android' ? 16 : 20,
        marginBottom: Platform.OS === 'android' ? 16 : 20,
        paddingHorizontal: Platform.OS === 'android' ? 20 : 24,
    },
    backButton: {
        flex: 1,
        paddingVertical: Platform.OS === 'android' ? 10 : 12,
        backgroundColor: '#fff',
        borderRadius: Platform.OS === 'android' ? 8 : 10,
        alignItems: 'center',
        minHeight: Platform.OS === 'android' ? 40 : 44,
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: Platform.OS === 'android' ? 13 : 14,
        fontWeight: '700',
        color: '#1a5b77',
    },
    acceptButton: {
        flex: 1,
        paddingVertical: Platform.OS === 'android' ? 10 : 12,
        backgroundColor: 'rgba(30, 54, 111, 1)',
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: Platform.OS === 'android' ? 8 : 10,
        alignItems: 'center',
        minHeight: Platform.OS === 'android' ? 40 : 44,
        justifyContent: 'center',
    },
    acceptButtonText: {
        fontSize: Platform.OS === 'android' ? 13 : 14,
        fontWeight: '700',
        color: '#fff',
    },
});

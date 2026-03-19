import { icons } from '@/constants/images';
import { Mentee } from '@/types/mentee.types';
import { getFontSize, getIconSize, getSpacing } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Dimensions import is kept for existing style consistency (some builds rely on it elsewhere)
Dimensions.get('window');



interface MenteeCardProps {
    data: Mentee;
    layout?: 'card' | 'list' | 'full';
    isSelected?: boolean;
    disabled?: boolean;
    onToggleSelect?: () => void;
    onPress?: () => void;
    onCall?: () => void;
    onChat?: () => void;
    onMail?: () => void;
    onWhatsApp?: () => void;
    onMenuPress?: () => void;
    onMarkComplete?: () => void;
    onIssueCertificate?: () => void;
    onInviteAsFieldMentor?: () => void;
}

export default function MenteeCard({
    data,
    layout = 'full',
    isSelected = false,
    disabled = false,
    onToggleSelect,
    onPress,
    onCall,
    onChat,
    onMail,
    onWhatsApp,
    onMenuPress,
    onMarkComplete,
    onIssueCertificate,
    onInviteAsFieldMentor,
}: MenteeCardProps) {
    const isSelectionMode = onToggleSelect !== undefined;
    const displayName = data.username || data.firstName + (data.lastName ? ` ${data.lastName}` : '');
    const displaySubtext =
        (data.description && data.description.trim()) ||
        ((data as any).email as string | undefined) ||
        (data.phase ? `Phase : ${data.phase}` : '') ||
        'Tap to view roadmaps';

    // LIST VIEW (Compact)
    if (layout === 'list') {
        return (
            <Pressable style={[styles.listContainer, isSelected && styles.selectedCard, disabled && styles.disabledCard]}
                onPress={disabled ? undefined : (isSelectionMode ? onToggleSelect : onPress)}>
                <View style={styles.listImageContainer}>
                    {data.profilePicture ? (
                        <Image source={{ uri: data.profilePicture }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="person-outline" size={getIconSize(28)} color="#fff" />
                        </View>
                    )}
                </View>

                <View style={styles.listNameSection}>
                    <Text style={styles.listName} numberOfLines={1}>
                        {displayName}
                    </Text>
                </View>

                {(data.hasCompleted || data.hasIssuedCertificate || data.isFieldMentor) && (
                    <View style={styles.listBadges}>
                        {data.hasCompleted && (
                            <View style={styles.listBadgeIcon}>
                                <Image source={icons.fieldMentorIcon} style={{ width: getIconSize(18), height: getIconSize(18) }} resizeMode="contain" />
                            </View>
                        )}
                        {data.hasIssuedCertificate && (
                            <View style={styles.listBadgeIcon}>
                                <Image source={icons.certificateBadge} style={{ width: getIconSize(18), height: getIconSize(18) }} resizeMode="contain" />
                            </View>
                        )}
                        {!data.hasCompleted && data.isFieldMentor && (
                            <View style={styles.listBadgeIcon}>
                                <Image source={icons.fieldMentorIcon} style={{ width: getIconSize(18), height: getIconSize(18) }} resizeMode="contain" />
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.listIconsGroup}>
                    {onCall && (
                        <TouchableOpacity style={styles.listIconButton} onPress={(e) => { e.stopPropagation(); onCall(); }}>
                            <Ionicons name="call-outline" size={getIconSize(20)} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onChat && (
                        <TouchableOpacity style={styles.listIconButton} onPress={(e) => { e.stopPropagation(); onChat(); }}>
                            <Ionicons name="chatbubble-outline" size={getIconSize(20)} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onMail && (
                        <TouchableOpacity style={styles.listIconButton} onPress={(e) => { e.stopPropagation(); onMail(); }}>
                            <Ionicons name="mail-outline" size={getIconSize(20)} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onWhatsApp && (
                        <TouchableOpacity style={styles.listIconButton} onPress={(e) => { e.stopPropagation(); onWhatsApp(); }}>
                            <Ionicons name="logo-whatsapp" size={getIconSize(20)} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {isSelectionMode && (
                        <View style={styles.listIconButton}>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                            </View>
                        </View>
                    )}
                </View>

                {onMenuPress && (
                    <TouchableOpacity style={styles.listMenuButton} onPress={(e) => { e.stopPropagation(); onMenuPress(); }}>
                        <Ionicons name="ellipsis-vertical" size={getIconSize(20)} color="#fff" />
                    </TouchableOpacity>
                )}
            </Pressable>
        );
    }

    // CARD VIEW (For selection mode - remove/assign)
    if (layout === 'card' && isSelectionMode) {
        return (
            <TouchableOpacity
                style={[styles.selectionCard, isSelected && styles.selectedCard, disabled && styles.disabledCard]}
                onPress={disabled ? undefined : onToggleSelect}
                activeOpacity={disabled ? 1 : 0.8}
            >
                <View style={styles.checkboxContainer}>
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected, disabled && styles.disabledCheckbox]}>
                        {isSelected && <Ionicons name="checkmark" size={getIconSize(18)} color="#1A4882" />}
                    </View>
                </View>

                <View style={styles.topSection}>
                    <View style={styles.imageContainer}>
                        {data.profilePicture ? (
                            <Image source={{ uri: data.profilePicture }} style={[styles.image, disabled && styles.disabledImage]} resizeMode="cover" />
                        ) : (
                            <View style={[styles.placeholderImage, disabled && styles.disabledPlaceholder]}>
                                <Ionicons name="person-outline" size={getIconSize(40)} color="#fff" />
                            </View>
                        )}
                    </View>

                    <View style={styles.contentSection}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={[styles.name, disabled && styles.disabledText]} numberOfLines={1}>
                                {displayName}
                            </Text>
                            {disabled && (
                                <View style={styles.alreadyAssignedBadge}>
                                    <Text style={styles.alreadyAssignedText}>Already Assigned</Text>
                                </View>
                            )}
                        </View>

                        <Text style={styles.description} numberOfLines={3}>
                            {displaySubtext}
                        </Text>

                        {data.lastContacted && (
                            <Text style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Last Contacted : </Text>
                                <Text style={styles.infoValue}>{data.lastContacted}</Text>
                            </Text>
                        )}

                        {data.totalMentors !== undefined && (
                            <Text style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Total Mentors : </Text>
                                <Text style={styles.infoHighlight}>{data.totalMentors}</Text>
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.contactIcons}>
                    {onCall && (
                        <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onCall(); }}>
                            <Ionicons name="call-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onChat && (
                        <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onChat(); }}>
                            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onMail && (
                        <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onMail(); }}>
                            <Ionicons name="mail-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onWhatsApp && (
                        <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onWhatsApp(); }}>
                            <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    }

    // FULL CARD VIEW (For mentees list page + SCHOLARSHIP VIEW)
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            {/* Chevron Icon on Right */}
            {onMenuPress ? (
                <TouchableOpacity style={styles.menuButton} onPress={(e) => { e.stopPropagation(); onMenuPress(); }}>
                    <Ionicons name="ellipsis-vertical" size={getIconSize(20)} color="#fff" />
                </TouchableOpacity>
            ) : (
                <View style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                    <Ionicons name="chevron-forward" size={getIconSize(24)} color="#fff" />
                </View>
            )}

            {/* Top Badges */}
            {(data.hasCompleted || data.hasIssuedCertificate || data.isFieldMentor) && (
                <View style={styles.topBadges}>
                    {data.hasCompleted && (
                        <View style={styles.badgeIcon}>
                            <Image source={icons.fieldMentorIcon} style={{ width: getIconSize(18), height: getIconSize(18) }} resizeMode="contain" />
                        </View>
                    )}
                    {data.hasIssuedCertificate && (
                        <View style={styles.badgeIcon}>
                            <Image source={icons.certificateBadge} style={{ width: getIconSize(18), height: getIconSize(18) }} resizeMode="contain" />
                        </View>
                    )}
                    {!data.hasCompleted && data.isFieldMentor && (
                        <View style={styles.badgeIcon}>
                            <Image source={icons.fieldMentorIcon} style={{ width: getIconSize(18), height: getIconSize(18) }} resizeMode="contain" />
                        </View>
                    )}
                </View>
            )}

            {/* Top Section */}
            <View style={styles.topSection}>
                <View style={styles.imageContainer}>
                    {data.profilePicture ? (
                        <Image source={{ uri: data.profilePicture }} style={styles.image} resizeMode="cover" />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="person-outline" size={getIconSize(40)} color="#fff" />
                        </View>
                    )}
                </View>

                <View style={styles.contentSection}>
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                        {displayName}{data.role && ` (${data.role})`}
                    </Text>

                    <Text style={styles.description} numberOfLines={3}>
                        {displaySubtext}
                    </Text>

                    {!!data.phase && (
                        <View style={styles.phasePill}>
                            <Text style={styles.phasePillText} numberOfLines={2}>
                                <Text style={styles.phasePillLabel}>Phase :</Text> {data.phase}
                            </Text>
                        </View>
                    )}

                    {/* SCHOLARSHIP INFO */}
                    {data.scholarshipAmount && (
                        <View style={{ marginTop: getSpacing(6) }}>
                            <Text style={{ fontSize: getFontSize(12), color: '#fff', flexWrap: 'wrap' }}>
                                <Text style={{ fontWeight: '400' }}>Amount of Scholarship : </Text>
                                <Text style={{ fontWeight: '700', color: '#FFC107' }}>${data.scholarshipAmount}</Text>
                            </Text>
                        </View>
                    )}

                    {data.dateOfApproval && (
                        <View style={{ marginTop: getSpacing(4) }}>
                            <Text style={{ fontSize: getFontSize(12), color: '#fff', flexWrap: 'wrap' }}>
                                <Text style={{ fontWeight: '400' }}>Date of Approval : </Text>
                                <Text style={{ fontWeight: '700', color: '#FFC107' }}>{data.dateOfApproval}</Text>
                            </Text>
                        </View>
                    )}

                    {/* LEGACY INFO (when not showing scholarship) */}
                    {!data.scholarshipAmount && !data.hasCompleted && (
                        <>
                            {data.lastContacted && (
                                <Text style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Last Contacted : </Text>
                                    <Text style={styles.infoValue}>{data.lastContacted}</Text>
                                </Text>
                            )}

                            {data.totalMentors !== undefined && (
                                <Text style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Total Mentors : </Text>
                                    <Text style={styles.infoHighlight}>{data.totalMentors}</Text>
                                </Text>
                            )}
                        </>
                    )}
                </View>
            </View>

            {/* Contact Icons Row */}
            <View style={styles.contactRow}>
                <View style={styles.contactIcons}>
                    {onCall && (
                        <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onCall(); }}>
                            <Ionicons name="call-outline" size={getIconSize(20)} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onChat && (
                        <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onChat(); }}>
                            <Ionicons name="chatbubble-outline" size={getIconSize(20)} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onMail && (
                        <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onMail(); }}>
                            <Ionicons name="mail-outline" size={getIconSize(20)} color="#fff" />
                        </TouchableOpacity>
                    )}
                    {onWhatsApp && (
                        <TouchableOpacity style={styles.iconButton} onPress={(e) => { e.stopPropagation(); onWhatsApp(); }}>
                            <Ionicons name="logo-whatsapp" size={getIconSize(20)} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Phase or Completed Badge on Right */}
                {data.hasCompleted && data.completedOn ? (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Completed on :{data.completedOn}</Text>
                    </View>
                ) : null}
            </View>

            {/* Conditional Rendering Based on State */}
            {(() => {
                if (!data.hasCompleted && data.progress !== undefined && data.progress < 100) {
                    return (
                        <View style={styles.progressSection}>
                            <Text style={styles.progressLabel}>Progress</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${data.progress}%` }]} />
                            </View>
                            <Text style={styles.progressPercent}>{data.progress} %</Text>
                        </View>
                    );
                }

                if (!data.hasCompleted && data.progress === 100 && onMarkComplete) {
                    return (
                        <>
                            <View style={styles.progressSection}>
                                <Text style={styles.progressLabel}>Progress</Text>
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: '100%' }]} />
                                </View>
                                <Text style={styles.progressPercent}>100 %</Text>
                            </View>

                            <LinearGradient colors={['#7C3AED', '#38BDF8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBorder}>
                                <TouchableOpacity style={styles.completeButton} onPress={(e) => { e.stopPropagation(); onMarkComplete(); }}>
                                    <Text style={styles.completeButtonText}>Mark as Complete</Text>
                                    <Ionicons name="chevron-forward" size={getIconSize(18)} color="#FFC107" />
                                </TouchableOpacity>
                            </LinearGradient>
                        </>
                    );
                }

                if (data.hasCompleted && !data.hasIssuedCertificate && onIssueCertificate) {
                    return (
                        <LinearGradient colors={['#7C3AED', '#38BDF8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBorder}>
                            <TouchableOpacity style={styles.actionButton} onPress={(e) => { e.stopPropagation(); onIssueCertificate(); }}>
                                <Text style={styles.actionButtonText}>Issue Certificate</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    );
                }

                if (data.hasCompleted && data.hasIssuedCertificate && !data.isFieldMentor && onInviteAsFieldMentor) {
                    return (
                        <LinearGradient colors={['#7C3AED', '#38BDF8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientBorder}>
                            <TouchableOpacity style={styles.actionButton} onPress={(e) => { e.stopPropagation(); onInviteAsFieldMentor(); }}>
                                <Text style={styles.actionButtonText}>Invite as Field Mentor</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    );
                }

                return null;
            })()}
        </TouchableOpacity>
    );
}



const styles = StyleSheet.create({
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A4882',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: getSpacing(16),
        padding: getSpacing(10),
        marginBottom: getSpacing(10),
    },
    selectedCard: {
        borderColor: '#38BDF8',
        borderWidth: 2,
    },
    listImageContainer: {
        width: getSpacing(42),
        height: getSpacing(42),
        borderRadius: getSpacing(12),
        overflow: 'hidden',
        marginRight: getSpacing(10),
        flexShrink: 0,
    },
    listNameSection: {
        flex: 1,
        minWidth: 0,
    },
    listName: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#fff',
    },
    listBadges: {
        flexDirection: 'row',
        gap: getSpacing(6),
        marginRight: getSpacing(8),
    },
    listBadgeIcon: {
        width: getSpacing(18),
        height: getSpacing(18),
        borderRadius: getSpacing(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    listIconsGroup: {
        flexDirection: 'row',
    },
    listIconButton: {
        width: getSpacing(26),
        height: getSpacing(26),
        alignItems: 'center',
        justifyContent: 'center',
    },
    listMenuButton: {
        padding: getSpacing(4),
    },
    container: {
        backgroundColor: '#1A4882',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: getSpacing(16),
        padding: getSpacing(14),
        marginBottom: getSpacing(14),
        position: 'relative',
    },
    menuButton: {
        position: 'absolute',
        top: getSpacing(12),
        right: getSpacing(12),
        zIndex: 10,
        padding: getSpacing(4),
    },
    topBadges: {
        position: 'absolute',
        top: getSpacing(12),
        right: getSpacing(52),
        flexDirection: 'row',
        zIndex: 10,
    },
    badgeIcon: {
        width: getSpacing(26),
        height: getSpacing(26),
        borderRadius: getSpacing(14),
        alignItems: 'center',
        justifyContent: 'center',
    },
    topSection: {
        flexDirection: 'row',
        marginBottom: getSpacing(10),
        position: 'relative',
    },
    imageContainer: {
        width: getSpacing(90),
        height: getSpacing(115),
        borderRadius: getSpacing(12),
        overflow: 'hidden',
        marginRight: getSpacing(12),
        flexShrink: 0,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#14517D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentSection: {
        flex: 1,
        justifyContent: 'flex-start',
        minWidth: 0,
        paddingRight: getSpacing(74),
    },
    name: {
        fontSize: getFontSize(16),
        fontWeight: '600',
        color: '#fff',
        marginBottom: getSpacing(6),
    },
    description: {
        fontSize: getFontSize(12),
        color: 'rgba(255,255,255,0.8)',
        lineHeight: getFontSize(16),
        marginBottom: getSpacing(6),
    },
    phasePill: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        borderRadius: getSpacing(12),
        paddingVertical: getSpacing(8),
        paddingHorizontal: getSpacing(12),
        alignSelf: 'flex-start',
        marginBottom: getSpacing(8),
        maxWidth: '100%',
        backgroundColor: 'rgba(0,0,0,0.06)',
    },
    phasePillText: {
        fontSize: getFontSize(13),
        color: 'rgba(255,255,255,0.92)',
        lineHeight: getFontSize(18),
        fontWeight: '500',
        flexShrink: 1,
    },
    phasePillLabel: {
        fontWeight: '800',
        color: '#fff',
    },
    infoRow: {
        fontSize: getFontSize(12),
        marginBottom: getSpacing(3),
    },
    infoLabel: {
        color: '#fff',
    },
    infoValue: {
        color: 'rgba(255,255,255,0.8)',
    },
    infoHighlight: {
        color: '#FFC107',
        fontWeight: '600',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getSpacing(10),
    },
    contactIcons: {
        flexDirection: 'row',
        gap: getSpacing(3),
    },
    iconButton: {
        width: getSpacing(32),
        height: getSpacing(32),
        alignItems: 'center',
        justifyContent: 'center',
    },
    completedBadge: {
        flex: 1,
        marginLeft: getSpacing(12),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: getSpacing(20),
        paddingVertical: getSpacing(5),
        paddingHorizontal: getSpacing(10),
        alignItems: 'center',
    },
    completedText: {
        fontSize: getFontSize(11),
        color: '#fff',
        fontWeight: '500',
    },
    phaseBadge: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: getSpacing(20),
        paddingVertical: getSpacing(6),
        paddingHorizontal: getSpacing(14),
        marginBottom: getSpacing(10),
    },
    phaseText: {
        fontSize: getFontSize(12),
        color: '#fff',
        fontWeight: '500',
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: getSpacing(10),
    },
    progressLabel: {
        fontSize: getFontSize(12),
        color: '#fff',
        marginRight: getSpacing(8),
        minWidth: getSpacing(58),
    },
    progressBar: {
        flex: 1,
        height: getSpacing(7),
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: getSpacing(4),
        overflow: 'hidden',
        marginRight: getSpacing(10),
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: getSpacing(4),
    },
    progressPercent: {
        fontSize: getFontSize(13),
        fontWeight: '600',
        color: '#fff',
        minWidth: getSpacing(40),
        textAlign: 'right',
    },
    gradientBorder: {
        padding: getSpacing(2),
        borderRadius: getSpacing(13),
    },
    completeButton: {
        backgroundColor: '#1A4882',
        borderRadius: getSpacing(11),
        paddingVertical: getSpacing(12),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: getSpacing(8),
    },
    completeButtonText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#FFC107',
    },
    actionButton: {
        backgroundColor: '#1A4882',
        borderRadius: getSpacing(11),
        paddingVertical: getSpacing(12),
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: getFontSize(14),
        fontWeight: '600',
        color: '#fff',
    },
    selectionCard: {
        backgroundColor: '#1A4882',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: getSpacing(16),
        padding: getSpacing(14),
        marginBottom: getSpacing(14),
        position: 'relative',
    },
    checkboxContainer: {
        position: 'absolute',
        top: getSpacing(12),
        right: getSpacing(12),
        zIndex: 10,
    },
    checkbox: {
        width: getSpacing(22),
        height: getSpacing(22),
        borderRadius: getSpacing(6),
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    checkboxSelected: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    statusBadge: {
        flex: 1,
        marginLeft: getSpacing(12),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        borderRadius: getSpacing(20),
        paddingVertical: getSpacing(5),
        paddingHorizontal: getSpacing(10),
        alignItems: 'center',
        maxWidth: '60%',
    },
    statusText: {
        fontSize: getFontSize(10),
        color: '#fff',
        fontWeight: '500',
    },
    disabledCard: {
        opacity: 0.6,
        backgroundColor: 'rgba(26, 72, 130, 0.5)',
    },
    disabledText: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    disabledCheckbox: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    disabledImage: {
        opacity: 0.5,
    },
    disabledPlaceholder: {
        backgroundColor: '#1a3a5a',
    },
    alreadyAssignedBadge: {
        backgroundColor: '#FFC107',
        paddingHorizontal: getSpacing(6),
        paddingVertical: getSpacing(2),
        borderRadius: getSpacing(4),
        marginLeft: getSpacing(8),
    },
    alreadyAssignedText: {
        fontSize: getFontSize(10),
        color: '#1A4882',
        fontWeight: '700',
    },
});

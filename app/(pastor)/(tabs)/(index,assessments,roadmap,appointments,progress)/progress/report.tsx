
import { getFontSize, getSpacing, isSmallDevice } from '@/utils/responsive';
import { sharePdfFromHtml } from '@/utils/pdf';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DevelopmentPlan {
    id: number;
    text: string;
}

interface Section {
    title: string;
    plans: DevelopmentPlan[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_SECTIONS: Section[] = [
    {
        title: "Section 1 - Personal Well-Being",
        plans: [
            { id: 1, text: "Schedule 1-on-1 with a mentor" },
            { id: 2, text: "Take trauma survey (via Claritysoft)" },
            { id: 3, text: "Identify areas of stress/anxiety" },
            { id: 4, text: "Family Wellbeing survey" },
            { id: 5, text: "Collaborate on a healing plan" },
            { id: 6, text: "Collaborate on a physical Exercise plan" },
            { id: 7, text: "Establish a prayer" },
            { id: 8, text: "covenant/partnership" },
            { id: 9, text: "Finalize a growth plan" },
        ]
    },
    {
        title: "Section 2 - Professional Development",
        plans: [
            { id: 1, text: "Schedule 1-on-1 with a mentor" },
            { id: 2, text: "Take trauma survey (via Claritysoft)" },
            { id: 3, text: "Identify areas of stress/anxiety" },
            { id: 4, text: "Family Wellbeing survey" },
            { id: 5, text: "Collaborate on a healing plan" },
            { id: 6, text: "Collaborate on a physical Exercise plan" },
            { id: 7, text: "Establish a prayer" },
            { id: 8, text: "covenant/partnership" },
            { id: 9, text: "Finalize a growth plan" },
        ]
    },
    {
        title: "Section 3 - Community Engagement (CE) Experience",
        plans: [
            { id: 1, text: "Schedule 1-on-1 with a mentor" },
            { id: 2, text: "Take trauma survey (via Claritysoft)" },
            { id: 3, text: "Identify areas of stress/anxiety" },
            { id: 4, text: "Family Wellbeing survey" },
            { id: 5, text: "Collaborate on a healing plan" },
            { id: 6, text: "Collaborate on a physical Exercise plan" },
            { id: 7, text: "Establish a prayer" },
            { id: 8, text: "covenant/partnership" },
            { id: 9, text: "Finalize a growth plan" },
        ]
    },
    {
        title: "Section 4 - Congregational Health",
        plans: [
            { id: 1, text: "Schedule 1-on-1 with a mentor" },
            { id: 2, text: "Take trauma survey (via Claritysoft)" },
            { id: 3, text: "Identify areas of stress/anxiety" },
            { id: 4, text: "Family Wellbeing survey" },
            { id: 5, text: "Collaborate on a healing plan" },
            { id: 6, text: "Collaborate on a physical Exercise plan" },
            { id: 7, text: "Establish a prayer" },
            { id: 8, text: "covenant/partnership" },
            { id: 9, text: "Finalize a growth plan" },
        ]
    },
    {
        title: "Section 5 - Continuing Education",
        plans: [
            { id: 1, text: "Schedule 1-on-1 with a mentor" },
            { id: 2, text: "Take trauma survey (via Claritysoft)" },
            { id: 3, text: "Identify areas of stress/anxiety" },
            { id: 4, text: "Family Wellbeing survey" },
            { id: 5, text: "Collaborate on a healing plan" },
            { id: 6, text: "Collaborate on a physical Exercise plan" },
            { id: 7, text: "Establish a prayer" },
            { id: 8, text: "covenant/partnership" },
            { id: 9, text: "Finalize a growth plan" },
        ]
    }
];

export default function PMPReportScreen() {
    const { bottom, top } = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();

    const userName = String(params.userName || "John Ross");
    const completedDate = String(params.completedDate || "—");
    const assessmentTitle = String(params.assessmentTitle || "Pastoral Ministry Profile (PMP)");
    const autoDownload = String(params.autoDownload || "");

    const sections = DEFAULT_SECTIONS;

    const [isSaving, setIsSaving] = useState(false);
    const didAutoDownloadRef = useRef(false);

    const html = useMemo(() => {
        const escapeHtml = (value: string) =>
            value
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#039;');

        const sectionsHtml = sections
            .map((section) => {
                const plansHtml = section.plans
                    .map((p) => `<li>${escapeHtml(p.text)}</li>`)
                    .join('');
                return `
          <div class="section">
            <h2>${escapeHtml(section.title)}</h2>
            <h3>Customized Development Plans</h3>
            <ul>${plansHtml}</ul>
          </div>
        `;
            })
            .join('');

        return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: -apple-system, system-ui, Segoe UI, Roboto, Arial; padding: 24px; color: #0f172a; }
            .header { text-align: center; margin-bottom: 18px; }
            .name { font-size: 22px; font-weight: 700; margin: 0; }
            .date { font-size: 13px; color: #475569; margin: 6px 0 0; }
            .survey { margin: 18px 0 22px; }
            .surveyLabel { font-size: 14px; font-weight: 600; margin: 0 0 6px; color: #1e3a8a; }
            .surveyValue { font-size: 16px; font-weight: 700; margin: 0; color: #1e3a8a; }
            .section { margin-bottom: 22px; }
            h2 { font-size: 16px; margin: 0 0 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; color: #1e3a8a; }
            h3 { font-size: 14px; margin: 0 0 10px; color: #1e3a8a; }
            ul { margin: 0; padding-left: 18px; }
            li { margin: 0 0 8px; line-height: 1.35; }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="name">${escapeHtml(userName)}</p>
            <p class="date">Completed on: ${escapeHtml(completedDate)}</p>
          </div>
          <div class="survey">
            <p class="surveyLabel">Survey Name :</p>
            <p class="surveyValue">${escapeHtml(assessmentTitle)}</p>
          </div>
          ${sectionsHtml}
        </body>
      </html>
    `;
    }, [assessmentTitle, completedDate, sections, userName]);

    const handleSavePDF = useCallback(async () => {
        if (isSaving) return;
        setIsSaving(true);
        await sharePdfFromHtml({
            html,
            fileName: `${assessmentTitle.replaceAll(' ', '_')}_Report.pdf`,
        });
        setIsSaving(false);
    }, [assessmentTitle, html, isSaving]);

    const handleClose = () => {
        router.back();
    };

    useEffect(() => {
        if (autoDownload === '1' && !didAutoDownloadRef.current) {
            didAutoDownloadRef.current = true;
            handleSavePDF();
        }
    }, [autoDownload, handleSavePDF]);

    return (
        <View style={[styles.container, { paddingTop: top }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: bottom + getSpacing(120) }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Ionicons name="close" size={getFontSize(28)} color="#1E3A8A" />
                </TouchableOpacity>
                {}
                <View style={styles.header}>
                    <Image
                        source={require('@/assets/images/ccc-logo-1.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {}
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.completedDate}>Completed on: {completedDate}</Text>

                {}
                <View style={styles.surveyNameContainer}>
                    <Text style={styles.surveyNameLabel}>Survey Name :</Text>
                    <Text style={styles.surveyNameValue}>{assessmentTitle}</Text>
                </View>

                {}
                {sections.map((section, index) => (
                    <View key={index} style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>

                        <View style={styles.plansContainer}>
                            <Text style={styles.plansTitle}>Customized Development Plans :</Text>

                            {section.plans.map((plan) => (
                                <View key={plan.id} style={styles.planItem}>
                                    <Text style={styles.starIcon}>⭐</Text>
                                    <Text style={styles.planText}>{plan.text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View style={[styles.footerFixed, { paddingBottom: bottom + getSpacing(10) }]}>
                <TouchableOpacity
                    style={styles.savePDFButton}
                    onPress={handleSavePDF}
                    disabled={isSaving}
                >
                    <Ionicons name="download-outline" size={getFontSize(20)} color="#1E3A8A" />
                    <Text style={styles.savePDFText}>{isSaving ? 'Saving…' : 'Save PDF'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    closeButton: {
        position: 'relative',
        
        
        alignSelf: 'flex-end',
        zIndex: 10,
        padding: getSpacing(8),
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: getSpacing(isSmallDevice ? 20 : 24),
        
    },
    header: {
        alignItems: 'center',
        
        
    },
    logo: {
        width: SCREEN_WIDTH * 1.5,
        height: getSpacing(150),
    },
    userName: {
        fontSize: getFontSize(isSmallDevice ? 22 : 26),
        fontWeight: '700',
        color: '#1E3A8A',
        textAlign: 'center',
        marginBottom: getSpacing(10),
    },
    completedDate: {
        fontSize: getFontSize(isSmallDevice ? 14 : 15),
        color: '#64748B',
        textAlign: 'center',
        marginBottom: getSpacing(28),
    },
    surveyNameContainer: {
        marginBottom: getSpacing(32),
    },
    surveyNameLabel: {
        fontSize: getFontSize(isSmallDevice ? 16 : 17),
        color: '#1E3A8A',
        fontWeight: '600',
        marginBottom: getSpacing(6),
    },
    surveyNameValue: {
        fontSize: getFontSize(isSmallDevice ? 18 : 20),
        color: '#1E3A8A',
        fontWeight: '700',
    },
    sectionContainer: {
        marginBottom: getSpacing(32),
    },
    sectionHeader: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 2,
        borderBottomColor: '#1E3A8A',
        paddingBottom: getSpacing(10),
        marginBottom: getSpacing(18),
    },
    sectionTitle: {
        fontSize: getFontSize(isSmallDevice ? 17 : 19),
        fontWeight: '700',
        color: '#1E3A8A',
        lineHeight: getFontSize(isSmallDevice ? 24 : 26),
    },
    plansContainer: {
        backgroundColor: '#FFFFFF',
    },
    plansTitle: {
        fontSize: getFontSize(isSmallDevice ? 16 : 17),
        fontWeight: '600',
        color: '#1E3A8A',
        marginBottom: getSpacing(14),
    },
    planItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: getSpacing(12),
        paddingLeft: getSpacing(4),
    },
    starIcon: {
        fontSize: getFontSize(isSmallDevice ? 16 : 18),
        marginRight: getSpacing(10),
        marginTop: getSpacing(1),
    },
    planText: {
        flex: 1,
        fontSize: getFontSize(isSmallDevice ? 15 : 16),
        color: '#334155',
        lineHeight: getFontSize(isSmallDevice ? 22 : 24),
    },
    footerFixed: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: getSpacing(24),
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: 'rgba(15, 23, 42, 0.08)',
    },
    savePDFButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: getSpacing(8),
        paddingVertical: getSpacing(8),
    },
    savePDFText: {
        fontSize: getFontSize(isSmallDevice ? 16 : 17),
        fontWeight: '600',
        color: '#1E3A8A',
        textDecorationLine: 'underline',
    },
});

import { RelativePathString } from 'expo-router';
import { RevitalizationData } from './types';

export const mockRevitalization: RevitalizationData = {
    program: {
        id: 'revitalization',
        title: 'Revitalization Roadmap',
        phases: ['jump-start', 'phase-1', 'phase-2', 'phase-3'],
    },

    phases: {
        'jump-start': {
            id: 'jump-start',
            code: 'JUMP_START',
            title: 'Jump-start',
            subtitle: 'Attend a two-day revitalization jump-start session',
            estMonthsMin: 1,
            estMonthsMax: 2,
            coverImage: require('@/assets/images/jumpstart.png'),
            tasks: ['jump-start-session'],
            isSingleRoadmap: true,
        },

        'phase-1': {
            id: 'phase-1',
            code: 'PHASE_1',
            title: 'Self Revitalization Phase',
            subtitle: 'Conflict resolution and theory of change',
            estMonthsMin: 1,
            estMonthsMax: 2,
            coverImage: require('@/assets/images/roadmap.jpg'),
            tasks: [
                'p1-sign-roadmap',
                'p1-prayer-strategy',
                'p1-pastoral-profile',
                'p1-mentor-disciple',
                'p1-gods-vision',
                'p1-calendar',
                'p1-member-desciple',
                'p1-community-engagement',
            ],
        },

        'phase-2': {
            id: 'phase-2',
            code: 'PHASE_2',
            title: 'Church Empowerment Phase',
            subtitle: 'Community programs and long-term impact',
            estMonthsMin: 3,
            estMonthsMax: 9,
            coverImage: require('@/assets/images/roadmap.jpg'),
            tasks: [
                'p2-mou-with-ngos',
                'p2-facility-review',
                'p2-community-survey',
                'p2-run-pilot-program',
                'p2-upload-report',
                'p2-community-engagement',
                'p2-empower-leader'
            ],
        },

        'phase-3': {
            id: 'phase-3',
            code: 'PHASE_3',
            title: 'Community Revitalization and Multiplication',
            subtitle: 'Review outcomes and empower others',
            estMonthsMin: 10,
            estMonthsMax: 12,
            coverImage: require('@/assets/images/roadmap.jpg'),
            tasks: [
                'p3-train-new-coaches',
                'p3-plant-microgroups',
                'p3-measure-kpis',
                'p3-graduation',
                "p3-review"
            ],
        },
    },

    tasks: {
        // ========== JUMP-START ==========
        'jump-start-session': {
            id: 'jump-start-session',
            phaseId: 'jump-start',
            title: 'Jump-start Session',
            description: `1. Christ Method Alone (Why & How)
2. Self-Leadership
3. Dealing with Resistance
4. Empower Others-Spiritual Renewal
5. Community Engagement - Need Assessments
6. Cycle of Evangelism & Discipleship`,
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3"],
            queries: ["query-1", "query-2"],

            schema: {
                fields: [
                    {
                        id: 'session-notes',
                        type: 'TEXT_AREA',
                        label: 'Session Notes',
                        placeholder: 'Add your notes from the jump-start session...',
                        required: false,
                    },

                ],
                submitLabel: 'Jump-start Completed',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Attend a Jump-start Session in your area',
                hasOverviewTab: true,
            },
        },

        // ========== PHASE 1 ==========
        'p1-sign-roadmap': {
            id: 'p1-sign-roadmap',
            phaseId: 'phase-1',
            title: '12-Month Mentoring Revitalization Roadmap Approval',
            description: '12-Month Revitalization Roadmap for pastoral mentoring and church revitalization growth',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],

            schema: {
                fields: [
                    {
                        id: 'timeline-link',
                        type: 'TEXT_DISPLAY',
                        label: 'VIEW 12 MONTHS MENTORING TIMELINE MONTHS',
                    },
                    {
                        id: 'agreement-checkbox',
                        type: 'CHECKBOX',
                        label: 'I agree to participate in the 12-month revitalization mentoring and church growth roadmap provided by The Center for Community Change',
                        required: true,
                    },
                    // {
                    //     id: 'signature',
                    //     type: 'SIGNATURE',
                    //     label: 'Signature Required here',
                    //     required: true,
                    //     dependsOn: ['agreement-checkbox'],
                    // },
                ],
                submitLabel: 'Signature Required here',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Sign 12-Month Revitalization Roadmap',
            },
        },

        'p1-prayer-strategy': {
            id: 'p1-prayer-strategy',
            phaseId: 'phase-1',
            title: 'Prayer & Visit Strategy',
            description: 'Develop a prayer and visitation strategy and upload document',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'strategy-upload',
                        type: 'UPLOAD',
                        label: 'Upload Strategy',
                        accept: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                        maxSizeMB: 10,
                        maxFiles: 2,
                        required: true,
                    },
                ],
                // submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Create a prayer and visitation strategy',
            },
        },

        'p1-pastoral-profile': {
            id: 'p1-pastoral-profile',
            phaseId: 'phase-1',
            title: 'Pastoral Ministry Profile (PMP)',
            description: 'Complete a personal pastoral assessment evaluation.',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2",],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'pmp-survey',
                        type: 'SURVEY_BUTTON',
                        label: 'Take PMP Survey',
                        survey: 'PMP',
                        onPress: 'NAVIGATE',
                        navigateTo: '/(pastor-tabs)/(tabs)/assessments/survey-guidelines?assessmentId=assessment_002' as RelativePathString,
                    },
                ],
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Complete Pastoral Ministry Profile',
            },
        },

        'p1-mentor-disciple': {
            id: 'p1-mentor-disciple',
            phaseId: 'phase-1',
            title: 'Church Assessment Evaluation (CMA)',
            description: 'Complete a evaluation about your churck and its membership',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'cma-survey',
                        type: 'SURVEY_BUTTON',
                        label: 'Take CMA Survey',
                        survey: 'CMA',
                        onPress: 'NAVIGATE',
                        navigateTo: '/(pastor-tabs)/(tabs)/assessments/survey-guidelines?assessmentId=assessment_001' as RelativePathString,
                    },
                ],
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Identify a Mentor/Disciple',
            },
        },

        'p1-gods-vision': {
            id: 'p1-gods-vision',
            phaseId: 'phase-1',
            title: "God's Vision for your Church",
            description: 'View how you see your church as a Christ-formed place and develop a vision',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'vision-upload',
                        type: 'UPLOAD',
                        label: 'Upload Vision Document',
                        accept: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                        maxSizeMB: 50,
                        maxFiles: 3,
                        required: true,
                    },
                ],
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Create Vision for your church',
            },
        },

        'p1-calendar': {
            id: 'p1-calendar',
            phaseId: 'phase-1',
            title: 'Calendar',
            description: 'Create a calendar that will complement your vision for the church',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'calendar-upload',
                        type: 'UPLOAD',
                        label: 'Upload Calendar',
                        accept: ['application/pdf', 'text/calendar', 'application/vnd.ms-excel', 'text/csv'],
                        maxSizeMB: 5,
                        maxFiles: 1,
                        required: true,
                    },
                ],
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Create Vision Plan (calendar)',
            },
        },

        'p1-member-desciple': {
            id: 'p1-member-desciple',
            phaseId: 'phase-1',
            title: 'Identify a Mentor/Disciple',
            description: 'Select a church member who will support you on this journey',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'member-name',
                        type: 'TEXT_FIELD',
                        label: 'Name of Mentor/Disciple',
                        placeholder: 'Enter name of Mentor/Disciple here...',
                        required: true,
                    },

                ],
                submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Community Engagement Project',
            },
        },

        'p1-community-engagement': {
            id: 'p1-community-engagement',
            phaseId: 'phase-1',
            title: 'Community Engagement Project',
            description: 'Choose a community engagement project that aligns with your church',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'project-name',
                        type: 'TEXT_FIELD',
                        label: 'Community Engagement Project',
                        placeholder: 'Choose your community engagement project...',
                        required: true,
                    },
                    {
                        id: 'event1-date',
                        type: 'DATE_PICKER',
                        label: 'Community Engagement Project Date',
                        required: true,
                    },
                    {
                        id: 'event2-date',
                        type: 'SECTION_BOX',
                        label: 'Follow up Event 2',
                        fields: [
                            {
                                id: 'followup-event-name',
                                type: 'TEXT_FIELD',
                                label: 'Follow up Event Name 1',
                                placeholder: 'Choose your follow up event 1...',
                                required: true,
                            },
                            {
                                id: 'followup-event-date',
                                type: 'DATE_PICKER',
                                label: 'Follow up Event 1 Date',
                                required: true,
                            },
                        ]
                    },
                ],
                submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Community Engagement Project',
            },
        },

        // ========== PHASE 2 ==========
        'p2-mou-with-ngos': {
            id: 'p2-mou-with-ngos',
            phaseId: 'phase-2',
            title: 'Community Engagement Project',
            description: 'Complete a community engagement project with the Member/Disciple and share the stories of Gods work',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'project-date',
                        type: 'DATE_PICKER',
                        label: 'Project Date',
                        required: true,
                    },
                    {
                        id: 'image-video-upload',
                        type: 'UPLOAD',
                        label: 'Upload Images/Videos',
                        accept: ['image/*', 'video/*'],
                        maxSizeMB: 5,
                        maxFiles: 1,
                        required: true,
                    },
                ],
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '3',
            },
        },

        'p2-facility-review': {
            id: 'p2-facility-review',
            phaseId: 'phase-2',
            title: 'Facility Review',
            description: 'Complete a review of your facility and make the necessary minor adjustments to make it more visitor friendly',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'section',
                        type: 'SECTION_BOX',
                        // label: 'Facility Review Areas',
                        fields: [
                            {
                                id: 'adjustments-made',
                                type: 'TEXT_AREA',
                                label: 'Adjustments you have made',
                                placeholder: 'Explain the adjustments you have made...'
                            },
                            {
                                id: 'facility-review-date',
                                type: 'DATE_PICKER',
                                label: 'Facility Review Date',
                                required: true,
                            },
                        ]
                    },
                ],
                submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '3 - 4',
            },
        },

        'p2-community-survey': {
            id: 'p2-community-survey',
            phaseId: 'phase-2',
            title: 'Welcome Team',
            description: 'Develop a welcome team strategy and begin implementing that strategy, include a secret guest',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'section',
                        type: 'SECTION_BOX',
                        // label: 'Facility Review Areas',
                        fields: [
                            {
                                id: 'secret-guest-info',
                                type: 'TEXT_AREA',
                                label: 'Secret Guest Information',
                                placeholder: 'Enter the secret guest information here...'
                            },
                            {
                                id: 'welcome-team-meeting-date',
                                type: 'DATE_PICKER',
                                label: 'Welcome Team Meeting Date',
                                required: true,
                            },
                        ]
                    },
                ],
                submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '4 - 6',
            },
        },

        'p2-run-pilot-program': {
            id: 'p2-run-pilot-program',
            phaseId: 'phase-2',
            title: 'Guest Contact Information',
            description: 'Begin collecting guest contact information and measure guest follow-up',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'attendance-tracker-system',
                        type: 'TEXT_AREA',
                        label: 'Name Of The Attendance Tracker System',
                        placeholder: 'Enter the name of the attendance tracker system information here...'
                    },
                ],
                submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '6 - 7',
            },
        },

        'p2-upload-report': {
            id: 'p2-upload-report',
            phaseId: 'phase-2',
            title: 'Community Assessment',
            description: 'Refine your understanding of the needs in your community by using a community assessment tool',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'report-upload',
                        type: 'UPLOAD',
                        label: 'Upload Assessment Results',
                        accept: ['application/pdf'],
                        maxSizeMB: 20,
                        maxFiles: 2,
                        required: true,
                    },
                ],
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '8 - 9',
            },
        },

        'p2-community-engagement': {
            id: 'p2-community-engagement',
            phaseId: 'phase-2',
            title: 'Community Engagement Events',
            description: 'Plan two community engagement events with at least 1 follow-up bridge event that addresses felt needs in the community',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'event2-date',
                        type: 'SECTION_BOX',
                        label: 'Community Engagement Event 1',
                        fields: [
                            {
                                id: 'events-for-community-engagement-1',
                                type: 'TEXT_FIELD',
                                label: 'Events For Community Engagement Event 1',
                                placeholder: 'List here...',
                                required: true,
                            },
                            {
                                id: 'community-engagement-event-1-date',
                                type: 'DATE_PICKER',
                                label: 'Community Engagement Event 1 Date',
                                required: true,
                            },
                            {
                                id: 'event2-date',
                                type: 'SECTION_BOX',
                                label: 'Follow up events',
                                fields: [
                                    {
                                        id: 'follow-up-event-1',
                                        type: 'TEXT_FIELD',
                                        label: 'Follow Up Event 1',
                                        placeholder: 'List here...',
                                        required: true,
                                    },
                                    {
                                        id: 'community-engagement-event-1-date',
                                        type: 'DATE_PICKER',
                                        label: 'Follow up Event 1 Date',
                                        required: true,
                                    },
                                    {
                                        id: 'image-video-upload',
                                        type: 'UPLOAD',
                                        label: 'Upload Images/Videos',
                                        accept: ['image/*', 'video/*'],
                                        maxSizeMB: 5,
                                        maxFiles: 1,
                                    },
                                    {
                                        id: 'submit-button',
                                        type: 'BUTTON',
                                        label: 'Submit',
                                        onPress: 'SUBMIT',

                                    }
                                ]
                            },
                        ]
                    },
                    {
                        id: 'event2-date',
                        type: 'SECTION_BOX',
                        label: 'Community Engagement Event 2',
                        fields: [
                            {
                                id: 'events-for-community-engagement-2',
                                type: 'TEXT_FIELD',
                                label: 'Events For Community Engagement Event 2',
                                placeholder: 'List here...',
                                required: true,
                            },
                            {
                                id: 'community-engagement-event-2-date',
                                type: 'DATE_PICKER',
                                label: 'Community Engagement Event 2 Date',
                                required: true,
                            },
                            {
                                id: 'event2-date',
                                type: 'SECTION_BOX',
                                label: 'Follow up events',
                                fields: [
                                    {
                                        id: 'follow-up-event-1',
                                        type: 'TEXT_FIELD',
                                        label: 'Follow Up Event 1',
                                        placeholder: 'List here...',
                                        required: true,
                                    },
                                    {
                                        id: 'community-engagement-event-1-date',
                                        type: 'DATE_PICKER',
                                        label: 'Follow up Event 1 Date',
                                        required: true,
                                    },
                                    {
                                        id: 'image-video-upload',
                                        type: 'UPLOAD',
                                        label: 'Upload Images/Videos',
                                        accept: ['image/*', 'video/*'],
                                        maxSizeMB: 5,
                                        maxFiles: 1,
                                    },
                                    {
                                        id: 'submit-button',
                                        type: 'BUTTON',
                                        label: 'Submit',
                                        onPress: 'SUBMIT',

                                    }
                                ]
                            },
                        ]
                    },
                ],
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '1 - 2',
                roadmapText: 'Community Engagement Project',
            },
        },
        'p2-empower-leader': {
            id: 'p2-empower-leader',
            phaseId: 'phase-2',
            title: 'Empower Ministry Leaders',
            description: 'Begin empowering ministry leaders into calendar activities in the worship service and offering a regular new member opportunities to come to the church service. Include a lay Bible "worker" role',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'calendar-upload',
                        type: 'UPLOAD',
                        label: 'Upload Calendar',
                        accept: ['application/pdf', 'text/calendar', 'application/vnd.ms-excel', 'text/csv'],
                        maxSizeMB: 20,
                        maxFiles: 1,
                        required: true,
                    },
                ],
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '8 - 9',
            },
        },
        // ========== PHASE 3 ==========
        'p3-train-new-coaches': {
            id: 'p3-train-new-coaches',
            phaseId: 'phase-3',
            title: 'Inactive Member List',
            description: 'Develop an inactive member list and aa relationship map',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'meeting-section-1',
                        type: 'SECTION_BOX',
                        fields: [
                            {
                                id: 'meeting-1-date',
                                type: 'DATE_PICKER',
                                label: 'Meeting Date 1',
                                required: true,
                            },
                            {
                                id: 'name',
                                type: 'TEXT_FIELD',
                                label: 'Number of inactive members',
                                placeholder: 'Submit number of inactive members..',
                                required: true,
                            },
                            {
                                id: 'submit-button',
                                type: 'BUTTON',
                                label: 'Submit',
                                onPress: 'SUBMIT',

                            }

                        ],
                    },
                    {
                        id: 'meeting-section-2',
                        type: 'SECTION_BOX',
                        fields: [
                            {
                                id: 'meeting-2-date',
                                type: 'DATE_PICKER',
                                label: 'Meeting Date 2',
                                required: true,
                            },
                            {
                                id: 'name',
                                type: 'TEXT_FIELD',
                                label: 'Number of inactive members',
                                placeholder: 'Submit number of inactive members..',
                                required: true,
                            },
                            {
                                id: 'submit-button',
                                type: 'BUTTON',
                                label: 'Submit',
                                onPress: 'SUBMIT',

                            }

                        ],
                    },
                ],
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '10',
            },
        },

        'p3-plant-microgroups': {
            id: 'p3-plant-microgroups',
            phaseId: 'phase-3',
            title: 'Doorway Events',
            description: 'Schedule at least three intentional "doorway" events on your church calendar and invite inactive members to attend',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'event-date-1',
                        type: 'DATE_PICKER',
                        label: 'Date of Event 1',
                        required: true,
                    },
                    {
                        id: 'event-date-2',
                        type: 'DATE_PICKER',
                        label: 'Date of Event 2',
                        required: true,
                    },
                    {
                        id: 'event-date-3',
                        type: 'DATE_PICKER',
                        label: 'Date of Event 3',
                        required: true,
                    },
                ],
                submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '11',
            },
        },

        'p3-measure-kpis': {
            id: 'p3-measure-kpis',
            phaseId: 'phase-3',
            title: 'CMA Assessment',
            description: 'Review the first CMA Assessment survey and retake the survey for revitalization results',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'review-date',
                        type: 'DATE_PICKER',
                        label: 'Review Date',
                        defaultValue: '10 / 11 / 24',
                    },
                    {
                        id: 'cma-survey',
                        type: 'SURVEY_BUTTON',
                        label: 'Take CMA Survey',
                        survey: 'CMA',
                        onPress: 'NAVIGATE',
                        navigateTo: '/(pastor-tabs)/(tabs)/assessments/survey-guidelines?assessmentId=assessment_001' as RelativePathString,
                    },
                ],
                // submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '11 - 12',
            },
        },

        'p3-graduation': {
            id: 'p3-graduation',
            phaseId: 'phase-3',
            title: 'Attendance',
            description: 'Develop an intentional strategy for noticing lack of attendance',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'graduation-date',
                        type: 'DATE_PICKER',
                        label: 'Proclamation Event Date',
                        defaultValue: '10 / 11 / 24',
                    },
                ],
                submitLabel: 'Mark as Completed',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '12',
            },
        },
        'p3-review': {
            id: 'p3-review',
            phaseId: 'phase-3',
            title: 'Final Revitalization Review',
            description: 'Celebrate wins and identify next steps for growth',
            status: 'NOT_STARTED',
            comments: ["comment-1", "comment-2", "comment-3", "comment-4"],
            queries: ["query-1", "query-2"],


            schema: {
                fields: [
                    {
                        id: 'thanks-giving-date',
                        type: 'DATE_PICKER',
                        label: 'Praise and thanks giving date',
                        defaultValue: '10 / 11 / 24',
                    },
                    {
                        id: 'image-video-upload',
                        type: 'UPLOAD',
                        label: 'Upload Images/Videos',
                        accept: ['image/*', 'video/*'],
                        maxSizeMB: 5,
                        maxFiles: 1,
                        required: true,
                    },
                ],
                submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '12',
            },
        },
    },


    comments: {
        "comment-1": {
            id: "comment-1",
            taskId: "task-1",
            author: {
                id: "user-john-doe",
                name: "John Doe",
                role: "Mentor",
                avatar: require('@/assets/icons/user.png')
            },
            content: "Needs improvement. Refer XYZ document",
            timestamp: "2024-10-22T09:41:00Z",
            status: "UNREAD"
        },

        "comment-2": {
            id: "comment-2",
            taskId: "task-1",
            author: {
                id: "user-robin-roe",
                name: "Robin Roe",
                role: "Project Manager",
                avatar: require('@/assets/icons/user.png')
            },
            content: "Needs improvement. Refer XYZ document",
            timestamp: "2024-10-21T10:00:00Z",
            status: "READ",
        },

        "comment-3": {
            id: "comment-3",
            taskId: "task-1",
            author: {
                id: "user-john-doe",
                name: "John Doe",
                role: "Mentor",
                avatar: require('@/assets/icons/user.png')
            },
            content: "No need to spend time researching this area. Focus on the other sub group.",
            timestamp: "2024-10-21T08:30:00Z",
            status: "READ"
        },

        "comment-4": {
            id: "comment-4",
            taskId: "task-2",
            author: {
                id: "user-john-doe",
                name: "John Doe",
                role: "Mentor",
                avatar: require('@/assets/icons/user.png')
            },
            content: "Needs improvement. Refer XYZ document",
            timestamp: "2024-10-09T00:00:00Z",
            status: "UNREAD"
        }
    },

    queries: {
        "query-1": {
            id: "query-1",
            author: {
                id: "user-me",
                name: "Me",
                avatar: require('@/assets/icons/user.png')
            },
            question: "Is it possible for you to get me a letter stating that my volunteering is part of this course to submit to my church committee?",
            timestamp: "2024-09-22T00:00:00Z",
            status: "PENDING",
            responses: [],
            hasResponse: false
        },
        "query-2": {
            id: "query-2",
            author: {
                id: "user-me",
                name: "Me",
                avatar: require('@/assets/icons/user.png')
            },
            question: "Is it possible for you to get me a letter stating that my volunteering is part of this course to submit to my church committee?",
            timestamp: "2024-09-22T00:00:00Z",
            status: "ANSWERED",
            responses: ["response-1"],
            hasResponse: true
        },
        "query-3": {
            id: "query-3",
            author: {
                id: "user-me",
                name: "Me",
                avatar: require('@/assets/icons/user.png')
            },
            question: "When will the next phase materials be available?",
            timestamp: "2024-09-20T00:00:00Z",
            status: "ANSWERED",
            responses: ["response-2"],
            hasResponse: true
        },
        "query-4": {
            id: "query-4",
            author: {
                id: "user-me",
                name: "Me",
                avatar: require('@/assets/icons/user.png')
            },
            question: "Can I submit the documentation in digital format?",
            timestamp: "2024-09-21T00:00:00Z",
            status: "PENDING",
            responses: [],
            hasResponse: false
        }
    },

    queryResponses: {
        "response-1": {
            id: "response-1",
            queryId: "query-2",
            content: "I do not have the authority to do that. Please contact Project Manager",
            timestamp: "2024-09-22T10:00:00Z",
            author: {
                id: "mentor-john",
                name: "John Doe",
                role: "Mentor",
                avatar: require('@/assets/icons/user.png')
            }
        },
        "response-2": {
            id: "response-2",
            queryId: "query-3",
            content: "The Phase 1 materials will be available by the end of this month. You will receive an email notification once they are ready.",
            timestamp: "2024-09-20T14:30:00Z",
            author: {
                id: "mentor-john",
                name: "John Doe",
                role: "Mentor",
                avatar: require('@/assets/icons/user.png')
            }
        }
    }

};

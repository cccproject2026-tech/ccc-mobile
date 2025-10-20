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
            schema: {
                fields: [
                    {
                        id: 'session-notes',
                        type: 'TEXT_AREA',
                        label: 'Session Notes',
                        placeholder: 'Add your notes from the jump-start session...',
                        required: false,
                    },
                    {
                        id: 'static-session-date',
                        type: 'DATE_PICKER',
                        label: 'Session Date',
                        editable: false,
                        defaultValue: '10 / 11 / 24',
                    },

                    {
                        id: 'contact-section',
                        type: 'SECTION_BOX',
                        label: 'Personal Details',
                        fields: [
                            {
                                id: 'name',
                                type: 'TEXT_FIELD',
                                label: 'Name of Mentor/Disciple',
                                placeholder: 'Enter full name',
                                required: true,
                            },
                            {
                                id: 'email',
                                type: 'TEXT_FIELD',
                                label: 'Email',
                                placeholder: 'example@email.com',
                                required: true,
                            },
                            {
                                id: 'phone',
                                type: 'TEXT_FIELD',
                                label: 'Phone Number',
                                placeholder: '+1 (555) 123-4567',
                                required: true,
                            },
                            {
                                id: 'role',
                                type: 'DROPDOWN',
                                label: 'Role',
                                options: ['Mentor', 'Disciple'],
                                required: true,
                            },
                        ],
                    },
                ],
                submitLabel: 'Mark as Completed',
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
            schema: {
                fields: [
                    {
                        id: 'pmp-survey',
                        type: 'SURVEY_BUTTON',
                        label: 'Take PMP Survey',
                        survey: 'PMP',
                        onPress: 'NAVIGATE',
                        navigateTo: '/(pastor-tabs)/(tabs)/assessments/(pmp)/pmp-survey-page',
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
            schema: {
                fields: [
                    {
                        id: 'cma-survey',
                        type: 'SURVEY_BUTTON',
                        label: 'Take CMA Survey',
                        survey: 'CMA',
                        onPress: 'NAVIGATE',
                        navigateTo: '/(pastor-tabs)/(tabs)/assessments/cma-survey-page',
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
            title: 'Train New Coaches',
            description: 'Run a coach training weekend',
            status: 'NOT_STARTED',
            schema: {
                fields: [
                    {
                        id: 'training-checklist',
                        type: 'CHECKLIST',
                        label: 'Training Preparation',
                        required: true,
                        items: [
                            { id: 't1', label: 'Curriculum prepared', checked: false },
                            { id: 't2', label: '15 attendees confirmed', checked: false },
                        ],
                    },
                ],
                submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '10',
            },
        },

        'p3-plant-microgroups': {
            id: 'p3-plant-microgroups',
            phaseId: 'phase-3',
            title: 'Plant Micro-groups',
            description: 'Launch 5 micro-groups',
            status: 'NOT_STARTED',
            schema: {
                fields: [
                    {
                        id: 'groups-started',
                        type: 'TEXT_FIELD',
                        label: 'Number of Groups Started',
                        validation: { min: 5 },
                        required: true,
                    },
                    {
                        id: 'locations',
                        type: 'TEXT_AREA',
                        label: 'Locations',
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
            title: 'Measure KPIs',
            description: 'Submit quarterly metrics',
            status: 'NOT_STARTED',
            schema: {
                fields: [
                    {
                        id: 'kpi-upload',
                        type: 'UPLOAD',
                        label: 'Upload KPI Report',
                        accept: ['text/csv', 'application/vnd.ms-excel'],
                        maxSizeMB: 10,
                        maxFiles: 1,
                        required: true,
                    },
                ],
                submitLabel: 'Submit',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '11 - 12',
            },
        },

        'p3-graduation': {
            id: 'p3-graduation',
            phaseId: 'phase-3',
            title: 'Graduation',
            description: 'Final review and certificate issue',
            status: 'NOT_STARTED',
            schema: {
                fields: [
                    {
                        id: 'graduation-date',
                        type: 'DATE_PICKER',
                        label: 'Schedule Graduation Meeting',
                        required: true,
                    },
                    {
                        id: 'meeting-notes',
                        type: 'TEXT_AREA',
                        label: 'Meeting Notes (Optional)',
                        placeholder: 'Add any notes about the graduation...',
                    },
                ],
                submitLabel: 'Complete',
            },
            meta: {
                coverImage: require('@/assets/images/roadmap.jpg'),
                completionTimeMonths: '12',
            },
        },
    },
};

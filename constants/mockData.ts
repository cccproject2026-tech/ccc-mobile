// import { Mentee } from "@/components/director/MenteeCard";
import { icons } from "./images";

export const appointments = [
  {
    id: "1",
    date: "04 Aug 24",
    time: "11:30",
    tz: "EST",
    person: "Pr. John Ross",
    role: "Mentor",
    mode: "Duo",
    icon: icons.duoMeet,
  },
  {
    id: "2",
    date: "11 Aug 24",
    time: "11:30",
    tz: "EST",
    person: "Pr. John Ross",
    role: "Field Mentor",
    mode: "Google Meet",
    icon: icons.googleMeet,
  },
];

export const newInterests = [
  {
    id: "1",
    name: "John Ross",
    role: "Pastor",
    time: "9:43 am",
  },
  {
    id: "2",
    name: "John Ross",
    role: "Pastor",
    time: "9:43 am",
  },
  {
    id: "3",
    name: "John Ross",
    role: "Pastor",
    time: "9:43 am",
  },
];

export const exploreItems = [
  {
    id: "1",
    icon: icons.progress,
    title: "Track Progress",
    route: "/(director-tabs)/(tabs)/progress-tracker",
  },
  {
    id: "2",
    icon: icons.schedule,
    title: "Schedule",
    route: "/(director-tabs)/(tabs)/appointments",
  },
  {
    id: "3",
    icon: icons.microGrant,
    title: "Microgrant",
    route: "/(director-tabs)/(tabs)/micro-grant",
  },
  {
    id: "4",
    icon: icons.Revitalization,
    title: "Revitalization Roadmap",
    route: "/(director-tabs)/(tabs)/revitalization-roadmaps",
  },
  { id: "5", icon: icons.Assessments, title: "Assessment" },
  { id: "6", icon: icons.assignmentIcon, title: "Assignment" },
];

export const mentorExploreItems = [
  {
    id: "1",
    icon: icons.profile,
    title: "Track Progress",
    route: "/(mentor)/mentees/progress-tracker",
  },
  {
    id: "2",
    icon: icons.Assessments,
    title: "Schedule",
    route: "/(mentor)/(tabs)/appointments",
  },
  {
    id: "3",
    icon: icons.microGrant,
    title: "Microgrant",
    route: "/(mentor)/profile/grant",
  },
  {
    id: "4",
    icon: icons.Revitalization,
    title: "Revitalization Roadmap",
    route: "/(mentor)/roadmap/landing/landing",
  },
  {
    id: "5",
    icon: icons.Assessments,
    title: "Assessment",
    route: "/(mentor)/assessments-v2",
  },
  {
    id: "6",
    icon: icons.assignment,
    title: "Assignment",
    route: "/(mentor)/profile/my-assignment/assignment",
  },
];
export const stats = [
  { id: "1", label: "Total Mentors", value: "501" },
  { id: "2", label: "Total Pastors", value: "501" },
  { id: "3", label: "Pastors Completed", value: "501" },
];

// export const mockMentees: Mentee[] = [
//     // STATE 1: Progress < 100% - Show phase + progress bar ONLY
//     {
//         id: '1',
//         name: 'John Doe',
//         role: 'Pastor',
//         description: 'Sub text area write something here. That you can read more about him',
//         lastContacted: '5 Days Ago',
//         totalMentors: 5,
//         phase: 'Church Empowerment',
//         phaseNumber: 2,
//         progress: 70,
//         isCompleted: false,
//         profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
//     },
//     {
//         id: '2',
//         name: 'Jane Smith',
//         role: 'Pastor',
//         description: 'Sub text area write something here. That you can read more about him',
//         lastContacted: '3 Days Ago',
//         totalMentors: 5,
//         phase: 'Self Revitalization',
//         phaseNumber: 3,
//         progress: 45,
//         isCompleted: false,
//         profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
//     },

//     // STATE 2: Progress = 100% but NOT marked complete - Show "Mark as Complete" button
//     {
//         id: '3',
//         name: 'John Ross',
//         role: 'Pastor',
//         description: 'Sub text area write something here. That you can read more about him',
//         lastContacted: '5 Days Ago',
//         totalMentors: 5,
//         phase: 'Community Revitalization and Multiplication',
//         phaseNumber: 1,
//         progress: 100,
//         isCompleted: false,
//         profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
//     },

//     // STATE 3: Marked complete but NO certificate - Show "Issue Certificate" button
//     {
//         id: '4',
//         name: 'Sarah Johnson',
//         role: 'Pastor',
//         description: 'Sub text area write something here. That you can read more about him',
//         totalMentors: 5,
//         isCompleted: true,
//         completedOn: '20 Oct 2024',
//         hasCertificate: false,
//         isFieldMentor: false,
//         profileImage: 'https://randomuser.me/api/portraits/women/45.jpg',
//     },
//     {
//         id: '5',
//         name: 'Michael Brown',
//         role: 'Pator',
//         description: 'Sub text area write something here. That you can read more about him',
//         totalMentors: 5,
//         isCompleted: true,
//         completedOn: '15 Oct 2024',
//         hasCertificate: false,
//         isFieldMentor: false,
//         profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
//     },

//     // STATE 4: Certificate issued but NOT field mentor - Show "Invite as Field Mentor" button + certificate badge
//     {
//         id: '6',
//         name: 'David Wilson',
//         role: 'Pastor',
//         description: 'Sub text area write something here. That you can read more about him',
//         totalMentors: 5,
//         isCompleted: true,
//         completedOn: '10 Oct 2024',
//         hasCertificate: true,
//         isFieldMentor: false,
//         profileImage: 'https://randomuser.me/api/portraits/men/35.jpg',
//     },
//     {
//         id: '7',
//         name: 'Emily Davis',
//         role: 'Pastor',
//         description: 'Sub text area write something here. That you can read more about him',
//         totalMentors: 5,
//         isCompleted: true,
//         completedOn: '12 Oct 2024',
//         hasCertificate: true,
//         isFieldMentor: false,
//         profileImage: 'https://randomuser.me/api/portraits/women/46.jpg',
//     },

//     // STATE 5: Both certificate AND field mentor - Show only badges, no button
//     {
//         id: '8',
//         name: 'Robert Taylor',
//         role: 'Pastor',
//         description: 'Sub text area write something here. That you can read more about him',
//         totalMentors: 5,
//         isCompleted: true,
//         completedOn: '5 Oct 2024',
//         hasCertificate: true,
//         isFieldMentor: true,
//         profileImage: 'https://randomuser.me/api/portraits/men/36.jpg',
//     },
//     {
//         id: '9',
//         name: 'Lisa Anderson',
//         role: 'Pastor',
//         description: 'Sub text area write something here. That you can read more about him',
//         totalMentors: 5,
//         isCompleted: true,
//         completedOn: '8 Oct 2024',
//         hasCertificate: true,
//         isFieldMentor: true,
//         profileImage: 'https://randomuser.me/api/portraits/women/47.jpg',
//     },
// ];

export const STATES = ["North American", "Canada", "Mexico", "Brazil"];

import { ImageSourcePropType } from "react-native";

export interface TaskStatus {
  notStarted: boolean;
  started: boolean;
  inProgress: number;
  toComplete: number;
  completed: boolean;
}

export interface RoadmapProgress {
  title: string;
  description?: string;
  time?: string;
  status: "Due" | "In Progress" | "Not Started Yet" | "Completed";
  image: ImageSourcePropType;
  progress: string;
  taskStatus: TaskStatus;
  completedTime?: string;
  type?: "roadmap";
  dueDate?: string;
}

export interface AssessmentProgress {
  title: string;
  description?: string;
  image: ImageSourcePropType;
  progress: string;
  taskStatus: TaskStatus;
  dueDate?: string;
  submittedDate?: string;
  status: "Due" | "Completed" | "due";
  type: "assessment";
  completed?: string;
}

export type ProgressCardData = RoadmapProgress | AssessmentProgress;

export const dummyRoadMapsCompleted = [
  {
    title: "Jump-start",
    description: "Interested in receiving mentoring in community engagement",
    time: "Completion Time Months 3 - 9",
    type: "roadmap",
    read: true,
    status: "Completed",
    image: require("@/assets/images/roadmap.jpg"),
    progress: "0",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 0,
      toComplete: 0,
      completed: false,
    },
    completedTime: "20 Oct 2024",
  },
  {
    title: "Self Revitalizaiton Phase",
    description: "Interested in receiving mentoring in community engagement",
    time: "Completion Time Months 1 - 2",
    completedTime: "20 Oct 2024",
    status: "Completed",
    type: "roadmap",
    image: require("@/assets/images/jumpstart.png"),
    progress: "0",
    taskStatus: {
      notStarted: false,
      started: false,
      inProgress: 0,
      toComplete: 0,
      completed: false,
    },
  },
];

export const dummyRoadMaps = [
  {
    title: "Self Revitalizaiton Phase",
    time: "Completion Time Months 1 - 2",
    description: "Interested in receiving mentoring in community engagement",
    status: "Due",
    type: "roadmap",
    image: require("@/assets/images/jumpstart.png"),
    progress: "1",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 1,
      toComplete: 0,
      completed: false,
    },
  },
  {
    title: "Church Empowerment Phase",
    time: "Completion Time Months 3 - 9",
    description: "Interested in receiving mentoring in community engagement",
    status: "In Progress",
    image: require("@/assets/images/roadmap.jpg"),
    type: "roadmap",

    progress: "1",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 2,
      toComplete: 0,
      completed: false,
    },
  },
  {
    title: " Community Revitalization and Multiplication Phase",
    time: "Completion Time Months 3 - 9",
    description: "Interested in receiving mentoring in community engagement",
    read: true,
    status: "Not Started Yet",
    type: "roadmap",

    image: require("@/assets/images/roadmap.jpg"),
    progress: "0",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 0,
      toComplete: 0,
      completed: false,
    },
  },
  {
    title: "Jump-start",
    description: "Interested in receiving mentoring in community engagement",
    time: "Completion Time Months 3 - 9",
    type: "roadmap",
    read: true,
    status: "Completed",
    image: require("@/assets/images/roadmap.jpg"),
    progress: "0",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 0,
      toComplete: 0,
      completed: false,
    },
    completedTime: "20 Oct 2024",
  },
];

export const dummyAssessment = [
  {
    title: "Church Assessment Evaluation(CMA)",
    description: "Interested in receiving mentoring in community engagement   ",
    image: require("@/assets/images/jumpstart.png"),
    progress: "0",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 0,
      toComplete: 0,
      completed: false,
    },
    submittedDate: "20 Oct 2024",
    status: "Completed",
    type: "assessment",
  },
  {
    title: "Church Assessment Evaluation(CMA)",
    description: "Interested in receiving mentoring in community engagement   ",
    image: require("@/assets/images/jumpstart.png"),
    progress: "0",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 0,
      toComplete: 0,
      completed: false,
    },
    submittedDate: "20 Oct 2024",
    status: "Completed",
    type: "assessment",
  },
  {
    title: "Church Assessment Evaluation(CMA)",
    description: "Interested in receiving mentoring in community engagement   ",
    image: require("@/assets/images/jumpstart.png"),
    progress: "0",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 0,
      toComplete: 0,
      completed: false,
    },
    dueDate: "20 Oct 2024",
    status: "due",
    type: "assessment",
  },
];

export const dummyAssessmentCompleted = [
  {
    title: "Church Assessment Evaluation(CMA)",
    description: "Interested in receiving mentoring in community engagement   ",
    image: require("@/assets/images/jumpstart.png"),
    progress: "0",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 0,
      toComplete: 0,
      completed: false,
    },
    submittedDate: "20 Oct 2024",
    status: "Completed",
    type: "assessment",
  },
  {
    title: "Church Assessment Evaluation(CMA)",
    description: "Interested in receiving mentoring in community engagement   ",
    image: require("@/assets/images/jumpstart.png"),
    progress: "0",
    taskStatus: {
      notStarted: true,
      started: false,
      inProgress: 0,
      toComplete: 0,
      completed: false,
    },
    submittedDate: "20 Oct 2024",
    status: "Completed",
    type: "assessment",
  },
];

export interface MenuItem {
  id: string;
  label: string;
  icon: string | any;
  iconType?: "ionicon" | "image";
  route?: string;
  badge?: number;
  showChevron?: boolean;
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "new-interests",
    label: "New Interests",
    icon: "people-outline",
    route: "/(director)/(tabs)/new-interests",
    badge: 6,
  },
  {
    id: "all-mentors",
    label: "All Mentors",
    icon: "school-outline",
    route: "/(director)/(tabs)/mentors",
  },
  {
    id: "all-pastors",
    label: "All Pastors",
    icon: "people-outline",
    route: "/(director)/(tabs)/mentees",
  },
  {
    id: "course-completed",
    label: "Course Completed",
    icon: "ribbon-outline",
    route: "/(director)/(tabs)",
    badge: 6,
  },
  {
    id: "track-progress",
    label: "Track Progress",
    icon: "bar-chart-outline",
    route: "/(director)/(tabs)/progress-tracker",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: "calendar-outline",
    route: "/(director)/(tabs)/appointments",
  },
  {
    id: "roadmaps",
    label: "Revitalization Roadmaps",
    icon: "clipboard-outline",
    route: "/(director)/(tabs)/revitalization-roadmaps",
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: "checkmark-done-outline",
    route: "/(director)/(tabs)/assessments",
  },
  {
    id: "courses",
    label: "Courses",
    icon: "book-outline",
    route: "/(director)/(tabs)",
  },
  {
    id: "ccc",
    label: "CCC",
    icon: "flame-outline",
    children: [
      {
        id: "micro-grant",
        label: "Micro Grant",
        icon: "trophy-outline",
        route: "/(director)/(tabs)/micro-grant",
      },
      {
        id: "invite-mentor",
        label: "Invite to be a Field Mentor",
        icon: "person-add-outline",
        route: "/(director)/(tabs)",
      },
      {
        id: "interest-form",
        label: "Interest Form",
        icon: "document-text-outline",
        route: "/(director)/(tabs)/new-interests/interest-form",
      },
      {
        id: "products",
        label: "Product and Services",
        icon: "cart-outline",
        route: "/(director)/(tabs)/product-and-services",
        showChevron: true,
      },
      {
        id: "videos",
        label: "CCC - Videos",
        icon: "videocam-outline",
        route: "/(director)/(tabs)",
        showChevron: true,
      },
      {
        id: "contact-details",
        label: "CCC - Contact Details",
        icon: "call-outline",
        route: "/(director)/(tabs)",
        showChevron: true,
      },
      {
        id: "reports",
        label: "Reports",
        icon: "document-outline",
        route: "/(director)/(tabs)",
      },
    ],
  },
  {
    id: "profile",
    label: "Profile",
    icon: "person-outline",
    children: [
      {
        id: "my-profile",
        label: "My Profile",
        icon: icons.myProfile,
        iconType: "image",
        route: "/(director)/(tabs)/profile",
      },
      {
        id: "documents",
        label: "Documents",
        icon: "folder-outline",
        route: "/(director)/(tabs)/documents",
      },
      {
        id: "notes",
        label: "Notes",
        icon: "document-text-outline",
        route: "/(director)/(tabs)/documents",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings-outline",
    children: [
      {
        id: "change-password",
        label: "Change Password",
        icon: "lock-closed-outline",
        route: "/(director)/(tabs)",
      },
      {
        id: "notifications",
        label: "Turn Off Notifications",
        icon: "notifications-off-outline",
        route: "/(director)/(tabs)",
      },
    ],
  },
  { id: "logout", label: "Log out", icon: "log-out-outline", route: "/" },
];

export const PastorMenuItems: MenuItem[] = [
  {
    id: "myMentors",
    label: "My Mentors",
    icon: icons.myMentors,
    iconType: "image",
    route: "/(pastor)/(tabs)/my-mentors",
  },
  {
    id: "mentorshipSessions",
    label: "Mentorship Sessions",
    icon: icons.calendarIcon,
    iconType: "image",
    route: "/(pastor)/(tabs)/sessions",
  },
  // {
  //     id: 'test',
  //     label: 'test roadmap',
  //     icon: icons.myMentors,
  //     iconType: 'image',
  //     route: '/(pastor-tabs)/new-roadmap',
  // },
  {
    id: "revitalizationRoadmap",
    label: "Revitalization RoadMap",
    icon: icons.Revitalization,
    iconType: "image",
    route: "/(pastor)/(tabs)/roadmap",
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: icons.Assessments,
    iconType: "image",
    route: "/(pastor)/(tabs)/assessments",
  },
  {
    id: "progress",
    label: "Progress",
    icon: icons.progress,
    iconType: "image",
    route: "/(pastor)/(tabs)/progress",
  },
  {
    id: "voiceNotes",
    label: "Voice Notes",
    icon: icons.notesIcon,
    iconType: "image",
    route: "/(pastor)/(tabs)/voice-notes",
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: icons.Appointments,
    iconType: "image",
    route: "/(pastor)/(tabs)/appointments",
  },
  {
    id: "profile",
    label: "Profile",
    icon: icons.profile,
    iconType: "image",
    showChevron: true,
    children: [
      {
        id: "myProfile",
        label: "My Profile",
        icon: icons.myProfile,
        iconType: "image",
        route: "/(pastor)/(tabs)/profile",
      },
      {
        id: "documents",
        label: "Documents",
        icon: icons.document,
        iconType: "image",
        route: "/(pastor)/(tabs)/profile/documents",
      },
      {
        id: "assignments",
        label: "Assignments",
        icon: icons.assignment,
        iconType: "image",
        route: "/(pastor)/(tabs)/profile/assignments",
      },
      {
        id: "certificates",
        label: "Certificates",
        icon: icons.certificate,
        iconType: "image",
        route: "/(pastor)/(tabs)/profile/certificates",
      },
      {
        id: "microGrant",
        label: "Micro Grant",
        icon: icons.microGrant,
        iconType: "image",
        route: "/(pastor)/(tabs)/profile/grant",
      },
      {
        id: "notes",
        label: "Personal Notes",
        icon: icons.notesIcon,
        iconType: "image",
        route: "/(pastor)/(tabs)/profile/notes",
      },
    ],
  },
  // {
  //     id: 'settings',
  //     label: 'Settings',
  //     icon: icons.settings,
  //     iconType: 'image',
  //     showChevron: true,
  //     children: [
  //         {
  //             id: 'changePassword',
  //             label: 'Change Password',
  //             icon: icons.changePass,
  //             iconType: 'image',
  //             route: '/(pastor-tabs)/profile',
  //         },
  //         {
  //             id: 'turnOffNotifications',
  //             label: 'Turn Off Notifications',
  //             icon: icons.turnOffNotification,
  //             iconType: 'image',
  //             route: '/(pastor-tabs)/notifications',
  //         },
  //         {
  //             id: 'changeMentor',
  //             label: 'Change Mentor',
  //             icon: icons.changeMentor,
  //             iconType: 'image',
  //             route: '/(pastor-tabs)/',
  //         },
  //     ],
  // },
  { id: "logout", label: "Log out", icon: "log-out-outline", route: "/" },
];

export const MentorMenuItems: MenuItem[] = [
  {
    id: "myMentees",
    label: "My Mentees",
    icon: icons.myMentors,
    iconType: "image",
    route: "/(mentor)/mentees",
  },
  {
    id: "mentorshipSessions",
    label: "Mentorship Sessions",
    icon: icons.calendarIcon,
    iconType: "image",
    route: "/(mentor)/(tabs)/sessions",
  },
  {
    id: "mentorshipInsights",
    label: "Mentorship Insights",
    icon: "analytics-outline",
    iconType: "ionicon",
    route: "/(mentor)/(tabs)/sessions/insights",
  },
  {
    id: "revitalizationRoadmap",
    label: "Revitalization RoadMap",
    icon: icons.Revitalization,
    iconType: "image",
    route: "/(mentor)/roadmap/landing/landing",
  },
  {
    id: "assessments",
    label: "Assessments",
    icon: icons.Assessments,
    iconType: "image",
    route: "/(mentor)/assessments-v2",
  },
  {
    id: "progress",
    label: "Track Progress",
    icon: icons.progress,
    iconType: "image",
    route: "/(mentor)/mentees/progress-tracker",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: icons.Appointments,
    iconType: "image",
    route: "/(mentor)/appointments",
  },
  {
    id: "voiceNotes",
    label: "Voice Notes",
    icon: "mic-outline",
    iconType: "ionicon",
    route: "/(mentor)/(tabs)/voice-notes",
  },
  {
    id: "profile",
    label: "Profile",
    icon: icons.profile,
    iconType: "image",
    showChevron: true,
    children: [
      {
        id: "myProfile",
        label: "My Profile",
        icon: icons.myProfile,
        iconType: "image",
        route: "/(mentor)/profile/my-profile",
      },
      {
        id: "documents",
        label: "Documents",
        icon: icons.document,
        iconType: "image",
        route: "/(mentor)/(tabs)/profile/documents",
      },
      {
        id: "certificate",
        label: "Certificate",
        icon: icons.certificate,
        iconType: "image",
        route: "/(mentor)/profile/certificate",
      },
      //   {
      //     id: "microGrant",
      //     label: "Micro Grant",
      //     icon: icons.microGrant,
      //     iconType: "image",
      //     route: "/(mentor)/profile/grant",
      //   },
      {
        id: "notes",
        label: "Personal Notes",
        icon: icons.notesIcon,
        iconType: "image",
        route: "/(mentor)/profile/notes",
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: icons.settings,
    iconType: "image",
    showChevron: true,
    children: [
      {
        id: "changePassword",
        label: "Change Password",
        icon: icons.changePass,
        iconType: "image",
        route: "/(mentor)/profile/my-profile",
      },
      {
        id: "turnOffNotifications",
        label: "Turn Off Notifications",
        icon: icons.turnOffNotification,
        iconType: "image",
        route: "/(mentor)/notifications",
      },
    ],
  },
  { id: "logout", label: "Log out", icon: "log-out-outline", route: "/" },
];

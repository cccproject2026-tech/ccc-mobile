# CCC-Mobile Application - Detailed Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Navigation Flow Diagrams](#navigation-flow-diagrams)
4. [Role-Based Flows](#role-based-flows)
5. [Screen-by-Screen Documentation](#screen-by-screen-documentation)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Dev Mode vs Production Mode](#dev-mode-vs-production-mode)
8. [State Management](#state-management)

---

## Overview

**CCC-Mobile** is a React Native mobile application built with **Expo Router v3** for the Church Community Connection platform. The app serves three primary user roles with distinct features and navigation flows:

| Role | Description | Access |
|------|-------------|--------|
| **Pastor** | Pastors, Lay Leaders, Seminarians | Production |
| **Mentor** | Mentors and Field Mentors | Production |
| **Director** | Administrative/Management role | Dev Mode Only |

### Technology Stack
- **Framework**: React Native with Expo SDK
- **Navigation**: Expo Router v3 (file-based routing)
- **State Management**: Zustand (Auth, Onboarding, Profile stores)
- **Data Fetching**: TanStack React Query
- **Styling**: NativeWind (TailwindCSS) + StyleSheet
- **UI Components**: Gluestack UI, Bottom Sheet Modal

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Root Layout                               │
│                    (app/_layout.tsx)                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Providers: QueryClient, DataProvider, KeyboardProvider,    ││
│  │            BottomSheetModalProvider, GestureHandler         ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│              ┌───────────────┼───────────────┐                  │
│              ▼               ▼               ▼                  │
│     ┌────────────┐   ┌────────────┐   ┌────────────┐           │
│     │   index    │   │(unauth)    │   │Role Routes │           │
│     │ (Gateway)  │   │  Stack     │   │(Protected) │           │
│     └────────────┘   └────────────┘   └────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Route Protection Logic (app/_layout.tsx)

```typescript
const isPastor = isAuthenticated && (user?.role === 'pastor');
const isMentor = isAuthenticated && user?.role === 'mentor';
const showIndex = !isAuthenticated && !user;
const isUnauthenticated = !isAuthenticated;
```

---

## Navigation Flow Diagrams

### Master Navigation Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           APP ENTRY                                       │
│                        app/index.tsx                                      │
│                     "Who Are You?" Screen                                 │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
    ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
    │  Pastor Flow  │      │  Mentor Flow  │      │ Director Flow │
    │               │      │               │      │  (__DEV__ ONLY)│
    └───────┬───────┘      └───────┬───────┘      └───────┬───────┘
            │                      │                      │
            ▼                      ▼                      ▼
    ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
    │ isAuthenticated│     │ isAuthenticated│     │  Direct Access │
    │ && role=pastor?│     │ && role=mentor?│     │  (No Auth)     │
    └───────┬───────┘      └───────┬───────┘      └───────┬───────┘
         YES│NO                 YES│NO                    │
            │  │                   │  │                   │
            │  └───────┐           │  └───────┐           │
            │          ▼           │          ▼           ▼
            │   (unauthenticated)  │   (unauthenticated)  │
            │                      │                      │
            ▼                      ▼                      ▼
    ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
    │ (pastor)/     │      │ (mentor)/     │      │ (director)/   │
    │   (tabs)      │      │   (tabs)      │      │   (tabs)      │
    └───────────────┘      └───────────────┘      └───────────────┘
```

### Unauthenticated Flow (Onboarding)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        UNAUTHENTICATED FLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Landing    │────▶│ Interest Form│────▶│   Pending    │
│   (index)    │     │              │     │  Approval    │
└──────────────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │ Already have account?                   │ Status = 'accepted'
       ▼                                         ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Login Form  │◀────│ Set Password │◀────│ Email Verify │
│              │     │              │     │   (OTP)      │
└──────┬───────┘     └──────────────┘     └──────────────┘
       │
       │ Login Success
       ▼
┌──────────────────────────────────────────────────────────┐
│              ROLE-BASED REDIRECT                          │
│                                                          │
│  role === 'pastor'  ──▶  /(pastor)/(tabs)               │
│  role === 'mentor'  ──▶  /(mentor)/(tabs)               │
│  role === 'director' ──▶ /(director)/(tabs)             │
└──────────────────────────────────────────────────────────┘
```

---

## Role-Based Flows

### Pastor Role Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PASTOR ROLE                                     │
│                      app/(pastor)/                                       │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         ENTRY CONDITIONS                                  │
│                                                                          │
│  1. isAuthenticated === true                                             │
│  2. user.role === 'pastor'                                               │
│  3. hasProfilePicture check ──▶ Redirect to profile-setup if false      │
└──────────────────────────────────────────────────────────────────────────┘

                           ┌──────────────┐
                           │   Drawer     │
                           │   Layout     │
                           └──────┬───────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            ┌──────────────┐           ┌──────────────┐
            │  Tab Layout  │           │Profile Setup │
            │              │           │(if no photo) │
            └──────┬───────┘           └──────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐   ┌──────────┐   ┌──────────┐
│Dashboard│   │  Profile │   │ Hidden   │
│ (index)│   │          │   │  Routes  │
└────┬───┘   └──────────┘   └──────────┘
     │
     │ Navigate to sections:
     ▼
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Appointments│  │ Assessments │  │   Roadmap   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Progress   │  │   Mentors   │  │   Profile   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Mentor Role Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MENTOR ROLE                                     │
│                      app/(mentor)/                                       │
└─────────────────────────────────────────────────────────────────────────┘

                           ┌──────────────┐
                           │   Drawer     │
                           │   Layout     │
                           └──────┬───────┘
                                  │
                           ┌──────┴───────┐
                           │  Tab Layout  │
                           └──────┬───────┘
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    ▼                             ▼                             ▼
┌────────────┐            ┌──────────────┐            ┌──────────────┐
│ Dashboard  │            │   Discover   │            │   Profile    │
│  (index)   │            │              │            │              │
└─────┬──────┘            └──────────────┘            └──────────────┘
      │
      │ Explore CCC Items:
      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        MENTOR FEATURES                                   │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │ Track Progress  │  │   Assessment    │  │ Revitalization  │         │
│  │                 │  │                 │  │    Roadmap      │         │
│  │ mentees/        │  │ assessments-v2/ │  │ roadmap/landing │         │
│  │ progress-tracker│  │                 │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │
│  │    Mentees      │  │  Appointments   │  │     Notes       │         │
│  │   (with Map)    │  │                 │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Director Role Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DIRECTOR ROLE                                   │
│                      app/(director)/                                     │
│                    ⚠️ __DEV__ MODE ONLY ⚠️                               │
└─────────────────────────────────────────────────────────────────────────┘

                           ┌──────────────┐
                           │   Drawer     │
                           │   Layout     │
                           │(PhaseContext)│
                           └──────┬───────┘
                                  │
                           ┌──────┴───────┐
                           │  Tab Layout  │
                           └──────┬───────┘
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    ▼                             ▼                             ▼
┌────────────┐            ┌──────────────┐            ┌──────────────┐
│ Dashboard  │            │   Discover   │            │   Profile    │
│  (index)   │            │              │            │              │
└─────┬──────┘            └──────────────┘            └──────────────┘
      │
      │ Admin Features:
      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       DIRECTOR FEATURES                                  │
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │    Mentors     │  │    Mentees     │  │  New Interests │            │
│  │  Management    │  │  Management    │  │   (Approve/    │            │
│  │                │  │                │  │    Reject)     │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │  Assessments   │  │  Micro-Grant   │  │ Revitalization │            │
│  │  (Create/      │  │  Applications  │  │   Roadmaps     │            │
│  │   Assign)      │  │                │  │ (Create/Edit)  │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │   Progress     │  │   Products &   │  │  Appointments  │            │
│  │   Tracker      │  │   Services     │  │                │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Screen-by-Screen Documentation

### Unauthenticated Screens

| Screen | Path | Purpose | APIs/Hooks | Navigation To | Conditions |
|--------|------|---------|------------|---------------|------------|
| **Landing** | `(unauthenticated)/index` | Home with videos, login options | `useCheckApprovalStatus`, `useOnboardingStore` | login-form, set-password, videos, interest-form | Shows "Waiting for Approval" if `interestStatus === 'pending'` |
| **Login Form** | `(unauthenticated)/login-form` | User authentication | `useLogin`, `useOnboardingStore` | Role-based redirect, forgot-password, set-password | `__DEV__`: Pre-fills test email |
| **Forgot Password** | `(unauthenticated)/forgot-password` | Password reset via OTP | `useSendOtp`, `useResetPassword` | login-form (after reset) | Two-step: email → OTP + new password |
| **Set Password** | `(unauthenticated)/set-password` | Email verification + password setup | `useSendOtp`, `useVerifyOtp`, `useSetPassword` | login-form | Three-step flow |
| **Interest Form** | `(unauthenticated)/interest-form` | Program enrollment | `useSubmitInterest`, `useInterestMetadata` | Stays on form | Auto-fill button for testing |
| **Videos** | `(unauthenticated)/videos` | Video player | None | Back | Receives video params |

### Pastor Screens

| Screen | Path | Purpose | APIs/Hooks | Navigation To | Conditions |
|--------|------|---------|------------|---------------|------------|
| **Dashboard** | `(pastor)/(tabs)/index` | Main hub | `useProfile`, `useAssignedMentors`, `useAppointments`, `useRoadmaps` | profile, appointments, roadmap, mentors, schedule-meeting | Loading/error states |
| **Profile** | `(pastor)/(tabs)/profile/index` | View/edit profile | `useProfile`, `useUpdateProfile` | documents | Loading/error states |
| **Profile Setup** | `(pastor)/profile-setup` | Initial photo upload | `useUploadProfilePicture` | (pastor)/(tabs) | Shown if `!hasProfilePicture` |
| **Assessments** | `(pastor)/(tabs)/assessments/index` | List assigned surveys | `useAssignedAssessments` | survey-guidelines | Pull-to-refresh |
| **Survey Guidelines** | `(pastor)/(tabs)/assessments/survey-guidelines` | Assessment info | `useAssessment`, `useFetchAnswers` | answer-questions | `preSurveySubmitted`, `answersSubmitted` checks |
| **Answer Questions** | `(pastor)/(tabs)/assessments/answer-questions` | Complete assessment | `useAssessment`, `useSubmitAssessmentAnswers` | Back | View mode vs edit mode |
| **Roadmap List** | `(pastor)/(tabs)/roadmap/index` | All roadmaps | `useRoadmaps` | [phaseId], [phaseId]/[itemId] | Division filtering |
| **Roadmap Phase** | `(pastor)/(tabs)/roadmap/[phaseId]` | Phase tasks | `useRoadmap` | [itemId] | Task status filtering |
| **Roadmap Item** | `(pastor)/(tabs)/roadmap/[phaseId]/[itemId]` | Task detail | `useRoadmap`, `useRoadmapComments`, `useRoadmapQueries` | comments, queries | Overview/Comments/Queries tabs |
| **Appointments** | `(pastor)/(tabs)/appointments/index` | View/schedule meetings | `useAppointments`, `useCreateAppointment` | Back | User ID check |
| **Schedule Meeting** | `(pastor)/(tabs)/mentors/schedule-meeting` | Book with mentor | `useCreateAppointment`, `useMonthlyAvailability` | Back | Date/time validation |
| **Progress** | `(pastor)/(tabs)/progress/index` | Overall progress | `useProgress`, `useRoadmaps`, `useAssignedAssessments` | roadmap, report | Tab filtering |
| **Grant Application** | `(pastor)/(tabs)/profile/grant` | Micro-grant form | `useGrant`, `useCheckApplication` | Back | Step 3 locked if already applied |

### Mentor Screens

| Screen | Path | Purpose | APIs/Hooks | Navigation To | Conditions |
|--------|------|---------|------------|---------------|------------|
| **Dashboard** | `(mentor)/(tabs)/index` | Main hub | `useAuthStore`, `useAppointments`, `useAllRoadmaps`, `useMentors` | progress-tracker, assessments-v2, roadmap/landing | Loading states for appointments/roadmaps |
| **Mentees List** | `(mentor)/mentees/index` | All mentees | `useMentees` | mentee-profile, notes, schedule | Search, status tabs, map view |
| **Mentee Profile** | `(mentor)/mentees/mentee-profile` | Mentee details | `useMentees`, `useMenteeByEmail` | mentee-documents | Loading/error handling |
| **Mentee Progress** | `(mentor)/mentees/mentee-progress` | Progress view | `useProgressByUserId`, `useAllRoadmaps`, `useAddFinalComment` | Back | Comment limit: 2 max |
| **Progress Tracker** | `(mentor)/mentees/progress-tracker` | All mentees progress | `useMentees` | mentee-progress | Search, filtering |
| **Assessments V2** | `(mentor)/assessments-v2/index` | Assessment library | `useMenteeAssessments`, `useDeleteAssessment` | create-assessment, assign-to, edit-instructions | selectedMentee filtering |
| **Create Assessment** | `(mentor)/assessments-v2/create-assessment` | New assessment | `useCreateAssessment` | Back | Validation for name, description |
| **Assign Assessment** | `(mentor)/assessments-v2/assign-to` | Assign to mentees | `useAssignAssessment` | Back | Multi-select mentees |
| **Roadmap Landing** | `(mentor)/roadmap/landing/landing` | Roadmap entry | `useAllRoadmaps` | [phaseId], [phaseId]/[itemId] | Pastor's Roadmaps vs Library tabs |
| **Roadmap Phase** | `(mentor)/roadmap/[phaseId]` | Phase tasks | `useRoadmap` | [itemId] | Division/status filtering |
| **Roadmap Item** | `(mentor)/roadmap/[phaseId]/[itemId]` | Task detail | `useRoadmap`, `useRoadmapComments`, `useRoadmapQueries` | comments, queries | Dynamic task components |
| **Appointments** | `(mentor)/appointments/index` | Calendar view | `useAppointments`, `useMentees` | availability | Auto-open sheet param |
| **Availability** | `(mentor)/appointments/availability` | Set schedule | `useSetAvailability` | Back | Weekly schedule config |
| **Notes List** | `(mentor)/notes/index` | Mentee notes | None (mock) | note-detail, new-note | New/Previous tabs |
| **New Note** | `(mentor)/notes/new-note` | Create note | None | Back | Rich text editor |

### Director Screens

| Screen | Path | Purpose | APIs/Hooks | Navigation To | Conditions |
|--------|------|---------|------------|---------------|------------|
| **Dashboard** | `(director)/(tabs)/index` | Admin hub | `useInterests` | profile, explore cards | Greeting period |
| **Mentors List** | `(director)/(tabs)/mentors/index` | All mentors | None (mock) | [id], mentor-mentees, assign-mentee, remove-mentee | All/Mentor/Field Mentor tabs |
| **Mentor Detail** | `(director)/(tabs)/mentors/[id]` | Mentor profile | `useMentorByEmail` | mentor-mentees, assign-mentee, mentor-documents | Edit mode toggle |
| **Mentees List** | `(director)/(tabs)/mentees/index` | All mentees | `useMentees` | [id], mentees-location, assign-mentor | Status tabs |
| **Mentee Detail** | `(director)/(tabs)/mentees/[id]` | Mentee profile | `useMenteeByEmail` | assessments | Edit mode, certificates, field mentor status |
| **Assign Mentor** | `(director)/(tabs)/mentees/assign-mentor` | Assign mentors | None (mock) | Back | Multi-select, state filter |
| **Remove Mentor** | `(director)/(tabs)/mentees/remove-mentor` | Remove assignments | None (mock) | Back | Multi-select |
| **New Interests** | `(director)/(tabs)/new-interests/index` | Interest requests | `useInterests` | interest-details | New/Pending/Accepted tabs |
| **Interest Details** | `(director)/(tabs)/new-interests/interest-details` | Review interest | `useInterests`, `useUpdateInterestStatus` | assign-scholarship, back (reject) | Accept/Reject modals |
| **Assign Scholarship** | `(director)/(tabs)/new-interests/assign-scholorship` | Scholarship assignment | None | new-interests, assign-mentor | Rural/Urban, Full/Partial |
| **Assessments** | `(director)/(tabs)/assessments/index` | Assessment management | `useAssessments` | create-assessment, assign-mentee, progress-tracker/[id] | Search, filter |
| **Create Assessment** | `(director)/(tabs)/assessments/create-assessment` | New assessment | `useCreateAssessment` | assessments | Title/description validation |
| **Assign Assessment** | `(director)/(tabs)/assessments/assign-mentee` | Assign to mentees | `useMentees`, `useAssessments`, `useAssignAssessment` | assessments | Multi-select both |
| **Micro-Grant** | `(director)/(tabs)/micro-grant/index` | Grant applications | `useMicrograntApplications` | micro-grand-application | New/Pending/Approved tabs |
| **Grant Application** | `(director)/(tabs)/micro-grant/micro-grand-application` | Application detail | `useMicrograntApplication` | reporting-procedure | Document download check |
| **Reporting Procedure** | `(director)/(tabs)/micro-grant/reporting-procedure` | Review procedure | None | Back | Checkbox tracking |
| **Roadmaps** | `(director)/(tabs)/revitalization-roadmaps/index` | Roadmap management | `useRoadmaps` | create-roadmap, assign-mentee, [id] | Library/Mentors/Mentees tabs |
| **Roadmap Detail** | `(director)/(tabs)/revitalization-roadmaps/[id]` | Phase view | `useRoadmap` | create-roadmap (edit), [phaseId]/[itemId] | Division tabs, expected outcomes |
| **Create Roadmap** | `(director)/(tabs)/revitalization-roadmaps/(creation)/create-roadmap` | Create/edit roadmap | `usePhaseCreation`, `useRoadmap` | roadmap-form, revitalization-roadmaps | `isPhaseFlow`, `isNestedRoadmap`, `isEditMode` |
| **Roadmap Form** | `(director)/(tabs)/revitalization-roadmaps/(creation)/roadmap-form` | Build form fields | `useCreateRoadmap`, `useCreateNestedRoadmap`, `useUpdateRoadmap` | revitalization-roadmaps | Field validation, phase loop |
| **Assign Roadmap** | `(director)/(tabs)/revitalization-roadmaps/assign-mentee` | Assign to mentees | `useMentees`, `useAssignRoadmap` | revitalization-roadmaps | Multi-select, success modal |
| **Progress Tracker** | `(director)/(tabs)/progress-tracker/index` | All mentee progress | None (mock) | [id] | All/Mentor-wise/Status tabs |
| **Progress Detail** | `(director)/(tabs)/progress-tracker/[id]` | Mentee progress | None (mock) | pmp-detail-screen | Comments limit: 2 |
| **Products & Services** | `(director)/(tabs)/product-and-services/index` | Scholarship groups | None (mock) | settings, [mentee id] | Scholarship type tabs |
| **Settings** | `(director)/(tabs)/product-and-services/settings` | Scholarship config | None (mock) | Back | Pie chart, edit modals |

---

## API Endpoints Reference

### Authentication APIs
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/auth/login` | POST | login-form | User login |
| `/auth/send-otp` | POST | set-password, forgot-password | Send OTP |
| `/auth/verify-otp` | POST | set-password | Verify OTP |
| `/auth/set-password` | POST | set-password | Set initial password |
| `/auth/reset-password` | POST | forgot-password | Reset password |
| `/auth/refresh-token` | POST | interceptors | Token refresh |
| `/auth/logout` | POST | auth store | User logout |

### User/Profile APIs
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/users/${userId}` | GET/PUT | Profile screens | User CRUD |
| `/users/${userId}/profile-picture` | PUT | profile-setup | Upload avatar |
| `/users/${userId}/documents` | GET/POST/DELETE | documents screens | Document management |
| `/users/${userId}/assigned` | GET | mentors/mentees hooks | Get assignments |

### Assessments APIs
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/assessment` | GET/POST | assessment screens | List/Create |
| `/assessment/${id}` | GET/DELETE | assessment detail | Get/Delete |
| `/assessment/${id}/assign` | POST | assign-to screens | Assign to mentees |
| `/assessment/${id}/answers` | POST | answer-questions | Submit answers |
| `/assessment/${id}/pre-survey` | POST | pre-survey | Submit pre-survey |
| `/assessment/${id}/instructions` | PUT | edit-instructions | Update instructions |

### Roadmaps APIs
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/roadmaps` | GET/POST | roadmap screens | List/Create |
| `/roadmaps/${id}` | PUT | roadmap-form | Update roadmap |
| `/roadmaps/${id}/comments` | GET/POST | comments screen | Comments CRUD |
| `/roadmaps/${id}/queries` | GET/POST | queries screen | Queries CRUD |
| `/roadmaps/${id}/queries/${qId}/reply` | POST | queries screen | Reply to query |
| `/roadmaps/${id}/nested` | POST | create nested | Create child roadmap |

### Appointments APIs
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/appointments` | POST | schedule-meeting | Create appointment |
| `/appointments/user/${userId}` | GET | appointments list | Get user appointments |
| `/appointments/${id}` | PUT | appointments | Update appointment |
| `/appointments/availability/${mentorId}` | GET | availability | Get weekly slots |
| `/appointments/availability/${mentorId}/month` | GET | schedule-meeting | Monthly availability |
| `/appointments/availability` | POST | availability | Set availability |

### Interests APIs
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/interests` | GET/POST | interest screens | List/Submit |
| `/interests/metadata` | GET | interest-form | Get form options |
| `/interests/request/${id}` | PUT | interest-details | Update status |

### Micro-Grant APIs
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/microgrant/form` | GET | grant screen | Get form config |
| `/microgrant/apply` | POST | grant screen | Submit application |
| `/microgrant/application/check/${userId}` | GET | grant screen | Check if applied |
| `/microgrant/applications` | GET | micro-grant (director) | List applications |
| `/microgrant/application/${id}` | GET | application detail | Get application |

### Progress APIs
| Endpoint | Method | Used In | Description |
|----------|--------|---------|-------------|
| `/progress/${userId}` | GET | progress screens | Get progress |
| `/progress/assign-assessment` | POST | assign assessment | Assign to user |
| `/progress/assign-roadmap` | POST | assign roadmap | Assign to user |
| `/progress/final-comments` | POST/PUT/DELETE | mentee-progress | Manage comments |

---

## Dev Mode vs Production Mode

### Environment Configuration

**File: `constants/config/api.ts`**
```typescript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
const resolvedBaseUrl = apiUrl
    ? `${apiUrl}/api/v1`
    : 'http://13.203.24.38/api/v1';  // Fallback for dev

export const API_CONFIG = {
    BASE_URL: resolvedBaseUrl,
    TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 15000,
};
```

**File: `.env`**
```
EXPO_PUBLIC_API_URL=https://app.wisdomtooth.tech
EXPO_PUBLIC_API_TIMEOUT=15000
```

### `__DEV__` Checks in Code

| Location | Check | Effect |
|----------|-------|--------|
| `app/index.tsx` (Line 103) | `{__DEV__ && (...)}` | Shows "Clear Data" button (trash icon) |
| `app/index.tsx` (Line 148) | `{__DEV__ && (...)}` | Shows "Director" role option |
| `app/index.tsx` (Line 224) | `flowStep === 'director-flow' && __DEV__` | Director flow only in dev |
| `app/(unauthenticated)/login-form.tsx` (Line 29) | `__DEV__ ? 'hipyvide@forexzig.com' : ''` | Pre-fills test email |
| `components/AnswerQuestionSection.tsx` (Line 198) | `{__DEV__ && !isViewMode && (...)}` | Debug UI in assessments |

### Dev-Only Features Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DEV MODE ONLY FEATURES                               │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────┐
│ 1. Director Role Access               │
│    - Visible only when __DEV__ = true │
│    - No authentication required       │
│    - Full admin access                │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ 2. Clear Data Button                  │
│    - Top-right corner on index        │
│    - Clears AsyncStorage              │
│    - Resets onboarding state          │
│    - Logs user out                    │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ 3. Pre-filled Test Email              │
│    - Login form auto-fills            │
│    - Email: hipyvide@forexzig.com     │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ 4. Debug UI Components                │
│    - Answer question section debug    │
│    - Additional dev info displayed    │
└───────────────────────────────────────┘
```

### Production vs Development

| Feature | Development | Production |
|---------|-------------|------------|
| Director Role | ✅ Visible | ❌ Hidden |
| Clear Data Button | ✅ Visible | ❌ Hidden |
| Test Email Pre-fill | ✅ Active | ❌ Disabled |
| API Base URL | Fallback IP or .env | .env only |
| Debug Components | ✅ Visible | ❌ Hidden |

---

## State Management

### Zustand Stores

#### Auth Store (`stores/auth.store.ts`)
```typescript
interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isInitialized: boolean;
}

// Persisted to AsyncStorage
// Tokens stored in SecureStore separately
```

#### Onboarding Store (`stores/onboarding.store.ts`)
```typescript
interface OnboardingState {
    interestData: InterestFormData | null;
    interestStatus: 'new' | 'pending' | 'accepted' | 'rejected' | null;
    userId: string | null;
    email: string | null;
    isEmailVerified: boolean;
    isPasswordSet: boolean;
    hasProfilePicture: boolean;
    currentStep: 'form' | 'submitted' | 'approved' | 'email-verify' | 'password' | 'complete';
}

// Persisted to AsyncStorage
// Tracks onboarding progress
```

#### Assessment Store (`stores/assessment.store.ts`)
- Tracks current assessment state
- Stores answers temporarily
- Manages pre-survey completion

#### Profile Store (`stores/profile.store.ts`)
- Caches profile data
- Tracks edit state

#### Grant Store (`stores/grant.store.ts`)
- Manages grant application form
- Tracks multi-step progress

### React Contexts

| Context | Location | Purpose |
|---------|----------|---------|
| `AssessmentProvider` | Pastor/Mentor tabs layout | Assessment state sharing |
| `RoadmapProgressProvider` | Pastor/Mentor tabs layout | Roadmap progress state |
| `PhaseCreationProvider` | Director drawer layout | Roadmap creation wizard state |
| `DataProvider` | Root layout | Global app data |

---

## Quick Reference: Conditions Summary

### Entry Guards

| Route Group | Guard Condition | Redirect If False |
|-------------|-----------------|-------------------|
| `(pastor)` | `isAuthenticated && user?.role === 'pastor'` | `/` |
| `(mentor)` | `isAuthenticated && user?.role === 'mentor'` | `/` |
| `(director)` | `__DEV__` (no auth required) | Hidden |
| `(unauthenticated)` | `!isAuthenticated` | Role-based dashboard |

### Screen-Level Guards

| Screen | Condition | Effect |
|--------|-----------|--------|
| Pastor Profile Setup | `!hasProfilePicture` | Redirects from tabs to setup |
| Pastor Grant (Step 3) | `checkApplicationData?.applied` | Locks step |
| Assessment Answer | `viewMode === 'true'` | Read-only mode |
| Mentor Mentee Progress | `existingComments.length < 2` | Allows new comment |
| Director Create Roadmap | `isPhaseFlow`, `isNestedRoadmap`, `isEditMode` | Different form behavior |

---

## File Structure Overview

```
app/
├── _layout.tsx                    # Root layout with providers & route guards
├── index.tsx                      # Role selection gateway
├── +not-found.tsx                 # 404 screen
│
├── (unauthenticated)/             # Pre-login screens
│   ├── _layout.tsx
│   ├── index.tsx                  # Landing
│   ├── login-form.tsx             # Login
│   ├── forgot-password.tsx        # Password reset
│   ├── set-password.tsx           # Email verify + set password
│   ├── interest-form.tsx          # Enrollment form
│   └── videos.tsx                 # Video player
│
├── (pastor)/                      # Pastor role (requires auth)
│   ├── _layout.tsx                # Drawer layout
│   ├── profile-setup.tsx          # Initial profile photo
│   └── (tabs)/                    # Tab navigation
│       ├── _layout.tsx
│       ├── index.tsx              # Dashboard
│       ├── profile/               # Profile screens
│       ├── mentors/               # Mentor screens
│       └── (index,assessments,roadmap,appointments,progress)/
│           ├── assessments/       # Assessment screens
│           ├── roadmap/           # Roadmap screens
│           ├── appointments/      # Appointment screens
│           └── progress/          # Progress screens
│
├── (mentor)/                      # Mentor role (requires auth)
│   ├── _layout.tsx                # Drawer layout
│   └── (tabs)/                    # Tab navigation
│       ├── _layout.tsx
│       ├── index.tsx              # Dashboard
│       ├── discover.tsx
│       ├── profile/               # Profile screens
│       └── (index,roadmap,assessments,appointments,progress,mentees)/
│           ├── mentees/           # Mentee management
│           ├── assessments/       # Assessment screens
│           ├── assessments-v2/    # New assessment system
│           ├── roadmap/           # Roadmap screens
│           ├── appointments/      # Appointment screens
│           ├── progress/          # Progress screens
│           └── notes/             # Notes screens
│
└── (director)/                    # Director role (__DEV__ only)
    ├── _layout.tsx                # Drawer layout with PhaseCreationProvider
    └── (tabs)/                    # Tab navigation
        ├── _layout.tsx
        ├── index.tsx              # Dashboard
        ├── discover.tsx
        ├── profile.tsx
        ├── mentors/               # Mentor management
        ├── mentees/               # Mentee management
        ├── new-interests/         # Interest approval
        ├── assessments/           # Assessment management
        ├── micro-grant/           # Grant applications
        ├── revitalization-roadmaps/  # Roadmap creation
        ├── progress-tracker/      # Progress monitoring
        ├── product-and-services/  # Scholarship management
        ├── appointments/          # Appointment management
        └── documents.tsx          # Document management
```

---

*Document generated for CCC-Mobile application. Last updated based on codebase analysis.*

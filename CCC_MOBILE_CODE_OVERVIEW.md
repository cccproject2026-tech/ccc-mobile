# CCC Mobile Apps — Combined Code Overview

> **Audience:** Junior developers  
> **Last updated:** June 2026  
> **Apps covered:**
> - **CCC Pastor & Mentor** → `D:\C-M` (package: `ccc-new-app`)
> - **CCC Director** → `D:\CCC-Director-Mobile` (package: `ccc-director`)

---

## Table of Contents

### Shared
- [How the Two Apps Relate](#how-the-two-apps-relate)
- [Shared Technology & Backend](#shared-technology--backend)
- [Side-by-Side Comparison](#side-by-side-comparison)

### App 1 — Pastor & Mentor (`D:\C-M`)
1. [Project Overview](#1-pastor--mentor--project-overview)
2. [Project Structure](#2-pastor--mentor--project-structure)
3. [Application Architecture](#3-pastor--mentor--application-architecture)
4. [Screen-by-Screen Explanation](#4-pastor--mentor--screens)
5. [Core Modules](#5-pastor--mentor--core-modules)
6. [API Integration](#6-pastor--mentor--api-integration)
7. [Database and Storage](#7-pastor--mentor--storage)
8. [Code Walkthrough](#8-pastor--mentor--code-walkthrough)
9. [Security](#9-pastor--mentor--security)
10. [Third-Party Libraries](#10-pastor--mentor--libraries)
11. [Error Handling & Logging](#11-pastor--mentor--errors)
12. [Build & Deployment](#12-pastor--mentor--build)

### App 2 — Director (`D:\CCC-Director-Mobile`)
1. [Project Overview](#1-director--project-overview)
2. [Project Structure](#2-director--project-structure)
3. [Application Architecture](#3-director--application-architecture)
4. [Screen-by-Screen Explanation](#4-director--screens)
5. [Core Modules](#5-director--core-modules)
6. [API Integration](#6-director--api-integration)
7. [Database and Storage](#7-director--storage)
8. [Code Walkthrough](#8-director--code-walkthrough)
9. [Security](#9-director--security)
10. [Third-Party Libraries](#10-director--libraries)
11. [Error Handling & Logging](#11-director--errors)
12. [Build & Deployment](#12-director--build)

### Closing
- [Future Improvements](#future-improvements)
- [Summary for New Developers](#summary-for-new-developers)

---

## How the Two Apps Relate

Both apps are **React Native / Expo** clients for the same **CCC (Center for Community Change)** church revitalization platform. They share the same REST API (`/api/v1`) and similar patterns (Axios, React Query, Zustand, Expo Router), but serve **different user roles**:

```
                    ┌─────────────────────────┐
                    │   CCC Backend API       │
                    │   /api/v1               │
                    └───────────┬─────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                   ▼                   ▼
   ┌────────────────┐  ┌────────────────┐  ┌──────────────┐
   │ Pastor/Mentor  │  │ Director App   │  │ CCC Web      │
   │ D:\C-M         │  │ D:\CCC-         │  │ (separate)   │
   │                │  │ Director-Mobile│  │              │
   └────────────────┘  └────────────────┘  └──────────────┘
```

| App | Who uses it | Primary job |
|-----|-------------|-------------|
| **Pastor & Mentor** | Pastors, mentors, field mentors (+ director role in same binary) | Complete roadmaps, take assessments, schedule meetings, voice notes |
| **Director** | Directors, super admins only | Manage program: assign mentors, review interests, create roadmaps, oversee progress |

> **Important:** The Pastor/Mentor app (`D:\C-M`) also contains a `(director)` route group for director workflows inside the same codebase. The **Director-only app** (`D:\CCC-Director-Mobile`) is a **slimmer, director-focused** build with its own bundle ID.

---

## Shared Technology & Backend

| Layer | Both apps use |
|-------|---------------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Language | TypeScript 5.9 |
| Routing | Expo Router 6 (file-based) |
| Server state | TanStack React Query 5 |
| Client state | Zustand 5 |
| HTTP | Axios + interceptors (Bearer JWT, 401 refresh) |
| Navigation | React Navigation Drawer + Bottom Tabs |
| Tokens | `expo-secure-store` |
| Build | EAS Build (`eas.json`) |

**API base URL (both):**

```env
EXPO_PUBLIC_API_URL=https://your-api-url.example.com
EXPO_PUBLIC_API_TIMEOUT=15000
```

Resolved as: `{EXPO_PUBLIC_API_URL}/api/v1`

**Shared endpoint groups** (both apps): `AUTH`, `USERS`, `MENTORS`, `MENTEES`, `ROADMAPS`, `ASSESSMENTS`, `APPOINTMENTS`, `PROGRESS`, `INTERESTS`, `GRANT`, `CERTIFICATES`, `HOME`, `GOOGLE_CALENDAR`

---

## Side-by-Side Comparison

| Topic | Pastor & Mentor (`D:\C-M`) | Director (`D:\CCC-Director-Mobile`) |
|-------|---------------------------|-------------------------------------|
| **App name** | CCC Pastor & Mentor | ccc-director |
| **Bundle ID** | `com.georgejose.cccnewapp` | `com.vkyboss.cccdirector` |
| **URL scheme** | `cccpastormentor` | `cccdirector` |
| **Source layout** | Root `app/` (no `src/`) | `src/app/` |
| **Styling** | NativeWind + Tailwind + Gluestack | Custom design-system components |
| **Roles in one app** | Pastor, mentor, director | Director, super admin only |
| **Auth flows** | Onboarding, OTP, set password, login | Login only |
| **Push notifications** | Yes (`expo-notifications`) | No |
| **Voice notes** | Yes | No |
| **Maps** | Yes (`react-native-maps`) | No |
| **Login role gate** | Routes by role after login | Blocks non-director roles at login |
| **Menu config** | `constants/mockData.ts` | `src/constants/index.ts` |
| **Auth bootstrap** | `AuthBootstrap` + `useStartupRecovery` | Zustand persist + `Stack.Protected` |
| **Route count** | ~279 screen files | ~90 screen files |

---

# APP 1: CCC Pastor & Mentor Mobile

**Path:** `D:\C-M`  
**Package:** `ccc-new-app`

---

## 1. Pastor & Mentor — Project Overview

### Purpose

Mobile client for pastors (mentees) and mentors in the CCC church revitalization program. Pastors follow structured **roadmaps** and **assessments**; mentors guide them, review submissions, manage availability, and track progress.

The same codebase also includes a **director** route group for admin tasks (separate from the dedicated Director app).

### Main Features

| Feature | Pastor | Mentor | Director (in-app) |
|---------|--------|--------|-------------------|
| Revitalization roadmaps | Follow phases & tasks | Assign, review, comment | Create & assign |
| Assessments (PMP/CMA) | Answer surveys | Create v2, assign, review | Create & assign |
| Appointments | Book with mentor | Set availability, meetings | Schedule oversight |
| Progress & certificates | View own progress | Track mentees | Program overview |
| Micro-grants | Apply | — | Review |
| Voice notes | Record + AI transcription | Same | — |
| Review center | — | Pending pastor submissions | — |
| Push notifications | Yes | Yes | Yes |
| Google Calendar OAuth | Yes | Yes | Yes |

### Target Users

| Role | Route group | Login home |
|------|-------------|------------|
| Pastor, lay leader, seminarian | `(pastor)` | `/(pastor)/(tabs)` |
| Mentor, field mentor | `(mentor)` | `/(mentor)/(tabs)` |
| Director | `(director)` | `/(director)/(tabs)` |
| Not logged in | `(unauthenticated)` | Welcome / onboarding |

### Technology Stack

| Layer | Technology |
|-------|------------|
| Core | Expo 54, React 19, RN 0.81, TypeScript 5.9 |
| Routing | Expo Router 6 |
| State | React Query 5 + Zustand 5 |
| Styling | **NativeWind 4**, Tailwind, Gluestack UI |
| HTTP | Axios |
| Notifications | expo-notifications |
| Audio | expo-av (voice notes) |
| Maps | react-native-maps |
| Rich text | react-native-pell-rich-editor |
| OTP | react-native-otp-entry |

---

## 2. Pastor & Mentor — Project Structure

```
D:\C-M\
├── app/                    # Expo Router screens (file = route)
│   ├── (unauthenticated)/  # Login, onboarding, interest form
│   ├── (pastor)/           # Pastor drawer + tabs
│   ├── (mentor)/           # Mentor drawer + tabs
│   ├── (director)/         # Director drawer + tabs (in same app)
│   ├── schedule-meeting/   # Shared scheduling wizard
│   ├── appointments/       # Meeting details
│   └── oauth/              # Google Calendar callback
├── assets/                 # Images, fonts
├── components/             # UI by domain (pastor, mentor, director, atom, ui)
├── constants/              # API config, colors, mockData (menus)
├── context/                # Assessment, roadmap progress contexts
├── hooks/                  # React Query hooks by domain
├── lib/                    # Domain helpers (roadmap, scheduling, review)
├── services/               # API service layer
│   └── api/                # client, endpoints, interceptors
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
├── utils/                  # Storage, auth navigation, dates
├── dataContext.js          # Legacy persisted context
├── global.css              # NativeWind styles
├── app.json, eas.json, babel.config.js, tailwind.config.js
└── package.json
```

**Path alias:** `@/*` → project root (not `src/`)

---

## 3. Pastor & Mentor — Application Architecture

### Pattern

Layered, feature-oriented:

```
app/ (screens) → hooks/ → services/ → apiClient → REST API
              ↘ stores/ (Zustand)
              ↘ context/ (roadmap progress, assessments)
```

### Root Navigation Guards

`app/_layout.tsx` mounts different navigators based on role:

```typescript
// Simplified from app/_layout.tsx
const isPastor = isAuthenticated && isPastorRole(role);
const isMentor = isAuthenticated && isMentorRole(role);
const isDirector = isAuthenticated && role === 'director';

<Stack.Protected guard={showIndex}>
  <Stack.Screen name="index" />           {/* Welcome center */}
  <Stack.Screen name="get-started" />
</Stack.Protected>

<Stack.Protected guard={isUnauthenticated}>
  <Stack.Screen name="(unauthenticated)" />  {/* Login, OTP, interest form */}
</Stack.Protected>

<Stack.Protected guard={isPastor}>
  <Stack.Screen name="(pastor)" />
</Stack.Protected>

<Stack.Protected guard={isMentor}>
  <Stack.Screen name="(mentor)" />
</Stack.Protected>

<Stack.Protected guard={isDirector}>
  <Stack.Screen name="(director)" />
</Stack.Protected>
```

**Line-by-line explanation:**
- `Stack.Protected` — Expo Router guard; screen only mounts when `guard` is `true`
- `isPastorRole(role)` — helper that treats pastor, lay leader, seminarian as pastor stack
- Each role gets its own **Drawer → Tabs → nested stacks** tree

### Data Flow Example (Pastor opens roadmap task)

1. Screen `app/(pastor)/(tabs)/.../roadmap/[phaseId]/[itemId]/index.tsx` renders
2. Hook `useRoadmapTask()` fetches via React Query
3. `roadmap.service.ts` calls `GET /roadmaps/:id/nested/:nestedId`
4. Interceptor adds `Authorization: Bearer <token>`
5. Response cached → UI updates

### State Management

| Tool | Used for |
|------|----------|
| **React Query** | Roadmaps, assessments, appointments, mentors, progress |
| **Zustand** | Auth, onboarding drafts, assessment answers, schedule meeting wizard, voice recording |
| **React Context** | Roadmap progress, phase creation, assessment provider |
| **AsyncStorage** | Zustand persist, legacy `dataContext.js` |
| **SecureStore** | JWT tokens + user JSON |

---

## 4. Pastor & Mentor — Screens

### Navigation Overview

```
Welcome (index) → Get Started (pick pastor vs mentor)
    → Interest form → OTP → Set password → Profile setup
    → Login → Role home (pastor / mentor / director drawer)

Each role: Drawer (main menu) + Bottom tabs (2–3 visible tabs)
```

### Bottom Tabs

| Role | Visible tabs |
|------|-------------|
| Pastor | Alerts, Home, Profile |
| Mentor | Mentee Progress, Home, Profile |
| Director | Dashboard, Discover, Profile |

### Key Route Groups

#### Unauthenticated (`app/(unauthenticated)/`)
- `login-form.tsx` — Email/password login
- `interest-form.tsx` — New application
- `forgot-password.tsx`, `set-password.tsx`
- `pastor-start-journey/`, `mentor-start-journey/` — Onboarding steps
- `continue-application.tsx`, `application-rejected.tsx`

#### Pastor (`app/(pastor)/`)
- **Roadmap:** `roadmap/index`, `[phaseId]`, `[itemId]`, comments, queries, shared-media
- **Assessments:** index, pre-survey, answer-questions, report
- **Appointments:** index, schedule-flow
- **Progress:** index, report
- **Profile:** documents, certificates, grant, notes, assignments
- **Mentors:** list, `[id]`, schedule-meeting
- **Sessions:** index, `[id]`
- **Voice notes:** index, detail
- **Support:** contact-information, call-mentor

#### Mentor (`app/(mentor)/`)
- **Roadmap:** landing, phases, assign-roadmaps, select-roadmap, comments, queries
- **Assessments:** PMP/CMA surveys, assessments-v2 (create, assign)
- **Appointments:** index, availability, WeeklyCalendar
- **Mentees:** index, mentee-profile, mentee-progress, documents, progress-tracker
- **Review center:** pending pastor submissions
- **Sessions:** index, `[id]`, insights
- **Voice notes:** index, detail
- **Notes:** index, new-note, note-detail

#### Director in-app (`app/(director)/`)
- New interests, mentors, mentees, progress tracker
- Revitalization roadmaps (create, assign)
- Assessments, appointments, micro-grant
- Product & services

#### Shared
- `schedule-meeting/person` → `time` → `confirm`
- `appointments/meeting-details`
- `oauth/google-calendar`

> **Note:** `app/(mentor-tabs)/` exists (~50 files) but is **not mounted** in root layout — legacy duplicate; use `(mentor)/` only.

### Key UI Components

| Component | Location | Role |
|-----------|----------|------|
| `CustomDrawer` | `components/director/` | Side menu (all roles) |
| `AppGradientBackground` | `components/layout/` | App background |
| `FloatingToast` | `components/atom/toast` | Toast messages |
| `AuthBootstrap` | `components/auth/` | Cold-start session recovery |

**Menus:** `constants/mockData.ts` → `PastorMenuItems`, `MentorMenuItems`, `MENU_ITEMS` (director)

---

## 5. Pastor & Mentor — Core Modules

### Authentication

**Files:** `hooks/auth/useAuth.ts`, `services/auth.service.ts`, `stores/auth.store.ts`, `utils/storage.ts`, `components/auth/AuthBootstrap.tsx`

**Flows:**
1. **New user:** Interest form → `useSendOtp` → `useVerifyOtp` → `useSetPassword` → profile setup
2. **Returning user:** `useLogin` → tokens to SecureStore → `setUser` → `getAuthenticatedHomeRoute(role)`
3. **Cold start:** Zustand rehydrates → `auth.store.initialize()` validates tokens → `AuthBootstrap` navigates to correct home
4. **Logout:** `useLogout` → API logout → clear SecureStore + AsyncStorage + React Query cache

**Login success (simplified):**

```typescript
// hooks/auth/useAuth.ts — onSuccess
const { user, accessToken, refreshToken } = response.data;
await storage.setTokens(accessToken, refreshToken);  // SecureStore
await storage.setUserData(user);                     // SecureStore (user JSON)
setUser(user);                                       // Zustand + AsyncStorage mirror
const homeRoute = getAuthenticatedHomeRoute(user.role);
router.replace(homeRoute);  // /(pastor)/(tabs) or /(mentor)/(tabs) or /(director)/(tabs)
```

### User Profile

**Files:** `hooks/useProfile.ts`, `services/profile.service.ts`, `stores/profile.store.ts`

- Dynamic form fields from API
- Document upload, profile picture, certificates, grant application

### Dashboard / Home

- **Pastor:** Focus tiles, new assignments, progress overview (`usePastorFocusItems`, etc.)
- **Mentor:** Mentee progress tab, review center badge, discover/resources
- **Director:** Program overview (in-app director tabs)

### API Module

**Files:** `services/api/client.ts`, `interceptors.ts`, `endpoints.ts`

Same pattern as Director app: Axios instance, Bearer token, 401 refresh queue.

### Notifications

**Files:** `components/providers/AppNotificationsProvider.tsx`, `services/notifications.service.ts`, `expo-notifications`

- Registers device push token with backend
- In-app notification list per role

### Storage

No local SQL database. See [Section 7](#7-pastor--mentor--storage).

---

## 6. Pastor & Mentor — API Integration

**Config:** `constants/config/api.ts`

### Services (`services/`)

| Service | Domain |
|---------|--------|
| `auth.service.ts` | Login, OTP, password, refresh, logout |
| `roadmap.service.ts` | Roadmaps, sessions, comments, queries |
| `assessment.service.ts` | Assessments, answers, recommendations |
| `appointments.service.ts` | Appointments, availability |
| `mentoring-sessions.service.ts` | Session reschedule, grouped sessions |
| `mentors.service.ts`, `mentees.service.ts` | Assignments |
| `progress.service.ts` | Progress, assign roadmap/assessment |
| `grant.service.ts` | Micro-grant |
| `voiceNotes.service.ts` | Voice notes + transcription |
| `interests.service.ts`, `onboarding.service.ts` | Interest forms |
| `certificates.service.ts` | Certificates |
| `googleCalendar.service.ts` | Calendar status |
| `notifications.service.ts` | Push tokens |

### Key Endpoints

Full list in `services/api/endpoints.ts`. Major groups:

| Group | Examples |
|-------|----------|
| AUTH | `POST /auth/login`, `/send-otp`, `/verify-otp`, `/refresh-token` |
| ROADMAPS | `GET /roadmaps`, `POST /roadmaps/:id/nested`, comments, queries |
| ASSESSMENTS | `GET /assessment`, `POST /assessment/:id/answers` |
| APPOINTMENTS | `GET /appointments/user/:id`, `POST /appointments/availability` |
| MENTORING_SESSIONS | Session CRUD, reschedule |
| PROGRESS | `GET /progress/:userId`, assign roadmap/assessment |
| GRANT | `POST /microgrant/apply`, `GET /microgrant/applications` |

### Auth Mechanism

- JWT Bearer in `Authorization` header
- 401 → refresh token → retry queued requests
- Failed refresh → logout → welcome screen

### Error Handling

- Interceptor normalizes to `{ message, statusCode, errors }`
- `react-native-toast-message` for user feedback
- React Query retry: 2 attempts, 5-min stale time default

---

## 7. Pastor & Mentor — Storage

| Data | Where | File |
|------|-------|------|
| access_token, refresh_token | SecureStore | `utils/storage.ts` |
| user_data (JSON) | SecureStore | `utils/storage.ts` |
| Auth snapshot | AsyncStorage | Zustand persist `auth-storage` |
| Onboarding progress | AsyncStorage | `onboarding.store.ts` |
| Assessment drafts | AsyncStorage | `assessment.store.ts` |
| Schedule meeting draft | Zustand (memory) | `scheduleMeeting.store.ts` |
| API cache | Memory | React Query |

**No on-device database.** All business data lives on the backend.

**Token storage — line by line:**

```typescript
// utils/storage.ts
const KEYS = {
    ACCESS_TOKEN: 'access_token',    // Key name in SecureStore
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
};

setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);   // Encrypted on device
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
},
```

---

## 8. Pastor & Mentor — Code Walkthrough

### Files to Read First

| Priority | File | Why |
|----------|------|-----|
| 1 | `app/_layout.tsx` | Root providers, role guards |
| 2 | `stores/auth.store.ts` | Session + initialize |
| 3 | `hooks/auth/useAuth.ts` | Login, OTP, logout |
| 4 | `services/api/interceptors.ts` | Token attach, refresh |
| 5 | `services/api/endpoints.ts` | All API paths |
| 6 | `utils/userRole.ts` | Role helpers, home routes |
| 7 | `constants/mockData.ts` | Drawer menus |
| 8 | `components/auth/AuthBootstrap.tsx` | Cold-start navigation |

### Zustand Stores

| Store | Purpose |
|-------|---------|
| `auth.store` | User, isAuthenticated, initialize, logout |
| `onboarding.store` | Interest form, OTP steps |
| `assessment.store` | Answer drafts |
| `scheduleMeeting.store` | Schedule wizard state |
| `voiceNotes.store` | Recording state |
| `grant.store` | Micro-grant form |
| `profile.store` | Profile UI flags |

### Custom Hooks (by domain)

- **Auth:** `useLogin`, `useSendOtp`, `useVerifyOtp`, `useSetPassword`, `useLogout`, `useStartupRecovery`
- **Roadmaps:** `useRoadmaps`, `useRoadmapTask`, `useAssignRoadmaps`, `useMentorshipSessions`
- **Assessments:** `useAssessments`, `useSubmitAnswers`, `useCreateAssessment`
- **Appointments:** `useAppointments`, `useCreateAppointment`, `useMeetingScheduler`
- **Mentors/Mentees:** `useMentors`, `useMentees`, `useReviewCenter`, `useReviewCenterV2`
- **Pastor home:** `usePastorFocusItems`, `usePastorProgressOverview`, `usePastorCertificate`
- **Voice:** `useVoiceNotes`, `useAudioPlayer`

---

## 9. Pastor & Mentor — Security

- JWT in **SecureStore** (not AsyncStorage)
- Role-based `Stack.Protected` — entire navigators hidden per role
- Profile gate: pastor/mentor redirected to `profile-setup` if no profile picture
- Logout clears SecureStore + AsyncStorage + query cache
- **Caveat:** User JSON duplicated in SecureStore and Zustand persist (dual source — prefer SecureStore on init)

---

## 10. Pastor & Mentor — Libraries

| Package | Purpose |
|---------|---------|
| `nativewind`, `tailwindcss` | Utility-first styling |
| `@gluestack-ui/*` | Component primitives |
| `expo-notifications` | Push notifications |
| `expo-av` | Voice note recording |
| `react-native-maps` | Location features |
| `react-native-otp-entry` | OTP input UI |
| `react-native-signature-canvas` | Digital signatures |
| `react-native-calendars` | Appointment calendars |
| `react-native-gifted-charts` | Progress charts |
| `zeego`, `lucide-react-native` | Menus and icons |
| `patch-package` | Dependency patches |
| `country-state-city` | Address forms |

---

## 11. Pastor & Mentor — Errors

- Axios interceptor dev logs: `[API]` prefix when `__DEV__`
- `AuthBootstrap` + `useStartupRecovery` recover "dead zone" navigation (authenticated but no stack mounted)
- `utils/auth-navigation-debug.ts` — navigation state logging
- Toast for user-facing errors; `Alert` for critical auth failures

---

## 12. Pastor & Mentor — Build

```bash
cd D:\C-M
npm install
# Set .env: EXPO_PUBLIC_API_URL, EXPO_PUBLIC_API_TIMEOUT
npm start          # Runs fix-encoding.js then expo start
npm run android
npm run ios
```

| Script | Action |
|--------|--------|
| `npm start` | Dev server (auto-fixes encoding) |
| `npm run lint` | Encoding check + ESLint |
| `eas build --profile production` | Store build |

**EAS profiles:** development (dev client), preview (APK), production (app-bundle, auto-increment)

---

# APP 2: CCC Director Mobile

**Path:** `D:\CCC-Director-Mobile`  
**Package:** `ccc-director`

---

## 1. Director — Project Overview

### Purpose

Dedicated mobile app for **Directors** and **Super Admins** to manage the CCC program: review interests, assign mentor–pastor pairings, create roadmaps and assessments, schedule meetings, review micro-grants, issue certificates, and monitor progress.

### Main Features

| Feature | Description |
|---------|-------------|
| Dashboard | Overview, quick actions, glance stats, AI insights shortcuts |
| New Interests | Review incoming pastor applications |
| Mentors & Pastors | Lists, profiles, assign/remove pairings, documents |
| Progress Tracker | Per-user progress, final comments, reports |
| Schedule | Appointments, availability, Google Calendar |
| Roadmaps | Create, edit, assign revitalization roadmaps |
| Assessments | Create, assign, view CDP/results |
| Micro Grant | Review applications |
| Course Completed | Certificate / completion workflow |
| Directors | Super-admin director CRUD |
| Profile | Documents, personal notes |

### Target Users

- **Director** — program management
- **Super Admin** — director accounts + all director features

> Login **blocks** mentor and pastor roles with "Access Denied" alert.

### Technology Stack

| Layer | Technology |
|-------|------------|
| Core | Expo 54, React 19, RN 0.81, TypeScript 5.9 |
| Routing | Expo Router 6 |
| State | React Query 5 + Zustand 5 |
| Styling | Custom `components/ui/design-system/` |
| HTTP | Axios |
| Animation | Reanimated 4, Moti |
| UI | Gorhom Bottom Sheet, Gifted Charts, Calendars |

---

## 2. Director — Project Structure

```
D:\CCC-Director-Mobile\
├── src/
│   ├── app/                # Expo Router screens
│   │   ├── (auth)/         # Login
│   │   ├── (director)/     # Drawer + tabs
│   │   ├── schedule-meeting/
│   │   ├── appointments/
│   │   └── oauth/
│   ├── assets/
│   ├── components/         # Cards, Forms, Modals, Sheets, Header, Drawer
│   ├── config/               # API_CONFIG
│   ├── constants/            # MENU_ITEMS, icons, Colors
│   ├── contexts/             # AddFieldSheetContext
│   ├── hooks/                # React Query hooks
│   ├── lib/                  # scheduling, assessment helpers
│   ├── navigation/           # routes.ts (typed Hrefs)
│   ├── services/             # API services
│   ├── stores/               # Zustand
│   ├── types/
│   └── utils/
├── android/
├── app.json, eas.json, package.json, tsconfig.json
└── .env.example
```

**Path alias:** `@/*` → `./src/*`

---

## 3. Director — Application Architecture

### Pattern

Same layered approach as Pastor/Mentor app:

```
src/app/ → hooks/ → services/ → apiClient → REST API
         ↘ stores/
```

### Root Navigation

`src/app/_layout.tsx`:

```typescript
const { isAuthenticated } = useAuthStore();

<Stack.Protected guard={!isAuthenticated}>
  <Stack.Screen name="(auth)" />        // Login when logged OUT
</Stack.Protected>

<Stack.Protected guard={isAuthenticated}>
  <Stack.Screen name="(director)" />    // Main app when logged IN
</Stack.Protected>

<Stack.Protected guard={canUseScheduleMeeting}>
  <Stack.Screen name="schedule-meeting" />
</Stack.Protected>
```

**Inside director:** `Drawer` (`(director)/_layout.tsx`) → `Tabs` (`(tabs)/_layout.tsx`)

**Visible bottom tabs:** Alerts | Dashboard | Profile

Most features are **drawer items** with **hidden tab routes** (`href: null`).

### State Management

| Tool | Used for |
|------|----------|
| React Query | All API data |
| Zustand `auth.store` | user, isAuthenticated |
| Zustand others | schedule meeting, notes invalidation, mentor/mentee nav |
| SecureStore | JWT tokens only |
| AsyncStorage | Zustand auth persist (`director-auth`) |

---

## 4. Director — Screens

### Authentication

| Route | File | Purpose |
|-------|------|---------|
| `(auth)/` | `(auth)/index.tsx` | Login (email + password) |

### Dashboard & Tabs

| Route | Purpose |
|-------|---------|
| `(tabs)/index` | Home dashboard |
| `(tabs)/notifications` | Alerts tab |
| `(tabs)/profile` | Director profile |
| `(tabs)/ai-insights` | AI insights |

### Drawer Features (hidden tabs)

| Area | Key routes |
|------|------------|
| **New Interests** | `new-interests/index`, `interest-details` |
| **Mentors** | `mentors/index`, `mentors/[id]`, `assign-mentees`, `remove-mentee` |
| **Pastors** | `mentees/index`, `mentees/[id]`, `assign-mentors`, documents, progress |
| **Progress** | `progress-tracker/index`, `[userId]`, `report` |
| **Schedule** | `appointments/index`, `availability` |
| **Roadmaps** | `roadmaps/index`, creation flow, `assign-roadmaps`, `phase-list`, `task` |
| **Assessments** | `assessments/index`, `create-assessment`, `assign-assessments`, `result`, `cdp` |
| **Micro Grant** | `micro-grant/index`, `[id]`, `review/[id]` |
| **Course Completed** | `course-completed/index` |
| **Directors** | `directors/index` (super admin) |
| **Profile** | `profile/documents`, `profile/personal-notes/*` |
| **CCC** | `invite-field-mentor`, `ccc/interest-form`, `product-and-services` |

### Shared Flows

- `schedule-meeting/person` → `time` → `confirm`
- `appointments/meeting-details`
- `oauth/google-calendar`

**Menu:** `src/constants/index.ts` → `MENU_ITEMS`

---

## 5. Director — Core Modules

### Authentication

**Login role gate** (`src/hooks/useAuth.ts`):

```typescript
const allowedRoles = ['director', 'super admin'];
if (!allowedRoles.includes(user.role)) {
    Alert.alert("Access Denied", "This application is restricted to Directors and Administrators.");
    return;  // Stops login — tokens NOT saved
}
await storage.setTokens(accessToken, refreshToken);
setUser(normalizedUser);
router.replace('/(director)/(tabs)');
```

### Profile

`src/hooks/useProfile.ts`, `src/services/profile.service.ts`, `src/components/ProfileSection/`

### Dashboard

`src/app/(director)/(tabs)/index.tsx` composes:
- `GlanceSection`, `QuickActionSection`, `RoadMapsSection`
- `AssesmentsAndCDPSection`, `MentorShipAndSupportSection`
- `TrackingAndReportsSection`, `AiInsightsSection`, `DirectorsNotesSection`

### Notifications

`src/hooks/useNotifications.ts` → `GET /home/notifications?role=director`

### API Module

`src/services/api/client.ts`, `interceptors.ts`, `endpoints.ts`

---

## 6. Director — API Integration

**Config:** `src/config/index.ts`

### Services (`src/services/`)

| Service | Domain |
|---------|--------|
| `auth.service.ts` | Login |
| `director.service.ts` | Director-specific APIs |
| `users.service.ts` | User CRUD |
| `mentors.service.ts`, `mentee.service.ts` | Pairings |
| `roadmap.service.ts` | Roadmaps |
| `assessments.service.ts` | Assessments |
| `appointments.service.ts` | Appointments |
| `microgrant.service.ts` | Micro-grants |
| `progress.service.ts` | Progress overview |
| `certificates.service.ts` | Certificates |
| `interest.service.ts` | Interests |
| `notifications.service.ts` | Notifications |
| `notes.service.ts` | Personal notes |
| `googleCalendar.service.ts` | Calendar OAuth |
| `scholorship.service.ts` | Scholarships |

### Endpoints

Full constants in `src/services/api/endpoints.ts` — same API groups as Pastor/Mentor app, plus:

- `SUPER_ADMIN` — `/super-admin/directors`
- `USERS_COMPLETION` — certificate issue, field mentor invite
- `SCHOLARSHIPS` — scholarship management

### Auth & Errors

Same JWT + refresh pattern as Pastor/Mentor app. See `src/services/api/interceptors.ts`.

---

## 7. Director — Storage

| Data | Where |
|------|-------|
| accessToken, refreshToken | SecureStore (`src/utils/tokenStorage.ts`) |
| user, isAuthenticated | Zustand persist → AsyncStorage (`director-auth`) |
| API cache | React Query (memory) |

**No local database.**

```typescript
// src/utils/tokenStorage.ts
await SecureStore.setItemAsync("accessToken", accessToken);
await SecureStore.setItemAsync("refreshToken", refreshToken);
```

Tokens are **never** stored in Zustand (comments in `auth.store.ts` enforce this).

---

## 8. Director — Code Walkthrough

### Files to Read First

| Priority | File | Why |
|----------|------|-----|
| 1 | `src/app/_layout.tsx` | Providers, auth guards |
| 2 | `src/services/api/interceptors.ts` | Token + refresh |
| 3 | `src/services/api/endpoints.ts` | API paths |
| 4 | `src/hooks/useAuth.ts` | Login + role gate |
| 5 | `src/stores/auth.store.ts` | Session state |
| 6 | `src/constants/index.ts` | Drawer menu |
| 7 | `src/app/(director)/(tabs)/_layout.tsx` | Tab bar |
| 8 | `src/navigation/routes.ts` | Typed route helpers |
| 9 | `src/app/(director)/(tabs)/index.tsx` | Dashboard |

### Zustand Stores

| Store | Purpose |
|-------|---------|
| `auth.store` | User session |
| `scheduleMeeting.store` | Schedule wizard |
| `notes.store` | Notes list invalidation |
| `mentorsNavigation.store` | Mentor list nav state |
| `menteesNavigation.store` | Mentee list nav state |

### Typed Routes

`src/navigation/routes.ts` — type-safe navigation:

```typescript
Routes.assessments.detail(id)       // → /assessments/[id] with params
Routes.roadmaps.phaseListFor(roadmapId, userId)
Routes.progressTracker.detail(userId)
```

### Reusable Components

| Component | Use |
|-----------|-----|
| `GradientBackground`, `PrimaryButton` | Design system |
| `ProfileContent` | Shared profile layout |
| `DynamicFieldRenderer` | Dynamic forms |
| `RoadmapCard`, `AssessmentCard` | List cards |
| `CreateRoadmapSheet` | Bottom sheet creation |
| `CertificatePreview` | Certificate PDF |

---

## 9. Director — Security

- **Role gate at login** — only director / super admin
- **Drawer menu filtering** — super-admin-only items hidden for directors
- **Tokens in SecureStore only**
- `usesCleartextTraffic: false` on Android (HTTPS)
- Interceptor strips `undefined` from URLs/params

---

## 10. Director — Libraries

| Package | Purpose |
|---------|---------|
| `moti` | UI animations |
| `@gorhom/bottom-sheet` | Modal sheets |
| `react-native-gifted-charts` | Charts |
| `react-native-calendars` | Scheduling |
| `react-native-signature-canvas` | Signatures in forms |
| `expo-print`, `expo-sharing` | Certificate PDF |
| `react-native-mmkv` | In package.json (auth uses AsyncStorage currently) |
| `expo-dev-client` | Development builds |

---

## 11. Director — Errors

- Dev-only `[API]` logs in interceptors when `__DEV__`
- React Query: no retry on 401/403; max 2 retries otherwise
- `Alert.alert` on login errors and validation failures

---

## 12. Director — Build

```bash
cd D:\CCC-Director-Mobile
npm install
cp .env.example .env   # Set EXPO_PUBLIC_API_URL
npx expo start
npm run android
npm run ios
```

**Bundle IDs:** `com.vkyboss.cccdirector`  
**EAS project:** `app.json` → `extra.eas.projectId`

| Profile | Use |
|---------|-----|
| development | Dev client, internal |
| preview | Internal testing |
| production | Store release, auto-increment |

---

## Future Improvements

### Both Apps
- Add `.env.example` to Pastor/Mentor repo (Director already has one)
- Consolidate duplicate director code between `D:\C-M` `(director)` and `D:\CCC-Director-Mobile`
- Shared npm package for `endpoints.ts`, types, and interceptors
- Certificate pinning for production API

### Pastor & Mentor (`D:\C-M`)
- Remove or archive legacy `(mentor-tabs)/` routes
- Remove legacy `AuthContext` mock if unused
- Tighten iOS `NSAllowsArbitraryLoads` for production
- Single source of truth for user JSON (SecureStore vs Zustand)

### Director (`D:\CCC-Director-Mobile`)
- Call `authStore.initialize()` on app boot
- Migrate Zustand persist to MMKV for faster startup
- Wire `POST /auth/logout` on sign-out
- Remove debug `console.log` in dashboard

---

## Summary for New Developers

### Which repo am I in?

| Question | `D:\C-M` | `D:\CCC-Director-Mobile` |
|----------|----------|--------------------------|
| I'm building pastor/mentor features | ✅ | ❌ |
| I'm building director-only features | ⚠️ Also in C-M `(director)/` | ✅ Preferred |
| Where is `app/` folder? | Project root | `src/app/` |
| Where are menus? | `constants/mockData.ts` | `src/constants/index.ts` |

### Typical development flow (both apps)

```
1. Find the screen in app/ or src/app/
2. Find the hook it calls (hooks/)
3. Find the service (services/)
4. Check endpoint in services/api/endpoints.ts
5. Test with correct .env API URL
```

### Auth flow comparison

```
Pastor/Mentor App:
  Welcome → Onboarding OR Login → Role-based drawer home

Director App:
  Login only → Role check (director/super admin) → Director drawer home
```

### Overall ecosystem flow

```
User action on screen
    → Custom hook (useQuery / useMutation)
    → Service function
    → Axios (+ Bearer token)
    → CCC Backend /api/v1
    → Response cached in React Query
    → UI re-renders

Login:
    → Tokens → SecureStore
    → User profile → Zustand (+ AsyncStorage persist)
    → Expo Router navigates to role home
```

---

*This document covers both `D:\C-M` (CCC Pastor & Mentor) and `D:\CCC-Director-Mobile` (CCC Director). Update when architecture or routes change significantly.*

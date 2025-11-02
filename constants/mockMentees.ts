import { icons } from "@/constants/images"

export interface MenteeDocumentItem {
  id: string
  title: string
  time?: string
  date?: string
  type: "recent" | "library"
}

export interface MenteeProfile {
  id: string
  name: string
  firstName: string
  lastName: string
  role: string
  avatar: any
  phone: string
  email: string
  progress: {
    percent: number
    status: "in-progress" | "completed"
    updatedOn: string
  }
  primaryChurch: {
    name: string
    phone: string
    website: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  secondaryChurch: {
    name: string
    phone: string
    website: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  otherInfo: {
    title: string
    yearsInMinistry: string
    conference: string
  }
  documents: {
    recentUploads: MenteeDocumentItem[]
    library: MenteeDocumentItem[]
  }
}

export const menteeProfiles: Record<string, MenteeProfile> = {
  "john-ross": {
    id: "john-ross",
    name: "John Ross",
    firstName: "John",
    lastName: "Ross",
    role: "Pastor",
    avatar: icons.myProfile,
    phone: "09878564398",
    email: "johnross@gmail.com",
    progress: {
      percent: 70,
      status: "in-progress",
      updatedOn: "12 Oct 2024",
    },
    primaryChurch: {
      name: "Loma Linda University Church",
      phone: "09878564398",
      website: "johnross@gmail.com",
      address: "Loma Linda University Church, CA",
      city: "Ockland",
      state: "North American",
      zipCode: "00000",
      country: "USA",
    },
    secondaryChurch: {
      name: "Loma Linda University Church",
      phone: "09878564398",
      website: "johnross@gmail.com",
      address: "Loma Linda University Church, CA",
      city: "Ockland",
      state: "North American",
      zipCode: "00000",
      country: "USA",
    },
    otherInfo: {
      title: "Mentor",
      yearsInMinistry: "11",
      conference: "Ockland",
    },
    documents: {
      recentUploads: [
        {
          id: "recent-1",
          title: "My Educational Documents 1.pdf",
          type: "recent",
          time: "9:41 am",
        },
        {
          id: "recent-2",
          title: "My Experience Document 1.pdf",
          type: "recent",
          time: "9:41 am",
        },
        {
          id: "recent-3",
          title: "My Educational Certificate 1.pdf",
          type: "recent",
          time: "9:41 am",
        },
      ],
      library: [
        {
          id: "library-1",
          title: "My Educational Documents 1.pdf",
          type: "library",
          date: "18/09/2024",
        },
        {
          id: "library-2",
          title: "My Experience Document 1.pdf",
          type: "library",
          date: "18/09/2024",
        },
        {
          id: "library-3",
          title: "My Educational Certificate 1.pdf",
          type: "library",
          date: "18/09/2024",
        },
      ],
    },
  },
}

export const menteeList = Object.values(menteeProfiles).map(
  ({ id, name, role }) => ({ id, name, role })
)

// Mock notes data for mentees
export interface MentorNote {
  id: string
  menteeId: string
  content: string
  date: string
  time: string
  preview: string
  createdAt: string
}

export const mockMentorNotes: Record<string, MentorNote[]> = {
  "john-ross": [
    {
      id: "note-1",
      menteeId: "john-ross",
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in rep

1. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in rep

2. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in rep

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis`,
      date: "Yesterday",
      time: "09:15 AM",
      preview:
        "Lorem ipsum dolor sit amet, consectetur sed do eiusadpiscing elit, sed do eiusmod  ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
      createdAt: "2024-11-01T09:15:00Z",
    },
    {
      id: "note-2",
      menteeId: "john-ross",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      date: "09/11/24",
      time: "09:15 AM",
      preview:
        "Lorem ipsum dolor sit amet, consectetur sed do eiusadpiscing elit, sed do eiusmod  ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
      createdAt: "2024-09-11T09:15:00Z",
    },
    {
      id: "note-3",
      menteeId: "john-ross",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      date: "09/11/24",
      time: "09:15 AM",
      preview:
        "Lorem ipsum dolor sit amet, consectetur sed do eiusadpiscing elit, sed do eiusmod  ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
      createdAt: "2024-09-11T09:15:00Z",
    },
    {
      id: "note-4",
      menteeId: "john-ross",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      date: "09/11/24",
      time: "09:15 AM",
      preview:
        "Lorem ipsum dolor sit amet, consectetur sed do eiusadpiscing elit, sed do eiusmod  ut labore et dolore magna aliqua. Ut enim ad minim veniam...",
      createdAt: "2024-09-11T09:15:00Z",
    },
  ],
}


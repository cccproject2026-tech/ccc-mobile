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
  description?: string
  progress: {
    percent: number
    status: "in-progress" | "completed"
    updatedOn: string
    currentPhase?: string
    isMarkedComplete?: boolean
    completedOn?: string
    finalComments?: string
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
    description: "Sub text area write something here. That you can read more about him",
    progress: {
      percent: 70,
      status: "in-progress",
      updatedOn: "12 Oct 2024",
      currentPhase: "Church Empowerment",
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
  "john-doe": {
    id: "john-doe",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    role: "Pastor",
    avatar: icons.myProfile,
    phone: "09878564399",
    email: "johndoe@gmail.com",
    description: "Sub text area write something here. That you can read more about him",
    progress: {
      percent: 100,
      status: "in-progress",
      updatedOn: "20 Oct 2024",
      currentPhase: "Community Revitalization and Multiplication",
      isMarkedComplete: false,
    },
    primaryChurch: {
      name: "Community Church",
      phone: "09878564399",
      website: "communitychurch.com",
      address: "123 Main St",
      city: "Springfield",
      state: "North American",
      zipCode: "12345",
      country: "USA",
    },
    secondaryChurch: {
      name: "Community Church",
      phone: "09878564399",
      website: "communitychurch.com",
      address: "123 Main St",
      city: "Springfield",
      state: "North American",
      zipCode: "12345",
      country: "USA",
    },
    otherInfo: {
      title: "Pastor",
      yearsInMinistry: "8",
      conference: "Springfield",
    },
    documents: {
      recentUploads: [],
      library: [],
    },
  },
  "sarah-johnson": {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    firstName: "Sarah",
    lastName: "Johnson",
    role: "Pastor",
    avatar: icons.myProfile,
    phone: "09878564400",
    email: "sarahjohnson@gmail.com",
    description: "Sub text area write something here. That you can read more about him",
    progress: {
      percent: 45,
      status: "in-progress",
      updatedOn: "15 Oct 2024",
      currentPhase: "Self Revitalization",
    },
    primaryChurch: {
      name: "Grace Fellowship",
      phone: "09878564400",
      website: "gracefellowship.com",
      address: "456 Oak Ave",
      city: "Portland",
      state: "North American",
      zipCode: "54321",
      country: "USA",
    },
    secondaryChurch: {
      name: "Grace Fellowship",
      phone: "09878564400",
      website: "gracefellowship.com",
      address: "456 Oak Ave",
      city: "Portland",
      state: "North American",
      zipCode: "54321",
      country: "USA",
    },
    otherInfo: {
      title: "Pastor",
      yearsInMinistry: "5",
      conference: "Portland",
    },
    documents: {
      recentUploads: [],
      library: [],
    },
  },
  "michael-brown": {
    id: "michael-brown",
    name: "Michael Brown",
    firstName: "Michael",
    lastName: "Brown",
    role: "Pastor",
    avatar: icons.myProfile,
    phone: "09878564401",
    email: "michaelbrown@gmail.com",
    description: "Sub text area write something here. That you can read more about him",
    progress: {
      percent: 100,
      status: "completed",
      updatedOn: "20 Oct 2024",
      currentPhase: "Community Revitalization and Multiplication",
      isMarkedComplete: true,
      completedOn: "20 Oct 2024",
      finalComments: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in rep",
    },
    primaryChurch: {
      name: "Faith Community",
      phone: "09878564401",
      website: "faithcommunity.com",
      address: "789 Elm St",
      city: "Seattle",
      state: "North American",
      zipCode: "98765",
      country: "USA",
    },
    secondaryChurch: {
      name: "Faith Community",
      phone: "09878564401",
      website: "faithcommunity.com",
      address: "789 Elm St",
      city: "Seattle",
      state: "North American",
      zipCode: "98765",
      country: "USA",
    },
    otherInfo: {
      title: "Pastor",
      yearsInMinistry: "12",
      conference: "Seattle",
    },
    documents: {
      recentUploads: [],
      library: [],
    },
  },
  "emily-davis": {
    id: "emily-davis",
    name: "Emily Davis",
    firstName: "Emily",
    lastName: "Davis",
    role: "Pastor",
    avatar: icons.myProfile,
    phone: "09878564402",
    email: "emilydavis@gmail.com",
    description: "Sub text area write something here. That you can read more about him",
    progress: {
      percent: 85,
      status: "in-progress",
      updatedOn: "18 Oct 2024",
      currentPhase: "Church Empowerment",
    },
    primaryChurch: {
      name: "New Hope Church",
      phone: "09878564402",
      website: "newhopechurch.com",
      address: "321 Pine St",
      city: "Denver",
      state: "North American",
      zipCode: "80201",
      country: "USA",
    },
    secondaryChurch: {
      name: "New Hope Church",
      phone: "09878564402",
      website: "newhopechurch.com",
      address: "321 Pine St",
      city: "Denver",
      state: "North American",
      zipCode: "80201",
      country: "USA",
    },
    otherInfo: {
      title: "Pastor",
      yearsInMinistry: "7",
      conference: "Denver",
    },
    documents: {
      recentUploads: [],
      library: [],
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


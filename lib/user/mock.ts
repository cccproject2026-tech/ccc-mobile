import { MockUserWithPassword, UserRole } from "./types";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
    churchName?: string;
    churchPhone?: string;
    churchWebsite?: string;
    churchAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    title?: string;
    yearsInMinistry?: number;
    conference?: string;
}



export const MOCK_USERS: MockUserWithPassword[] = [
    {
        id: '1',
        email: 'pastor@example.com',
        password: 'pastor123',
        firstName: 'John',
        lastName: 'Smith',
        phoneNumber: '269-471-6159',
        role: 'pastor',
        churchName: 'Community Church',
        churchPhone: '269-471-0000',
        churchWebsite: 'www.communitychurch.com',
        churchAddress: '123 Church St',
        city: 'Berrien Springs',
        state: 'MI',
        zipCode: '49103',
        country: 'USA',
        title: 'Senior Pastor',
        yearsInMinistry: 15,
        conference: 'Lake Region'
    },
    {
        id: '2',
        email: 'mentor@example.com',
        password: 'mentor123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phoneNumber: '269-471-6160',
        role: 'mentor'
    },
    {
        id: '3',
        email: 'director@example.com',
        password: 'director123',
        firstName: 'Michael',
        lastName: 'Williams',
        phoneNumber: '269-471-6161',
        role: 'director'
    }
];

// Mock API delay helper
export const mockApiDelay = (ms: number = 1000): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

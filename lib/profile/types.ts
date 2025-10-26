export interface ProfileData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    title: string;
    yearsInMinistry: string;
    conference: string;
    profileInfo: string;
    churches: ChurchInfo[];
    communityServiceProjects: string;
    interests: string;
    comments: string;
}

export interface ChurchInfo {
    name: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}


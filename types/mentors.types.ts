export interface MentorListItem {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
}

export interface AssignedMentorItem {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
}

export interface MentorDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    profileInfo: string;
    churchDetails: any[];
    conference: string;
}



export interface GetMentorsApiResponse {
    success: boolean;
    message: string;
    data: {
        mentors: MentorListItem[];
        total: number;
    };
}

export interface GetAssignedMentorsApiResponse {
    success: boolean;
    message: string;
    data: AssignedMentorItem[];
}

export interface GetMentorByEmailApiResponse {
    success: boolean;
    message: string;
    data: MentorDetail;
}


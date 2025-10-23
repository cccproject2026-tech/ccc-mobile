import { ProfileData } from "./types";

export const TITLE_OPTIONS = [
    'Pastor',
    'Associate Pastor',
    'Youth Pastor',
    'Senior Pastor',
    'Elder'
];

export const INITIAL_PROFILE_DATA: ProfileData = {
    firstName: 'John',
    lastName: 'Ross',
    phone: '09878564398',
    email: 'johnross@gmail.com',
    title: 'Pastor',
    yearsInMinistry: '11',
    conference: 'Oakland',
    profileInfo: 'Lorem ipsum dolor sit amet, consectetur adipiscing eip ex ea commodo consequat. Duis',
    churches: [
        {
            name: 'Loma linda University Church',
            phone: '09878564398',
            website: 'johnross@gmail.com',
            address: 'Loma linda University Church,CA',
            city: 'Oakland',
            state: 'North American',
            zip: '00000',
            country: 'USA',
        },
    ],
    communityServiceProjects: '11',
    interests: 'I would like to find out more about the Center for Community Change',
    comments: 'I am a conference administrator and would like to find out more about partnering with the center',
};
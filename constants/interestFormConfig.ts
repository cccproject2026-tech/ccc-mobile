export interface FormField {
    id: string;
    type: 'text' | 'textarea' | 'checkbox' | 'dropdown';
    label: string;
    placeholder: string;
    defaultValue: string | boolean;
    keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
    showClearButton?: boolean;
    width?: 'full' | 'half';
}

export interface FormSection {
    id: string;
    title: string;
    fields: FormField[];
    showAddMoreButton?: boolean;
    checkboxesInContainer?: boolean;
}

export const interestFormConfig: FormSection[] = [
    {
        id: 'personal',
        title: 'Personal Information',
        fields: [
            {
                id: 'firstName',
                type: 'text',
                label: 'First Name',
                placeholder: 'First Name',
                defaultValue: '',
                width: 'half',
                showClearButton: true,
            },
            {
                id: 'lastName',
                type: 'text',
                label: 'Last Name',
                placeholder: 'Last Name',
                defaultValue: '',
                width: 'half',
            },
            {
                id: 'phoneNumber',
                type: 'text',
                label: 'Phone Number',
                placeholder: 'Phone Number',
                defaultValue: '',
                keyboardType: 'phone-pad',
                width: 'half',
            },
            {
                id: 'email',
                type: 'text',
                label: 'Email',
                placeholder: 'Email',
                defaultValue: '',
                keyboardType: 'email-address',
                width: 'half',
            },
        ],
    },
    {
        id: 'church',
        title: 'Current Church Information',
        showAddMoreButton: true,
        fields: [
            {
                id: 'churchName',
                type: 'text',
                label: 'Church Name',
                placeholder: 'Church Name',
                defaultValue: '',
                width: 'full',
            },
            {
                id: 'churchPhone',
                type: 'text',
                label: 'Church Phone',
                placeholder: 'Church Phone',
                defaultValue: '',
                keyboardType: 'phone-pad',
                width: 'half',
            },
            {
                id: 'churchWebsite',
                type: 'text',
                label: 'Church Website',
                placeholder: 'Church Website',
                defaultValue: '',
                width: 'half',
            },
            {
                id: 'churchAddress',
                type: 'text',
                label: 'Church Address',
                placeholder: 'Church Address',
                defaultValue: '',
                width: 'full',
            },
            {
                id: 'city',
                type: 'text',
                label: 'City',
                placeholder: 'City',
                defaultValue: '',
                width: 'half',
            },
            {
                id: 'state',
                type: 'text',
                label: 'State',
                placeholder: 'State',
                defaultValue: '',
                width: 'half',
            },
            {
                id: 'zipCode',
                type: 'text',
                label: 'Zip Code',
                placeholder: 'Zip Code',
                defaultValue: '',
                keyboardType: 'numeric',
                width: 'half',
            },
            {
                id: 'country',
                type: 'dropdown',
                label: 'Country',
                placeholder: 'Country',
                defaultValue: '',
                width: 'half',
            },
        ],
    },
    {
        id: 'other',
        title: 'Other Information',
        checkboxesInContainer: true,
        fields: [
            {
                id: 'title',
                type: 'dropdown',
                label: 'Title',
                placeholder: 'Title',
                defaultValue: '',
                width: 'full',
            },
            {
                id: 'yearsInMinistry',
                type: 'text',
                label: 'Years in Ministry',
                placeholder: 'Years in Ministry',
                defaultValue: '',
                keyboardType: 'numeric',
                width: 'half',
            },
            {
                id: 'conference',
                type: 'text',
                label: 'Conference',
                placeholder: 'Conference',
                defaultValue: '',
                width: 'half',
            },
            {
                id: 'serviceProjects',
                type: 'text',
                label: 'Current Community Service Projects',
                placeholder: 'Current Community Service Projects',
                defaultValue: '',
                width: 'full',
            },
            {
                id: 'interestsDropdown',
                type: 'dropdown',
                label: 'Interests',
                placeholder: 'Interests',
                defaultValue: '',
                width: 'full',
            },
            {
                id: 'interest1',
                type: 'checkbox',
                label: 'I would like to find out more about the Center for Community Change',
                placeholder: '',
                defaultValue: false,
                width: 'full',
            },
            {
                id: 'interest2',
                type: 'checkbox',
                label: 'I am interested in receiving mentoring in community engagement',
                placeholder: '',
                defaultValue: false,
                width: 'full',
            },
            {
                id: 'interest3',
                type: 'checkbox',
                label: 'I would like to talk to one of the mentors',
                placeholder: '',
                defaultValue: false,
                width: 'full',
            },
            {
                id: 'interest4',
                type: 'checkbox',
                label: 'I am a conference administrator and would like to find out more about partnering with the center',
                placeholder: '',
                defaultValue: false,
                width: 'full',
            },
        ],
    },
    {
        id: 'comments',
        title: 'Comments',
        fields: [
            {
                id: 'comments',
                type: 'textarea',
                label: 'Comments',
                placeholder: 'Comments',
                defaultValue: '',
                width: 'full',
            },
        ],
    },
];

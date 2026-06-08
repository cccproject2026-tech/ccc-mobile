export type ChurchDetails = {
	churchName?: string;
	churchPhone?: string;
	churchWebsite?: string;
	churchAddress?: string;
	city?: string;
	state?: string;
	zipCode?: string;
	country?: string;
};

export type InterestStatus = 'new' | 'pending' | 'accepted' | 'rejected';


// API RESPONSE TYPES (Backend contract)


export type InterestCardViewModel = {
	id: string;
	name: string;
	role: string;
	time: string;
	date: string;
	state: string;
	country: string;
	email?: string;
	phoneNumber?: string;
	conference?: string;
	status?: InterestStatus;
	
	mentors?: number;
	mentorsAssigned?: boolean;
	hasLoggedIn?: boolean;
	loginDate?: string;
	profileImage?: string;
};


// What the backend returns for interests
export type InterestItem = {
	_id: string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	email?: string;
	churchDetails: ChurchDetails[];
	title?: string;
	conference?: string;
	yearsInMinistry?: string;
	currentCommunityProjects?: string;
	interests: string[];
	comments?: string;
	createdAt?: string;
	updatedAt?: string;
	status?: InterestStatus; // Add this if backend supports it
};

export type InterestsApiResponse = {
	success: boolean;
	message: string;
	data: InterestItem[];
};

export type InterestMetadata = {
	titles: string[];
	countries: string[];
	countryStates: Array<{
		country: string;
		states: string[];
	}>;
	interests: string[];
};

export type InterestMetadataApiResponse = {
	success: boolean;
	message: string;
	data: InterestMetadata;
};

export type UpdateInterestStatusRequest = {
	status: 'accepted' | 'rejected' | 'pending';
};

export type UpdateInterestStatusResponse = {
	success: boolean;
	message: string;
	data: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		role: string;
		status: string;
		isEmailVerified: boolean;
	};
};
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

export type InterestItem = {
	id: string;
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



import {
	InterestItem,
	InterestMetadata,
	InterestMetadataApiResponse,
	InterestsApiResponse,
	UpdateInterestStatusRequest,
	UpdateInterestStatusResponse,
} from '@/types/interest.types';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const interestsService = {
	/**
	 * Fetch all interests
	 */
	getAll: async (): Promise<InterestItem[]> => {
		const response = await apiClient.get<InterestsApiResponse>(ENDPOINTS.INTERESTS.GET_ALL);
		// API returns { success, message, data }
		return response.data.data ?? [];
	},

	/**
	 * Fetch interest form metadata (titles, countries, states, interests)
	 */
	getMetadata: async (): Promise<InterestMetadata> => {
		const response = await apiClient.get<InterestMetadataApiResponse>(ENDPOINTS.INTERESTS.GET_METADATA);
		return response.data.data;
	},

	/**
	 * Update interest request status (accept/reject)
	 */
	updateStatus: async (
		interestId: string,
		status: 'accepted' | 'rejected' | 'pending'
	): Promise<UpdateInterestStatusResponse> => {
		const response = await apiClient.patch<UpdateInterestStatusResponse>(
			ENDPOINTS.INTERESTS.UPDATE_STATUS(interestId),
			{ status } as UpdateInterestStatusRequest
		);
		return response.data;
	},
};



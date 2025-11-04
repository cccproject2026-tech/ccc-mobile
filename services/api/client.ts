import { API_CONFIG } from '@/constants/config/api';
import axios from 'axios';

export const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Export for interceptor setup
export default apiClient;

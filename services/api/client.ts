import { API_CONFIG } from '@/constants/config/api';
import axios from 'axios';

export const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'expires': '0',
        'pragma-directive': 'no-cache',
        'cache-directive': 'no-cache',
        'no-cache': 'true',
        'no-store': 'true',
        'no-transform': 'true',
    },
});

// ✅ ADDED: Log configuration on startup
if (__DEV__) {
    console.log('\n🔧 API Client Configuration:');
    console.log('Base URL:', API_CONFIG.BASE_URL);
    console.log('Timeout:', API_CONFIG.TIMEOUT, 'ms');
    console.log('---\n');
}

export default apiClient;

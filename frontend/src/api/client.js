import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: async (name, email, password) => {
        const response = await apiClient.post('/auth/register', { name, email, password });
        return response.data;
    },

    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    },

    getMe: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};

// Portfolio API
export const portfolioAPI = {
    getAll: async () => {
        const response = await apiClient.get('/portfolio');
        return response.data;
    },

    add: async (portfolioData) => {
        const response = await apiClient.post('/portfolio', portfolioData);
        return response.data;
    },

    update: async (id, updates) => {
        const response = await apiClient.put(`/portfolio/${id}`, updates);
        return response.data;
    },

    remove: async (id) => {
        const response = await apiClient.delete(`/portfolio/${id}`);
        return response.data;
    },
};

// Favorites API
export const favoritesAPI = {
    getAll: async () => {
        const response = await apiClient.get('/favorites');
        return response.data;
    },

    add: async (cryptoId) => {
        const response = await apiClient.post('/favorites', { cryptoId });
        return response.data;
    },

    remove: async (cryptoId) => {
        const response = await apiClient.delete(`/favorites/${cryptoId}`);
        return response.data;
    },
};

// Alerts API
export const alertsAPI = {
    getAll: async () => {
        const response = await apiClient.get('/alerts');
        return response.data;
    },

    add: async (alertData) => {
        const response = await apiClient.post('/alerts', alertData);
        return response.data;
    },

    remove: async (id) => {
        const response = await apiClient.delete(`/alerts/${id}`);
        return response.data;
    },
};

// Crypto API (proxy to CoinGecko)
export const cryptoAPI = {
    getMarkets: async (currency = 'usd', perPage = 50) => {
        const response = await apiClient.get('/crypto/markets', {
            params: { vs_currency: currency, per_page: perPage },
        });
        return response.data;
    },

    getChartData: async (coinId, currency = 'usd', days = 7) => {
        const response = await apiClient.get(`/crypto/chart/${coinId}`, {
            params: { vs_currency: currency, days },
        });
        return response.data;
    },
};

export default apiClient;

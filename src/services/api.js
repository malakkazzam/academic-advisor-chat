// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ API Error:`, error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  login: (credentials) => api.post('/Auth/login', credentials),
  register: (userData) => api.post('/Auth/register', userData),
  forgotPassword: (email) => api.post('/Auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/Auth/reset-password', data),
};

// ==================== CHAT ====================
export const chatAPI = {
  sendMessage: (data) => api.post('/Chat/send', {
    Message: data.content,  
    Type: data.type         
  }),
  getConversations: () => api.get('/Chat/conversations'),
  getConversationById: (id) => api.get(`/Chat/conversations/${id}`),
  markMessageAsRead: (id) => api.put(`/Chat/messages/${id}/read`),
  deleteConversation: (id) => axios.post(`/api/Chat/conversations/${id}/delete`),
};

// ==================== USER ====================
export const userAPI = {
  getProfile: () => api.get('/User/profile').catch(error => {
  
    if (error.response?.status === 404) {
      console.debug('Profile endpoint not available (this is expected)');
      return { data: null };
    }
    throw error;
  }),
  updateProfile: (data) => api.put('/User/profile', data),
  changePassword: (data) => api.post('/User/change-password', data),
};

// ==================== ADMIN ====================
export const adminAPI = {
  getDashboard: () => api.get('/Admin/dashboard'),
  getUsers: () => api.get('/Admin/users'),
updateUser: (id, data) => api.put(`/Admin/user/${id}`, data),

  toggleUserStatus: (id) => api.put(`/Admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/Admin/users/${id}`),
  getRegulations: () => api.get('/Admin/regulations'),
  createRegulation: (data) => api.post('/Admin/regulations', data),
  updateRegulation: (id, data) => api.put(`/Admin/regulations/${id}`, data),
  deleteRegulation: (id) => api.delete(`/Admin/regulations/${id}`),
  getAnalytics: () => api.get('/Admin/analytics'),
};

// ==================== ADVISOR ====================
export const advisorAPI = {
  getStudents: () => api.get('/Advisor/students'),
  getStudentConversations: (id) => api.get(`/Advisor/students/${id}/conversations`),
  sendMessageToStudent: (id, data) => api.post(`/Advisor/students/${id}/send-message`, data),
  getAnalytics: () => api.get('/Advisor/analytics'),
};

export default api;
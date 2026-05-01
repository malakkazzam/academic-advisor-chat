// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://siraj.runasp.net/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const login = (email, password) => api.post('/Auth/login', { email, password });
export const register = (data) => api.post('/Auth/register', data);
export const forgotPassword = (email) => api.post('/Auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/Auth/reset-password', { token, newPassword });

// ==================== CHAT ====================
export const sendMessage = (data) => api.post('/Chat/send', data);
export const getConversations = () => api.get('/Chat/conversations');
export const getConversation = (id) => api.get(`/Chat/conversations/${id}`);
export const deleteConversation = (id) => api.delete(`/Chat/conversations/${id}`);
export const archiveConversation = (id) => api.put(`/Chat/conversations/${id}/archive`);
export const markMessageAsRead = (messageId) => api.put(`/Chat/messages/${messageId}/read`);
export const searchMessages = (query) => api.get(`/Chat/messages/search?q=${query}`);
export const sendToAdvisor = (message) => api.post('/Chat/send-to-advisor', message);
export const getAdvisorMessages = () => api.get('/Chat/advisor-messages');
export const getStudentAdvisorMessages = () => api.get('/Chat/advisor-messages');
export const sendMessageToAdvisor = (message) => api.post('/Chat/send-to-advisor', message);

// ==================== USER ====================
export const getProfile = () => api.get('/User/profile');
export const updateProfile = (data) => api.put('/User/profile', data);
export const changePassword = (oldPassword, newPassword) => api.post('/User/change-password', { oldPassword, newPassword });
export const getUserStats = () => api.get('/User/stats');

// ==================== ADMIN ====================
export const getDashboardStats = () => api.get('/Admin/dashboard');
export const getAdminAnalytics = () => api.get('/Admin/analytics');
export const getUsers = () => api.get('/Admin/users');
export const toggleUserStatus = (userId) => api.put(`/Admin/users/${userId}/toggle-status`);
export const deleteUser = (userId) => api.delete(`/Admin/users/${userId}`);
export const updateUserRole = (userId, role) => api.put(`/Admin/users/${userId}/role`, role);
export const getRegulations = () => api.get('/Admin/regulations');
export const getRegulationById = (id) => api.get(`/Admin/regulations/${id}`);
export const createRegulation = (data) => api.post('/Admin/regulations', {
  question: data.question,
  answer: data.answer,
  category: data.category,
  keywords: data.keywords || ''
});
export const updateRegulation = (id, data) => api.put(`/Admin/regulations/${id}`, data);
export const deleteRegulation = (id) => api.delete(`/Admin/regulations/${id}`);
export const bulkImportRegulations = (data) => api.post('/Admin/regulations/bulk', data);
export const exportRegulations = () => api.get('/Admin/regulations/export', { responseType: 'blob' });

// ==================== ADVISOR ====================
export const getStudents = () => api.get('/Advisor/students');
export const getStudentDetails = (studentId) => api.get(`/Advisor/students/${studentId}`);
export const getStudentConversations = (studentId) => api.get(`/Advisor/students/${studentId}/conversations`);
export const getAdvisorConversation = (conversationId) => api.get(`/Advisor/conversations/${conversationId}`);
export const sendMessageToStudent = (studentId, message) => api.post(`/Advisor/students/${studentId}/send-message`, message);
export const getAdvisorAnalytics = () => api.get('/Advisor/analytics');
export const getAdvisorStats = () => api.get('/Advisor/stats');
export const toggleStudentStatus = (studentId) => api.put(`/Advisor/students/${studentId}/toggle-status`);

// ==================== SYSTEM ====================
export const getSystemHealth = () => api.get('/System/health');
export const getSystemStats = () => api.get('/System/stats');
export const getAuditLogs = (params) => api.get('/System/audit-logs', { params });

// ==================== EXPORTS FOR COMPATIBILITY ====================
// Export adminAPI for admin components
export const adminAPI = {
  getDashboard: getDashboardStats,
  getAnalytics: getAdminAnalytics,
  getUsers: getUsers,
  updateUserRole: updateUserRole,
  toggleUserStatus: toggleUserStatus,
  deleteUser: deleteUser,
  getRegulations: getRegulations,
  createRegulation: createRegulation,
  updateRegulation: updateRegulation,
  deleteRegulation: deleteRegulation,
  bulkImportRegulations: bulkImportRegulations,
  exportRegulations: exportRegulations,
};

// Export advisorAPI for advisor components
export const advisorAPI = {
  getStudents: getStudents,
  getStudentDetails: getStudentDetails,
  getStudentConversations: getStudentConversations,
  getAdvisorConversation: getAdvisorConversation,
  sendMessageToStudent: sendMessageToStudent,
  getAnalytics: getAdvisorAnalytics,
  getStats: getAdvisorStats,
  toggleStudentStatus: toggleStudentStatus,
};

// ✅ Export for unified chat (Student-Advisor)
export const getUnifiedConversations = () => api.get('/Chat/conversations');
export const getUnifiedConversation = (id) => api.get(`/Chat/conversations/${id}`);
export const sendUnifiedMessage = (data) => api.post('/Chat/send', data);

export default api;
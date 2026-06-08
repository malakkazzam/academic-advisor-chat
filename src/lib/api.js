import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ✅ Request interceptor – إضافة التوكن من الـ store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Response interceptor – من غير أي logout تلقائي
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // معالجة 429 - Rate Limit (من غير reload)
    if (error.response?.status === 429) {
      console.warn('Rate limit (429) - request ignored')
      return Promise.reject(error)
    }
    
    // ✅ 401 - طنش خالص، متعملش logout ولا redirect
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - auto-logout disabled, ignoring')
      // متعملش حاجة خالص، بس ارجع الخطأ
      return Promise.reject(error)
    }
    
    return Promise.reject(error)
  }
)


// ==================== AUTH API ====================
export const authApi = {
  login: (email, password) => api.post('/Auth/login', { email, password }),
  register: (data) => api.post('/Auth/register', data),
  forgotPassword: (email) => api.post('/Auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/Auth/reset-password', { token, newPassword }),
  refreshToken: () => api.post('/Auth/refresh-token'),
}

// ==================== USER API ====================
export const userApi = {
  getProfile: () => api.get('/User/profile'),
  updateProfile: (data) => api.put('/User/profile', data),
  changePassword: (oldPassword, newPassword) => api.post('/User/change-password', { oldPassword, newPassword }),
  getUserStats: () => api.get('/User/stats'),
}

// ==================== CHAT API ====================
export const chatApi = {
  sendMessage: (data) => api.post('/Chat/send', data),
  getConversations: () => api.get('/Chat/conversations'),
  getConversation: (id) => api.get(`/Chat/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/Chat/conversations/${id}`),
  sendToAdvisor: (message) => api.post('/Chat/send-to-advisor', { message }),
  getAdvisorStudentConversation: (studentId) => api.get(`/Chat/advisor/student-conversation/${studentId}`),
  replyToStudent: (studentId, message) => api.post('/Chat/advisor/reply-to-student', { studentId, message }),
  getStudentRegulations: () => api.get('/Chat/regulations'),
  archiveConversation: (id) => api.put(`/Chat/conversations/${id}/archive`),
  markMessageAsRead: (messageId) => api.put(`/Chat/messages/${messageId}/read`),
  searchMessages: (query) => api.get('/Chat/messages/search', { params: { q: query } }),
}

// ==================== REGISTRATION API ====================
export const registrationApi = {
  submit: (formData) => api.post('/Registration/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyRegistrations: () => api.get('/Registration/my-registrations'),
}

// ==================== ADVISOR API ====================
export const advisorApi = {
  getStudents: () => api.get('/Advisor/students'),
  getStudentsByLevel: (level) => api.get(`/Advisor/students/by-level/${level}`),
  filterStudentsByGpa: (minGpa, maxGpa) => api.get('/Advisor/students/filter-by-gpa', { params: { minGpa, maxGpa } }),
  sendMessageToStudent: (studentId, message) => api.post(`/Advisor/students/${studentId}/send-message`, message),
  broadcastToLevel: (level, message) => api.post('/Advisor/broadcast-to-level', { level, message }),
  getSubmittedForms: (level) => api.get(`/Advisor/students/submitted-forms${level ? `?level=${level}` : ''}`),
  getAvailableAdvisors: () => api.get('/Advisor/available-advisors'),
  getAdvisorAnalytics: () => api.get('/Advisor/analytics'),
  getStudentById: (id) => api.get(`/Advisor/students/${id}`),
  toggleStudentStatus: (studentId) => api.put(`/Advisor/students/${studentId}/toggle-status`),
  getStudentContact: (studentId) => api.get(`/Advisor/student-contact/${studentId}`),
}

// ==================== ADMIN API ====================
export const adminApi = {
  getDashboardStats: () => api.get('/Admin/dashboard'),
  getAdminAnalytics: () => api.get('/Admin/analytics'),
  getUsers: () => api.get('/Admin/users'),
  toggleUserStatus: (userId) => api.put(`/Admin/users/${userId}/toggle-status`),
  deleteUser: (userId) => api.delete(`/Admin/users/${userId}`),
  changeUserRole: (userId, newRole) => api.put(`/Admin/users/${userId}/change-role`, { newRole }),
  getRegulations: () => api.get('/Admin/regulations'),
  createRegulation: (data) => api.post('/Admin/regulations', data),
  updateRegulation: (id, data) => api.put(`/Admin/regulations/${id}`, data),
  deleteRegulation: (id) => api.delete(`/Admin/regulations/${id}`),
  createRegulationWithFile: (formData) => api.post('/Admin/regulations-with-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUniversityEmails: () => api.get('/Admin/university-emails'),
  addUniversityEmail: (email) => api.post('/Admin/add-university-email', { email }),
  addMultipleUniversityEmails: (emails) => api.post('/Admin/add-university-emails', { emails }),
  deleteUniversityEmail: (id) => api.delete(`/Admin/university-emails/${id}`),
  deleteAllUniversityEmails: () => api.delete('/Admin/university-emails-all'),
  getUserById: (id) => api.get(`/Admin/users/${id}`),
  getRegulationById: (id) => api.get(`/Admin/regulations/${id}`),
}

// ==================== SYSTEM API ====================
export const systemApi = {
  getHealth: () => api.get('/System/health'),
  getSystemStats: () => api.get('/System/stats'),
  getAuditLogs: () => api.get('/System/audit-logs'),
}

// ==================== PUBLIC API ====================
export const publicApi = {
  validateUniversityEmail: (email) => api.post('/public/validate-university-email', { email }),
  getHealth: () => api.get('/health'),
}

export default api
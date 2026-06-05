// src/lib/api.js
import axios from 'axios'

const API_URL = '/api'  // يستخدم الـ proxy في vite.config.js

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor – إضافة التوكن
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – التعامل مع 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)



// ==================== AUTH ====================
export const authApi = {
  login: (email, password) => api.post('/Auth/login', { email, password }),
  register: (data) => api.post('/Auth/register', data),
}

// ==================== CHAT ====================
export const chatApi = {
  sendMessage: (data) => api.post('/Chat/send', data),
  getConversations: () => api.get('/Chat/conversations'),
  getConversation: (id) => api.get(`/Chat/conversations/${id}`),
  deleteConversation: (id) => api.delete(`/Chat/conversations/${id}`),
  sendToAdvisor: (message) => api.post('/Chat/send-to-advisor', { message }),
  getAdvisorStudentConversation: (studentId) => api.get(`/Chat/advisor/student-conversation/${studentId}`),
  replyToStudent: (studentId, message) => api.post('/Chat/advisor/reply-to-student', { studentId, message }),
  getStudentRegulations: () => api.get('/Chat/regulations'),
}

// ==================== REGISTRATION ====================
export const registrationApi = {
  submit: (formData) => api.post('/Registration/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyRegistrations: () => api.get('/Registration/my-registrations'),
}

// ==================== ADVISOR ====================
export const advisorApi = {
  getStudents: () => api.get('/Advisor/students'),
  getStudentsByLevel: (level) => api.get(`/Advisor/students/by-level/${level}`),
  filterStudentsByGpa: (minGpa, maxGpa) => api.get('/Advisor/students/filter-by-gpa', { params: { minGpa, maxGpa } }),
  sendMessageToStudent: (studentId, message) => api.post(`/Advisor/students/${studentId}/send-message`, { message }),
  broadcastToLevel: (level, message) => api.post('/Advisor/broadcast-to-level', { level, message }),
  getSubmittedForms: (level) => api.get(`/Advisor/students/submitted-forms${level ? `?level=${level}` : ''}`),
  getAvailableAdvisors: () => api.get('/Advisor/available-advisors'), // قد يعطي 403 إذا غير مدعوم
  getAdvisorAnalytics: () => api.get('/Advisor/analytics'),
  updateFormStatus: (formId, status) => api.put(`/Advisor/forms/${formId}/status`, { status }),

}

// ==================== ADMIN ====================
export const adminApi = {
  getDashboardStats: () => api.get('/Admin/dashboard'),
  getUsers: () => api.get('/Admin/users'),
  toggleUserStatus: (userId) => api.put(`/Admin/users/${userId}/toggle-status`),
  deleteUser: (userId) => api.delete(`/Admin/users/${userId}`),
  changeUserRole: (userId, newRole) => api.put(`/Admin/users/${userId}/change-role`, { newRole }),
  getRegulations: () => api.get('/Admin/regulations'),
  createRegulation: (data) => api.post('/Admin/regulations', data),
  updateRegulation: (id, data) => api.put(`/Admin/regulations/${id}`, data),
  deleteRegulation: (id) => api.delete(`/Admin/regulations/${id}`),
 updateRegulationWithFile: (id, formData) => api.put(`/Admin/regulations-with-file/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
}),

  createRegulationWithFile: (formData) => api.post('/Admin/regulations-with-file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUniversityEmails: () => api.get('/Admin/university-emails'),
  addUniversityEmail: (email) => api.post('/Admin/add-university-email', { email }),
  addMultipleUniversityEmails: (emails) => api.post('/Admin/add-university-emails', { emails }),
  deleteUniversityEmail: (id) => api.delete(`/Admin/university-emails/${id}`),
  deleteAllUniversityEmails: () => api.delete('/Admin/university-emails-all'),
  getAdminAnalytics: () => api.get('/Admin/analytics'),
}

// ==================== USER ====================
export const userApi = {
  getProfile: () => api.get('/User/profile'),
  updateProfile: (data) => api.put('/User/profile', data),
  changePassword: (oldPassword, newPassword) => api.post('/User/change-password', { oldPassword, newPassword }),
}

export default api
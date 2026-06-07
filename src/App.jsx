import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/Common/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import ForgotPassword from './components/Auth/ForgotPassword'
import ResetPassword from './components/Auth/ResetPassword'
import Profile from './components/User/Profile'

// Student
import ChatContainer from './components/Chat/ChatContainer'
import StudentRegulations from './components/Student/StudentRegulations'
import StudentRegistrationForm from './components/Student/StudentRegistrationForm'
import ChooseAdvisor from './components/Student/ChooseAdvisor'

// Advisor
import AdvisorStudents from './components/Advisor/AdvisorStudents'
import AdvisorStudentChat from './components/Advisor/AdvisorStudentChat'
import AdvisorBroadcast from './components/Advisor/AdvisorBroadcast'
import AdvisorSubmittedForms from './components/Advisor/AdvisorSubmittedForms'
import AdvisorAnalytics from './components/Advisor/AdvisorAnalytics'
import AdvisorStats from './components/Advisor/AdvisorStats'

// Admin
import AdminDashboard from './components/Admin/AdminDashboard'
import AdminUsers from './components/Admin/AdminUsers'
import AdminRegulations from './components/Admin/AdminRegulations'
import AdminUniversityEmails from './components/Admin/AdminUniversityEmails'
import AdminAnalytics from './components/Admin/AdminAnalytics'

// System
import SystemHealth from './components/System/SystemHealth'

// Public
import ValidateUniversityEmail from './components/Public/ValidateUniversityEmail'

function App() {
  const { token, user } = useAuthStore()
  const defaultRoute = user?.role === 'Admin'
    ? '/admin/dashboard'
    : user?.role === 'Advisor'
      ? '/advisor/students'
      : '/chat'

  return (
    <Routes>
      {/* Auth Routes - Public */}
      <Route path="/login" element={!token ? <Login /> : <Navigate to={defaultRoute} />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to={defaultRoute} />} />
      <Route path="/forgot-password" element={!token ? <ForgotPassword /> : <Navigate to={defaultRoute} />} />
      <Route path="/reset-password" element={!token ? <ResetPassword /> : <Navigate to={defaultRoute} />} />
      <Route path="/validate-email" element={<ValidateUniversityEmail />} />
      <Route path="/" element={<Navigate to={defaultRoute} />} />

      {/* Protected Routes - Students only */}
      <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
        <Route element={<Layout />}>
          <Route path="/chat" element={<ChatContainer />} />
          <Route path="/student/regulations" element={<StudentRegulations />} />
          <Route path="/student/submit-form" element={<StudentRegistrationForm />} />
          <Route path="/student/choose-advisor" element={<ChooseAdvisor />} />
        </Route>
      </Route>

      {/* Protected Routes - Advisor only (Admin can also access) */}
      <Route element={<ProtectedRoute advisorOnly />}>
        <Route element={<Layout />}>
          <Route path="/advisor/students" element={<AdvisorStudents />} />
          <Route path="/advisor/students/:id/chat" element={<AdvisorStudentChat />} />
          <Route path="/advisor/broadcast" element={<AdvisorBroadcast />} />
          <Route path="/advisor/submitted-forms" element={<AdvisorSubmittedForms />} />
          <Route path="/advisor/analytics" element={<AdvisorAnalytics />} />
          <Route path="/advisor/stats" element={<AdvisorStats />} />
        </Route>
      </Route>

      {/* Protected Routes - Admin only */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/regulations" element={<AdminRegulations />} />
          <Route path="/admin/university-emails" element={<AdminUniversityEmails />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/system/health" element={<SystemHealth />} />
        </Route>
      </Route>

      {/* Protected Routes - All authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
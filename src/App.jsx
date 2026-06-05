// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/Common/ProtectedRoute'
import Layout from './components/Layout/Layout'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
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

// Admin
import AdminDashboard from './components/Admin/AdminDashboard'
import AdminUsers from './components/Admin/AdminUsers'
import AdminRegulations from './components/Admin/AdminRegulations'
// ✅ تم إزالة استيراد AdminRegulationsWithFile
import AdminUniversityEmails from './components/Admin/AdminUniversityEmails'
import AdminAnalytics from './components/Admin/AdminAnalytics'

function App() {
  const { token, user } = useAuthStore()
  const defaultRoute = user?.role === 'Admin'
    ? '/admin/dashboard'
    : user?.role === 'Advisor'
      ? '/advisor/students'
      : '/chat'

  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to={defaultRoute} />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to={defaultRoute} />} />
      <Route path="/" element={<Navigate to={defaultRoute} />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Student */}
          <Route path="/chat" element={<ChatContainer />} />
          <Route path="/student/regulations" element={<StudentRegulations />} />
          <Route path="/student/submit-form" element={<StudentRegistrationForm />} />
          <Route path="/student/choose-advisor" element={<ChooseAdvisor />} />

          {/* Advisor */}
          <Route path="/advisor/students" element={<AdvisorStudents />} />
          <Route path="/advisor/students/:id/chat" element={<AdvisorStudentChat />} />
          <Route path="/advisor/broadcast" element={<AdvisorBroadcast />} />
          <Route path="/advisor/submitted-forms" element={<AdvisorSubmittedForms />} />
          <Route path="/advisor/analytics" element={<AdvisorAnalytics />} />

          {/* Admin – مسار واحد للوائح */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/regulations" element={<AdminRegulations />} />
          {/* ✅ تم إزالة مسار /admin/regulations-with-file */}
          <Route path="/admin/university-emails" element={<AdminUniversityEmails />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />

          {/* Profile */}
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
// src/App.jsx

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './components/Auth/AuthProvider';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AIChatAssistant from './components/Chat/AIChatAssistant';
import AdminDashboard from './components/Admin/AdminDashboard';
import StudentsList from './components/Advisor/StudentsList';
import StudentChatView from './components/Advisor/StudentChatView';
import Profile from './components/User/Profile';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import AdvisorAnalytics from './components/Advisor/AdvisorAnalytics';

const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const noSidebarPages = ['/chat'];
  const showMainSidebar =
    user && !noSidebarPages.includes(location.pathname);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const role = user?.role?.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Header />}

      <div className="flex">
        {showMainSidebar && <Sidebar />}

        <main className={`flex-1 ${showMainSidebar ? 'p-6' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* الصفحة الرئيسية */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {role === 'admin' ? (
                    <Navigate to="/admin" replace />
                  ) : role === 'advisor' ? (
                    <Navigate to="/advisor" replace />
                  ) : (
                    <Navigate to="/chat" replace />
                  )}
                </ProtectedRoute>
              }
            />

            {/* student */}
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <AIChatAssistant />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* admin */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* advisor */}
            <Route
              path="/advisor"
              element={
                <ProtectedRoute allowedRoles={['advisor']}>
                  <StudentsList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/advisor/chat/:studentId"
              element={
                <ProtectedRoute allowedRoles={['advisor']}>
                  <StudentChatView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/advisor/analytics"
              element={
                <ProtectedRoute allowedRoles={['advisor']}>
                  <AdvisorAnalytics />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
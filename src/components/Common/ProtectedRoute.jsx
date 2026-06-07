// src/components/Common/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const ProtectedRoute = ({ allowedRoles = [], adminOnly = false, advisorOnly = false, children }) => {
  const { token, user } = useAuthStore()

  // لو مفيش توكن → روح للوجين
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // جلب دور المستخدم
  const userRole = user?.role

  // ✅ دعم الخاصية adminOnly
  if (adminOnly && userRole !== 'Admin') {
    const fallback = userRole === 'Advisor' ? '/advisor/students' : '/chat'
    return <Navigate to={fallback} replace />
  }

  // ✅ دعم الخاصية advisorOnly (أدمن عادي يقدر يشوفها برضه)
  if (advisorOnly && userRole !== 'Advisor' && userRole !== 'Admin') {
    return <Navigate to="/chat" replace />
  }

  // ✅ دعم allowedRoles (الطريقة القديمة)
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    const role = user.role?.toLowerCase()
    let fallback = '/chat'
    if (role === 'admin') fallback = '/admin/dashboard'
    else if (role === 'advisor') fallback = '/advisor/students'
    return <Navigate to={fallback} replace />
  }

  // لو فيه children (استخدام الـ component كـ wrapper)
  if (children) {
    return children
  }

  // لو كل حاجة تمام → اعرض الصفحة
  return <Outlet />
}

export default ProtectedRoute
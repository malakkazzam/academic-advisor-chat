import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { token, user } = useAuthStore()

  // لو مفيش توكن → روح للوجين
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // لو فيه دور محدد مطلوب والدور الحالي مش متطابق
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    const role = user.role?.toLowerCase()
    let fallback = '/chat'
    if (role === 'admin') fallback = '/admin/dashboard'
    else if (role === 'advisor') fallback = '/advisor/students'
    return <Navigate to={fallback} replace />
  }

  // لو كل حاجة تمام → اعرض الصفحة
  return <Outlet />
}

export default ProtectedRoute
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // إذا كان لا يزال يتم التحميل، أظهر مؤشر التحميل
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم مسجل الدخول
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // إذا كانت هناك أدوار محددة والمستخدم ليس لديه الدور المطلوب
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
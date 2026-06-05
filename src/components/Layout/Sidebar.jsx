import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import {
  MessageSquare,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  UserCheck,
  Send,
  FileCheck,
  LayoutDashboard,
  Mail,
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const role = user?.role?.toLowerCase() || 'student'

  // تعريف الروابط حسب الدور
  const studentLinks = [
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/student/regulations', icon: BookOpen, label: 'Regulations' },
    { to: '/student/submit-form', icon: FileText, label: 'Submit Form' },
    { to: '/student/choose-advisor', icon: UserCheck, label: 'Choose Advisor' },
  ]

  const advisorLinks = [
    { to: '/advisor/students', icon: Users, label: 'My Students' },
    { to: '/advisor/broadcast', icon: Send, label: 'Broadcast' },
    { to: '/advisor/submitted-forms', icon: FileCheck, label: 'Submitted Forms' },
    { to: '/advisor/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/regulations', icon: BookOpen, label: 'Regulations' },
    { to: '/admin/university-emails', icon: Mail, label: 'University Emails' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  // اختيار الروابط المناسبة
  let links

  if (role === 'student') links = studentLinks
  else if (role === 'advisor') links = advisorLinks
  else if (role === 'admin') links = adminLinks
  else links = studentLinks

  return (
    <>
      {/* خلفية داكنة عند فتح السايدبار على الموبايل */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* السايدبار */}
      <aside
        className={`
          fixed left-0 top-0 lg:top-16 z-40
          h-screen lg:h-[calc(100vh-4rem)] w-64
          bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:shadow-lg lg:rounded-none
        `}
      >
        {/* اللوجو يظهر في الموبايل فقط */}
        <div className="flex lg:hidden items-center justify-center h-16 border-b border-gray-100">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
            UniGuide
          </span>
        </div>

        {/* قائمة الروابط - تم إزالة قسم البروفايل */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto h-full">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <link.icon size={20} className="shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          ))}
          {/* ✅ تم إزالة قسم الملف الشخصي (Profile) بالكامل */}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
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
  Activity,
   BookMarked,
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const role = user?.role?.toLowerCase() || 'student'

  // تعريف الروابط حسب الدور مع ألوان مختلفة لكل أيقونة
  const studentLinks = [
    { to: '/chat', icon: MessageSquare, label: 'Chat', color: 'text-purple-500' },
    { to: '/student/regulations', icon: BookOpen, label: 'Regulations', color: 'text-blue-500' },
    { to: '/student/submit-form', icon: FileText, label: 'Submit Form', color: 'text-green-500' },
    { to: '/student/choose-advisor', icon: UserCheck, label: 'Choose Advisor', color: 'text-orange-500' },
      { to: '/student/my-registrations', icon: FileCheck, label: 'My Registrations', color: 'text-indigo-500' }, 
          { to: '/student/subjects', icon: BookMarked, label: 'Subjects', color: 'text-emerald-500' }, 
  ]

  const advisorLinks = [
    { to: '/advisor/students', icon: Users, label: 'My Students', color: 'text-purple-500' },
    { to: '/advisor/broadcast', icon: Send, label: 'Broadcast', color: 'text-blue-500' },
    { to: '/advisor/submitted-forms', icon: FileCheck, label: 'Submitted Forms', color: 'text-green-500' },
    { to: '/advisor/analytics', icon: BarChart3, label: 'Analytics', color: 'text-orange-500' },
    ]

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-purple-500' },
    { to: '/admin/users', icon: Users, label: 'Users', color: 'text-blue-500' },
    { to: '/admin/regulations', icon: BookOpen, label: 'Regulations', color: 'text-green-500' },
    { to: '/admin/university-emails', icon: Mail, label: 'University Emails', color: 'text-indigo-500' },
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', color: 'text-orange-500' },
    // ✅ رابط جديد - System Health
    { to: '/system/health', icon: Activity, label: 'System Health', color: 'text-red-500' },
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
          bg-white/95 backdrop-blur-sm shadow-2xl shadow-purple-100/30
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:sticky lg:shadow-lg lg:rounded-none lg:border-r lg:border-purple-100
        `}
      >
        {/* اللوجو يظهر في الموبايل فقط */}
        <div className="flex lg:hidden items-center justify-center h-16 border-b border-purple-100 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
            UniGuide
          </span>
        </div>

        {/* قائمة الروابط */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto h-full">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 shadow-sm border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <link.icon size={20} className={`shrink-0 transition-all duration-200 ${link.color} group-hover:scale-110`} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer decoration */}
        <div className="p-4 border-t border-purple-100 mt-auto">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
            <span>UniGuide AI v1.0</span>
            <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
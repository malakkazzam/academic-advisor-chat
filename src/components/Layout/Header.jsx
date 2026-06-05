import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Menu } from 'lucide-react'

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-md hover:bg-gray-100">
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
            UniGuide
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100">
           
          </button>
          
          {/* ✅ اسم المستخدم - جعله قابلاً للنقر */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition"
          >
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
              {user?.fullName || user?.email?.split('@')[0] || 'User'}
            </span>
          </button>
          
          <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:text-red-700">
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
export default Header
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Menu, Bot } from 'lucide-react'
import { useState } from 'react'

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [hoverLogout, setHoverLogout] = useState(false)
  
  const handleLogout = () => { logout(); navigate('/login') }
  
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-purple-100/50 shadow-sm shadow-purple-100/20">
      <div className="px-4 lg:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar} 
            className="lg:hidden p-2 rounded-xl hover:bg-purple-100/50 transition-all duration-200 group"
          >
            <Menu className="h-5 w-5 text-gray-500 group-hover:text-purple-600 transition-colors" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md relative overflow-hidden group">
              <Bot className="h-4 w-4 text-white absolute transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              UniGuide
            </h1>
            
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Profile Button - الاسم الكامل */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 hover:bg-purple-100/50 rounded-xl px-3 py-1.5 transition-all duration-200 group border border-transparent hover:border-purple-100"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform">
              <User className="h-4 w-4 text-purple-600" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs text-gray-400">Welcome back</p>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">
                {user?.fullName || user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
          </button>
          
          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            onMouseEnter={() => setHoverLogout(true)}
            onMouseLeave={() => setHoverLogout(false)}
            className="flex items-center gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50/80 px-3 py-2 rounded-xl transition-all duration-200 group"
          >
            <LogOut className={`h-5 w-5 transition-transform duration-200 ${hoverLogout ? 'translate-x-0.5' : ''}`} />
            <span className="hidden sm:inline text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
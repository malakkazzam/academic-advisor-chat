import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Bot, Eye, EyeOff, Loader2, Mail, Lock, LogIn, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await authApi.login(data.email, data.password)
      const userData = response.data
      setAuth(
        {
          id: userData.id,
          fullName: userData.fullName,
          email: userData.email,
          role: userData.role,
        },
        userData.token
      )
      toast.success('Welcome back!')
      const role = userData.role?.toLowerCase()
      if (role === 'admin') navigate('/admin/dashboard')
      else if (role === 'advisor') navigate('/advisor/students')
      else navigate('/chat')
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Animated card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-purple-200/50 hover:scale-[1.02]">
          {/* Gradient top bar */}
          <div className="h-2 bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500"></div>
          
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center relative">
            <div className="absolute top-4 right-4">
              <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            </div>
            <div className="inline-flex p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mb-4 shadow-inner">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 duration-300">
                <Bot className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              UniGuide
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Welcome back! Let's get you started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
            {/* Email */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-purple-500' : 'text-gray-400'}`} />
                <input
                  {...register('email')}
                  type="email"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                  style={{
                    borderColor: errors.email ? '#ef4444' : focusedField === 'email' ? '#8b5cf6' : '#e9d5ff'
                  }}
                  placeholder="your.email@university.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-purple-500' : 'text-gray-400'}`} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-10 pr-12 py-3 bg-purple-50/30 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                  style={{
                    borderColor: errors.password ? '#ef4444' : focusedField === 'password' ? '#8b5cf6' : '#e9d5ff'
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* ✅ Forgot Password Link - جديد */}
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium transition-colors duration-300"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 text-center border-t border-purple-50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
            <span className="text-gray-600 text-sm">New to UniGuide?</span>{' '}
            <Link to="/register" className="text-purple-600 font-bold hover:text-purple-700 inline-flex items-center gap-1 group transition">
              Create an account
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 flex justify-center items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CheckCircle className="h-3 w-3 text-purple-400" />
            <span>Secure Login</span>
          </div>
          <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CheckCircle className="h-3 w-3 text-purple-400" />
            <span>Data Encrypted</span>
          </div>
          <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CheckCircle className="h-3 w-3 text-purple-400" />
            <span>24/7 Support</span>
          </div>
        </div>

        {/* Decorative text */}
        <p className="text-center text-xs text-purple-300 mt-4 flex items-center justify-center gap-2">
          <span className="inline-block w-1 h-1 bg-purple-400 rounded-full"></span>
          Powered by UniGuide AI Platform
          <span className="inline-block w-1 h-1 bg-purple-400 rounded-full"></span>
        </p>
      </div>

      
    </div>
  )
}

export default Login
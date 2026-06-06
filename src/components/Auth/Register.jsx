import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Bot, Eye, EyeOff, Loader2, Mail, Phone, User, BookOpen, Award, Hash, Send, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

const registerSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Valid personal email is required'),
  universityEmail: z.string().email('Valid university email is required'),
  department: z.string().min(1, 'Department is required'),
  academicLevel: z.string().min(1, 'Academic level is required'),
  gpa: z.string().optional(),
  phoneNumber: z.string().optional(),
  telegramUsername: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'Student',
      academicLevel: '1',
      gpa: '',
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const payload = { ...data }
      delete payload.confirmPassword
      payload.role = 'Student'
      payload.academicLevel = parseInt(payload.academicLevel)
      payload.gpa = payload.gpa ? parseFloat(payload.gpa) : null

      const response = await authApi.register(payload)
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
      toast.success('Account created successfully!')
      navigate('/chat')
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const departments = [
    'Computer Science',
    'Information Systems',
    'Software Engineering',
    'Artificial Intelligence',
    'Cybersecurity',
    'Data Science',
    'Other',
  ]

  const levels = [
    { value: '1', label: 'Level 1 (First Year)' },
    { value: '2', label: 'Level 2 (Second Year)' },
    { value: '3', label: 'Level 3 (Third Year)' },
    { value: '4', label: 'Level 4 (Fourth Year)' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      
      <div className="w-full max-w-xl relative z-10">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-purple-200/50 hover:scale-[1.01]">
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
              Create Account
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Join UniGuide AI as a student</p>
          </div>

          {/* Form - باقي الكود زي ما هو */}
          <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="group md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${focusedField === 'fullName' ? 'text-purple-500' : 'text-gray-400'}`} />
                  <input
                    {...register('fullName')}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    type="text"
                    className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                    style={{
                      borderColor: errors.fullName ? '#ef4444' : focusedField === 'fullName' ? '#8b5cf6' : '#e9d5ff'
                    }}
                    placeholder="Ahmed Ali"
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
              </div>

              {/* باقي الحقول كما هي بدون تغيير */}
              {/* Personal Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Personal Email *
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-purple-500' : 'text-gray-400'}`} />
                  <input
                    {...register('email')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    type="email"
                    className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                    style={{
                      borderColor: errors.email ? '#ef4444' : focusedField === 'email' ? '#8b5cf6' : '#e9d5ff'
                    }}
                    placeholder="you@gmail.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* University Email */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  University Email *
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${focusedField === 'universityEmail' ? 'text-purple-500' : 'text-gray-400'}`} />
                  <input
                    {...register('universityEmail')}
                    onFocus={() => setFocusedField('universityEmail')}
                    onBlur={() => setFocusedField(null)}
                    type="email"
                    className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                    style={{
                      borderColor: errors.universityEmail ? '#ef4444' : focusedField === 'universityEmail' ? '#8b5cf6' : '#e9d5ff'
                    }}
                    placeholder="student@university.edu"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Must be a valid university email</p>
                {errors.universityEmail && <p className="text-red-500 text-xs mt-1">{errors.universityEmail.message}</p>}
              </div>

              {/* Department */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Department *
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    {...register('department')}
                    className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white appearance-none"
                    style={{
                      borderColor: errors.department ? '#ef4444' : '#e9d5ff'
                    }}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
              </div>

              {/* Academic Level */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Academic Level *
                </label>
                <select
                  {...register('academicLevel')}
                  className="w-full px-4 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                  style={{
                    borderColor: errors.academicLevel ? '#ef4444' : '#e9d5ff'
                  }}
                >
                  {levels.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
                </select>
                {errors.academicLevel && <p className="text-red-500 text-xs mt-1">{errors.academicLevel.message}</p>}
              </div>

              {/* GPA */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GPA (0.0 - 4.0)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('gpa')}
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                    placeholder="0.0"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                    placeholder="+20123456789"
                  />
                </div>
              </div>

              {/* Telegram Username */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telegram Username
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('telegramUsername')}
                    type="text"
                    className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                    placeholder="@username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 pr-12 py-3 bg-purple-50/30 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
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
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 bg-purple-50/30 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white"
                    style={{
                      borderColor: errors.confirmPassword ? '#ef4444' : '#e9d5ff'
                    }}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:via-purple-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Sign Up
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>

            {/* Demo hint */}
            <div className="text-center text-xs text-gray-400 pt-2">
              <p>Fill all required fields (*) to create your account</p>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 text-center border-t border-purple-50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
            <span className="text-gray-600 text-sm">Already have an account?</span>{' '}
            <Link to="/login" className="text-purple-600 font-bold hover:text-purple-700 inline-flex items-center gap-1 group transition">
              Sign in
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 flex justify-center items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CheckCircle className="h-3 w-3 text-purple-400" />
            <span>Secure Registration</span>
          </div>
          <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CheckCircle className="h-3 w-3 text-purple-400" />
            <span>Data Encrypted</span>
          </div>
          <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <CheckCircle className="h-3 w-3 text-purple-400" />
            <span>Student Verification</span>
          </div>
        </div>

        {/* Decorative text */}
        <p className="text-center text-xs text-purple-300 mt-4 flex items-center justify-center gap-2">
          <span className="inline-block w-1 h-1 bg-purple-400 rounded-full"></span>
          Powered by UniGuide AI Platform
          <span className="inline-block w-1 h-1 bg-purple-400 rounded-full"></span>
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}

export default Register
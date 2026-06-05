import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { GraduationCap, Eye, EyeOff, Loader2, Mail, Phone, User, BookOpen, Award, Hash, Send } from 'lucide-react'
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
      // ✅ إنشاء نسخة من البيانات بدون confirmPassword (لا نستخدم تدمير يسبب تحذيراً)
      const payload = { ...data }
      delete payload.confirmPassword   // حذف الحقل مباشرة – لا يحذر لأننا نستخدمه
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* رأس البطاقة */}
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-md">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join UniGuide as a student</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-8 space-y-5">
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('fullName')}
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Ahmed Ali"
                />
              </div>
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            {/* Personal Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Personal Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="you@gmail.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* University Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('universityEmail')}
                  type="email"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="student@university.edu"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Must be a valid university email approved by the system</p>
              {errors.universityEmail && <p className="text-red-500 text-xs mt-1">{errors.universityEmail.message}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  {...register('department')}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white transition"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level *</label>
              <select
                {...register('academicLevel')}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition"
              >
                {levels.map(level => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
              {errors.academicLevel && <p className="text-red-500 text-xs mt-1">{errors.academicLevel.message}</p>}
            </div>

            {/* GPA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GPA (0.0 - 4.0)</label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('gpa')}
                  type="number"
                  step="0.1"
                  min="0"
                  max="4"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="0.0"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (WhatsApp)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="+20123456789"
                />
              </div>
            </div>

            {/* Telegram Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telegram Username</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...register('telegramUsername')}
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="@username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {loading ? 'Creating account...' : 'Sign Up →'}
          </button>
        </form>

        <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-500 border-t">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 font-semibold hover:underline">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Bot, Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import { authApi } from '../../lib/api'

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema)
  })

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token')
      navigate('/forgot-password')
    }
  }, [token, navigate])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authApi.resetPassword(token, data.password)
      setResetSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-purple-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500"></div>
          
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="inline-flex p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Enter your new password</p>
          </div>

          {!resetSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} className="w-full pl-10 pr-12 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="••••••••" />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="px-8 pb-8 text-center">
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-2">Password Reset Successfully!</h3>
                <p className="text-green-600 text-sm">Redirecting you to login...</p>
              </div>
            </div>
          )}

          <div className="px-8 py-5 text-center border-t border-purple-50">
            <Link to="/login" className="text-purple-600 font-bold hover:text-purple-700 inline-flex items-center gap-1">
              Back to Login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
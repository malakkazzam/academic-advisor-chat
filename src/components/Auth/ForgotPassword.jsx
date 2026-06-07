import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Bot, Mail, Loader2, ArrowRight, CheckCircle } from 'lucide-react'
import { authApi } from '../../lib/api'

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema)
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
      toast.success('Reset link sent to your email!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

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
              Forgot Password?
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Enter your email and we'll send you a reset link</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input {...register('email')} type="email" className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="your@email.com" />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="px-8 pb-8 text-center">
              <div className="bg-green-50 rounded-xl p-6 mb-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-2">Check Your Email</h3>
                <p className="text-green-600 text-sm">We've sent a password reset link to your email address.</p>
              </div>
              <Link to="/login" className="text-purple-600 font-bold hover:text-purple-700 inline-flex items-center gap-1">
                Back to Login <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="px-8 py-5 text-center border-t border-purple-50">
            <span className="text-gray-600 text-sm">Remember your password?</span>{' '}
            <Link to="/login" className="text-purple-600 font-bold hover:text-purple-700">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
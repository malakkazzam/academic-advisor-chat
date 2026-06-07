import { useState } from 'react'
import { publicApi } from '../../lib/api'
import { Loader2, Mail, CheckCircle, XCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'

const ValidateUniversityEmail = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleValidate = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await publicApi.validateUniversityEmail(email)
      setResult({
        valid: true,
        email: res.data?.email || email,
        message: res.data?.message || 'Email is valid'
      })
      toast.success('Email validation successful')
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Invalid university email'
      setResult({
        valid: false,
        email: email,
        message: errorMsg
      })
      toast.error(errorMsg)
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
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
              Validate University Email
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Check if your email is eligible for registration</p>
          </div>

          <div className="px-8 pb-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pl-10 pr-3 py-3 bg-purple-50/30 border-2 border-purple-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Must end with @university.edu domain</p>
            </div>

            <button
              onClick={handleValidate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
              {loading ? 'Validating...' : 'Validate Email'}
            </button>

            {result && (
              <div className={`mt-4 p-4 rounded-xl ${result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2">
                  {result.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className={`font-medium ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                      {result.valid ? 'Valid Email' : 'Invalid Email'}
                    </p>
                    <p className={`text-sm mt-1 ${result.valid ? 'text-green-600' : 'text-red-600'}`}>
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValidateUniversityEmail
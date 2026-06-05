// src/components/Advisor/AdvisorBroadcast.jsx
import { useState } from 'react'
import { advisorApi } from '../../lib/api'
import { toast } from 'sonner'
import { Loader2, Send, Users, AlertCircle, CheckCircle } from 'lucide-react'

const AdvisorBroadcast = () => {
  const [level, setLevel] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const levels = [
    { value: '1', label: 'Level 1', color: 'bg-green-100 text-green-800' },
    { value: '2', label: 'Level 2', color: 'bg-blue-100 text-blue-800' },
    { value: '3', label: 'Level 3', color: 'bg-yellow-100 text-yellow-800' },
    { value: '4', label: 'Level 4', color: 'bg-purple-100 text-purple-800' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!level) {
      toast.error('Please select an academic level')
      return
    }
    if (!message.trim()) {
      toast.error('Please enter a message to broadcast')
      return
    }
    if (message.trim().length < 10) {
      toast.warning('Message is too short. Please provide more details.')
      return
    }

    setLoading(true)
    setSuccess(false)
    
    try {
      await advisorApi.broadcastToLevel(level, message)
      
      toast.success(`Message broadcasted successfully to Level ${level}!`, {
        duration: 4000,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      })
      
      setMessage('')
      setLevel('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (error) {
      console.error('Broadcast error:', error)
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to send broadcast. Please try again.'
      toast.error(errorMsg, { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const remainingChars = 500 - message.length

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Send className="h-5 w-5" />
            <h2 className="font-semibold text-lg">New Broadcast</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Academic Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {levels.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setLevel(lvl.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                    level === lvl.value
                      ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{lvl.label}</span>
                </button>
              ))}
            </div>
            {!level && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Please select a level to broadcast to
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              rows="6"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-purple-500 focus:border-purple-500 transition resize-none"
              placeholder="Type your announcement here..."
              disabled={loading}
            />
            <div className="flex justify-end mt-2">
              <span className={`text-xs ${remainingChars < 50 ? 'text-red-500' : 'text-gray-400'}`}>
                {remainingChars} characters remaining
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || !level || !message.trim()}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition ${
                loading || !level || !message.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Broadcast to Level {level}
                </>
              )}
            </button>
            
            {message.trim() && level && !loading && (
              <button
                type="button"
                onClick={() => setMessage('')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {success && (
          <div className="mx-6 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle className="h-4 w-4" />
            Message successfully sent to Level {level} students!
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvisorBroadcast
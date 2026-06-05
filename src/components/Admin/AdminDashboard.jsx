import useSWR from 'swr'
import { adminApi } from '../../lib/api'
import { Loader2, Users, MessageSquare, BookOpen, FileText, UserCheck } from 'lucide-react'
import { safeArray } from '../../lib/utils'

const AdminDashboard = () => {
  const { data, isLoading } = useSWR('admin-dashboard', adminApi.getDashboardStats)
  const stats = data?.data || data || {}
  const totalUsers = stats.totalUsers ?? 0
  const totalStudents = stats.totalStudents ?? 0
  const totalAdvisors = stats.totalAdvisors ?? 0
  const totalMessages = stats.totalMessages ?? 0
  const totalRegulations = stats.totalRegulations ?? 0
  const pendingForms = stats.pendingRegistrations ?? 0
  const recentMessages = safeArray(stats.recentMessages)

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-purple-600" /></div>

  const cards = [
    { title: 'Total Users', value: totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { title: 'Students', value: totalStudents, icon: Users, color: 'bg-green-50 text-green-600' },
    { title: 'Advisors', value: totalAdvisors, icon: UserCheck, color: 'bg-purple-50 text-purple-600' },
    { title: 'Messages', value: totalMessages, icon: MessageSquare, color: 'bg-yellow-50 text-yellow-600' },
    { title: 'Regulations', value: totalRegulations, icon: BookOpen, color: 'bg-red-50 text-red-600' },
    { title: 'Pending Forms', value: pendingForms, icon: FileText, color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-6">Welcome back! Here's what's happening in your system today.</p>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(card => (
          <div key={card.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl ${card.color} bg-opacity-10`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <span className="text-2xl font-bold text-gray-800">{card.value}</span>
            </div>
            <p className="text-gray-500 text-sm mt-3">{card.title}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white rounded-2xl shadow-sm border p-5">
        <h2 className="font-semibold text-gray-700 mb-3">Recent Messages</h2>
        {recentMessages.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No recent messages</p>
        ) : (
          <div className="space-y-3">
            {recentMessages.slice(0,5).map(m => (
              <div key={m.id} className="border-b pb-2 last:border-0">
                <p className="text-sm"><strong className="text-purple-700">{m.userName}</strong>: {m.content}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(m.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default AdminDashboard
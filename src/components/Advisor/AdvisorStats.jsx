import useSWR from 'swr'
import { advisorApi } from '../../lib/api'
import { Loader2, Users, MessageSquare, FileText, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const AdvisorStats = () => {
  const { data, isLoading, error } = useSWR('advisor-stats', advisorApi.getAdvisorStats, {
    refreshInterval: 30000
  })
  
  const stats = data?.data || data || {}

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600">Failed to load statistics</p>
      </div>
    )
  }

  const cards = [
    { 
      title: 'My Students', 
      value: stats.totalStudents || 0, 
      icon: Users, 
      color: 'bg-blue-50 text-blue-600',
      description: 'Total assigned students'
    },
    { 
      title: 'Messages Sent', 
      value: stats.totalMessages || 0, 
      icon: MessageSquare, 
      color: 'bg-purple-50 text-purple-600',
      description: 'All time messages'
    },
    { 
      title: 'Pending Forms', 
      value: stats.pendingForms || 0, 
      icon: FileText, 
      color: 'bg-yellow-50 text-yellow-600',
      description: 'Awaiting review'
    },
    { 
      title: 'Response Rate', 
      value: `${stats.responseRate || 0}%`, 
      icon: TrendingUp, 
      color: 'bg-green-50 text-green-600',
      description: 'Average response rate'
    },
    { 
      title: 'Active Students', 
      value: stats.activeStudents || 0, 
      icon: CheckCircle, 
      color: 'bg-emerald-50 text-emerald-600',
      description: 'Active this week'
    },
    { 
      title: 'Avg Response Time', 
      value: stats.avgResponseTime || '—', 
      icon: Clock, 
      color: 'bg-orange-50 text-orange-600',
      description: 'Minutes to reply'
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Advisor Statistics</h1>
      <p className="text-gray-500 mb-6">Track your performance and student engagement</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl ${card.color} bg-opacity-10`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <span className="text-2xl font-bold text-gray-800">{card.value}</span>
            </div>
            <p className="font-medium text-gray-700 mt-2">{card.title}</p>
            <p className="text-xs text-gray-400 mt-1">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdvisorStats
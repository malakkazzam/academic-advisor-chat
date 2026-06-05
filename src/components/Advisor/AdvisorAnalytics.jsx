// src/components/Advisor/AdvisorAnalytics.jsx
import useSWR from 'swr'
import { advisorApi } from '../../lib/api'
import { Loader2, Users, MessageSquare, FileCheck, TrendingUp, UserCheck } from 'lucide-react'
import { safeArray } from '../../lib/utils'

const AdvisorAnalytics = () => {
  const { data, isLoading, error } = useSWR('advisor-analytics', advisorApi.getAdvisorAnalytics)

  // استخراج البيانات بأمان
  const stats = data?.data || data || {}
  const studentsByLevel = safeArray(stats.studentsByLevel || stats.students_per_level || [])
  const totalStudents = stats.totalStudents || stats.total_students || 0
  const totalMessages = stats.totalMessages || stats.total_messages || 0
  const pendingForms = stats.pendingForms || stats.pending_forms || 0

  // المستويات المتاحة (1-4)
  const levels = [1, 2, 3, 4]

  // إيجاد العدد لكل مستوى (إن لم يكن موجوداً نضع 0)
  const levelCounts = levels.map(level => {
    const found = studentsByLevel.find(item => Number(item.level || item.Level) === level)
    return { level, count: found?.count || found?.Count || 0 }
  })

  const maxCount = Math.max(...levelCounts.map(l => l.count), 1)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Failed to load analytics. Please try again later.
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-3">Advisor Analytics</h1>


      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center gap-4">
          <div className="bg-purple-100 rounded-full p-3">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center gap-4">
          <div className="bg-blue-100 rounded-full p-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Messages Sent</p>
            <p className="text-2xl font-bold text-gray-800">{totalMessages}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center gap-4">
          <div className="bg-yellow-100 rounded-full p-3">
            <FileCheck className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Forms</p>
            <p className="text-2xl font-bold text-gray-800">{pendingForms}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex items-center gap-4">
          <div className="bg-green-100 rounded-full p-3">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Engagement Rate</p>
            <p className="text-2xl font-bold text-gray-800">
              {totalStudents ? Math.round((totalMessages / (totalStudents * 5)) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* توزيع الطلاب حسب المستوى */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-purple-600" />
          Students by Level
        </h2>
        <div className="space-y-4">
          {levelCounts.map(({ level, count }) => (
            <div key={level}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Level {level}</span>
                <span className="text-gray-500">{count} student{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t text-xs text-gray-400 text-center">
          Total students across all levels: {levelCounts.reduce((sum, l) => sum + l.count, 0)}
        </div>
      </div>

      {/* نصيحة أو ملخص سريع (اختياري) */}
      {totalStudents === 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-700 text-sm text-center">
          No student data available yet. Start adding students to see analytics.
        </div>
      )}
    </div>
  )
}

export default AdvisorAnalytics
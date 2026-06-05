// src/components/Admin/AdminAnalytics.jsx
import useSWR from 'swr'
import { adminApi } from '../../lib/api'
import { Loader2, BarChart3, Users, GraduationCap, MessageSquare } from 'lucide-react'
import { safeArray } from '../../lib/utils'

const AdminAnalytics = () => {
  const { data, isLoading, error } = useSWR('admin-analytics', adminApi.getAdminAnalytics)

  // استخراج البيانات بأمان (قد تكون داخل data.data أو مباشرة)
  const raw = data?.data || data || {}
  const messagesPerDay = safeArray(raw.messagesPerDay || raw.messages_per_day)
  const usersPerRole = safeArray(raw.usersPerRole || raw.users_per_role)
  const studentsByLevel = safeArray(raw.studentsByLevel || raw.students_by_level)
  const topQuestions = safeArray(raw.topQuestions || raw.top_questions)

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

  // إذا لم تكن هناك بيانات على الإطلاق
  const hasData = messagesPerDay.length > 0 || usersPerRole.length > 0 || studentsByLevel.length > 0 || topQuestions.length > 0
  if (!hasData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-medium text-gray-600">No analytics data available</h2>
        <p className="text-gray-400 mt-1">Start using the system to see statistics.</p>
      </div>
    )
  }

  // إيجاد القيمة القصوى للرسائل في اليوم (لتحديد نسبة الشريط)
  const maxMessages = messagesPerDay.length ? Math.max(...messagesPerDay.map(item => item.count)) : 1

  // إجمالي المستخدمين لحساب النسب المئوية للأدوار
  const totalUsers = usersPerRole.reduce((sum, role) => sum + (role.count || 0), 0)

  // إجمالي الطلاب لحساب النسب المئوية للمستويات
  const totalStudents = studentsByLevel.reduce((sum, level) => sum + (level.count || 0), 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">System Analytics</h1>
      <p className="text-gray-500 mb-6">Overview of platform usage and trends</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الرسائل في اليوم (آخر 30 يوماً) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-gray-800">Messages per Day (last 30 days)</h2>
          </div>
          {messagesPerDay.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No message data yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {messagesPerDay.slice(0, 20).map((item, idx) => {
                const date = item.date ? new Date(item.date).toLocaleDateString() : `Day ${idx + 1}`
                const count = item.count || 0
                const width = (count / maxMessages) * 100
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{date}</span>
                      <span className="text-gray-500">{count} msgs</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* المستخدمين حسب الدور */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-gray-800">Users by Role</h2>
          </div>
          {usersPerRole.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No user data yet</p>
          ) : (
            <div className="space-y-4">
              {usersPerRole.map((role, idx) => {
                const roleName = role.role || role.Role || 'Unknown'
                const count = role.count || 0
                const percentage = totalUsers ? (count / totalUsers) * 100 : 0
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{roleName}</span>
                      <span className="text-gray-500">{count} users ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {totalUsers === 0 && <p className="text-gray-400 text-center py-4">No users found</p>}
            </div>
          )}
        </div>

        {/* الطلاب حسب المستوى */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-gray-800">Students by Level</h2>
          </div>
          {studentsByLevel.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No student level data yet</p>
          ) : (
            <div className="space-y-4">
              {studentsByLevel.map((level, idx) => {
                const levelNum = level.level || level.Level || idx + 1
                const count = level.count || 0
                const percentage = totalStudents ? (count / totalStudents) * 100 : 0
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">Level {levelNum}</span>
                      <span className="text-gray-500">{count} students ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {totalStudents === 0 && <p className="text-gray-400 text-center py-4">No students assigned</p>}
            </div>
          )}
        </div>

        {/* أكثر الأسئلة تكراراً */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-gray-800">Top Questions</h2>
          </div>
          {topQuestions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No question data yet</p>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto">
              {topQuestions.map((q, idx) => (
                <li key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-700 flex-1">{q.question || q.Question}</span>
                    <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">
                      {q.count || 0} times
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
import { useState, useEffect } from 'react'
import { systemApi } from '../../lib/api'
import { Loader2, CheckCircle, XCircle, Clock, Server, Activity, Shield, Database } from 'lucide-react'

const SystemHealth = () => {
  const [health, setHealth] = useState(null)
  const [systemStats, setSystemStats] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('health')

  const fetchHealth = async () => {
    try {
      const res = await systemApi.getHealth()
      setHealth(res.data)
    } catch (err) {
      console.error('Health check failed:', err)
      setHealth({ status: 'ERROR', message: err.message })
    }
  }

  const fetchSystemStats = async () => {
    try {
      const res = await systemApi.getSystemStats()
      setSystemStats(res.data)
    } catch (err) {
      console.error('Failed to fetch system stats:', err)
    }
  }

  const fetchAuditLogs = async () => {
    try {
      const res = await systemApi.getAuditLogs()
      setAuditLogs(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
    }
  }

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      await Promise.all([
        fetchHealth(),
        fetchSystemStats(),
        fetchAuditLogs()
      ])
      setLoading(false)
    }
    fetchAll()

    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
      </div>
    )
  }

  const isHealthy = health?.status === 'OK' || health?.status === 'Healthy'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">System Health</h1>
      <p className="text-gray-500 mb-6">Monitor system status, performance, and audit logs</p>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('health')}
          className={`px-5 py-2.5 font-medium transition-all rounded-t-lg flex items-center gap-2 ${
            activeTab === 'health'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Activity className="h-4 w-4" />
          Health Status
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-5 py-2.5 font-medium transition-all rounded-t-lg flex items-center gap-2 ${
            activeTab === 'stats'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Server className="h-4 w-4" />
          System Stats
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-5 py-2.5 font-medium transition-all rounded-t-lg flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/30'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="h-4 w-4" />
          Audit Logs
        </button>
      </div>

      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className={`rounded-xl p-6 border ${isHealthy ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3">
              {isHealthy ? (
                <CheckCircle className="h-12 w-12 text-green-500" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500" />
              )}
              <div>
                <h2 className={`text-xl font-bold ${isHealthy ? 'text-green-700' : 'text-red-700'}`}>
                  {isHealthy ? 'All Systems Operational' : 'System Issues Detected'}
                </h2>
                <p className={`mt-1 ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                  {health?.message || (isHealthy ? 'The system is running normally' : 'Please check system logs')}
                </p>
              </div>
            </div>
            {health?.timestamp && (
              <p className="text-xs text-gray-500 mt-4 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last check: {new Date(health.timestamp).toLocaleString()}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">Database</h3>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Connected</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">API Server</h3>
              </div>
              <div className="flex items-center gap-2">
                {isHealthy ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
                  {isHealthy ? 'Running' : 'Issues Detected'}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">Response Time</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {health?.responseTime || '—'}ms
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && systemStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Server className="h-5 w-5 text-purple-600" />
            System Performance Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">{systemStats.totalUsers || 0}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{systemStats.totalMessages || 0}</p>
              <p className="text-sm text-gray-600">Total Messages</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{systemStats.activeUsers || 0}</p>
              <p className="text-sm text-gray-600">Active Today</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{systemStats.uptime || '—'}</p>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              System Audit Logs
            </h2>
          </div>
          {auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No audit logs available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {auditLogs.slice(0, 50).map((log, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">{log.userEmail || log.user || 'System'}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                          log.action === 'UPDATE' ? 'bg-yellow-100 text-yellow-700' :
                          log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 max-w-md truncate">{log.details || log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SystemHealth
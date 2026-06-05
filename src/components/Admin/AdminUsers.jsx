import useSWR from 'swr'
import { adminApi } from '../../lib/api'
import { toast } from 'sonner'
import { Loader2, ToggleRight, ToggleLeft, Trash2, Users } from 'lucide-react'
import { useState } from 'react'

const AdminUsers = () => {
  const { data, isLoading, mutate } = useSWR('admin-users', adminApi.getUsers)

  // ✅ استخراج المصفوفة بغض النظر عن شكل الرد
  const users = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
  
  // ✅ كشف حجم الشاشة
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  useState(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleToggle = async (id, currentStatus) => {
    try {
      await adminApi.toggleUserStatus(id)
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`)
      mutate()
    } catch {
      toast.error('Failed to toggle user status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return
    try {
      await adminApi.deleteUser(id)
      toast.success('User deleted')
      mutate()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const handleRoleChange = async (id, newRole) => {
    try {
      await adminApi.changeUserRole(id, newRole)
      toast.success(`Role changed to ${newRole}`)
      mutate()
    } catch {
      toast.error('Failed to change role')
    }
  }

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>
  
  if (users.length === 0) return (
    <div className="text-center py-12 text-gray-500">
      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
      <p>No users found</p>
    </div>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      
      {/* ✅ عرض بطاقات (Cards) للموبايل - بدون Pagination */}
      {isMobile ? (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{user.fullName}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(user.id, user.isActive)} className="text-purple-600">
                    {user.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Role:</span>{' '}
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)} 
                    className="border rounded px-2 py-0.5 text-sm ml-1"
                  >
                    <option>Student</option>
                    <option>Advisor</option>
                    <option>Admin</option>
                  </select>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>{' '}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // ✅ عرض الجدول (Table) للديسكتوب
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="border rounded px-2 py-1 text-sm">
                      <option>Student</option>
                      <option>Advisor</option>
                      <option>Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button onClick={() => handleToggle(user.id, user.isActive)} className="text-purple-600">
                      {user.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
export default AdminUsers
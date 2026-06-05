import { useState } from 'react'
import useSWR from 'swr'
import { userApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, User,  Award, Phone, Hash, Lock, ChevronRight } from 'lucide-react'

const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const { data: profile, isLoading, mutate } = useSWR('profile', userApi.getProfile, {
    fallbackData: user,
  })

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ 
    fullName: '', 
    department: '', 
    phoneNumber: '',
    telegramUsername: '',
    gpa: ''
  })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const role = profile?.role?.toLowerCase() || user?.role?.toLowerCase() || 'student'
  const isStudent = role === 'student'

  const academicLevels = [
    { value: '1', label: 'Level 1 (First Year)' },
    { value: '2', label: 'Level 2 (Second Year)' },
    { value: '3', label: 'Level 3 (Third Year)' },
    { value: '4', label: 'Level 4 (Fourth Year)' },
  ]

  const startEditing = () => {
    setForm({
      fullName: profile?.fullName || user?.fullName || '',
      department: profile?.department || '',
      phoneNumber: profile?.phoneNumber || '',
      telegramUsername: profile?.telegramUsername || '',
      gpa: profile?.gpa || '',
    })
    setEditing(true)
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const updateData = {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
      }
      
      if (isStudent) {
        updateData.department = form.department
        updateData.telegramUsername = form.telegramUsername
      } else {
        updateData.telegramUsername = form.telegramUsername
      }
      
      console.log('📤 Sending update data:', updateData)
      
      // ✅ إرسال التحديث إلى الـ API
      await userApi.updateProfile(updateData)
      
      // ✅ تحديث الـ store المحلي فوراً بالبيانات الجديدة
      updateUser(updateData)
      
      // ✅ تحديث SWR cache يدوياً لتجنب العودة للبيانات القديمة
      await mutate(
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            ...updateData
          }
        },
        { optimisticData: { ...profile, ...updateData }, revalidate: false }
      )
      
      // ✅ إعادة جلب البيانات من الـ API بعد 2 ثانية للتأكد من التحديث
      setTimeout(() => {
        mutate()
      }, 2000)
      
      toast.success('Profile updated successfully')
      setEditing(false)
    } catch (err) {
      console.error('Update error:', err)
      const msg = err.response?.data?.message || err.response?.data?.error || 'Update failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await userApi.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
      toast.success('Password changed successfully')
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Password change failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ✅ استخدام البيانات من profile أو user بشكل ثابت
  const displayName = profile?.fullName || user?.fullName || 'User'
  const displayRole = profile?.role || user?.role || 'Student'
  const displayDepartment = profile?.department || user?.department || 'Not set'
  const displayPhoneNumber = profile?.phoneNumber || user?.phoneNumber || 'Not set'
  const displayTelegram = profile?.telegramUsername || user?.telegramUsername || 'Not set'
  const displayGpa = profile?.gpa || user?.gpa || null

  if (isLoading && !profile && !user) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{displayName}</h2>
              <p className="text-purple-200 text-sm">{displayRole}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
            {!editing ? (
              <button
                onClick={startEditing}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
              >
                Edit <ChevronRight size={16} />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="border border-gray-300 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-5">Update your personal details</p>

          {!editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-800">{displayName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{profile?.email || user?.email}</p>
                  <p className="text-xs text-amber-600 mt-0.5">Email cannot be changed</p>
                </div>
              </div>

              {isStudent && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium text-gray-800">{displayDepartment}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Academic Level</p>
                      <p className="font-medium text-gray-800">
                        {academicLevels.find(l => l.value === String(profile?.academicLevel))?.label || `Level ${profile?.academicLevel || 'Not set'}`}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">GPA (0.0 - 4.0)</p>
                      <p className="font-medium text-gray-800">{displayGpa ? parseFloat(displayGpa).toFixed(2) : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number (WhatsApp)</p>
                      <p className="font-medium text-gray-800">{displayPhoneNumber}</p>
                    </div>
                  </div>
                </>
              )}

              {!isStudent && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Phone Number (WhatsApp)</p>
                    <p className="font-medium text-gray-800">{displayPhoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telegram Username</p>
                    <p className="font-medium text-gray-800">{displayTelegram}</p>
                  </div>
                </div>
              )}

              {isStudent && (
                <div>
                  <p className="text-sm text-gray-500">Telegram Username</p>
                  <p className="font-medium text-gray-800">{displayTelegram}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile() }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={profile?.email || user?.email}
                    disabled
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {isStudent && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
                      <select
                        value={profile?.academicLevel}
                        disabled
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                      >
                        {academicLevels.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-400 mt-1">Level cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GPA (0.0 - 4.0)</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="4"
                        value={form.gpa}
                        disabled
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">GPA is calculated automatically</p>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+20123456789"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telegram Username</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.telegramUsername}
                      onChange={(e) => setForm({ ...form, telegramUsername: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* بطاقة تغيير كلمة المرور */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Security</h3>
              <p className="text-xs text-gray-400">Update your password</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 pr-10 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock size={16} />}
            Change Password
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
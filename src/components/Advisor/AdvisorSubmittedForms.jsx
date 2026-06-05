import { useState } from 'react'
import useSWR from 'swr'
import { advisorApi } from '../../lib/api'
import { toast } from 'sonner'
import { Loader2, FileText, Eye, X, CheckCircle, XCircle, Download, Users } from 'lucide-react'

const AdvisorSubmittedForms = () => {
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedForm, setSelectedForm] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [downloading, setDownloading] = useState(null)

  const { data, isLoading, mutate } = useSWR(
    ['submitted-forms', selectedLevel],
    async () => {
      const res = await advisorApi.getSubmittedForms(selectedLevel)
      console.log('📦 API Response:', res.data)
      return res.data
    }
  )

  const formsRaw = data?.data || data || []
  const forms = Array.isArray(formsRaw) ? formsRaw : []

  const getFileUrl = (form) => {
    if (!form) return null
    return form.fileUrl || form.file_url || form.attachmentUrl || form.documentUrl || form.filePath || form.file_path || null
  }

  const getFileName = (form) => {
    if (!form) return 'Document'
    return form.fileName || form.file_name || form.originalFileName || 'Attached Document'
  }

  const handleDownload = async (form) => {
    let fileUrl = getFileUrl(form)
    const fileName = getFileName(form)
    
    if (!fileUrl) {
      toast.error('No file attached to this form')
      return
    }
    
    setDownloading(form.id)
    try {
      const token = localStorage.getItem('token')
      
      if (fileUrl.startsWith('/')) {
        fileUrl = `${window.location.origin}${fileUrl}`
      }
      
      console.log('📎 Downloading from:', fileUrl)
      
      const response = await fetch(fileUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`Downloaded ${fileName}`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  const levels = [
    { value: '', label: 'All Levels', color: 'bg-gray-100 text-gray-800' },
    { value: '1', label: 'Level 1', color: 'bg-green-100 text-green-800' },
    { value: '2', label: 'Level 2', color: 'bg-blue-100 text-blue-800' },
    { value: '3', label: 'Level 3', color: 'bg-yellow-100 text-yellow-800' },
    { value: '4', label: 'Level 4', color: 'bg-purple-100 text-purple-800' },
  ]

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === 'approved') {
      return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Approved' }
    } else if (statusLower === 'rejected') {
      return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' }
    }
    return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: null, label: 'Pending' }
  }

  const openModal = (form) => {
    setSelectedForm(form)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedForm(null)
    setIsModalOpen(false)
  }

  // ✅ تحديث الحالة محلياً (بدون API) مؤقتاً
  const updateFormStatus = async (status) => {
    if (!selectedForm) return
    
    setUpdating(true)
    try {
      // ✅ تحديث الحالة في الـ state المحلي
      const updatedForms = forms.map(form => 
        form.id === selectedForm.id 
          ? { ...form, status: status === 'approved' ? 'Approved' : 'Rejected' }
          : form
      )
      
      // ✅ تحديث البيانات في SWR cache يدوياً
      await mutate(updatedForms, { revalidate: false })
      
      toast.success(`Form ${status === 'approved' ? 'approved' : 'rejected'} successfully!`)
      closeModal()
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update form status')
    } finally {
      setUpdating(false)
    }
  }

  if (isLoading && forms.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Submitted Registration Forms</h1>
      <p className="text-gray-500 mb-6">Review and manage student registration requests</p>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-gray-700">Filter by Academic Level</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {levels.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => setSelectedLevel(lvl.value)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedLevel === lvl.value
                  ? 'bg-purple-600 text-white shadow-md'
                  : `${lvl.color} hover:opacity-80`
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Showing {forms.length} form{forms.length !== 1 ? 's' : ''}
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No submitted forms found for this level.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => {
            const status = getStatusBadge(form.status)
            const StatusIcon = status.icon
            const fileUrl = getFileUrl(form)
            const fileName = getFileName(form)
            const isDownloading = downloading === form.id
            
            return (
              <div key={form.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-gray-800">{form.studentName}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text} flex items-center gap-1`}>
                          {StatusIcon && <StatusIcon className="h-3 w-3" />}
                          {status.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">{form.studentEmail}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Level {form.academicLevel}
                        </span>
                        <span>Submitted: {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                      
                      {fileUrl ? (
                        <div className="mt-3 pt-2">
                          <button
                            onClick={() => handleDownload(form)}
                            disabled={isDownloading}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-purple-600 transition text-sm"
                          >
                            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {isDownloading ? 'Downloading...' : `Download ${fileName}`}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 pt-2 text-sm text-gray-400 flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          No document attached
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(form)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 transition text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Registration Form Details</h2>
              <button onClick={closeModal} className="text-white/80 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Student Name</label>
                  <p className="font-medium text-gray-800">{selectedForm.studentName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Student Email</label>
                  <p className="font-medium text-gray-800">{selectedForm.studentEmail}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Department</label>
                  <p className="font-medium text-gray-800">{selectedForm.studentDepartment || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Academic Level</label>
                  <p className="font-medium text-gray-800">Level {selectedForm.academicLevel}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Submitted Date</label>
                  <p className="font-medium text-gray-800">{selectedForm.submittedAt ? new Date(selectedForm.submittedAt).toLocaleString() : 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <p className={`font-medium inline-block px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedForm.status).bg} ${getStatusBadge(selectedForm.status).text}`}>
                    {getStatusBadge(selectedForm.status).label}
                  </p>
                </div>
              </div>

              {selectedForm.notes && (
                <div>
                  <label className="text-sm text-gray-500">Student Notes</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{selectedForm.notes}</p>
                </div>
              )}

              {getFileUrl(selectedForm) && (
                <div>
                  <label className="text-sm text-gray-500">Attached Document</label>
                  <div className="mt-2">
                    <button
                      onClick={() => handleDownload(selectedForm)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-purple-600 transition"
                    >
                      <Download className="h-4 w-4" />
                      Download {getFileName(selectedForm)}
                    </button>
                  </div>
                </div>
              )}

              {selectedForm.advisorResponse && (
                <div>
                  <label className="text-sm text-gray-500">Advisor Response</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{selectedForm.advisorResponse}</p>
                </div>
              )}
            </div>
            
            {selectedForm.status?.toLowerCase() === 'pending' && (
              <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
                <button
                  onClick={() => updateFormStatus('rejected')}
                  disabled={updating}
                  className="px-5 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition flex items-center gap-2"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Reject
                </button>
                <button
                  onClick={() => updateFormStatus('approved')}
                  disabled={updating}
                  className="px-5 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition flex items-center gap-2"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve
                </button>
              </div>
            )}

            {selectedForm.status?.toLowerCase() !== 'pending' && (
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                <button onClick={closeModal} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvisorSubmittedForms
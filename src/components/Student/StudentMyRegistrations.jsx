// src/components/Student/StudentMyRegistrations.jsx
import useSWR from 'swr'
import { registrationApi, regulationsApi } from '../../lib/api' // تأكد من وجود regulationsApi
import { toast } from 'sonner'
import { Loader2, FileText, Download, Eye, CheckCircle, XCircle, Clock, X } from 'lucide-react'
import { useState } from 'react'

const StudentMyRegistrations = () => {
  const { data, isLoading, error } = useSWR('my-registrations', registrationApi.getMyRegistrations)
  const [downloading, setDownloading] = useState(null)
  
  // States for the modal viewer
  const [viewingRegulation, setViewingRegulation] = useState(null)
  const [regulationContent, setRegulationContent] = useState(null)
  const [isModalLoading, setIsModalLoading] = useState(false)

  // استخراج البيانات بأمان
  const registrations = Array.isArray(data) ? data : (data?.data ? (Array.isArray(data.data) ? data.data : []) : [])

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase()
    if (statusLower === 'approved') {
      return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Approved' }
    } else if (statusLower === 'rejected') {
      return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Rejected' }
    }
    return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Pending' }
  }

  const handleDownload = async (fileUrl, fileName) => {
    if (!fileUrl) {
      toast.error('No file attached')
      return
    }
    setDownloading(fileUrl)
    try {
      const token = localStorage.getItem('token')
      let fullUrl = fileUrl
      if (fileUrl.startsWith('/')) {
        fullUrl = `${window.location.origin}${fileUrl}`
      }
      const response = await fetch(fullUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'document'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download file')
    } finally {
      setDownloading(null)
    }
  }

  // --- Modified View Handler ---
  const handleViewRegulation = async (regulationId, regulationTitle) => {
    if (!regulationId) {
      toast.error('No regulation associated with this registration.')
      return
    }

    setIsModalLoading(true)
    setViewingRegulation({ id: regulationId, title: regulationTitle || 'Regulation' })

    try {
      // 1. Fetch the regulation data from your API
      // Assuming you have a function like regulationsApi.getById
      const regulationData = await regulationsApi.getById(regulationId)
      
      // Extract the file URL from the response (adjust path as needed)
      // Common field names: fileUrl, file_url, attachmentUrl, filePath
      const fileUrl = regulationData?.fileUrl || regulationData?.file_url || regulationData?.attachmentUrl || regulationData?.filePath
      
      if (!fileUrl) {
        throw new Error('Regulation file URL not found.')
      }

      // 2. Fetch the actual file using the token
      const token = localStorage.getItem('token')
      let fullUrl = fileUrl
      if (fileUrl.startsWith('/')) {
        fullUrl = `${window.location.origin}${fileUrl}`
      }
      
      const response = await fetch(fullUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to load regulation file')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setRegulationContent(url)
      
    } catch (err) {
      console.error('Error viewing regulation:', err)
      toast.error(err.message || 'Failed to load regulation')
      setViewingRegulation(null) // Close modal on error
    } finally {
      setIsModalLoading(false)
    }
  }

  const closeModal = () => {
    if (regulationContent) {
      URL.revokeObjectURL(regulationContent) // Clean up the object URL
    }
    setViewingRegulation(null)
    setRegulationContent(null)
  }

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
        Failed to load registrations. Please try again later.
      </div>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Registrations</h1>
        <p className="text-gray-500 mb-6">View all your submitted registration forms and their status</p>

        {registrations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">You haven't submitted any registration forms yet.</p>
            <button
              onClick={() => window.location.href = '/student/submit-form'}
              className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              Submit a new registration →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map((form) => {
              const status = getStatusBadge(form.status)
              const StatusIcon = status.icon
              const fileUrl = form.fileUrl || form.file_url || form.attachmentUrl || form.filePath
              const fileName = form.fileName || form.originalFileName || 'document'
              // Get regulation details from the form object
              const regulationId = form.regulationId || form.regulation_id
              const regulationTitle = form.regulationTitle || form.regulation_title || `Regulation for Level ${form.academicLevel}`

              return (
                <div key={form.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition">
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-gray-800">
                            Level {form.academicLevel} Registration
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text} flex items-center gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                          Submitted: {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString() : 'Unknown'}
                        </p>
                        {form.notes && (
                          <p className="text-gray-600 text-sm mt-2 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Notes:</span> {form.notes}
                          </p>
                        )}
                        {form.advisorResponse && (
                          <p className="text-purple-600 text-sm mt-2">
                            <span className="font-medium">Advisor response:</span> {form.advisorResponse}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {fileUrl && (
                          <button
                            onClick={() => handleDownload(fileUrl, fileName)}
                            disabled={downloading === fileUrl}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-purple-600 transition text-sm"
                          >
                            {downloading === fileUrl ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            Download
                          </button>
                        )}
                        {/* --- Modified View Button --- */}
                        <button
                          onClick={() => handleViewRegulation(regulationId, regulationTitle)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 transition text-sm"
                        >
                          <Eye className="h-4 w-4" />
                          View Regulation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* --- Modal for Viewing Regulation --- */}
      {viewingRegulation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">
                {viewingRegulation.title}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {isModalLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
                </div>
              ) : regulationContent ? (
                <iframe
                  src={regulationContent}
                  className="w-full h-[70vh] rounded-lg border-0"
                  title="Regulation Viewer"
                />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Unable to load the regulation file.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudentMyRegistrations
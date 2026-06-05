import { useState } from 'react'
import useSWR from 'swr'
import { toast } from 'sonner'
import { chatApi } from '../../lib/api'
import { Search, Loader2, FileText, XCircle, Download, Eye } from 'lucide-react'

const getKeywords = (kw) => { 
  if (!kw) return []
  if (Array.isArray(kw)) return kw
  if (typeof kw === 'string') return kw.split(',').map(s => s.trim())
  return []
}

const StudentRegulations = () => {
  const [search, setSearch] = useState('')
  const [selectedReg, setSelectedReg] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  
  const { data, isLoading } = useSWR('regulations', chatApi.getStudentRegulations)
  const regs = Array.isArray(data) ? data : (data?.data ? (Array.isArray(data.data) ? data.data : []) : [])
  
  const filtered = regs.filter(r => 
    search === '' || 
    r.question?.toLowerCase().includes(search.toLowerCase()) || 
    r.answer?.toLowerCase().includes(search.toLowerCase()) || 
    getKeywords(r.keywords).some(k => k.toLowerCase().includes(search.toLowerCase()))
  )

  const openModal = (reg) => {
    setSelectedReg(reg)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedReg(null)
    setIsModalOpen(false)
  }

  const handleDownload = async (attachmentUrl) => {
    if (!attachmentUrl) {
      toast.error('No file attached')
      return
    }
    
    setDownloading(true)
    try {
      const token = localStorage.getItem('token')
      
      let fullUrl = attachmentUrl
      if (attachmentUrl.startsWith('/')) {
        fullUrl = `${window.location.origin}${attachmentUrl}`
      }
      
      const response = await fetch(fullUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      let fileName = attachmentUrl.split('/').pop() || 'document'
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
      
      toast.success(`Downloaded ${fileName}`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    } finally {
      setDownloading(false)
    }
  }

  const handleViewFile = (attachmentUrl) => {
    if (!attachmentUrl) {
      toast.error('No file attached')
      return
    }
    let fullUrl = attachmentUrl
    if (attachmentUrl.startsWith('/')) {
      fullUrl = `${window.location.origin}${attachmentUrl}`
    }
    window.open(fullUrl, '_blank')
    toast.success('Opening file...')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
            Academic Regulations
          </h1>
          <p className="text-gray-500 mt-2">Find answers to frequently asked questions about university regulations</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by question, answer, or keywords..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
          />
        </div>

        {/* Search Results Count */}
        {search && (
          <div className="text-sm text-gray-500 mb-4">
            Found {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Regulations List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No regulations found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((reg) => (
              <div
                key={reg.id}
                onClick={() => openModal(reg)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200 p-5"
              >
                <div className="flex justify-between items-start gap-3">
                  <h3 className="font-semibold text-gray-800 text-lg">{reg.question}</h3>
                  {reg.category && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full whitespace-nowrap">
                      {reg.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-2 line-clamp-2">{reg.answer}</p>
                <div className="flex justify-between items-center mt-3">
                  <div className="flex flex-wrap gap-1">
                    {getKeywords(reg.keywords).length > 0 && (
                      <>
                        {getKeywords(reg.keywords).slice(0, 2).map(k => (
                          <span key={k} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                            {k}
                          </span>
                        ))}
                        {getKeywords(reg.keywords).length > 2 && (
                          <span className="text-xs text-gray-400">+{getKeywords(reg.keywords).length - 2}</span>
                        )}
                      </>
                    )}
                  </div>
                  {reg.attachmentUrl && (
                    <span className="text-xs text-purple-500 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Has attachment
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {isModalOpen && selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Regulation Details</h2>
                <button onClick={closeModal} className="text-white/80 hover:text-white transition">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                {/* Question */}
                <div>
                  <label className="text-sm text-gray-500 font-medium">Question</label>
                  <p className="text-gray-800 mt-1 text-lg font-medium">{selectedReg.question}</p>
                </div>

                {/* Answer */}
                <div>
                  <label className="text-sm text-gray-500 font-medium">Answer</label>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg mt-1 whitespace-pre-wrap leading-relaxed">
                    {selectedReg.answer}
                  </p>
                </div>

                {/* Category */}
                {selectedReg.category && (
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Category</label>
                    <p className="text-gray-800 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {selectedReg.category}
                      </span>
                    </p>
                  </div>
                )}

                {/* Keywords */}
                {getKeywords(selectedReg.keywords).length > 0 && (
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Keywords</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {getKeywords(selectedReg.keywords).map((kw, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Source */}
                {selectedReg.source && (
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Source</label>
                    <p className="text-gray-800 mt-1">{selectedReg.source}</p>
                  </div>
                )}

                {/* Last Updated */}
                {selectedReg.lastUpdated && (
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Last Updated</label>
                    <p className="text-gray-800 mt-1">{new Date(selectedReg.lastUpdated).toLocaleString()}</p>
                  </div>
                )}

                {/* Attachment Section */}
                {selectedReg.attachmentUrl && (
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Attached Document</label>
                    <div className="mt-2 flex gap-3">
                      <button
                        onClick={() => handleViewFile(selectedReg.attachmentUrl)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-purple-600 transition"
                      >
                        <Eye className="h-4 w-4" />
                        View Document
                      </button>
                      <button
                        onClick={() => handleDownload(selectedReg.attachmentUrl)}
                        disabled={downloading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 transition"
                      >
                        {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentRegulations
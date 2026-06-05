import { useState } from 'react'
import useSWR from 'swr'
import { adminApi } from '../../lib/api'
import { toast } from 'sonner'
import { Loader2, Edit, Trash2, Upload, FileText, Plus, X, Download, Search, XCircle } from 'lucide-react'
import { safeArray } from '../../lib/utils'

const AdminRegulations = () => {
  const { data, isLoading, mutate } = useSWR('admin-regulations', adminApi.getRegulations)
  const regulations = safeArray(data)

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ category: '', keywords: '', question: '', answer: '', source: '' })
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [downloading, setDownloading] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReg, setSelectedReg] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const filteredRegulations = regulations.filter(reg => {
    const searchLower = searchQuery.toLowerCase()
    return (
      reg.question?.toLowerCase().includes(searchLower) ||
      reg.answer?.toLowerCase().includes(searchLower) ||
      reg.category?.toLowerCase().includes(searchLower) ||
      reg.keywords?.toLowerCase().includes(searchLower)
    )
  })

  const openNewForm = () => {
    setEditing(null)
    setForm({ category: '', keywords: '', question: '', answer: '', source: '' })
    setFile(null)
    setFormVisible(true)
  }

  const editRegulation = (reg) => {
    if (!reg) return
    setEditing(reg.id)
    setForm({
      category: reg.category || '',
      keywords: reg.keywords || '',
      question: reg.question || '',
      answer: reg.answer || '',
      source: reg.source || '',
    })
    setFile(null)
    setFormVisible(true)
    document.getElementById('regulation-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const openDetailsModal = (reg) => {
    setSelectedReg(reg)
    setIsDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setSelectedReg(null)
    setIsDetailsModalOpen(false)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.question || !form.question.trim()) {
      toast.error('Question is required')
      return
    }
    if (!form.answer || !form.answer.trim()) {
      toast.error('Answer is required')
      return
    }
    
    setIsUploading(true)
    
    try {
      if (editing) {
        const updateData = {
          question: form.question.trim(),
          answer: form.answer.trim(),
          category: form.category?.trim() || '',
          keywords: form.keywords?.trim() || '',
          source: form.source?.trim() || ''
        }
        await adminApi.updateRegulation(editing, updateData)
        toast.success('Regulation updated successfully')
      } else {
        if (file) {
          const fd = new FormData()
          fd.append('question', form.question.trim())
          fd.append('answer', form.answer.trim())
          if (form.category?.trim()) fd.append('category', form.category.trim())
          if (form.keywords?.trim()) fd.append('keywords', form.keywords.trim())
          if (form.source?.trim()) fd.append('source', form.source.trim())
          fd.append('Attachment', file)
          
          await adminApi.createRegulationWithFile(fd)
          toast.success('Regulation with file created successfully')
        } else {
          const payload = {
            question: form.question.trim(),
            answer: form.answer.trim(),
            category: form.category?.trim() || '',
            keywords: form.keywords?.trim() || '',
            source: form.source?.trim() || ''
          }
          await adminApi.createRegulation(payload)
          toast.success('Regulation created successfully')
        }
      }
      
      setEditing(null)
      setForm({ category: '', keywords: '', question: '', answer: '', source: '' })
      setFile(null)
      setFormVisible(false)
      mutate()
      
    } catch (error) {
      console.error('Submit error:', error)
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!id) return
    if (!window.confirm('Delete this regulation permanently?')) return
    try {
      await adminApi.deleteRegulation(id)
      toast.success('Regulation deleted')
      mutate()
    } catch {
      toast.error('Delete failed')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent">
            Manage Regulations
          </h1>
          <p className="text-gray-500 mt-2">Create, edit, and manage academic regulations</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          {/* Search */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search regulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </div>
          
          <button
            onClick={openNewForm}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" /> New Regulation
          </button>
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className="text-sm text-gray-500 mb-4">
            Found {filteredRegulations.length} result{filteredRegulations.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Form Modal (Slide-in) */}
        {formVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fadeIn">
              <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  {editing ? 'Edit Regulation' : 'Create New Regulation'}
                </h2>
                <button onClick={() => setFormVisible(false)} className="text-white/80 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Graduation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                      <input
                        type="text"
                        value={form.keywords}
                        onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="graduation, thesis, credit"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
                    <input
                      type="text"
                      value={form.question}
                      onChange={(e) => setForm({ ...form, question: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      placeholder="e.g., What are the graduation requirements?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
                    <textarea
                      rows="4"
                      value={form.answer}
                      onChange={(e) => setForm({ ...form, answer: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                      placeholder="Detailed answer..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source (optional)</label>
                      <input
                        type="text"
                        value={form.source}
                        onChange={(e) => setForm({ ...form, source: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Reference document or URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
                      <div className="flex items-center gap-2">
                        <input type="file" id="fileInput" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                        <button
                          type="button"
                          onClick={() => document.getElementById('fileInput').click()}
                          className="border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" /> Choose File
                        </button>
                        <span className="text-sm text-gray-500">{file ? file.name : 'No file chosen'}</span>
                        {file && <button type="button" onClick={() => setFile(null)} className="text-red-500"><X className="h-4 w-4" /></button>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" disabled={isUploading} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl transition flex items-center gap-2">
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {editing ? 'Update Regulation' : (file ? 'Create with File' : 'Create Regulation')}
                    </button>
                    <button type="button" onClick={() => { setFormVisible(false); setEditing(null); setForm({ category: '', keywords: '', question: '', answer: '', source: '' }); setFile(null) }} className="border border-gray-200 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Regulations Grid */}
        <div className="mt-6">
          {filteredRegulations.length === 0 ? (
            <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No regulations found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRegulations.map((reg) => (
                <div 
                  key={reg.id} 
                  onClick={() => openDetailsModal(reg)}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-purple-200"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">{reg.question}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{reg.answer}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {reg.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          {reg.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); editRegulation(reg) }}
                        className="p-1.5 text-gray-400 hover:text-purple-600 transition rounded-lg hover:bg-white"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(reg.id) }}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-white"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {reg.attachmentUrl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(reg.attachmentUrl) }}
                        disabled={downloading}
                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" /> Download
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Modal */}
        {isDetailsModalOpen && selectedReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Regulation Details</h2>
                <button onClick={closeDetailsModal} className="text-white/80 hover:text-white">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                <div>
                  <label className="text-sm text-gray-500 font-medium">Question</label>
                  <p className="text-gray-800 mt-1">{selectedReg.question}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 font-medium">Answer</label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1 whitespace-pre-wrap">{selectedReg.answer}</p>
                </div>
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
                {selectedReg.keywords && (
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Keywords</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedReg.keywords.split(',').map((kw, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {kw.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedReg.source && (
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Source</label>
                    <p className="text-gray-800 mt-1">{selectedReg.source}</p>
                  </div>
                )}
                {selectedReg.lastUpdated && (
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Last Updated</label>
                    <p className="text-gray-800 mt-1">{new Date(selectedReg.lastUpdated).toLocaleString()}</p>
                  </div>
                )}
                {selectedReg.attachmentUrl && (
                  <div>
                    <label className="text-sm text-gray-500 font-medium">Attachment</label>
                    <div className="mt-2">
                      <button
                        onClick={() => handleDownload(selectedReg.attachmentUrl)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-purple-600 transition"
                      >
                        <Download className="h-4 w-4" /> Download Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                <button onClick={closeDetailsModal} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
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

export default AdminRegulations
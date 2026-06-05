import { useState } from 'react'
import useSWR from 'swr'
import { adminApi } from '../../lib/api'
import { toast } from 'sonner'
import { Loader2, Edit, Trash2, Upload, FileText, Plus, X, Download } from 'lucide-react'
import { safeArray } from '../../lib/utils'

const AdminRegulations = () => {
  const { data, isLoading, mutate } = useSWR('admin-regulations', adminApi.getRegulations)
  const regulations = safeArray(data)

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ category: '', keywords: '', question: '', answer: '', source: '' })
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [downloading, setDownloading] = useState(null)

  const openNewForm = () => {
    setEditing(null)
    setForm({ category: '', keywords: '', question: '', answer: '', source: '' })
    setFile(null)
    setFormVisible(true)
  }

  const editRegulation = (reg) => {
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

  // ✅ دالة محسنة لتحميل الملف
  // ✅ دالة لتحميل الملف مع الحفاظ على الامتداد الصحيح
const handleDownload = async (attachmentUrl, originalFileName) => {
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
    
    console.log('📎 Downloading from:', fullUrl)
    
    const response = await fetch(fullUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    
    // ✅ تحديد الامتداد الصحيح من اسم الملف الأصلي
    let extension = ''
    let finalFileName = 'document'
    
    if (originalFileName && originalFileName.includes('.')) {
      // استخراج الامتداد من اسم الملف الأصلي
      extension = originalFileName.substring(originalFileName.lastIndexOf('.'))
      finalFileName = originalFileName
    } else {
      // تحديد الامتداد من نوع المحتوى (Content-Type)
      const contentType = response.headers.get('Content-Type')
      if (contentType) {
        if (contentType.includes('pdf')) extension = '.pdf'
        else if (contentType.includes('msword')) extension = '.doc'
        else if (contentType.includes('word')) extension = '.docx'
        else if (contentType.includes('text')) extension = '.txt'
        else if (contentType.includes('png')) extension = '.png'
        else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = '.jpg'
        else if (contentType.includes('zip')) extension = '.zip'
      }
      
      // إنشاء اسم الملف النهائي
      const baseName = originalFileName || `file_${Date.now()}`
      finalFileName = baseName.includes('.') ? baseName : `${baseName}${extension}`
    }
    
    console.log('📎 Saving as:', finalFileName)
    
    // ✅ طريقة أكثر أماناً للتحميل
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = finalFileName
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    
    // تنظيف
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 100)
    
    toast.success(`Downloaded ${finalFileName}`)
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Failed to download file')
  } finally {
    setDownloading(false)
  }
}
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.question || !form.answer) {
      toast.error('Question and Answer are required')
      return
    }
    
    setIsUploading(true)
    
    try {
      if (editing) {
        console.log('📤 Updating regulation:', editing, form)
        await adminApi.updateRegulation(editing, form)
        toast.success('Regulation updated successfully')
      } else {
        if (file) {
          const fd = new FormData()
          fd.append('Category', form.category || '')
          fd.append('Keywords', form.keywords || '')
          fd.append('Question', form.question)
          fd.append('Answer', form.answer)
          fd.append('Source', form.source || '')
          fd.append('Attachment', file)
          
          console.log('📤 Creating regulation with file')
          await adminApi.createRegulationWithFile(fd)
          toast.success('Regulation with file created successfully')
        } else {
          const payload = {
            category: form.category || '',
            keywords: form.keywords || '',
            question: form.question,
            answer: form.answer,
            source: form.source || ''
          }
          
          console.log('📤 Creating regulation:', payload)
          const response = await adminApi.createRegulation(payload)
          console.log('✅ Response:', response.data)
          toast.success('Regulation created successfully')
        }
      }
      
      setEditing(null)
      setForm({ category: '', keywords: '', question: '', answer: '', source: '' })
      setFile(null)
      setFormVisible(false)
      mutate()
      
    } catch (error) {
      console.error('❌ Submit error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message ||
                          (editing ? 'Update failed' : 'Creation failed')
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this regulation permanently?')) return
    try {
      await adminApi.deleteRegulation(id)
      toast.success('Regulation deleted')
      mutate()
    } catch (error) {
      console.error('Delete error:', error)
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
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Regulations</h1>
        </div>
        <button
          onClick={openNewForm}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="h-4 w-4" /> New Regulation
        </button>
      </div>

      {formVisible && (
        <div id="regulation-form" className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {editing ? '✏️ Edit Regulation' : '📝 Create New Regulation'}
            </h2>
            <button onClick={() => setFormVisible(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Graduation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
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
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Reference document or URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (PDF, DOC)</label>
                <div className="flex items-center gap-2">
                  <input type="file" id="fileInput" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                  <button type="button" onClick={() => document.getElementById('fileInput').click()} className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Choose File
                  </button>
                  <span className="text-sm text-gray-500">{file ? file.name : 'No file chosen'}</span>
                  {file && <button type="button" onClick={() => setFile(null)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>}
                </div>
                <p className="text-xs text-gray-400 mt-1">Optional – attach supporting document</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={isUploading} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition disabled:opacity-50">
                {isUploading ? <Loader2 className="animate-spin h-4 w-4 inline mr-1" /> : null}
                {editing ? 'Update Regulation' : file ? 'Create with File' : 'Create Regulation'}
              </button>
              <button type="button" onClick={() => { setFormVisible(false); setEditing(null); setForm({ category: '', keywords: '', question: '', answer: '', source: '' }); setFile(null) }} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <h2 className="text-lg font-semibold text-purple-600 mb-4">📋 Existing Regulations</h2>
      {regulations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No regulations yet. Click "New Regulation" to add one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {regulations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800 text-base leading-tight">{reg.question}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => editRegulation(reg)} className="text-gray-400 hover:text-purple-600" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(reg.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{reg.answer}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {reg.category && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{reg.category}</span>}
                  {reg.keywords && reg.keywords.split(',').slice(0, 3).map((kw, idx) => <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{kw.trim()}</span>)}
                </div>
              </div>
              {reg.attachmentUrl && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => handleDownload(reg.attachmentUrl, reg.fileName || reg.originalFileName)} disabled={downloading} className="text-xs text-purple-600 hover:text-purple-800 inline-flex items-center gap-1">
                    {downloading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                    Download attachment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminRegulations
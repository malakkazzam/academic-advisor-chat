import { useState } from 'react'
import { toast } from 'sonner'
import { registrationApi } from '../../lib/api'
import { Upload, Loader2 } from 'lucide-react'

const StudentRegistrationForm = () => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ academicLevel: '', notes: '', file: null })
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] })
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.academicLevel) { setError('Academic level required'); return }
    if (!formData.file) { setError('File required'); return }
    setLoading(true)
    const fd = new FormData()
    fd.append('academicLevel', parseInt(formData.academicLevel))
    if (formData.notes) fd.append('notes', formData.notes)
    fd.append('file', formData.file)
    try {
      await registrationApi.submit(fd)
      toast.success('Registration submitted')
      setFormData({ academicLevel: '', notes: '', file: null })
      document.getElementById('fileInput').value = ''
    } catch (err) {
      const msg = err.response?.data?.error || 'Submission failed'
      toast.error(msg)
      setError(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Registration Form</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium">Academic Level <span className="text-red-500">*</span></label>
            <select value={formData.academicLevel} onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value })} className="w-full border rounded-md p-2">
              <option value="">Select level</option>
              {[1,2,3,4].map(l => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium">Notes (Optional)</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows="3" className="w-full border rounded-md p-2" placeholder="Any additional information..." />
          </div>
          <div><label className="block text-sm font-medium">Upload Document (PDF, DOC) <span className="text-red-500">*</span></label>
            <div className="mt-1 flex items-center gap-3">
              <input type="file" id="fileInput" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
              <button type="button" onClick={() => document.getElementById('fileInput').click()} className="inline-flex items-center gap-2 px-4 py-2 border rounded-md bg-white"><Upload className="h-4 w-4" /> Choose File</button>
              <span className="text-sm text-gray-500">{formData.file ? formData.file.name : 'No file chosen'}</span>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-2 rounded-md flex items-center justify-center gap-2 disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{loading ? 'Submitting...' : 'Submit Registration'}</button>
        </form>
      </div>
    </div>
  )
}
export default StudentRegistrationForm
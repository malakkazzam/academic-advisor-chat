import { useState } from 'react'
import useSWR from 'swr'
import { adminApi } from '../../lib/api'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'

const AdminUniversityEmails = () => {
  const { data, isLoading, mutate } = useSWR('university-emails', adminApi.getUniversityEmails)
  const emails = Array.isArray(data) ? data : (data?.data ? (Array.isArray(data.data) ? data.data : []) : [])
  const [newEmail, setNewEmail] = useState('')
  const [bulk, setBulk] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => { if(!newEmail) return; setLoading(true); try{await adminApi.addUniversityEmail(newEmail); toast.success('Added'); setNewEmail(''); mutate()} catch{toast.error('Failed')} finally{setLoading(false)} }
  const handleBulk = async () => { const list = bulk.split(',').map(e=>e.trim()).filter(e=>e); if(!list.length) return; setLoading(true); try{await adminApi.addMultipleUniversityEmails(list); toast.success(`Added ${list.length} emails`); setBulk(''); mutate()} catch{toast.error('Failed')} finally{setLoading(false)} }
  const handleDelete = async (id) => { try{await adminApi.deleteUniversityEmail(id); toast.success('Deleted'); mutate()} catch{toast.error('Failed')} }
  const handleDeleteAll = async () => { if(confirm('Delete all?')){await adminApi.deleteAllUniversityEmails(); toast.success('All deleted'); mutate()} }

  if(isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 text-purple-600" /></div>
  return (<div><h1 className="text-2xl font-bold mb-6">University Emails</h1>
    <div className="bg-white p-4 rounded shadow mb-6"><div className="flex gap-2 mb-3"><input placeholder="single@university.edu" value={newEmail} onChange={e=>setNewEmail(e.target.value)} className="flex-1 border p-2 rounded" /><button onClick={handleAdd} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded">Add</button></div>
    <textarea placeholder="email1@domain.com, email2@domain.com" value={bulk} onChange={e=>setBulk(e.target.value)} rows="3" className="w-full border p-2 rounded mb-3" /><div className="flex gap-2"><button onClick={handleBulk} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded">Add Multiple</button><button onClick={handleDeleteAll} className="bg-red-600 text-white px-4 py-2 rounded">Delete All</button></div></div>
    {emails.map(e => <div key={e.id} className="bg-white p-3 rounded shadow flex justify-between items-center mb-2"><span>{e.email}</span><button onClick={()=>handleDelete(e.id)}><Trash2 size={16} className="text-red-500" /></button></div>)}
  </div>)
}
export default AdminUniversityEmails
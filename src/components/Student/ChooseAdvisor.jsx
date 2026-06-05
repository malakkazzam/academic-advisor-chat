import { useState } from 'react'
// import useSWR from 'swr'
// import { advisorApi } from '../../lib/api'
import { toast } from 'sonner'
import { Loader2, UserCheck } from 'lucide-react'

// بيانات وهمية مؤقتة لحين إصلاح الـ API
const mockAdvisors = [
  { id: 1, fullName: 'Dr. Ahmed Ali', department: 'Computer Science', studentCount: 12 },
  { id: 2, fullName: 'Prof. Sara Hassan', department: 'Engineering', studentCount: 8 },
]

const ChooseAdvisor = () => {
  const [choosing, setChoosing] = useState(null)
  const advisors = mockAdvisors

  const handleChoose = async (advisorId) => {
    setChoosing(advisorId)
    try {
      // TODO: استبدل بالـ endpoint الصحيح عندما يعمل
      // await advisorApi.chooseAdvisor(advisorId)
      toast.success('Advisor selected (demo) – API endpoint needs fix')
    } catch (err) {
      toast.error(err.response?.data || 'Failed')
    } finally {
      setChoosing(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-3">Choose Your Advisor</h1>
    
      <div className="grid gap-4 md:grid-cols-2">
        {advisors.map(advisor => (
          <div key={advisor.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{advisor.fullName}</h3>
              <p className="text-sm text-gray-500">{advisor.department || 'Academic Advisor'}</p>
              <p className="text-xs text-gray-400 mt-1">Students: {advisor.studentCount}</p>
            </div>
            <button onClick={() => handleChoose(advisor.id)} disabled={choosing === advisor.id} className="bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2">
              {choosing === advisor.id ? <Loader2 className="animate-spin h-4 w-4" /> : <UserCheck className="h-4 w-4" />} Select
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChooseAdvisor
import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { advisorApi } from '../../lib/api'
import { toast } from 'sonner'
import { Loader2, MessageCircle, Mail, Filter, RefreshCw } from 'lucide-react'
import { safeArray } from '../../lib/utils'

const AdvisorStudents = () => {
  const [selectedLevel, setSelectedLevel] = useState('')
  const [minGpa, setMinGpa] = useState('')
  const [maxGpa, setMaxGpa] = useState('')
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const isMounted = useRef(true)

  // ✅ تحويل fetchAllStudents إلى useCallback لتجنب إعادة الإنشاء
  const fetchAllStudents = useCallback(async () => {
    if (!isMounted.current) return
    setLoading(true)
    try {
      const response = await advisorApi.getStudents()
      const data = safeArray(response.data)
      
      console.log('📊 Student data sample:', data[0])
      console.log('📊 All students:', data.length)
      
      if (isMounted.current) {
        setAllStudents(data)
        setStudents(data)
      }
    } catch (error) {
      if (isMounted.current) {
        toast.error('Failed to load students')
        console.error(error)
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  // ✅ استخدام setTimeout لتجنب استدعاء setState مباشرة أثناء الـ render
  useEffect(() => {
    isMounted.current = true
    const timer = setTimeout(() => {
      fetchAllStudents()
    }, 100)
    return () => {
      isMounted.current = false
      clearTimeout(timer)
    }
  }, [fetchAllStudents])

  const getStudentLevel = (student) => {
    if (student.academicLevel !== undefined && student.academicLevel !== null) {
      return String(student.academicLevel)
    }
    if (student.level !== undefined && student.level !== null) {
      return String(student.level)
    }
    if (student.studentLevel !== undefined && student.studentLevel !== null) {
      return String(student.studentLevel)
    }
    if (student.year !== undefined && student.year !== null) {
      return String(student.year)
    }
    return null
  }

  const getStudentGpa = (student) => {
    const possibleGpaFields = [
      'gpa', 'GPA', 'gradePointAverage', 'gradePointAvg',
      'avgGrade', 'cgpa', 'CGPA', 'cumulativeGpa', 'academicGpa'
    ]
    
    for (const field of possibleGpaFields) {
      if (student[field] !== undefined && student[field] !== null) {
        const value = parseFloat(student[field])
        if (!isNaN(value)) return value
      }
    }
    
    if (student.academicInfo && student.academicInfo.gpa !== undefined) {
      const value = parseFloat(student.academicInfo.gpa)
      if (!isNaN(value)) return value
    }
    if (student.grades && student.grades.average !== undefined) {
      const value = parseFloat(student.grades.average)
      if (!isNaN(value)) return value
    }
    
    return null
  }

  const applyFilters = () => {
    let filtered = [...allStudents]

    if (selectedLevel) {
      filtered = filtered.filter(student => {
        const studentLevel = getStudentLevel(student)
        return studentLevel === selectedLevel
      })
    }

    const min = minGpa !== '' ? parseFloat(minGpa) : null
    const max = maxGpa !== '' ? parseFloat(maxGpa) : null

    if (min !== null) {
      filtered = filtered.filter(student => {
        const gpa = getStudentGpa(student)
        return gpa !== null && gpa >= min
      })
    }
    
    if (max !== null) {
      filtered = filtered.filter(student => {
        const gpa = getStudentGpa(student)
        return gpa !== null && gpa <= max
      })
    }

    setStudents(filtered)

    if (filtered.length === 0) {
      toast.error('No students match the selected filters.', { duration: 2000 })
    } else {
      toast.success(`Found ${filtered.length} student(s)`, { duration: 1500 })
    }
  }

  const resetFilters = () => {
    setSelectedLevel('')
    setMinGpa('')
    setMaxGpa('')
    setStudents(allStudents)
    toast.success('Filters reset', { duration: 1000 })
  }

  const displayLevel = (student) => {
    const level = getStudentLevel(student)
    return level ? `Level ${level}` : 'Level —'
  }

  const displayGpa = (student) => {
    const gpa = getStudentGpa(student)
    if (gpa !== null && !isNaN(gpa)) {
      return gpa.toFixed(2)
    }
    return 'N/A'
  }

  const getGpaColorClass = (gpaValue) => {
    if (gpaValue === 'N/A') return 'bg-gray-100 text-gray-700'
    const value = parseFloat(gpaValue)
    if (value >= 3.5) return 'bg-green-100 text-green-800'
    if (value >= 2.5) return 'bg-blue-100 text-blue-800'
    if (value >= 2.0) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (loading && allStudents.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-10 w-10 text-purple-600" />
      </div>
    )
  }

  const availableLevels = [...new Set(allStudents.map(s => getStudentLevel(s)).filter(l => l !== null))].sort()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Students</h1>
      <p className="text-gray-500 mb-6">Manage and filter your students by level and GPA</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-gray-700">Filter Students</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Levels</option>
              {availableLevels.map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min GPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="4"
              value={minGpa}
              onChange={(e) => setMinGpa(e.target.value)}
              placeholder="e.g., 2.5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max GPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="4"
              value={maxGpa}
              onChange={(e) => setMaxGpa(e.target.value)}
              placeholder="e.g., 3.5"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex gap-2 items-end">
            <button
              onClick={applyFilters}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Filter size={18} />
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        Showing {students.length} student{students.length !== 1 ? 's' : ''}
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-500">No students match the selected filters.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => {
            const gpaValue = displayGpa(student)
            const gpaColorClass = getGpaColorClass(gpaValue)
            
            return (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">{student.fullName}</h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{student.email}</span>
                      </div>
                    </div>
                    <Link
                      to={`/advisor/students/${student.id}/chat`}
                      className="bg-purple-50 text-purple-600 p-2 rounded-full hover:bg-purple-100 transition"
                      title="Chat with student"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {displayLevel(student)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${gpaColorClass}`}>
                      GPA: {gpaValue}
                    </span>
                    {student.department && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {student.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdvisorStudents
// src/components/Student/Subjects.jsx
import { Code, Laptop, Globe, Layers } from 'lucide-react'

// ✅ استيراد الصور من نفس المجلد
import csImage from './cs.jpeg'
import itImage from './it.jpeg'
import isImage from './is.jpeg'
import levelsImage from './1&2.jpeg'

const Subjects = () => {
  const subjectsData = {
    CS: {
      title: 'CS (Computer Science)',
      icon: <Code className="h-6 w-6 text-blue-500" />,
      image: csImage,  // ✅ استخدمي المتغير الذي استوردته
    },
    IT: {
      title: 'IT (Information Technology)',
      icon: <Laptop className="h-6 w-6 text-green-500" />,
      image: itImage,
    },
    IS: {
      title: 'IS (Information Systems)',
      icon: <Globe className="h-6 w-6 text-purple-500" />,
      image: isImage,
    },
    'Levels': {
      title: 'Level 1 & 2',
      icon: <Layers className="h-6 w-6 text-orange-500" />,
      image: levelsImage,
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Subjects</h1>
        <p className="text-gray-500">Browse all subjects by category and level</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(subjectsData).map(([key, subject]) => (
          <div key={key} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="p-4 pb-0">
              <div className="flex items-center gap-2 mb-2">
                {subject.icon}
                <h2 className="text-lg font-bold text-gray-800">{subject.title}</h2>
              </div>
            </div>
            
            <div className="p-4 pt-0">
              <div className="rounded-xl overflow-hidden h-56 w-full">
                <img 
                  src={subject.image}
                  alt={subject.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Subjects
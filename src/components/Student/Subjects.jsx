// src/components/Student/Subjects.jsx
import { useState } from 'react'
import { Code, Laptop, Globe, Layers, X, ZoomIn } from 'lucide-react'

// استيراد الصور
import csImage from './cs.jpeg'
import itImage from './it.jpeg'
import isImage from './is.jpeg'
import levelsImage from './1&2.jpeg'

const Subjects = () => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedTitle, setSelectedTitle] = useState(null)

  const subjectsData = {
    CS: {
      title: 'CS (Computer Science)',
      icon: <Code className="h-6 w-6 text-blue-500" />,
      image: csImage,
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

  const openImageModal = (image, title) => {
    setSelectedImage(image)
    setSelectedTitle(title)
  }

  const closeModal = () => {
    setSelectedImage(null)
    setSelectedTitle(null)
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Subjects</h1>
          <p className="text-gray-500">Click on any subject to view the full image</p>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(subjectsData).map(([key, subject]) => (
            <div 
              key={key} 
              onClick={() => openImageModal(subject.image, subject.title)}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
            >
              {/* الاسم فوق الصورة */}
              <div className="p-4 pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {subject.icon}
                    <h2 className="text-lg font-bold text-gray-800">{subject.title}</h2>
                  </div>
                  <ZoomIn className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
              
              {/* الصورة */}
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

      {/* Modal لعرض الصورة كاملة */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b">
              <h3 className="text-lg font-semibold text-gray-800">{selectedTitle}</h3>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            {/* الصورة كاملة */}
            <div className="flex items-center justify-center p-4 bg-black/5">
              <img 
                src={selectedImage}
                alt={selectedTitle}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
              Click outside or press ESC to close
            </div>
          </div>
        </div>
      )}

      {/* تأثير ESC للإغلاق */}
      {selectedImage && (
        <div className="hidden" onKeyDown={(e) => {
          if (e.key === 'Escape') closeModal()
        }} />
      )}
    </>
  )
}

export default Subjects
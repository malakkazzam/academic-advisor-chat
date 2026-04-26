// src/components/Admin/RegulationsManagement.jsx
import  { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RegulationsManagement = () => {
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'academic'
  });
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const response = await adminAPI.getRegulations();
        if (isMounted.current) {
          setRegulations(response.data);
        }
      } catch {
        if (isMounted.current) {
          toast.error('Failed to fetch regulations');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchRegulations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRegulation) {
        await adminAPI.updateRegulation(editingRegulation.id, formData);
        toast.success('Regulation updated');
      } else {
        await adminAPI.createRegulation(formData);
        toast.success('Regulation created');
      }
      const response = await adminAPI.getRegulations();
      if (isMounted.current) {
        setRegulations(response.data);
      }
      setShowModal(false);
      resetForm();
    } catch {
      if (isMounted.current) {
        toast.error('Failed to save regulation');
      }
    }
  };

  const deleteRegulation = async (id) => {
    if (window.confirm('Are you sure you want to delete this regulation?')) {
      try {
        await adminAPI.deleteRegulation(id);
        const response = await adminAPI.getRegulations();
        if (isMounted.current) {
          setRegulations(response.data);
        }
        toast.success('Regulation deleted');
      } catch {
        if (isMounted.current) {
          toast.error('Failed to delete regulation');
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'academic' });
    setEditingRegulation(null);
  };

  const openModal = (regulation = null) => {
    if (regulation) {
      setEditingRegulation(regulation);
      setFormData({
        title: regulation.title,
        content: regulation.content,
        category: regulation.category
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const filteredRegulations = regulations.filter(reg =>
    reg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryColors = {
    academic: 'from-blue-500 to-blue-600',
    administrative: 'from-purple-500 to-purple-600',
    student: 'from-green-500 to-green-600'
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add Button and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Search regulations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium"
        >
          <FaPlus size={14} />
          Add Regulation
        </button>
      </div>

      {/* Regulations Grid - Responsive */}
      {filteredRegulations.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
          No regulations found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRegulations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800 text-base sm:text-lg">{reg.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${categoryColors[reg.category]} text-white`}>
                      {reg.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => openModal(reg)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => deleteRegulation(reg.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {reg.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                {editingRegulation ? 'Edit Regulation' : 'Add Regulation'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="academic">Academic</option>
                  <option value="administrative">Administrative</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulationsManagement;
import  { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RegulationsManagement = () => {
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRegulation, setEditingRegulation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'academic'
  });
  
  const isMounted = useRef(true);

  // منع تحديث الحالة بعد إلغاء تحميل المكون
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // تعريف وتنفيذ fetchRegulations داخل useEffect مباشرة
  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const response = await adminAPI.getRegulations();
        if (isMounted.current) {
          setRegulations(response.data);
        }
      } catch {
        // تمت إزالة معامل error
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
      // إعادة جلب البيانات بعد الإضافة أو التعديل
      const response = await adminAPI.getRegulations();
      if (isMounted.current) {
        setRegulations(response.data);
      }
      setShowModal(false);
      resetForm();
    } catch {
      // تمت إزالة معامل error
      if (isMounted.current) {
        toast.error('Failed to save regulation');
      }
    }
  };

  const deleteRegulation = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await adminAPI.deleteRegulation(id);
        const response = await adminAPI.getRegulations();
        if (isMounted.current) {
          setRegulations(response.data);
        }
        toast.success('Regulation deleted');
      } catch {
        // تمت إزالة معامل error
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <FaPlus /> Add Regulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regulations.map((reg) => (
          <div key={reg.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{reg.title}</h3>
                <span className="text-xs text-gray-500 capitalize">{reg.category}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openModal(reg)} className="text-blue-500 hover:text-blue-700">
                  <FaEdit />
                </button>
                <button onClick={() => deleteRegulation(reg.id)} className="text-red-500 hover:text-red-700">
                  <FaTrash />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm">{reg.content}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingRegulation ? 'Edit Regulation' : 'Add Regulation'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="academic">Academic</option>
                  <option value="administrative">Administrative</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
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
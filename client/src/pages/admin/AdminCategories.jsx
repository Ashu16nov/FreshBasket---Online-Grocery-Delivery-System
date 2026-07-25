import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { categoryAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll().then(r => r.data.data),
  });

  const categories = data || [];

  const onSubmit = async (formData) => {
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'image' && v?.[0]) data.append('image', v[0]);
        else data.append(k, v);
      });
      await categoryAPI.create(data);
      toast.success('Category created!');
      setShowModal(false);
      reset();
      refetch();
    } catch { toast.error('Failed to create category'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate category?')) return;
    try {
      await categoryAPI.delete(id);
      toast.success('Category deactivated');
      refetch();
    } catch { toast.error('Failed to deactivate category'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold">Category Management</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm flex items-center gap-2 py-2">
            <FiPlus size={16} /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map(c => (
            <div key={c.id} className="bg-dark-card border border-dark-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <h3 className="font-semibold text-white text-sm">{c.name}</h3>
                  <p className="text-[10px] text-gray-400">{c.slug}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600 p-1">
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">New Category</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400"><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input {...register('name', { required: true })} placeholder="Category Name" className="input-field text-sm" />
              <input {...register('icon')} placeholder="Icon (e.g. vegetable, fruit)" className="input-field text-sm" />
              <input {...register('description')} placeholder="Description" className="input-field text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1 text-sm py-2">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 text-sm py-2">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

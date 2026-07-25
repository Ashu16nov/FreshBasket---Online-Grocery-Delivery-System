import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  const { data: prodData, refetch } = useQuery({
    queryKey: ['adminProducts', search],
    queryFn: () => productAPI.getAll({ search, limit: 50 }).then(r => r.data.data),
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll().then(r => r.data.data),
  });

  const products = prodData || [];
  const categories = catData || [];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    reset({ name: '', category_id: '', brand: '', weight: '', price: '', old_price: '', stock_qty: '', description: '', is_organic: false, is_featured: false, is_flash_sale: false });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    reset({
      name: p.name, category_id: p.category_id, brand: p.brand, weight: p.weight,
      price: p.price, old_price: p.old_price, stock_qty: p.stock_qty, description: p.description,
      is_organic: p.is_organic, is_featured: p.is_featured, is_flash_sale: p.is_flash_sale,
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'images' && v?.[0]) {
          Array.from(v).forEach(file => formData.append('images', file));
        } else {
          formData.append(k, v);
        }
      });

      if (editingProduct) {
        await productAPI.update(editingProduct.id, formData);
        toast.success('Product updated!');
      } else {
        await productAPI.create(formData);
        toast.success('Product created!');
      }
      setShowModal(false);
      refetch();
    } catch { toast.error('Failed to save product'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deactivated');
      refetch();
    } catch { toast.error('Failed to delete product'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10 text-sm py-2" />
          </div>
          <button onClick={handleOpenAdd} className="btn-primary text-sm flex items-center gap-2 py-2.5">
            <FiPlus size={16} /> Add Product
          </button>
        </div>

        {/* Table */}
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-dark-border text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img src={p.thumbnail || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <p className="font-semibold text-white">{p.name}</p>
                        <p className="text-[10px] text-gray-500">{p.weight} · {p.brand}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{p.category?.name || '-'}</td>
                    <td className="py-3 px-4 text-white font-bold">₹{p.price}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.stock_qty <= 10 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                        {p.stock_qty} units
                      </span>
                    </td>
                    <td className="py-3 px-4">⭐ {p.rating_avg}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input {...register('name', { required: true })} placeholder="Product Name" className="input-field text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select {...register('category_id', { required: true })} className="input-field text-sm">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input {...register('brand')} placeholder="Brand" className="input-field text-sm" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input {...register('weight')} placeholder="Weight (e.g. 500g)" className="input-field text-sm" />
                <input {...register('price', { required: true })} placeholder="Price (₹)" type="number" step="0.01" className="input-field text-sm" />
                <input {...register('old_price')} placeholder="Old Price (₹)" type="number" step="0.01" className="input-field text-sm" />
              </div>
              <input {...register('stock_qty', { required: true })} placeholder="Stock Quantity" type="number" className="input-field text-sm" />
              <textarea {...register('description')} placeholder="Description" rows={3} className="input-field text-sm" />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" {...register('is_featured')} /> Featured</label>
                <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" {...register('is_flash_sale')} /> Flash Sale</label>
                <label className="flex items-center gap-2 text-xs text-gray-300"><input type="checkbox" {...register('is_organic')} /> Organic</label>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Product Images</label>
                <input type="file" multiple {...register('images')} className="text-xs text-gray-400" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">Save Product</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 py-2.5 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

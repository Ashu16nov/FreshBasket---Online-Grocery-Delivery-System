import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusOptions = ['pending', 'confirmed', 'preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [filterStatus, setFilterStatus] = useState('');

  const { data, refetch } = useQuery({
    queryKey: ['adminOrders', filterStatus],
    queryFn: () => orderAPI.getAll({ status: filterStatus, limit: 50 }).then(r => r.data.data),
  });

  const orders = data || [];

  const handleStatusChange = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, status);
      toast.success(`Order status updated to ${status}`);
      refetch();
    } catch { toast.error('Failed to update order status'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold">Orders Management</h2>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field text-sm w-auto py-2">
            <option value="">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-dark-border text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">#{o.order_number}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{o.user?.name || 'Guest'}</p>
                      <p className="text-[10px] text-gray-500">{o.user?.phone}</p>
                    </td>
                    <td className="py-3 px-4">{o.createdAt ? format(new Date(o.createdAt), 'dd MMM, hh:mm a') : '-'}</td>
                    <td className="py-3 px-4 uppercase">{o.payment_method}</td>
                    <td className="py-3 px-4 text-white font-bold">₹{o.grand_total}</td>
                    <td className="py-3 px-4">
                      <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                        className="bg-dark-bg border border-dark-border text-white text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary">
                        {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

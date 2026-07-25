import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminCustomers() {
  const { data } = useQuery({
    queryKey: ['adminCustomers'],
    queryFn: () => userAPI.getAllUsers({ role: 'customer' }).then(r => r.data.data),
  });

  const customers = data || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-white font-bold">Registered Customers</h2>
        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-dark-border text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Loyalty Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{c.name}</td>
                    <td className="py-3 px-4">{c.email}</td>
                    <td className="py-3 px-4">{c.phone || '-'}</td>
                    <td className="py-3 px-4">{c.city || '-'}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">⭐ {c.loyalty_points || 0}</td>
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

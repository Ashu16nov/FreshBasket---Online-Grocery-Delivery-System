import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiShoppingBag, FiDollarSign, FiUsers, FiBox, FiAlertTriangle, FiClock } from 'react-icons/fi';
import { userAPI, orderAPI } from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => userAPI.getDashboardStats().then(r => r.data.data),
  });

  const { data: recentOrdersData } = useQuery({
    queryKey: ['adminRecentOrders'],
    queryFn: () => orderAPI.getAll({ limit: 5 }).then(r => r.data.data),
  });

  const stats = statsData || {};
  const orders = recentOrdersData || [];

  const statCards = [
    { title: "Today's Orders", val: stats.todayOrders || 0, total: `Total: ${stats.totalOrders || 0}`, icon: FiShoppingBag, color: 'text-blue-400 bg-blue-500/10' },
    { title: "Today's Revenue", val: `₹${stats.todayRevenue || 0}`, total: `Total: ₹${stats.totalRevenue || 0}`, icon: FiDollarSign, color: 'text-emerald-400 bg-emerald-500/10' },
    { title: 'Customers', val: stats.totalCustomers || 0, total: 'Registered users', icon: FiUsers, color: 'text-purple-400 bg-purple-500/10' },
    { title: 'Products', val: stats.totalProducts || 0, total: `${stats.lowStockProducts || 0} low stock`, icon: FiBox, color: 'text-amber-400 bg-amber-500/10' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{c.title}</span>
                <div className={`p-2.5 rounded-xl ${c.color}`}>
                  <c.icon size={18} />
                </div>
              </div>
              <p className="text-2xl font-black text-white">{c.val}</p>
              <p className="text-xs text-gray-500 mt-1">{c.total}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Sales Analytics (7 Days)</h3>
            <div className="h-64">
              {stats.salesData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.salesData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                    <YAxis stroke="#94A3B8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#FFF' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#16A34A" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">No sales data recorded yet</div>
              )}
            </div>
          </div>

          {/* Low stock alert box */}
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4 text-amber-400">
              <FiAlertTriangle size={18} />
              <h3 className="font-bold text-white">Stock Warnings</h3>
            </div>
            <p className="text-gray-400 text-xs mb-4">Items with stock count under threshold (10 units):</p>
            <div className="space-y-3">
              {stats.lowStockProducts > 0 ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-center justify-between">
                  <span>{stats.lowStockProducts} products require restocking</span>
                  <Link to="/admin/products" className="underline font-bold">View</Link>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">All products are sufficiently stocked.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary font-semibold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="border-b border-dark-border text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-white font-bold">#{o.order_number}</td>
                    <td className="py-3 px-4">{o.user?.name || 'Guest'}</td>
                    <td className="py-3 px-4">
                      <span className={`status-${o.status} text-[10px]`}>{o.status}</span>
                    </td>
                    <td className="py-3 px-4 uppercase">{o.payment_method}</td>
                    <td className="py-3 px-4 text-white font-bold">₹{o.grand_total}</td>
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

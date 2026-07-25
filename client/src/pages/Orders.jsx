import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiTruck, FiChevronRight, FiClock } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { format } from 'date-fns';

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: () => orderAPI.getMyOrders().then(r => r.data),
  });

  const orders = data?.data || [];

  if (isLoading) {
    return (
      <div className="section-container py-10 space-y-4">
        <div className="skeleton h-8 w-40 rounded" />
        {[1, 2, 3].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="section-container py-8 min-h-[60vh]">
      <h1 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
        <FiPackage className="text-primary" /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4"><FiPackage size={56} className="mx-auto text-gray-300" /></div>
          <h2 className="text-xl font-bold dark:text-white mb-2">No orders placed yet</h2>
          <p className="text-gray-500 text-sm mb-6">Looks like you haven't bought anything from FreshBasket yet.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {orders.map(order => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-5 hover:shadow-card-hover transition-all">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-dark-border">
                <div>
                  <span className="text-xs text-gray-400">Order ID</span>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">#{order.order_number}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Date</span>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Status</span>
                  <div>
                    <span className={`status-${order.status} capitalize text-xs`}>{order.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Total</span>
                  <p className="font-bold text-sm text-primary">₹{order.grand_total}</p>
                </div>
              </div>

              {/* Items summary */}
              <div className="py-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {order.items?.slice(0, 4).map((item, idx) => (
                      <img key={idx} src={item.product_image || 'https://via.placeholder.com/40'} alt={item.product_name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-dark-card" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <Link to={`/orders/${order.id}`} className="btn-outline text-xs py-2 px-4 flex items-center gap-1">
                  Track / Details <FiChevronRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

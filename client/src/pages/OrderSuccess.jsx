import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiArrowRight, FiDownload, FiCheck } from 'react-icons/fi';

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="card p-10 max-w-md w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          className="w-24 h-24 bg-gradient-fresh rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
          <FiCheck size={40} className="text-white" />
        </motion.div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Order Placed!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Your order has been confirmed and will be delivered soon.</p>
        {order && (
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-5 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Order ID</span><span className="font-bold text-primary">#{order.order_number}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Total</span><span className="font-bold dark:text-white">₹{order.grand_total}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span className="font-bold text-primary">20-30 min</span></div>
          </div>
        )}
        <div className="space-y-3">
          <Link to={`/orders/${order?.order_id}`} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            <FiPackage size={16} /> Track Order
          </Link>
          <button onClick={() => navigate('/')} className="btn-outline w-full py-3 flex items-center justify-center gap-2">
            Continue Shopping <FiArrowRight size={16} />
          </button>
        </div>
        <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm text-green-700 dark:text-green-400">
          Your delivery partner is on the way!
        </div>
      </motion.div>
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiCheck, FiClock, FiPackage, FiTruck, FiMapPin, FiPhone, FiDownload, FiUser } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const statusSteps = ['Order Placed', 'Preparing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
const statusIcon = [FiCheck, FiPackage, FiPackage, FiTruck, FiTruck, FiMapPin];

export default function TrackOrder() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderAPI.getById(id).then(r => r.data.data),
    refetchInterval: 30000,
  });

  const order = data;
  const delivery = order?.delivery;
  const trackingSteps = delivery?.tracking_steps || statusSteps.map(s => ({ step: s, status: 'pending', time: null }));

  const downloadInvoice = async () => {
    const el = document.getElementById('invoice-content');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2 });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgData = canvas.toDataURL('image/png');
    const ratio = canvas.width / canvas.height;
    const pdfWidth = 190;
    pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfWidth / ratio);
    pdf.save(`Invoice-${order.order_number}.pdf`);
  };

  if (isLoading) return (
    <div className="section-container py-12">
      <div className="animate-pulse space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    </div>
  );

  if (!order) return <div className="section-container py-20 text-center"><p className="text-gray-500">Order not found.</p></div>;

  const currentStepIdx = statusSteps.findIndex(s => s === trackingSteps.find(t => t.status === 'current')?.step);

  return (
    <div className="section-container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Track Order</h1>
          <p className="text-gray-500 dark:text-gray-400">#{order.order_number}</p>
        </div>
        <button onClick={downloadInvoice} className="btn-outline text-sm flex items-center gap-2">
          <FiDownload size={15} />Download Invoice
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking timeline */}
          <div className="card p-6">
            <h2 className="font-bold text-lg dark:text-white mb-6 flex items-center gap-2">
              <FiTruck className="text-primary" />Delivery Status
            </h2>
            <div className="space-y-0">
              {trackingSteps.map((step, i) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                const Icon = statusIcon[i] || FiCheck;
                return (
                  <div key={i} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{ scale: isCurrent ? [1, 1.2, 1] : 1 }}
                        transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all
                          ${isCompleted ? 'bg-primary border-primary text-white' : isCurrent ? 'bg-primary-100 border-primary text-primary dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-dark-border border-gray-200 dark:border-dark-border text-gray-400'}`}>
                        {isCompleted ? <FiCheck size={16} /> : <Icon size={16} />}
                      </motion.div>
                      {i < trackingSteps.length - 1 && (
                        <div className={`w-0.5 h-12 -mt-0 transition-colors ${isCompleted ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-border'}`} />
                      )}
                    </div>
                    <div className="pb-10 pt-1.5">
                      <p className={`font-semibold text-sm ${isCompleted || isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.step}</p>
                      {step.time && <p className="text-xs text-gray-500 mt-0.5">{format(new Date(step.time), 'dd MMM, hh:mm a')}</p>}
                      {isCurrent && <span className="text-xs text-primary font-medium bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full mt-1 inline-block">In Progress</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery agent */}
          {delivery?.agent_name && (
            <div className="card p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-primary">
                <FiUser size={24} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">Your delivery partner</p>
                <p className="font-bold text-gray-900 dark:text-white">{delivery.agent_name}</p>
                <p className="text-sm text-gray-500">{delivery.agent_phone}</p>
              </div>
              <a href={`tel:${delivery.agent_phone}`} className="btn-outline text-sm flex items-center gap-2 py-2">
                <FiPhone size={14} />Call
              </a>
            </div>
          )}

          {/* Order items */}
          <div className="card p-6" id="invoice-content">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-bold text-lg dark:text-white">Invoice</h2>
                {order.invoice && <p className="text-xs text-gray-500">{order.invoice.invoice_number}</p>}
              </div>
              <div className="text-right text-xs text-gray-500">
                <p className="font-bold text-gray-900 dark:text-white">FreshBasket</p>
                <p>GSTIN: 27FRESHBASKET0000A1Z5</p>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-dark-border">
                  <img src={item.product_image || item.product?.thumbnail || ''} alt={item.product_name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm dark:text-white">{item.product_name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.unit_price}</p>
                  </div>
                  <span className="font-bold text-sm dark:text-white">₹{parseFloat(item.total).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 text-sm">
              {[['Subtotal', `₹${parseFloat(order.subtotal).toFixed(0)}`], ['Delivery', order.delivery_fee == 0 ? 'FREE' : `₹${order.delivery_fee}`], ['GST (5%)', `₹${parseFloat(order.tax).toFixed(0)}`]].map(([l, v]) => (
                <div key={l} className="flex justify-between text-gray-500 dark:text-gray-400"><span>{l}</span><span>{v}</span></div>
              ))}
              {order.coupon_discount > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span>-₹{parseFloat(order.coupon_discount).toFixed(0)}</span></div>}
              <div className="flex justify-between font-bold text-base dark:text-white border-t border-gray-100 dark:border-dark-border pt-2 mt-2">
                <span>Total Paid</span><span className="text-primary text-lg">₹{parseFloat(order.grand_total).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Delivery Address</h3>
            {order.address && (
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p className="font-semibold dark:text-white">{order.address.name}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
              </div>
            )}
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Payment Info</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex justify-between"><span>Method</span><span className="font-medium dark:text-white">{order.payment_method?.toUpperCase()}</span></div>
              <div className="flex justify-between"><span>Status</span>
                <span className={`font-medium ${order.payment?.status === 'success' ? 'text-primary' : order.payment?.status === 'pending' ? 'text-orange-500' : 'text-gray-500'}`}>
                  {order.payment?.status || 'Pending'}
                </span>
              </div>
              {order.payment?.transaction_id && <div className="flex justify-between"><span>Txn ID</span><span className="text-xs font-mono">{order.payment.transaction_id}</span></div>}
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Order Info</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex justify-between"><span>Placed</span><span>{order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '-'}</span></div>
              <div className="flex justify-between"><span>Status</span><span className={`status-${order.status} text-xs`}>{order.status}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

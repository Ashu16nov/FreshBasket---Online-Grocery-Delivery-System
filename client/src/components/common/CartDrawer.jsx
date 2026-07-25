import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag, FiShoppingCart } from 'react-icons/fi';
import { closeCart, updateItem, removeItem } from '../../store/cartSlice';
import { cartAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, isOpen, coupon } = useSelector(s => s.cart);
  const { isAuthenticated } = useSelector(s => s.auth);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.product?.price || 0) * i.quantity), 0);
  const deliveryFee = subtotal > 149 ? 0 : 25;
  const tax = subtotal * 0.05;
  let couponDiscount = 0;
  if (coupon) {
    couponDiscount = coupon.discount_type === 'percentage'
      ? Math.min((subtotal * coupon.discount_value) / 100, coupon.max_discount || Infinity)
      : coupon.discount_value;
  }
  const grandTotal = subtotal + deliveryFee + tax - couponDiscount;

  const handleQty = async (productId, qty) => {
    try {
      await cartAPI.update({ product_id: productId, quantity: qty });
      dispatch(updateItem({ product_id: productId, quantity: qty }));
    } catch (err) { toast.error('Failed to update cart'); }
  };

  const handleRemove = async (productId) => {
    try {
      await cartAPI.remove(productId);
      dispatch(removeItem(productId));
      toast.success('Item removed');
    } catch { toast.error('Failed to remove item'); }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await cartAPI.applyCoupon(couponCode);
      dispatch({ type: 'cart/setCoupon', payload: data.data });
      toast.success('Coupon applied!');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); }
    finally { setCouponLoading(false); }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) { navigate('/login'); dispatch(closeCart()); return; }
    navigate('/checkout');
    dispatch(closeCart());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => dispatch(closeCart())} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-dark-card z-50 flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-border">
              <div className="flex items-center gap-3">
                <FiShoppingBag size={22} className="text-primary" />
                <h2 className="font-bold text-lg dark:text-white">My Cart</h2>
                <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {items.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>
              <button onClick={() => dispatch(closeCart())} className="btn-icon">
                <FiX size={20} className="dark:text-white" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="text-7xl"><FiShoppingCart size={64} className="text-gray-300" /></div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300 text-lg">Your cart is empty</p>
                  <p className="text-gray-500 text-sm">Add some fresh products to get started!</p>
                  <button onClick={() => { navigate('/products'); dispatch(closeCart()); }}
                    className="btn-primary mt-2">Start Shopping</button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div key={item.product_id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-dark-bg hover:shadow-card transition-shadow">
                    <img
                      src={item.product?.thumbnail || 'https://via.placeholder.com/80'}
                      alt={item.product?.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{item.product?.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.product?.weight}</p>
                      <p className="text-primary font-bold mt-1">₹{item.product?.price}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleQty(item.product_id, item.quantity - 1)} className="quantity-btn">
                            <FiMinus size={12} />
                          </button>
                          <span className="text-sm font-bold w-5 text-center dark:text-white">{item.quantity}</span>
                          <button onClick={() => handleQty(item.product_id, item.quantity + 1)} className="quantity-btn">
                            <FiPlus size={12} />
                          </button>
                        </div>
                        <button onClick={() => handleRemove(item.product_id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-dark-border p-5 space-y-4">
                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg focus:ring-2 focus:ring-primary-200 outline-none dark:text-white"
                    />
                  </div>
                  <button onClick={handleApplyCoupon} disabled={couponLoading}
                    className="btn-outline text-sm py-2.5 px-4 whitespace-nowrap">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {coupon && (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2 text-sm">
                    <span className="text-green-700 dark:text-green-400 font-medium">{coupon.code} applied!</span>
                    <span className="text-green-600 font-bold">-₹{couponDiscount.toFixed(0)}</span>
                  </div>
                )}

                {/* Price breakdown */}
                <div className="space-y-2 text-sm">
                  {[
                    ['Subtotal', `₹${subtotal.toFixed(0)}`],
                    ['Delivery', deliveryFee === 0 ? <span className="text-primary font-semibold">FREE</span> : `₹${deliveryFee}`],
                    ['GST (5%)', `₹${tax.toFixed(0)}`],
                    ...(coupon ? [['Discount', <span className="text-primary">-₹{couponDiscount.toFixed(0)}</span>]] : []),
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>{label}</span><span>{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100 dark:border-dark-border dark:text-white">
                    <span>Grand Total</span><span className="text-primary">₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>

                <button onClick={handleCheckout} className="btn-primary w-full py-3.5 text-base font-semibold">
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

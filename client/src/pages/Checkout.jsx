import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiPlus, FiCreditCard, FiSmartphone, FiDollarSign, FiCheck, FiTruck, FiShoppingCart } from 'react-icons/fi';
import { userAPI, orderAPI } from '../services/api';
import { clearCart } from '../store/cartSlice';
import toast from 'react-hot-toast';

const steps = ['Delivery Address', 'Payment', 'Review Order'];

const paymentMethods = [
  { id: 'cod', icon: FiDollarSign, label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
  { id: 'upi', icon: FiSmartphone, label: 'UPI Payment', desc: 'GooglePay, PhonePe, Paytm' },
  { id: 'card', icon: FiCreditCard, label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Rupay' },
  { id: 'netbanking', icon: FiTruck, label: 'Net Banking', desc: 'All major banks supported' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, coupon } = useSelector(s => s.cart);
  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [showAddForm, setShowAddForm] = useState(false);
  const [placing, setPlacing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { data: profileData, refetch } = useQuery({ queryKey: ['profile'], queryFn: () => userAPI.getProfile().then(r => r.data.data) });
  const addresses = profileData?.addresses || [];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find(a => a.is_default) || addresses[0];
      setSelectedAddress(def.id);
    }
  }, [addresses, selectedAddress]);

  const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.product?.price || 0) * i.quantity), 0);
  const deliveryFee = subtotal > 149 ? 0 : 25;
  const tax = subtotal * 0.05;
  let couponDiscount = 0;
  if (coupon) couponDiscount = coupon.discount_type === 'percentage'
    ? Math.min((subtotal * coupon.discount_value) / 100, coupon.max_discount || Infinity) : coupon.discount_value;
  const grandTotal = subtotal + deliveryFee + tax - couponDiscount;

  const handleAddAddress = async (data) => {
    try {
      const { data: res } = await userAPI.addAddress(data);
      setSelectedAddress(res.data.id);
      setShowAddForm(false);
      refetch();
      toast.success('Address added!');
    } catch { toast.error('Failed to add address'); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); setStep(0); return; }
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const { data } = await orderAPI.place({ address_id: selectedAddress, payment_method: selectedPayment });
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate(`/order-success/${data.data.order_id}`, { state: { order: data.data } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  if (items.length === 0) {
    return (
      <div className="section-container py-20 text-center">
        <div className="text-7xl mb-4"><FiShoppingCart size={64} className="mx-auto text-gray-300" /></div>
        <h2 className="text-2xl font-bold dark:text-white mb-2">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn-primary mt-4">Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="section-container py-8">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: i === step ? 1.1 : 1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                  ${i < step ? 'bg-primary border-primary text-white' : i === step ? 'bg-primary border-primary text-white shadow-glow' : 'border-gray-300 dark:border-dark-border text-gray-400'}`}>
                {i < step ? <FiCheck size={16} /> : i + 1}
              </motion.div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${i === step ? 'text-primary' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-colors ${i < step ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-border'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Step 0: Address */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="font-bold text-lg dark:text-white mb-5 flex items-center gap-2">
                <FiMapPin className="text-primary" /> Delivery Address
              </h2>
              <div className="space-y-3 mb-5">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-primary bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-border hover:border-primary-300'}`}>
                    <input type="radio" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1 accent-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm dark:text-white">{addr.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400">{addr.label}</span>
                        {addr.is_default && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary dark:bg-primary-900/30">Default</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{addr.phone}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{addr.street}, {addr.landmark && `${addr.landmark}, `}{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </label>
                ))}
              </div>
              <button onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 text-primary font-semibold text-sm hover:underline mb-4">
                <FiPlus size={16} />{showAddForm ? 'Cancel' : 'Add New Address'}
              </button>
              {showAddForm && (
                <form onSubmit={handleSubmit(handleAddAddress)} className="space-y-4 border border-gray-200 dark:border-dark-border rounded-2xl p-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[{ f: 'name', p: 'Full Name', r: true }, { f: 'phone', p: 'Phone Number', r: true }].map(({ f, p, r }) => (
                      <div key={f}>
                        <input {...register(f, r ? { required: `${p} required` } : {})} placeholder={p} className={`input-field text-sm ${errors[f] ? 'border-red-400' : ''}`} />
                        {errors[f] && <p className="text-red-500 text-xs mt-1">{errors[f].message}</p>}
                      </div>
                    ))}
                  </div>
                  <input {...register('street', { required: 'Street required' })} placeholder="Street address" className={`input-field text-sm w-full ${errors.street ? 'border-red-400' : ''}`} />
                  <input {...register('landmark')} placeholder="Landmark (optional)" className="input-field text-sm w-full" />
                  <div className="grid grid-cols-3 gap-3">
                    {[{ f: 'city', p: 'City' }, { f: 'state', p: 'State' }, { f: 'pincode', p: 'Pincode' }].map(({ f, p }) => (
                      <input key={f} {...register(f, { required: true })} placeholder={p} className="input-field text-sm" />
                    ))}
                  </div>
                  <select {...register('label')} className="input-field text-sm w-auto">
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                  <button type="submit" className="btn-primary text-sm py-2.5">Save Address</button>
                </form>
              )}
              <button onClick={() => { if (!selectedAddress) { toast.error('Select an address'); return; } setStep(1); }}
                className="btn-primary w-full py-3.5 mt-4">Continue to Payment →</button>
            </motion.div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
              <h2 className="font-bold text-lg dark:text-white mb-5 flex items-center gap-2">
                <FiCreditCard className="text-primary" /> Payment Method
              </h2>
              <div className="space-y-3">
                {paymentMethods.map(pm => (
                  <label key={pm.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedPayment === pm.id ? 'border-primary bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-border hover:border-primary-300'}`}>
                    <input type="radio" value={pm.id} checked={selectedPayment === pm.id} onChange={() => setSelectedPayment(pm.id)} className="accent-primary" />
                    <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                      <pm.icon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm dark:text-white">{pm.label}</p>
                      <p className="text-xs text-gray-500">{pm.desc}</p>
                    </div>
                    {selectedPayment === pm.id && <FiCheck size={18} className="text-primary ml-auto" />}
                  </label>
                ))}
              </div>
              {selectedPayment !== 'cod' && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-sm text-blue-700 dark:text-blue-400">
                  ℹ️ This is a demo app. Payment will be simulated successfully.
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(0)} className="btn-outline flex-1 py-3">← Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3">Review Order →</button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 space-y-5">
              <h2 className="font-bold text-lg dark:text-white">Order Review</h2>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.product_id} className="flex gap-3 items-center py-3 border-b border-gray-100 dark:border-dark-border">
                    <img src={item.product?.thumbnail || ''} alt={item.product?.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-sm dark:text-white">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">{item.product?.weight} × {item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm dark:text-white">₹{(parseFloat(item.product?.price || 0) * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-primary' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                <div className="flex justify-between"><span>GST (5%)</span><span>₹{tax.toFixed(0)}</span></div>
                {coupon && <div className="flex justify-between text-primary"><span>Coupon ({coupon.code})</span><span>-₹{couponDiscount.toFixed(0)}</span></div>}
                <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-dark-border">
                  <span>Grand Total</span><span className="text-primary text-lg">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-outline flex-1 py-3">← Back</button>
                <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                  {placing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Place Order'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {items.slice(0, 3).map(item => (
                <div key={item.product_id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <img src={item.product?.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  <span className="flex-1 truncate">{item.product?.name}</span>
                  <span className="font-medium dark:text-white">×{item.quantity}</span>
                </div>
              ))}
              {items.length > 3 && <p className="text-xs text-gray-400">+{items.length - 3} more items</p>}
            </div>
            <div className="border-t border-gray-100 dark:border-dark-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Items ({items.length})</span><span>₹{subtotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-primary' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
              <div className="flex justify-between font-bold text-base dark:text-white pt-2 border-t border-gray-100 dark:border-dark-border">
                <span>Total</span><span className="text-primary">₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-xs text-green-700 dark:text-green-400">
              Estimated delivery: <strong>20-30 minutes</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

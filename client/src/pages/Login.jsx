import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShoppingCart } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { authAPI } from '../services/api';
import { setCredentials } from '../store/authSlice';
import toast from 'react-hot-toast';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const onSubmit = async (data) => {
    try {
      const { data: res } = await authAPI.login(data);
      dispatch(setCredentials(res));
      toast.success(`Welcome back, ${res.user.name.split(' ')[0]}!`);
      navigate(res.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-700 via-primary to-emerald-400 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'5\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="text-white text-center z-10">
          <div className="text-8xl mb-6"><FiShoppingCart size={80} className="mx-auto" /></div>
          <h1 className="text-4xl font-black mb-4">Welcome to FreshBasket</h1>
          <p className="text-white/80 text-lg max-w-sm">Fresh groceries delivered to your doorstep in minutes!</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {['10 Min Delivery', '100% Fresh', 'Secure Checkout', 'Best Prices'].map(f => (
              <div key={f} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-sm font-medium">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-dark-bg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-fresh rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <span className="font-black text-2xl text-primary dark:text-primary-400">Fresh<span className="text-accent">Basket</span></span>
          </Link>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Sign In</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Welcome back! Please enter your credentials.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  type="email" placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400 focus:ring-red-200' : ''}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400 focus:ring-red-200' : ''}`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary font-medium hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
            </button>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-dark-border" />
            </div>

            <button type="button" onClick={() => toast('Google login coming soon! Use email instead.')}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-dark-border rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
              <FcGoogle size={20} />Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">Create Account</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-primary mb-2">Demo Credentials:</p>
            <p className="text-gray-600 dark:text-gray-400">Admin: <span className="font-mono font-semibold">admin@freshbasket.com</span> / <span className="font-mono font-semibold">admin123</span></p>
            <p className="text-gray-600 dark:text-gray-400">Customer: <span className="font-mono font-semibold">customer@freshbasket.com</span> / <span className="font-mono font-semibold">customer123</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

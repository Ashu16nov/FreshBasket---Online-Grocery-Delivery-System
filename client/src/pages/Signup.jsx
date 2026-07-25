import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiEye, FiEyeOff, FiCamera } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { authAPI } from '../services/api';
import { setCredentials } from '../store/authSlice';
import toast from 'react-hot-toast';

const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
  if (score === 2) return { level: 2, label: 'Fair', color: 'bg-orange-400' };
  if (score === 3) return { level: 3, label: 'Good', color: 'bg-yellow-400' };
  return { level: 4, label: 'Strong', color: 'bg-primary' };
};

export default function Signup() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const password = watch('password', '');
  const strength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    if (data.password !== data.confirm_password) {
      toast.error('Passwords do not match!'); return;
    }
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (k !== 'confirm_password') formData.append(k, v); });
      if (avatar) formData.append('profile_image', avatar);
      const { data: res } = await authAPI.register(formData);
      dispatch(setCredentials(res));
      toast.success('Account created successfully!');
      navigate(res.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="card p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-fresh rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">F</span>
              </div>
              <span className="font-black text-2xl text-primary dark:text-primary-400">Fresh<span className="text-accent">Basket</span></span>
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Account</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Join 50,000+ happy customers</p>
          </div>

          {/* Avatar upload */}
          <div className="flex justify-center mb-6">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-dark-border overflow-hidden ring-4 ring-primary-200 group-hover:ring-primary transition-all">
                {avatar ? (
                  <img src={URL.createObjectURL(avatar)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiUser size={32} />
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <FiCamera size={12} className="text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={e => setAvatar(e.target.files[0])} />
            </label>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name + Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Full Name *</label>
                <div className="relative">
                  <FiUser className="form-icon" size={15} />
                  <input {...register('name', { required: 'Name required' })} placeholder="Mr. Ashu" className={`input-field pl-9 ${errors.name ? 'border-red-400' : ''}`} />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="form-label">Email *</label>
                <div className="relative">
                  <FiMail className="form-icon" size={15} />
                  <input {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                    type="email" placeholder="mranonymos16nov@gmail.com" className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            {/* Phone + Gender */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Phone</label>
                <div className="relative">
                  <FiPhone className="form-icon" size={15} />
                  <input {...register('phone')} placeholder="+91 98765 43210" className="input-field pl-9" />
                </div>
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select {...register('gender')} className="input-field">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password *</label>
              <div className="relative">
                <FiLock className="form-icon" size={15} />
                <input {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type={showPw ? 'text' : 'password'} placeholder="Create a strong password"
                  className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-400' : ''}`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(l => (
                      <div key={l} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${l <= strength.level ? strength.color : 'bg-gray-200 dark:bg-dark-border'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.level >= 3 ? 'text-primary' : strength.level === 2 ? 'text-orange-500' : 'text-red-500'}`}>
                    Password strength: {strength.label}
                  </p>
                </div>
              )}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">Confirm Password *</label>
              <div className="relative">
                <FiLock className="form-icon" size={15} />
                <input {...register('confirm_password', { required: 'Please confirm your password' })}
                  type="password" placeholder="Repeat password"
                  className={`input-field pl-9 ${errors.confirm_password ? 'border-red-400' : ''}`} />
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            {/* Address */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">City</label>
                <input {...register('city')} placeholder="Khara" className="input-field" />
              </div>
              <div>
                <label className="form-label">State</label>
                <input {...register('state')} placeholder="Punjab" className="input-field" />
              </div>
              <div>
                <label className="form-label">Pincode</label>
                <input {...register('pincode')} placeholder="141001" className="input-field" />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="form-label">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ val: 'customer', e: 'C', t: 'Customer', d: 'Shop and order groceries' }, { val: 'admin', e: 'A', t: 'Admin', d: 'Manage products & orders' }].map(r => (
                  <label key={r.val} className="cursor-pointer">
                    <input type="radio" {...register('role')} value={r.val} defaultChecked={r.val === 'customer'} className="sr-only peer" />
                    <div className="border-2 border-gray-200 dark:border-dark-border peer-checked:border-primary peer-checked:bg-primary-50 dark:peer-checked:bg-primary-900/20 rounded-2xl p-4 transition-all">
                      <p className="text-2xl mb-1">{r.e}</p>
                      <p className="font-semibold text-sm dark:text-white">{r.t}</p>
                      <p className="text-xs text-gray-500">{r.d}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
              {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
            </button>

            <button type="button" onClick={() => toast('Google signup coming soon!')}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-dark-border rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-card transition-colors">
              <FcGoogle size={20} />Sign up with Google
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>

      <style>{`.form-label { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5; } .form-icon { @apply absolute left-3 top-1/2 -translate-y-1/2 text-gray-400; }`}</style>
    </div>
  );
}

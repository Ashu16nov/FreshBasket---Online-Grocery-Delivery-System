import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FiUser, FiMapPin, FiLock, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { userAPI } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../store/authSlice';
import toast from 'react-hot-toast';

export default function Profile() {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [showAddressModal, setShowAddressModal] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => userAPI.getProfile().then(r => r.data.data),
  });

  const { register: regProfile, handleSubmit: handleProfileSubmit } = useForm({
    values: profile || {},
  });

  const { register: regPw, handleSubmit: handlePwSubmit, reset: resetPw } = useForm();
  const { register: regAddr, handleSubmit: handleAddrSubmit, reset: resetAddr } = useForm();

  const onUpdateProfile = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v !== null && v !== undefined) formData.append(k, v); });
      const { data: res } = await userAPI.updateProfile(formData);
      dispatch(updateUser(res.data));
      toast.success('Profile updated!');
      refetch();
    } catch { toast.error('Failed to update profile'); }
  };

  const onChangePassword = async (data) => {
    try {
      await userAPI.changePassword(data);
      toast.success('Password changed!');
      resetPw();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
  };

  const onAddAddress = async (data) => {
    try {
      await userAPI.addAddress(data);
      toast.success('Address added!');
      setShowAddressModal(false);
      resetAddr();
      refetch();
    } catch { toast.error('Failed to add address'); }
  };

  const onDeleteAddress = async (id) => {
    try {
      await userAPI.deleteAddress(id);
      toast.success('Address removed');
      refetch();
    } catch { toast.error('Failed to delete address'); }
  };

  const addresses = profile?.addresses || [];

  return (
    <div className="section-container py-8 min-h-[65vh]">
      <h1 className="text-2xl font-bold dark:text-white mb-6">Account Settings</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="card p-3 space-y-1 h-fit">
          {[
            { id: 'profile', icon: FiUser, label: 'My Profile' },
            { id: 'addresses', icon: FiMapPin, label: 'Saved Addresses' },
            { id: 'password', icon: FiLock, label: 'Security' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-glow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border'}`}>
              <tab.icon size={17} />{tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="text-lg font-bold dark:text-white mb-4">Personal Details</h2>
              <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                  <input {...regProfile('name')} className="input-field" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                    <input {...regProfile('email')} disabled className="input-field opacity-60 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                    <input {...regProfile('phone')} className="input-field" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">City</label>
                    <input {...regProfile('city')} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">State</label>
                    <input {...regProfile('state')} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Pincode</label>
                    <input {...regProfile('pincode')} className="input-field" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold dark:text-white">Saved Addresses</h2>
                <button onClick={() => setShowAddressModal(true)} className="btn-primary text-xs py-2 px-3 flex items-center gap-1">
                  <FiPlus size={14} /> Add Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <p className="text-gray-500 text-sm py-4">No saved addresses yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="border border-gray-200 dark:border-dark-border rounded-2xl p-4 relative">
                      <span className="bg-primary-50 dark:bg-primary-900/30 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                        {addr.label}
                      </span>
                      <p className="font-semibold text-sm dark:text-white mt-2">{addr.name}</p>
                      <p className="text-xs text-gray-500">{addr.phone}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <button onClick={() => onDeleteAddress(addr.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Address Modal */}
              {showAddressModal && (
                <form onSubmit={handleAddrSubmit(onAddAddress)} className="mt-6 border-t border-gray-100 dark:border-dark-border pt-4 space-y-3 max-w-lg">
                  <h3 className="font-bold text-sm dark:text-white">New Address</h3>
                  <input {...regAddr('name', { required: true })} placeholder="Receiver Name" className="input-field text-sm" />
                  <input {...regAddr('phone', { required: true })} placeholder="Phone Number" className="input-field text-sm" />
                  <input {...regAddr('street', { required: true })} placeholder="Street & Landmark" className="input-field text-sm" />
                  <div className="grid grid-cols-3 gap-2">
                    <input {...regAddr('city', { required: true })} placeholder="City" className="input-field text-sm" />
                    <input {...regAddr('state', { required: true })} placeholder="State" className="input-field text-sm" />
                    <input {...regAddr('pincode', { required: true })} placeholder="Pincode" className="input-field text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary text-xs">Save</button>
                    <button type="button" onClick={() => setShowAddressModal(false)} className="btn-ghost text-xs">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card p-6 max-w-md">
              <h2 className="text-lg font-bold dark:text-white mb-4">Change Password</h2>
              <form onSubmit={handlePwSubmit(onChangePassword)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Current Password</label>
                  <input {...regPw('current_password', { required: true })} type="password" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">New Password</label>
                  <input {...regPw('new_password', { required: true, minLength: 6 })} type="password" className="input-field" />
                </div>
                <button type="submit" className="btn-primary">Update Password</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

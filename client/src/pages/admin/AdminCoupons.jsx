import { useState } from 'react';
import { FiTag, FiPlus } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';

const demoCoupons = [
  { code: 'FRESH10', desc: '10% off first order', type: 'percentage', val: '10%', minOrder: '₹200' },
  { code: 'SAVE50', desc: '₹50 off on ₹499+', type: 'flat', val: '₹50', minOrder: '₹499' },
  { code: 'WELCOME20', desc: '20% off for new users', type: 'percentage', val: '20%', minOrder: '₹300' },
];

export default function AdminCoupons() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold">Coupons & Promotions</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoCoupons.map(c => (
            <div key={c.code} className="bg-dark-card border border-dark-border rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-primary text-base bg-primary/10 px-3 py-1 rounded-xl">
                  {c.code}
                </span>
                <span className="text-xs text-gray-400 capitalize">{c.type}</span>
              </div>
              <p className="text-sm font-semibold text-white">{c.desc}</p>
              <p className="text-xs text-gray-500">Min Order: {c.minOrder}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

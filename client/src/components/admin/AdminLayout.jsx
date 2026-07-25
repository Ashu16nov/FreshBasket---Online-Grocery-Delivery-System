import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiBox, FiGrid, FiShoppingBag, FiUsers, FiBarChart2,
  FiTag, FiSettings, FiLogOut, FiMenu, FiX, FiBell,
} from 'react-icons/fi';
import { logout } from '../../store/authSlice';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: FiBox, label: 'Products' },
  { to: '/admin/categories', icon: FiGrid, label: 'Categories' },
  { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/customers', icon: FiUsers, label: 'Customers' },
  { to: '/admin/coupons', icon: FiTag, label: 'Coupons' },
  { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    navigate('/login');
  };

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-dark-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-fresh rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">F</span>
          </div>
          <div>
            <p className="font-black text-white text-lg leading-tight">FreshBasket</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${isActive(to, exact) ? 'bg-primary text-white shadow-glow' : 'text-gray-400 hover:bg-dark-card hover:text-white'}`}>
            <Icon size={18} />{label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-border">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-dark-card hover:text-white transition-all mb-1">
          <FiHome size={18} />Back to Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-900/20 transition-all">
          <FiLogOut size={18} />Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-dark-bg border-r border-dark-border fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-64 bg-dark-bg border-r border-dark-border z-50 lg:hidden">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-dark-bg border-b border-dark-border px-6 py-4 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-1">
            <FiMenu size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg capitalize">
              {navItems.find(n => isActive(n.to, n.exact))?.label || 'Dashboard'}
            </h1>
          </div>
          <button className="p-2 rounded-xl hover:bg-dark-card text-gray-400 hover:text-white transition-colors relative">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </button>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

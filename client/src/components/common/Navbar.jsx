import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart, FiHeart, FiSearch, FiUser, FiSun, FiMoon,
  FiMenu, FiX, FiBell, FiMapPin, FiChevronDown, FiLogOut,
  FiPackage, FiSettings, FiGrid,
} from 'react-icons/fi';
import { toggleDarkMode } from '../../store/uiSlice';
import { logout } from '../../store/authSlice';
import { openCart } from '../../store/cartSlice';
import { productAPI } from '../../services/api';
import toast from 'react-hot-toast';

const categories = [
  { name: 'Fruits', slug: 'fruits', icon: 'Fr' }, { name: 'Vegetables', slug: 'vegetables', icon: 'Vg' },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: 'Dy' }, { name: 'Bakery', slug: 'bakery', icon: 'Bk' },
  { name: 'Snacks', slug: 'snacks', icon: 'Sn' }, { name: 'Beverages', slug: 'beverages', icon: 'Bv' },
  { name: 'Grocery', slug: 'grocery', icon: 'Gr' }, { name: 'Household', slug: 'household', icon: 'Hh' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useSelector(s => s.ui);
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const { productIds: wishlistIds } = useSelector(s => s.wishlist);

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const { data } = await productAPI.search(searchQuery);
          setSuggestions(data.data || []);
          setShowSuggestions(true);
        } catch { setSuggestions([]); }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleLogout = async () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-md' : 'bg-white dark:bg-dark-bg'}`}>
      {/* Top bar */}
      <div className="bg-primary dark:bg-primary-700 text-white text-xs py-1.5 text-center hidden sm:block">
        Free delivery on orders above <span className="font-bold">₹149</span> | Use code <span className="font-bold">FRESH10</span> for 10% off!
      </div>

      {/* Main navbar */}
      <nav className="section-container py-3">
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-gradient-fresh rounded-xl flex items-center justify-center shadow-glow">
              <span className="text-white font-black text-lg">F</span>
            </div>
            <span className="font-black text-xl text-primary dark:text-primary-400 hidden sm:block">
              Fresh<span className="text-accent">Basket</span>
            </span>
          </Link>

          {/* Location */}
          <button className="hidden lg:flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors shrink-0">
            <FiMapPin className="text-primary" size={15} />
            <span className="font-medium">Khara, Punjab</span>
            <FiChevronDown size={14} />
          </button>

          {/* Search */}
          <div ref={searchRef} className="flex-1 relative max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                placeholder="Search for groceries, fruits, vegetables..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-dark-card rounded-xl text-sm border border-transparent focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none transition-all dark:text-white dark:placeholder-gray-500"
              />
            </form>
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full mt-2 w-full bg-white dark:bg-dark-card rounded-2xl shadow-card-hover border border-gray-100 dark:border-dark-border overflow-hidden z-50"
                >
                  {suggestions.map((p) => (
                    <button key={p.id} onClick={() => { navigate(`/products/${p.id}`); setShowSuggestions(false); setSearchQuery(''); }}
                      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-border transition-colors text-left">
                      <img src={p.thumbnail || 'https://via.placeholder.com/40'} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-primary font-semibold">₹{p.price}</p>
                      </div>
                    </button>
                  ))}
                  <button onClick={handleSearch} className="w-full px-4 py-3 text-sm text-primary font-semibold text-center border-t border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border">
                    See all results for "{searchQuery}"
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav links — desktop */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <button className="flex items-center gap-1 nav-link px-3 py-2">
                <FiGrid size={15} /> Categories <FiChevronDown size={13} />
              </button>
              <AnimatePresence>
                {catOpen && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 w-64 bg-white dark:bg-dark-card rounded-2xl shadow-card-hover border border-gray-100 dark:border-dark-border p-3 grid grid-cols-2 gap-1">
                    {categories.map(c => (
                      <Link key={c.slug} to={`/products?category=${c.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                        <span>{c.icon}</span>{c.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/products?flash_sale=true" className="nav-link px-3 py-2">Offers</Link>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            {/* Dark mode */}
            <button onClick={() => dispatch(toggleDarkMode())} className="btn-icon hidden sm:flex">
              {isDarkMode ? <FiSun size={18} className="text-secondary" /> : <FiMoon size={18} className="text-gray-600" />}
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/wishlist" className="btn-icon relative hidden sm:flex">
                <FiHeart size={18} className="text-gray-600 dark:text-gray-300" />
                {wishlistIds.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart */}
            <button onClick={() => dispatch(openCart())} className="btn-icon relative">
              <FiShoppingCart size={18} className="text-gray-600 dark:text-gray-300" />
              {cartCount > 0 && (
                <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div ref={profileRef} className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-card transition-colors">
                  {user?.profile_image ? (
                    <img src={`http://localhost:5000${user.profile_image}`} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary" />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-fresh rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium dark:text-white truncate max-w-[100px]">{user?.name?.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-card rounded-2xl shadow-card-hover border border-gray-100 dark:border-dark-border overflow-hidden z-50">
                      <div className="p-3 border-b border-gray-100 dark:border-dark-border">
                        <p className="font-semibold text-sm dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        {[
                          { icon: FiUser, label: 'Profile', to: '/profile' },
                          { icon: FiPackage, label: 'My Orders', to: '/orders' },
                          { icon: FiHeart, label: 'Wishlist', to: '/wishlist' },
                          ...(user?.role === 'admin' ? [{ icon: FiSettings, label: 'Admin Dashboard', to: '/admin' }] : []),
                        ].map(({ icon: Icon, label, to }) => (
                          <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border text-sm text-gray-700 dark:text-gray-300 transition-colors">
                            <Icon size={16} />{label}
                          </Link>
                        ))}
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 dark:text-red-400 transition-colors mt-1">
                          <FiLogOut size={16} />Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-2">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-icon lg:hidden">
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border overflow-hidden">
            <div className="section-container py-4 space-y-2">
              {categories.map(c => (
                <Link key={c.slug} to={`/products?category=${c.slug}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 font-medium">
                  <span>{c.icon}</span>{c.name}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-100 dark:border-dark-border flex gap-3">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className="flex-1 btn-outline text-center text-sm">Login</Link>
                    <Link to="/signup" className="flex-1 btn-primary text-center text-sm">Sign Up</Link>
                  </>
                ) : (
                  <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <FiLogOut size={16} />Logout
                  </button>
                )}
                <button onClick={() => dispatch(toggleDarkMode())} className="btn-icon ml-auto">
                  {isDarkMode ? <FiSun size={18} className="text-secondary" /> : <FiMoon size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

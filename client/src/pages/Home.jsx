import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiZap, FiStar, FiPercent, FiGift, FiTag } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import ProductQuickView from '../components/product/ProductQuickView';

const SlickSlider = Slider.default || Slider;

const promoBanners = [
  { id: 1, title: '10 Minute Delivery', subtitle: 'Free Delivery on orders above ₹149!', bg: 'from-green-600 via-emerald-500 to-teal-600', badge: 'FASTEST DELIVERY', emoji: '', cta: 'Order Now', link: '/products' },
  { id: 2, title: 'Mega Grocery Discount', subtitle: 'Up to 50% OFF on Fruits & Vegetables', bg: 'from-amber-500 via-orange-500 to-red-500', badge: 'LIMITED TIME', emoji: '', cta: 'Grab Deals', link: '/products?flash_sale=true' },
  { id: 3, title: '100% Certified Organic', subtitle: 'Pure, natural & pesticide-free produce', bg: 'from-teal-600 via-green-600 to-emerald-700', badge: 'HEALTHY LIVING', emoji: '', cta: 'Explore Organic', link: '/products?organic=true' },
  { id: 4, title: 'Drinks, Snacks & Toys', subtitle: 'Instant party essentials at your doorstep', bg: 'from-blue-600 via-indigo-600 to-purple-600', badge: 'PARTY ESSENTIALS', emoji: '', cta: 'Browse Snacks', link: '/products?category=snacks' },
];

const discountDeals = [
  { code: 'FRESH149', title: 'Free Delivery', desc: 'On orders above ₹149', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { code: 'WELCOME20', title: '20% OFF', desc: 'On your first order', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { code: 'SAVE50', title: 'Flat ₹50 OFF', desc: 'Use code SAVE50 at checkout', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { code: 'FLASH40', title: 'Up to 40% OFF', desc: 'On Snacks & Beverages', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
];

// Blinkit / Zepto-style categorical grid items
const categoryGrid = [
  { name: 'Vegetables', slug: 'vegetables', icon: 'Vg', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', tag: 'Fresh Harvest' },
  { name: 'Fruits', slug: 'fruits', icon: 'Fr', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', tag: 'Sweet & Juicy' },
  { name: 'Cold Drinks', slug: 'beverages', icon: 'Bv', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', tag: 'Chilled & Soft' },
  { name: 'Bread & Bakery', slug: 'bakery', icon: 'Bk', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', tag: 'Baked Daily' },
  { name: 'Snacks & Munchies', slug: 'snacks', icon: 'Sn', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', tag: 'Crispy & Tasty' },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: 'Dy', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', tag: 'Farm Fresh' },
  { name: 'Toys & Games', slug: 'toys-games', icon: 'Tg', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300', tag: 'Kids Special' },
  { name: 'Baby Care', slug: 'baby-care', icon: 'Bc', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', tag: 'Gentle & Safe' },
  { name: 'Grocery Essentials', slug: 'grocery', icon: 'Gr', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', tag: 'Staples & Oils' },
  { name: 'Household Cleaning', slug: 'household', icon: 'Hh', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300', tag: 'Sparkling Clean' },
  { name: 'Personal Care', slug: 'personal-care', icon: 'Pc', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300', tag: 'Beauty & Hygiene' },
  { name: 'Frozen & Ice Cream', slug: 'frozen', icon: 'Ic', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300', tag: 'Ice Cold' },
];

const features = [
  { icon: FiTruck, title: '10 Min Delivery', desc: 'Free on orders above ₹149', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
  { icon: FiZap, title: 'Farm Fresh', desc: 'Directly sourced every morning', color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  { icon: FiShield, title: 'Instant Refund', desc: 'No questions asked returns', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' },
  { icon: FiRefreshCw, title: 'Best Prices', desc: 'Cheaper than local markets', color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer care', color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400' },
];

const testimonials = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'Ordered at 7:00 AM and got fresh milk & eggs by 7:09 AM! Unbelievable speed.', avatar: 'P' },
  { name: 'Rahul Mehta', city: 'Pune', rating: 5, text: 'Free delivery above ₹149 makes small daily grocery orders so convenient!', avatar: 'R' },
  { name: 'Anjali Kapoor', city: 'Bangalore', rating: 5, text: 'Vegetables are crisp and packed cleanly. FreshBasket is my daily go-to app.', avatar: 'A' },
  { name: 'Vikram Rao', city: 'Delhi', rating: 5, text: 'Great deals on drinks and snacks. The instant coupon discounts are amazing.', avatar: 'V' },
];

export default function Home() {
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => categoryAPI.getAll().then(r => r.data.data) });
  const { data: featuredData } = useQuery({ queryKey: ['featured'], queryFn: () => productAPI.getAll({ featured: true, limit: 10 }).then(r => r.data.data) });
  const { data: flashData } = useQuery({ queryKey: ['flash'], queryFn: () => productAPI.getAll({ flash_sale: true, limit: 8 }).then(r => r.data.data) });
  const { data: popularData } = useQuery({ queryKey: ['popular'], queryFn: () => productAPI.getAll({ sort: 'rating_avg', order: 'DESC', limit: 12 }).then(r => r.data.data) });

  const bannerSliderSettings = {
    dots: true, infinite: true, speed: 600, autoplay: true, autoplaySpeed: 3500,
    slidesToShow: 1, slidesToScroll: 1, arrows: false, fade: true,
  };

  return (
    <div className="pb-12">
      {/* ── Top Announcement & Banner Slider ───────────────────── */}
      <section className="section-container mt-4">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-card border border-gray-100 dark:border-dark-border">
            <SlickSlider {...bannerSliderSettings}>
              {promoBanners.map((b) => (
                <div key={b.id}>
                  <div className={`bg-gradient-to-r ${b.bg} p-8 md:p-12 min-h-[280px] flex items-center relative overflow-hidden`}>
                    <div className="z-10 flex-1">
                      <span className="bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase px-3 py-1 rounded-full tracking-wider inline-block mb-3">
                        {b.badge}
                      </span>
                      <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2">
                        {b.title}
                      </h1>
                      <p className="text-white/90 text-base md:text-lg mb-6">{b.subtitle}</p>
                      <Link to={b.link} className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:shadow-glow transition-all active:scale-95">
                        {b.cta} <FiArrowRight />
                      </Link>
                    </div>
                    <div className="hidden md:block text-8xl md:text-9xl select-none opacity-90 z-0">
                      {b.emoji}
                    </div>
                  </div>
                </div>
              ))}
            </SlickSlider>
          </div>

          {/* Blinkit / Zepto style side offer cards */}
          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white flex items-center justify-between shadow-card hover:shadow-glow transition-all">
              <div>
                <span className="bg-white/20 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1 inline-block">EXPRESS</span>
                <p className="font-black text-xl">Free Delivery</p>
                <p className="text-white/90 text-xs">On orders above <span className="font-bold underline">₹149</span></p>
              </div>
              <div className="text-5xl flex items-center justify-center"><FiZap size={48} /></div>
            </div>
            <Link to="/products?flash_sale=true" className="flex-1 rounded-3xl bg-gradient-to-br from-amber-500 to-red-500 p-5 text-white flex items-center justify-between shadow-card hover:shadow-glow-accent transition-all">
              <div>
                <span className="bg-white/20 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1 inline-block">CRAZY DEALS</span>
                <p className="font-black text-xl">Flash Sale</p>
                <p className="text-white/90 text-xs">Up to 50% Off Snacks & Drinks</p>
              </div>
              <div className="text-5xl flex items-center justify-center"><FiPercent size={48} /></div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Auto-Scrolling Discount Cards Carousel ─────────────── */}
      <section className="section-container mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {discountDeals.map((d) => (
            <div key={d.code} className={`border rounded-2xl p-3.5 flex items-center gap-3 ${d.bg} transition-all hover:scale-[1.02]`}>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-dark-card shadow-sm shrink-0">
                <FiTag size={18} />
              </div>
              <div>
                <span className="font-black text-xs font-mono uppercase tracking-wider block">{d.code}</span>
                <p className="font-bold text-sm leading-tight">{d.title}</p>
                <p className="text-[11px] opacity-80">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Blinkit / Zepto Categorical Containers Grid ────────── */}
      <section className="section-container mt-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title flex items-center gap-2">
              Explore Categories <span className="text-xs bg-primary-100 text-primary dark:bg-primary-900/30 px-2.5 py-1 rounded-full font-semibold">12 Categories</span>
            </h2>
            <p className="section-subtitle">Select from fresh produce, snacks, cold drinks, toys & essentials</p>
          </div>
          <Link to="/products" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
            See All Categories <FiArrowRight size={14} />
          </Link>
        </div>

        {/* Categorical Grid Container */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {categoryGrid.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ scale: 1.04 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center p-4 rounded-3xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border hover:border-primary hover:shadow-card-hover transition-all text-center group relative overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2.5 transition-transform group-hover:scale-110 shadow-sm ${cat.color}`}>
                  {cat.icon}
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight mb-1">
                  {cat.name}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-dark-bg px-2 py-0.5 rounded-full">
                  {cat.tag}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Flash Sale Section ─────────────────────────────────── */}
      {flashData?.length > 0 && (
        <section className="section-container mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-white shadow-glow-accent">
                <FiZap size={22} />
              </div>
              <div>
                <h2 className="section-title">Flash Sale</h2>
                <p className="section-subtitle">Super discounted deals — Grab before stock runs out!</p>
              </div>
            </div>
            <Link to="/products?flash_sale=true" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              View Deals <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {flashData.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
          </div>
        </section>
      )}

      {/* ── Featured Products ──────────────────────────────────── */}
      {featuredData?.length > 0 && (
        <section className="section-container mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Top Picked Essentials</h2>
              <p className="section-subtitle">Handpicked highest quality items</p>
            </div>
            <Link to="/products?featured=true" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              See All <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredData.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
          </div>
        </section>
      )}

      {/* ── Popular Products Grid ─────────────────────────────── */}
      {popularData?.length > 0 && (
        <section className="section-container mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="section-title">Most Popular Right Now</h2>
              <p className="section-subtitle">Customer favorite items delivered in 10 minutes</p>
            </div>
            <Link to="/products" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              Browse All <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {popularData.slice(0, 10).map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
          </div>
        </section>
      )}

      {/* ── Features Bar ──────────────────────────────────────── */}
      <section className="section-container mt-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}
              className="card p-4 text-center hover:shadow-card-hover transition-all border border-gray-100 dark:border-dark-border">
              <div className={`w-11 h-11 ${f.color} rounded-2xl flex items-center justify-center mx-auto mb-2.5`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-bold text-xs text-gray-900 dark:text-white mb-0.5">{f.title}</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 149 Banner Promotion ───────────────────────────────── */}
      <section className="section-container mt-14">
        <div className="bg-gradient-to-r from-primary-700 via-primary to-emerald-400 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-glow">
          <div>
            <span className="bg-white/20 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Special Offer</span>
            <h2 className="text-3xl md:text-4xl font-black mb-2">Free Delivery On All Orders Above ₹149!</h2>
            <p className="text-white/90 text-sm md:text-base">No minimum hassle. Get fresh fruits, vegetables, drinks & snacks delivered in 10 minutes.</p>
          </div>
          <Link to="/products" className="btn-secondary px-8 py-3.5 text-base font-bold rounded-2xl whitespace-nowrap shrink-0">
            Start Shopping Now
          </Link>
        </div>
      </section>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-14 pb-8 border-t border-gray-800">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-fresh rounded-xl flex items-center justify-center shadow-glow">
                <span className="text-white font-black text-lg">F</span>
              </div>
              <span className="font-black text-2xl text-white">
                Fresh<span className="text-accent">Basket</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              FreshBasket is your trusted 10-minute grocery delivery partner. We deliver farm-fresh fruits, vegetables, dairy, bakery, and daily essentials straight to your doorstep.
            </p>
            <div className="flex gap-3 pt-2">
              {[FiInstagram, FiFacebook, FiTwitter, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[['About Us', '#'], ['Categories', '/products'], ['Offers & Coupons', '/products?flash_sale=true'], ['Organic Store', '/products?organic=true'], ['Careers', '#']].map(([l, path]) => (
                <li key={l}>
                  <Link to={path} className="hover:text-primary transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Top Categories</h3>
            <ul className="space-y-2.5 text-sm">
              {[['Fruits & Vegetables', '/products?category=fruits'], ['Dairy & Eggs', '/products?category=dairy-eggs'], ['Fresh Bakery', '/products?category=bakery'], ['Snacks & Munchies', '/products?category=snacks'], ['Beverages', '/products?category=beverages']].map(([l, path]) => (
                <li key={l}>
                  <Link to={path} className="hover:text-primary transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Contact Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400">
                <FiMapPin className="text-primary mt-0.5 shrink-0" size={16} />
                <span>123 Fresh Avenue, Green Park, Mumbai, India - 400001</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FiPhone className="text-primary shrink-0" size={16} />
                <span>+91 1800-123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <FiMail className="text-primary shrink-0" size={16} />
                <span>support@freshbasket.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} FreshBasket India Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-400">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400">Terms of Service</a>
            <a href="#" className="hover:text-gray-400">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

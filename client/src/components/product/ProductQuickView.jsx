import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiStar, FiShoppingCart, FiHeart, FiMinus, FiPlus } from 'react-icons/fi';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cartAPI, userAPI } from '../../services/api';
import { addItem, updateItem } from '../../store/cartSlice';
import { toggleItem } from '../../store/wishlistSlice';
import toast from 'react-hot-toast';

export default function ProductQuickView({ product, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { items: cartItems } = useSelector(s => s.cart);
  const { productIds: wishlistIds } = useSelector(s => s.wishlist);
  const [adding, setAdding] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const cartItem = cartItems.find(i => i.product_id === product.id);
  const isWishlisted = wishlistIds.includes(product.id);
  const images = Array.isArray(product.images) && product.images.length ? product.images : [product.thumbnail || 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400'];

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await cartAPI.add({ product_id: product.id, quantity: 1 });
      dispatch(addItem({ product_id: product.id, quantity: 1, product }));
      toast.success('Added to cart!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAdding(false); }
  };

  const handleQty = async (newQty) => {
    if (!cartItem) return;
    try {
      await cartAPI.update({ product_id: product.id, quantity: newQty });
      dispatch(updateItem({ product_id: product.id, quantity: newQty }));
    } catch { toast.error('Failed'); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await userAPI.toggleWishlist(product.id);
      dispatch(toggleItem(product.id));
      toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch { }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="grid md:grid-cols-2">
            {/* Image section */}
            <div className="bg-gray-50 dark:bg-dark-bg p-6 flex flex-col gap-3">
              <img src={images[imgIdx]} alt={product.name} className="w-full h-64 object-contain rounded-2xl" />
              {images.length > 1 && (
                <div className="flex gap-2 justify-center">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-primary' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Info section */}
            <div className="p-6 flex flex-col">
              <button onClick={onClose} className="absolute top-4 right-4 btn-icon">
                <FiX size={18} />
              </button>
              {product.category && <p className="text-xs text-primary font-medium mb-1">{product.category.name}</p>}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{product.name}</h2>
              <p className="text-sm text-gray-500 mb-2">{product.weight} · {product.brand}</p>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} size={14} className={s <= Math.round(product.rating_avg) ? 'fill-secondary text-secondary' : 'text-gray-300'} />
                ))}
                <span className="text-xs text-gray-500 ml-1">({product.rating_count} reviews)</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl font-black text-gray-900 dark:text-white">₹{product.price}</span>
                {product.old_price && <span className="text-gray-400 line-through">₹{product.old_price}</span>}
                {product.discount_pct > 0 && <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded-lg">{product.discount_pct}% OFF</span>}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">{product.description || 'Fresh, high quality product.'}</p>
              <div className={`text-xs font-semibold mb-4 ${product.stock_qty > 10 ? 'text-primary' : product.stock_qty > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                {product.stock_qty > 10 ? 'In Stock' : product.stock_qty > 0 ? `Only ${product.stock_qty} left!` : 'Out of Stock'}
              </div>
              <div className="flex gap-3">
                {!cartItem ? (
                  <button onClick={handleAddToCart} disabled={adding || product.stock_qty === 0} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
                    <FiShoppingCart size={16} />Add to Cart
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-between bg-primary rounded-xl px-4 py-3">
                    <button onClick={() => handleQty(cartItem.quantity - 1)} className="text-white p-1"><FiMinus size={16} /></button>
                    <span className="text-white font-bold">{cartItem.quantity}</span>
                    <button onClick={() => handleQty(cartItem.quantity + 1)} className="text-white p-1"><FiPlus size={16} /></button>
                  </div>
                )}
                <button onClick={handleWishlist} className={`btn-icon border-2 ${isWishlisted ? 'border-red-500 text-red-500' : 'border-gray-200 text-gray-400'} p-3 rounded-xl`}>
                  <FiHeart size={18} className={isWishlisted ? 'fill-red-500' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

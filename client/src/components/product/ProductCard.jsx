import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiHeart, FiShoppingCart, FiEye, FiStar, FiMinus, FiPlus } from 'react-icons/fi';
import { cartAPI, userAPI } from '../../services/api';
import { addItem, updateItem } from '../../store/cartSlice';
import { toggleItem } from '../../store/wishlistSlice';
import { openCart } from '../../store/cartSlice';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onQuickView }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { items: cartItems } = useSelector(s => s.cart);
  const { productIds: wishlistIds } = useSelector(s => s.wishlist);

  const [adding, setAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cartItem = cartItems.find(i => i.product_id === product.id);
  const isWishlisted = wishlistIds.includes(product.id);
  const inCart = !!cartItem;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setAdding(true);
    try {
      await cartAPI.add({ product_id: product.id, quantity: 1 });
      dispatch(addItem({ product_id: product.id, quantity: 1, product }));
      toast.success(`${product.name} added to cart!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add to cart'); }
    finally { setAdding(false); }
  };

  const handleQty = async (e, newQty) => {
    e.preventDefault();
    if (!cartItem) return;
    try {
      await cartAPI.update({ product_id: product.id, quantity: newQty });
      dispatch(updateItem({ product_id: product.id, quantity: newQty }));
    } catch { toast.error('Failed to update'); }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await userAPI.toggleWishlist(product.id);
      dispatch(toggleItem(product.id));
      toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch { toast.error('Failed'); }
  };

  const discount = product.discount_pct || (product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="card group relative overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      {discount > 0 && <span className="badge-discount">{discount}% OFF</span>}
      {product.is_organic && <span className="badge-organic">Organic</span>}
      {product.is_flash_sale && !product.is_organic && (
        <span className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-lg z-10">Sale</span>
      )}

      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white dark:bg-dark-card shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        style={{ opacity: isWishlisted ? 1 : undefined }}
      >
        <FiHeart size={15} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
      </button>

      {/* Image */}
      <Link to={`/products/${product.id}`}>
        <div className="relative overflow-hidden bg-gray-50 dark:bg-dark-bg rounded-t-2xl" style={{ height: 180 }}>
          <motion.img
            src={product.thumbnail || 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400'}
            alt={product.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.4 }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400'; }}
          />
          {/* Quick View overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                onClick={(e) => { e.preventDefault(); onQuickView?.(product); }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm text-gray-800 dark:text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md"
              >
                <FiEye size={13} /> Quick View
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3.5">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-primary font-medium mb-1">{product.category.icon} {product.category.name}</p>
        )}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{product.weight}</p>

        {/* Rating */}
        {product.rating_count > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(s => (
                <FiStar key={s} size={11} className={s <= Math.round(product.rating_avg) ? 'fill-secondary text-secondary' : 'text-gray-300'} />
              ))}
            </div>
            <span className="text-xs text-gray-500">({product.rating_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-base text-gray-900 dark:text-white">₹{product.price}</span>
          {product.old_price && (
            <span className="text-xs text-gray-400 line-through">₹{product.old_price}</span>
          )}
        </div>

        {/* Add to cart */}
        <div className="mt-3">
          {!inCart ? (
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock_qty === 0}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95
                ${product.stock_qty === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dark-border dark:text-gray-500' : 'bg-primary-50 text-primary hover:bg-primary hover:text-white dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary dark:hover:text-white'}`}
            >
              {adding ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <FiShoppingCart size={15} />}
              {product.stock_qty === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          ) : (
            <div className="flex items-center justify-between bg-primary rounded-xl px-3 py-1.5">
              <button onClick={(e) => handleQty(e, cartItem.quantity - 1)} className="text-white hover:text-secondary transition-colors p-1">
                <FiMinus size={14} />
              </button>
              <span className="text-white font-bold text-sm">{cartItem.quantity}</span>
              <button onClick={(e) => handleQty(e, cartItem.quantity + 1)} className="text-white hover:text-secondary transition-colors p-1">
                <FiPlus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

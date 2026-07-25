import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { userAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';

export default function Wishlist() {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => userAPI.getWishlist().then(r => r.data),
  });

  const wishlistItems = data?.data || [];

  if (isLoading) {
    return (
      <div className="section-container py-10">
        <div className="skeleton h-8 w-40 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-60 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-8 min-h-[60vh]">
      <h1 className="text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
        <FiHeart className="text-red-500 fill-red-500" /> My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto">
          <div className="text-6xl mb-4"><FiHeart size={56} className="mx-auto text-red-300" /></div>
          <h2 className="text-xl font-bold dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Explore products and save your favorites here for easy ordering later.</p>
          <Link to="/products" className="btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {wishlistItems.map(item => (
            item.product && <ProductCard key={item.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}

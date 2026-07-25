import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiGrid, FiList, FiChevronDown, FiSearch } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import ProductQuickView from '../components/product/ProductQuickView';

const sortOptions = [
  { value: 'createdAt-DESC', label: 'Newest First' },
  { value: 'price-ASC', label: 'Price: Low to High' },
  { value: 'price-DESC', label: 'Price: High to Low' },
  { value: 'rating_avg-DESC', label: 'Top Rated' },
  { value: 'discount_pct-DESC', label: 'Best Discount' },
];

const priceRanges = [
  { label: 'Under ₹100', min: 0, max: 100 },
  { label: '₹100 - ₹300', min: 100, max: 300 },
  { label: '₹300 - ₹500', min: 300, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: 'Above ₹1000', min: 1000, max: 99999 },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt-DESC');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '', maxPrice: '',
    minRating: '',
    featured: searchParams.get('featured') || '',
    flash_sale: searchParams.get('flash_sale') || '',
    organic: searchParams.get('organic') || '',
    search: searchParams.get('search') || '',
  });

  const [sortField, sortOrder] = sort.split('-');

  const { data: catData } = useQuery({ queryKey: ['categories'], queryFn: () => categoryAPI.getAll().then(r => r.data.data) });

  const queryParams = { page, limit: 20, sort: sortField, order: sortOrder, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productAPI.getAll(queryParams).then(r => r.data),
    keepPreviousData: true,
  });

  const products = data?.data || [];
  const pagination = data?.pagination || {};

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', minRating: '', featured: '', flash_sale: '', organic: '', search: '' });
    setPage(1);
    setSearchParams({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="section-container py-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">
            {filters.search ? `Results for "${filters.search}"` : filters.category ? `${filters.category.replace(/-/g, ' ')}` : 'All Products'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{pagination.total || 0} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
              ${showFilters ? 'border-primary bg-primary-50 text-primary' : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300'}`}>
            <FiFilter size={15} />Filters
            {activeFilterCount > 0 && <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="input-field text-sm py-2 w-auto cursor-pointer">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex border-2 border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card'}`}>
              <FiGrid size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-card'}`}>
              <FiList size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="hidden lg:block w-64 shrink-0">
              <div className="card p-5 sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                      <FiX size={12} />Clear all
                    </button>
                  )}
                </div>

                {/* Search */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Search</label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input value={filters.search} onChange={e => updateFilter('search', e.target.value)}
                      placeholder="Search products..." className="input-field text-sm pl-8" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Category</label>
                  <div className="space-y-1.5">
                    <button onClick={() => updateFilter('category', '')}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${!filters.category ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border'}`}>
                      All Categories
                    </button>
                    {(catData || []).map(cat => (
                      <button key={cat.id} onClick={() => updateFilter('category', cat.slug)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors flex items-center gap-2 ${filters.category === cat.slug ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border'}`}>
                        <span>{cat.icon}</span>{cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Price Range</label>
                  <div className="space-y-1.5">
                    {priceRanges.map(pr => (
                      <button key={pr.label}
                        onClick={() => { updateFilter('minPrice', pr.min); updateFilter('maxPrice', pr.max); }}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${parseInt(filters.minPrice) === pr.min && parseInt(filters.maxPrice) === pr.max ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border'}`}>
                        {pr.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Min Rating</label>
                  <div className="flex gap-2">
                    {[4, 3, 2, 1].map(r => (
                      <button key={r} onClick={() => updateFilter('minRating', filters.minRating == r ? '' : r)}
                        className={`text-xs px-3 py-1.5 rounded-lg border-2 transition-all ${filters.minRating == r ? 'border-secondary bg-secondary text-gray-900' : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400'}`}>
                        {r}⭐+
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                  {[{ key: 'featured', label: 'Featured' }, { key: 'flash_sale', label: 'Flash Sale' }, { key: 'organic', label: 'Organic' }].map(t => (
                    <label key={t.key} className="flex items-center gap-3 cursor-pointer">
                      <div onClick={() => updateFilter(t.key, filters[t.key] ? '' : 'true')}
                        className={`w-10 h-5 rounded-full transition-colors relative ${filters[t.key] ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-border'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform ${filters[t.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {isLoading || isFetching ? (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <div className="skeleton h-44 rounded-t-2xl" />
                  <div className="p-4 space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                    <div className="skeleton h-8 rounded-xl mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-4"><FiSearch size={64} className="mx-auto text-gray-300" /></div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term</p>
              <button onClick={clearFilters} className="btn-primary mt-6">Clear Filters</button>
            </div>
          ) : (
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {products.map(p => <ProductCard key={p.id} product={p} onQuickView={setQuickViewProduct} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-outline text-sm py-2 px-4 disabled:opacity-40">
                ← Prev
              </button>
              <div className="flex gap-1">
                {[...Array(Math.min(pagination.pages, 7))].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${p === page ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-gray-300'}`}>
                      {p}
                    </button>
                  );
                })}
              </div>
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-outline text-sm py-2 px-4 disabled:opacity-40">
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {quickViewProduct && <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      </AnimatePresence>
    </div>
  );
}

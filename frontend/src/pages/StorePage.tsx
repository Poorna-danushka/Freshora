import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, Clock, Bike, Info, ShoppingCart, ChevronDown } from 'lucide-react';
import { storesApi } from '@/api/stores';
import { productsApi } from '@/api/products';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductModal } from '@/components/product/ProductModal';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useActiveStoreStore } from '@/store/useActiveStoreStore';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/types';

export function StorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [searchParams] = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

  const { activeStore, setActiveStore } = useActiveStoreStore();
  const totalItems = useCartStore((s) => s.totalItems());

  // Fetch store details
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storesApi.getStoreById(storeId!),
    enabled: !!storeId,
  });

  // Set active store from URL if not set
  useEffect(() => {
    if (store && activeStore?.id !== store.id) setActiveStore(store);
  }, [store, activeStore, setActiveStore]);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['store-categories', storeId],
    queryFn: () => storesApi.getStoreCategories(storeId!),
    enabled: !!storeId,
  });

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', storeId, selectedCategoryId, searchQuery, sortBy],
    queryFn: () => productsApi.getProducts(storeId!, {
      categoryId: selectedCategoryId ?? undefined,
      search: searchQuery || undefined,
      sortBy: sortBy === 'popular' ? 'popular' : sortBy,
    }),
    enabled: !!storeId,
  });

  const products = productsData?.content ?? [];

  if (storeLoading) {
    return (
      <div className="min-h-screen">
        <div className="skeleton h-52 w-full rounded-none" />
        <div className="container-app py-6 space-y-4">
          <div className="skeleton h-20 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Store not found</h2>
          <p className="text-gray-400">This store may no longer be available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store banner */}
      <div className="relative h-48 md:h-56 overflow-hidden bg-gray-200">
        {store.banner ? (
          <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-300 to-primary-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Store info card */}
      <div className="container-app">
        <div className="bg-white rounded-3xl shadow-card -mt-10 relative z-10 p-5 mb-6 mx-0 md:mx-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden bg-white shrink-0">
              <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-gray-900">{store.name}</h1>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${store.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {store.isOpen ? '● Open' : '● Closed'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2 truncate">{store.address}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <strong>{store.rating}</strong> ({store.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1"><Clock size={12} className="text-primary-400" />{store.deliveryTime}</span>
                <span className="flex items-center gap-1"><Bike size={12} className="text-primary-400" />
                  {store.deliveryFee === 0 ? 'Free delivery' : `LKR ${store.deliveryFee} delivery`}
                </span>
                <span className="flex items-center gap-1"><Info size={12} />Min. LKR {store.minOrder}</span>
              </div>
            </div>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
            {store.tags.map((tag) => (
              <span key={tag} className="badge-green">{tag}</span>
            ))}
          </div>
        </div>

        {/* Sticky search + filter bar */}
        <div className="sticky top-16 z-30 bg-gray-50 py-3 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-2 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${store.name}...`}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 text-gray-700 cursor-pointer"
              >
                <option value="popular">Popular</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Floating cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 btn-primary relative"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="bg-white text-primary-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category tabs */}
        {categories && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!selectedCategoryId ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedCategoryId === cat.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-12">
            {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-400 text-sm">
              {searchQuery ? `No results for "${searchQuery}"` : 'No products in this category yet'}
            </p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategoryId(null); }} className="mt-4 btn-secondary text-sm">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{products.length} products</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-12">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onViewDetails={setSelectedProduct} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

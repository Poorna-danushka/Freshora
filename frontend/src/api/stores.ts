import type { Category, Store } from '@/types';
import apiClient from './client';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_STORES: Store[] = [
  {
    id: 'store-01',
    name: "Cargills Food City",
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120&h=120&fit=crop',
    banner: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&h=300&fit=crop',
    description: 'Sri Lanka\'s largest supermarket chain with the freshest local and imported produce.',
    address: '123 Galle Road, Kollupitiya',
    area: 'Colombo 03',
    rating: 4.5,
    reviewCount: 1240,
    deliveryTime: '25–40 min',
    deliveryFee: 150,
    minOrder: 500,
    isOpen: true,
    openingHours: '7:00 AM – 10:00 PM',
    tags: ['Fresh Produce', 'Imported Goods', 'Bakery'],
    distance: '1.2 km',
  },
  {
    id: 'store-02',
    name: "Keells Super",
    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=120&h=120&fit=crop',
    banner: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=300&fit=crop',
    description: 'Premium supermarket with an extensive range of organic and local products.',
    address: '45 Union Place, Colombo 02',
    area: 'Colombo 02',
    rating: 4.3,
    reviewCount: 890,
    deliveryTime: '30–45 min',
    deliveryFee: 200,
    minOrder: 750,
    isOpen: true,
    openingHours: '8:00 AM – 9:30 PM',
    tags: ['Organic', 'Premium', 'Deli'],
    distance: '2.1 km',
  },
  {
    id: 'store-03',
    name: "Laugfs Supermart",
    logo: 'https://images.unsplash.com/photo-1580913428023-02c695666d61?w=120&h=120&fit=crop',
    banner: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=800&h=300&fit=crop',
    description: 'Your neighbourhood grocery destination for everyday essentials at great prices.',
    address: '67 High Level Road, Nugegoda',
    area: 'Nugegoda',
    rating: 4.1,
    reviewCount: 560,
    deliveryTime: '20–35 min',
    deliveryFee: 100,
    minOrder: 400,
    isOpen: true,
    openingHours: '7:30 AM – 10:30 PM',
    tags: ['Budget Friendly', 'Local Brands', 'Daily Essentials'],
    distance: '0.8 km',
  },
  {
    id: 'store-04',
    name: "Sathosa",
    logo: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=120&h=120&fit=crop',
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=300&fit=crop',
    description: 'Government-run cooperative offering affordable prices for staple groceries.',
    address: '12 Baseline Road, Borella',
    area: 'Colombo 08',
    rating: 3.9,
    reviewCount: 320,
    deliveryTime: '35–50 min',
    deliveryFee: 80,
    minOrder: 300,
    isOpen: false,
    openingHours: '8:00 AM – 8:00 PM',
    tags: ['Affordable', 'Staples', 'Local'],
    distance: '3.4 km',
  },
];

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-01', name: 'Fruits & Vegetables', icon: '🥦', productCount: 120 },
  { id: 'cat-02', name: 'Dairy & Eggs', icon: '🥛', productCount: 45 },
  { id: 'cat-03', name: 'Meat & Seafood', icon: '🐟', productCount: 60 },
  { id: 'cat-04', name: 'Bakery', icon: '🍞', productCount: 35 },
  { id: 'cat-05', name: 'Beverages', icon: '🧃', productCount: 80 },
  { id: 'cat-06', name: 'Snacks', icon: '🍿', productCount: 95 },
  { id: 'cat-07', name: 'Rice & Grains', icon: '🍚', productCount: 30 },
  { id: 'cat-08', name: 'Spices & Condiments', icon: '🌶️', productCount: 55 },
  { id: 'cat-09', name: 'Household Care', icon: '🧹', productCount: 70 },
  { id: 'cat-10', name: 'Personal Care', icon: '🧴', productCount: 85 },
  { id: 'cat-11', name: 'Frozen Food', icon: '🧊', productCount: 40 },
  { id: 'cat-12', name: 'Baby & Kids', icon: '🍼', productCount: 25 },
];

export const storesApi = {
  getStoresByLocation: async (locationId: string): Promise<Store[]> => {
    try {
      const res = await apiClient.get<{ data: Store[] }>(`/stores?locationId=${locationId}`);
      return res.data.data;
    } catch {
      return MOCK_STORES;
    }
  },

  getStoreById: async (storeId: string): Promise<Store> => {
    try {
      const res = await apiClient.get<{ data: Store }>(`/stores/${storeId}`);
      return res.data.data;
    } catch {
      const store = MOCK_STORES.find((s) => s.id === storeId);
      if (!store) throw new Error('Store not found');
      return store;
    }
  },

  getStoreCategories: async (storeId: string): Promise<Category[]> => {
    try {
      const res = await apiClient.get<{ data: Category[] }>(`/stores/${storeId}/categories`);
      return res.data.data;
    } catch {
      void storeId;
      return MOCK_CATEGORIES;
    }
  },

  getFeaturedStores: async (): Promise<Store[]> => {
    try {
      const res = await apiClient.get<{ data: Store[] }>('/stores/featured');
      return res.data.data;
    } catch {
      return MOCK_STORES.slice(0, 3);
    }
  },
};

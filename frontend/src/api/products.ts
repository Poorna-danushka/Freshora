import type { PaginatedResponse, Product, ProductFilters } from '@/types';
import apiClient from './client';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-01', storeId: 'store-01', categoryId: 'cat-01',
    name: 'Fresh Tomatoes', description: 'Locally grown, vine-ripened tomatoes from Nuwara Eliya.',
    image: 'https://images.unsplash.com/photo-1546470427-227c59c5b871?w=300&h=300&fit=crop',
    price: 180, originalPrice: 220, unit: '500 g',
    inStock: true, stockCount: 50, rating: 4.6, reviewCount: 210, isPopular: true,
    tags: ['Fresh', 'Local'],
  },
  {
    id: 'p-02', storeId: 'store-01', categoryId: 'cat-01',
    name: 'Organic Carrots', description: 'Sweet and crunchy organic carrots.',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop',
    price: 120, unit: '500 g',
    inStock: true, stockCount: 30, rating: 4.4, reviewCount: 145, isPopular: true,
    tags: ['Organic', 'Fresh'],
  },
  {
    id: 'p-03', storeId: 'store-01', categoryId: 'cat-02',
    name: 'Anchor Full Cream Milk', description: 'New Zealand full cream milk powder.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop',
    price: 980, unit: '400 g',
    inStock: true, stockCount: 20, rating: 4.8, reviewCount: 380, isPopular: true,
    tags: ['Dairy', 'Imported'],
  },
  {
    id: 'p-04', storeId: 'store-01', categoryId: 'cat-07',
    name: 'Samba Rice', description: 'Premium quality samba rice from Sri Lanka.',
    image: 'https://images.unsplash.com/photo-1536304993881-ff86e5d0e3b3?w=300&h=300&fit=crop',
    price: 350, unit: '1 kg',
    inStock: true, stockCount: 100, rating: 4.3, reviewCount: 520, isPopular: true,
    tags: ['Local', 'Staple'],
  },
  {
    id: 'p-05', storeId: 'store-01', categoryId: 'cat-05',
    name: 'Elephant House Cream Soda', description: 'Sri Lanka\'s iconic cream soda drink.',
    image: 'https://images.unsplash.com/photo-1629203432180-71cf2b05c697?w=300&h=300&fit=crop',
    price: 95, unit: '400 ml',
    inStock: true, stockCount: 80, rating: 4.7, reviewCount: 290,
    tags: ['Local', 'Beverage'],
  },
  {
    id: 'p-06', storeId: 'store-01', categoryId: 'cat-08',
    name: 'Pure Ceylon Cinnamon', description: 'True Ceylon cinnamon sticks from Matale.',
    image: 'https://images.unsplash.com/photo-1578996953841-b187dbe4bc8a?w=300&h=300&fit=crop',
    price: 280, unit: '100 g',
    inStock: true, stockCount: 40, rating: 4.9, reviewCount: 160, isPopular: true,
    tags: ['Local', 'Spice', 'Organic'],
  },
  {
    id: 'p-07', storeId: 'store-01', categoryId: 'cat-01',
    name: 'Banana (Ambul)', description: 'Fresh ambul bananas — perfect for eating and cooking.',
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=300&h=300&fit=crop',
    price: 160, unit: '1 kg',
    inStock: true, stockCount: 60, rating: 4.5, reviewCount: 190,
    tags: ['Fresh', 'Local'],
  },
  {
    id: 'p-08', storeId: 'store-01', categoryId: 'cat-03',
    name: 'Fresh Prawns', description: 'Freshly caught tiger prawns from Negombo.',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300&h=300&fit=crop',
    price: 1200, unit: '500 g',
    inStock: true, stockCount: 15, rating: 4.6, reviewCount: 85, isPopular: true,
    tags: ['Fresh', 'Seafood', 'Local'],
  },
  {
    id: 'p-09', storeId: 'store-01', categoryId: 'cat-06',
    name: 'Lanka Soy Snack', description: 'Crunchy soy-based local snack.',
    image: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=300&h=300&fit=crop',
    price: 65, unit: '100 g',
    inStock: true, stockCount: 120, rating: 4.2, reviewCount: 340,
    tags: ['Local', 'Snack'],
  },
  {
    id: 'p-10', storeId: 'store-01', categoryId: 'cat-02',
    name: 'Farm Fresh Eggs', description: 'Free-range eggs from local farms.',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=300&fit=crop',
    price: 240, unit: '10 pieces',
    inStock: true, stockCount: 25, rating: 4.7, reviewCount: 410, isPopular: true,
    tags: ['Fresh', 'Local'],
  },
];

export const productsApi = {
  getProducts: async (storeId: string, filters?: ProductFilters): Promise<PaginatedResponse<Product>> => {
    try {
      const params = new URLSearchParams({ storeId, ...filters as Record<string, string> });
      const res = await apiClient.get<{ data: PaginatedResponse<Product> }>(`/products?${params}`);
      return res.data.data;
    } catch {
      let products = MOCK_PRODUCTS.filter((p) => p.storeId === storeId || storeId === 'store-01');
      if (filters?.categoryId) products = products.filter((p) => p.categoryId === filters.categoryId);
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        products = products.filter((p) => p.name.toLowerCase().includes(q));
      }
      if (filters?.inStock) products = products.filter((p) => p.inStock);
      return {
        content: products,
        totalElements: products.length,
        totalPages: 1,
        currentPage: 0,
        pageSize: products.length,
      };
    }
  },

  getPopularProducts: async (storeId?: string): Promise<Product[]> => {
    try {
      const url = storeId ? `/products/popular?storeId=${storeId}` : '/products/popular';
      const res = await apiClient.get<{ data: Product[] }>(url);
      return res.data.data;
    } catch {
      return MOCK_PRODUCTS.filter((p) => p.isPopular).slice(0, 6);
    }
  },

  getProductById: async (productId: string): Promise<Product> => {
    try {
      const res = await apiClient.get<{ data: Product }>(`/products/${productId}`);
      return res.data.data;
    } catch {
      const product = MOCK_PRODUCTS.find((p) => p.id === productId);
      if (!product) throw new Error('Product not found');
      return product;
    }
  },

  searchProducts: async (storeId: string, query: string): Promise<Product[]> => {
    try {
      const res = await apiClient.get<{ data: Product[] }>(`/products/search?storeId=${storeId}&q=${query}`);
      return res.data.data;
    } catch {
      const q = query.toLowerCase();
      return MOCK_PRODUCTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
  },
};

// ─── Location ────────────────────────────────────────────────────────────────
export interface Location {
  id: string;
  name: string;
  area: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export interface Store {
  id: string;
  name: string;
  logo: string;
  banner?: string;
  description: string;
  address: string;
  area: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string; // e.g. "20-35 min"
  deliveryFee: number;  // LKR
  minOrder: number;     // LKR
  isOpen: boolean;
  openingHours: string;
  tags: string[];       // e.g. ["Organic", "Fresh"]
  distance?: string;    // e.g. "1.2 km"
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  icon: string;         // emoji or icon name
  image?: string;
  productCount?: number;
}

// ─── Product ─────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  images?: string[];
  price: number;        // LKR
  originalPrice?: number; // LKR, for showing discounts
  unit: string;         // e.g. "1 kg", "500 g", "1 L", "piece"
  inStock: boolean;
  stockCount?: number;
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface DeliveryAddress {
  recipientName: string;
  phone: string;
  houseNo: string;
  street: string;
  area: string;
  city: string;
  postalCode?: string;
  landmark?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  status: OrderStatus;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'CARD' | 'CASH_ON_DELIVERY';
  placedAt: string;       // ISO date string
  estimatedDelivery?: string;
  deliveredAt?: string;
}

// ─── Delivery Tracking ───────────────────────────────────────────────────────
export interface TrackingStep {
  status: OrderStatus;
  label: string;
  description: string;
  completedAt?: string;
  isActive: boolean;
  isCompleted: boolean;
}

export interface DeliveryTracking {
  orderId: string;
  status: OrderStatus;
  steps: TrackingStep[];
  rider?: {
    name: string;
    phone: string;
    photo?: string;
    latitude?: number;
    longitude?: number;
  };
  estimatedMinutes?: number;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popular';
  page?: number;
  size?: number;
}

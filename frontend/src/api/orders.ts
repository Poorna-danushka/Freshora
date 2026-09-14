import type { DeliveryAddress, DeliveryTracking, Order, OrderStatus } from '@/types';
import apiClient from './client';

interface CreateOrderPayload {
  storeId: string;
  items: { productId: string; quantity: number }[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'CARD' | 'CASH_ON_DELIVERY';
}

const MOCK_TRACKING: DeliveryTracking = {
  orderId: 'ORD-001',
  status: 'DELIVERING',
  estimatedMinutes: 12,
  steps: [
    { status: 'CONFIRMED', label: 'Order Confirmed', description: 'Your order has been confirmed', completedAt: new Date(Date.now() - 30 * 60000).toISOString(), isActive: false, isCompleted: true },
    { status: 'PREPARING', label: 'Preparing', description: 'Store is preparing your order', completedAt: new Date(Date.now() - 20 * 60000).toISOString(), isActive: false, isCompleted: true },
    { status: 'PICKED_UP', label: 'Picked Up', description: 'Rider has picked up your order', completedAt: new Date(Date.now() - 10 * 60000).toISOString(), isActive: false, isCompleted: true },
    { status: 'DELIVERING', label: 'On the Way', description: 'Your order is on the way', isActive: true, isCompleted: false },
    { status: 'DELIVERED', label: 'Delivered', description: 'Order delivered successfully', isActive: false, isCompleted: false },
  ],
  rider: { name: 'Kamal Perera', phone: '+94 77 123 4567', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face' },
};

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post<{ data: Order }>('/orders', payload);
    return res.data.data;
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await apiClient.get<{ data: Order[] }>('/orders');
      return res.data.data;
    } catch {
      return [];
    }
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const res = await apiClient.get<{ data: Order }>(`/orders/${orderId}`);
    return res.data.data;
  },

  trackOrder: async (orderId: string): Promise<DeliveryTracking> => {
    try {
      const res = await apiClient.get<{ data: DeliveryTracking }>(`/orders/${orderId}/track`);
      return res.data.data;
    } catch {
      return { ...MOCK_TRACKING, orderId };
    }
  },

  cancelOrder: async (orderId: string): Promise<{ status: OrderStatus }> => {
    const res = await apiClient.post<{ data: { status: OrderStatus } }>(`/orders/${orderId}/cancel`);
    return res.data.data;
  },
};

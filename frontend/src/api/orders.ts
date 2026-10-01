import type { DeliveryAddress, DeliveryTracking, Order, OrderStatus } from '@/types';
import apiClient from './client';

interface CreateOrderPayload {
  storeId: string;
  items: { productId: string; quantity: number }[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: 'CARD' | 'CASH_ON_DELIVERY';
}

export const ordersApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post<{ data: Order }>('/orders', payload);
    return res.data.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<{ data: Order[] }>('/orders');
    return res.data.data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const res = await apiClient.get<{ data: Order }>(`/orders/${orderId}`);
    return res.data.data;
  },

  trackOrder: async (orderId: string): Promise<DeliveryTracking> => {
    const res = await apiClient.get<{ data: DeliveryTracking }>(`/orders/${orderId}/track`);
    return res.data.data;
  },

  cancelOrder: async (orderId: string): Promise<{ status: OrderStatus }> => {
    const res = await apiClient.post<{ data: { status: OrderStatus } }>(`/orders/${orderId}/cancel`);
    return res.data.data;
  },
};

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, MapPin } from 'lucide-react';
import { ordersApi } from '@/api/orders';
import type { OrderStatus } from '@/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING:           { label: 'Pending',          color: 'bg-gray-100 text-gray-600' },
  CONFIRMED:         { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700' },
  PREPARING:         { label: 'Preparing',         color: 'bg-amber-100 text-amber-700' },
  READY_FOR_PICKUP:  { label: 'Ready for Pickup',  color: 'bg-purple-100 text-purple-700' },
  PICKED_UP:         { label: 'Picked Up',         color: 'bg-indigo-100 text-indigo-700' },
  DELIVERING:        { label: 'On the Way',        color: 'bg-primary-100 text-primary-700' },
  DELIVERED:         { label: 'Delivered',         color: 'bg-green-100 text-green-700' },
  CANCELLED:         { label: 'Cancelled',         color: 'bg-red-100 text-red-600' },
};

export function OrderHistoryPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getOrders,
  });

  type DisplayOrder = { id: string; storeName: string; status: OrderStatus; total: number; itemCount: number; placedAt: string };

  const MOCK_ORDERS: DisplayOrder[] = [
    { id: 'ORD-1001', storeName: 'Cargills Food City', status: 'DELIVERED', total: 2450, itemCount: 5, placedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'ORD-1002', storeName: 'Keells Super', status: 'DELIVERING', total: 1870, itemCount: 3, placedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
    { id: 'ORD-1003', storeName: 'Laugfs Supermart', status: 'CANCELLED', total: 980, itemCount: 2, placedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  const displayOrders: DisplayOrder[] = (orders && orders.length > 0)
    ? orders.map((o) => ({ id: o.id, storeName: o.storeName, status: o.status, total: o.total, itemCount: o.items.reduce((s, i) => s + i.quantity, 0), placedAt: o.placedAt }))
    : MOCK_ORDERS;

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package size={24} className="text-primary-500" /> My Orders
        </h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="card p-12 text-center">
            <Package size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-400 text-sm mb-4">Your order history will appear here</p>
            <Link to="/" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => {
              const status = STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="card p-5 hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-gray-900">{order.storeName}</h3>
                        <span className={`badge ${status.color} text-[10px]`}>{status.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{order.id}</p>
                    </div>
                    <p className="font-bold text-gray-900 shrink-0">LKR {order.total.toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Package size={11} /> {order.itemCount} items
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {formatDate(order.placedAt)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {(order.status === 'DELIVERING' || order.status === 'PICKED_UP') && (
                      <Link to={`/track/${order.id}`} className="flex items-center gap-1.5 btn-primary text-xs py-1.5 px-3">
                        <MapPin size={12} /> Track Order
                      </Link>
                    )}
                    <Link to={`/track/${order.id}`} className="flex items-center gap-1 btn-secondary text-xs py-1.5 px-3 ml-auto">
                      Details <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

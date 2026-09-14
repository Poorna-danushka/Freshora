import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Phone, CheckCircle, Circle, Clock, MapPin, ChevronLeft, Bike } from 'lucide-react';
import { ordersApi } from '@/api/orders';
import type { OrderStatus } from '@/types';

const STEP_ICONS: Record<OrderStatus, string> = {
  PENDING: '📋',
  CONFIRMED: '✅',
  PREPARING: '🧑‍🍳',
  READY_FOR_PICKUP: '📦',
  PICKED_UP: '🏍️',
  DELIVERING: '🚴',
  DELIVERED: '🏠',
  CANCELLED: '❌',
};

export function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: tracking, isLoading } = useQuery({
    queryKey: ['track', orderId],
    queryFn: () => ordersApi.trackOrder(orderId!),
    enabled: !!orderId,
    refetchInterval: 30000, // refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-app max-w-lg space-y-4">
          <div className="skeleton h-8 w-40 rounded-xl" />
          <div className="skeleton h-32 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Tracking info not available</p>
          <Link to="/orders" className="btn-primary mt-4">View Orders</Link>
        </div>
      </div>
    );
  }

  const activeStep = tracking.steps.find((s) => s.isActive);
  const completedCount = tracking.steps.filter((s) => s.isCompleted).length;
  const progress = Math.round((completedCount / tracking.steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app max-w-lg">
        {/* Back */}
        <Link to="/orders" className="flex items-center gap-1 text-gray-500 hover:text-primary-500 transition-colors text-sm mb-6">
          <ChevronLeft size={16} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="card p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400 font-medium">Order</p>
              <h1 className="text-lg font-bold text-gray-900">{orderId}</h1>
            </div>
            {tracking.estimatedMinutes && (
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium">Estimated arrival</p>
                <div className="flex items-center gap-1 justify-end">
                  <Clock size={14} className="text-primary-500" />
                  <span className="font-bold text-primary-600">{tracking.estimatedMinutes} min</span>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          {activeStep && (
            <p className="text-sm font-semibold text-primary-600 flex items-center gap-1.5">
              <span>{STEP_ICONS[activeStep.status]}</span> {activeStep.label} — {activeStep.description}
            </p>
          )}
        </div>

        {/* Tracking steps */}
        <div className="card p-5 mb-4">
          <h2 className="font-bold text-gray-900 mb-5">Delivery Progress</h2>
          <div className="space-y-0">
            {tracking.steps.map((step, index) => (
              <div key={step.status} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                    step.isCompleted
                      ? 'bg-primary-500 border-primary-500'
                      : step.isActive
                      ? 'bg-white border-primary-500 shadow-md'
                      : 'bg-white border-gray-200'
                  }`}>
                    {step.isCompleted ? (
                      <CheckCircle size={16} className="text-white" />
                    ) : step.isActive ? (
                      <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                    ) : (
                      <Circle size={16} className="text-gray-300" />
                    )}
                  </div>
                  {index < tracking.steps.length - 1 && (
                    <div className={`w-0.5 h-10 mt-1 mb-1 ${step.isCompleted ? 'bg-primary-400' : 'bg-gray-200'}`} />
                  )}
                </div>

                {/* Content */}
                <div className="pb-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-semibold text-sm ${step.isActive ? 'text-primary-600' : step.isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {step.completedAt && (
                      <p className="text-xs text-gray-400">
                        {new Date(step.completedAt).toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${step.isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rider info */}
        {tracking.rider && (
          <div className="card p-5 mb-4">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bike size={18} className="text-primary-500" /> Your Delivery Rider
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {tracking.rider.photo ? (
                  <img
                    src={tracking.rider.photo}
                    alt={tracking.rider.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <Bike size={20} className="text-primary-500" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900">{tracking.rider.name}</p>
                  <p className="text-xs text-gray-500">Delivery Rider</p>
                </div>
              </div>
              <a
                href={`tel:${tracking.rider.phone}`}
                className="flex items-center gap-2 btn-secondary text-sm py-2"
              >
                <Phone size={15} /> Call
              </a>
            </div>
          </div>
        )}

        {/* Map placeholder */}
        <div className="card overflow-hidden mb-4">
          <div className="bg-gradient-to-br from-primary-50 to-green-100 h-40 flex items-center justify-center relative">
            <div className="text-center">
              <MapPin size={32} className="text-primary-400 mx-auto mb-2" />
              <p className="text-sm text-primary-600 font-medium">Live map coming soon</p>
              <p className="text-xs text-gray-400">Rider location will appear here</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/" className="flex-1 btn-secondary justify-center">Continue Shopping</Link>
          <Link to="/orders" className="flex-1 btn-ghost justify-center border border-gray-200">All Orders</Link>
        </div>
      </div>
    </div>
  );
}

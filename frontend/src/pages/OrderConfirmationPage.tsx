import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Package, ChevronRight } from 'lucide-react';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Success card */}
        <div className="card p-8 text-center mb-4">
          {/* Animated checkmark */}
          <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={52} className="text-primary-500" strokeWidth={1.5} />
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-500 mb-4">
            Your order has been confirmed and the store is preparing your groceries.
          </p>

          <div className="bg-primary-50 rounded-2xl px-5 py-3 mb-6 inline-block">
            <p className="text-xs text-primary-600 font-medium">Order ID</p>
            <p className="text-primary-700 font-bold text-lg">{orderId}</p>
          </div>

          {/* Estimated delivery */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Package, label: 'Status', value: 'Confirmed' },
              { icon: Clock, label: 'Estimated', value: '30–45 min' },
              { icon: MapPin, label: 'Delivery', value: 'Your Address' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-2xl p-3">
                <Icon size={18} className="text-primary-400 mx-auto mb-1" />
                <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                <p className="text-xs font-bold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Track order */}
          <Link
            to={`/track/${orderId}`}
            className="btn-primary w-full justify-center py-3.5 text-base mb-3"
          >
            Track My Order <ChevronRight size={18} />
          </Link>
          <Link
            to="/orders"
            className="btn-secondary w-full justify-center py-3"
          >
            View Order History
          </Link>
        </div>

        {/* Continue shopping */}
        <div className="text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-primary-500 transition-colors">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

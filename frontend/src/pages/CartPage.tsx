
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { useActiveStoreStore } from '@/store/useActiveStoreStore';
import { 
  ShoppingBag, 
  Minus, 
  Plus, 
  X, 
  ArrowLeft, 
  Lock, 
  ChevronRight, 
  Store as StoreIcon 
} from 'lucide-react';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity } = useCartStore();
  const { activeStore } = useActiveStoreStore();
  
  const total = useCartStore((s) => s.totalPrice());
  const itemCount = useCartStore((s) => s.totalItems());

  const isCartEmpty = items.length === 0;
  
  // Calculate fees (mock values if not in store context)
  const deliveryFee = activeStore?.deliveryFee ?? 150;
  const grandTotal = total + deliveryFee;
  const minOrder = activeStore?.minOrder ?? 1000;
  const isBelowMinOrder = total < minOrder && !isCartEmpty;

  if (isCartEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 pb-24 md:py-24 px-4 flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="bg-primary-50 p-6 rounded-full mb-6">
          <ShoppingBag className="w-16 h-16 text-primary-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Looks like you haven't added anything to your cart yet. Let's find some fresh groceries!
        </p>
        <Link 
          to="/"
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-0.5"
        >
          Browse Stores
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-12 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <Link 
            to={activeStore ? `/store/${activeStore.id}` : '/'} 
            className="inline-flex items-center text-gray-500 hover:text-primary-600 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            {activeStore && (
              <div className="inline-flex items-center bg-gray-50 rounded-lg py-2 px-3 border border-gray-100">
                <StoreIcon className="w-4 h-4 text-primary-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Ordering from: <span className="text-gray-900">{activeStore.name}</span></span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="w-full lg:w-3/5 xl:w-2/3">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={item.product.id}
                  className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-primary-100 hover:shadow-md transition-all group relative animate-in slide-in-from-bottom-4 fade-in fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-20 h-20 shrink-0 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-2 border border-gray-50 flex items-center justify-center overflow-hidden">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start pr-6 md:pr-8">
                        <h3 className="font-semibold text-gray-900 truncate" title={item.product.name}>
                          {item.product.name}
                        </h3>
                        <p className="font-bold text-gray-900 whitespace-nowrap ml-4">
                          LKR {(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{item.product.unit}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center justify-between text-gray-500 text-sm">
                        LKR {item.product.price.toFixed(2)} / unit
                      </div>
                      
                      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 h-9">
                        <button 
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors rounded-l-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900 select-none">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors rounded-r-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.product.id)}
                    className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Suggested Products Skeleton Strip */}
            <div className="mt-12 mb-8 animate-in fade-in duration-700 delay-500 fill-mode-both">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">You might also need</h2>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-40 shrink-0 p-3 rounded-2xl border border-gray-100 bg-white">
                    <div className="w-full h-28 bg-gray-100 rounded-xl mb-3 animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-gray-100 rounded mb-3 animate-pulse"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Panel */}
          <div className="w-full lg:w-2/5 xl:w-1/3">
            <div className="bg-gray-50 rounded-3xl p-6 lg:p-8 lg:sticky lg:top-24 border border-gray-100 shadow-sm animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium">LKR {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery fee</span>
                  <span className="font-medium">LKR {deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t-2 border-gray-200 border-dashed py-6 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-primary-600">LKR {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {isBelowMinOrder && (
                <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-sm flex gap-2">
                  <div className="shrink-0 mt-0.5">⚠️</div>
                  <p>
                    Minimum order is <span className="font-bold">LKR {minOrder.toFixed(2)}</span>. 
                    Add LKR {(minOrder - total).toFixed(2)} more to checkout.
                  </p>
                </div>
              )}
              
              <button
                onClick={() => navigate('/checkout')}
                disabled={isBelowMinOrder}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mb-4"
              >
                Proceed to Checkout
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-center text-gray-400 text-sm gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

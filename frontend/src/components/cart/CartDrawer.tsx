import { X, Plus, Minus, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveStoreStore } from '@/store/useActiveStoreStore';
import { useCartStore } from '@/store/useCartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const { activeStore } = useActiveStoreStore();
  const navigate = useNavigate();

  const subtotal = totalPrice();
  const deliveryFee = activeStore?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-modal flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary-500" />
            <h2 className="font-bold text-lg text-gray-900">Your Cart</h2>
            {items.length > 0 && (
              <span className="badge-green">{items.reduce((s, i) => s + i.quantity, 0)} items</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Store context */}
        {activeStore && (
          <div className="px-5 py-2.5 bg-primary-50 border-b border-primary-100 text-xs text-primary-700 font-medium">
            📍 Shopping from <strong>{activeStore.name}</strong>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={32} className="text-gray-300" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-700 mb-1">Your cart is empty</h3>
                <p className="text-gray-400 text-sm">Add items from the store to get started</p>
              </div>
              <button onClick={onClose} className="btn-primary text-sm">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.unit}</p>
                    <p className="text-sm font-bold text-primary-600 mt-0.5">
                      LKR {(product.price * quantity).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => removeItem(product.id)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2 py-1">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="text-gray-600 hover:text-primary-500 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-sm text-gray-900 min-w-[16px] text-center">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="text-gray-600 hover:text-primary-500 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear cart */}
              <button onClick={clearCart} className="w-full text-xs text-red-400 hover:text-red-600 py-2 transition-colors">
                Clear cart
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            {/* Minimum order warning */}
            {activeStore && subtotal < activeStore.minOrder && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                ⚠️ Add LKR {(activeStore.minOrder - subtotal).toLocaleString()} more for minimum order
              </div>
            )}

            {/* Price breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery fee</span>
                <span>{deliveryFee === 0 ? <span className="text-primary-500 font-medium">Free</span> : `LKR ${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>LKR {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!!(activeStore && subtotal < activeStore.minOrder)}
              className="w-full btn-primary justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Checkout <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

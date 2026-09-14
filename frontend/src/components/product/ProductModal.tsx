import { X, Plus, Minus, Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [qty, setQty] = useState(1);
  const { addItem, items, updateQuantity } = useCartStore();
  const cartItem = product ? items.find((i) => i.product.id === product.id) : null;

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addItem(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-modal w-full max-w-lg overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-xl shadow-sm hover:bg-gray-100 transition-colors">
          <X size={18} className="text-gray-600" />
        </button>

        {/* Image */}
        <div className="relative h-56 bg-gray-50 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {discount > 0 && (
            <div className="absolute top-4 left-4 bg-accent-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              -{discount}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h2>
            <span className="badge-gray shrink-0">{product.unit}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-800 text-sm">{product.rating}</span>
            </div>
            <span className="text-gray-400 text-sm">({product.reviewCount} reviews)</span>
            {product.inStock ? (
              <span className="badge-green ml-auto">In Stock</span>
            ) : (
              <span className="badge badge-gray ml-auto">Out of Stock</span>
            )}
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-4">{product.description}</p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.tags.map((tag) => (
                <span key={tag} className="badge-green">{tag}</span>
              ))}
            </div>
          )}

          {/* Price + controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <span className="text-2xl font-bold text-gray-900">LKR {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  LKR {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {cartItem ? (
              <div className="flex items-center gap-3 bg-primary-500 rounded-xl px-3 py-2">
                <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="text-white hover:bg-primary-400 rounded-lg p-0.5 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="text-white font-bold min-w-[20px] text-center">{cartItem.quantity}</span>
                <button onClick={() => addItem(product)} className="text-white hover:bg-primary-400 rounded-lg p-0.5 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-gray-600 hover:text-primary-500 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold text-gray-900 min-w-[20px] text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="text-gray-600 hover:text-primary-500 transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

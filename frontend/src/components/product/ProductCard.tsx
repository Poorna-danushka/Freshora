import { Plus, Minus, Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="card group relative flex flex-col h-full overflow-hidden">
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-accent-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          -{discount}%
        </div>
      )}

      {/* Image */}
      <button
        onClick={() => onViewDetails?.(product)}
        className="block relative pt-[75%] bg-gray-50 overflow-hidden"
      >
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <ShoppingCart size={32} className="text-gray-300" />
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge bg-gray-200 text-gray-600 text-xs font-semibold">Out of Stock</span>
          </div>
        )}
      </button>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-gray-400 mb-0.5">{product.unit}</p>
        <button
          onClick={() => onViewDetails?.(product)}
          className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors leading-snug mb-1 text-left line-clamp-2"
        >
          {product.name}
        </button>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          <span className="text-[11px] text-gray-500">{product.rating} ({product.reviewCount})</span>
        </div>

        {/* Price + add to cart */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <span className="font-bold text-gray-900 text-sm">LKR {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-[11px] text-gray-400 line-through ml-1">
                {product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quantity control */}
          {quantity > 0 ? (
            <div className="flex items-center gap-1.5 bg-primary-500 rounded-xl px-1.5 py-1">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-5 h-5 flex items-center justify-center text-white hover:bg-primary-400 rounded-lg transition-colors"
              >
                <Minus size={12} />
              </button>
              <span className="text-white font-bold text-sm min-w-[16px] text-center">{quantity}</span>
              <button
                onClick={() => addItem(product)}
                className="w-5 h-5 flex items-center justify-center text-white hover:bg-primary-400 rounded-lg transition-colors"
              >
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addItem(product)}
              disabled={!product.inStock}
              className="w-8 h-8 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm hover:shadow-md"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

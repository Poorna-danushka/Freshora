import { Clock, Star, MapPin, ChevronRight, Bike } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useActiveStoreStore } from '@/store/useActiveStoreStore';
import type { Store } from '@/types';

interface StoreCardProps {
  store: Store;
}

export function StoreCard({ store }: StoreCardProps) {
  const navigate = useNavigate();
  const { setActiveStore } = useActiveStoreStore();

  const handleClick = () => {
    setActiveStore(store);
    navigate(`/store/${store.id}`);
  };

  return (
    <div onClick={handleClick} className="card-hover cursor-pointer overflow-hidden group">
      {/* Banner */}
      <div className="relative h-36 overflow-hidden bg-gray-100">
        {store.banner ? (
          <img
            src={store.banner}
            alt={store.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200" />
        )}
        {/* Open/closed badge */}
        <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
          store.isOpen ? 'bg-green-500 text-white' : 'bg-gray-700/80 text-white'
        }`}>
          {store.isOpen ? 'Open' : 'Closed'}
        </div>
        {/* Store logo */}
        <div className="absolute -bottom-5 left-4">
          <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md overflow-hidden bg-white">
            <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pt-8">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-primary-600 transition-colors">
            {store.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-gray-800">{store.rating}</span>
            <span className="text-xs text-gray-400">({store.reviewCount})</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {store.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge-green text-[10px]">{tag}</span>
          ))}
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-primary-400" />
              {store.deliveryTime}
            </span>
            <span className="flex items-center gap-1">
              <Bike size={11} className="text-primary-400" />
              {store.deliveryFee === 0 ? 'Free delivery' : `LKR ${store.deliveryFee}`}
            </span>
          </div>
          {store.distance && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {store.distance}
            </span>
          )}
        </div>

        {/* Min order */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Min. order: <strong className="text-gray-700">LKR {store.minOrder}</strong></span>
          <span className="flex items-center gap-0.5 text-xs font-semibold text-primary-500 group-hover:gap-1.5 transition-all">
            Shop now <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

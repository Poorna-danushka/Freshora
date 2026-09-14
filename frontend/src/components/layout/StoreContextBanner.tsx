import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useActiveStoreStore } from '@/store/useActiveStoreStore';

export const StoreContextBanner: React.FC = () => {
  const { activeStore } = useActiveStoreStore();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  const hiddenPaths = ['/', '/login', '/signup', '/forgot-password'];
  const shouldShow = activeStore && !hiddenPaths.includes(location.pathname);

  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  if (!isVisible && !shouldShow) return null;

  return (
    <div 
      className={`w-full bg-primary-500 py-2 transition-transform duration-300 ease-in-out ${shouldShow ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-[14px] h-[14px] text-white" />
          <span className="text-white/80 text-xs">Shopping from</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
            <span className="text-white text-xs font-bold">{activeStore?.name}</span>
          </div>
        </div>
        <Link 
          to="/"
          className="text-white/70 hover:text-white text-xs transition-colors duration-200"
        >
          Change
        </Link>
      </div>
    </div>
  );
};

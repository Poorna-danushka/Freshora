import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentStoreName: string;
  newStoreName: string;
}

export const StoreSwitchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  currentStoreName,
  newStoreName,
}) => {
  const { itemCount } = useCartStore();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white w-full max-w-sm rounded-3xl shadow-modal p-6 transform transition-all duration-300 scale-95 opacity-0 animate-[scaleIn_0.2s_ease-out_forwards]"
        role="dialog"
        aria-modal="true"
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}} />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">Switch stores?</h3>
          
          <p className="text-sm text-gray-500 mb-2">
            Your cart from <span className="font-semibold text-gray-700">{currentStoreName}</span> will be cleared if you switch to <span className="font-semibold text-gray-700">{newStoreName}</span>.
          </p>
          
          <p className="text-sm font-medium text-amber-600 mb-6 bg-amber-50 px-3 py-1 rounded-full">
            You have {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
          </p>
          
          <div className="w-full flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Keep Shopping
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
            >
              Switch Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

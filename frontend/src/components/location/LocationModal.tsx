import { MapPin, Search, X, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { locationApi } from '@/api/locations';
import { useLocationStore } from '@/store/useLocationStore';
import type { Location } from '@/types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const { setLocation, selectedLocation } = useLocationStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      locationApi.getLocations().then((locs) => {
        setLocations(locs);
        setLoading(false);
      });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      locationApi.getLocations().then(setLocations);
      return;
    }
    const timer = setTimeout(() => {
      locationApi.searchLocations(query).then(setLocations);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (location: Location) => {
    setLocation(location);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-modal w-full max-w-lg overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Choose Delivery Location</h2>
              <p className="text-sm text-gray-500 mt-0.5">Stores are shown based on your location</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search area, street or postal code..."
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Current location */}
        {selectedLocation && (
          <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
            <p className="text-xs text-primary-600 font-medium mb-1">Current Location</p>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary-500" />
              <span className="text-sm font-semibold text-primary-700">
                {selectedLocation.name} — {selectedLocation.area}
              </span>
            </div>
          </div>
        )}

        {/* Locations list */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-12 w-full" />
              ))}
            </div>
          ) : locations.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No areas found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              {!query && (
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Colombo & Suburbs
                </p>
              )}
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => handleSelect(loc)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group ${
                    selectedLocation?.id === loc.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${selectedLocation?.id === loc.id ? 'bg-primary-100' : 'bg-gray-100 group-hover:bg-primary-50'}`}>
                      <MapPin size={14} className={selectedLocation?.id === loc.id ? 'text-primary-600' : 'text-gray-500'} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-semibold ${selectedLocation?.id === loc.id ? 'text-primary-700' : 'text-gray-800'}`}>
                        {loc.name}
                      </p>
                      <p className="text-xs text-gray-500">{loc.area}{loc.postalCode ? ` · ${loc.postalCode}` : ''}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-400 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

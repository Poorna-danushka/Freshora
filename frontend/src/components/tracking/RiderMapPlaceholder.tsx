import React from 'react';
import { MapPin, Clock } from 'lucide-react';

interface Props {
  estimatedMinutes?: number;
  isRiderAssigned?: boolean;
}

export const RiderMapPlaceholder: React.FC<Props> = ({ 
  estimatedMinutes = 15, 
  isRiderAssigned = true 
}) => {
  return (
    <div className="w-full h-[280px] rounded-3xl overflow-hidden bg-[#1a1f2e] relative shadow-inner">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes float-rider {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}} />

      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center'
        }}
      />

      {isRiderAssigned ? (
        <>
          {/* Animated Route Line */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path
              d="M 50,50 Q 150,150 250,230"
              fill="none"
              stroke="#4ade80"
              strokeWidth="3"
              strokeDasharray="8 8"
              strokeDashoffset="100"
              className="animate-[dash_3s_linear_infinite]"
              style={{ animationDirection: 'reverse' }}
            />
          </svg>

          {/* Destination Pin */}
          <div className="absolute bottom-8 right-8 flex items-center justify-center">
            {/* Ripple effect */}
            <div className="absolute w-6 h-6 bg-red-500 rounded-full animate-[ripple_2s_infinite]" />
            <div className="relative w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
          </div>

          {/* Rider Icon */}
          <div className="absolute top-10 left-10 flex flex-col items-center justify-center animate-[float-rider_2s_ease-in-out_infinite]">
            {/* Ripple effect */}
            <div className="absolute w-8 h-8 bg-primary-500 rounded-full animate-[ripple_1.5s_infinite]" />
            <div className="relative w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-[#1a1f2e]">
              <span className="text-lg leading-none">🛵</span>
            </div>
            {/* Shadow */}
            <div className="w-4 h-1.5 bg-black/40 rounded-full mt-1 blur-[1px]" />
          </div>

          {/* Status Overlay */}
          <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center shadow-lg">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse" />
            LIVE
          </div>

          {/* ETA Card Overlay */}
          <div className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-3 shadow-lg opacity-0 animate-[fadeIn_0.5s_ease-out_0.5s_forwards]">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes fadeIn {
                to { opacity: 1; transform: translateY(0); }
                from { opacity: 0; transform: translateY(10px); }
              }
            `}} />
            <div className="flex items-center text-gray-500 text-xs mb-0.5">
              <Clock className="w-3.5 h-3.5 mr-1" />
              Arriving in
            </div>
            <div className="text-primary-600 font-bold text-lg">
              {estimatedMinutes} min
            </div>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 bg-[#1a1f2e]/60 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm z-20">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-white font-semibold mb-2">Rider will be assigned soon</h3>
          <p className="text-white/60 text-sm max-w-[200px]">Map will activate when rider picks up your order</p>
        </div>
      )}
    </div>
  );
};

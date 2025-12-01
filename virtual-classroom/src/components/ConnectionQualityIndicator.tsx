import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import type { ConnectionQuality } from '../types';

interface ConnectionQualityIndicatorProps {
  quality: ConnectionQuality;
  showLabel?: boolean;
}

export default function ConnectionQualityIndicator({
  quality,
  showLabel = false
}: ConnectionQualityIndicatorProps) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Show warning for poor or bad quality
    if (quality === 'poor' || quality === 'bad') {
      setShowWarning(true);
      
      // Auto-hide warning after 5 seconds
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setShowWarning(false);
    }
  }, [quality]);

  const getQualityConfig = () => {
    switch (quality) {
      case 'excellent':
        return {
          color: 'bg-green-500',
          label: 'Excellent',
          bars: 4
        };
      case 'good':
        return {
          color: 'bg-green-500',
          label: 'Good',
          bars: 3
        };
      case 'poor':
        return {
          color: 'bg-yellow-500',
          label: 'Poor',
          bars: 2
        };
      case 'bad':
        return {
          color: 'bg-red-500',
          label: 'Bad',
          bars: 1
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Unknown',
          bars: 0
        };
    }
  };

  const config = getQualityConfig();

  return (
    <div className="relative">
      {/* Connection quality bars with modern styling */}
      <div 
        className="flex items-end gap-0.5 h-4"
        role="status"
        aria-label={`Connection quality: ${config.label}`}
        title={`Connection quality: ${config.label}`}
      >
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-full transition-all duration-300 shadow-sm ${
              bar <= config.bars ? config.color : 'bg-white/30'
            } ${bar <= config.bars && (quality === 'poor' || quality === 'bad') ? 'animate-pulse' : ''}`}
            style={{ 
              height: `${bar * 25}%`,
              animationDelay: `${bar * 100}ms`
            }}
          />
        ))}
      </div>

      {/* Label */}
      {showLabel && (
        <span className="text-xs text-white ml-2 font-medium">{config.label}</span>
      )}

      {/* Warning notification with glass effect */}
      {showWarning && (
        <div 
          className="absolute top-full right-0 mt-2 w-64 glass-dark rounded-xl shadow-xl p-3 border border-yellow-500/30 border-l-4 border-l-yellow-500 animate-slide-in z-10"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium text-white">
                Connection Quality {quality === 'bad' ? 'Critical' : 'Degraded'}
              </p>
              <p className="text-xs text-white/70 mt-1">
                {quality === 'bad'
                  ? 'Your connection is unstable. Video quality has been reduced.'
                  : 'Your connection quality is low. Consider checking your network.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

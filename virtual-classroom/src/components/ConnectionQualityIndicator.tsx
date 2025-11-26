import { useState, useEffect } from 'react';
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
      {/* Connection quality bars - Light theme */}
      <div 
        className="flex items-end gap-0.5 h-4"
        role="status"
        aria-label={`Connection quality: ${config.label}`}
        title={`Connection quality: ${config.label}`}
      >
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`w-1 rounded-sm transition-all duration-300 ${
              bar <= config.bars ? config.color : 'bg-gray-300'
            } ${bar <= config.bars && (quality === 'poor' || quality === 'bad') ? 'animate-pulse' : ''}`}
            style={{ height: `${bar * 25}%` }}
          />
        ))}
      </div>

      {/* Label */}
      {showLabel && (
        <span className="text-xs text-gray-700 ml-2 font-medium">{config.label}</span>
      )}

      {/* Warning notification - Light theme */}
      {showWarning && (
        <div 
          className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-3 border border-yellow-200 border-l-4 border-l-yellow-500 animate-slide-in z-10"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Connection Quality {quality === 'bad' ? 'Critical' : 'Degraded'}
              </p>
              <p className="text-xs text-gray-600 mt-1">
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

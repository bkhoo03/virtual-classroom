/**
 * Modern spinner component with yellow brand colors
 * Supports multiple sizes and smooth rotation animation
 */
import { memo } from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

function Spinner({ size = 'medium', className = '' }: SpinnerProps) {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const borderWidthClasses = {
    small: 'border-2',
    medium: 'border-4',
    large: 'border-[5px]',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Background circle */}
      <div
        className={`absolute inset-0 rounded-full ${borderWidthClasses[size]} border-yellow-200`}
      />
      {/* Spinning circle */}
      <div
        className={`absolute inset-0 rounded-full ${borderWidthClasses[size]} border-yellow-500 border-t-transparent animate-spin`}
        style={{
          animationDuration: '0.8s',
          animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
      {/* Inner glow effect */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          boxShadow: '0 0 20px rgba(253, 197, 0, 0.3)',
          animationDuration: '1.5s',
        }}
      />
    </div>
  );
}

export default memo(Spinner);

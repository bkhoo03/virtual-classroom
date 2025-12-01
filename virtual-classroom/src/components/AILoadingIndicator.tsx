/**
 * AI Loading Indicator Component
 * Beautiful animated loading indicator for AI responses with yellow accents
 */
import { memo } from 'react';
import { Sparkles } from 'lucide-react';

interface AILoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

function AILoadingIndicator({ 
  message = 'AI is thinking...', 
  size = 'medium' 
}: AILoadingIndicatorProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const dotSizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      {/* Animated spinner with yellow glow */}
      <div className="relative">
        {/* Outer glow ring */}
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 animate-pulse`}
          style={{ animationDuration: '2s' }}
        />
        
        {/* Spinning ring */}
        <div className="absolute inset-0">
          <div 
            className={`${sizeClasses[size]} rounded-full border-4 border-yellow-200`}
          />
          <div 
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full border-4 border-yellow-500 border-t-transparent animate-spin`}
            style={{
              animationDuration: '1s',
              animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* Center sparkle icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles 
            className="text-yellow-500 animate-pulse" 
            size={size === 'small' ? 16 : size === 'medium' ? 20 : 24}
            style={{ animationDuration: '1.5s' }}
          />
        </div>

        {/* Pulsing glow effect */}
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(253, 197, 0, 0.4) 0%, transparent 70%)',
            animationDuration: '2s',
          }}
        />
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-2">
        <div 
          className={`${dotSizeClasses[size]} rounded-full bg-yellow-500 animate-bounce`}
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        />
        <div 
          className={`${dotSizeClasses[size]} rounded-full bg-yellow-500 animate-bounce`}
          style={{ animationDelay: '150ms', animationDuration: '1s' }}
        />
        <div 
          className={`${dotSizeClasses[size]} rounded-full bg-yellow-500 animate-bounce`}
          style={{ animationDelay: '300ms', animationDuration: '1s' }}
        />
      </div>

      {/* Message text */}
      {message && (
        <p className="text-sm font-medium text-gray-700 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

export default memo(AILoadingIndicator);

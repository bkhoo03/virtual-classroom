/**
 * Skeleton loading component for AI Output Panel
 * Displays a shimmer effect with brand colors during initial load
 */
export default function AIOutputSkeleton() {
  return (
    <div className="h-full bg-white flex flex-col overflow-hidden animate-fade-in">
      {/* Header placeholder */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>

      {/* Content area placeholder */}
      <div className="flex-1 p-6 space-y-4 overflow-hidden">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 bg-gradient-to-r from-purple-100 via-purple-50 to-purple-100 rounded w-3/4 relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded w-5/6 relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
        </div>

        {/* Main content skeleton - large visualization area */}
        <div className="h-64 bg-gradient-to-br from-purple-50 via-purple-25 to-yellow-50 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 shimmer-slow" />
          
          {/* Decorative elements to suggest content */}
          <div className="absolute inset-0 p-6 space-y-4">
            <div className="h-8 bg-white/40 rounded w-1/3 animate-pulse" />
            <div className="h-4 bg-white/40 rounded w-1/2 animate-pulse" />
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="h-24 bg-white/40 rounded animate-pulse" />
              <div className="h-24 bg-white/40 rounded animate-pulse" />
              <div className="h-24 bg-white/40 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Additional content skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded w-4/5 relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
        <div className="h-10 bg-purple-100 rounded-lg w-24 animate-pulse" />
        <div className="h-10 bg-gray-100 rounded-lg w-24 animate-pulse" />
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes shimmer-slow {
          0% {
            transform: translateX(-100%) translateY(-100%);
          }
          100% {
            transform: translateX(100%) translateY(100%);
          }
        }
        
        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.6),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        
        .shimmer-slow::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            135deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer-slow 3s infinite;
        }
      `}</style>
    </div>
  );
}

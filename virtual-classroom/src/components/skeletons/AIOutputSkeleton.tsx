/**
 * Skeleton loading component for AI Output Panel
 * Displays a modern shimmer effect with yellow accents and glass-morphism
 */
export default function AIOutputSkeleton() {
  return (
    <div className="h-full bg-white flex flex-col overflow-hidden animate-fade-in">
      {/* Header placeholder with glass effect */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between backdrop-blur-sm bg-white/80">
        <div className="flex-1">
          <div className="h-5 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded w-32 mb-2 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
          <div className="h-3 bg-gradient-to-r from-gray-200 via-yellow-50 to-gray-200 rounded w-48 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <div className="h-3 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded w-16 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
        </div>
      </div>

      {/* Content area placeholder */}
      <div className="flex-1 p-6 space-y-4 overflow-hidden">
        {/* Title skeleton with yellow shimmer */}
        <div className="space-y-2">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg w-3/4 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-50 to-gray-200 rounded-lg w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-50 to-gray-200 rounded-lg w-5/6 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
        </div>

        {/* Main content skeleton with glass effect */}
        <div className="h-64 bg-gradient-to-br from-yellow-50/50 via-purple-50/30 to-yellow-50/50 rounded-2xl relative overflow-hidden backdrop-blur-sm border border-yellow-200/30">
          <div className="absolute inset-0 shimmer-slow-yellow" />
          
          {/* Decorative elements with glass effect */}
          <div className="absolute inset-0 p-6 space-y-4">
            <div className="h-8 bg-white/60 backdrop-blur-sm rounded-lg w-1/3 relative overflow-hidden border border-yellow-200/20">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
            <div className="h-4 bg-white/60 backdrop-blur-sm rounded-lg w-1/2 relative overflow-hidden border border-yellow-200/20">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="h-24 bg-white/60 backdrop-blur-sm rounded-xl relative overflow-hidden border border-yellow-200/20">
                <div className="absolute inset-0 shimmer-yellow" />
              </div>
              <div className="h-24 bg-white/60 backdrop-blur-sm rounded-xl relative overflow-hidden border border-yellow-200/20">
                <div className="absolute inset-0 shimmer-yellow" />
              </div>
              <div className="h-24 bg-white/60 backdrop-blur-sm rounded-xl relative overflow-hidden border border-yellow-200/20">
                <div className="absolute inset-0 shimmer-yellow" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional content skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-50 to-gray-200 rounded-lg w-full relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
          <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-50 to-gray-200 rounded-lg w-4/5 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
        </div>
      </div>

      {/* Footer skeleton with yellow accents */}
      <div className="px-4 py-3 border-t border-gray-200 flex gap-2 backdrop-blur-sm bg-white/80">
        <div className="h-10 bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-100 rounded-xl w-24 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-yellow" />
        </div>
        <div className="h-10 bg-gradient-to-r from-gray-200 via-yellow-50 to-gray-200 rounded-xl w-24 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-yellow" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer-yellow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        @keyframes shimmer-slow-yellow {
          0% {
            transform: translateX(-100%) translateY(-100%);
          }
          100% {
            transform: translateX(100%) translateY(100%);
          }
        }
        
        .shimmer-yellow::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(253, 197, 0, 0.4),
            transparent
          );
          animation: shimmer-yellow 1.5s infinite;
        }
        
        .shimmer-slow-yellow::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            135deg,
            transparent,
            rgba(253, 197, 0, 0.2),
            transparent
          );
          animation: shimmer-slow-yellow 2.5s infinite;
        }
      `}</style>
    </div>
  );
}

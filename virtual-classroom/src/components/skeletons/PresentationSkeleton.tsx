/**
 * Skeleton loading component for Presentation Panel
 * Displays a modern shimmer effect with yellow accents and glass-morphism
 */
export default function PresentationSkeleton() {
  return (
    <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Mode switcher placeholder with glass effect */}
      <div className="bg-[#0f0f1e] px-6 py-4 flex gap-2 backdrop-blur-sm">
        <div className="w-20 h-8 bg-gradient-to-r from-white/10 via-yellow-500/20 to-white/10 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 shimmer-yellow" />
        </div>
        <div className="w-24 h-8 bg-gradient-to-r from-white/10 via-yellow-500/20 to-white/10 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 shimmer-yellow" />
        </div>
        <div className="w-24 h-8 bg-gradient-to-r from-white/10 via-yellow-500/20 to-white/10 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 shimmer-yellow" />
        </div>
      </div>

      {/* Content area placeholder with yellow shimmer */}
      <div className="relative h-[calc(100%-4rem)] bg-gradient-to-br from-yellow-50/30 via-purple-50/20 to-yellow-50/30 overflow-hidden">
        <div className="absolute inset-0 shimmer-slow-yellow" />
        
        {/* Document/content placeholder with glass effect */}
        <div className="absolute inset-8 backdrop-blur-sm bg-white/60 rounded-2xl shadow-inner border border-yellow-200/30">
          <div className="p-8 space-y-4">
            <div className="h-6 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg w-3/4 relative overflow-hidden">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
            <div className="h-6 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg w-full relative overflow-hidden">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
            <div className="h-6 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg w-5/6 relative overflow-hidden">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
            <div className="h-6 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg w-4/5 relative overflow-hidden">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
            <div className="mt-8 h-32 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-100 rounded-xl relative overflow-hidden border border-yellow-200/30">
              <div className="absolute inset-0 shimmer-slow-yellow" />
            </div>
          </div>
        </div>

        {/* Zoom controls placeholder with glass effect */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="w-10 h-10 backdrop-blur-sm bg-white/80 rounded-xl shadow-lg border border-yellow-200/30 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
          <div className="w-10 h-10 backdrop-blur-sm bg-white/80 rounded-xl shadow-lg border border-yellow-200/30 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
          <div className="w-10 h-10 backdrop-blur-sm bg-white/80 rounded-xl shadow-lg border border-yellow-200/30 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
        </div>

        {/* Navigation controls placeholder with glass effect */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <div className="w-12 h-12 backdrop-blur-sm bg-white/80 rounded-full shadow-lg border border-yellow-200/30 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
          <div className="w-20 h-6 backdrop-blur-sm bg-white/80 rounded-lg shadow-lg border border-yellow-200/30 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
          <div className="w-12 h-12 backdrop-blur-sm bg-white/80 rounded-full shadow-lg border border-yellow-200/30 relative overflow-hidden">
            <div className="absolute inset-0 shimmer-yellow" />
          </div>
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
            rgba(253, 197, 0, 0.3),
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

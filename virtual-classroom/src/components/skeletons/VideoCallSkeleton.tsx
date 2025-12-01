/**
 * Skeleton loading component for Video Call Module
 * Displays a modern shimmer effect with yellow accents and glass-morphism
 */
import { memo } from 'react';

function VideoCallSkeleton() {
  return (
    <div className="h-full bg-white rounded-2xl shadow-lg p-6">
      {/* Video stream placeholders with glass effect */}
      <div className="space-y-4">
        {/* Tutor video placeholder */}
        <div className="relative aspect-video bg-gradient-to-br from-yellow-50/30 via-purple-50/20 to-yellow-50/30 rounded-2xl overflow-hidden border border-yellow-200/30">
          <div className="absolute inset-0 shimmer-slow-yellow" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 backdrop-blur-sm bg-white/80 px-3 py-2 rounded-xl border border-yellow-200/30">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
            <div className="w-20 h-4 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
          </div>
        </div>

        {/* Tutee video placeholder */}
        <div className="relative aspect-video bg-gradient-to-br from-yellow-50/30 via-purple-50/20 to-yellow-50/30 rounded-2xl overflow-hidden border border-yellow-200/30">
          <div className="absolute inset-0 shimmer-slow-yellow" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2 backdrop-blur-sm bg-white/80 px-3 py-2 rounded-xl border border-yellow-200/30">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
            <div className="w-20 h-4 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 shimmer-yellow" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls placeholder with glass effect */}
      <div className="mt-4 flex justify-center gap-3">
        <div className="w-10 h-10 backdrop-blur-sm bg-yellow-500/20 rounded-xl border border-yellow-200/30 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 shimmer-yellow" />
        </div>
        <div className="w-10 h-10 backdrop-blur-sm bg-yellow-500/20 rounded-xl border border-yellow-200/30 relative overflow-hidden shadow-lg">
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

export default memo(VideoCallSkeleton);

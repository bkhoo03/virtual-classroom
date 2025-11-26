/**
 * Skeleton loading component for Video Call Module
 * Displays a shimmer effect with brand colors during initial load
 */
import { memo } from 'react';

function VideoCallSkeleton() {
  return (
    <div className="h-full bg-white rounded-2xl shadow-lg p-6 animate-pulse">
      {/* Video stream placeholders */}
      <div className="space-y-4">
        {/* Tutor video placeholder */}
        <div className="relative aspect-video bg-gradient-to-r from-[#5C0099]/10 via-[#C86BFA]/10 to-[#5C0099]/10 rounded-xl overflow-hidden">
          <div className="absolute inset-0 shimmer" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full" />
            <div className="w-20 h-4 bg-white/20 rounded" />
          </div>
        </div>

        {/* Tutee video placeholder */}
        <div className="relative aspect-video bg-gradient-to-r from-[#5C0099]/10 via-[#C86BFA]/10 to-[#5C0099]/10 rounded-xl overflow-hidden">
          <div className="absolute inset-0 shimmer" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full" />
            <div className="w-20 h-4 bg-white/20 rounded" />
          </div>
        </div>
      </div>

      {/* Controls placeholder */}
      <div className="mt-4 flex justify-center gap-3">
        <div className="w-10 h-10 bg-[#5C0099]/20 rounded-full" />
        <div className="w-10 h-10 bg-[#5C0099]/20 rounded-full" />
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
            rgba(255, 255, 255, 0.3),
            transparent
          );
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default memo(VideoCallSkeleton);

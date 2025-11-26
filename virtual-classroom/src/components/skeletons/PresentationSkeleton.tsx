/**
 * Skeleton loading component for Presentation Panel
 * Displays a shimmer effect with brand colors during initial load
 */
export default function PresentationSkeleton() {
  return (
    <div className="h-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Mode switcher placeholder */}
      <div className="bg-[#0f0f1e] px-6 py-4 flex gap-2">
        <div className="w-20 h-8 bg-white/10 rounded-full animate-pulse" />
        <div className="w-24 h-8 bg-white/10 rounded-full animate-pulse" />
        <div className="w-24 h-8 bg-white/10 rounded-full animate-pulse" />
      </div>

      {/* Content area placeholder */}
      <div className="relative h-[calc(100%-4rem)] bg-gradient-to-br from-[#5C0099]/5 via-[#C86BFA]/5 to-[#FDC500]/5 overflow-hidden">
        <div className="absolute inset-0 shimmer" />
        
        {/* Document/content placeholder */}
        <div className="absolute inset-8 bg-white/50 rounded-lg shadow-inner">
          <div className="p-8 space-y-4">
            <div className="h-6 bg-[#5C0099]/10 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-[#5C0099]/10 rounded w-full animate-pulse" />
            <div className="h-6 bg-[#5C0099]/10 rounded w-5/6 animate-pulse" />
            <div className="h-6 bg-[#5C0099]/10 rounded w-4/5 animate-pulse" />
            <div className="mt-8 h-32 bg-[#C86BFA]/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Zoom controls placeholder */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <div className="w-10 h-10 bg-white/80 rounded-lg shadow animate-pulse" />
          <div className="w-10 h-10 bg-white/80 rounded-lg shadow animate-pulse" />
          <div className="w-10 h-10 bg-white/80 rounded-lg shadow animate-pulse" />
        </div>

        {/* Navigation controls placeholder */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/80 rounded-full shadow animate-pulse" />
          <div className="w-20 h-6 bg-white/80 rounded shadow animate-pulse" />
          <div className="w-12 h-12 bg-white/80 rounded-full shadow animate-pulse" />
        </div>
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
            rgba(253, 197, 0, 0.1),
            transparent
          );
          animation: shimmer 2.5s infinite;
        }
      `}</style>
    </div>
  );
}

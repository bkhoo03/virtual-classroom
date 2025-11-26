/**
 * Skeleton loading component for AI Assistant Chat
 * Displays a shimmer effect with brand colors during initial load
 */
export default function ChatSkeleton() {
  return (
    <div className="h-full bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header placeholder */}
      <div className="bg-[#0f0f1e] px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#5C0099]/30 rounded-full animate-pulse" />
        <div className="w-32 h-5 bg-white/20 rounded animate-pulse" />
      </div>

      {/* Messages area placeholder */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* AI message */}
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-gradient-to-r from-[#5C0099]/10 via-[#C86BFA]/10 to-[#5C0099]/10 rounded-xl rounded-bl-sm p-4 relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
            <div className="space-y-2 relative z-10">
              <div className="h-4 bg-white/40 rounded w-48" />
              <div className="h-4 bg-white/40 rounded w-40" />
            </div>
          </div>
        </div>

        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[80%] bg-[#5C0099]/20 rounded-xl rounded-br-sm p-4 relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
            <div className="space-y-2 relative z-10">
              <div className="h-4 bg-white/40 rounded w-32" />
            </div>
          </div>
        </div>

        {/* AI message with media */}
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-gradient-to-r from-[#5C0099]/10 via-[#C86BFA]/10 to-[#5C0099]/10 rounded-xl rounded-bl-sm p-4 relative overflow-hidden">
            <div className="absolute inset-0 shimmer" />
            <div className="space-y-3 relative z-10">
              <div className="h-4 bg-white/40 rounded w-56" />
              <div className="h-32 bg-[#FDC500]/20 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Input area placeholder */}
      <div className="border-t border-gray-200 p-4 flex gap-2">
        <div className="flex-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
        <div className="w-10 h-10 bg-[#FDC500]/30 rounded-full animate-pulse" />
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
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

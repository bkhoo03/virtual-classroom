/**
 * Skeleton loading component for AI Assistant Chat
 * Displays a modern shimmer effect with yellow accents and glass-morphism
 */
export default function ChatSkeleton() {
  return (
    <div className="h-full bg-white rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header placeholder with glass effect */}
      <div className="bg-[#0f0f1e] px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 shimmer-yellow" />
        </div>
        <div className="w-32 h-5 bg-gradient-to-r from-white/10 via-yellow-500/20 to-white/10 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 shimmer-yellow" />
        </div>
      </div>

      {/* Messages area placeholder */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* AI message with glass effect */}
        <div className="flex justify-start">
          <div className="max-w-[80%] backdrop-blur-sm bg-white/80 border border-gray-200/50 rounded-2xl rounded-bl-sm p-4 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 shimmer-yellow" />
            <div className="space-y-2 relative z-10">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg w-48 relative overflow-hidden">
                <div className="absolute inset-0 shimmer-yellow" />
              </div>
              <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg w-40 relative overflow-hidden">
                <div className="absolute inset-0 shimmer-yellow" />
              </div>
            </div>
          </div>
        </div>

        {/* User message with yellow glass effect */}
        <div className="flex justify-end">
          <div className="max-w-[80%] backdrop-blur-sm bg-yellow-500/10 border border-yellow-200/50 rounded-2xl rounded-br-sm p-4 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 shimmer-yellow" />
            <div className="space-y-2 relative z-10">
              <div className="h-4 bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 rounded-lg w-32 relative overflow-hidden">
                <div className="absolute inset-0 shimmer-yellow" />
              </div>
            </div>
          </div>
        </div>

        {/* AI message with media and glass effect */}
        <div className="flex justify-start">
          <div className="max-w-[80%] backdrop-blur-sm bg-white/80 border border-gray-200/50 rounded-2xl rounded-bl-sm p-4 relative overflow-hidden shadow-sm">
            <div className="absolute inset-0 shimmer-yellow" />
            <div className="space-y-3 relative z-10">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded-lg w-56 relative overflow-hidden">
                <div className="absolute inset-0 shimmer-yellow" />
              </div>
              <div className="h-32 bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-100 rounded-xl relative overflow-hidden border border-yellow-200/30">
                <div className="absolute inset-0 shimmer-slow-yellow" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input area placeholder with glass effect */}
      <div className="border-t border-gray-200 p-4 flex gap-2 backdrop-blur-sm bg-white/80">
        <div className="flex-1 h-10 bg-gradient-to-r from-gray-100 via-yellow-50 to-gray-100 rounded-xl relative overflow-hidden">
          <div className="absolute inset-0 shimmer-yellow" />
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl relative overflow-hidden shadow-lg shadow-yellow-500/30">
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

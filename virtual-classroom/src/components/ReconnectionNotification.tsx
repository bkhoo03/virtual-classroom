import { useEffect, useState } from 'react';

interface ReconnectionNotificationProps {
  isReconnecting: boolean;
  reconnectAttempt: number;
  maxAttempts: number;
  onManualReconnect?: () => void;
}

export default function ReconnectionNotification({
  isReconnecting,
  reconnectAttempt,
  maxAttempts,
  onManualReconnect
}: ReconnectionNotificationProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!isReconnecting) {
      setTimeElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isReconnecting]);

  if (!isReconnecting) return null;

  const isLastAttempt = reconnectAttempt >= maxAttempts;
  const timeRemaining = Math.max(0, 60 - timeElapsed);

  return (
    <div 
      className="fixed bottom-20 right-4 w-80 bg-white rounded-lg shadow-xl border-l-4 border-yellow-500 p-3 animate-slide-in z-40"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          {isLastAttempt ? (
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <div className="relative">
              <svg
                className="w-6 h-6 text-yellow-500 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            {isLastAttempt ? 'Connection Lost' : 'Reconnecting...'}
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            {isLastAttempt ? (
              'Unable to reconnect to the video call.'
            ) : (
              <>
                Attempt {reconnectAttempt} of {maxAttempts}
                {timeRemaining > 0 && ` • ${timeRemaining}s remaining`}
              </>
            )}
          </p>

          {/* Progress bar */}
          {!isLastAttempt && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-yellow-500 h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${(timeElapsed / 60) * 100}%` }}
              />
            </div>
          )}

          {/* Manual reconnect button */}
          {isLastAttempt && onManualReconnect && (
            <button
              onClick={onManualReconnect}
              className="mt-3 w-full px-4 py-2 bg-[#5C0099] hover:bg-[#C86BFA] text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          )}
        </div>

        {/* Close button for last attempt */}
        {isLastAttempt && (
          <button
            onClick={() => {}}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import type { ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface ScreenShareDisplayProps {
  screenTrack: ILocalVideoTrack | IRemoteVideoTrack | null;
  isLocal?: boolean;
}

export default function ScreenShareDisplay({
  screenTrack,
  isLocal = true,
}: ScreenShareDisplayProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!screenTrack || !videoRef.current) {
      setIsPlaying(false);
      return;
    }

    try {
      // Play the screen track in the container
      screenTrack.play(videoRef.current);
      setIsPlaying(true);
      console.log('Screen share track playing');
    } catch (error) {
      console.error('Error playing screen share track:', error);
      setIsPlaying(false);
    }

    return () => {
      try {
        if (screenTrack) {
          screenTrack.stop();
        }
      } catch (error) {
        console.error('Error stopping screen share track:', error);
      }
    };
  }, [screenTrack]);

  if (!screenTrack) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-[#0f0f1e]">
        <div className="w-20 h-20 bg-[#5C0099]/20 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-[#C86BFA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          {isLocal ? 'Start Screen Sharing' : 'Waiting for Screen Share'}
        </h3>
        <p className="text-white/60 text-center max-w-md">
          {isLocal
            ? 'Click the "Share Screen" button to start sharing your screen with participants.'
            : 'The presenter will share their screen here when ready.'}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-[#0f0f1e] relative">
      {/* Screen share video container */}
      <div
        ref={videoRef}
        className="flex-1 relative"
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* Status indicator */}
      {isPlaying && (
        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg z-20">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          {isLocal ? 'Sharing Screen' : 'Viewing Screen Share'}
        </div>
      )}
    </div>
  );
}

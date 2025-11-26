import { useEffect, useRef, memo } from 'react';
import type { ILocalVideoTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface VideoPlayerProps {
  videoTrack: ILocalVideoTrack | IRemoteVideoTrack | null;
  userName: string;
  isLocal?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'bad';
  audioMuted?: boolean;
  videoOff?: boolean;
}

function VideoPlayer({
  videoTrack,
  userName,
  isLocal = false,
  connectionQuality = 'good',
  audioMuted = false,
  videoOff = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack && videoRef.current) {
      // Play the video track in the div
      videoTrack.play(videoRef.current);
    }

    return () => {
      if (videoTrack && videoRef.current) {
        videoTrack.stop();
      }
    };
  }, [videoTrack]);

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent':
      case 'good':
        return 'bg-green-500';
      case 'poor':
        return 'bg-yellow-500';
      case 'bad':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Generate ARIA label for screen readers
  const ariaLabel = `${userName}${isLocal ? ' (You)' : ''} video ${videoOff ? 'off' : 'on'}${audioMuted ? ', microphone muted' : ''}. Connection quality: ${connectionQuality}`;

  return (
    <div 
      className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl overflow-hidden"
      role="region"
      aria-label={ariaLabel}
    >
      {/* Video container */}
      <div
        ref={videoRef}
        className="w-full h-full"
        style={{ objectFit: 'cover' }}
        aria-hidden={videoOff}
      />

      {/* Camera off overlay - AI-themed, compact */}
      {videoOff && (
        <div 
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          role="status"
          aria-label={`${userName}'s camera is off`}
        >
          {/* Animated AI background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#03071E] via-[#1a0b2e] to-[#0a0420]">
            {/* Animated orbs - smaller and more subtle */}
            <div className="absolute w-48 h-48 bg-[#5C0099] rounded-full blur-[80px] opacity-20 -top-10 -left-10 animate-pulse" style={{ animationDuration: '3s' }}></div>
            <div className="absolute w-32 h-32 bg-[#C86BFA] rounded-full blur-[60px] opacity-15 bottom-0 right-0 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          </div>
          
          {/* Center content - subtle and elegant */}
          <div className="relative text-center z-10">
            {/* Glowing camera icon */}
            <div className="relative inline-block">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5C0099] to-[#C86BFA] rounded-full blur-md opacity-40 animate-pulse"></div>
              {/* Icon container */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-[#5C0099] to-[#C86BFA] rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status indicators - Top right corner, outside overlay */}
      {isLocal && (audioMuted || videoOff) && (
        <div className="absolute top-2 right-2 flex gap-1 z-20" role="status" aria-live="polite">
          {/* Microphone status */}
          {audioMuted && (
            <div 
              className="bg-red-500/90 backdrop-blur-sm p-1 rounded shadow-md"
              aria-label="Microphone muted"
              title="Microphone muted"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
              </svg>
            </div>
          )}
          
          {/* Video status */}
          {videoOff && (
            <div 
              className="bg-red-500/90 backdrop-blur-sm p-1 rounded shadow-md"
              aria-label="Camera off"
              title="Camera off"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Participant name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        {/* Name and connection quality */}
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium">
            {userName} {isLocal && '(You)'}
          </span>
          
          {/* Connection quality indicator - wifi signal */}
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${getQualityColor()} animate-pulse`}
              role="status"
              aria-label={`Connection quality: ${connectionQuality}`}
              title={`Connection quality: ${connectionQuality}`}
            />
          </div>
        </div>
      </div>

      {/* Placeholder when no video track at all */}
      {!videoTrack && !videoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black">
          <div className="text-center">
            <div className="w-20 h-20 bg-[#5C0099] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <span className="text-white text-3xl font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-white/80 text-sm font-medium">{userName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(VideoPlayer);

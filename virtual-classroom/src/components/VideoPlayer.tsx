import { useEffect, useRef, memo } from 'react';
import { MicOff, VideoOff, User } from 'lucide-react';
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
      className="relative w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden"
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
          className="absolute inset-0 flex items-center justify-center overflow-hidden animate-fade-in"
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
          <div className="relative text-center z-10 animate-scale-in">
            {/* Glowing camera icon - BIGGER */}
            <div className="relative inline-block">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5C0099] to-[#C86BFA] rounded-full blur-xl opacity-40 animate-pulse"></div>
              {/* Icon container - BIGGER */}
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#5C0099] to-[#C86BFA] rounded-full flex items-center justify-center shadow-lg">
                <VideoOff className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status indicators - Top right corner with RED HALO glass effect - BIGGER */}
      {isLocal && (audioMuted || videoOff) && (
        <div className="absolute top-3 right-3 flex gap-2 z-20 animate-fade-in" role="status" aria-live="polite">
          {/* Microphone status - BIGGER with RED HALO */}
          {audioMuted && (
            <div className="relative">
              {/* Red glow halo */}
              <div className="absolute inset-0 bg-red-500/30 rounded-xl blur-md animate-pulse" style={{ animationDuration: '2s' }}></div>
              {/* Glass container with red tint */}
              <div 
                className="relative backdrop-blur-sm bg-red-500/20 p-3 rounded-xl shadow-lg border border-red-500/30 hover:scale-110 transition-transform duration-200"
                style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}
                aria-label="Microphone muted"
                title="Microphone muted"
              >
                <MicOff className="w-6 h-6 text-red-400" aria-hidden="true" />
              </div>
            </div>
          )}
          
          {/* Video status - BIGGER with RED HALO */}
          {videoOff && (
            <div className="relative">
              {/* Red glow halo */}
              <div className="absolute inset-0 bg-red-500/30 rounded-xl blur-md animate-pulse" style={{ animationDuration: '2s' }}></div>
              {/* Glass container with red tint */}
              <div 
                className="relative backdrop-blur-sm bg-red-500/20 p-3 rounded-xl shadow-lg border border-red-500/30 hover:scale-110 transition-transform duration-200"
                style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}
                aria-label="Camera off"
                title="Camera off"
              >
                <VideoOff className="w-6 h-6 text-red-400" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Participant name overlay with glass effect */}
      <div className="absolute bottom-0 left-0 right-0 glass-dark border-t border-white/10 p-3 animate-fade-in">
        {/* Name and connection quality */}
        <div className="flex items-center justify-between">
          <span className="text-white text-sm font-medium">
            {userName} {isLocal && '(You)'}
          </span>
          
          {/* Connection quality indicator - animated dot */}
          <div className="flex items-center gap-2">
            <div 
              className={`w-2.5 h-2.5 rounded-full ${getQualityColor()} animate-pulse shadow-lg`}
              role="status"
              aria-label={`Connection quality: ${connectionQuality}`}
              title={`Connection quality: ${connectionQuality}`}
            />
          </div>
        </div>
      </div>

      {/* Placeholder when no video track at all */}
      {!videoTrack && !videoOff && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black animate-fade-in">
          <div className="text-center animate-scale-in">
            <div className="w-20 h-20 bg-gradient-to-br from-[#5C0099] to-[#C86BFA] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <span className="text-white/80 text-sm font-medium">{userName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(VideoPlayer);

import { useState } from 'react';

interface VideoControlsProps {
  onToggleAudio: (muted: boolean) => void;
  onToggleVideo: (enabled: boolean) => void;
  initialAudioMuted?: boolean;
  initialVideoEnabled?: boolean;
  audioMuted?: boolean;  // External controlled state
  videoEnabled?: boolean; // External controlled state
}

export default function VideoControls({
  onToggleAudio,
  onToggleVideo,
  initialAudioMuted = false,
  initialVideoEnabled = true,
  audioMuted,
  videoEnabled
}: VideoControlsProps) {
  // Use external state if provided, otherwise use internal state
  const [internalAudioMuted, setInternalAudioMuted] = useState(initialAudioMuted);
  const [internalVideoEnabled, setInternalVideoEnabled] = useState(initialVideoEnabled);
  const [isAudioAnimating, setIsAudioAnimating] = useState(false);
  const [isVideoAnimating, setIsVideoAnimating] = useState(false);

  const isAudioMuted = audioMuted !== undefined ? audioMuted : internalAudioMuted;
  const isVideoEnabled = videoEnabled !== undefined ? videoEnabled : internalVideoEnabled;

  const handleToggleAudio = () => {
    const newMutedState = !isAudioMuted;
    
    // Only animate when turning on (showing the line)
    if (newMutedState) {
      setIsAudioAnimating(true);
      setTimeout(() => setIsAudioAnimating(false), 200);
    }
    
    if (audioMuted === undefined) {
      setInternalAudioMuted(newMutedState);
    }
    onToggleAudio(newMutedState);
  };

  const handleToggleVideo = () => {
    const newEnabledState = !isVideoEnabled;
    
    // Only animate when turning off (showing the line)
    if (!newEnabledState) {
      setIsVideoAnimating(true);
      setTimeout(() => setIsVideoAnimating(false), 200);
    }
    
    if (videoEnabled === undefined) {
      setInternalVideoEnabled(newEnabledState);
    }
    onToggleVideo(newEnabledState);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Audio control */}
      <div className="relative group">
        <button
          onClick={handleToggleAudio}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden
            transition-all duration-300 ease-in-out
            transform hover:scale-105 active:scale-95
            ${isAudioMuted 
              ? 'bg-[#FDC500] hover:bg-[#FFD500] text-white' 
              : 'bg-[#5C0099] hover:bg-[#C86BFA] text-white'
            }
            ${isAudioAnimating ? 'animate-pulse' : ''}
          `}
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          <svg
            className="w-5 h-5 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          {/* Animated diagonal line when muted */}
          <svg
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
            viewBox="0 0 40 40"
            style={{ opacity: isAudioMuted ? 1 : 0 }}
          >
            <line
              x1="8"
              y1="8"
              x2="32"
              y2="32"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: '34',
                strokeDashoffset: isAudioMuted ? (isAudioAnimating ? '34' : '0') : '34',
                transition: isAudioAnimating ? 'stroke-dashoffset 0.2s ease-out' : 'none'
              }}
            />
          </svg>
        </button>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {isAudioMuted ? 'Unmute' : 'Mute'}
        </span>
      </div>

      {/* Video control */}
      <div className="relative group">
        <button
          onClick={handleToggleVideo}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden
            transition-all duration-300 ease-in-out
            transform hover:scale-105 active:scale-95
            ${!isVideoEnabled 
              ? 'bg-[#FDC500] hover:bg-[#FFD500] text-white' 
              : 'bg-[#5C0099] hover:bg-[#C86BFA] text-white'
            }
            ${isVideoAnimating ? 'animate-pulse' : ''}
          `}
          style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          aria-label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          <svg
            className="w-5 h-5 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {/* Animated diagonal line when video is off */}
          <svg
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
            viewBox="0 0 40 40"
            style={{ opacity: !isVideoEnabled ? 1 : 0 }}
          >
            <line
              x1="8"
              y1="8"
              x2="32"
              y2="32"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: '34',
                strokeDashoffset: !isVideoEnabled ? (isVideoAnimating ? '34' : '0') : '34',
                transition: isVideoAnimating ? 'stroke-dashoffset 0.2s ease-out' : 'none'
              }}
            />
          </svg>
        </button>
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        </span>
      </div>
    </div>
  );
}

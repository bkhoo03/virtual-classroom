import { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, LogOut, ChevronDown } from 'lucide-react';
import { Tooltip } from './Tooltip';

export interface ControlToolbarProps {
  // Video controls - synced with VideoCallModule
  isAudioMuted: boolean;
  isVideoOff: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  
  // Screen share controls
  isScreenSharing?: boolean;
  onToggleScreenShare?: () => void;
  
  // Presentation controls
  presentationMode?: 'pdf' | 'screenshare' | 'whiteboard';
  onChangePresentationMode?: (mode: 'pdf' | 'screenshare' | 'whiteboard') => void;
  
  // Additional controls
  onLeaveClassroom?: () => void;
  
  // External state sync
  externalAudioMuted?: boolean;
  externalVideoOff?: boolean;
}

export default function ControlToolbar({
  isAudioMuted,
  isVideoOff,
  onToggleAudio,
  onToggleVideo,
  isScreenSharing = false,
  onToggleScreenShare,
  presentationMode,
  onChangePresentationMode,
  onLeaveClassroom,
}: ControlToolbarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [shouldRenderButtons, setShouldRenderButtons] = useState(true);
  const [isAudioAnimating, setIsAudioAnimating] = useState(false);
  const [isVideoAnimating, setIsVideoAnimating] = useState(false);
  const [isScreenShareAnimating, setIsScreenShareAnimating] = useState(false);

  // Handle delayed rendering of buttons for smooth animations
  useEffect(() => {
    if (isExpanded) {
      // Small delay before showing buttons when expanding for smooth effect
      const timer = setTimeout(() => {
        setShouldRenderButtons(true);
      }, 50); // Small delay to let toolbar center first
      return () => clearTimeout(timer);
    } else {
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setShouldRenderButtons(false);
      }, 500); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleAudioToggle = () => {
    // Only animate when muting (showing the line)
    if (!isAudioMuted) {
      setIsAudioAnimating(true);
      setTimeout(() => setIsAudioAnimating(false), 200);
    }
    onToggleAudio();
  };

  const handleVideoToggle = () => {
    // Only animate when turning off (showing the line)
    if (!isVideoOff) {
      setIsVideoAnimating(true);
      setTimeout(() => setIsVideoAnimating(false), 200);
    }
    onToggleVideo();
  };

  const handleScreenShareToggle = () => {
    if (onToggleScreenShare) {
      // Only animate when stopping share (showing the line)
      if (isScreenSharing) {
        setIsScreenShareAnimating(true);
        setTimeout(() => setIsScreenShareAnimating(false), 200);
      }
      onToggleScreenShare();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div 
        className={`bg-white/10 backdrop-blur-md rounded-full border border-white/20 transition-all duration-500 ${
          isExpanded ? 'px-6 py-3' : 'px-3 py-3'
        }`}
        style={{ 
          backdropFilter: 'blur(12px)',
          background: 'rgba(255, 255, 255, 0.1)',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'padding, width',
          transform: 'translateZ(0)' // Force GPU acceleration
        }}
      >
        <div className="flex items-center justify-center gap-3">
          {/* Collapse/Expand Button */}
          <Tooltip content={isExpanded ? 'Minimize' : 'Expand'} position="top">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 text-gray-700"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              aria-label={isExpanded ? 'Minimize toolbar' : 'Expand toolbar'}
            >
              <ChevronDown 
                size={20}
                className="transition-transform duration-500"
                style={{ 
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                  willChange: 'transform'
                }}
              />
            </button>
          </Tooltip>

          {shouldRenderButtons && (
            <div 
              className={`flex items-center gap-3 transition-all duration-500 overflow-hidden ${
                isExpanded ? 'max-w-[600px] opacity-100' : 'max-w-0 opacity-0'
              }`}
              style={{ 
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'max-width, opacity',
                transform: 'translateZ(0)' // Force GPU acceleration
              }}
            >
              <div className="w-px h-6 bg-white/30" />
              {/* Audio Toggle */}
              <Tooltip content={isAudioMuted ? 'Unmute (M)' : 'Mute (M)'} position="top">
                <button
                  onClick={handleAudioToggle}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isAudioMuted
                      ? 'bg-red-500/90 hover:bg-red-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-gray-700'
                  } ${isAudioAnimating ? 'animate-pulse' : ''}`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                  aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </Tooltip>

              {/* Video Toggle */}
              <Tooltip content={isVideoOff ? 'Turn Camera On (C)' : 'Turn Camera Off (C)'} position="top">
                <button
                  onClick={handleVideoToggle}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
                    isVideoOff
                      ? 'bg-red-500/90 hover:bg-red-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-gray-700'
                  } ${isVideoAnimating ? 'animate-pulse' : ''}`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                  aria-label={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
                >
                  {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                </button>
              </Tooltip>

              {/* Screen Share Toggle */}
              {onToggleScreenShare && (
                <>
                  <div className="w-px h-6 bg-white/30" />
                  <Tooltip content={isScreenSharing ? 'Stop Sharing (S)' : 'Share Screen (S)'} position="top">
                    <button
                      onClick={handleScreenShareToggle}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
                        isScreenSharing
                          ? 'bg-[#FDC500]/90 hover:bg-[#FFD500] text-[#03071E]'
                          : 'bg-white/10 hover:bg-white/20 text-gray-700'
                      } ${isScreenShareAnimating ? 'animate-pulse' : ''}`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                      aria-label={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
                    >
                      <Monitor size={20} />
                    </button>
                  </Tooltip>
                </>
              )}

              {/* Leave Classroom */}
              {onLeaveClassroom && (
                <>
                  <div className="w-px h-6 bg-white/30" />
                  
                  <Tooltip content="Leave Classroom (L)" position="top">
                    <button
                      onClick={onLeaveClassroom}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 bg-red-500/90 hover:bg-red-600 text-white"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                      aria-label="Leave classroom"
                    >
                      <LogOut size={20} />
                    </button>
                  </Tooltip>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

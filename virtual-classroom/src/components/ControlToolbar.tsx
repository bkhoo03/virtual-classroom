import { useState } from 'react';
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
  const [isAudioAnimating, setIsAudioAnimating] = useState(false);
  const [isVideoAnimating, setIsVideoAnimating] = useState(false);
  const [isScreenShareAnimating, setIsScreenShareAnimating] = useState(false);

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
        className={`bg-white/95 backdrop-blur-xl rounded-full shadow-2xl border border-gray-200 transition-all duration-700 ${
          isExpanded ? 'px-6 py-3' : 'px-3 py-3'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="flex items-center gap-3">
          {/* Collapse/Expand Button */}
          <Tooltip content={isExpanded ? 'Minimize' : 'Expand'} position="top">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-gray-100 hover:bg-gray-200 hover:scale-110 active:scale-95 text-gray-700"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
              aria-label={isExpanded ? 'Minimize toolbar' : 'Expand toolbar'}
            >
              <svg 
                className="w-5 h-5 transition-transform duration-700"
                style={{ 
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)'
                }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </Tooltip>

          <div 
            className={`flex items-center gap-3 transition-all duration-700 overflow-hidden ${
              isExpanded ? 'max-w-[600px] opacity-100' : 'max-w-0 opacity-0'
            }`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <>
              <div className="w-px h-6 bg-gray-300" />
              {/* Audio Toggle */}
              <Tooltip content={isAudioMuted ? 'Unmute (M)' : 'Mute (M)'} position="top">
                <button
                  onClick={handleAudioToggle}
                  className={`w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isAudioMuted
                      ? 'bg-red-500/90 hover:bg-red-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } ${isAudioAnimating ? 'animate-pulse' : ''}`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                  aria-label={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 40 40" style={{ opacity: isAudioMuted ? 1 : 0 }}>
                    <line x1="8" y1="8" x2="32" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      style={{
                        strokeDasharray: '34',
                        strokeDashoffset: isAudioMuted ? (isAudioAnimating ? '34' : '0') : '34',
                        transition: isAudioAnimating ? 'stroke-dashoffset 0.2s ease-out' : 'none'
                      }}
                    />
                  </svg>
                </button>
              </Tooltip>

              {/* Video Toggle */}
              <Tooltip content={isVideoOff ? 'Turn Camera On (C)' : 'Turn Camera Off (C)'} position="top">
                <button
                  onClick={handleVideoToggle}
                  className={`w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isVideoOff
                      ? 'bg-red-500/90 hover:bg-red-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  } ${isVideoAnimating ? 'animate-pulse' : ''}`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                  aria-label={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
                >
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 40 40" style={{ opacity: isVideoOff ? 1 : 0 }}>
                    <line x1="8" y1="8" x2="32" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      style={{
                        strokeDasharray: '34',
                        strokeDashoffset: isVideoOff ? (isVideoAnimating ? '34' : '0') : '34',
                        transition: isVideoAnimating ? 'stroke-dashoffset 0.2s ease-out' : 'none'
                      }}
                    />
                  </svg>
                </button>
              </Tooltip>

              {/* Screen Share Toggle */}
              {onToggleScreenShare && (
                <>
                  <div className="w-px h-6 bg-gray-300" />
                  <Tooltip content={isScreenSharing ? 'Stop Sharing (S)' : 'Share Screen (S)'} position="top">
                    <button
                      onClick={handleScreenShareToggle}
                      className={`w-9 h-9 rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95 ${
                        isScreenSharing
                          ? 'bg-[#FDC500]/90 hover:bg-[#FFD500] text-[#03071E]'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      } ${isScreenShareAnimating ? 'animate-pulse' : ''}`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                      aria-label={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
                    >
                      <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 40 40" style={{ opacity: isScreenSharing ? 1 : 0 }}>
                        <line x1="8" y1="8" x2="32" y2="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                          style={{
                            strokeDasharray: '34',
                            strokeDashoffset: isScreenSharing ? (isScreenShareAnimating ? '34' : '0') : '34',
                            transition: isScreenShareAnimating ? 'stroke-dashoffset 0.2s ease-out' : 'none'
                          }}
                        />
                      </svg>
                    </button>
                  </Tooltip>
                </>
              )}

              {/* Presentation Mode Switcher */}
              {onChangePresentationMode && presentationMode && (
                <>
                  <div className="w-px h-6 bg-gray-300" />
                  
                  <Tooltip content="PDF Mode (P)" position="top">
                    <button
                      onClick={() => onChangePresentationMode('pdf')}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                        presentationMode === 'pdf'
                          ? 'bg-[#FDC500]/90 hover:bg-[#FFD500] text-[#03071E]'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                      aria-label="Switch to PDF mode"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </Tooltip>

                  <Tooltip content="Whiteboard Mode (W)" position="top">
                    <button
                      onClick={() => onChangePresentationMode('whiteboard')}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
                        presentationMode === 'whiteboard'
                          ? 'bg-[#FDC500]/90 hover:bg-[#FFD500] text-[#03071E]'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                      aria-label="Switch to whiteboard mode"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </Tooltip>
                </>
              )}

              {/* Leave Classroom */}
              {onLeaveClassroom && (
                <>
                  <div className="w-px h-6 bg-gray-300" />
                  
                  <Tooltip content="Leave Classroom (L)" position="top">
                    <button
                      onClick={onLeaveClassroom}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 bg-red-500/90 hover:bg-red-600 text-white"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
                      aria-label="Leave classroom"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </Tooltip>
                </>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}

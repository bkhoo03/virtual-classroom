/**
 * Icon Example Component
 * 
 * Demonstrates the usage of lucide-react icons throughout the application
 * This file serves as a reference for developers implementing the icon library
 */

import React from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MessageCircle,
  LogOut,
  Pencil,
  Send,
  Loader2,
  CheckCircle,
} from 'lucide-react';

/**
 * Example: Basic Icon Usage
 */
export const BasicIconExample: React.FC = () => {
  return (
    <div className="flex gap-4 p-4">
      <Mic size={24} />
      <Video size={24} />
      <MessageCircle size={24} />
    </div>
  );
};

/**
 * Example: Icons with Brand Colors
 */
export const BrandColorIconExample: React.FC = () => {
  return (
    <div className="flex gap-4 p-4">
      {/* Yellow primary */}
      <Mic color="#FDC500" size={24} />
      <Video color="#FFD500" size={24} />
      
      {/* Purple accent */}
      <MessageCircle color="#5C0099" size={24} />
      <LogOut color="#C86BFA" size={24} />
    </div>
  );
};

/**
 * Example: Icons with Tailwind Classes
 */
export const TailwindIconExample: React.FC = () => {
  return (
    <div className="flex gap-4 p-4">
      <Mic className="text-yellow-500" size={24} />
      <Video className="text-yellow-400" size={24} />
      <MessageCircle className="text-purple-600" size={24} />
    </div>
  );
};

/**
 * Example: Animated Icons
 */
export const AnimatedIconExample: React.FC = () => {
  return (
    <div className="flex gap-4 p-4">
      {/* Spinning loader */}
      <Loader2 className="animate-spin text-yellow-500" size={24} />
      
      {/* Hover scale effect */}
      <button className="group">
        <Send 
          className="text-yellow-500 group-hover:scale-110 transition-transform" 
          size={24} 
        />
      </button>
      
      {/* Pulse animation */}
      <CheckCircle className="animate-pulse text-green-500" size={24} />
    </div>
  );
};

/**
 * Example: Interactive Button with Icon
 */
export const IconButtonExample: React.FC = () => {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);

  return (
    <div className="flex gap-4 p-4">
      {/* Audio toggle button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        {isMuted ? (
          <MicOff className="text-red-500" size={24} />
        ) : (
          <Mic className="text-yellow-500" size={24} />
        )}
      </button>

      {/* Video toggle button */}
      <button
        onClick={() => setIsVideoOff(!isVideoOff)}
        className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
        aria-label={isVideoOff ? 'Turn on video' : 'Turn off video'}
      >
        {isVideoOff ? (
          <VideoOff className="text-red-500" size={24} />
        ) : (
          <Video className="text-yellow-500" size={24} />
        )}
      </button>
    </div>
  );
};

/**
 * Example: Icon Sizes
 */
export const IconSizeExample: React.FC = () => {
  return (
    <div className="flex items-center gap-4 p-4">
      <Pencil size={16} className="text-yellow-500" />
      <Pencil size={24} className="text-yellow-500" />
      <Pencil size={32} className="text-yellow-500" />
      <Pencil size={48} className="text-yellow-500" />
    </div>
  );
};

/**
 * Example: Icon with Custom Stroke Width
 */
export const StrokeWidthExample: React.FC = () => {
  return (
    <div className="flex gap-4 p-4">
      <Monitor strokeWidth={1} size={24} className="text-yellow-500" />
      <Monitor strokeWidth={2} size={24} className="text-yellow-500" />
      <Monitor strokeWidth={3} size={24} className="text-yellow-500" />
    </div>
  );
};

/**
 * Example: Glass-morphism Button with Icon
 */
export const GlassMorphismIconExample: React.FC = () => {
  return (
    <button
      className="
        px-4 py-2 rounded-lg
        bg-white/10 backdrop-blur-md
        border border-white/20
        hover:bg-yellow-500/20
        transition-all duration-300
        flex items-center gap-2
      "
    >
      <Send size={20} className="text-yellow-500" />
      <span className="text-white">Send Message</span>
    </button>
  );
};

/**
 * Complete Example: Control Toolbar
 */
export const ControlToolbarExample: React.FC = () => {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const [isScreenSharing, setIsScreenSharing] = React.useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
      <div className="
        flex gap-2 p-3 rounded-2xl
        bg-gray-900/80 backdrop-blur-md
        border border-gray-700/50
        shadow-xl
      ">
        {/* Audio Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`
            p-3 rounded-lg transition-all
            ${isMuted 
              ? 'bg-red-500/20 text-red-500' 
              : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
            }
          `}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`
            p-3 rounded-lg transition-all
            ${isVideoOff 
              ? 'bg-red-500/20 text-red-500' 
              : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
            }
          `}
          aria-label={isVideoOff ? 'Turn on video' : 'Turn off video'}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className={`
            p-3 rounded-lg transition-all
            ${isScreenSharing 
              ? 'bg-yellow-500 text-gray-900' 
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }
          `}
          aria-label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <Monitor size={20} />
        </button>

        {/* Chat */}
        <button
          className="
            p-3 rounded-lg transition-all
            bg-gray-700/50 text-gray-300 hover:bg-gray-700
          "
          aria-label="Open chat"
        >
          <MessageCircle size={20} />
        </button>

        {/* Leave */}
        <button
          className="
            p-3 rounded-lg transition-all
            bg-red-500/20 text-red-500 hover:bg-red-500/30
          "
          aria-label="Leave classroom"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default {
  BasicIconExample,
  BrandColorIconExample,
  TailwindIconExample,
  AnimatedIconExample,
  IconButtonExample,
  IconSizeExample,
  StrokeWidthExample,
  GlassMorphismIconExample,
  ControlToolbarExample,
};

import { useState, useRef } from 'react';

interface VideoRendererProps {
  src: string;
  title?: string;
  autoplay?: boolean;
}

export default function VideoRenderer({ src, title, autoplay = false }: VideoRendererProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">Failed to load video</p>
          <p className="text-xs text-gray-500">The video could not be played</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black animate-fade-in">
      {title && (
        <div className="px-4 py-2 border-b border-gray-700 bg-gray-900">
          <p className="text-sm font-medium text-white">{title}</p>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center relative">
        <video
          ref={videoRef}
          src={src}
          onError={handleError}
          controls
          autoPlay={autoplay}
          className="max-w-full max-h-full gpu-accelerated"
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Custom play/pause overlay (optional) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all duration-300"
            style={{
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
              style={{
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <svg className="w-10 h-10 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

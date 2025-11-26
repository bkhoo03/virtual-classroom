import { useState } from 'react';

interface IframeRendererProps {
  src: string;
  title?: string;
  allowFullscreen?: boolean;
}

export default function IframeRenderer({ 
  src, 
  title, 
  allowFullscreen = true 
}: IframeRendererProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
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
          <p className="text-sm font-medium text-gray-900 mb-1">Failed to load content</p>
          <p className="text-xs text-gray-500">The external content could not be displayed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white animate-fade-in">
      {title && (
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <p className="text-sm font-medium text-gray-900">{title}</p>
          </div>
        </div>
      )}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">Loading content...</p>
            </div>
          </div>
        )}
        <iframe
          src={src}
          title={title || 'External content'}
          onLoad={handleLoad}
          onError={handleError}
          allowFullScreen={allowFullscreen}
          className={`w-full h-full border-0 transition-opacity duration-300 gpu-accelerated ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

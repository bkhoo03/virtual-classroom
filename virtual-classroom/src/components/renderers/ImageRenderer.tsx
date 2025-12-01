import { useState } from 'react';

interface ImageRendererProps {
  src: string;
  alt?: string;
  title?: string;
  attribution?: {
    photographer?: string;
    photographerUrl?: string;
    source?: string;
    sourceUrl?: string;
  };
}

export default function ImageRenderer({ src, alt, title, attribution }: ImageRendererProps) {
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
          <p className="text-sm font-medium text-gray-900 mb-1">Failed to load image</p>
          <p className="text-xs text-gray-500">The image could not be displayed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 animate-fade-in">
      {title && (
        <div className="px-4 py-2 border-b border-gray-200 bg-white">
          <p className="text-sm font-medium text-gray-900">{title}</p>
        </div>
      )}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
            <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={src}
          alt={alt || 'AI generated image'}
          onLoad={handleLoad}
          onError={handleError}
          className={`max-w-full max-h-full object-contain rounded-lg shadow-lg transition-opacity duration-300 gpu-accelerated ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
      {attribution && (
        <div className="px-4 py-2 border-t border-gray-200 bg-white">
          <p className="text-xs text-gray-600">
            {attribution.photographer && attribution.photographerUrl ? (
              <>
                Photo by{' '}
                <a
                  href={attribution.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  {attribution.photographer}
                </a>
              </>
            ) : attribution.photographer ? (
              <>Photo by {attribution.photographer}</>
            ) : null}
            {attribution.source && attribution.sourceUrl && (
              <>
                {attribution.photographer && ' on '}
                <a
                  href={attribution.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  {attribution.source}
                </a>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

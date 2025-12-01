import { memo, useState } from 'react';
import type { MediaContent } from '../types/ai.types';

interface MediaRendererProps {
  media: MediaContent;
  onShare?: (media: MediaContent) => void;
  attribution?: {
    photographer?: string;
    photographerUrl?: string;
    source?: string;
    sourceUrl?: string;
  };
}

function MediaRenderer({ media, onShare, attribution }: MediaRendererProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShare = () => {
    if (onShare) {
      onShare(media);
    }
  };

  return (
    <>
      <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Media content */}
        {media.type === 'image' ? (
          <div className="relative">
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <img
                src={media.url}
                alt={media.title || 'Image content'}
                className="w-full h-auto object-cover hover:opacity-90 transition-opacity cursor-pointer"
                loading="lazy"
                decoding="async"
                // Use thumbnail as placeholder if available
                style={{
                  backgroundImage: media.thumbnail ? `url(${media.thumbnail})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </button>
          </div>
        ) : media.type === 'video' ? (
        <div className="relative bg-black">
          <video
            src={media.url}
            poster={media.thumbnail}
            controls
            className="w-full h-auto"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : null}

      {/* Media info and actions */}
      <div className="p-3 bg-gray-50">
        {media.title && (
          <h4 className="text-sm font-medium text-[#03071E] mb-1">{media.title}</h4>
        )}
        {media.description && (
          <p className="text-xs text-gray-600 mb-2">{media.description}</p>
        )}
        
        {/* Attribution for Unsplash images */}
        {attribution && (
          <p className="text-xs text-gray-500 mb-2">
            {attribution.photographer && attribution.photographerUrl ? (
              <>
                Photo by{' '}
                <a
                  href={attribution.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5C0099] hover:text-[#C86BFA] underline"
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
                  className="text-[#5C0099] hover:text-[#C86BFA] underline"
                >
                  {attribution.source}
                </a>
              </>
            )}
          </p>
        )}
        
        {onShare && (
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FDC500] text-white text-xs font-medium rounded-md hover:bg-[#FFD500] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share to Presentation
          </button>
        )}
      </div>
    </div>

      {/* Expanded Image Modal */}
      {isExpanded && media.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div className="max-w-4xl max-h-full bg-white rounded-lg shadow-2xl p-2">
            <img
              src={media.url}
              alt={media.title || 'Image content'}
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default memo(MediaRenderer);

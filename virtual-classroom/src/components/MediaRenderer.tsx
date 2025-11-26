import { memo } from 'react';
import type { MediaContent } from '../types/ai.types';

interface MediaRendererProps {
  media: MediaContent;
  onShare?: (media: MediaContent) => void;
}

function MediaRenderer({ media, onShare }: MediaRendererProps) {
  const handleShare = () => {
    if (onShare) {
      onShare(media);
    }
  };

  return (
    <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Media content */}
      {media.type === 'image' ? (
        <div className="relative">
          <img
            src={media.url}
            alt={media.title || 'Image content'}
            className="w-full h-auto object-cover"
            loading="lazy"
            decoding="async"
            // Use thumbnail as placeholder if available
            style={{
              backgroundImage: media.thumbnail ? `url(${media.thumbnail})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
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
  );
}

export default memo(MediaRenderer);

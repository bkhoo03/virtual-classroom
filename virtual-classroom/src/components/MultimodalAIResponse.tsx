import { useState } from 'react';
import type { SearchResult, UnsplashImage, GeneratedImage } from '../types/ai.types';
import AICard, { AICardHeader, AICardTitle, AICardContent } from './AICard';
import { getTypographyClasses, DURATIONS, TIMING_FUNCTIONS } from '../utils/designSystem';

interface MultimodalAIResponseProps {
  textResponse: string;
  images?: (UnsplashImage | GeneratedImage)[];
  searchResults?: SearchResult[];
  cost?: {
    text: number;
    images: number;
    search: number;
    total: number;
  };
  processingTime?: number;
  imageSource?: 'unsplash' | 'dalle' | 'both' | 'none';
  showDebugInfo?: boolean;
}

/**
 * Component for displaying multimodal AI responses with text, images, and search results
 * Supports markdown-style formatting, image attribution, and source citations
 */
export default function MultimodalAIResponse({
  textResponse,
  images = [],
  searchResults = [],
  cost,
  processingTime,
  imageSource,
  showDebugInfo = false,
}: MultimodalAIResponseProps) {
  const [expandedImage, setExpandedImage] = useState<number | null>(null);
  const [showCostDetails, setShowCostDetails] = useState(false);

  // Clean up text by removing URLs and link references
  const cleanText = (text: string): string => {
    let cleaned = text;
    
    // Remove markdown links but keep the text: [text](url) -> text
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // Remove standalone URLs in parentheses: (https://...)
    cleaned = cleaned.replace(/\(https?:\/\/[^\s)]+\)/g, '');
    
    // Remove standalone URLs: https://...
    cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, '');
    
    // Clean up extra spaces and line breaks
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  };

  // Simple markdown-style formatting
  const formatText = (text: string) => {
    // Clean the text first
    const cleanedText = cleanText(text);
    
    // Split by code blocks first
    const parts = cleanedText.split(/(```[\s\S]*?```|`[^`]+`)/g);
    
    return parts.map((part, index) => {
      // Code block
      if (part.startsWith('```')) {
        const code = part.slice(3, -3).trim();
        return (
          <pre key={index} className="bg-gray-100 rounded-lg p-4 my-3 overflow-x-auto">
            <code className="text-sm font-mono text-gray-800">{code}</code>
          </pre>
        );
      }
      
      // Inline code
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      
      // Regular text with basic formatting
      return (
        <span key={index}>
          {part.split('\n').map((line, lineIndex) => (
            <span key={lineIndex}>
              {lineIndex > 0 && <br />}
              {line
                .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
                .map((segment, segIndex) => {
                  if (segment.startsWith('**') && segment.endsWith('**')) {
                    return <strong key={segIndex}>{segment.slice(2, -2)}</strong>;
                  }
                  if (segment.startsWith('*') && segment.endsWith('*')) {
                    return <em key={segIndex}>{segment.slice(1, -1)}</em>;
                  }
                  return segment;
                })}
            </span>
          ))}
        </span>
      );
    });
  };

  const isUnsplashImage = (img: UnsplashImage | GeneratedImage): img is UnsplashImage => {
    return 'photographer' in img && 'unsplashUrl' in img;
  };

  const isGeneratedImage = (img: UnsplashImage | GeneratedImage): img is GeneratedImage => {
    return 'source' in img && img.source === 'dalle';
  };

  return (
    <div className="space-y-6">
      {/* Text Response */}
      <AICard variant="base" hoverable>
        <AICardHeader>
          <AICardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            AI Response
          </AICardTitle>
        </AICardHeader>
        <AICardContent>
          <div className={`prose prose-sm max-w-none text-gray-800 ${getTypographyClasses('base', 'normal')}`}>
            {formatText(textResponse)}
          </div>
        </AICardContent>
      </AICard>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <AICard variant="base">
          <AICardHeader>
            <AICardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Web Search Results
            </AICardTitle>
          </AICardHeader>
          <AICardContent>
            <div className="space-y-3">
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  className="bg-[#FFEE32]/5 rounded-lg p-4 hover:bg-[#FFEE32]/15 transition-all duration-200 hover:shadow-sm border border-[#FFD500]/20 hover:border-[#FFD500]/50"
                  style={{
                    animationDelay: `${index * 75}ms`,
                    animation: `fadeIn ${DURATIONS.standard}ms ${TIMING_FUNCTIONS.easeOut} both`
                  }}
                >
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${getTypographyClasses('sm', 'medium')} text-[#FDC500] hover:text-[#FFD500] hover:underline transition-colors duration-200`}
                  >
                    {result.title}
                  </a>
                  <p className={`${getTypographyClasses('xs', 'normal')} text-gray-600 mt-2`}>{result.snippet}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`${getTypographyClasses('xs', 'normal')} text-gray-500`}>{result.source}</span>
                    {result.publishedDate && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className={`${getTypographyClasses('xs', 'normal')} text-gray-500`}>{result.publishedDate}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AICardContent>
        </AICard>
      )}

      {/* Images */}
      {images.length > 0 && (
        <AICard variant="base">
          <AICardHeader>
            <AICardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Images
              {imageSource && (
                <span className={`${getTypographyClasses('xs', 'normal')} text-gray-500`}>
                  ({imageSource === 'unsplash' ? 'from Unsplash' : imageSource === 'dalle' ? 'AI Generated' : 'Mixed'})
                </span>
              )}
            </AICardTitle>
          </AICardHeader>
          <AICardContent>
            <div className="grid grid-cols-2 gap-4">
            {images.map((img, index) => (
              <div 
                key={index} 
                className="relative group"
                style={{
                  animationDelay: `${index * 75}ms`,
                  animation: `fadeInScale ${DURATIONS.image}ms ${TIMING_FUNCTIONS.easeOut} both`
                }}
              >
                <button
                  onClick={() => setExpandedImage(expandedImage === index ? null : index)}
                  className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FDC500] shadow-sm hover:shadow-md transition-all duration-200 border-2 border-[#FFD500]/20 hover:border-[#FFD500]/60"
                >
                  <img
                    src={isUnsplashImage(img) ? img.thumbnailUrl : (img.compressedUrl || img.url)}
                    alt={isUnsplashImage(img) ? img.description : (img.revisedPrompt || 'AI Generated Image')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
                
                {/* Image Attribution */}
                <div className={`mt-2 ${getTypographyClasses('xs', 'normal')}`}>
                  {isUnsplashImage(img) ? (
                    <div className="flex items-center justify-between">
                      <a
                        href={img.photographerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 truncate transition-colors duration-150"
                      >
                        Photo by {img.photographer}
                      </a>
                      <a
                        href={img.unsplashUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FDC500] hover:text-[#FFD500] ml-2 flex-shrink-0 transition-colors duration-150"
                      >
                        Unsplash
                      </a>
                    </div>
                  ) : isGeneratedImage(img) && (
                    <div className="text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-[#FDC500]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Generated (DALL-E)
                      </span>
                    </div>
                  )}
                </div>

                {/* Expanded Image Modal */}
                {expandedImage === index && (
                  <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setExpandedImage(null)}
                  >
                    <div className="max-w-4xl max-h-full bg-white rounded-lg shadow-2xl p-2 border-4 border-[#FFD500]">
                      <img
                        src={isUnsplashImage(img) ? img.url : img.url}
                        alt={isUnsplashImage(img) ? img.description : (img.revisedPrompt || 'AI Generated Image')}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
            </div>
          </AICardContent>
        </AICard>
      )}

      {/* Debug Info */}
      {showDebugInfo && cost && (
        <AICard variant="compact">
          <button
            onClick={() => setShowCostDetails(!showCostDetails)}
            className={`${getTypographyClasses('xs', 'medium')} text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors duration-150`}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Debug Info
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${showCostDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showCostDetails && (
            <div className={`mt-3 bg-gray-50 rounded-lg p-3 ${getTypographyClasses('xs', 'normal')} space-y-2`}>
              <div className="flex justify-between">
                <span className="text-gray-600">Processing Time:</span>
                <span className="font-mono text-gray-900">{processingTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Text Cost:</span>
                <span className="font-mono text-gray-900">${cost.text.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Image Cost:</span>
                <span className="font-mono text-gray-900">${cost.images.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Search Cost:</span>
                <span className="font-mono text-gray-900">${cost.search.toFixed(4)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className={`${getTypographyClasses('xs', 'medium')} text-gray-900`}>Total Cost:</span>
                <span className={`${getTypographyClasses('xs', 'medium')} font-mono text-gray-900`}>${cost.total.toFixed(4)}</span>
              </div>
            </div>
          )}
        </AICard>
      )}
    </div>
  );
}

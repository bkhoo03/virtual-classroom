import type { SearchResult } from '../../types/ai.types';

interface SearchResultsRendererProps {
  results: SearchResult[];
  query?: string;
}

/**
 * SearchResultsRenderer displays web search results with source citations
 */
export default function SearchResultsRenderer({ results, query }: SearchResultsRendererProps) {
  if (results.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">No Results Found</p>
          <p className="text-xs text-gray-500">Try a different search query</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      {query && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Search Results</h3>
          <p className="text-sm text-gray-600">
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <article
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Result number and source */}
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                {index + 1}
              </span>
              <span className="text-xs text-gray-500">{result.source}</span>
              {result.publishedDate && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{result.publishedDate}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h4 className="text-base font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="focus:outline-none focus:underline"
              >
                {result.title}
              </a>
            </h4>

            {/* Snippet */}
            <p className="text-sm text-gray-700 mb-3 line-clamp-3">
              {result.snippet}
            </p>

            {/* URL */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:text-purple-700 hover:underline truncate focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
              >
                {result.url}
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Citation note */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">About these results</p>
            <p className="text-xs text-gray-600">
              These search results are provided to give you current information. 
              Always verify important information from the original sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

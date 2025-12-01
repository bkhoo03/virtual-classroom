// AI Assistant types for OpenAI ChatGPT API integration

export type MessageRole = 'user' | 'assistant' | 'system';

export type MediaType = 'image' | 'video';

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  media?: MediaContent[];
  timestamp: Date;
}

export interface MediaContent {
  type: MediaType;
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  attribution?: {
    photographer?: string;
    photographerUrl?: string;
    source?: string;
    sourceUrl?: string;
  };
}

// OpenAI ChatGPT Types
export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatGPTRequest {
  model: string;
  messages: ChatGPTMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatGPTResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatGPTChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatGPTChoice {
  index: number;
  message: ChatGPTMessage;
  finish_reason: string;
}

export interface ChatGPTStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

// Legacy Doubao types (kept for backward compatibility during migration)
export interface DoubaoRequest {
  model: string;
  messages: DoubaoMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface DoubaoMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | DoubaoMultimodalContent[];
}

export interface DoubaoMultimodalContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

export interface DoubaoResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DoubaoChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DoubaoChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: string;
}

export interface DoubaoStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

export interface AIServiceConfig {
  apiKey: string;
  apiEndpoint: string;
  model?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export interface AIError {
  code: string;
  message: string;
  retryable: boolean;
}

// Web Search Types
export interface WebSearchConfig {
  apiKey: string;
  provider: 'serper' | 'brave' | 'bing';
  maxResults?: number;
  cacheEnabled?: boolean;
  cacheDuration?: number; // in milliseconds
}

export interface SearchQuery {
  query: string;
  maxResults?: number;
  freshness?: 'day' | 'week' | 'month' | 'year';
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
}

export interface WebSearchUsageStats {
  totalSearches: number;
  cacheHits: number;
  cacheMisses: number;
  estimatedCost: number;
}

// Image Search Types (Unsplash)
export interface ImageSearchConfig {
  apiKey: string;
  maxResults?: number;
  cacheEnabled?: boolean;
  cacheDuration?: number; // in milliseconds
}

export interface ImageSearchQuery {
  query: string;
  maxResults?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

export interface UnsplashImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  description: string;
  photographer: string;
  photographerUrl: string;
  unsplashUrl: string;
  width: number;
  height: number;
}

export interface ImageSearchUsageStats {
  totalSearches: number;
  cacheHits: number;
  cacheMisses: number;
}

// Image Generation Types (DALL-E)
export interface ImageGenConfig {
  apiKey: string;
  model?: 'dall-e-2' | 'dall-e-3';
  defaultSize?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  compressionEnabled?: boolean;
  compressionQuality?: number;
  timeout?: number; // in milliseconds
}

export interface ImageRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  n?: number;
}

export interface GeneratedImage {
  url: string;
  compressedUrl?: string;
  revisedPrompt?: string;
  size: string;
  generatedAt: Date;
  source: 'dalle';
}

export interface ImageGenUsageStats {
  totalGenerations: number;
  estimatedCost: number;
  averageGenerationTime: number;
  timeouts: number;
}

// Multimodal AI Orchestrator Types
export interface OrchestratorConfig {
  aiService: any; // AIService instance
  webSearchService: any; // WebSearchService instance
  imageSearchService: any; // ImageSearchService instance
  imageGenService: any; // ImageGenerationService instance
  enableSmartDetection?: boolean;
  enableProactiveImages?: boolean;
  preferUnsplash?: boolean;
  maxSearchResults?: number;
  maxImages?: number;
}

export interface MultimodalRequest {
  userMessage: string;
  conversationHistory: AIMessage[];
  forceWebSearch?: boolean;
  forceImageSearch?: boolean;
  forceImageGen?: boolean;
  enableProactiveImages?: boolean;
}

export interface MultimodalResult {
  textResponse: string;
  images: (UnsplashImage | GeneratedImage)[];
  searchResults: SearchResult[];
  processingTime: number;
  cost: {
    text: number;
    images: number;
    search: number;
    total: number;
  };
  imageSource: 'unsplash' | 'dalle' | 'both' | 'none';
  metadata: {
    textTokens: number;
    imageGenerations: number;
    searchQueries: number;
    cacheHits: number;
  };
}

export interface IntentDetectionResult {
  needsWebSearch: boolean;
  needsImages: boolean;
  needsImageGeneration: boolean;
  imageQueries: string[];
  shouldUseUnsplash: boolean;
  shouldUseDalle: boolean;
  confidence: number;
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  averageCost: number;
  successRate: number;
  unsplashUsagePercent: number;
  dalleUsagePercent: number;
  totalRequests: number;
  failedRequests: number;
}

// AI Output History Types
export interface AIOutputEntry {
  id: string;
  timestamp: Date;
  userQuery: string;
  textResponse: string;
  images: (UnsplashImage | GeneratedImage)[];
  searchResults: SearchResult[];
  processingTime: number;
}

export interface HistoryConfig {
  maxEntries?: number;
  persistToSession?: boolean;
  autoScroll?: boolean;
}

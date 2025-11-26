// AI Assistant types for Doubao API integration

export type MessageRole = 'user' | 'assistant';

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
}

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

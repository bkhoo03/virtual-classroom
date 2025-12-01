# Design Document

## Overview

This design document outlines the comprehensive overhaul of the Virtual Classroom application to ensure all features work correctly, APIs are properly integrated, and the user experience is seamless. The overhaul includes switching from Doubao to OpenAI ChatGPT API, implementing a yellow-primary/purple-accent color scheme, fixing broken features, and deploying to Vercel.

The design follows a systematic approach:
1. **Audit Phase** - Document current state and identify issues
2. **Fix Phase** - Repair broken features and improve reliability
3. **Enhancement Phase** - Implement color scheme and UX improvements
4. **Deployment Phase** - Configure and deploy to Vercel

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Login      │  │     Home     │  │  Classroom   │    │
│  │   Page       │  │     Page     │  │    Page      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Context Providers                       │  │
│  │  - AuthContext                                       │  │
│  │  - ClassroomContext                                  │  │
│  │  - ToastContext                                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Services Layer                          │  │
│  │  - VideoCallService (Agora RTC)                     │  │
│  │  - WhiteboardService (Agora Whiteboard)             │  │
│  │  - AIService (OpenAI ChatGPT)                       │  │
│  │  - SessionSecurityService                            │  │
│  │  - SessionCleanupService                             │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend (Node.js + Express)                  │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    Auth      │  │    Token     │  │   Session    │    │
│  │   Routes     │  │   Routes     │  │   Routes     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Services                                │  │
│  │  - JWT Authentication                                │  │
│  │  - Agora Token Generation                            │  │
│  │  - Session Management                                │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    Agora     │  │    Agora     │  │   OpenAI     │    │
│  │     RTC      │  │  Whiteboard  │  │   ChatGPT    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
ClassroomPage
├── ClassroomLayout
│   ├── VideoCallModule
│   │   ├── LocalVideoDisplay
│   │   └── RemoteVideoDisplay
│   ├── PresentationPanel
│   │   ├── PDFViewerWithHighlighter (using react-pdf-highlighter)
│   │   ├── WhiteboardCanvas
│   │   └── ScreenShareDisplay
│   ├── Chat
│   │   ├── MessageList
│   │   └── MessageInput
│   └── AIOutputPanel
│       ├── AIMessageList
│       └── AIInput
└── ControlToolbar
    ├── AudioToggle
    ├── VideoToggle
    ├── ScreenShareToggle
    ├── PresentationModeSelector
    └── LeaveButton
```

## Components and Interfaces

### 1. AIService (OpenAI ChatGPT Integration with Multimodal Capabilities)

**Purpose**: Replace Doubao API with OpenAI ChatGPT API and add multimodal capabilities including web search and image generation. The AI must be aware of its image capabilities through system prompts.

**System Prompt Configuration**:
The AI service must include a system prompt that informs the AI about its capabilities:
```
You are an AI teaching assistant in a virtual classroom. You have access to:
1. Web search - for current information and facts
2. Unsplash image search - for finding relevant stock photos and images
3. DALL-E image generation - for creating custom images

When answering questions, proactively use images when they would enhance understanding. For educational topics, scientific concepts, historical events, geographic locations, or visual subjects, automatically search for or generate relevant images without waiting for explicit requests.

Always mention when you're searching for or generating images to help illustrate your explanations.
```

**Interface**:
```typescript
interface AIServiceConfig {
  apiKey: string;
  apiEndpoint: string;
  model?: string;
  maxRetries?: number;
  retryDelay?: number;
  webSearchEnabled?: boolean;
  imageGenerationEnabled?: boolean;
  dalleModel?: 'dall-e-2' | 'dall-e-3';
}

interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatGPTRequest {
  model: string;
  messages: ChatGPTMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatGPTResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatGPTMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface ImageGenerationRequest {
  prompt: string;
  model?: 'dall-e-2' | 'dall-e-3';
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  n?: number;
}

interface ImageGenerationResponse {
  created: number;
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

interface MultimodalResponse {
  text: string;
  images?: string[];
  searchResults?: WebSearchResult[];
  usage: {
    textTokens: number;
    imageGenerations: number;
    searchQueries: number;
  };
}

class AIService {
  constructor(config: AIServiceConfig);
  static initialize(): AIService;
  
  async sendMessage(
    messages: ChatGPTMessage[],
    options?: {
      stream?: boolean;
      temperature?: number;
      maxTokens?: number;
      useCache?: boolean;
    }
  ): Promise<ChatGPTResponse>;
  
  async sendMessageStream(
    messages: ChatGPTMessage[],
    onChunk: (chunk: string) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<void>;
  
  async sendMultimodalMessage(
    messages: ChatGPTMessage[],
    options?: {
      enableWebSearch?: boolean;
      enableImageGeneration?: boolean;
      maxSearchResults?: number;
      useCache?: boolean;
    }
  ): Promise<MultimodalResponse>;
  
  async performWebSearch(
    query: string,
    maxResults?: number
  ): Promise<WebSearchResult[]>;
  
  async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse>;
  
  getRateLimitStatus(): {
    requestsRemaining: number;
    resetTime: number;
  };
  
  getCostEstimate(): {
    textCost: number;
    imageCost: number;
    searchCost: number;
    totalCost: number;
  };
}
```

**Implementation Details**:
- Use OpenAI's official endpoint: `https://api.openai.com/v1/chat/completions`
- Default model: `gpt-3.5-turbo` for cost-effectiveness, `gpt-4` for complex queries
- Maintain existing rate limiting and caching mechanisms
- Support both streaming and non-streaming responses
- Handle OpenAI-specific error codes and rate limits

**Multimodal Features**:
- **Web Search**: Integrate with a web search API (e.g., Serper API, Brave Search API, or Bing Search API)
- **Image Generation**: Use DALL-E 2 for cost-effectiveness (dall-e-2 is ~10x cheaper than dall-e-3)
- **Smart Query Analysis**: Detect when web search or image generation is needed from user query
- **Response Caching**: Cache web search results for 5 minutes, cache generated images indefinitely
- **Cost Optimization**: 
  - Limit web searches to 3 results maximum
  - Use smallest viable image size (512x512 for dall-e-2)
  - Compress generated images before storage
  - Queue requests when rate limits approached

### 2. WebSearchService

**Purpose**: Provide fast, cost-effective web search capabilities for the AI assistant

**Interface**:
```typescript
interface WebSearchConfig {
  apiKey: string;
  provider: 'serper' | 'brave' | 'bing';
  maxResults?: number;
  cacheEnabled?: boolean;
  cacheDuration?: number; // in milliseconds
}

interface SearchQuery {
  query: string;
  maxResults?: number;
  freshness?: 'day' | 'week' | 'month' | 'year';
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  publishedDate?: string;
}

class WebSearchService {
  constructor(config: WebSearchConfig);
  
  async search(query: SearchQuery): Promise<SearchResult[]>;
  
  getCachedResult(query: string): SearchResult[] | null;
  
  clearCache(): void;
  
  getUsageStats(): {
    totalSearches: number;
    cacheHits: number;
    cacheMisses: number;
    estimatedCost: number;
  };
}
```

**Implementation Details**:
- Use Serper API as primary provider (fast, cheap, good results)
- Fallback to Brave Search API if Serper fails
- Cache results in memory with 5-minute TTL
- Limit to 3 results per query for cost optimization
- Include source citations in results

### 3. ImageSearchService

**Purpose**: Search for relevant stock photos using Unsplash API (preferred over generation for cost savings)

**Interface**:
```typescript
interface ImageSearchConfig {
  apiKey: string;
  maxResults?: number;
  cacheEnabled?: boolean;
  cacheDuration?: number;
}

interface ImageSearchQuery {
  query: string;
  maxResults?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

interface UnsplashImage {
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

class ImageSearchService {
  constructor(config: ImageSearchConfig);
  
  async searchImages(query: ImageSearchQuery): Promise<UnsplashImage[]>;
  
  getCachedResult(query: string): UnsplashImage[] | null;
  
  clearCache(): void;
  
  getUsageStats(): {
    totalSearches: number;
    cacheHits: number;
    cacheMisses: number;
  };
}
```

**Implementation Details**:
- Use Unsplash API for free, high-quality stock photos
- Cache results in memory with 10-minute TTL
- Limit to 3 results per query
- Include proper attribution (photographer name + Unsplash link)
- Prefer Unsplash over DALL-E for cost savings

### 4. ImageGenerationService

**Purpose**: Generate images from text descriptions using DALL-E (fallback when Unsplash doesn't have suitable images)

**Interface**:
```typescript
interface ImageGenConfig {
  apiKey: string;
  model: 'dall-e-2' | 'dall-e-3';
  defaultSize?: string;
  compressionEnabled?: boolean;
  compressionQuality?: number;
}

interface ImageRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024';
  quality?: 'standard' | 'hd';
}

interface GeneratedImage {
  url: string;
  compressedUrl?: string;
  revisedPrompt?: string;
  size: string;
  generatedAt: Date;
  source: 'dalle';
}

class ImageGenerationService {
  constructor(config: ImageGenConfig);
  
  async generateImage(request: ImageRequest): Promise<GeneratedImage>;
  
  async compressImage(imageUrl: string, quality?: number): Promise<string>;
  
  getUsageStats(): {
    totalGenerations: number;
    estimatedCost: number;
    averageGenerationTime: number;
  };
}
```

**Implementation Details**:
- Use DALL-E 2 by default for cost-effectiveness
- Default size: 512x512 (good quality, reasonable cost)
- Compress images to 80% quality after generation
- Timeout after 10 seconds with user notification
- Cache generated images in browser storage
- Only use when Unsplash doesn't have suitable images

### 5. MultimodalAIOrchestrator

**Purpose**: Coordinate text, web search, image search, and image generation in a single AI response with proactive image enhancement

**Interface**:
```typescript
interface OrchestratorConfig {
  aiService: AIService;
  webSearchService: WebSearchService;
  imageSearchService: ImageSearchService;
  imageGenService: ImageGenerationService;
  enableSmartDetection?: boolean;
  enableProactiveImages?: boolean;
}

interface MultimodalRequest {
  userMessage: string;
  conversationHistory: ChatGPTMessage[];
  forceWebSearch?: boolean;
  forceImageSearch?: boolean;
  forceImageGen?: boolean;
}

interface MultimodalResult {
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
}

class MultimodalAIOrchestrator {
  constructor(config: OrchestratorConfig);
  
  async processRequest(request: MultimodalRequest): Promise<MultimodalResult>;
  
  private detectIntent(message: string, aiResponse?: string): {
    needsWebSearch: boolean;
    needsImages: boolean;
    imageQueries: string[];
    shouldUseUnsplash: boolean;
    shouldUseDalle: boolean;
  };
  
  private async executeParallel(
    textPromise: Promise<any>,
    searchPromise?: Promise<any>,
    imageSearchPromise?: Promise<any>,
    imageGenPromise?: Promise<any>
  ): Promise<MultimodalResult>;
  
  private shouldEnhanceWithImages(
    userQuery: string,
    aiResponse: string
  ): boolean;
  
  private extractImageQueries(
    userQuery: string,
    aiResponse: string
  ): string[];
  
  getPerformanceMetrics(): {
    averageResponseTime: number;
    averageCost: number;
    successRate: number;
    unsplashUsagePercent: number;
    dalleUsagePercent: number;
  };
}
```

**Implementation Details**:
- Smart intent detection using keywords and patterns
- Proactive image enhancement: AI analyzes response and determines if images would help
- Prefer Unsplash over DALL-E for cost savings (Unsplash is free, DALL-E costs $0.02/image)
- Parallel execution of text, search, image search, and image generation
- Graceful degradation if one service fails
- Cost tracking and warnings
- Performance monitoring

**Proactive Image Detection Logic**:
- Analyze user query and AI response for visual concepts
- Trigger image search for: educational topics, scientific concepts, historical events, geographic locations, famous people, objects, animals, etc.
- Extract 1-3 key visual concepts from the response
- Search Unsplash first (free), fallback to DALL-E only if needed
- Don't add images for: abstract concepts, code examples, math problems (unless explicitly requested)

### 6. AIOutputHistoryManager

**Purpose**: Manage AI response history with persistence and display

**Interface**:
```typescript
interface AIOutputEntry {
  id: string;
  timestamp: Date;
  userQuery: string;
  textResponse: string;
  images: (UnsplashImage | GeneratedImage)[];
  searchResults: SearchResult[];
  processingTime: number;
}

interface HistoryConfig {
  maxEntries?: number;
  persistToSession?: boolean;
  autoScroll?: boolean;
}

class AIOutputHistoryManager {
  constructor(config: HistoryConfig);
  
  addEntry(entry: AIOutputEntry): void;
  
  getHistory(): AIOutputEntry[];
  
  clearHistory(): void;
  
  persistToSessionStorage(): void;
  
  loadFromSessionStorage(): AIOutputEntry[];
  
  getEntryById(id: string): AIOutputEntry | null;
}
```

**Implementation Details**:
- Store up to 50 entries in memory
- Persist to sessionStorage for page refresh recovery
- Clear on session end
- Provide chronological ordering (newest first)
- Support auto-scroll to newest entry

### 7. PresentationModeManager

**Purpose**: Manage presentation panel mode switching with state preservation and auto-switching

**Interface**:
```typescript
type PresentationMode = 'pdf' | 'whiteboard' | 'screenshare' | 'ai-output';

interface ModeState {
  mode: PresentationMode;
  previousMode: PresentationMode | null;
  pdfState?: {
    currentPage: number;
    zoom: number;
    scrollPosition: { x: number; y: number };
  };
  whiteboardState?: {
    canUndo: boolean;
    canRedo: boolean;
  };
  screenshareState?: {
    isActive: boolean;
  };
}

interface ModeSwitchOptions {
  animate?: boolean;
  preserveState?: boolean;
  reason?: 'user' | 'ai-query' | 'system';
}

class PresentationModeManager {
  constructor();
  
  getCurrentMode(): PresentationMode;
  
  getPreviousMode(): PresentationMode | null;
  
  switchMode(
    newMode: PresentationMode,
    options?: ModeSwitchOptions
  ): Promise<void>;
  
  autoSwitchToAIOutput(): Promise<void>;
  
  returnToPreviousMode(): Promise<void>;
  
  preserveCurrentState(): void;
  
  restoreState(mode: PresentationMode): void;
  
  onModeChange(callback: (mode: PresentationMode) => void): void;
}
```

**Implementation Details**:
- Track current and previous modes
- Preserve state for each mode (page numbers, zoom, etc.)
- Auto-switch to AI output when query is sent
- Provide smooth animated transitions
- Show visual indicator of previous mode
- Allow easy return to previous mode

### 8. AIAnimationController

**Purpose**: Coordinate smooth, modern animations for AI features

**Interface**:
```typescript
interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  respectReducedMotion?: boolean;
}

interface TypewriterConfig extends AnimationConfig {
  speed?: number; // characters per second
  cursor?: boolean;
}

interface StaggerConfig extends AnimationConfig {
  staggerDelay?: number;
}

class AIAnimationController {
  constructor();
  
  // Panel animations
  slideInPanel(
    element: HTMLElement,
    config?: AnimationConfig
  ): Promise<void>;
  
  slideOutPanel(
    element: HTMLElement,
    config?: AnimationConfig
  ): Promise<void>;
  
  // Content animations
  typewriterEffect(
    element: HTMLElement,
    text: string,
    config?: TypewriterConfig
  ): Promise<void>;
  
  fadeInImage(
    element: HTMLElement,
    config?: AnimationConfig
  ): Promise<void>;
  
  staggerElements(
    elements: HTMLElement[],
    config?: StaggerConfig
  ): Promise<void>;
  
  // Loading animations
  showLoadingIndicator(
    container: HTMLElement,
    type?: 'spinner' | 'dots' | 'pulse'
  ): void;
  
  hideLoadingIndicator(container: HTMLElement): void;
  
  // Utility
  shouldAnimate(): boolean; // checks prefers-reduced-motion
  
  getDefaultConfig(): AnimationConfig;
}
```

**Implementation Details**:
- Use CSS transitions and animations for performance
- Respect prefers-reduced-motion setting
- Provide consistent easing functions (ease-out for entrances, ease-in for exits)
- Default durations: 300ms for quick transitions, 500ms for panel slides
- Stagger delay: 50-100ms between elements
- Typewriter speed: 30-50 characters per second
- Use requestAnimationFrame for smooth animations

**Animation Specifications**:

**Panel Slide-In**:
```css
transform: translateX(100%);
animation: slideIn 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;

@keyframes slideIn {
  to { transform: translateX(0); }
}
```

**Typewriter Effect**:
- Reveal text character by character
- Optional blinking cursor
- Natural pacing with slight randomness

**Image Fade-In**:
```css
opacity: 0;
transform: scale(0.95);
animation: fadeInScale 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;

@keyframes fadeInScale {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

**Staggered Elements**:
- Apply increasing delays to child elements
- Create cascading effect
- Use for lists of search results or images

**Loading Indicators**:
- Modern spinner with smooth rotation
- Pulsing dots for text generation
- Subtle pulse effect for image loading

### 9. VideoCallService Enhancements

**Purpose**: Ensure reliable video/audio communication

**Key Improvements**:
- Verify token generation flow
- Improve error handling for camera/microphone permissions
- Add connection quality indicators
- Implement proper cleanup on session end
- Add visual feedback for muted/video-off states

**State Management**:
```typescript
interface VideoCallState {
  isInitialized: boolean;
  isConnected: boolean;
  localStream: VideoStream | null;
  remoteStreams: Map<string, VideoStream>;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  connectionQuality: ConnectionQuality;
  isReconnecting: boolean;
  reconnectAttempts: number;
}
```

### 3. WhiteboardService

**Purpose**: Ensure collaborative whiteboard functionality

**Interface**:
```typescript
interface WhiteboardConfig {
  appId: string;
  roomId: string;
  roomToken: string;
  userId: string;
  userRole: 'admin' | 'writer' | 'reader';
}

interface WhiteboardState {
  isInitialized: boolean;
  isConnected: boolean;
  currentTool: 'pen' | 'eraser' | 'selector' | 'text';
  currentColor: string;
  strokeWidth: number;
  canUndo: boolean;
  canRedo: boolean;
}

class WhiteboardService {
  async initialize(config: WhiteboardConfig): Promise<void>;
  async setTool(tool: string): Promise<void>;
  async setColor(color: string): Promise<void>;
  async setStrokeWidth(width: number): Promise<void>;
  async clear(): Promise<void>;
  async undo(): Promise<void>;
  async redo(): Promise<void>;
  async cleanup(): Promise<void>;
}
```

### 4. PresentationPanel

**Purpose**: Manage PDF, whiteboard, and screen share modes

**PDF Implementation**: Use `react-pdf-highlighter` library for PDF viewing and annotations
- Provides built-in highlighting and annotation support
- Handles zoom/pan coordinate transformations automatically
- Maintains annotation alignment across zoom levels
- Simpler implementation than custom canvas-based solution

**State Management**:
```typescript
interface PresentationState {
  mode: 'pdf' | 'whiteboard' | 'screenshare';
  pdfDocument: PDFDocument | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  highlights: IHighlight[]; // from react-pdf-highlighter
}
```

**Mode Switching Logic**:
- Preserve state when switching modes
- Cleanup resources for inactive modes
- Smooth transitions with loading states
- Store highlights per PDF document for persistence

### 5. ControlToolbar

**Purpose**: Centralized media controls with state synchronization

**State Synchronization**:
- Toolbar state ↔ VideoCallModule state
- Keyboard shortcuts trigger toolbar actions
- Visual feedback for all state changes
- Disabled states when features unavailable

### 6. Chat Component

**Purpose**: Real-time text communication

**Features**:
- WebSocket or polling for real-time updates
- Message persistence
- Unread indicators
- Auto-scroll behavior
- Sender identification

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'tutor' | 'tutee';
  createdAt: Date;
}
```

### Session Model
```typescript
interface Session {
  id: string;
  creatorId: string;
  participants: string[];
  status: 'active' | 'ended';
  createdAt: Date;
  endedAt?: Date;
  agoraChannel: string;
  whiteboardRoomId: string;
}
```

### Message Model
```typescript
interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface AIMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
```

### Token Model
```typescript
interface AgoraToken {
  token: string;
  uid: number;
  channel: string;
  expiresAt: number;
}

interface WhiteboardToken {
  token: string;
  roomId: string;
  expiresAt: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*
##
# Property Reflection

After reviewing all testable criteria, several properties can be consolidated:
- Video and audio toggle properties (2.4, 2.5, 6.1, 6.2) can be combined into media control synchronization properties
- Whiteboard tool/color/width properties (3.2, 3.4, 3.5) can be combined into whiteboard state management
- Presentation mode switching properties (4.3, 4.4, 6.4) can be combined into mode transition properties
- Error logging properties (10.1, 10.5) can be combined into comprehensive error logging

### Correctness Properties

**Property 1: API endpoint validation**
*For any* valid API endpoint and request payload, the endpoint should return a successful status code and response structure matching the expected schema
**Validates: Requirements 1.6**

**Property 2: Video initialization with credentials**
*For any* valid session and user credentials, initializing the Agora RTC client should succeed and return a connected client instance
**Validates: Requirements 2.1**

**Property 3: Local video stream availability**
*For any* successful video call initialization, a local video stream should be created and available for display
**Validates: Requirements 2.2**

**Property 4: Remote video stream subscription**
*For any* remote user joining the session, their video stream should become available after subscription
**Validates: Requirements 2.3**

**Property 5: Media control state synchronization**
*For any* media control toggle (audio/video), both the media track state and UI button state should update to match the new state
**Validates: Requirements 2.4, 2.5, 6.1, 6.2, 6.7**

**Property 6: Video resource cleanup**
*For any* video session, after cleanup is called, all video tracks should be stopped and closed, and the client should be disconnected
**Validates: Requirements 2.6**

**Property 7: Connection quality indicator accuracy**
*For any* network quality measurement, the displayed connection quality indicator should match the measured quality level
**Validates: Requirements 2.7**

**Property 8: Whiteboard initialization**
*For any* valid session with whiteboard credentials, initializing the whiteboard should succeed and return a connected room instance
**Validates: Requirements 3.1**

**Property 9: Whiteboard state management**
*For any* whiteboard state change (tool, color, stroke width), subsequent drawing operations should use the new state values
**Validates: Requirements 3.2, 3.4, 3.5**

**Property 10: Whiteboard cleanup**
*For any* whiteboard session, after cleanup is called, the whiteboard should be disconnected from the room
**Validates: Requirements 3.7**

**Property 11: PDF display**
*For any* valid PDF file upload, the PDF should be loaded and the first page should be displayed in the presentation panel
**Validates: Requirements 4.1**

**Property 12: PDF page navigation**
*For any* PDF page navigation action, the displayed page number should match the requested page number
**Validates: Requirements 4.2**

**Property 13: Presentation mode transitions**
*For any* presentation mode change, the presentation panel should display the content corresponding to the selected mode
**Validates: Requirements 4.3, 4.4, 6.4**

**Property 14: Annotation display**
*For any* annotation added to a PDF, the annotation should be visible and positioned correctly on the PDF page
**Validates: Requirements 4.5**

**Property 15: Annotation alignment invariant**
*For any* zoom or pan transformation applied to a PDF, the relative positions of annotations should remain unchanged
**Validates: Requirements 4.6**

**Property 16: Presentation mode state preservation**
*For any* presentation mode switch, returning to the previous mode should restore the previous state (page number, zoom level, etc.)
**Validates: Requirements 4.7**

**Property 17: Web search execution**
*For any* user query requiring current information, a web search should be performed and results should be included in the response
**Validates: Requirements 4.1**

**Property 18: Image generation and display**
*For any* user request for an image, an image should be generated using DALL-E and displayed in the AI output panel
**Validates: Requirements 4.2**

**Property 19: Proactive image search**
*For any* AI response where images would enhance understanding, the system should automatically search Unsplash for relevant images without explicit user request
**Validates: Requirements 4.3**

**Property 20: Image display with attribution**
*For any* image displayed (generated or searched), the image should be shown with appropriate loading states, error handling, and attribution
**Validates: Requirements 4.4, 4.9**

**Property 21: Multimodal response composition**
*For any* multimodal query, the response should include text, web search results (if applicable), and images (if applicable) in a single coherent response
**Validates: Requirements 4.5**

**Property 22: Search result citation**
*For any* web search performed, the results should include source citations with title, URL, and snippet
**Validates: Requirements 4.6**

**Property 23: Image generation timeout**
*For any* image generation request, if the generation takes longer than 10 seconds, a timeout message should be displayed
**Validates: Requirements 4.7**

**Property 24: Search result caching**
*For any* web search query, if the same query is made within 5 minutes, the cached results should be returned
**Validates: Requirements 4.8**

**Property 23: Text response performance**
*For any* text-only AI query, the response should be received within 3 seconds
**Validates: Requirements 5.1**

**Property 24: Search result limitation**
*For any* web search performed, the number of results should not exceed 3 to minimize API costs
**Validates: Requirements 5.2**

**Property 25: Cost-effective image model**
*For any* image generation request, the system should use DALL-E 2 by default unless higher quality is explicitly requested
**Validates: Requirements 5.3**

**Property 26: Response caching for cost reduction**
*For any* repeated query within the cache duration, the cached response should be served instead of making a new API call
**Validates: Requirements 5.4**

**Property 27: Image compression**
*For any* generated image, the image should be compressed to reduce bandwidth without significant quality loss
**Validates: Requirements 5.5**

**Property 28: Rate limit queue management**
*For any* API request when rate limits are approached, the request should be queued and the user should be notified of the delay
**Validates: Requirements 5.6**

**Property 29: Cost monitoring and warnings**
*For any* period of high API usage, the system should log cost warnings
**Validates: Requirements 5.7**

**Property 30: AI message transmission**
*For any* user message sent to the AI, an API request should be made to the OpenAI ChatGPT endpoint
**Validates: Requirements 7.1**

**Property 31: AI response display**
*For any* successful AI API response, the response content should be displayed in the AI output panel
**Validates: Requirements 7.2**

**Property 32: AI error handling**
*For any* failed AI API request, an error message should be displayed to the user
**Validates: Requirements 7.4**

**Property 33: AI conversation context**
*For any* sequence of AI messages, the conversation history should be maintained and included in subsequent requests
**Validates: Requirements 7.5**

**Property 34: AI conversation reset**
*For any* conversation clear action, the AI conversation state should be reset to empty
**Validates: Requirements 7.6**

**Property 35: Screen share toggle**
*For any* screen share toggle action, the screen sharing state should change to the opposite state
**Validates: Requirements 8.3**

**Property 36: Classroom cleanup and navigation**
*For any* leave classroom action, all resources should be cleaned up and the user should be navigated to the home page
**Validates: Requirements 8.5**

**Property 37: Keyboard shortcut mapping**
*For any* registered keyboard shortcut, pressing the shortcut should trigger the corresponding toolbar action
**Validates: Requirements 8.6**

**Property 38: Chat message display**
*For any* chat message sent, the message should appear in the chat panel with sender name and timestamp
**Validates: Requirements 9.1, 9.3**

**Property 39: Unread message tracking**
*For any* new message received while chat is collapsed, the unread count should increment
**Validates: Requirements 9.6**

**Property 40: Unread message reset**
*For any* chat panel expansion, the unread count should be reset to zero
**Validates: Requirements 9.7**

**Property 41: Authentication token issuance**
*For any* valid login credentials, the authentication system should issue both access and refresh JWT tokens
**Validates: Requirements 10.1**

**Property 42: Session ID uniqueness**
*For any* two session creation requests, the generated session IDs should be different
**Validates: Requirements 10.2**

**Property 43: Session access validation**
*For any* session join attempt, the system should validate the user's access permissions before allowing entry
**Validates: Requirements 10.3**

**Property 44: Automatic token refresh**
*For any* expired access token, the system should automatically attempt to refresh using the refresh token
**Validates: Requirements 10.4**

**Property 45: Token refresh failure handling**
*For any* failed token refresh attempt, the system should redirect the user to the login page
**Validates: Requirements 10.5**

**Property 46: Logout state cleanup**
*For any* logout action, all authentication tokens and session data should be cleared from storage
**Validates: Requirements 10.6**

**Property 47: Session cleanup timeout**
*For any* session end action, all session resources should be cleaned up within 30 seconds
**Validates: Requirements 10.7**

**Property 48: Error message display**
*For any* error that occurs, a clear error message should be displayed to the user
**Validates: Requirements 11.5**

**Property 49: Loading indicator display**
*For any* loading state, an appropriate loading indicator should be displayed
**Validates: Requirements 11.6**

**Property 50: Motion preference respect**
*For any* animation, if the user has prefers-reduced-motion enabled, the animation should be disabled or reduced
**Validates: Requirements 11.7**

**Property 51: Comprehensive error logging**
*For any* error that occurs, the error should be logged with timestamp, user context, and stack trace
**Validates: Requirements 12.1, 12.5**

**Property 52: SDK initialization error messages**
*For any* SDK initialization failure, a user-friendly error message should be displayed
**Validates: Requirements 12.2**

**Property 53: Exponential backoff reconnection**
*For any* network error, reconnection attempts should use exponential backoff timing
**Validates: Requirements 12.3**

**Property 54: Error boundary catching**
*For any* critical error in a component, the error boundary should catch it and display a fallback UI
**Validates: Requirements 12.4**

**Property 55: Error recovery notification**
*For any* successful error recovery, the user should be notified of the recovery
**Validates: Requirements 12.6**

**Property 56: Debug mode verbose logging**
*For any* operation when debug mode is enabled, verbose logs should be written to the console
**Validates: Requirements 12.7**

**Property 57: Button color scheme**
*For any* button rendered, primary action buttons should use yellow colors and secondary action buttons should use purple colors
**Validates: Requirements 13.3**

**Property 58: Focus indicator contrast**
*For any* focusable element, the focus indicator should use brand colors and meet WCAG AA contrast requirements
**Validates: Requirements 13.5**

**Property 59: Color contrast compliance**
*For any* text and background color combination, the contrast ratio should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
**Validates: Requirements 13.6**

**Property 60: Dark mode color adaptation**
*For any* color used in the UI, when dark mode is active, the color should be adapted to work on dark backgrounds
**Validates: Requirements 13.7**

**Property 61: Production API routing**
*For any* API call made in the deployed application, the request should be routed to the deployed backend URL
**Validates: Requirements 14.6**

**Property 62: Panel slide-in animation**
*For any* AI assistant panel opening, the panel should animate with a slide-in transition using the configured easing function
**Validates: Requirements 16.1**

**Property 63: Typewriter text animation**
*For any* AI text response, the text should be revealed progressively with timing within the configured bounds
**Validates: Requirements 16.2**

**Property 64: Image fade-in animation**
*For any* image loaded in AI responses, the image should have fade-in and scale animations applied
**Validates: Requirements 16.3**

**Property 65: Loading indicator display**
*For any* AI processing state, a loading indicator should be visible with animation classes applied
**Validates: Requirements 16.4**

**Property 66: Staggered element animations**
*For any* set of multiple AI content elements, each element should have an increasing animation delay
**Validates: Requirements 16.5**

**Property 67: Hover feedback animations**
*For any* AI output element, hovering should apply transition properties for smooth feedback
**Validates: Requirements 16.6**

**Property 68: Reduced motion respect**
*For any* animation, when prefers-reduced-motion is enabled, animations should be disabled or significantly reduced
**Validates: Requirements 16.7**

**Property 69: Modern card design**
*For any* AI output card, the card should have box-shadow, border-radius, and proper spacing CSS properties
**Validates: Requirements 16.8**

**Property 70: Consistent transition timing**
*For any* transition in the AI interface, the timing function and duration should match the design system values
**Validates: Requirements 16.9**

**Property 71: Typography hierarchy**
*For any* AI output text, font-size, font-weight, and line-height should match the design system typography scale
**Validates: Requirements 16.10**

**Property 72: Response history addition**
*For any* AI response generated, the response should be added to the history and appear in the history list
**Validates: Requirements 17.1**

**Property 73: Chronological history ordering**
*For any* set of AI responses in history, the responses should be ordered chronologically (newest first or oldest first consistently)
**Validates: Requirements 17.2**

**Property 74: Response card display**
*For any* AI response in history, the response should be displayed as a distinct card with a timestamp element
**Validates: Requirements 17.3**

**Property 75: Scroll position maintenance**
*For any* scroll action in the AI output panel, the scroll position should be maintained and all entries should be accessible
**Validates: Requirements 17.4**

**Property 76: Auto-scroll to newest**
*For any* new AI response added to history, the panel should auto-scroll to show the newest response
**Validates: Requirements 17.5**

**Property 77: History cleanup on session end**
*For any* session end event, the AI output history should be cleared and empty
**Validates: Requirements 17.6**

**Property 78: History persistence across refresh**
*For any* page refresh within a session, AI output history should be restored from sessionStorage
**Validates: Requirements 17.7**

**Property 79: Auto-switch to AI output**
*For any* AI query sent, the presentation panel mode should automatically switch to 'ai-output'
**Validates: Requirements 18.1**

**Property 80: PDF state preservation on switch**
*For any* AI query sent while in PDF mode, the PDF state (page, zoom, scroll) should be preserved after switching
**Validates: Requirements 18.2**

**Property 81: Whiteboard state preservation on switch**
*For any* AI query sent while in whiteboard mode, the whiteboard state should be preserved after switching
**Validates: Requirements 18.3**

**Property 82: Screen share state preservation on switch**
*For any* AI query sent while in screen share mode, the screen share state should be preserved after switching
**Validates: Requirements 18.4**

**Property 83: Previous mode indicator**
*For any* auto-switch to AI output mode, a visual indicator should be present showing the previous mode
**Validates: Requirements 18.5**

**Property 84: State restoration on return**
*For any* return to previous mode, the previous mode's state should be restored correctly
**Validates: Requirements 18.6**

**Property 85: Smooth mode transition animation**
*For any* auto-switch between modes, animation classes should be applied during the transition
**Validates: Requirements 18.7**

**Property 86: AI capabilities in system prompt**
*For the* AI system prompt configuration, the prompt should include text informing the AI about Unsplash and DALL-E capabilities
**Validates: Requirements 4.10**

**Property 87: Modern SVG icons usage**
*For any* UI component with icons, SVG icons from a professional library should be used instead of emoji characters
**Validates: Requirements 19.1**

**Property 88: Glass-morphism effect application**
*For any* card, panel, or overlay component, glass-morphism CSS properties (backdrop-filter, transparency) should be applied
**Validates: Requirements 19.2**

**Property 89: Yellow brand color for active states**
*For any* interactive element in active state, the yellow brand color (#FDC500) should be applied
**Validates: Requirements 19.3**

**Property 90: Smooth hover animations**
*For any* interactive element, hovering should trigger smooth scale and color transitions with yellow highlights
**Validates: Requirements 19.4**

**Property 91: Modern card design consistency**
*For any* card component, the design should include shadows, rounded corners, and glass-morphism effects
**Validates: Requirements 19.5**

**Property 92: Modern chat interface**
*For any* chat message bubble, glass-morphism effects should be applied with yellow accents for sent messages
**Validates: Requirements 19.6**

**Property 93: Modern control toolbar**
*For any* control toolbar button, modern icons with smooth hover effects and yellow highlights should be used for active states
**Validates: Requirements 19.7**

**Property 94: Modern video call UI**
*For any* video call overlay element, glass-morphism effects and yellow accents should be applied
**Validates: Requirements 19.8**

**Property 95: Satisfying micro-interactions**
*For any* UI interaction, smooth scale, color, and opacity transitions should be applied
**Validates: Requirements 19.9**

**Property 96: Consistent design language**
*For any* component in the application, the design should use yellow/purple brand colors, glass-morphism effects, and modern styling
**Validates: Requirements 19.10**

**Property 97: Modern loading states**
*For any* loading indicator or skeleton loader, modern animations with yellow accents should be applied
**Validates: Requirements 19.11**

**Property 98: Glass-morphism tooltips**
*For any* tooltip or popover, glass-morphism effects with smooth fade-in animations should be applied
**Validates: Requirements 19.12**

**Property 99: Yellow glow focus indicators**
*For any* focused element during keyboard navigation, yellow glow effects with smooth transitions should be applied
**Validates: Requirements 19.13**

**Property 100: Modern whiteboard tools**
*For any* whiteboard tool button, modern SVG icons with glass-morphism palette and yellow active states should be used
**Validates: Requirements 19.14**

**Property 101: Smooth easing functions**
*For any* animation, smooth easing functions (cubic-bezier) and consistent timing should be used
**Validates: Requirements 19.15**

## Comprehensive UI Modernization Design

### Overview

This section details the comprehensive modernization of the entire Virtual Classroom UI with glass-morphism effects, yellow color scheme, modern icons, and premium interactions. The goal is to create a cohesive, polished, and visually impressive experience throughout the application.

### Design System

#### Icon Library

**Selected Library**: Lucide React (modern, consistent, tree-shakeable)

**Installation**:
```bash
npm install lucide-react
```

**Icon Mapping**:
```typescript
// Old emoji → New Lucide icon
'↖' → <MousePointer2 />      // Selector
'✏️' → <Pencil />             // Pen
'▭' → <Square />              // Rectangle
'○' → <Circle />              // Circle
'/' → <Minus />               // Line
'T' → <Type />                // Text
'🧹' → <Eraser />             // Eraser
'✋' → <Hand />                // Pan
'🎨' → <Palette />            // Color picker
'↩️' → <Undo />               // Undo
'↪️' → <Redo />               // Redo
'🗑️' → <Trash2 />             // Clear
'💾' → <Save />               // Save
'🎤' → <Mic /> / <MicOff />   // Audio toggle
'📹' → <Video /> / <VideoOff /> // Video toggle
'🖥️' → <Monitor />            // Screen share
'📤' → <LogOut />             // Leave
'💬' → <MessageCircle />      // Chat
'🤖' → <Bot />                // AI Assistant
```

#### Glass-Morphism System

**Base Glass Effect**:
```css
.glass {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.glass-dark {
  background: rgba(3, 7, 30, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}
```

**Glass Variants**:
```css
/* Subtle glass for backgrounds */
.glass-subtle {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
}

/* Strong glass for modals */
.glass-strong {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
}

/* Colored glass with yellow tint */
.glass-yellow {
  background: rgba(253, 197, 0, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(253, 197, 0, 0.3);
}

/* Colored glass with purple tint */
.glass-purple {
  background: rgba(92, 0, 153, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(92, 0, 153, 0.3);
}
```

#### Animation System

**Easing Functions**:
```css
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-circ: cubic-bezier(0.85, 0, 0.15, 1);
  --ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

**Timing Constants**:
```typescript
export const ANIMATION_DURATION = {
  fast: 150,      // Quick feedback
  normal: 300,    // Standard transitions
  slow: 500,      // Panel slides, mode switches
  verySlow: 800,  // Page transitions
} as const;

export const ANIMATION_DELAY = {
  stagger: 50,    // Stagger between elements
  sequence: 100,  // Sequence of animations
} as const;
```

**Micro-Interaction Animations**:
```css
/* Button press */
.btn-press {
  transition: transform 150ms var(--ease-out-expo);
}
.btn-press:active {
  transform: scale(0.95);
}

/* Hover lift */
.hover-lift {
  transition: transform 300ms var(--ease-out-expo),
              box-shadow 300ms var(--ease-out-expo);
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.2);
}

/* Glow effect */
.glow-yellow {
  transition: box-shadow 300ms var(--ease-out-expo);
}
.glow-yellow:hover,
.glow-yellow:focus {
  box-shadow: 0 0 0 4px rgba(253, 197, 0, 0.3),
              0 8px 32px 0 rgba(253, 197, 0, 0.2);
}
```

#### Color System

**Yellow Palette**:
```typescript
export const YELLOW = {
  50: '#FFFBEB',   // Lightest
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#FDC500',  // Primary
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',  // Darkest
} as const;
```

**Purple Palette**:
```typescript
export const PURPLE = {
  50: '#FAF5FF',   // Lightest
  100: '#F3E8FF',
  200: '#E9D5FF',
  300: '#D8B4FE',
  400: '#C86BFA',  // Light accent
  500: '#A855F7',
  600: '#9333EA',
  700: '#7E22CE',
  800: '#6B21A8',
  900: '#5C0099',  // Deep accent
} as const;
```

### Component Modernization

#### 1. Whiteboard Components

**ToolPalette Modernization**:

```typescript
// Updated ToolPalette.tsx
import { 
  MousePointer2, Pencil, Square, Circle, 
  Minus, Type, Eraser, Hand 
} from 'lucide-react';

const tools = [
  { type: 'selector', icon: MousePointer2, label: 'Select' },
  { type: 'pencil', icon: Pencil, label: 'Pen' },
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'line', icon: Minus, label: 'Line' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'eraser', icon: Eraser, label: 'Eraser' },
  { type: 'hand', icon: Hand, label: 'Pan' },
];

// Glass-morphism styling
<div className="glass flex flex-col gap-2 p-3 rounded-2xl">
  {tools.map((tool) => {
    const Icon = tool.icon;
    return (
      <button
        key={tool.type}
        className={`
          relative w-12 h-12 flex items-center justify-center rounded-xl
          transition-all duration-300 ease-out-expo
          hover:scale-105 active:scale-95
          ${isActive 
            ? 'bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/50' 
            : 'hover:bg-yellow-50 text-gray-700'
          }
        `}
      >
        <Icon size={20} strokeWidth={2} />
        {isActive && (
          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-600 rounded-full" />
        )}
      </button>
    );
  })}
</div>
```

**ColorPicker Modernization**:

```typescript
// Modern color picker with glass effect
<div className="glass p-4 rounded-2xl space-y-3">
  <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
    Color
  </div>
  <div className="grid grid-cols-5 gap-2">
    {colors.map((color) => (
      <button
        key={color}
        className={`
          w-10 h-10 rounded-xl transition-all duration-300
          hover:scale-110 active:scale-95
          ${isSelected 
            ? 'ring-4 ring-yellow-500 ring-offset-2 scale-105' 
            : 'hover:ring-2 hover:ring-yellow-300'
          }
        `}
        style={{ backgroundColor: color }}
      />
    ))}
  </div>
</div>
```

**WhiteboardActions Modernization**:

```typescript
import { Undo, Redo, Trash2, Save } from 'lucide-react';

<div className="glass flex flex-col gap-2 p-3 rounded-2xl">
  <button className="btn-glass-yellow">
    <Undo size={20} />
  </button>
  <button className="btn-glass-yellow">
    <Redo size={20} />
  </button>
  <button className="btn-glass-yellow">
    <Trash2 size={20} />
  </button>
  <button className="btn-glass-yellow">
    <Save size={20} />
  </button>
</div>
```

#### 2. Chat Component Modernization

**Message Bubbles**:

```typescript
// Sent message (user)
<div className="flex justify-end">
  <div className="glass-yellow max-w-[70%] p-3 rounded-2xl rounded-tr-md">
    <p className="text-sm text-gray-900">{message.content}</p>
    <span className="text-xs text-gray-600 mt-1">{timestamp}</span>
  </div>
</div>

// Received message (other user)
<div className="flex justify-start">
  <div className="glass max-w-[70%] p-3 rounded-2xl rounded-tl-md">
    <p className="text-xs font-medium text-yellow-600 mb-1">{sender}</p>
    <p className="text-sm text-gray-900">{message.content}</p>
    <span className="text-xs text-gray-500 mt-1">{timestamp}</span>
  </div>
</div>
```

**Chat Input**:

```typescript
import { Send } from 'lucide-react';

<div className="glass p-4 rounded-2xl flex gap-3">
  <input
    className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500"
    placeholder="Type a message..."
  />
  <button className="btn-glass-yellow w-10 h-10 rounded-xl flex items-center justify-center">
    <Send size={18} />
  </button>
</div>
```

#### 3. Control Toolbar Modernization

```typescript
import { 
  Mic, MicOff, Video, VideoOff, 
  Monitor, LogOut, MessageCircle 
} from 'lucide-react';

<div className="glass-dark fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl flex gap-3">
  <button className={`btn-toolbar ${isAudioMuted ? 'btn-toolbar-danger' : 'btn-toolbar-active'}`}>
    {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
  </button>
  
  <button className={`btn-toolbar ${isVideoOff ? 'btn-toolbar-danger' : 'btn-toolbar-active'}`}>
    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
  </button>
  
  <button className="btn-toolbar">
    <Monitor size={20} />
  </button>
  
  <div className="w-px h-8 bg-white/20" /> {/* Divider */}
  
  <button className="btn-toolbar">
    <MessageCircle size={20} />
  </button>
  
  <button className="btn-toolbar btn-toolbar-danger">
    <LogOut size={20} />
  </button>
</div>
```

**Toolbar Button Styles**:

```css
.btn-toolbar {
  @apply w-12 h-12 rounded-xl flex items-center justify-center;
  @apply transition-all duration-300;
  @apply text-white/70 hover:text-white;
  @apply hover:bg-white/10 active:scale-95;
}

.btn-toolbar-active {
  @apply bg-yellow-500 text-gray-900;
  @apply hover:bg-yellow-400;
  @apply shadow-lg shadow-yellow-500/30;
}

.btn-toolbar-danger {
  @apply hover:bg-red-500/20 hover:text-red-400;
}
```

#### 4. Video Call Module Modernization

**Video Overlay**:

```typescript
<div className="relative">
  <video ref={videoRef} className="w-full h-full object-cover rounded-2xl" />
  
  {/* Glass overlay with user info */}
  <div className="absolute bottom-4 left-4 right-4 glass-dark p-3 rounded-xl flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-sm font-medium text-white">{userName}</span>
    </div>
    
    {isAudioMuted && (
      <div className="glass-strong p-2 rounded-lg">
        <MicOff size={16} className="text-red-500" />
      </div>
    )}
  </div>
</div>
```

**Connection Quality Indicator**:

```typescript
<div className="glass absolute top-4 right-4 px-3 py-2 rounded-full flex items-center gap-2">
  <div className={`w-2 h-2 rounded-full ${
    quality === 'excellent' ? 'bg-green-500' :
    quality === 'good' ? 'bg-yellow-500' :
    'bg-red-500'
  } animate-pulse`} />
  <span className="text-xs font-medium text-gray-900">
    {quality}
  </span>
</div>
```

#### 5. Loading States Modernization

**Skeleton Loaders**:

```typescript
// Shimmer effect
<div className="glass rounded-2xl p-4 space-y-3">
  <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded animate-shimmer" />
  <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded animate-shimmer w-3/4" />
  <div className="h-4 bg-gradient-to-r from-gray-200 via-yellow-100 to-gray-200 rounded animate-shimmer w-1/2" />
</div>

// Shimmer animation
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
  background-size: 1000px 100%;
}
```

**Spinner**:

```typescript
<div className="relative w-12 h-12">
  <div className="absolute inset-0 rounded-full border-4 border-yellow-200" />
  <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin" />
</div>
```

#### 6. Tooltip Modernization

```typescript
<div className="glass-strong absolute z-50 px-3 py-2 rounded-lg shadow-xl animate-fade-in">
  <p className="text-sm font-medium text-gray-900">{content}</p>
  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/95 rotate-45" />
</div>
```

#### 7. Modal Modernization

```typescript
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-fade-in" />
  
  {/* Modal */}
  <div className="glass-strong relative max-w-md w-full p-6 rounded-2xl shadow-2xl animate-scale-in">
    <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
    <p className="text-gray-700 mb-6">{content}</p>
    
    <div className="flex gap-3 justify-end">
      <button className="btn-secondary">Cancel</button>
      <button className="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Button System

**Primary Button**:
```css
.btn-primary {
  @apply px-6 py-3 rounded-xl font-medium;
  @apply bg-yellow-500 text-gray-900;
  @apply hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/30;
  @apply active:scale-95;
  @apply transition-all duration-300;
  @apply focus:outline-none focus:ring-4 focus:ring-yellow-500/30;
}
```

**Secondary Button**:
```css
.btn-secondary {
  @apply px-6 py-3 rounded-xl font-medium;
  @apply bg-purple-600 text-white;
  @apply hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-600/30;
  @apply active:scale-95;
  @apply transition-all duration-300;
  @apply focus:outline-none focus:ring-4 focus:ring-purple-600/30;
}
```

**Glass Button**:
```css
.btn-glass-yellow {
  @apply px-4 py-2 rounded-xl font-medium;
  @apply glass-yellow text-gray-900;
  @apply hover:bg-yellow-500/30 hover:scale-105;
  @apply active:scale-95;
  @apply transition-all duration-300;
}
```

### Focus Management

**Keyboard Navigation**:
```css
/* Yellow glow for focus */
*:focus-visible {
  @apply outline-none;
  @apply ring-4 ring-yellow-500/50;
  @apply ring-offset-2 ring-offset-white;
}

/* Dark mode focus */
.dark *:focus-visible {
  @apply ring-offset-gray-900;
}
```

### Responsive Design

**Breakpoints**:
```typescript
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
```

**Mobile Adaptations**:
- Reduce glass blur on mobile for performance
- Simplify animations on mobile
- Larger touch targets (min 44x44px)
- Bottom sheet modals instead of centered
- Collapsible panels for space efficiency

### Performance Optimizations

**CSS Optimizations**:
```css
/* Use will-change for animated elements */
.will-animate {
  will-change: transform, opacity;
}

/* Use transform for animations (GPU accelerated) */
.animate-slide {
  transform: translateX(0);
  transition: transform 300ms ease-out;
}

/* Avoid animating expensive properties */
/* ❌ Don't animate: width, height, top, left */
/* ✅ Do animate: transform, opacity */
```

**React Optimizations**:
- Use `React.memo` for glass components
- Debounce hover effects
- Lazy load icons
- Use CSS animations over JS when possible

### Accessibility

**Screen Reader Support**:
```typescript
<button
  aria-label="Mute microphone"
  aria-pressed={isAudioMuted}
  className="btn-toolbar"
>
  {isAudioMuted ? <MicOff /> : <Mic />}
</button>
```

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Color Contrast**:
- Yellow (#FDC500) on white: 4.5:1 ✓
- Purple (#5C0099) on white: 7.2:1 ✓
- White on yellow: 1.8:1 ✗ (use dark text)
- White on purple: 8.5:1 ✓

### Implementation Checklist

**Phase 1: Icon Migration**
- [ ] Install lucide-react
- [ ] Replace all emoji icons with Lucide icons
- [ ] Update icon sizes and colors
- [ ] Test icon rendering

**Phase 2: Glass-Morphism**
- [ ] Create glass utility classes
- [ ] Apply glass effects to all panels
- [ ] Test backdrop-filter browser support
- [ ] Add fallbacks for unsupported browsers

**Phase 3: Color System**
- [ ] Update Tailwind config with yellow/purple palettes
- [ ] Apply yellow to all primary actions
- [ ] Apply purple to all secondary actions
- [ ] Verify color contrast

**Phase 4: Animations**
- [ ] Create animation utility classes
- [ ] Add hover effects to all interactive elements
- [ ] Implement micro-interactions
- [ ] Test reduced motion support

**Phase 5: Component Updates**
- [ ] Modernize whiteboard components
- [ ] Modernize chat component
- [ ] Modernize control toolbar
- [ ] Modernize video call module
- [ ] Modernize loading states
- [ ] Modernize tooltips and modals

**Phase 6: Testing**
- [ ] Test on all major browsers
- [ ] Test on mobile devices
- [ ] Test keyboard navigation
- [ ] Test screen reader support
- [ ] Test performance

## Error Handling

### Error Categories

1. **Network Errors**
   - Connection failures
   - Timeout errors
   - Rate limiting
   - API unavailability

2. **Authentication Errors**
   - Invalid credentials
   - Expired tokens
   - Insufficient permissions
   - Session not found

3. **SDK Errors**
   - Agora RTC initialization failures
   - Whiteboard connection failures
   - Camera/microphone permission denied
   - Device not found

4. **Application Errors**
   - Invalid state transitions
   - Resource cleanup failures
   - Data validation errors
   - Unexpected exceptions

### Error Handling Strategy

**Network Errors**:
- Implement exponential backoff for retries
- Display connection status indicators
- Provide manual reconnect option
- Cache requests when offline (where applicable)

**Authentication Errors**:
- Automatic token refresh on expiration
- Redirect to login on auth failure
- Clear error messages for invalid credentials
- Session validation before operations

**SDK Errors**:
- Graceful degradation (e.g., audio-only if video fails)
- Permission request flows with clear instructions
- Fallback to alternative devices
- User-friendly error messages

**Application Errors**:
- Error boundaries to catch React errors
- Comprehensive logging with context
- User notification with recovery options
- Automatic state recovery where possible

### Error Recovery

**Automatic Recovery**:
- Token refresh
- Network reconnection
- SDK reconnection
- State synchronization

**Manual Recovery**:
- Retry buttons for failed operations
- Refresh page option
- Re-login option
- Contact support information

## Testing Strategy

### Unit Testing

**Components to Test**:
- Service classes (AIService, VideoCallService, WhiteboardService)
- Utility functions (token validation, session ID generation)
- React hooks (useClassroomControls, useAuth)
- Context providers (AuthContext, ClassroomContext)

**Test Coverage**:
- Happy path scenarios
- Error conditions
- Edge cases (empty inputs, boundary values)
- State transitions

**Testing Framework**: Vitest + React Testing Library

### Property-Based Testing

**Property Testing Library**: fast-check (JavaScript/TypeScript PBT library)

**Configuration**: Each property test should run a minimum of 100 iterations

**Property Test Format**: Each test must include a comment with the format:
```typescript
// **Feature: classroom-ui-overhaul, Property X: [property description]**
```

**Properties to Test**:
- Media control state synchronization (Property 5)
- Whiteboard state management (Property 9)
- Annotation alignment invariant (Property 15)
- AI conversation context (Property 20)
- Session ID uniqueness (Property 29)
- Error logging completeness (Property 38)
- Color contrast compliance (Property 46)

### Integration Testing

**Scenarios to Test**:
- Complete user flow (login → create session → join classroom → leave)
- Multi-user scenarios (two users in same session)
- Mode switching (PDF → whiteboard → screen share)
- Error recovery flows

### End-to-End Testing

**Critical Paths**:
- Authentication flow
- Session creation and joining
- Video call establishment
- AI assistant interaction
- Whiteboard collaboration

## Color Scheme Implementation

### Brand Colors

**Primary (Yellow Tones)**:
- Primary Yellow: `#FDC500` - Main brand color
- Light Yellow: `#FFD500` - Hover states, highlights
- Pale Yellow: `#FFEE32` - Backgrounds, subtle accents

**Accent (Purple Tones)**:
- Deep Purple: `#5C0099` - Secondary actions, accents
- Light Purple: `#C86BFA` - Hover states, active states

**Neutral Colors**:
- Dark Navy: `#03071E` - Text, dark backgrounds
- White: `#FFFFFF` - Light backgrounds, text on dark
- Gray Scale: Various shades for borders, disabled states

### Color Application

**Buttons**:
```css
/* Primary Actions */
.btn-primary {
  background: #FDC500;
  color: #03071E;
  hover: #FFD500;
}

/* Secondary Actions */
.btn-secondary {
  background: #5C0099;
  color: #FFFFFF;
  hover: #C86BFA;
}
```

**Interactive Elements**:
- Links: Purple (#5C0099)
- Focus rings: Yellow (#FDC500) with 2px width
- Active states: Light Purple (#C86BFA)
- Disabled states: Gray with reduced opacity

**Status Indicators**:
- Success: Green (maintain accessibility)
- Warning: Yellow (#FDC500)
- Error: Red (maintain accessibility)
- Info: Purple (#5C0099)

**Dark Mode Adaptations**:
- Primary Yellow → Slightly desaturated for dark backgrounds
- Purple → Lighter shade (#C86BFA) for better contrast
- Backgrounds → Dark Navy (#03071E)
- Text → White with appropriate opacity

### Accessibility Compliance

**Contrast Ratios** (WCAG AA):
- Normal text (< 18pt): 4.5:1 minimum
- Large text (≥ 18pt): 3:1 minimum
- UI components: 3:1 minimum

**Color Combinations to Verify**:
- Yellow (#FDC500) on Dark Navy (#03071E): ✓ High contrast
- Purple (#5C0099) on White (#FFFFFF): ✓ High contrast
- Light Purple (#C86BFA) on Dark Navy (#03071E): Verify
- Yellow text on White: ✗ Avoid (insufficient contrast)

## Deployment Architecture

### Frontend Deployment (Vercel)

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_BACKEND_URL": "@backend-url",
    "VITE_AGORA_APP_ID": "@agora-app-id",
    "VITE_NETLESS_APP_ID": "@netless-app-id",
    "VITE_OPENAI_API_KEY": "@openai-api-key"
  }
}
```

**Build Process**:
1. Install dependencies
2. Run TypeScript compilation
3. Run Vite build
4. Output to `dist/` directory
5. Deploy to Vercel CDN

**Environment Variables** (Vercel Dashboard):
- `VITE_BACKEND_URL`: Backend API URL (ngrok URL for testing, AWS URL for production)
- `VITE_AGORA_APP_ID`: Agora RTC App ID
- `VITE_NETLESS_APP_ID`: Agora Whiteboard App ID
- `VITE_OPENAI_API_KEY`: OpenAI API Key

### Backend Deployment Strategy

**Development/Testing Phase**: Local Backend with ngrok

The backend will run locally on the developer's laptop and be exposed via ngrok for testing. This approach allows:
- Easy debugging and iteration
- No deployment complexity during development
- Multi-user testing across different locations
- Preparation for future AWS integration

**Setup Process**:

1. **Run Backend Locally**:
```bash
cd virtual-classroom/backend
npm install
npm run dev
# Backend runs on http://localhost:3001
```

2. **Expose Backend with ngrok**:
```bash
# Install ngrok
npm install -g ngrok

# Create public tunnel
ngrok http 3001
# Output: https://abc123.ngrok-free.app
```

3. **Configure Vercel Environment**:
- Set `VITE_BACKEND_URL` to ngrok URL
- Redeploy frontend when ngrok URL changes

**Architecture Diagram**:
```
Developer Laptop              Vercel CDN                Remote User
┌─────────────────┐          ┌──────────┐             ┌──────────┐
│  Backend        │          │ Frontend │             │ Browser  │
│  Express :3001  │◄─────────│  React   │◄────────────│          │
│                 │  API via │  App     │  HTTPS      │          │
└────────┬────────┘  ngrok   └──────────┘             └──────────┘
         │           tunnel                                  │
         │                                                    │
         └────────────────────────────────────────────────────┘
                    Both connect to Agora/OpenAI
```

**ngrok Configuration** (optional `ngrok.yml`):
```yaml
version: "2"
authtoken: YOUR_NGROK_AUTH_TOKEN
tunnels:
  classroom-backend:
    proto: http
    addr: 3001
    bind_tls: true
```

**Benefits**:
- ✅ No backend deployment needed during development
- ✅ Easy to debug and modify backend code
- ✅ Works for multi-user testing
- ✅ Backend code ready for AWS migration
- ✅ No additional hosting costs during development

**Limitations**:
- ⚠️ ngrok URL changes on restart (use paid plan for static URLs)
- ⚠️ Requires developer laptop to be running
- ⚠️ Not suitable for production use

**Testing Workflow**:

1. **Developer starts backend**:
```bash
cd virtual-classroom/backend
npm run dev
```

2. **Developer starts ngrok**:
```bash
ngrok http 3001
# Copy the HTTPS URL (e.g., https://abc123.ngrok-free.app)
```

3. **Update Vercel environment variable**:
- Go to Vercel dashboard → Project → Settings → Environment Variables
- Update `VITE_BACKEND_URL` to ngrok URL
- Redeploy frontend (or wait for auto-deploy)

4. **Share Vercel URL with colleague**:
- Colleague opens `https://your-app.vercel.app`
- Both users can join the same session
- Video/audio/whiteboard work across locations

**CORS Configuration for ngrok**:

Update `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',           // Local development
    'https://your-app.vercel.app',     // Vercel production
    /\.ngrok-free\.app$/,              // Any ngrok URL
    /\.ngrok\.io$/                     // Legacy ngrok URLs
  ],
  credentials: true
}));
```

### Future Production Deployment (AWS Integration)

When integrating into the main application on AWS:

**Backend Migration to AWS**:
- Deploy to AWS EC2, ECS, or Lambda
- Use AWS API Gateway if using Lambda
- Configure AWS security groups and VPC
- Set up AWS load balancer for scaling

**Frontend Update**:
- Update `VITE_BACKEND_URL` to AWS backend URL
- Redeploy to Vercel
- No code changes needed

**Database Migration**:
- Replace in-memory storage with AWS RDS (PostgreSQL) or DynamoDB
- Implement database connection pooling
- Add database migrations

### Database Considerations

**Current State**: In-memory storage (development only)

**Production Requirements**:
- Persistent session storage
- User authentication data
- Chat message history

**Recommended Database**: PostgreSQL or MongoDB
- PostgreSQL: Structured data, ACID compliance
- MongoDB: Flexible schema, easy scaling

**Migration Path**:
1. Add database connection configuration
2. Create data models/schemas
3. Implement repository pattern
4. Replace in-memory storage with database calls
5. Add database migrations

### CI/CD Pipeline

**Automatic Deployment**:
- Push to `main` branch → Deploy to production
- Push to `develop` branch → Deploy to staging
- Pull requests → Deploy preview environments

**Deployment Checks**:
- TypeScript compilation
- Linting (ESLint)
- Unit tests
- Build success

**Rollback Strategy**:
- Vercel provides instant rollback to previous deployments
- Keep last 10 deployments available
- Monitor error rates post-deployment

## Implementation Phases

### Phase 1: Audit and Documentation (1-2 days)
- Document current state of all features
- Identify broken or incomplete functionality
- Create issue list with priorities
- Set up testing infrastructure

### Phase 2: Core Fixes (3-5 days)
- Fix video call initialization and cleanup
- Fix whiteboard connection and synchronization
- Implement proper error handling
- Add loading states and error messages

### Phase 3: AI Integration (2-3 days)
- Replace Doubao API with OpenAI ChatGPT
- Update AIService implementation
- Test streaming and non-streaming responses
- Implement rate limiting and caching

### Phase 4: UI/UX Improvements (2-3 days)
- Implement yellow/purple color scheme
- Update all components with new colors
- Verify accessibility compliance
- Add animations and transitions

### Phase 5: Testing (2-3 days)
- Write unit tests for services
- Implement property-based tests
- Perform integration testing
- Fix bugs discovered during testing

### Phase 6: Deployment (1-2 days)
- Configure Vercel for frontend
- Set up ngrok for local backend exposure
- Configure environment variables in Vercel
- Test deployed application with remote users
- Document ngrok setup process
- Prepare backend for future AWS migration

**Total Estimated Time**: 11-18 days

## Success Criteria

### Functional Requirements
- ✅ All video call features work reliably
- ✅ Whiteboard synchronizes correctly
- ✅ AI assistant responds using ChatGPT API
- ✅ Presentation panel handles all modes
- ✅ Chat messages send and receive
- ✅ Authentication and sessions work securely

### Non-Functional Requirements
- ✅ Application loads in < 3 seconds
- ✅ Video quality adapts to network conditions
- ✅ Error recovery happens automatically
- ✅ UI is responsive on all screen sizes
- ✅ Accessibility standards met (WCAG AA)
- ✅ Color scheme implemented consistently

### Deployment Requirements
- ✅ Frontend deployed to Vercel
- ✅ Backend running locally and exposed via ngrok
- ✅ HTTPS enabled (via Vercel and ngrok)
- ✅ Environment variables configured in Vercel
- ✅ Automatic frontend deployments working
- ✅ Multi-user testing successful across different locations

## Risks and Mitigation

### Technical Risks

**Risk**: Agora SDK compatibility issues
- **Mitigation**: Test with latest SDK versions, maintain fallback options

**Risk**: OpenAI API rate limiting
- **Mitigation**: Implement request caching, rate limiting, error handling

**Risk**: WebSocket connection instability
- **Mitigation**: Implement reconnection logic, fallback to polling

**Risk**: Browser compatibility issues
- **Mitigation**: Test on major browsers, use polyfills where needed

### Deployment Risks

**Risk**: ngrok URL changes on restart
- **Mitigation**: Use ngrok paid plan for static URLs, or update Vercel env vars when URL changes

**Risk**: Environment variable misconfiguration
- **Mitigation**: Document all required variables, use validation

**Risk**: CORS issues with ngrok
- **Mitigation**: Configure CORS to accept ngrok domains, test thoroughly

**Risk**: Backend laptop must stay running
- **Mitigation**: Use stable internet connection, consider cloud VM for longer testing periods

**Risk**: Cost overruns from API usage
- **Mitigation**: Monitor usage, set up billing alerts, implement caching

## Maintenance and Monitoring

### Monitoring

**Frontend Monitoring**:
- Error tracking (Sentry or similar)
- Performance monitoring (Web Vitals)
- User analytics (optional)

**Backend Monitoring**:
- API response times
- Error rates
- Token generation success rates
- Database query performance

### Logging

**Log Levels**:
- ERROR: Critical failures requiring immediate attention
- WARN: Potential issues that don't break functionality
- INFO: Important state changes and operations
- DEBUG: Detailed information for troubleshooting

**Log Aggregation**:
- Centralized logging service (optional)
- Log retention policy
- Search and filter capabilities

### Updates and Maintenance

**Regular Updates**:
- Dependency updates (monthly)
- Security patches (as needed)
- SDK version updates (quarterly)
- Feature enhancements (ongoing)

**Backup Strategy**:
- Database backups (daily)
- Configuration backups
- Deployment snapshots

## Conclusion

This design provides a comprehensive plan for overhauling the Virtual Classroom application. By systematically addressing each component, implementing proper error handling, switching to OpenAI ChatGPT API, applying the yellow/purple color scheme, and deploying to Vercel, we will create a robust, reliable, and visually appealing application that meets all requirements.

The phased approach ensures steady progress while maintaining quality, and the extensive testing strategy ensures correctness and reliability. The deployment architecture provides scalability and ease of maintenance for future enhancements.

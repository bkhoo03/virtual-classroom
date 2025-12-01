# Implementation Plan

- [x] 1. Audit existing features and document current state
  - Review all components and services
  - Test each feature manually
  - Document broken or incomplete functionality
  - Create prioritized issue list
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7_

- [x] 1.1 Write property test for API endpoint validation
  - **Property 1: API endpoint validation**
  - **Validates: Requirements 1.6**

- [x] 2. Set up testing infrastructure
  - Install and configure fast-check for property-based testing
  - Set up test utilities and helpers
  - Configure test coverage reporting
  - _Requirements: All testing requirements_

- [x] 3. Replace Doubao API with OpenAI ChatGPT API
  - Update AIService to use OpenAI endpoint
  - Change API request/response format for ChatGPT
  - Update message format (role: 'system' | 'user' | 'assistant')
  - Test streaming and non-streaming responses
  - Update environment variable names
  - _Requirements: 7.1, 7.2, 7.4_

- [x] 3.1 Update AIService interface and types
  - Create ChatGPTMessage, ChatGPTRequest, ChatGPTResponse types
  - Update AIServiceConfig for OpenAI
  - Change default model to 'gpt-3.5-turbo' or 'gpt-4'
  - _Requirements: 7.1_

- [x] 3.2 Implement OpenAI API integration
  - Update makeRequest to use OpenAI endpoint
  - Update request headers for OpenAI format
  - Handle OpenAI-specific error codes
  - Maintain rate limiting and caching
  - _Requirements: 7.1, 7.2_

- [x] 3.3 Update streaming implementation for OpenAI
  - Adapt stream parsing for OpenAI format
  - Handle OpenAI stream chunks
  - Test streaming responses
  - _Requirements: 7.2_

- [x] 3.4 Write property tests for AI service
  - **Property 30: AI message transmission**
  - **Property 31: AI response display**
  - **Property 32: AI error handling**
  - **Property 33: AI conversation context**
  - **Property 34: AI conversation reset**
  - **Validates: Requirements 7.1, 7.2, 7.4, 7.5, 7.6**

- [ ] 4. Implement web search integration for AI
  - Create WebSearchService with Serper API integration
  - Implement search result caching (5-minute TTL)
  - Add fallback to Brave Search API
  - Limit results to 3 per query for cost optimization
  - Include source citations in results
  - _Requirements: 4.1, 4.5, 4.7, 5.2_

- [x] 4.1 Create WebSearchService
  - Define WebSearchConfig, SearchQuery, and SearchResult interfaces
  - Implement Serper API integration
  - Add Brave Search API as fallback
  - Implement in-memory caching with TTL
  - Add usage statistics tracking
  - _Requirements: 4.1, 4.7_

- [x] 4.2 Integrate web search with AI service
  - Add web search detection to AI query analysis
  - Integrate WebSearchService with AIService
  - Format search results for AI context
  - Display search results with citations in UI
  - _Requirements: 4.1, 4.5_

- [x] 4.3 Write property tests for web search
  - **Property 17: Web search execution**
  - **Property 20: Search result citation**
  - **Property 22: Search result caching**
  - **Property 24: Search result limitation**
  - **Validates: Requirements 4.1, 4.5, 4.7, 5.2**

- [x] 5. Implement Unsplash image search integration
  - Create ImageSearchService with Unsplash API integration
  - Implement image result caching (10-minute TTL)
  - Limit results to 3 images per query
  - Include proper attribution (photographer + Unsplash link)
  - Prefer Unsplash over DALL-E for cost savings
  - _Requirements: 4.3, 4.9, 5.4, 5.5_

- [x] 5.1 Create ImageSearchService
  - Define ImageSearchConfig, ImageSearchQuery, and UnsplashImage interfaces
  - Implement Unsplash API integration
  - Implement in-memory caching with 10-minute TTL
  - Add usage statistics tracking
  - Handle API errors gracefully
  - _Requirements: 4.3, 5.4_

- [x] 5.2 Integrate image search with AI service
  - Add Unsplash image search to AIService
  - Format image results with attribution
  - Display images with photographer credits in UI
  - Add loading states for image search
  - _Requirements: 4.3, 4.9_

- [x] 5.3 Write property tests for image search
  - **Property 19: Proactive image search**
  - **Property 20: Image display with attribution**
  - **Validates: Requirements 4.3, 4.4, 4.9**

- [x] 6. Implement image generation with DALL-E
  - Create ImageGenerationService with DALL-E 2 integration
  - Implement image compression for bandwidth optimization
  - Add 10-second timeout with user notification
  - Cache generated images in browser storage
  - Use as fallback when Unsplash doesn't have suitable images
  - _Requirements: 4.2, 4.7, 5.3, 5.7_

- [x] 6.1 Create ImageGenerationService
  - Define ImageGenConfig, ImageRequest, and GeneratedImage interfaces
  - Implement DALL-E 2 API integration
  - Use 512x512 size by default for cost-effectiveness
  - Implement image compression (80% quality)
  - Add usage statistics and cost tracking
  - _Requirements: 4.2, 5.3, 5.7_

- [x] 6.2 Integrate image generation with AI service
  - Add image generation detection to AI query analysis
  - Integrate ImageGenerationService with AIService
  - Implement 10-second timeout handling
  - Display generated images in AI output panel
  - Add loading states for image generation
  - _Requirements: 4.2, 4.4, 4.7_

- [x] 6.3 Write property tests for image generation
  - **Property 18: Image generation and display**
  - **Property 23: Image generation timeout**
  - **Property 25: Cost-effective image model**
  - **Property 27: Image compression**
  - **Validates: Requirements 4.2, 4.7, 5.3, 5.7**

- [x] 7. Implement multimodal AI orchestration with proactive image enhancement
  - Create MultimodalAIOrchestrator to coordinate text, search, image search, and image generation
  - Implement smart intent detection for query analysis
  - Implement proactive image detection (AI determines when images would help)
  - Prefer Unsplash over DALL-E for cost savings
  - Execute services in parallel
  - Implement graceful degradation if services fail
  - Add cost tracking and performance monitoring
  - _Requirements: 4.3, 4.5, 5.1, 5.4, 5.6, 5.8, 5.9_

- [x] 7.1 Create MultimodalAIOrchestrator
  - Define OrchestratorConfig, MultimodalRequest, and MultimodalResult interfaces
  - Implement smart intent detection using keywords and patterns
  - Implement proactive image enhancement logic
  - Extract visual concepts from AI responses
  - Coordinate parallel execution of services
  - Handle partial failures gracefully
  - Track costs and performance metrics
  - _Requirements: 4.3, 4.5, 5.1_

- [x] 7.2 Implement proactive image detection
  - Analyze user query and AI response for visual concepts
  - Trigger image search for educational topics, scientific concepts, etc.
  - Extract 1-3 key visual concepts from responses
  - Search Unsplash first, fallback to DALL-E if needed
  - Skip images for abstract concepts, code, math (unless requested)
  - _Requirements: 4.3, 5.4_

- [x] 7.3 Implement response caching and rate limiting
  - Cache complete multimodal responses
  - Implement request queue for rate limit management
  - Notify users of delays when queued
  - Log cost warnings when usage is high
  - _Requirements: 5.6, 5.8, 5.9_

- [x] 7.4 Update AI output panel for multimodal content
  - Display text responses with markdown support
  - Display Unsplash images with photographer attribution
  - Display generated images with captions
  - Display search results with source citations
  - Add loading states for each content type
  - Show cost and performance metrics (debug mode)
  - _Requirements: 4.4, 4.5, 4.6, 4.9_

- [x] 7.5 Write property tests for multimodal orchestration
  - **Property 21: Multimodal response composition**
  - **Property 23: Text response performance**
  - **Property 24: Search result limitation**
  - **Property 26: Response caching for cost reduction**
  - **Property 28: Rate limit queue management**
  - **Property 29: Cost monitoring and warnings**
  - **Validates: Requirements 4.5, 5.1, 5.2, 5.4, 5.6, 5.8, 5.9**

- [x] 8. Checkpoint - Ensure multimodal AI features work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Fix video call initialization and state management
  - Verify Agora token generation flow
  - Improve error handling for camera/microphone permissions
  - Add proper cleanup on session end
  - Fix state synchronization between VideoCallModule and ControlToolbar
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 9.1 Verify and fix Agora RTC initialization
  - Test token generation from backend
  - Handle initialization errors gracefully
  - Add retry logic for failed initialization
  - Display user-friendly error messages
  - _Requirements: 2.1_

- [x] 9.2 Fix local video stream creation
  - Ensure local video track is created successfully
  - Handle camera permission denied
  - Provide fallback for missing camera
  - Display local video in UI
  - _Requirements: 2.2_

- [x] 9.3 Fix remote video stream subscription
  - Subscribe to remote users automatically
  - Handle remote user join/leave events
  - Display remote video streams
  - Clean up remote streams on user leave
  - _Requirements: 2.3_

- [x] 9.4 Implement media control state synchronization
  - Sync audio mute state between service and UI
  - Sync video off state between service and UI
  - Handle external state changes
  - Update toolbar buttons to reflect current state
  - _Requirements: 2.4, 2.5, 8.1, 8.2, 8.7_

- [x] 9.5 Write property tests for video call service
  - **Property 2: Video initialization with credentials**
  - **Property 3: Local video stream availability**
  - **Property 4: Remote video stream subscription**
  - **Property 5: Media control state synchronization**
  - **Property 6: Video resource cleanup**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 8.1, 8.2, 8.7**

- [x] 10. Add connection quality indicators
  - Implement network quality monitoring
  - Display connection quality in UI
  - Adjust video quality based on network conditions
  - Show reconnection status
  - _Requirements: 2.7_

- [x] 10.1 Write property test for connection quality
  - **Property 7: Connection quality indicator accuracy**
  - **Validates: Requirements 2.7**

- [x] 11. Fix whiteboard initialization and synchronization
  - Verify whiteboard token generation
  - Fix whiteboard connection issues
  - Ensure drawing tools work correctly
  - Test real-time synchronization
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.7_

- [x] 11.1 Implement whiteboard initialization
  - Generate whiteboard tokens from backend
  - Initialize Agora Whiteboard SDK
  - Handle connection errors
  - Display whiteboard canvas
  - _Requirements: 3.1_

- [x] 11.2 Implement whiteboard tool management
  - Add tool selection (pen, eraser, selector, text)
  - Add color picker
  - Add stroke width selector
  - Ensure selected tool is active
  - _Requirements: 3.2, 3.4, 3.5_

- [x] 11.3 Implement whiteboard cleanup
  - Disconnect from whiteboard room on leave
  - Clean up whiteboard resources
  - Handle cleanup errors
  - _Requirements: 3.7_

- [x] 11.4 Write property tests for whiteboard service
  - **Property 8: Whiteboard initialization**
  - **Property 9: Whiteboard state management**
  - **Property 10: Whiteboard cleanup**
  - **Validates: Requirements 3.1, 3.2, 3.4, 3.5, 3.7**

- [x] 12. Fix presentation panel mode switching with react-pdf-highlighter
  - Install react-pdf-highlighter library
  - Remove custom annotation system (AnnotationCanvas, AnnotationLayer, etc.)
  - Implement PDF upload and display using react-pdf-highlighter
  - Implement PDF page navigation
  - Implement mode switching (PDF/whiteboard/screenshare)
  - Preserve state when switching modes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 12.1 Install react-pdf-highlighter and cleanup
  - Install react-pdf-highlighter package
  - Remove custom annotation components (AnnotationCanvas.tsx, PDFAnnotationLayer.tsx, AnnotationLayer.tsx, SVGAnnotationLayer.tsx)
  - Remove AnnotationStorageService.ts and related types
  - Remove AnnotationToolbar.tsx
  - Remove useAnnotations.ts hook
  - Remove old PDFViewer.tsx, ReactPDFViewer.tsx, PDFViewerWithAnnotations.tsx
  - _Requirements: 6.1, 6.5_

- [x] 12.2 Implement PDF viewer with react-pdf-highlighter
  - Create new PDFViewerWithHighlighter component using react-pdf-highlighter
  - Add PDF upload functionality
  - Display PDF in presentation panel
  - Implement page navigation controls
  - Add zoom controls (built into react-pdf-highlighter)
  - Style with yellow/purple theme
  - _Requirements: 6.1, 6.2_

- [x] 12.3 Implement PDF highlighting and annotations
  - Configure react-pdf-highlighter for text highlighting
  - Add highlight color picker (yellow primary, purple secondary)
  - Enable area highlights for non-text regions
  - Display highlights overlaid on PDF
  - Ensure highlights maintain alignment on zoom/pan (handled by library)
  - Add clear highlights functionality
  - _Requirements: 6.5, 6.6_

- [x] 12.4 Implement presentation mode switching
  - Add mode selector UI (PDF/whiteboard/screenshare)
  - Switch between modes smoothly
  - Preserve PDF state (page, zoom, highlights) when switching modes
  - Preserve whiteboard state when switching modes
  - Handle mode transitions with animations
  - _Requirements: 6.3, 6.4, 6.7_

- [x] 12.5 Write property tests for presentation panel
  - **Property 11: PDF display**
  - **Property 12: PDF page navigation**
  - **Property 13: Presentation mode transitions**
  - **Property 14: Annotation display**
  - **Property 15: Annotation alignment invariant**
  - **Property 16: Presentation mode state preservation**
  - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

- [ ] 13. Replace react-pdf-highlighter with Agora Whiteboard document display
  - Remove react-pdf-highlighter library and PDFViewerWithHighlighter component
  - Implement PDF conversion using Agora's file conversion API
  - Display converted PDFs on the whiteboard
  - Implement document upload and conversion flow
  - Add conversion progress indicators
  - Store converted documents for reuse
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 13.1 Remove react-pdf-highlighter
  - Uninstall react-pdf-highlighter package
  - Remove PDFViewerWithHighlighter component
  - Remove PDF-related CSS files
  - Clean up PDF viewer imports
  - _Requirements: 6.1_

- [x] 13.2 Implement Agora document conversion service
  - Create DocumentConversionService class
  - Implement startConversion method (calls Agora REST API)
  - Implement queryConversionProgress method
  - Handle static and dynamic document types
  - Parse conversion results into whiteboard format
  - _Requirements: 6.1, 6.2_

- [x] 13.3 Implement document upload and conversion flow
  - Add PDF upload button in presentation panel
  - Upload PDF to backend/cloud storage
  - Trigger Agora conversion via backend
  - Poll conversion progress
  - Display progress indicator to user
  - Handle conversion errors gracefully
  - _Requirements: 6.1, 6.2_

- [x] 13.4 Display converted documents on whiteboard
  - Load converted document into whiteboard room
  - Display document pages on whiteboard
  - Implement page navigation using whiteboard API
  - Enable drawing/annotations on document pages
  - Sync document state across users
  - _Requirements: 6.1, 6.2, 6.5_

- [x] 13.5 Implement document management
  - Store converted documents in database/storage
  - List available documents for session
  - Allow switching between documents
  - Cache conversion results to avoid re-conversion
  - _Requirements: 6.1, 6.2_

- [x] 13.6 Write property tests for document display
  - **Property 102: Document conversion completion**
  - **Property 103: Document display on whiteboard**
  - **Property 104: Document page navigation**
  - **Property 105: Document annotation persistence**
  - **Validates: Requirements 6.1, 6.2, 6.5**

**Note:** Document upload currently works locally but Agora's conversion API cannot access localhost URLs. For full functionality, complete task 24 (ngrok setup) to expose the backend publicly, or upload files to cloud storage (S3, Cloudinary, etc.) instead of local storage.

- [x] 14. Fix control toolbar functionality
  - Implement audio toggle
  - Implement video toggle
  - Implement screen share toggle
  - Implement presentation mode selector
  - Implement leave classroom button
  - Add keyboard shortcuts
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 14.1 Write property tests for control toolbar
  - **Property 35: Screen share toggle**
  - **Property 36: Classroom cleanup and navigation**
  - **Property 37: Keyboard shortcut mapping**
  - **Validates: Requirements 8.3, 8.5, 8.6**

- [x] 15. Fix chat functionality
  - Implement message sending
  - Display messages with sender and timestamp
  - Add unread message indicators
  - Implement auto-scroll behavior
  - _Requirements: 9.1, 9.3, 9.6, 9.7_

- [x] 15.1 Write property tests for chat
  - **Property 38: Chat message display**
  - **Property 39: Unread message tracking**
  - **Property 40: Unread message reset**
  - **Validates: Requirements 9.1, 9.3, 9.6, 9.7**

- [x] 16. Verify authentication and session management
  - Test login flow
  - Test token generation
  - Test session creation
  - Test session validation
  - Test token refresh
  - Test logout
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 16.1 Write property tests for authentication
  - **Property 41: Authentication token issuance**
  - **Property 42: Session ID uniqueness**
  - **Property 43: Session access validation**
  - **Property 44: Automatic token refresh**
  - **Property 45: Token refresh failure handling**
  - **Property 46: Logout state cleanup**
  - **Property 47: Session cleanup timeout**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

- [x] 17. Checkpoint - Ensure all core features work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Implement comprehensive error handling
  - Add error boundaries to catch React errors
  - Implement error logging with context
  - Add user-friendly error messages
  - Implement automatic error recovery
  - Add manual recovery options
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 18.1 Add error boundaries
  - Wrap main components in error boundaries
  - Display fallback UI on errors
  - Log errors with context
  - _Requirements: 12.4_

- [x] 18.2 Implement error logging
  - Log all errors with timestamp and context
  - Include user information in logs
  - Include stack traces
  - _Requirements: 12.1, 12.5_

- [x] 18.3 Implement reconnection logic
  - Add exponential backoff for network errors
  - Display reconnection status
  - Notify user on successful recovery
  - _Requirements: 12.3, 12.6_

- [x] 18.4 Add debug mode
  - Implement verbose console logging
  - Add debug flag in environment
  - Log all operations in debug mode
  - _Requirements: 12.7_

- [x] 18.5 Write property tests for error handling
  - **Property 51: Comprehensive error logging**
  - **Property 52: SDK initialization error messages**
  - **Property 53: Exponential backoff reconnection**
  - **Property 54: Error boundary catching**
  - **Property 55: Error recovery notification**
  - **Property 56: Debug mode verbose logging**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7**

- [x] 20. Implement accessibility features
  - Add ARIA labels to all interactive elements
  - Ensure keyboard navigation works
  - Add visible focus indicators
  - Respect prefers-reduced-motion
  - Display clear error messages
  - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.7_

- [x] 20.1 Write property tests for accessibility
  - **Property 48: Error message display**
  - **Property 50: Motion preference respect**
  - **Validates: Requirements 11.5, 11.7**

- [x] 23. Configure backend CORS for ngrok
  - Update CORS configuration to accept ngrok domains
  - Test CORS with ngrok URL
  - Ensure credentials are passed correctly
  - _Requirements: 14.6_

- [x] 23.1 Update backend CORS configuration
  - Add regex patterns for ngrok domains (*.ngrok-free.app, *.ngrok.io)
  - Keep localhost for local development
  - Test CORS configuration with both ngrok tunnels
  - Ensure credentials and headers are passed correctly
  - _Requirements: 14.6_

- [x] 23.2 Write property test for API routing
  - **Property 61: Production API routing**
  - **Validates: Requirements 14.6**

- [x] 24. Set up ngrok for backend exposure
  - Install ngrok
  - Configure ngrok for port 3001 (backend)
  - Test ngrok tunnel
  - Document ngrok setup process
  - _Requirements: 14.1, 14.2, 14.4_

- [x] 24.1 Install and configure ngrok for backend
  - Install ngrok globally
  - Create ngrok configuration file for backend (port 3001)
  - Test ngrok tunnel creation
  - Document ngrok commands
  - _Requirements: 14.1, 14.2, 14.4_

- [ ] 25. Set up ngrok for frontend exposure
  - Configure ngrok for port 5173 (Vite dev server)
  - Update frontend .env with backend ngrok URL
  - Test both ngrok tunnels running simultaneously
  - Document dual ngrok setup
  - _Requirements: 14.1, 14.3, 14.4, 14.5, 14.7_

- [ ] 25.1 Configure ngrok for frontend
  - Set up second ngrok tunnel for port 5173
  - Update VITE_BACKEND_URL in .env to use backend ngrok URL
  - Test frontend accessing backend through ngrok
  - _Requirements: 14.1, 14.3_

- [ ] 25.2 Test dual ngrok setup
  - Start backend on port 3001
  - Start frontend dev server on port 5173
  - Start both ngrok tunnels
  - Test accessing frontend via ngrok URL
  - Verify frontend can call backend via ngrok
  - Test multimodal AI features with Unsplash and DALL-E
  - _Requirements: 14.4, 14.5, 14.6_

- [ ] 25.3 Document ngrok workflow
  - Document how to start both tunnels
  - Document how to update environment variables
  - Document benefits: instant code changes, no deployment wait
  - Document future migration to Vercel/AWS if needed
  - _Requirements: 14.7_

- [ ] 26. Test multi-user functionality
  - Start backend locally
  - Start ngrok tunnel
  - Update Vercel environment variable
  - Test with colleague from different location
  - Verify video, audio, whiteboard, chat all work
  - Test multimodal AI with web search, Unsplash, and DALL-E
  - Test proactive image enhancement
  - _Requirements: All requirements_

- [ ] 27. Document deployment process
  - Write ngrok setup guide
  - Write Vercel deployment guide
  - Document environment variable configuration
  - Document testing workflow
  - Document multimodal AI API setup (OpenAI, Serper, Unsplash)
  - Document proactive image enhancement feature
  - Document future AWS migration path
  - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 28. Implement AI system prompt with capability awareness
  - Update AIService to include system prompt about Unsplash and DALL-E
  - Inform AI it can proactively use images for educational content
  - Test that system prompt is included in all AI requests
  - _Requirements: 4.10_

- [x] 28.1 Write property test for AI system prompt
  - **Property 86: AI capabilities in system prompt**
  - **Validates: Requirements 4.10**

- [x] 29. Implement AIAnimationController
  - Create AIAnimationController class with animation methods
  - Implement slideInPanel and slideOutPanel with easing
  - Implement typewriterEffect with natural pacing
  - Implement fadeInImage with scale effect
  - Implement staggerElements with configurable delays
  - Implement loading indicators (spinner, dots, pulse)
  - Add prefers-reduced-motion detection
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [x] 29.1 Implement panel animations
  - Create slide-in animation with cubic-bezier easing
  - Create slide-out animation
  - Add 500ms duration
  - Test smooth transitions
  - _Requirements: 16.1_

- [x] 29.2 Implement typewriter effect
  - Create character-by-character reveal
  - Add natural pacing (30-50 chars/second)
  - Optional blinking cursor
  - Use requestAnimationFrame for smoothness
  - _Requirements: 16.2_

- [x] 29.3 Implement image animations
  - Create fade-in with opacity transition
  - Add subtle scale effect (0.95 to 1.0)
  - Use 400ms duration
  - Test smooth image loading
  - _Requirements: 16.3_

- [x] 29.4 Implement staggered animations
  - Apply increasing delays to elements
  - Use 50-100ms stagger delay
  - Create cascading effect
  - _Requirements: 16.5_

- [x] 29.5 Implement loading indicators
  - Create modern spinner with smooth rotation
  - Create pulsing dots for text generation
  - Create pulse effect for image loading
  - _Requirements: 16.4_

- [x] 29.6 Add accessibility support
  - Detect prefers-reduced-motion setting
  - Disable or reduce animations when enabled
  - Provide instant transitions as fallback
  - _Requirements: 16.7_

- [x] 29.7 Write property tests for animations
  - **Property 62: Panel slide-in animation**
  - **Property 63: Typewriter text animation**
  - **Property 64: Image fade-in animation**
  - **Property 65: Loading indicator display**
  - **Property 66: Staggered element animations**
  - **Property 67: Hover feedback animations**
  - **Property 68: Reduced motion respect**
  - **Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7**

- [x] 30. Implement modern design system for AI components
  - Create card component with shadows and rounded corners
  - Define consistent spacing scale
  - Create typography hierarchy
  - Define transition timing functions
  - Apply design system to all AI components
  - _Requirements: 16.8, 16.9, 16.10_

- [x] 30.1 Create AI card component
  - Add subtle box-shadow
  - Add rounded corners (border-radius)
  - Add proper padding and margin
  - Add hover effects
  - _Requirements: 16.8_

- [x] 30.2 Define design system constants
  - Create timing function constants
  - Create duration constants
  - Create spacing scale
  - Create typography scale
  - _Requirements: 16.9, 16.10_

- [x] 30.3 Apply design system to AI components
  - Update AIOutputPanel with card designs
  - Update AIAssistant with consistent spacing
  - Apply typography hierarchy
  - Ensure consistent transitions
  - _Requirements: 16.8, 16.9, 16.10_

- [x] 30.4 Write property tests for design system
  - **Property 69: Modern card design**
  - **Property 70: Consistent transition timing**
  - **Property 71: Typography hierarchy**
  - **Validates: Requirements 16.8, 16.9, 16.10**

- [x] 31. Implement AIOutputHistoryManager
  - Create AIOutputHistoryManager class
  - Implement addEntry method
  - Implement getHistory method
  - Implement clearHistory method
  - Implement sessionStorage persistence
  - Implement sessionStorage loading
  - Limit to 50 entries maximum
  - _Requirements: 17.1, 17.2, 17.6, 17.7_

- [x] 31.1 Create history storage
  - Define AIOutputEntry interface
  - Implement in-memory storage
  - Add entry with timestamp
  - Maintain chronological order
  - _Requirements: 17.1, 17.2_

- [x] 31.2 Implement persistence
  - Save history to sessionStorage on add
  - Load history from sessionStorage on init
  - Clear sessionStorage on session end
  - Handle storage quota errors
  - _Requirements: 17.7, 17.6_

- [x] 31.3 Write property tests for history manager
  - **Property 72: Response history addition**
  - **Property 73: Chronological history ordering**
  - **Property 77: History cleanup on session end**
  - **Property 78: History persistence across refresh**
  - **Validates: Requirements 17.1, 17.2, 17.6, 17.7**

- [x] 32. Update AI output panel to display history
  - Display all historical responses
  - Show each response as a distinct card
  - Add timestamp to each card
  - Implement scroll management
  - Implement auto-scroll to newest
  - Apply animations to new entries
  - _Requirements: 17.2, 17.3, 17.4, 17.5_

- [x] 32.1 Create history display component
  - Map over history entries
  - Render each as a card
  - Display timestamp
  - Display user query
  - Display AI response with images and search results
  - _Requirements: 17.2, 17.3_

- [x] 32.2 Implement scroll management
  - Maintain scroll position on updates
  - Auto-scroll to bottom on new entry
  - Allow manual scrolling
  - Show scroll indicator if needed
  - _Requirements: 17.4, 17.5_

- [x] 32.3 Apply animations to history
  - Animate new entries with fade-in
  - Use staggered animations for multiple elements
  - Apply typewriter effect to new text
  - Fade in new images
  - _Requirements: 16.2, 16.3, 16.5_

- [x] 32.4 Write property tests for history display
  - **Property 74: Response card display**
  - **Property 75: Scroll position maintenance**
  - **Property 76: Auto-scroll to newest**
  - **Validates: Requirements 17.3, 17.4, 17.5**

- [x] 33. Implement PresentationModeManager
  - Create PresentationModeManager class
  - Implement getCurrentMode method
  - Implement switchMode method
  - Implement state preservation for each mode
  - Implement state restoration
  - Track previous mode
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

- [x] 33.1 Create mode management
  - Define PresentationMode type
  - Track current and previous mode
  - Implement mode switching logic
  - Emit mode change events
  - _Requirements: 18.1_

- [x] 33.2 Implement state preservation
  - Preserve PDF state (page, zoom, scroll)
  - Preserve whiteboard state
  - Preserve screen share state
  - Store state in memory
  - _Requirements: 18.2, 18.3, 18.4_

- [x] 33.3 Implement state restoration
  - Restore PDF state when returning
  - Restore whiteboard state when returning
  - Restore screen share state when returning
  - _Requirements: 18.6_

- [x] 33.4 Write property tests for mode manager
  - **Property 80: PDF state preservation on switch**
  - **Property 81: Whiteboard state preservation on switch**
  - **Property 82: Screen share state preservation on switch**
  - **Property 84: State restoration on return**
  - **Validates: Requirements 18.2, 18.3, 18.4, 18.6**

- [x] 34. Implement auto-switch to AI output on query
  - Integrate PresentationModeManager with AI assistant
  - Auto-switch to AI output mode when query is sent
  - Preserve current mode state before switching
  - Animate the mode transition
  - Show visual indicator of previous mode
  - Add button to return to previous mode
  - _Requirements: 18.1, 18.5, 18.7_

- [x] 34.1 Integrate with AI assistant
  - Call autoSwitchToAIOutput when query is sent
  - Preserve current mode before switch
  - Animate transition smoothly
  - _Requirements: 18.1, 18.7_

- [x] 34.2 Add previous mode indicator
  - Show badge or button indicating previous mode
  - Make it clickable to return
  - Style with brand colors
  - _Requirements: 18.5_

- [x] 34.3 Implement return to previous mode
  - Add button to return to previous mode
  - Restore previous mode state
  - Animate transition back
  - _Requirements: 18.6_

- [x] 34.4 Write property tests for auto-switch
  - **Property 79: Auto-switch to AI output**
  - **Property 83: Previous mode indicator**
  - **Property 85: Smooth mode transition animation**
  - **Validates: Requirements 18.1, 18.5, 18.7**

- [ ] 35. Checkpoint - Ensure AI UX improvements work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 36. Polish AI interface styling
  - Apply yellow/purple color scheme to AI components. Yellow primary and purple secondary
  - Ensure consistent spacing throughout
  - Add subtle shadows and depth
  - Verify typography hierarchy
  - Test hover states and interactions
  - Ensure mobile responsiveness
  - _Requirements: 13.1, 13.2, 13.3, 16.8, 16.9, 16.10_

- [x] 37. Test complete AI workflow
  - Test sending queries from different presentation modes
  - Verify auto-switch works correctly
  - Verify state preservation and restoration
  - Test history display and persistence
  - Test all animations
  - Verify reduced motion support
  - Test with multiple queries in sequence
  - _Requirements: All AI UX requirements_

- [ ] 38. Final checkpoint - Complete system test
  - Ensure all tests pass, ask the user if questions arise.

- [x] 40. Create glass-morphism design system
  - Create glass utility classes in Tailwind config
  - Define glass variants (subtle, strong, yellow, purple)
  - Test backdrop-filter browser support
  - Add fallbacks for unsupported browsers
  - _Requirements: 19.2, 19.8_

- [x] 40.1 Create glass CSS utilities
  - Define base glass effect with backdrop-filter
  - Create glass-dark variant for dark backgrounds
  - Create glass-subtle and glass-strong variants
  - Create glass-yellow and glass-purple colored variants
  - _Requirements: 19.2_

- [x] 40.2 Test glass-morphism effects
  - Test in Chrome, Firefox, Safari
  - Test on mobile devices
  - Add -webkit-backdrop-filter for Safari
  - Create fallback for browsers without backdrop-filter support
  - _Requirements: 19.2_

- [x] 41. Create animation system
  - Define easing function CSS variables
  - Create animation duration constants
  - Create micro-interaction utility classes
  - Test smooth animations across components
  - _Requirements: 19.4, 19.7, 19.9, 19.15_

- [x] 41.1 Define animation constants
  - Create easing function CSS variables (ease-out-expo, ease-in-out-circ, ease-spring)
  - Create duration constants (fast, normal, slow, verySlow)
  - Create delay constants (stagger, sequence)
  - Export as TypeScript constants
  - _Requirements: 19.15_

- [x] 41.2 Create micro-interaction classes
  - Create btn-press class for button press effect
  - Create hover-lift class for hover elevation
  - Create glow-yellow class for yellow glow effect
  - Test all micro-interactions
  - _Requirements: 19.4, 19.9_

- [x] 42. Update Tailwind config with yellow/purple palettes
  - Add yellow color palette (50-900)
  - Add purple color palette (50-900)
  - Configure primary and secondary color aliases
  - Test color generation
  - _Requirements: 19.3, 19.10_

- [x] 43. Modernize whiteboard components
  - Replace emoji icons with Lucide icons in ToolPalette
  - Apply glass-morphism to ToolPalette
  - Apply yellow active states to tools
  - Modernize ColorPicker with glass effects
  - Modernize StrokeWidthSelector
  - Modernize WhiteboardActions with modern icons
  - Add smooth hover animations
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.14_

- [x] 43.1 Modernize ToolPalette
  - Replace emoji icons with Lucide icons (MousePointer2, Pencil, Square, Circle, Minus, Type, Eraser, Hand)
  - Apply glass effect to palette container
  - Use yellow-500 for active tool background
  - Add smooth scale transitions on hover
  - Add yellow shadow for active tool
  - _Requirements: 19.1, 19.3, 19.4, 19.14_

- [x] 43.2 Modernize ColorPicker
  - Apply glass effect to container
  - Add modern color grid layout
  - Add yellow ring for selected color
  - Add smooth scale transitions on hover
  - Add color labels with modern typography
  - _Requirements: 19.2, 19.4_

- [x] 43.3 Modernize StrokeWidthSelector
  - Apply glass effect to container
  - Use modern UI elements for width options
  - Add yellow highlights for selected width
  - Add smooth transitions
  - _Requirements: 19.2, 19.3, 19.4_

- [x] 43.4 Modernize WhiteboardActions
  - Replace emoji icons with Lucide icons (Undo, Redo, Trash2, Save)
  - Apply glass effect to container
  - Add yellow hover effects
  - Add smooth scale transitions
  - Add disabled states with reduced opacity
  - _Requirements: 19.1, 19.4, 19.6_

- [x] 43.5 Write property tests for whiteboard UI
  - **Property 87: Modern SVG icons usage**
  - **Property 88: Glass-morphism effect application**
  - **Property 89: Yellow brand color for active states**
  - **Property 90: Smooth hover animations**
  - **Property 100: Modern whiteboard tools**
  - **Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.14**

- [ ] 44. Modernize chat component
  - Apply glass-morphism to message bubbles
  - Add yellow accents for sent messages
  - Modernize chat input with glass effect
  - Replace emoji icons with Lucide icons
  - Add smooth animations for new messages
  - _Requirements: 19.1, 19.2, 19.6, 19.9_

- [x] 44.1 Modernize message bubbles
  - Apply glass effect to received messages
  - Apply glass-yellow effect to sent messages
  - Add rounded corners with modern styling
  - Add smooth fade-in animation for new messages
  - Add sender name with yellow color
  - _Requirements: 19.2, 19.6, 19.9_

- [x] 44.2 Modernize chat input
  - Apply glass effect to input container
  - Replace send button emoji with Lucide Send icon
  - Add yellow button styling
  - Add smooth hover and press animations
  - _Requirements: 19.1, 19.2, 19.4_

- [x] 44.3 Write property tests for chat UI
  - **Property 92: Modern chat interface**
  - **Validates: Requirements 19.6**

- [x] 45. Modernize control toolbar
  - Replace emoji icons with Lucide icons
  - Apply glass-dark effect to toolbar
  - Add yellow highlights for active states
  - Add smooth hover animations
  - Add danger state styling for leave button
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.7_

- [x] 45.1 Update toolbar icons
  - Replace audio icons with Mic/MicOff
  - Replace video icons with Video/VideoOff
  - Replace screen share icon with Monitor
  - Replace chat icon with MessageCircle
  - Replace leave icon with LogOut
  - _Requirements: 19.1_

- [x] 45.2 Apply glass-dark effect
  - Apply glass-dark to toolbar container
  - Add rounded corners and padding
  - Position at bottom center with fixed positioning
  - _Requirements: 19.2, 19.7_

- [x] 45.3 Add button states and animations
  - Create btn-toolbar base class
  - Create btn-toolbar-active class with yellow background
  - Create btn-toolbar-danger class for leave button
  - Add smooth scale transitions
  - Add hover effects
  - _Requirements: 19.3, 19.4, 19.7_

- [x] 45.4 Write property tests for toolbar UI
  - **Property 93: Modern control toolbar**
  - **Validates: Requirements 19.7**

- [x] 46. Modernize video call module
  - Apply glass overlays to video elements
  - Add modern connection quality indicator
  - Add glass-dark user info overlay
  - Replace icons with Lucide icons
  - Add smooth animations
  - _Requirements: 19.1, 19.2, 19.8, 19.9_

- [x] 46.1 Add glass overlays
  - Apply glass-dark to user info overlay
  - Add rounded corners to video elements
  - Add connection quality indicator with glass effect
  - Add smooth fade-in animations
  - _Requirements: 19.2, 19.8_

- [x] 46.2 Update video icons
  - Replace mute indicator with MicOff icon
  - Add animated connection quality dot
  - Add modern styling to all overlays
  - _Requirements: 19.1_

- [x] 46.3 Write property tests for video UI
  - **Property 94: Modern video call UI**
  - **Validates: Requirements 19.8**

- [x] 47. Modernize loading states
  - Create modern skeleton loaders with shimmer effect
  - Add yellow accents to loading indicators
  - Create modern spinner with yellow colors
  - Add smooth animations
  - _Requirements: 19.11_

- [x] 47.1 Create skeleton loaders
  - Create shimmer animation with yellow gradient
  - Apply glass effect to skeleton containers
  - Add various skeleton shapes (text, card, image)
  - Test shimmer animation performance
  - _Requirements: 19.11_

- [x] 47.2 Create modern spinner
  - Create circular spinner with yellow colors
  - Add smooth rotation animation
  - Create size variants (small, medium, large)
  - _Requirements: 19.11_

- [x] 47.3 Write property tests for loading states
  - **Property 97: Modern loading states**
  - **Validates: Requirements 19.11**

- [x] 48. Modernize tooltips and modals
  - Apply glass-strong effect to tooltips
  - Apply glass-strong effect to modals
  - Add smooth fade-in animations
  - Add backdrop blur to modal overlays
  - _Requirements: 19.2, 19.12_

- [x] 48.1 Modernize tooltips
  - Apply glass-strong effect
  - Add smooth fade-in animation
  - Add arrow pointer with glass effect
  - Add modern typography
  - _Requirements: 19.12_

- [x] 48.2 Modernize modals
  - Apply glass-strong effect to modal container
  - Add backdrop blur to overlay
  - Add smooth scale-in animation
  - Add modern button styling
  - _Requirements: 19.2_

- [x] 49. Implement focus management
  - Add yellow glow focus indicators
  - Add smooth transitions for focus states
  - Test keyboard navigation
  - Ensure WCAG compliance
  - _Requirements: 19.13_

- [x] 49.1 Create focus styles
  - Create global focus-visible styles with yellow ring
  - Add smooth transition to focus states
  - Add ring-offset for better visibility
  - Test with keyboard navigation
  - _Requirements: 19.13_

- [ ] 50. Create button system
  - Create btn-primary class with yellow styling
  - Create btn-secondary class with purple styling
  - Create btn-glass-yellow class
  - Add smooth hover and press animations
  - Test all button variants
  - _Requirements: 19.3, 19.4, 19.9_

- [ ] 51. Ensure consistent design language
  - Audit all components for consistency
  - Verify yellow/purple colors throughout
  - Verify glass-morphism effects throughout
  - Verify smooth animations throughout
  - Test on multiple screen sizes
  - _Requirements: 19.10_

- [ ] 52. Implement responsive design
  - Test on mobile devices
  - Reduce glass blur on mobile for performance
  - Simplify animations on mobile
  - Ensure touch targets are 44x44px minimum
  - Test on tablets
  - _Requirements: 19.10_

- [ ] 54. Performance optimization
  - Add will-change to animated elements
  - Use transform for animations
  - Lazy load icons
  - Debounce hover effects
  - Test performance on low-end devices
  - _Requirements: 19.9, 19.15_

- [ ] 55. Checkpoint - Ensure UI modernization is complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 56. Final polish and testing
  - Test entire application with new UI
  - Verify all animations are smooth
  - Verify all colors are consistent
  - Test on all major browsers
  - Test on mobile and tablet
  - Get user feedback
  - _Requirements: 19.1-19.15_

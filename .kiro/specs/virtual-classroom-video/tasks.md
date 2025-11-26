# Implementation Plan

- [x] 1. Set up project structure and development environment




  - Initialize React + TypeScript project with Vite
  - Configure Tailwind CSS with custom brand color theme
  - Set up project folder structure (components, hooks, services, types, utils)
  - Install core dependencies (React, TypeScript, Tailwind, Agora SDK, Axios)
  - Create environment variable configuration for API keys
  - _Requirements: All requirements depend on proper project setup_

- [x] 2. Implement design system and shared UI components




  - [x] 2.1 Create theme configuration with brand colors


    - Define color palette in Tailwind config (#5C0099, #C86BFA, #FDC500, etc.)
    - Set up typography scale and font families (Inter/SF Pro Display)
    - Configure spacing, border radius, and shadow utilities
    - _Requirements: Design system foundation for all UI components_
  
  - [x] 2.2 Build reusable UI components


    - Create Button component with variants (primary, secondary, icon)
    - Create Card component with shadow and radius styles
    - Create Input component with focus states
    - Create IconButton component for toolbar actions
    - Create Tooltip component for hover hints
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Create main layout and routing structure




  - [x] 3.1 Implement classroom layout container


    - Create ClassroomLayout component with grid system
    - Position video module (top-left), presentation panel (right), AI assistant (bottom-left)
    - Implement responsive grid with proper spacing (24-32px padding)
    - Apply dark background (#03071E) to main container
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 3.2 Set up routing and session management


    - Create routes for classroom join/leave
    - Implement session ID validation
    - Create loading and error states for classroom entry
    - _Requirements: 10.1, 10.2_

- [x] 4. Implement video call module with Agora RTC




  - [x] 4.1 Set up Agora RTC SDK integration


    - Initialize Agora client with app ID
    - Create VideoCallService class for SDK lifecycle management
    - Implement token generation API call
    - Handle SDK initialization and cleanup
    - _Requirements: 1.1, 8.1_
  
  - [x] 4.2 Build video stream components


    - Create VideoPlayer component for individual streams
    - Implement local video stream capture and display
    - Implement remote video stream subscription and display
    - Add video container styling (white card, 16px radius, purple border)
    - Display participant names with overlay labels
    - _Requirements: 1.1, 1.2, 1.4, 7.4_
  
  - [x] 4.3 Implement audio/video controls


    - Create mute/unmute audio toggle
    - Create camera on/off toggle
    - Style control buttons (circular, 40px, purple/yellow states)
    - Add hover and active state animations
    - _Requirements: 1.5, 9.2, 9.4_
  
  - [x] 4.4 Add connection quality monitoring


    - Implement network quality detection
    - Display connection status indicator (colored dot)
    - Show quality degradation warnings
    - Implement automatic quality adjustment
    - _Requirements: 1.3, 8.2, 8.3_
  
  - [x] 4.5 Handle reconnection logic


    - Detect disconnection events
    - Display reconnection notification
    - Implement automatic reconnection attempts (max 60 seconds)
    - Handle reconnection success/failure states
    - _Requirements: 8.4, 8.5_

- [x] 5. Build presentation panel with multiple modes




  - [x] 5.1 Create presentation container and mode switcher


    - Build PresentationContainer component
    - Implement mode switcher UI (PDF/Screen/Whiteboard pills)
    - Style active/inactive mode buttons (#FDC500 active, hover #C86BFA)
    - Handle mode switching logic
    - _Requirements: 2.1, 9.2_
  
  - [x] 5.2 Implement PDF viewer functionality


    - Integrate PDF.js library
    - Create PDFViewer component for rendering pages
    - Implement page navigation (previous/next buttons)
    - Add page counter display
    - Style navigation controls (floating circular buttons, 48px)
    - _Requirements: 2.2, 2.4, 2.5_
  
  - [x] 5.3 Implement screen sharing


    - Create ScreenShareDisplay component
    - Use Agora screen sharing API
    - Handle screen share start/stop
    - Display shared screen in presentation panel
    - _Requirements: 2.3_
  
  - [x] 5.4 Add zoom and navigation controls


    - Implement zoom in/out functionality
    - Create floating zoom controls (top-right corner)
    - Add pan functionality for zoomed content
    - Style controls with minimal icon buttons
    - _Requirements: 2.5, 9.4_

- [-] 6. Integrate Agora Interactive Whiteboard


  - [x] 6.1 Set up whiteboard SDK


    - Initialize Agora Whiteboard SDK
    - Create WhiteboardService class for SDK management
    - Implement room creation and joining
    - Handle whiteboard token generation
    - _Requirements: 3.1, 4.1, 4.2_
  
  - [x] 6.2 Build whiteboard canvas component


    - Create WhiteboardCanvas component
    - Integrate SDK canvas into React component
    - Handle canvas mounting and unmounting
    - Implement real-time synchronization
    - _Requirements: 4.2, 4.4_
  
  - [x] 6.3 Create drawing tools palette


    - Build ToolPalette component (floating vertical toolbar)
    - Implement tool selection (pen, highlighter, shapes, eraser, text)
    - Style toolbar with glass-morphism effect
    - Add active tool highlighting (#FDC500 background)
    - _Requirements: 3.2, 4.3, 9.2, 9.4_
  
  - [x] 6.4 Implement color and stroke width selectors


    - Create ColorPicker component with brand colors
    - Add stroke width selector with visual preview
    - Style selected color with purple border
    - _Requirements: 3.2, 4.3_
  
  - [x] 6.5 Add whiteboard action controls



    - Implement undo/redo functionality
    - Create clear all annotations function
    - Add save whiteboard as image feature
    - Style action buttons with appropriate hover states
    - _Requirements: 3.4, 3.5, 4.5_

- [x] 7. Build annotation layer for presentation materials




  - [x] 7.1 Create annotation overlay component


    - Build AnnotationLayer component as canvas overlay
    - Position layer on top of PDF/screen share content
    - Implement pointer event handling
    - _Requirements: 3.1, 3.2_
  
  - [x] 7.2 Implement annotation drawing


    - Capture mouse/touch drawing events
    - Render annotations on canvas
    - Synchronize annotations with Agora Whiteboard SDK
    - Ensure 500ms or less synchronization latency
    - _Requirements: 3.3, 7.4_
  
  - [x] 7.3 Add annotation tools for presentation mode


    - Reuse ToolPalette component for annotations
    - Implement pen, highlighter, shapes, and eraser
    - Handle tool switching in annotation mode
    - _Requirements: 3.2, 3.4_

- [-] 8. Implement AI assistant with Doubao API





  - [x] 8.1 Set up Doubao API integration

    - Create AIService class for API communication
    - Implement authentication with API key
    - Set up request/response handling
    - Handle API rate limiting and errors
    - _Requirements: 5.2, 5.3_
  

  - [x] 8.2 Build AI assistant UI components

    - Create AIAssistantContainer component (white card, bottom-left)
    - Build MessageList component with scrollable chat history
    - Style user messages (right-aligned, purple bubbles)
    - Style AI messages (left-aligned, light gray bubbles)
    - Add header with AI icon and title
    - _Requirements: 5.1, 5.4, 5.5_
  


  - [x] 8.3 Implement chat input and message sending

    - Create MessageInput component with text field
    - Add send button (circular, 40px, yellow background)
    - Handle message submission
    - Display loading state with animated dots
    - _Requirements: 5.3, 5.4_

  
  - [x] 8.4 Add multimodal content support

    - Implement image display in chat messages
    - Add video player for video content
    - Create MediaRenderer component for rich media
    - Style media cards with 8px radius and subtle border
    - _Requirements: 6.1, 6.2, 6.4_
  
  - [x] 8.5 Implement media sharing to presentation


    - Add "Share to Presentation" button on media content
    - Handle transfer of media to presentation panel
    - Update presentation mode when media is shared
    - Style share button (#FDC500 background, small, rounded)
    - _Requirements: 6.3, 6.5_
  
  - [x] 8.6 Add conversation context management



    - Implement message history storage
    - Maintain context across conversation
    - Handle session-based context persistence
    - _Requirements: 5.4_

- [x] 9. Implement state management and data flow




  - [x] 9.1 Create global state context


    - Set up React Context for classroom state
    - Define state interfaces (ClassroomState, VideoState, etc.)
    - Implement state providers
    - _Requirements: All requirements depend on state management_
  
  - [x] 9.2 Build custom hooks for each module



    - Create useVideo hook for video call state
    - Create useWhiteboard hook for whiteboard state
    - Create usePresentation hook for presentation state
    - Create useAI hook for AI assistant state
    - _Requirements: All requirements_
  
  - [x] 9.3 Implement session persistence


    - Store critical state in session storage
    - Implement state recovery on page reload
    - Handle cleanup on session end
    - _Requirements: 10.5_

- [x] 10. Add control toolbar and keyboard shortcuts




  - [x] 10.1 Create floating control toolbar


    - Build Toolbar component (bottom center, floating)
    - Apply glass-morphism styling (translucent white, backdrop blur)
    - Add common action buttons (mute, camera, screen share, etc.)
    - Style with yellow accents for active states
    - _Requirements: 9.1, 9.2_
  
  - [x] 10.2 Implement keyboard shortcuts


    - Add keyboard event listeners
    - Map shortcuts to actions (M for mute, C for camera, etc.)
    - Display keyboard shortcut hints in tooltips
    - _Requirements: 9.3, 9.4_

- [x] 11. Implement authentication and security




  - [x] 11.1 Create authentication flow


    - Build login/authentication component
    - Validate user credentials
    - Generate and store JWT tokens
    - _Requirements: 10.1_
  
  - [x] 11.2 Implement session security


    - Generate unique session identifiers
    - Validate session access before joining
    - Implement token-based authorization for Agora services
    - _Requirements: 10.2, 10.3_
  
  - [x] 11.3 Secure API key management


    - Store API keys in environment variables
    - Create backend endpoints for token generation
    - Never expose keys in frontend code
    - _Requirements: 10.4_
  
  - [x] 11.4 Handle session cleanup


    - Terminate all connections on session end
    - Clear temporary data and tokens
    - Ensure cleanup completes within 30 seconds
    - _Requirements: 10.5_

- [x] 12. Add error handling and user feedback





  - [x] 12.1 Implement error boundaries


    - Create ErrorBoundary component
    - Handle component errors gracefully
    - Display user-friendly error messages
    - _Requirements: All requirements_
  
  - [x] 12.2 Add toast notifications


    - Create Toast component for notifications
    - Implement success, error, warning, and info variants
    - Style with brand colors (yellow for success, red for errors)
    - Add slide-in animation from top-right
    - _Requirements: 8.4, 9.4_
  
  - [x] 12.3 Handle video call errors


    - Detect and display connection failures
    - Show media device permission errors
    - Provide manual reconnect option
    - Display network quality warnings
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [x] 12.4 Handle API errors


    - Catch and display Doubao API errors
    - Show rate limiting warnings
    - Implement retry logic with exponential backoff
    - _Requirements: 5.3_

- [x] 13. Optimize performance and add loading states





  - [x] 13.1 Implement code splitting


    - Split code by routes
    - Lazy load heavy components (PDF viewer, whiteboard)
    - Add loading fallbacks
    - _Requirements: Performance optimization_
  
  - [x] 13.2 Add skeleton loading screens


    - Create skeleton components for each module
    - Use shimmer effect with brand colors
    - Display during initial load and data fetching
    - _Requirements: User experience_
  
  - [x] 13.3 Optimize rendering performance


    - Memoize expensive components with React.memo
    - Implement virtual scrolling for AI chat history
    - Debounce annotation drawing events (16ms)
    - Use CSS transforms for animations
    - _Requirements: Performance optimization_
  
  - [x] 13.4 Optimize network usage


    - Implement request caching
    - Batch annotation updates
    - Use progressive image loading
    - Compress API payloads
    - _Requirements: 8.1, 8.2_

- [x] 14. Add animations and micro-interactions





  - [x] 14.1 Implement page transitions


    - Add fade and scale animations for modals
    - Implement smooth route transitions (300ms)
    - _Requirements: UI/UX enhancement_
  
  - [x] 14.2 Add button and control animations


    - Implement hover effects (200ms ease)
    - Add button press scale animation (0.95x)
    - Create tool selection transitions with color change
    - _Requirements: 9.4_
  
  - [x] 14.3 Add feedback animations


    - Implement success glow effect (#FFEE32)
    - Add error shake animation
    - Create pulse animation for connection indicator
    - Add bounce effect for new AI messages
    - _Requirements: User experience_

- [x] 15. Implement accessibility features





  - [x] 15.1 Add keyboard navigation


    - Ensure proper tab order
    - Add focus indicators (3px #FDC500 outline)
    - Handle keyboard shortcuts
    - _Requirements: 9.3, Accessibility_
  

  - [x] 15.2 Add ARIA labels and screen reader support

    - Add ARIA labels to all interactive elements
    - Implement screen reader announcements for state changes
    - Ensure semantic HTML structure
    - _Requirements: Accessibility_
  

  - [x] 15.3 Support reduced motion and high contrast

    - Detect prefers-reduced-motion setting
    - Disable animations when reduced motion is preferred
    - Ensure high contrast mode compatibility
    - _Requirements: Accessibility_

- [ ] 16. Create backend services for token generation
  - [ ] 16.1 Set up Node.js backend server
    - Initialize Express.js server
    - Configure CORS and security middleware
    - Set up environment variables for API keys
    - _Requirements: 10.4_
  
  - [ ] 16.2 Implement Agora token generation endpoints
    - Create endpoint for RTC token generation
    - Create endpoint for Whiteboard token generation
    - Validate session and user authorization
    - _Requirements: 8.1, 10.2, 10.3_
  
  - [ ] 16.3 Implement session management API
    - Create endpoints for session CRUD operations
    - Store session data in database
    - Implement session validation
    - _Requirements: 10.1, 10.2_

- [ ] 17. Set up development and build configuration
  - [ ] 17.1 Configure Vite build settings
    - Optimize production build
    - Configure environment variables
    - Set up asset optimization
    - _Requirements: Development setup_
  
  - [ ] 17.2 Create development scripts
    - Add npm scripts for dev, build, preview
    - Configure hot module replacement
    - Set up proxy for backend API during development
    - _Requirements: Development setup_

- [ ] 18. Integration and end-to-end testing
  - [ ] 18.1 Test complete user flow
    - Test joining a classroom session
    - Verify video call connection between tutor and tutee
    - Test presentation mode switching (PDF, screen share, whiteboard)
    - Verify annotation synchronization
    - Test AI assistant queries and media sharing
    - _Requirements: All requirements_
  
  - [ ] 18.2 Test error scenarios
    - Test connection failures and reconnection
    - Test media device permission denials
    - Test API failures and rate limiting
    - Verify error messages and recovery flows
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ] 18.3 Test cross-browser compatibility
    - Test on Chrome, Firefox, Safari, Edge
    - Verify video/audio functionality on each browser
    - Test responsive layout on different screen sizes
    - _Requirements: 7.3_

- [ ] 19. Create documentation and deployment guide
  - [ ] 19.1 Write setup documentation
    - Document environment variable configuration
    - Provide API key setup instructions
    - Create developer setup guide
    - _Requirements: Development documentation_
  
  - [ ] 19.2 Create user guide
    - Document classroom features and controls
    - Provide troubleshooting tips
    - Create keyboard shortcut reference
    - _Requirements: User documentation_

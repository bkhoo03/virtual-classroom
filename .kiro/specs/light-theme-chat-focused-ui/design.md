# Design Document

## Overview

This design document outlines the architecture and implementation approach for transforming the virtual classroom application from a dark-themed, video-centric interface to a light-themed, AI chat-focused interface. The redesign emphasizes the multimodal AI capabilities by making the chat interface the primary focus on the left side (40%+ width) and introducing a new AI Output panel on the right side for dynamic, interactive content display.

The design maintains all existing functionality (video calls, whiteboard, PDF viewing, screen sharing) while reorganizing the layout to highlight AI-powered learning experiences for both tutors and students.

## Architecture

### High-Level Component Structure

```
ClassroomLayout (Light Theme)
├── Left Panel (40-50% width) - AI Chat Focus
│   ├── Chat Header (Compact)
│   ├── Message List (Expanded)
│   └── Message Input (Enhanced)
│
└── Right Panel (50-60% width) - AI Output & Content
    ├── Content Tabs (Minimal)
    │   ├── AI Output (Default)
    │   ├── Video Call
    │   ├── Presentation
    │   └── Whiteboard
    ├── AI Output Panel (New)
    │   ├── Dynamic Content Renderer
    │   ├── Interactive Map Support
    │   ├── Chart/Visualization Support
    │   └── Media Embedding
    └── Existing Content Panels
        ├── Video Call Module
        ├── Presentation Panel
        └── Whiteboard
```

### Layout Comparison

**Current Layout:**
- Dark theme with gradient backgrounds
- Left column (400px fixed): Video (top) + Chat (bottom)
- Right column (flex): Presentation panel
- Video and chat compete for vertical space

**New Layout:**
- Light theme with white backgrounds
- Left panel (40-50% width): Full-height AI Chat
- Right panel (50-60% width): Tabbed content area
  - AI Output (new, default tab)
  - Video Call (moved to tab)
  - Presentation
  - Whiteboard
- Chat is the primary focus, always visible

## Components and Interfaces

### 1. Theme System Redesign

#### Color Palette Transformation

**Current (Dark Theme):**
```css
--color-background: #03071e (dark blue-black)
--color-surface: #ffffff (white text)
--color-primary: #5c0099 (purple)
--color-secondary: #c86bfa (light purple)
--color-accent: #fdc500 (yellow)
```

**New (Light Theme):**
```css
--color-background: #ffffff (white)
--color-surface: #f8f9fa (light gray)
--color-surface-elevated: #ffffff (white cards)
--color-text-primary: #1a1a2e (dark blue-black)
--color-text-secondary: #6c757d (gray)
--color-text-tertiary: #adb5bd (light gray)
--color-primary: #5c0099 (purple - kept)
--color-secondary: #c86bfa (light purple - kept)
--color-accent: #fdc500 (yellow - kept)
--color-border: #e9ecef (light border)
--color-border-focus: #c86bfa (purple border on focus)
--color-shadow: rgba(0, 0, 0, 0.08) (subtle shadows)
```

#### CSS Variable Updates

```css
/* index.css updates */
@theme {
  /* Light theme colors */
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-surface-elevated: #ffffff;
  --color-text-primary: #1a1a2e;
  --color-text-secondary: #6c757d;
  --color-text-tertiary: #adb5bd;
  
  /* Accent colors (maintained) */
  --color-primary: #5c0099;
  --color-secondary: #c86bfa;
  --color-accent: #fdc500;
  
  /* Borders and shadows */
  --color-border: #e9ecef;
  --color-border-focus: #c86bfa;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Interactive states */
  --color-hover-bg: #f8f9fa;
  --color-active-bg: #e9ecef;
}

body {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}
```

### 2. ClassroomLayout Component Redesign

#### New Layout Structure

```typescript
interface ClassroomLayoutProps {
  chatPanel: ReactNode;
  aiOutputPanel: ReactNode;
  videoModule: ReactNode;
  presentationPanel: ReactNode;
  whiteboardPanel: ReactNode;
}

interface LayoutState {
  activeRightTab: 'ai-output' | 'video' | 'presentation' | 'whiteboard';
  leftPanelWidth: number; // 40-60% range
  isResizing: boolean;
}
```

#### Layout Implementation

```tsx
export default function ClassroomLayout({
  chatPanel,
  aiOutputPanel,
  videoModule,
  presentationPanel,
  whiteboardPanel,
}: ClassroomLayoutProps) {
  const [activeTab, setActiveTab] = useState<'ai-output' | 'video' | 'presentation' | 'whiteboard'>('ai-output');
  const [leftWidth, setLeftWidth] = useState(45); // percentage
  
  return (
    <div className="min-h-screen bg-white">
      <div className="h-screen flex">
        {/* Left Panel - AI Chat (Resizable) */}
        <div 
          className="flex flex-col border-r border-gray-200"
          style={{ width: `${leftWidth}%` }}
        >
          {/* Compact Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
                <ChatIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">AI Chat</h2>
            </div>
          </div>
          
          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">
            {chatPanel}
          </div>
        </div>
        
        {/* Resize Handle */}
        <div 
          className="w-1 bg-gray-200 hover:bg-purple-400 cursor-col-resize transition-colors"
          onMouseDown={handleResizeStart}
        />
        
        {/* Right Panel - AI Output & Content */}
        <div className="flex-1 flex flex-col">
          {/* Minimal Tab Bar */}
          <div className="h-12 px-4 flex items-center gap-1 border-b border-gray-200 bg-gray-50">
            <TabButton 
              active={activeTab === 'ai-output'}
              onClick={() => setActiveTab('ai-output')}
              icon={<SparklesIcon />}
              label="AI Output"
            />
            <TabButton 
              active={activeTab === 'video'}
              onClick={() => setActiveTab('video')}
              icon={<VideoIcon />}
              label="Video"
            />
            <TabButton 
              active={activeTab === 'presentation'}
              onClick={() => setActiveTab('presentation')}
              icon={<PresentationIcon />}
              label="Presentation"
            />
            <TabButton 
              active={activeTab === 'whiteboard'}
              onClick={() => setActiveTab('whiteboard')}
              icon={<WhiteboardIcon />}
              label="Whiteboard"
            />
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-hidden bg-white">
            {activeTab === 'ai-output' && aiOutputPanel}
            {activeTab === 'video' && videoModule}
            {activeTab === 'presentation' && presentationPanel}
            {activeTab === 'whiteboard' && whiteboardPanel}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. AI Output Panel (New Component)

#### Purpose
Display dynamic, AI-generated content including maps, charts, visualizations, images, and interactive elements. Support real-time synchronization between tutor and students.

#### Interface

```typescript
interface AIOutputPanelProps {
  sessionId: string;
  role: 'tutor' | 'tutee';
}

interface AIOutputContent {
  id: string;
  type: 'map' | 'chart' | 'image' | 'video' | 'iframe' | 'custom';
  data: any;
  metadata: {
    title?: string;
    description?: string;
    timestamp: Date;
    generatedBy: 'ai' | 'tutor';
  };
  interactionState?: {
    zoom?: number;
    pan?: { x: number; y: number };
    selectedElements?: string[];
  };
}

interface AIOutputState {
  content: AIOutputContent | null;
  isLoading: boolean;
  isSynced: boolean; // Whether following tutor's view
  error: string | null;
}
```

#### Implementation

```tsx
export default function AIOutputPanel({ sessionId, role }: AIOutputPanelProps) {
  const [content, setContent] = useState<AIOutputContent | null>(null);
  const [isSynced, setIsSynced] = useState(true);
  const [interactionState, setInteractionState] = useState<any>(null);
  
  // WebSocket connection for real-time sync
  useEffect(() => {
    const ws = new WebSocket(`wss://api.example.com/ai-output/${sessionId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'content-update') {
        setContent(data.content);
      } else if (data.type === 'interaction-update' && isSynced) {
        setInteractionState(data.interactionState);
      }
    };
    
    return () => ws.close();
  }, [sessionId, isSynced]);
  
  // Render content based on type
  const renderContent = () => {
    if (!content) {
      return <EmptyState />;
    }
    
    switch (content.type) {
      case 'map':
        return <MapRenderer data={content.data} interactionState={interactionState} />;
      case 'chart':
        return <ChartRenderer data={content.data} />;
      case 'image':
        return <ImageRenderer src={content.data.url} />;
      case 'video':
        return <VideoRenderer src={content.data.url} />;
      case 'iframe':
        return <IframeRenderer src={content.data.url} />;
      default:
        return <CustomRenderer data={content.data} />;
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {content?.metadata.title || 'AI Output'}
          </h3>
          {content?.metadata.description && (
            <p className="text-xs text-gray-500 mt-0.5">
              {content.metadata.description}
            </p>
          )}
        </div>
        
        {role === 'tutee' && (
          <button
            onClick={() => setIsSynced(!isSynced)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isSynced
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSynced ? '🔗 Synced' : '🔓 Free Explore'}
          </button>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
```

### 4. Enhanced Chat Component

#### Updates for Light Theme

```tsx
// Chat.tsx updates
export default function Chat({ onMediaShare }: ChatProps) {
  // ... existing logic ...
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`rounded-2xl max-w-[75%] shadow-sm ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md border border-gray-200'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                </div>
              )}
              <div className="px-3 py-2">
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
              <div className="px-3 pb-2">
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Input Area */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message or ask AI..."
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 5. Minimal Tab Component

```tsx
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
        active
          ? 'bg-white text-purple-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span className="w-4 h-4">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
```

### 6. Content Renderers for AI Output

#### Map Renderer (Example from reference image)

```tsx
interface MapRendererProps {
  data: {
    center: [number, number];
    zoom: number;
    markers?: Array<{ lat: number; lng: number; label: string }>;
  };
  interactionState?: {
    zoom: number;
    pan: { x: number; y: number };
  };
}

function MapRenderer({ data, interactionState }: MapRendererProps) {
  const mapRef = useRef<any>(null);
  
  // Sync interaction state from tutor
  useEffect(() => {
    if (interactionState && mapRef.current) {
      mapRef.current.setZoom(interactionState.zoom);
      mapRef.current.panTo(interactionState.pan);
    }
  }, [interactionState]);
  
  return (
    <div className="w-full h-full">
      {/* Use Mapbox, Leaflet, or Google Maps */}
      <MapComponent
        ref={mapRef}
        center={data.center}
        zoom={data.zoom}
        markers={data.markers}
        className="w-full h-full"
      />
    </div>
  );
}
```

#### Chart Renderer

```tsx
interface ChartRendererProps {
  data: {
    type: 'bar' | 'line' | 'pie' | 'scatter';
    datasets: any[];
    labels: string[];
  };
}

function ChartRenderer({ data }: ChartRendererProps) {
  return (
    <div className="w-full h-full p-6">
      {/* Use Chart.js, Recharts, or similar */}
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data} />
      </ResponsiveContainer>
    </div>
  );
}
```

## Data Models

### AI Output Content Model

```typescript
interface AIOutputContent {
  id: string;
  sessionId: string;
  type: 'map' | 'chart' | 'image' | 'video' | 'iframe' | 'custom';
  data: Record<string, any>;
  metadata: {
    title?: string;
    description?: string;
    timestamp: Date;
    generatedBy: 'ai' | 'tutor';
    aiModel?: string;
    prompt?: string;
  };
  interactionState?: {
    zoom?: number;
    pan?: { x: number; y: number };
    selectedElements?: string[];
    annotations?: any[];
  };
  permissions: {
    canEdit: boolean;
    canShare: boolean;
    canAnnotate: boolean;
  };
}
```

### Sync State Model

```typescript
interface SyncState {
  sessionId: string;
  contentId: string;
  tutorInteractionState: any;
  syncedUsers: string[]; // User IDs following tutor
  lastUpdate: Date;
}
```

## Error Handling

### Light Theme Error States

```tsx
// Error message component for light theme
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <AlertCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-900">Error</p>
        <p className="text-sm text-red-700 mt-1">{message}</p>
      </div>
    </div>
  );
}

// Empty state for AI Output
function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        <SparklesIcon className="w-10 h-10 text-purple-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No AI Output Yet
      </h3>
      <p className="text-sm text-gray-500 max-w-sm">
        Ask the AI assistant to generate visualizations, maps, or other content to see them here.
      </p>
    </div>
  );
}
```

## Testing Strategy

### Visual Regression Testing
- Capture screenshots of all components in light theme
- Compare against design mockups
- Test color contrast ratios (WCAG AA compliance)
- Verify all interactive states (hover, focus, active)

### Functional Testing
- Test chat functionality in new layout
- Verify AI Output panel content rendering
- Test real-time synchronization between tutor and students
- Verify tab switching and panel resizing
- Test all existing features (video, whiteboard, PDF) in new layout

### Performance Testing
- Measure layout shift during panel resizing
- Test animation performance (60 FPS target)
- Verify WebSocket connection stability for sync
- Test with multiple content types in AI Output panel

### Accessibility Testing
- Keyboard navigation through all components
- Screen reader compatibility
- Color contrast verification
- Focus indicator visibility
- ARIA labels and roles

### Cross-Browser Testing
- Chrome, Firefox, Safari, Edge
- Test on different screen sizes (1280px to 4K)
- Verify responsive behavior of resizable panels

## Migration Strategy

### Phase 1: Theme System Update
1. Update CSS variables in `index.css`
2. Create light theme utility classes
3. Update global styles and animations
4. Test color contrast and accessibility

### Phase 2: Layout Restructure
1. Create new `ClassroomLayout` component
2. Implement resizable panel system
3. Add minimal tab navigation
4. Migrate existing components to new layout

### Phase 3: AI Output Panel
1. Create `AIOutputPanel` component
2. Implement content renderers (map, chart, image, etc.)
3. Add WebSocket sync functionality
4. Test real-time synchronization

### Phase 4: Component Updates
1. Update `Chat` component for light theme
2. Update `VideoCallModule` for tab integration
3. Update `PresentationPanel` styling
4. Update `Whiteboard` styling

### Phase 5: Testing & Polish
1. Visual regression testing
2. Accessibility audit
3. Performance optimization
4. Animation refinement
5. User acceptance testing

## Technical Considerations

### Resizable Panels
- Use CSS `resize` property or custom drag handler
- Persist panel width in localStorage
- Minimum width constraints (30% - 60%)
- Smooth transitions during resize

### Real-Time Synchronization
- WebSocket connection for AI Output sync
- Debounce interaction updates (100ms)
- Conflict resolution for simultaneous edits
- Reconnection handling

### Performance Optimization
- Lazy load content renderers
- Virtual scrolling for long chat histories
- Memoize expensive computations
- Optimize re-renders with React.memo

### Accessibility
- Maintain WCAG AA contrast ratios (4.5:1 for text)
- Keyboard shortcuts for tab switching
- Screen reader announcements for AI responses
- Focus management during layout changes

## Dependencies

### New Dependencies
- `react-map-gl` or `leaflet` - For map rendering
- `recharts` or `chart.js` - For chart rendering
- `react-resizable-panels` - For resizable layout (optional)

### Existing Dependencies (Maintained)
- React, TypeScript
- Tailwind CSS
- WebSocket client
- PDF.js (react-pdf)
- Video call libraries

## Design Decisions & Rationales

### Why Light Theme?
- Modern, professional appearance
- Better readability in well-lit environments
- Aligns with reference image provided
- Reduces eye strain for extended use

### Why Chat-Focused Layout?
- Emphasizes AI multimodal capabilities
- Makes AI assistant more accessible
- Encourages student-AI interaction
- Aligns with product vision

### Why Tabbed Right Panel?
- Maximizes space for AI Output
- Reduces visual clutter
- Allows easy switching between content types
- Maintains access to all features

### Why Real-Time Sync?
- Enables collaborative learning
- Tutor can guide students through content
- Maintains shared context
- Enhances engagement

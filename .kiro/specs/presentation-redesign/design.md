# Design Document

## Overview

This design document outlines the architecture for redesigning the Virtual Classroom presentation page. The redesign focuses on two main objectives: (1) reorganizing the UI to place all action controls in a unified top toolbar, and (2) completely rewriting the annotation system to fix all non-functional tools and implement proper coordinate transformation, tool handling, and state management.

The new design separates concerns between presentation management, PDF rendering, annotation drawing, and tool state management. It introduces a per-page annotation storage system and proper coordinate transformation to handle zoom and pan operations correctly.

## Architecture

### Component Hierarchy

```
PresentationPanel (Container)
├── TopToolbar (NEW)
│   ├── ModeSelector
│   ├── PDFUploadButton
│   ├── PageNavigation
│   ├── ZoomControls
│   └── CurrentFileDisplay
├── PresentationContent
│   ├── PDFViewerWithAnnotations (REWRITTEN)
│   │   ├── ReactPDFDocument
│   │   ├── AnnotationCanvas (NEW)
│   │   └── LaserPointerIndicator (NEW)
│   ├── ScreenShareDisplay
│   └── Whiteboard
└── AnnotationToolbar (REFACTORED)
    ├── ToolButtons
    ├── ColorPicker
    ├── StrokeWidthSelector
    └── ClearButton
```

### Data Flow

1. **Tool Selection Flow**: User clicks tool → AnnotationToolbar updates → Tool state propagates to PDFViewerWithAnnotations → Canvas updates cursor and drawing behavior

2. **Drawing Flow**: User draws → Mouse events captured → Coordinates transformed based on zoom/pan → Canvas renders stroke → Stroke data saved to page storage

3. **Page Navigation Flow**: User changes page → Current annotations saved → New page loaded → Stored annotations restored and rendered

4. **Zoom Flow**: User adjusts zoom → PDF scales → Canvas resizes to match → Coordinate transform updated → Existing annotations remain aligned

## Components and Interfaces

### 1. TopToolbar Component (NEW)

**Purpose**: Unified horizontal toolbar containing all presentation controls

**Props**:
```typescript
interface TopToolbarProps {
  mode: PresentationMode;
  onModeChange: (mode: PresentationMode) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPDFUpload: (file: File) => void;
  currentFileName: string | null;
}
```

**Layout**: Horizontal flexbox with grouped sections:
- Left: Mode selector (PDF/Screen Share/Whiteboard)
- Center: Page navigation (prev/current/next) and zoom controls (+/-/reset)
- Right: PDF upload button and current file display

**Styling**: Fixed at top, semi-transparent background with backdrop blur, shadow for depth

### 2. PDFViewerWithAnnotations Component (REWRITTEN)

**Purpose**: Manages PDF rendering and annotation canvas overlay with proper coordinate transformation

**Props**:
```typescript
interface PDFViewerWithAnnotationsProps {
  fileUrl: string;
  currentPage: number;
  zoom: number;
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  onPageLoad: (pageNumber: number, width: number, height: number) => void;
  onAnnotationsChange: (pageNumber: number, annotations: AnnotationStroke[]) => void;
}
```

**State**:
```typescript
interface PDFViewerState {
  pageWidth: number;
  pageHeight: number;
  panOffset: { x: number; y: number };
  isPanning: boolean;
  laserPointerPosition: { x: number; y: number } | null;
}
```

**Key Methods**:
- `transformCoordinates(clientX, clientY)`: Converts screen coordinates to canvas coordinates accounting for zoom and pan
- `handleMouseDown/Move/Up`: Processes mouse events based on current tool
- `saveCurrentPageAnnotations()`: Persists annotations to storage
- `loadPageAnnotations(pageNumber)`: Retrieves and renders stored annotations

### 3. AnnotationCanvas Component (NEW)

**Purpose**: Dedicated canvas component for drawing annotations with proper tool handling

**Props**:
```typescript
interface AnnotationCanvasProps {
  width: number;
  height: number;
  tool: AnnotationTool;
  color: string;
  strokeWidth: number;
  zoom: number;
  onStrokeComplete: (stroke: AnnotationStroke) => void;
  storedStrokes: AnnotationStroke[];
}
```

**Ref Methods** (exposed via useImperativeHandle):
```typescript
interface AnnotationCanvasRef {
  clearCanvas: () => void;
  redrawStrokes: (strokes: AnnotationStroke[]) => void;
}
```

**Drawing Logic**:
- Pen: Solid strokes with round caps, full opacity
- Highlighter: Wide strokes with 30% opacity
- Eraser: Clear circular area at cursor
- Pointer/Hand: No drawing, pass-through events
- Laser: No drawing, show indicator component

### 4. LaserPointerIndicator Component (NEW)

**Purpose**: Displays animated red dot following cursor when laser pointer tool is active

**Props**:
```typescript
interface LaserPointerIndicatorProps {
  position: { x: number; y: number } | null;
  zoom: number;
}
```

**Rendering**: Absolutely positioned red circle (12px diameter) with glow effect, follows cursor with smooth transition

### 5. AnnotationToolbar Component (REFACTORED)

**Purpose**: Vertical toolbar with drawing tools and settings

**Changes from Current**:
- Add hand/pan tool icon
- Replace pointer emoji with laser pointer icon
- Ensure tool selection properly disables drawing for non-drawing tools
- Add visual feedback for active tool state

**Tools**:
```typescript
type AnnotationTool = 'hand' | 'laser' | 'pen' | 'highlighter' | 'eraser';

const tools = [
  { type: 'hand', icon: '✋', label: 'Hand Tool' },
  { type: 'laser', icon: '🔴', label: 'Laser Pointer' },
  { type: 'pen', icon: '✏️', label: 'Pen' },
  { type: 'highlighter', icon: '🖍️', label: 'Highlighter' },
  { type: 'eraser', icon: '🧽', label: 'Eraser' },
];
```

### 6. AnnotationStorageService (NEW)

**Purpose**: Manages per-page annotation persistence

**Interface**:
```typescript
interface AnnotationStroke {
  tool: 'pen' | 'highlighter' | 'eraser';
  color: string;
  strokeWidth: number;
  points: { x: number; y: number }[];
  timestamp: number;
}

interface AnnotationStorageService {
  savePageAnnotations(
    documentId: string,
    pageNumber: number,
    strokes: AnnotationStroke[]
  ): void;
  
  loadPageAnnotations(
    documentId: string,
    pageNumber: number
  ): AnnotationStroke[];
  
  clearDocumentAnnotations(documentId: string): void;
  
  clearPageAnnotations(documentId: string, pageNumber: number): void;
}
```

**Storage Strategy**: Use sessionStorage for temporary persistence, indexed by `${documentId}_page_${pageNumber}`

## Data Models

### AnnotationStroke

```typescript
interface AnnotationStroke {
  id: string;                    // Unique identifier
  tool: 'pen' | 'highlighter';   // Tool type (eraser doesn't create strokes)
  color: string;                 // Hex color code
  strokeWidth: number;           // Base stroke width
  points: Point[];               // Array of coordinate points
  timestamp: number;             // Creation timestamp
}

interface Point {
  x: number;  // X coordinate relative to canvas
  y: number;  // Y coordinate relative to canvas
}
```

### PresentationState

```typescript
interface PresentationState {
  mode: PresentationMode;
  pdfState: {
    fileUrl: string;
    fileName: string | null;
    currentPage: number;
    totalPages: number;
    zoom: number;
    panOffset: { x: number; y: number };
  };
  annotationState: {
    currentTool: AnnotationTool;
    color: string;
    strokeWidth: number;
    documentId: string;
  };
}
```

## Error Handling

### PDF Upload Errors

1. **File Type Validation**: Check file.type === 'application/pdf', show toast error if invalid
2. **File Size Validation**: Check file.size <= 50MB, show toast error if too large
3. **Load Failure**: Catch PDF.js errors, display error state in viewer with retry option

### Canvas Rendering Errors

1. **Context Creation Failure**: Fallback to displaying PDF without annotations, show warning toast
2. **Coordinate Transform Errors**: Log to console, prevent drawing to avoid misaligned annotations
3. **Storage Quota Exceeded**: Clear oldest annotations, show warning toast

### Tool State Errors

1. **Invalid Tool Selection**: Default to 'hand' tool, log warning
2. **Invalid Color/Stroke Width**: Use default values, log warning

## Testing Strategy

### Unit Tests

1. **Coordinate Transformation**:
   - Test transformCoordinates() with various zoom levels
   - Test pan offset calculations
   - Test boundary conditions (0 zoom, negative offsets)

2. **Annotation Storage**:
   - Test save/load operations
   - Test clear operations
   - Test storage key generation
   - Test handling of missing data

3. **Tool State Management**:
   - Test tool switching
   - Test property updates (color, stroke width)
   - Test tool-specific behavior flags

### Integration Tests

1. **Drawing Flow**:
   - Test pen drawing creates visible strokes
   - Test highlighter creates semi-transparent strokes
   - Test eraser removes strokes
   - Test laser pointer doesn't create strokes

2. **Page Navigation**:
   - Test annotations save on page change
   - Test annotations restore on page return
   - Test annotations clear on new PDF upload

3. **Zoom Operations**:
   - Test canvas resizes with zoom
   - Test existing annotations remain aligned
   - Test new annotations draw at correct positions

### Manual Testing Checklist

- [ ] All tools in toolbar are clickable and show active state
- [ ] Pen draws in selected color and stroke width
- [ ] Highlighter draws semi-transparent marks
- [ ] Eraser removes annotations without affecting PDF
- [ ] Laser pointer shows red dot, doesn't draw
- [ ] Hand tool allows panning when zoomed
- [ ] Clear all removes all annotations
- [ ] Annotations persist across page navigation
- [ ] Annotations stay aligned at all zoom levels
- [ ] Top toolbar controls all work correctly
- [ ] PDF upload validates file type and size
- [ ] Page navigation updates correctly
- [ ] Zoom controls update PDF and canvas

## Performance Considerations

### Canvas Optimization

1. **Stroke Batching**: Collect points during drawing, render in batches to reduce redraws
2. **Redraw Optimization**: Only redraw canvas when necessary (tool change, page change, zoom change)
3. **Point Simplification**: Reduce point density for long strokes to improve rendering performance

### Memory Management

1. **Annotation Limits**: Limit stored strokes per page to prevent memory issues (max 1000 strokes)
2. **Storage Cleanup**: Clear annotations for documents no longer in use
3. **Canvas Cleanup**: Properly dispose of canvas contexts when unmounting

### Lazy Loading

1. **PDF Pages**: Continue using react-pdf's built-in lazy loading
2. **Annotation Restoration**: Load annotations only when page becomes active
3. **Tool Components**: Keep existing lazy loading for heavy components

## Migration Strategy

### Phase 1: Create New Components

1. Create TopToolbar component
2. Create AnnotationCanvas component
3. Create LaserPointerIndicator component
4. Create AnnotationStorageService

### Phase 2: Refactor Existing Components

1. Refactor PDFViewerWithAnnotations (rename from ReactPDFViewer)
2. Update AnnotationToolbar with new tools
3. Update PresentationPanel to use TopToolbar

### Phase 3: Integration and Testing

1. Wire up all components
2. Test each tool individually
3. Test page navigation and persistence
4. Test zoom alignment
5. Fix any issues found

### Phase 4: Cleanup

1. Remove old annotation code
2. Remove unused components
3. Update documentation
4. Final testing pass

## Accessibility Considerations

1. **Keyboard Navigation**: All toolbar buttons accessible via Tab key
2. **ARIA Labels**: Proper labels for all tools and controls
3. **Focus Indicators**: Clear visual focus states
4. **Screen Reader Announcements**: Announce tool changes and page navigation
5. **Color Contrast**: Ensure toolbar and controls meet WCAG AA standards

## Browser Compatibility

- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- Canvas API: Widely supported, no polyfills needed
- PDF.js: Already in use, proven compatibility
- SessionStorage: Widely supported, fallback to in-memory storage if unavailable

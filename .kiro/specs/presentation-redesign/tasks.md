# Implementation Plan

- [x] 1. Create annotation storage service





  - Create AnnotationStorageService class with save/load/clear methods
  - Implement sessionStorage-based persistence indexed by document and page
  - Add methods for savePageAnnotations, loadPageAnnotations, clearDocumentAnnotations, clearPageAnnotations
  - Define AnnotationStroke and Point interfaces
  - _Requirements: 1.9_

- [x] 2. Create laser pointer indicator component





  - Create LaserPointerIndicator component that displays red dot at cursor position
  - Implement smooth position transitions using CSS transforms
  - Add glow effect styling (12px diameter, red with shadow)
  - Handle null position (hide indicator when not active)
  - Position absolutely within PDF viewer container
  - _Requirements: 1.5_

- [x] 3. Create annotation canvas component





  - Create AnnotationCanvas component with width, height, tool, color, strokeWidth props
  - Set up canvas ref and 2D context initialization
  - Implement drawing state management (isDrawing, currentStroke)
  - Create handleMouseDown/Move/Up event handlers
  - Implement tool-specific drawing logic (pen, highlighter, eraser)
  - Add clearCanvas and redrawStrokes methods via useImperativeHandle
  - Implement stroke rendering with proper line caps and opacity
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 4. Create top toolbar component





  - Create TopToolbar component with mode, page, zoom, and upload controls
  - Implement horizontal flexbox layout with three sections (left/center/right)
  - Add mode selector buttons (PDF/Screen Share/Whiteboard)
  - Add page navigation controls (prev/current/next buttons)
  - Add zoom controls (+/-/reset buttons with percentage display)
  - Add PDF upload button with file input
  - Add current filename display
  - Style with semi-transparent background and backdrop blur
  - _Requirements: 1.1, 1.12_

- [x] 5. Rewrite PDF viewer with annotations component





  - Rename ReactPDFViewer to PDFViewerWithAnnotations
  - Add state for pageWidth, pageHeight, panOffset, isPanning, laserPointerPosition
  - Implement transformCoordinates method for zoom/pan coordinate conversion
  - Add mouse event handlers that route to appropriate tool behavior
  - Integrate AnnotationCanvas component as overlay
  - Integrate LaserPointerIndicator component
  - Implement saveCurrentPageAnnotations and loadPageAnnotations methods
  - Connect to AnnotationStorageService for persistence
  - Handle page changes to save/restore annotations
  - Handle zoom changes to resize canvas and maintain alignment
  - _Requirements: 1.8, 1.9_

- [x] 6. Implement hand/pan tool functionality





  - Add hand tool to AnnotationTool type
  - Implement pan logic in PDFViewerWithAnnotations mouse handlers
  - Update cursor style based on tool (grab/grabbing for hand tool)
  - Calculate and apply panOffset during drag operations
  - Disable panning when zoom is at or below 100%
  - Update coordinate transformation to account for pan offset
  - _Requirements: 1.6_

- [x] 7. Update annotation toolbar with new tools





  - Update AnnotationTool type to include 'hand' and 'laser'
  - Replace 'pointer' with 'laser' in tools array
  - Add hand tool with appropriate icon and label
  - Update tool selection logic to handle non-drawing tools
  - Ensure color and stroke width pickers only show for drawing tools
  - Update clear button to call canvas clearCanvas method
  - _Requirements: 1.10, 1.11_

- [x] 8. Integrate components in presentation panel





  - Update PresentationPanel to use TopToolbar component
  - Move all control state (page, zoom, mode) to PresentationPanel
  - Pass control handlers to TopToolbar
  - Update PDF mode rendering to use PDFViewerWithAnnotations
  - Remove old inline controls (page nav, zoom, upload from PDF viewer)
  - Pass tool state from AnnotationToolbar to PDFViewerWithAnnotations
  - Wire up PDF upload handler with file validation
  - _Requirements: 1.1, 1.12_

- [x] 9. Implement file upload validation





  - Add file type validation (must be application/pdf)
  - Add file size validation (max 50MB)
  - Display error toast for invalid file type
  - Display error toast for oversized files
  - Generate document ID when new PDF is uploaded
  - Clear previous document annotations on new upload
  - Update filename display in TopToolbar
  - _Requirements: 1.12_

- [x] 10. Add error handling and fallbacks





  - Add try-catch around canvas context creation
  - Display warning toast if canvas fails to initialize
  - Add error boundary for PDF loading failures
  - Implement retry mechanism for failed PDF loads
  - Handle storage quota exceeded errors
  - Log coordinate transformation errors to console
  - Provide fallback to PDF-only view if annotations fail
  - _Requirements: 1.2, 1.3, 1.4, 1.7_

- [x] 11. Add visual feedback and transitions





  - Implement smooth tool selection transitions (cubic-bezier easing)
  - Add hover states to all toolbar buttons
  - Add active state styling to selected tool
  - Ensure feedback appears within 50ms of user action
  - Add loading states for PDF upload
  - Add success toast for successful PDF upload
  - _Requirements: 1.11_

- [x] 12. Optimize canvas performance





  - Implement stroke point batching during drawing
  - Reduce canvas redraws to only when necessary
  - Add point simplification for long strokes
  - Limit maximum strokes per page to 1000
  - Implement cleanup for old document annotations
  - Profile and optimize redrawStrokes performance
  - _Requirements: 1.2, 1.3, 1.8_

- [x] 13. Add accessibility features










  - Add ARIA labels to all toolbar buttons
  - Ensure keyboard navigation works for all controls
  - Add focus indicators to all interactive elements
  - Implement screen reader announcements for tool changes
  - Announce page navigation changes
  - Ensure color contrast meets WCAG AA standards
  - Test with keyboard-only navigation
  - _Requirements: 1.10, 1.11_

- [x] 14. Write unit tests for core functionality





  - Test AnnotationStorageService save/load/clear operations
  - Test coordinate transformation with various zoom levels
  - Test tool state management and switching
  - Test annotation stroke data structure
  - Test storage key generation
  - Test handling of missing/invalid data
  - _Requirements: 1.2, 1.3, 1.4, 1.8, 1.9_

- [ ] 15. Write integration tests
  - Test complete drawing flow for each tool
  - Test annotation persistence across page navigation
  - Test annotation alignment after zoom changes
  - Test clear all functionality
  - Test PDF upload and validation
  - Test tool switching during active drawing
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

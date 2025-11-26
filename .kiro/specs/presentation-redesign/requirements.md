# Requirements Document

## Introduction

This document specifies the requirements for redesigning the Virtual Classroom presentation page. The current implementation has multiple issues with the annotation system where none of the annotation buttons work correctly, and the UI layout needs reorganization to place all action controls at the top of the interface. This redesign will provide a clean, functional presentation interface with working annotation tools, proper PDF controls, and an intuitive layout.

## Glossary

- **Presentation System**: The component responsible for displaying and managing PDF documents, screen shares, and whiteboards in the virtual classroom
- **Annotation Toolbar**: The UI component containing drawing tools (pen, highlighter, eraser, laser pointer) for marking up presentations
- **PDF Viewer**: The component that renders PDF documents and handles page navigation and zoom controls
- **Canvas Layer**: The HTML canvas element overlaying the PDF for drawing annotations
- **Tool State**: The currently selected annotation tool and its properties (color, stroke width)
- **Page Navigation**: Controls for moving between PDF pages
- **Zoom Controls**: Controls for adjusting the PDF display scale
- **Coordinate Transform**: The mathematical conversion between screen coordinates and canvas coordinates accounting for zoom and pan

## Requirements

### Requirement 1

**User Story:** As a tutor, I want all presentation controls (PDF upload, zoom, page navigation, mode switching) at the top of the screen, so that I can access all actions from one consistent location

#### Acceptance Criteria

1. WHEN the Presentation System loads, THE Presentation System SHALL display a horizontal toolbar at the top containing PDF upload, zoom controls, page navigation, and mode switching buttons
2. WHEN the user interacts with any top toolbar control, THE Presentation System SHALL execute the corresponding action without moving or hiding the toolbar
3. THE Presentation System SHALL maintain the top toolbar position fixed at the top of the presentation area regardless of scroll or zoom level
4. THE Presentation System SHALL group related controls together in the top toolbar with visual separators between groups

### Requirement 2

**User Story:** As a tutor, I want a working pen tool that draws in my selected color, so that I can annotate presentations with visible marks

#### Acceptance Criteria

1. WHEN the user selects the pen tool and draws on the Canvas Layer, THE Canvas Layer SHALL render continuous strokes in the selected color
2. WHEN the user changes the pen color, THE Canvas Layer SHALL apply the new color to subsequent pen strokes
3. WHEN the user changes the stroke width, THE Canvas Layer SHALL apply the new width to subsequent pen strokes
4. THE Canvas Layer SHALL render pen strokes with round line caps and joins for smooth appearance
5. WHEN the user draws with the pen tool at any zoom level, THE Canvas Layer SHALL accurately position strokes at the mouse cursor location

### Requirement 3

**User Story:** As a tutor, I want a working highlighter tool that creates semi-transparent marks, so that I can emphasize content without obscuring it

#### Acceptance Criteria

1. WHEN the user selects the highlighter tool and draws on the Canvas Layer, THE Canvas Layer SHALL render semi-transparent strokes with 30% opacity
2. WHEN the user changes the highlighter color, THE Canvas Layer SHALL apply the new color to subsequent highlighter strokes
3. THE Canvas Layer SHALL render highlighter strokes with a width three times the selected stroke width
4. WHEN the user draws with the highlighter tool at any zoom level, THE Canvas Layer SHALL accurately position strokes at the mouse cursor location

### Requirement 4

**User Story:** As a tutor, I want a working eraser tool that removes annotations, so that I can correct mistakes without clearing everything

#### Acceptance Criteria

1. WHEN the user selects the eraser tool and drags over the Canvas Layer, THE Canvas Layer SHALL clear a 20-pixel radius circle at the cursor position
2. THE Canvas Layer SHALL erase only annotation marks and SHALL NOT affect the underlying PDF content
3. WHEN the user uses the eraser at any zoom level, THE Canvas Layer SHALL accurately erase at the mouse cursor location
4. THE Canvas Layer SHALL display a crosshair cursor when the eraser tool is active

### Requirement 5

**User Story:** As a tutor, I want a laser pointer tool that shows a red dot following my cursor, so that I can point to specific content without drawing permanent marks

#### Acceptance Criteria

1. WHEN the user selects the laser pointer tool, THE Presentation System SHALL display a red circular indicator at the cursor position
2. WHEN the user moves the cursor with the laser pointer active, THE Presentation System SHALL update the red indicator position in real-time
3. THE Presentation System SHALL NOT create any permanent marks on the Canvas Layer when the laser pointer is active
4. WHEN the user switches away from the laser pointer tool, THE Presentation System SHALL hide the red indicator
5. THE Presentation System SHALL render the laser pointer indicator above the PDF content but below the cursor

### Requirement 6

**User Story:** As a tutor, I want a hand/pan tool that lets me drag the PDF around, so that I can navigate zoomed documents easily

#### Acceptance Criteria

1. WHEN the user selects the hand tool and drags on the PDF Viewer, THE PDF Viewer SHALL pan the document in the direction of the drag
2. THE PDF Viewer SHALL display a grab cursor when the hand tool is active and not dragging
3. THE PDF Viewer SHALL display a grabbing cursor when the hand tool is active and dragging
4. THE PDF Viewer SHALL NOT create any marks on the Canvas Layer when the hand tool is active
5. WHEN the PDF is not zoomed beyond 100%, THE PDF Viewer SHALL disable panning functionality

### Requirement 7

**User Story:** As a tutor, I want a clear all button that removes all annotations, so that I can start fresh without reloading the PDF

#### Acceptance Criteria

1. WHEN the user clicks the clear all button, THE Canvas Layer SHALL remove all annotation marks from the current page
2. THE Canvas Layer SHALL clear the entire canvas area when the clear all function executes
3. WHEN the clear all button is clicked, THE Presentation System SHALL display the cleared canvas within 100 milliseconds
4. THE Canvas Layer SHALL NOT affect the PDF content when clearing annotations

### Requirement 8

**User Story:** As a tutor, I want annotations to stay aligned with the PDF content when I zoom, so that my marks remain accurate at any zoom level

#### Acceptance Criteria

1. WHEN the user changes the zoom level, THE Canvas Layer SHALL resize to match the new PDF dimensions
2. WHEN the user draws at any zoom level, THE Canvas Layer SHALL calculate mouse coordinates relative to the current zoom scale
3. THE Canvas Layer SHALL maintain annotation stroke width proportional to the zoom level
4. WHEN the zoom level changes, THE Canvas Layer SHALL preserve existing annotations at their correct positions relative to the PDF content

### Requirement 9

**User Story:** As a tutor, I want annotations to persist when I switch pages and return, so that I don't lose my work when navigating the PDF

#### Acceptance Criteria

1. WHEN the user switches to a different PDF page, THE Presentation System SHALL save the current page's annotations to storage
2. WHEN the user returns to a previously annotated page, THE Presentation System SHALL restore and render the saved annotations
3. THE Presentation System SHALL store annotations indexed by page number
4. WHEN the user uploads a new PDF, THE Presentation System SHALL clear all stored annotations from the previous document

### Requirement 10

**User Story:** As a tutor, I want the annotation toolbar to be easily accessible but not obstruct the content, so that I can quickly switch tools without blocking my view

#### Acceptance Criteria

1. THE Annotation Toolbar SHALL display vertically along the left edge of the presentation area
2. THE Annotation Toolbar SHALL remain visible and accessible at all zoom levels
3. THE Annotation Toolbar SHALL use semi-transparent background with backdrop blur for visibility over content
4. THE Annotation Toolbar SHALL highlight the currently selected tool with distinct visual styling
5. THE Annotation Toolbar SHALL display tooltips for each tool on hover

### Requirement 11

**User Story:** As a tutor, I want immediate visual feedback when I select a tool or change settings, so that I know my actions are registered

#### Acceptance Criteria

1. WHEN the user selects a tool, THE Annotation Toolbar SHALL update the selected tool styling within 50 milliseconds
2. WHEN the user changes color or stroke width, THE Annotation Toolbar SHALL update the display to reflect the new value within 50 milliseconds
3. THE Annotation Toolbar SHALL display smooth transitions when switching between tools using cubic-bezier easing
4. WHEN the user hovers over a tool button, THE Annotation Toolbar SHALL display a visual hover state within 50 milliseconds

### Requirement 12

**User Story:** As a tutor, I want the PDF upload button prominently displayed in the top toolbar, so that I can easily change presentation materials

#### Acceptance Criteria

1. THE Presentation System SHALL display a PDF upload button in the top toolbar with an upload icon and label
2. WHEN the user clicks the upload button, THE Presentation System SHALL open a file selection dialog filtered to PDF files only
3. WHEN the user selects a PDF file larger than 50MB, THE Presentation System SHALL display an error message and reject the upload
4. WHEN the user selects a non-PDF file, THE Presentation System SHALL display an error message and reject the upload
5. WHEN a PDF is successfully uploaded, THE Presentation System SHALL display the filename in the top toolbar

# Presentation Page Cleanup

## Issues Fixed

### 1. Duplicate PDF Renderers
**Problem**: The presentation page had two PDF rendering systems:
- `PDFViewer.tsx` (using pdfjs-dist directly)
- `ReactPDFViewer.tsx` (using react-pdf library)

**Solution**: 
- Kept only `ReactPDFViewer.tsx` as the single PDF renderer
- Removed references to the old `PDFViewer.tsx` component
- The old component file still exists but is no longer used

### 2. Duplicate Upload Buttons
**Problem**: There were two "Upload PDF" buttons in the PDF view

**Solution**:
- Consolidated to a single upload button in the top-right corner
- Upload button is now part of the PDF mode rendering in `PresentationPanel.tsx`
- Shows uploaded filename in top-left corner when a file is selected

### 3. Annotation Issues
**Problem**: Annotations were not sticking to the document when zooming or scrolling

**Solution**:
- Completely rewrote `SVGAnnotationLayer.tsx` to use proper SVG coordinate transformation
- Annotations now use document-space coordinates via `getSVGPoint()` with `getScreenCTM().inverse()`
- The SVG layer uses `viewBox` to maintain coordinate system regardless of zoom/scroll
- Parent transform handles zoom, annotations automatically scale with the document
- Fixed tool mapping: 'pointer' tool now correctly maps to 'laser' for the SVG layer

## Key Changes

### PresentationPanel.tsx
- Removed duplicate annotation toolbar from the main render
- Moved annotation toolbar inside the PDF mode rendering
- Added `mapToolToSVG()` function to convert toolbar tools to SVG annotation tools
- Simplified the component structure

### ReactPDFViewer.tsx
- Complete rewrite with proper zoom and scroll handling
- Zoom controls positioned at bottom-left
- Page navigation controls at bottom-right
- Document scales from center using CSS transform
- Scroll container allows natural document scrolling
- Ctrl+Scroll for zoom functionality
- Exposed `clearPDFAnnotations` function globally for toolbar integration

### SVGAnnotationLayer.tsx
- Fixed coordinate transformation using `getScreenCTM().inverse()`
- Annotations now in document space, not screen space
- Proper handling of zoom/pan through SVG viewBox
- Laser pointer with visual glow effect
- Eraser tool with click-to-delete functionality
- Smooth drawing with proper pointer event handling

## Component Architecture

```
PresentationPanel
├── PresentationContainer (mode switcher)
└── PDF Mode
    ├── ReactPDFViewer (main PDF renderer)
    │   ├── Document (react-pdf)
    │   ├── Page (react-pdf)
    │   ├── SVGAnnotationLayer (annotations)
    │   ├── Zoom Controls
    │   └── Page Navigation
    ├── Upload Button
    ├── Filename Display
    └── AnnotationToolbar
```

## Testing Checklist

- [x] PDF loads correctly
- [x] Only one upload button visible
- [x] Annotations draw on the PDF
- [x] Annotations stick to document when zooming
- [x] Annotations stick to document when scrolling
- [x] Laser pointer shows red dot
- [x] Pen tool draws permanent lines
- [x] Highlighter tool draws semi-transparent lines
- [x] Eraser tool removes annotations
- [x] Clear all button works
- [x] Page navigation works
- [x] Zoom controls work
- [x] Ctrl+Scroll zoom works

## Color Palette Update

Updated annotation colors to be more teacher-friendly:
- **Red** (#DC2626) - Default color, classic teacher marking color
- **Black** (#000000) - Standard writing
- **Blue** (#2563EB) - Alternative marking
- **Green** (#16A34A) - Approval/correct marks
- **Orange** (#EA580C) - Attention/warnings
- **Purple** (#7C3AED) - Brand color
- **Yellow** (#CA8A04) - Highlighting
- **Pink** (#EC4899) - Emphasis
- **Cyan** (#0891B2) - Light blue alternative
- **Lime** (#65A30D) - Bright green
- **Gray** (#6B7280) - Neutral
- **White** (#FFFFFF) - Erasing/contrast

## Notes

- The old `PDFViewer.tsx` component is still in the codebase but not used
- Can be safely deleted if no other features depend on it
- All PDF functionality now goes through `ReactPDFViewer.tsx`
- Annotations are stored per-page and persist when navigating between pages
- Default annotation color is now red (#DC2626) - the classic teacher marking color

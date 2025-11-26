# Complete React-PDF Implementation Guide

## Overview
This guide provides step-by-step instructions to replace the current PDF viewer with react-pdf and SVG-based annotations.

## Prerequisites
✅ `react-pdf` already installed
✅ `pdfjs-dist` already installed (dependency)

## Architecture

### Current System Issues
- Complex coordinate transforms
- Annotations don't stick when zooming
- Canvas-based rendering with transform bugs

### New System Benefits
- SVG annotations scale automatically with PDF
- No coordinate transform math needed
- Annotations naturally stick to PDF
- Simpler, more maintainable code

## Implementation Steps

### Step 1: Configure PDF.js Worker

Create `src/utils/pdfWorker.ts`:
```typescript
import { pdfjs } from 'react-pdf';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default pdfjs;
```

### Step 2: Create SVG Annotation Types

Create `src/types/svg-annotations.types.ts`:
```typescript
export interface SVGPoint {
  x: number;
  y: number;
}

export interface SVGStroke {
  id: string;
  points: SVGPoint[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter';
  opacity?: number;
}

export interface PageAnnotations {
  [pageNumber: number]: SVGStroke[];
}
```

### Step 3: Create React-PDF Viewer Component

Create `src/components/ReactPDFViewer.tsx`:
```typescript
import { useState, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '../utils/pdfWorker';
import SVGAnnotationLayer from './SVGAnnotationLayer';
import ZoomControls from './ZoomControls';
import type { AnnotationTool } from './AnnotationToolbar';

interface ReactPDFViewerProps {
  url: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  currentTool?: AnnotationTool;
  currentColor?: string;
  strokeWidth?: number;
  onClearAnnotations?: () => void;
}

export default function ReactPDFViewer({
  url,
  currentPage,
  onPageChange,
  zoom = 1,
  onZoomChange,
  currentTool = 'pointer',
  currentColor = '#5C0099',
  strokeWidth = 2,
  onClearAnnotations,
}: ReactPDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageWidth(viewport.width);
    setPageHeight(viewport.height);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < numPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom + 0.25);
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.5, zoom - 0.25);
    onZoomChange?.(newZoom);
  };

  const handleResetZoom = () => {
    onZoomChange?.(1);
  };

  return (
    <div className="h-full flex flex-col relative bg-[#0f0f1e]">
      {/* Zoom Controls */}
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        minZoom={0.5}
        maxZoom={3}
      />

      {/* PDF Document */}
      <div className="flex-1 overflow-auto flex items-center justify-center">
        <div className="relative">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5C0099] border-t-[#FDC500]" />
              </div>
            }
            error={
              <div className="text-red-400 p-8">
                Failed to load PDF
              </div>
            }
          >
            <div className="relative">
              <Page
                pageNumber={currentPage}
                scale={zoom}
                onLoadSuccess={onPageLoadSuccess}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
              
              {/* SVG Annotation Layer */}
              <SVGAnnotationLayer
                pageNumber={currentPage}
                width={pageWidth * zoom}
                height={pageHeight * zoom}
                scale={zoom}
                currentTool={currentTool}
                currentColor={currentColor}
                strokeWidth={strokeWidth}
                onClear={onClearAnnotations}
              />
            </div>
          </Document>
        </div>
      </div>

      {/* Page Navigation */}
      {numPages > 0 && (
        <div className="absolute bottom-4 right-16 z-50 flex items-center gap-2 bg-[#03071E]/80 backdrop-blur-md px-2 py-2 rounded-full border border-white/10 shadow-xl">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 p-0 ${
              currentPage === 1
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-[#5C0099] text-white hover:bg-[#C86BFA] shadow-md hover:scale-110'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-sm font-medium text-white px-3">
            {currentPage} / {numPages}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === numPages}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 p-0 ${
              currentPage === numPages
                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                : 'bg-[#5C0099] text-white hover:bg-[#C86BFA] shadow-md hover:scale-110'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
```

### Step 4: Create SVG Annotation Layer

Create `src/components/SVGAnnotationLayer.tsx`:
```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import type { AnnotationTool } from './AnnotationToolbar';
import type { SVGPoint, SVGStroke, PageAnnotations } from '../types/svg-annotations.types';

interface SVGAnnotationLayerProps {
  pageNumber: number;
  width: number;
  height: number;
  scale: number;
  currentTool: AnnotationTool;
  currentColor: string;
  strokeWidth: number;
  onClear?: () => void;
}

// Store annotations per page
const pageAnnotations: PageAnnotations = {};

export default function SVGAnnotationLayer({
  pageNumber,
  width,
  height,
  scale,
  currentTool,
  currentColor,
  strokeWidth,
  onClear,
}: SVGAnnotationLayerProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<SVGPoint[]>([]);
  const [strokes, setStrokes] = useState<SVGStroke[]>([]);
  const [laserPosition, setLaserPosition] = useState<SVGPoint | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Load annotations for current page
  useEffect(() => {
    setStrokes(pageAnnotations[pageNumber] || []);
  }, [pageNumber]);

  // Save annotations when they change
  useEffect(() => {
    pageAnnotations[pageNumber] = strokes;
  }, [strokes, pageNumber]);

  // Clear all annotations
  useEffect(() => {
    if (onClear) {
      (window as any).clearSVGAnnotations = () => {
        setStrokes([]);
        pageAnnotations[pageNumber] = [];
      };
    }
  }, [onClear, pageNumber]);

  // Convert SVG points to path string
  const pointsToPath = (points: SVGPoint[]): string => {
    if (points.length === 0) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (currentTool === 'pointer') return;

      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const point: SVGPoint = {
        x: ((e.clientX - rect.left) / rect.width) * width,
        y: ((e.clientY - rect.top) / rect.height) * height,
      };

      if (currentTool === 'eraser') {
        // Remove strokes near click point
        const eraserRadius = strokeWidth * 5;
        setStrokes((prev) =>
          prev.filter((stroke) => {
            return !stroke.points.some((p) => {
              const dist = Math.sqrt(
                Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)
              );
              return dist < eraserRadius;
            });
          })
        );
      } else {
        setIsDrawing(true);
        setCurrentStroke([point]);
      }
    },
    [currentTool, strokeWidth, width, height]
  );

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const point: SVGPoint = {
        x: ((e.clientX - rect.left) / rect.width) * width,
        y: ((e.clientY - rect.top) / rect.height) * height,
      };

      // Laser pointer
      if (currentTool === 'pointer') {
        setLaserPosition(point);
        return;
      }

      // Eraser while dragging
      if (currentTool === 'eraser' && e.buttons === 1) {
        const eraserRadius = strokeWidth * 5;
        setStrokes((prev) =>
          prev.filter((stroke) => {
            return !stroke.points.some((p) => {
              const dist = Math.sqrt(
                Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2)
              );
              return dist < eraserRadius;
            });
          })
        );
        return;
      }

      // Drawing
      if (isDrawing) {
        setCurrentStroke((prev) => [...prev, point]);
      }
    },
    [currentTool, isDrawing, strokeWidth, width, height]
  );

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentStroke.length > 1) {
      const newStroke: SVGStroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        points: currentStroke,
        color: currentColor,
        width: currentTool === 'highlighter' ? strokeWidth * 3 : strokeWidth,
        tool: currentTool as 'pen' | 'highlighter',
        opacity: currentTool === 'highlighter' ? 0.3 : 1,
      };

      setStrokes((prev) => [...prev, newStroke]);
    }

    setIsDrawing(false);
    setCurrentStroke([]);
  }, [isDrawing, currentStroke, currentColor, strokeWidth, currentTool]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setLaserPosition(null);
    if (isDrawing) {
      handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0"
      style={{
        width: '100%',
        height: '100%',
        cursor: currentTool === 'pointer' ? 'none' : currentTool === 'eraser' ? 'grab' : 'crosshair',
        pointerEvents: currentTool === 'pointer' ? 'auto' : 'auto',
        zIndex: 15,
      }}
      viewBox={`0 0 ${width} ${height}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Render saved strokes */}
      {strokes.map((stroke) => (
        <path
          key={stroke.id}
          d={pointsToPath(stroke.points)}
          stroke={stroke.color}
          strokeWidth={stroke.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={stroke.opacity || 1}
        />
      ))}

      {/* Render current stroke being drawn */}
      {isDrawing && currentStroke.length > 0 && (
        <path
          d={pointsToPath(currentStroke)}
          stroke={currentColor}
          strokeWidth={currentTool === 'highlighter' ? strokeWidth * 3 : strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={currentTool === 'highlighter' ? 0.3 : 1}
        />
      )}

      {/* Laser pointer dot */}
      {currentTool === 'pointer' && laserPosition && (
        <g>
          {/* Outer glow */}
          <circle
            cx={laserPosition.x}
            cy={laserPosition.y}
            r={8}
            fill="red"
            opacity={0.3}
            filter="blur(4px)"
          />
          {/* Inner dot */}
          <circle
            cx={laserPosition.x}
            cy={laserPosition.y}
            r={3}
            fill="red"
            opacity={1}
          />
        </g>
      )}
    </svg>
  );
}
```

### Step 5: Update PresentationPanel

In `src/components/PresentationPanel.tsx`, replace PDFViewer import:
```typescript
// Old
import PDFViewer from './PDFViewer';

// New
import ReactPDFViewer from './ReactPDFViewer';
```

Then update the component usage:
```typescript
<ReactPDFViewer
  url={pdfUrl}
  currentPage={currentPage}
  onPageChange={handlePageChange}
  zoom={zoom}
  onZoomChange={handleZoomChange}
  currentTool={currentTool}
  currentColor={currentColor}
  strokeWidth={strokeWidth}
  onClearAnnotations={() => {
    if (typeof window !== 'undefined' && (window as any).clearSVGAnnotations) {
      (window as any).clearSVGAnnotations();
    }
  }}
/>
```

### Step 6: Add CSS for react-pdf

In `src/index.css`, add:
```css
/* React-PDF styles */
.react-pdf__Page {
  position: relative;
}

.react-pdf__Page__canvas {
  display: block;
  user-select: none;
}
```

### Step 7: Testing Checklist

- [ ] PDF loads correctly
- [ ] Page navigation works
- [ ] Zoom in/out works
- [ ] Laser pointer shows red dot
- [ ] Pen draws solid lines
- [ ] Highlighter draws transparent lines
- [ ] Eraser removes strokes
- [ ] Colors apply correctly
- [ ] Clear all works
- [ ] Annotations stick when zooming
- [ ] Annotations persist per page
- [ ] Scroll works in all modes

### Step 8: Cleanup

Once everything works:
1. Remove old `PDFViewer.tsx`
2. Remove `PDFAnnotationLayer.tsx`
3. Remove `PanZoomContainer.tsx` (if not used elsewhere)
4. Update imports throughout codebase

## Key Advantages of This Approach

1. **SVG coordinates = PDF coordinates** - No transform math
2. **Automatic scaling** - SVG viewBox handles zoom
3. **Simpler code** - ~500 lines vs ~800 lines
4. **More reliable** - Battle-tested react-pdf library
5. **Better performance** - Optimized rendering
6. **Easier to maintain** - Standard React patterns

## Troubleshooting

### PDF doesn't load
- Check worker configuration in `pdfWorker.ts`
- Verify PDF URL is accessible
- Check browser console for errors

### Annotations don't appear
- Verify SVG viewBox matches page dimensions
- Check z-index of SVG layer
- Ensure pointer-events is set correctly

### Coordinates are off
- SVG viewBox should match page width/height
- Mouse coordinates should be normalized to viewBox
- No additional transforms needed

## Estimated Implementation Time

- Step 1-2: 30 minutes (setup)
- Step 3: 1 hour (PDF viewer)
- Step 4: 2 hours (SVG annotations)
- Step 5-6: 30 minutes (integration)
- Step 7: 1 hour (testing)
- Step 8: 30 minutes (cleanup)

**Total: ~5-6 hours**

## Support

If you encounter issues:
1. Check react-pdf documentation: https://github.com/wojtekmaj/react-pdf
2. Verify SVG coordinate system
3. Test with simple shapes first
4. Use browser DevTools to inspect SVG elements

## Conclusion

This implementation is significantly simpler and more reliable than the current canvas-based approach. The SVG coordinate system naturally matches the PDF coordinate system, eliminating all the complex transform math that was causing bugs.

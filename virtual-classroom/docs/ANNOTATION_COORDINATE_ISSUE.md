# Annotation Coordinate System Issue

## Current Problem

Annotations don't stick to the PDF when zooming/panning. The position shifts.

## Root Cause

The coordinate transformation is complex:
1. Mouse coordinates are in screen space
2. Canvas has CSS transform applied: `scale(zoom) translate(panOffset)`
3. Stored coordinates need to be in PDF space (untransformed)
4. When redrawing, coordinates are drawn on transformed canvas

## Current Implementation Issues

1. **screenToCanvas calculation**: Converting from screen to canvas space
2. **Storage**: Points stored in canvas coordinates
3. **Rendering**: Canvas is transformed, so stored points get double-transformed

## The Fix

Annotations should be stored in **PDF coordinate space** (0,0 to width,height regardless of zoom/pan).

### Correct Flow:
1. **Capture**: Screen → PDF coordinates (remove transform)
2. **Store**: PDF coordinates
3. **Render**: Draw on transformed canvas (transform applied automatically)

### Current screenToCanvas:
```typescript
const x = (screenX - rect.left) / zoom - panOffset.x / zoom;
const y = (screenY - rect.top) / zoom - panOffset.y / zoom;
```

This should give PDF coordinates, which is correct.

## Alternative: Use Existing PDF Library

### Option 1: react-pdf with annotations
- Library: `react-pdf` + `pdfjs-dist`
- Built-in annotation support
- Handles coordinate transforms automatically
- More reliable and tested

### Option 2: PDF.js with annotation layer
- Use PDF.js annotation layer API
- Professional-grade solution
- Used by Firefox PDF viewer

### Option 3: Commercial solution
- PSPDFKit
- PDF.js Express
- Fully featured with annotations

## Recommendation

For a production app, using `react-pdf` or PDF.js annotation layer would be much more reliable than custom implementation. The coordinate transformation math is complex and error-prone.

### Quick Fix (Current Implementation)
The current code should work if:
1. Annotations are stored in PDF space ✓ (seems correct)
2. Canvas transform matches PDF transform ✓ (seems correct)
3. No double transformation occurs

The issue might be in how we're calculating the initial coordinates or how the transform is applied.

### Test
Draw at zoom 100%, then zoom to 200%. If annotation moves, the coordinate system is wrong.

## Next Steps

1. **Quick fix**: Debug coordinate calculation
2. **Better solution**: Switch to react-pdf with annotation support
3. **Best solution**: Use professional PDF library with built-in annotations

Would you like me to:
A) Debug and fix the current implementation
B) Integrate react-pdf with proper annotation support
C) Recommend a professional PDF solution

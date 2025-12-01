# Annotation System Issues to Fix

## Issues Identified

### 1. **Hand/Pointer Tool Not Working**
- Current: "pointer" tool exists but doesn't do anything
- Need: Add a hand/drag tool that allows panning the PDF
- Solution: Integrate pointer tool with PanZoomContainer panning functionality

### 2. **Laser Pointer Feature Missing**
- Current: Pointer shows finger emoji
- Need: Replace with laser pointer that shows red dot when moving
- Solution: Create a cursor follower component that shows a red dot

### 3. **All Tools Drawing as Pen**
- Issue: AnnotationLayer only checks for 'pen', 'highlighter', 'eraser'
- The 'pointer' tool type is not handled, causing it to draw
- Solution: Add proper tool type checking in AnnotationLayer

### 4. **Colors Not Applying**
- Issue: Color changes in toolbar but doesn't affect drawing
- Cause: AnnotationLayer receives currentColor but context may not update properly
- Solution: Force context update when color changes

### 5. **Clear All Not Working**
- Issue: clearAnnotations() calls annotationService.clearAnnotations() but canvas ref not properly connected
- Solution: Pass canvas ref directly to AnnotationLayer and expose clear method

### 6. **Zoom Misalignment**
- Issue: When zoomed, annotations don't align with mouse position
- Cause: Canvas coordinates don't account for zoom transform
- Solution: Calculate mouse position relative to zoom and pan offset

### 7. **Annotations Don't Persist Across Pages**
- Issue: Annotations cleared when switching pages
- Need: Store annotations per page and restore when returning
- Solution: Create page-based annotation storage system

## Recommended Fixes

### Priority 1: Critical Functionality
1. Fix tool selection (pointer vs drawing tools)
2. Fix color application
3. Fix clear all function
4. Fix zoom alignment

### Priority 2: Enhanced Features
5. Add laser pointer with red dot
6. Add hand/drag tool
7. Implement per-page annotation persistence

### Priority 3: Polish
8. Smooth transitions
9. Better visual feedback
10. Performance optimization

## Implementation Notes

The annotation system needs significant refactoring:
- Separate pointer/laser tool from drawing tools
- Create per-page annotation storage
- Fix coordinate transformation for zoom
- Properly connect canvas refs and clear functions
- Add laser pointer cursor component

This is a complex task that would require rewriting significant portions of the annotation system.

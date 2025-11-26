# Smooth Animations and Transitions Implementation

This document describes the smooth animations and transitions implemented for the light-theme chat-focused UI redesign.

## Overview

All animations are designed to run at 60 FPS with proper GPU acceleration and respect user preferences for reduced motion.

## Implementation Details

### 1. Tab Switching Animations (300ms)

**Location:** `ClassroomLayout.tsx`

- **Duration:** 300ms
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1) - smooth ease-in-out
- **Properties:** opacity
- **Implementation:** Fade transitions between AI Output, Presentation, and Whiteboard tabs

```typescript
// Content panels fade in/out with 300ms transition
style={{
  transitionDuration: '300ms',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
}}
```

### 2. Panel Resizing Animations

**Location:** `ClassroomLayout.tsx`

- **Duration:** 300ms (when not actively resizing)
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)
- **Properties:** width
- **Constraints:** 30% - 60% width range
- **Features:**
  - Smooth transition when releasing resize handle
  - No transition during active drag (for immediate feedback)
  - Persists to localStorage

```typescript
style={{ 
  width: `${leftPanelWidth}%`,
  transitionProperty: isResizing ? 'none' : 'width',
  transitionDuration: '300ms',
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
}}
```

### 3. Tab Button Animations

**Location:** `TabButton.tsx`

- **Duration:** 300ms
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)
- **Properties:** background-color, color, box-shadow, transform
- **Features:**
  - Active tab scales to 100%
  - Inactive tabs scale to 105% on hover
  - Icon scales to 110% when tab is active
  - Smooth color and shadow transitions

### 4. Content Loading Fade Transitions

**Location:** All content renderers

- **Duration:** 300ms
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1)
- **Properties:** opacity
- **Renderers Updated:**
  - `MapRenderer.tsx` - Fades in map content
  - `ChartRenderer.tsx` - Fades in chart visualizations
  - `ImageRenderer.tsx` - Fades in images with loading state
  - `VideoRenderer.tsx` - Fades in video player
  - `IframeRenderer.tsx` - Fades in embedded content

### 5. AI Output Skeleton Loading States

**Location:** `skeletons/AIOutputSkeleton.tsx`

- **Features:**
  - Shimmer animation for loading placeholders
  - Gradient backgrounds with brand colors (purple, yellow)
  - Pulse animations for interactive elements
  - Smooth fade-in when skeleton appears

**Shimmer Animation:**
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### 6. Performance Optimizations for 60 FPS

**Location:** `index.css`

#### GPU Acceleration
```css
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

#### Will-Change Optimization
```css
.will-animate {
  will-change: transform, opacity;
}
```

#### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## CSS Animation Utilities

### New Keyframe Animations

1. **fade-in** - Smooth opacity fade with GPU acceleration
2. **fade-out** - Smooth opacity fade out
3. **slide-up** - Slide up with fade (20px travel)
4. **slide-down** - Slide down with fade (20px travel)

### Utility Classes

- `.animate-fade-in` - 300ms fade in
- `.animate-fade-out` - 300ms fade out
- `.animate-slide-up` - 300ms slide up
- `.animate-slide-down` - 300ms slide down
- `.transition-300` - Generic 300ms transition
- `.transition-panel-resize` - Optimized for panel width changes
- `.transition-tab-switch` - Optimized for tab opacity changes
- `.transition-content-fade` - Optimized for content opacity and transform

### Custom Easing Functions

```css
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--ease-smooth-in: cubic-bezier(0.4, 0, 1, 1);
--ease-smooth-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6);
```

## Components Updated

### Core Layout
- ✅ `ClassroomLayout.tsx` - Tab switching and panel resizing
- ✅ `TabButton.tsx` - Interactive button animations

### AI Output Panel
- ✅ `AIOutputPanel.tsx` - Content fade transitions
- ✅ `skeletons/AIOutputSkeleton.tsx` - Loading skeleton (NEW)

### Content Renderers
- ✅ `MapRenderer.tsx` - Fade-in animation
- ✅ `ChartRenderer.tsx` - Fade-in animation
- ✅ `ImageRenderer.tsx` - Fade-in with loading state
- ✅ `VideoRenderer.tsx` - Fade-in with play button hover
- ✅ `IframeRenderer.tsx` - Fade-in with loading state

### Styles
- ✅ `index.css` - Animation utilities and performance optimizations

## Performance Characteristics

### Target Metrics
- **Frame Rate:** 60 FPS for all animations
- **Duration:** 300ms for all transitions (as per requirements)
- **Easing:** cubic-bezier(0.4, 0, 0.2, 1) for smooth, natural motion
- **GPU Acceleration:** Applied to all animated elements
- **Accessibility:** Respects prefers-reduced-motion

### Optimization Techniques

1. **Transform over position/size** - Uses transform for better performance
2. **GPU acceleration** - translateZ(0) forces GPU rendering
3. **Will-change hints** - Prepares browser for animations
4. **Backface visibility** - Prevents flickering
5. **Debouncing** - Interaction updates debounced at 100ms
6. **Conditional transitions** - Disabled during active resize for immediate feedback

## Testing Recommendations

### Visual Testing
1. Switch between tabs - should fade smoothly in 300ms
2. Resize panels - should animate smoothly when released
3. Load content - should show skeleton then fade to content
4. Hover tab buttons - should scale and change color smoothly

### Performance Testing
1. Open DevTools Performance tab
2. Record while switching tabs and resizing panels
3. Verify 60 FPS maintained during animations
4. Check for layout thrashing or reflows

### Accessibility Testing
1. Enable "Reduce Motion" in OS settings
2. Verify animations are nearly instant (0.01ms)
3. Test keyboard navigation with focus indicators
4. Verify screen reader announcements

## Browser Compatibility

All animations use standard CSS properties supported in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Future Enhancements

Potential improvements for future iterations:
1. Spring physics for more natural motion
2. Gesture-based interactions for mobile
3. Parallax effects for depth
4. Micro-interactions on hover states
5. Loading progress indicators with animation
6. Staggered animations for list items

# Glass-morphism Design System

## Overview

The glass-morphism design system provides a set of utility classes for creating modern, frosted-glass UI effects with backdrop blur, semi-transparent backgrounds, and subtle borders.

## Requirements

**Validates Requirements:**
- 19.2: Glass-morphism effects with backdrop blur and subtle transparency
- 19.8: Modern UI elements with glass-morphism overlays

## Available Classes

### Base Glass Effect

```css
.glass
```

The standard glass-morphism effect with:
- 10px backdrop blur
- Semi-transparent white background (10% opacity)
- Subtle white border (20% opacity)
- Soft shadow

**Usage:**
```tsx
<div className="glass rounded-xl p-6">
  <h3>Glass Effect</h3>
  <p>Content with frosted glass background</p>
</div>
```

### Glass Variants

#### Glass Subtle
```css
.glass-subtle
```

Lighter effect for subtle backgrounds:
- 6px backdrop blur
- 5% opacity background
- Lighter shadow

**Usage:**
```tsx
<div className="glass-subtle rounded-lg p-4">
  Subtle glass effect
</div>
```

#### Glass Strong
```css
.glass-strong
```

Stronger effect for prominent elements:
- 16px backdrop blur
- 20% opacity background
- Stronger shadow

**Usage:**
```tsx
<div className="glass-strong rounded-xl p-6">
  Strong glass effect
</div>
```

#### Glass Dark
```css
.glass-dark
```

Dark variant for use on light backgrounds:
- 10px backdrop blur
- Black tint (30% opacity)
- Suitable for dark mode or overlays

**Usage:**
```tsx
<div className="glass-dark rounded-xl p-6 text-white">
  Dark glass effect
</div>
```

#### Glass Yellow
```css
.glass-yellow
```

Yellow-tinted glass for brand-colored elements:
- 10px backdrop blur
- Yellow tint (#FDC500 at 15% opacity)
- Yellow-tinted border and shadow

**Usage:**
```tsx
<div className="glass-yellow rounded-xl p-6">
  Yellow glass effect
</div>
```

#### Glass Purple
```css
.glass-purple
```

Purple-tinted glass for accent elements:
- 10px backdrop blur
- Purple tint (#5C0099 at 15% opacity)
- Purple-tinted border and shadow

**Usage:**
```tsx
<div className="glass-purple rounded-xl p-6">
  Purple glass effect
</div>
```

## Browser Support

### Modern Browsers (Full Support)

- ✅ **Chrome/Edge 76+**: Full support with `backdrop-filter`
- ✅ **Safari 9+**: Full support with `-webkit-backdrop-filter`
- ✅ **Firefox 103+**: Full support with `backdrop-filter`

### Fallback for Older Browsers

For browsers without `backdrop-filter` support, the system automatically falls back to solid semi-transparent backgrounds:

```css
@supports not (backdrop-filter: blur(10px)) {
  .glass {
    background: rgba(255, 255, 255, 0.95);
  }
  /* Similar fallbacks for other variants */
}
```

## Best Practices

### 1. Combine with Tailwind Utilities

Glass effects work seamlessly with Tailwind utilities:

```tsx
<div className="glass rounded-2xl p-6 hover:scale-105 transition-transform">
  Hover to scale
</div>
```

### 2. Nesting Glass Elements

Create depth by nesting glass effects:

```tsx
<div className="glass rounded-xl p-8">
  <div className="glass-strong rounded-lg p-6">
    Nested glass for hierarchy
  </div>
</div>
```

### 3. Use Appropriate Variants

- **glass-subtle**: For backgrounds that shouldn't dominate
- **glass**: For standard UI elements
- **glass-strong**: For modals, tooltips, and prominent cards
- **glass-dark**: For overlays on light backgrounds
- **glass-yellow/purple**: For brand-colored accents

### 4. Performance Considerations

Backdrop-filter can be GPU-intensive:

- ✅ Limit overlapping glass elements
- ✅ Use `glass-subtle` on mobile devices
- ✅ Add `will-change: backdrop-filter` for animated elements
- ❌ Avoid excessive nesting (max 2-3 levels)

```tsx
// Good: Single glass layer
<div className="glass rounded-xl p-6">
  Content
</div>

// Caution: Multiple overlapping layers
<div className="glass">
  <div className="glass-strong">
    <div className="glass-subtle">
      Too many layers!
    </div>
  </div>
</div>
```

### 5. Accessibility

Ensure sufficient contrast when using glass effects:

```tsx
// Good: Dark text on light glass
<div className="glass rounded-xl p-6">
  <p className="text-gray-900">Readable text</p>
</div>

// Good: Light text on dark glass
<div className="glass-dark rounded-xl p-6">
  <p className="text-white">Readable text</p>
</div>
```

## Examples

### Card Component

```tsx
<div className="glass rounded-2xl p-6 hover:shadow-xl transition-shadow">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-gray-700">Card content with glass effect</p>
</div>
```

### Modal Overlay

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div className="glass-strong rounded-2xl p-8 max-w-md">
    <h2 className="text-2xl font-bold mb-4">Modal Title</h2>
    <p className="text-gray-700 mb-6">Modal content</p>
    <button className="glass-yellow rounded-lg px-6 py-2">
      Confirm
    </button>
  </div>
</div>
```

### Toolbar

```tsx
<div className="glass-dark rounded-full px-6 py-3 flex gap-4">
  <button className="text-white hover:text-yellow-400">
    Action 1
  </button>
  <button className="text-white hover:text-yellow-400">
    Action 2
  </button>
</div>
```

### Notification

```tsx
<div className="glass-yellow rounded-xl p-4 flex items-center gap-3">
  <span className="text-2xl">⚠️</span>
  <p className="text-gray-900">Important notification</p>
</div>
```

## Testing

To manually test glass-morphism effects:

1. Import the demo component:
```tsx
import { GlassMorphismDemo } from './components/GlassMorphismDemo';
```

2. Render it in your app:
```tsx
<GlassMorphismDemo />
```

3. Test in different browsers:
   - Chrome/Edge: Check backdrop-filter
   - Safari: Check -webkit-backdrop-filter
   - Firefox: Check backdrop-filter
   - Older browsers: Verify fallback styles

## CSS Variables

The system uses CSS custom properties for easy customization:

```css
--backdrop-blur-glass: 10px;
--backdrop-blur-glass-subtle: 6px;
--backdrop-blur-glass-strong: 16px;

--glass-bg-base: rgba(255, 255, 255, 0.1);
--glass-bg-subtle: rgba(255, 255, 255, 0.05);
--glass-bg-strong: rgba(255, 255, 255, 0.2);
--glass-bg-dark: rgba(0, 0, 0, 0.3);
--glass-bg-yellow: rgba(253, 197, 0, 0.15);
--glass-bg-purple: rgba(92, 0, 153, 0.15);

--glass-border: rgba(255, 255, 255, 0.2);
--glass-border-subtle: rgba(255, 255, 255, 0.1);
--glass-border-strong: rgba(255, 255, 255, 0.3);
```

## Implementation Details

All glass-morphism utilities are defined in `src/index.css` using:
- CSS custom properties for theming
- `backdrop-filter` with `-webkit-` prefix for Safari
- `@supports` queries for fallback styles
- Consistent border and shadow styling

## Related Documentation

- [Design System](./designSystem.ts)
- [Animation Controller](../src/utils/AIAnimationController.ts)
- [Icon Library](./ICON_QUICK_START.md)

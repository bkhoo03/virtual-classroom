# Animation System Guide

A comprehensive guide to using the animation system in the Virtual Classroom application.

## Quick Start

### 1. Using CSS Classes (Easiest)

Simply add classes to your elements:

```tsx
// Button with press effect
<button className="btn-press">Click Me</button>

// Card with hover lift
<div className="hover-lift">Hover Me</div>

// Button with yellow glow
<button className="glow-yellow">Glow Yellow</button>

// Combined effects
<button className="btn-press hover-lift glow-yellow">
  All Effects
</button>
```

### 2. Using Animation Constants

Import and use in your TypeScript/JavaScript:

```typescript
import { EASING, DURATION, DELAY } from '@/utils/animationConstants';

// Use in inline styles
<div style={{
  transition: `transform ${DURATION.normal}ms ${EASING.easeOut}`
}}>
  Animated Element
</div>
```

### 3. Using CSS Variables

Use in your stylesheets:

```css
.my-element {
  transition: transform var(--duration-normal) var(--ease-out-expo);
}
```

## Available Micro-Interaction Classes

### Button Press (`.btn-press`)
Quick scale down on active state.

```tsx
<button className="btn-press">Press Me</button>
```

**Properties:**
- Duration: 150ms (fast)
- Easing: ease-out
- Effect: `scale(0.95)` on active

### Hover Lift (`.hover-lift`)
Subtle elevation on hover.

```tsx
<div className="hover-lift">Hover Me</div>
```

**Properties:**
- Duration: 300ms (normal)
- Easing: ease-out-expo
- Effect: `translateY(-2px)` + shadow enhancement

### Yellow Glow (`.glow-yellow`)
Brand color glow on hover/focus.

```tsx
<button className="glow-yellow">Glow Yellow</button>
```

**Properties:**
- Duration: 300ms (normal)
- Easing: ease-out
- Effect: Yellow glow + `scale(1.02)`

### Purple Glow (`.glow-purple`)
Accent color glow on hover/focus.

```tsx
<button className="glow-purple">Glow Purple</button>
```

**Properties:**
- Duration: 300ms (normal)
- Easing: ease-out
- Effect: Purple glow + `scale(1.02)`

### Smooth Scale (`.smooth-scale`)
Scale transition for icons and small elements.

```tsx
<svg className="smooth-scale">...</svg>
```

**Properties:**
- Duration: 150ms (fast)
- Easing: ease-out
- Effect: `scale(1.1)` on hover, `scale(0.95)` on active

## Animation Classes

### Fade In (`.fade-in`)
Standard fade entrance.

```tsx
<div className="fade-in">Fading In</div>
```

### Slide In Right (`.slide-in-right`)
Slide from right entrance.

```tsx
<div className="slide-in-right">Sliding In</div>
```

### Scale Fade In (`.scale-fade-in`)
Scale and fade for images.

```tsx
<img className="scale-fade-in" src="..." />
```

### Bounce In (`.bounce-in`)
Playful bounce entrance.

```tsx
<div className="bounce-in">Bouncing In</div>
```

## Stagger Animations

Apply increasing delays to elements:

```tsx
<div className="fade-in stagger-1">First (75ms delay)</div>
<div className="fade-in stagger-2">Second (150ms delay)</div>
<div className="fade-in stagger-3">Third (225ms delay)</div>
```

Available: `.stagger-1` through `.stagger-8`

## Animation Constants

### Easing Functions

```typescript
import { EASING } from '@/utils/animationConstants';

EASING.easeOutExpo    // 'cubic-bezier(0.16, 1, 0.3, 1)'
EASING.easeInOutCirc  // 'cubic-bezier(0.85, 0, 0.15, 1)'
EASING.easeSpring     // 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
EASING.easeOut        // 'cubic-bezier(0.16, 1, 0.3, 1)'
EASING.easeIn         // 'cubic-bezier(0.4, 0, 1, 1)'
EASING.easeInOut      // 'cubic-bezier(0.4, 0, 0.2, 1)'
```

### Durations

```typescript
import { DURATION } from '@/utils/animationConstants';

DURATION.fast       // 150ms - Quick micro-interactions
DURATION.normal     // 300ms - Standard transitions
DURATION.slow       // 500ms - Panel slides, modals
DURATION.verySlow   // 700ms - Page transitions
DURATION.quick      // 200ms - Slightly faster than normal
DURATION.image      // 400ms - Image loading animations
DURATION.panel      // 500ms - Panel animations
```

### Delays

```typescript
import { DELAY } from '@/utils/animationConstants';

DELAY.stagger   // 75ms - Between staggered elements
DELAY.sequence  // 150ms - Between sequential animations
DELAY.short     // 50ms - Minimal delay
DELAY.medium    // 100ms - Standard delay
DELAY.long      // 200ms - Longer delay
```

## Helper Functions

### createTransition()

Generate CSS transition strings:

```typescript
import { createTransition, DURATION, EASING } from '@/utils/animationConstants';

// Single property
const transition = createTransition('opacity');
// Result: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1)'

// Multiple properties
const transition = createTransition(['opacity', 'transform']);
// Result: 'opacity 300ms cubic-bezier(0.16, 1, 0.3, 1), transform 300ms cubic-bezier(0.16, 1, 0.3, 1)'

// Custom duration and easing
const transition = createTransition('opacity', DURATION.slow, EASING.easeSpring);

// With delay
const transition = createTransition('opacity', DURATION.normal, EASING.easeOut, 100);
```

### getStaggerDelay()

Calculate staggered delays:

```typescript
import { getStaggerDelay, DELAY } from '@/utils/animationConstants';

// Default stagger (75ms)
const delay1 = getStaggerDelay(0); // 0ms
const delay2 = getStaggerDelay(1); // 75ms
const delay3 = getStaggerDelay(2); // 150ms

// Custom stagger
const delay = getStaggerDelay(2, 100); // 200ms
```

### prefersReducedMotion()

Check user's motion preference:

```typescript
import { prefersReducedMotion } from '@/utils/animationConstants';

if (prefersReducedMotion()) {
  // Skip animations
} else {
  // Apply animations
}
```

### getAnimationDuration()

Get duration respecting accessibility:

```typescript
import { getAnimationDuration, DURATION } from '@/utils/animationConstants';

// Returns 0 if user prefers reduced motion, otherwise returns the duration
const duration = getAnimationDuration(DURATION.normal);
```

## CSS Variables

Use in your stylesheets:

```css
/* Easing Functions */
--ease-out-expo
--ease-in-out-circ
--ease-spring
--ease-out
--ease-in
--ease-in-out

/* Durations */
--duration-fast       /* 150ms */
--duration-normal     /* 300ms */
--duration-slow       /* 500ms */
--duration-very-slow  /* 700ms */

/* Delays */
--delay-stagger   /* 75ms */
--delay-sequence  /* 150ms */
```

Example:

```css
.my-button {
  transition: transform var(--duration-normal) var(--ease-out-expo);
}

.my-button:hover {
  transform: translateY(-2px);
}
```

## Best Practices

### 1. Choose the Right Duration

- **Fast (150ms)**: Hover effects, focus indicators, button presses
- **Normal (300ms)**: Most UI transitions, fades, slides
- **Slow (500ms)**: Panel slides, modal entrances
- **Very Slow (700ms)**: Page transitions, complex animations

### 2. Choose the Right Easing

- **ease-out-expo**: Entrances, dramatic reveals
- **ease-in-out-circ**: Continuous motion, loops
- **ease-spring**: Playful interactions, success states
- **ease-out**: Default for most transitions
- **ease-in**: Exit animations

### 3. Combine Effects Wisely

```tsx
// Good: Complementary effects
<button className="btn-press hover-lift">
  Click Me
</button>

// Good: Press + glow
<button className="btn-press glow-yellow">
  Click Me
</button>

// Avoid: Too many effects
<button className="btn-press hover-lift glow-yellow smooth-scale">
  Too Much!
</button>
```

### 4. Use Stagger for Lists

```tsx
{items.map((item, index) => (
  <div key={item.id} className={`fade-in stagger-${index + 1}`}>
    {item.content}
  </div>
))}
```

### 5. Respect Accessibility

All animations automatically respect `prefers-reduced-motion`. No additional code needed!

```tsx
// This will automatically disable animations for users who prefer reduced motion
<button className="btn-press hover-lift">
  Accessible Button
</button>
```

## Common Patterns

### Animated Button

```tsx
<button className="btn-press glow-yellow px-6 py-3 bg-[#FDC500] rounded-lg font-medium">
  Click Me
</button>
```

### Animated Card

```tsx
<div className="hover-lift bg-white rounded-xl shadow-md p-6">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

### Staggered List

```tsx
<div className="space-y-3">
  {items.map((item, i) => (
    <div key={item.id} className={`fade-in stagger-${i + 1}`}>
      {item.content}
    </div>
  ))}
</div>
```

### Modal Entrance

```tsx
<div className="scale-fade-in bg-white rounded-xl p-8">
  <h2>Modal Title</h2>
  <p>Modal content</p>
</div>
```

### Image Loading

```tsx
<img 
  className="scale-fade-in rounded-lg" 
  src={imageUrl}
  onLoad={(e) => e.currentTarget.classList.add('animation-complete')}
/>
```

## Performance Tips

1. **Use GPU-accelerated properties**: `transform` and `opacity`
2. **Add `will-change` for complex animations**:
   ```tsx
   <div className="will-animate hover-lift">...</div>
   ```
3. **Remove `will-change` after animation**:
   ```tsx
   <div className="will-animate animation-complete">...</div>
   ```
4. **Avoid animating**: `width`, `height`, `top`, `left`, `margin`, `padding`

## Troubleshooting

### Animations not working?

1. Check if CSS is loaded
2. Verify class names are correct
3. Check for conflicting styles
4. Ensure element is visible

### Animations too fast/slow?

Use custom durations:

```typescript
import { createTransition, DURATION } from '@/utils/animationConstants';

// Slower
const transition = createTransition('opacity', DURATION.slow);

// Faster
const transition = createTransition('opacity', DURATION.fast);
```

### Need custom animation?

Create your own using the constants:

```css
.my-custom-animation {
  transition: transform var(--duration-normal) var(--ease-out-expo);
}

.my-custom-animation:hover {
  transform: rotate(5deg) scale(1.05);
}
```

## Examples

See `src/components/MicroInteractionDemo.tsx` for live examples of all animations.

## Support

For questions or issues, refer to:
- `src/utils/animationConstants.ts` - Source code
- `src/tests/microInteractions.test.ts` - Test examples
- `TASK_41_ANIMATION_SYSTEM_COMPLETE.md` - Implementation details

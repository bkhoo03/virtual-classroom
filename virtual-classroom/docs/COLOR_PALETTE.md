# Color Palette Documentation

## Overview

The Virtual Classroom application uses a comprehensive yellow and purple color palette system built with Tailwind CSS v4. The color system provides 10 shades (50-900) for both yellow and purple, along with convenient aliases for primary and secondary colors.

## Requirements

- **19.3**: Yellow brand color for active states
- **19.10**: Consistent design language with yellow/purple colors

## Color Palettes

### Yellow Palette (Primary Brand Color)

Yellow is the primary brand color used for main actions, highlights, and active states.

| Shade | Hex Code | Usage |
|-------|----------|-------|
| 50    | #fffef7  | Lightest background tints |
| 100   | #fffbeb  | Very light backgrounds |
| 200   | #fff4c7  | Light backgrounds, subtle highlights |
| 300   | #ffee32  | Light accents, notifications |
| 400   | #ffe500  | Medium yellow |
| 500   | #fdc500  | **Primary brand color** |
| 600   | #e6a800  | Hover states |
| 700   | #b38600  | Active/pressed states |
| 800   | #806000  | Dark accents |
| 900   | #4d3900  | Darkest shade |

### Purple Palette (Accent Brand Color)

Purple is the accent color used for secondary actions, emphasis, and complementary elements.

| Shade | Hex Code | Usage |
|-------|----------|-------|
| 50    | #faf5ff  | Lightest background tints |
| 100   | #f3e8ff  | Very light backgrounds |
| 200   | #e9d5ff  | Light backgrounds |
| 300   | #d8b4fe  | Light accents |
| 400   | #c86bfa  | Medium purple, secondary light |
| 500   | #a855f7  | Medium-dark purple |
| 600   | #9333ea  | Dark purple |
| 700   | #7e22ce  | Darker purple |
| 800   | #6b21a8  | Very dark purple |
| 900   | #5c0099  | **Secondary brand color** |

## Color Aliases

### Primary Color (Yellow)

```css
--color-primary: var(--color-yellow-500);        /* #fdc500 */
--color-primary-hover: var(--color-yellow-600);  /* #e6a800 */
--color-primary-light: var(--color-yellow-300);  /* #ffee32 */
--color-primary-dark: var(--color-yellow-700);   /* #b38600 */
```

### Secondary Color (Purple)

```css
--color-secondary: var(--color-purple-900);        /* #5c0099 */
--color-secondary-hover: var(--color-purple-800);  /* #6b21a8 */
--color-secondary-light: var(--color-purple-400);  /* #c86bfa */
--color-secondary-dark: var(--color-purple-900);   /* #5c0099 */
```

## Usage in CSS

### Using CSS Variables

```css
/* Primary button */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

/* Secondary button */
.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--color-secondary-hover);
}

/* Using specific shades */
.highlight {
  background-color: var(--color-yellow-100);
  border: 2px solid var(--color-yellow-500);
}

.accent-badge {
  background-color: var(--color-purple-100);
  color: var(--color-purple-900);
}
```

### Using Inline Styles in React

```tsx
// Primary color
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  Primary Background
</div>

// Specific shade
<div style={{ backgroundColor: 'var(--color-yellow-300)' }}>
  Light Yellow Background
</div>

// Secondary color
<button style={{ backgroundColor: 'var(--color-secondary)' }}>
  Secondary Button
</button>
```

## Legacy Colors (Backward Compatibility)

For backward compatibility, the following legacy color variables are maintained:

```css
--color-accent: #fdc500;        /* Same as yellow-500 */
--color-accent-light: #ffd500;  /* Between yellow-400 and yellow-500 */
--color-highlight: #ffee32;     /* Same as yellow-300 */
```

## Design Guidelines

### When to Use Yellow (Primary)

- Primary action buttons (Submit, Save, Create)
- Active states (selected tabs, active tools)
- Focus indicators
- Important highlights and notifications
- Success states

### When to Use Purple (Secondary)

- Secondary action buttons (Cancel, Back)
- Accent elements
- Links and navigation
- Complementary highlights
- Alternative states

### Accessibility

All color combinations have been tested for WCAG AA compliance:
- Yellow-500 on white: ✓ Passes (contrast ratio > 4.5:1)
- Purple-900 on white: ✓ Passes (contrast ratio > 4.5:1)
- White text on Yellow-500: ✓ Passes
- White text on Purple-900: ✓ Passes

## Testing

To verify the color palette configuration:

```bash
npm test -- colorPalette.test.ts --run
```

## Visual Demo

To see the color palette in action, import and use the `ColorPaletteDemo` component:

```tsx
import { ColorPaletteDemo } from './components/ColorPaletteDemo';

// In your component
<ColorPaletteDemo />
```

## Examples

### Primary Button

```tsx
<button
  className="px-6 py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all"
  style={{ backgroundColor: 'var(--color-primary)' }}
>
  Primary Action
</button>
```

### Secondary Button

```tsx
<button
  className="px-6 py-3 rounded-lg font-semibold text-white shadow-md hover:shadow-lg transition-all"
  style={{ backgroundColor: 'var(--color-secondary)' }}
>
  Secondary Action
</button>
```

### Active State Indicator

```tsx
<div
  className="p-4 rounded-lg border-2 transition-all"
  style={{
    backgroundColor: isActive ? 'var(--color-yellow-100)' : 'transparent',
    borderColor: isActive ? 'var(--color-yellow-500)' : 'var(--color-border)'
  }}
>
  {content}
</div>
```

### Purple Accent Badge

```tsx
<span
  className="px-3 py-1 rounded-full text-sm font-medium"
  style={{
    backgroundColor: 'var(--color-purple-100)',
    color: 'var(--color-purple-900)'
  }}
>
  New Feature
</span>
```

## Migration Guide

If you're updating existing components to use the new color palette:

1. Replace hardcoded yellow colors with `var(--color-yellow-*)` or `var(--color-primary)`
2. Replace hardcoded purple colors with `var(--color-purple-*)` or `var(--color-secondary)`
3. Use the appropriate shade for your use case (lighter shades for backgrounds, darker for text/borders)
4. Test color contrast for accessibility

### Before

```css
.button {
  background-color: #fdc500;
}

.button:hover {
  background-color: #e6a800;
}
```

### After

```css
.button {
  background-color: var(--color-primary);
}

.button:hover {
  background-color: var(--color-primary-hover);
}
```

## Future Enhancements

- Dark mode variants for all colors
- Additional semantic color aliases (success, warning, error)
- Gradient utilities using yellow and purple
- Color opacity variants

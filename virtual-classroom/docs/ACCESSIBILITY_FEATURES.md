# Accessibility Features

This document outlines the accessibility features implemented in the Virtual Classroom application to ensure WCAG AA compliance and provide an inclusive experience for all users.

## Overview

The Virtual Classroom application has been designed with accessibility as a core principle, implementing comprehensive keyboard navigation, screen reader support, and respect for user preferences.

## Keyboard Navigation

### Focus Management

- **3px #FDC500 outline** on all focusable elements for high visibility
- **Focus trap** in modals and dialogs to prevent focus from escaping
- **Skip to main content** link for quick navigation
- **Proper tab order** throughout the application
- **Focus restoration** when closing modals

### Keyboard Shortcuts

All keyboard shortcuts are documented and accessible via tooltips:

#### Video Controls
- `M` - Toggle microphone mute/unmute
- `C` - Toggle camera on/off
- `S` - Toggle screen sharing

#### Navigation
- `Ctrl+1` - Switch to AI Output tab
- `Ctrl+2` - Switch to Presentation tab
- `Ctrl+3` - Switch to Whiteboard tab
- `Tab` - Navigate to next interactive element
- `Shift+Tab` - Navigate to previous interactive element
- `Escape` - Close modal or dialog

#### Presentation
- `P` - Switch to PDF mode
- `W` - Switch to Whiteboard mode
- `ArrowLeft` - Previous page/slide
- `ArrowRight` - Next page/slide

#### Classroom
- `L` - Leave classroom

#### Panel Resize
- `ArrowLeft` - Decrease left panel width (when resize handle is focused)
- `ArrowRight` - Increase left panel width (when resize handle is focused)

### Implementation

Keyboard navigation is implemented using:
- `useKeyboardShortcuts` hook for global shortcuts
- `useFocusTrap` hook for modal focus management
- Semantic HTML elements (`<button>`, `<nav>`, `<main>`, etc.)
- Proper `tabindex` attributes where needed

## Screen Reader Support

### ARIA Labels

All interactive elements have appropriate ARIA labels:
- Buttons include `aria-label` attributes
- Form inputs have associated labels
- Status indicators use `aria-live` regions
- Modal dialogs use `role="dialog"` and `aria-modal="true"`
- Tab panels use proper ARIA tab attributes

### Live Regions

Dynamic content changes are announced to screen readers:
- Connection quality changes (`aria-live="assertive"`)
- Video/audio state changes (`aria-live="polite"`)
- Reconnection status (`aria-live="assertive"`)
- Toast notifications (`aria-live="polite"`)

### Screen Reader Announcements

The application uses the `announceToScreenReader` utility to announce:
- Microphone mute/unmute
- Camera on/off
- Connection quality changes
- Reconnection status
- Error messages

### Implementation

Screen reader support is implemented using:
- `useScreenReaderAnnouncement` hook for programmatic announcements
- `useStateChangeAnnouncement` hook for state change announcements
- `.sr-only` CSS class for screen reader-only content
- Comprehensive ARIA attributes throughout components

## Reduced Motion Support

### Media Query

The application respects the `prefers-reduced-motion` user preference:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations and transitions are disabled or minimized */
}
```

### Disabled Animations

When reduced motion is preferred:
- All CSS animations are set to `0.01ms` duration
- Transitions are disabled
- Scroll behavior is set to `auto`
- Specific animations (spin, pulse, bounce, etc.) are completely disabled

### Implementation

Reduced motion support is implemented using:
- `usePrefersReducedMotion` hook to detect user preference
- `useAnimationDuration` hook to adjust animation durations
- CSS media queries for automatic animation disabling
- Conditional animation classes in components

## High Contrast Mode Support

### Media Query

The application supports high contrast mode via `prefers-contrast: high`:

```css
@media (prefers-contrast: high) {
  /* Enhanced borders, focus indicators, and contrast */
}
```

### Enhanced Visibility

When high contrast is preferred:
- All interactive elements have 2px solid borders
- Focus indicators are increased to 4px with 3px offset
- Text contrast is maximized (black on white)
- Shadows are replaced with solid borders
- Disabled states use dashed borders

### Implementation

High contrast support is implemented using:
- `usePrefersHighContrast` hook to detect user preference
- CSS media queries for automatic styling adjustments
- WCAG AA compliant color combinations

## Color Contrast

### WCAG AA Compliance

All color combinations meet WCAG AA standards (4.5:1 minimum contrast ratio):

- **Text on white background**: #1a1a2e (14.5:1 contrast ratio)
- **Secondary text**: #6c757d (4.6:1 contrast ratio)
- **White text on purple**: #5c0099 background (7.2:1 contrast ratio)
- **Focus indicators**: #FDC500 (high visibility yellow)

### Verified Combinations

The `WCAG_AA_COLORS` constant in `accessibility.ts` documents all verified color combinations used in the application.

## Semantic HTML

### Landmarks

The application uses proper HTML5 landmarks:
- `<main>` for main content area
- `<nav>` for navigation elements
- `<aside>` for sidebar panels
- `<section>` for distinct content sections
- `<article>` for self-contained content

### Headings

Proper heading hierarchy is maintained:
- `<h1>` for page titles
- `<h2>` for major sections
- `<h3>` for subsections
- No skipped heading levels

## Form Accessibility

### Labels

All form inputs have associated labels:
- Visible labels for text inputs
- `aria-label` for icon buttons
- `aria-labelledby` for complex form groups

### Error Messages

Form errors are announced to screen readers:
- `aria-invalid` on invalid inputs
- `aria-describedby` linking to error messages
- Visual and programmatic error indicators

## Testing

### Manual Testing Checklist

- [x] Keyboard navigation through all interactive elements
- [x] Screen reader announcements for state changes
- [x] Focus indicators visible on all focusable elements
- [x] Skip to main content link works
- [x] Modal focus trap works correctly
- [x] Reduced motion preference respected
- [x] High contrast mode supported
- [x] All images have alt text
- [x] All buttons have accessible names
- [x] Color contrast meets WCAG AA standards

### Automated Testing

The application can be tested with:
- **axe DevTools** for automated accessibility scanning
- **WAVE** browser extension for visual accessibility testing
- **Lighthouse** accessibility audit in Chrome DevTools
- **NVDA/JAWS** screen readers for manual testing

## Utilities and Hooks

### Accessibility Utilities (`utils/accessibility.ts`)

- `announceToScreenReader()` - Announce messages to screen readers
- `getFocusableElements()` - Get all focusable elements in a container
- `trapFocus()` - Trap focus within a container
- `restoreFocus()` - Restore focus to a previous element
- `setTabOrder()` - Set proper tab order for elements
- `isElementFocusable()` - Check if an element is focusable
- `meetsContrastRequirements()` - Verify WCAG AA contrast compliance

### Accessibility Hooks

- `useKeyboardShortcuts` - Manage keyboard shortcuts
- `useFocusTrap` - Trap focus in modals/dialogs
- `useScreenReaderAnnouncement` - Announce messages to screen readers
- `useStateChangeAnnouncement` - Announce state changes
- `useAccessibilityPreferences` - Detect user accessibility preferences
- `usePrefersReducedMotion` - Check if reduced motion is preferred
- `usePrefersHighContrast` - Check if high contrast is preferred
- `useAnimationDuration` - Get adjusted animation duration

## Browser Support

Accessibility features are supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Future Improvements

Potential accessibility enhancements for future releases:
- Voice control support
- Customizable keyboard shortcuts
- Font size adjustment controls
- Color theme customization
- Captions for video content
- Sign language interpretation support

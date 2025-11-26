# Implementation Plan

- [x] 1. Update theme system and global styles





  - Update CSS variables in `src/index.css` to light theme colors
  - Replace dark backgrounds with white/light gray
  - Update text colors for proper contrast (dark text on light backgrounds)
  - Update shadow definitions for light theme
  - Ensure WCAG AA contrast ratios (4.5:1 minimum)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Create AI Output Panel component




- [x] 2.1 Create base AIOutputPanel component structure


  - Create `src/components/AIOutputPanel.tsx` with TypeScript interfaces
  - Implement header with title, description, and sync toggle
  - Add empty state component with icon and message
  - Add loading state with skeleton
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2.2 Implement content type renderers


  - Create `MapRenderer` component for interactive maps
  - Create `ChartRenderer` component for data visualizations
  - Create `ImageRenderer` component for images
  - Create `VideoRenderer` component for embedded videos
  - Create `IframeRenderer` component for external content
  - _Requirements: 4.4, 4.5_

- [x] 2.3 Add WebSocket synchronization for real-time updates


  - Implement WebSocket connection in AIOutputPanel
  - Add message handlers for content updates and interaction sync
  - Implement sync toggle for tutees (follow tutor vs free explore)
  - Add reconnection logic and error handling
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 3. Redesign ClassroomLayout component





- [x] 3.1 Create new layout structure with resizable panels


  - Update `src/layouts/ClassroomLayout.tsx` with new two-panel layout
  - Implement left panel (40-50% width) for chat
  - Implement right panel (50-60% width) for content
  - Add resize handle between panels with drag functionality
  - Persist panel width to localStorage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.2 Implement minimal tab navigation for right panel


  - Create `TabButton` component with icon and label
  - Add tab bar with AI Output, Video, Presentation, Whiteboard tabs
  - Implement tab switching logic with smooth transitions
  - Set AI Output as default active tab
  - Style tabs for light theme (active: white bg, inactive: gray)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.3 Integrate AI Output Panel into layout


  - Add AIOutputPanel to right panel content area
  - Connect to tab switching logic
  - Pass sessionId and user role props
  - Test panel visibility and transitions
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4. Update Chat component for light theme and new layout





- [x] 4.1 Update Chat component styling


  - Update `src/components/Chat.tsx` with light theme colors
  - Change message bubbles: user (purple bg), AI (gray bg with border)
  - Update input area with white background and gray border
  - Update button colors and hover states
  - Remove dark theme gradients and replace with light borders
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_


- [x] 4.2 Enhance chat header for compact design


  - Reduce header height to 56px (h-14)
  - Use minimal icon and title
  - Remove unnecessary decorations
  - Ensure header blends with light theme
  - _Requirements: 3.1, 3.2, 3.3, 3.4_


- [x] 4.3 Update message list for better readability


  - Increase message font size for better readability
  - Add more spacing between messages
  - Update timestamp styling for light theme
  - Improve AI badge styling with light theme colors
  - _Requirements: 1.4, 2.1, 2.2_

- [x] 5. Update VideoCallModule for tab integration





  - Update `src/components/VideoCallModule.tsx` styling for light theme
  - Remove standalone header (now handled by tab)
  - Update video controls styling
  - Update connection indicators for light theme
  - Ensure proper sizing within tabbed content area
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Update PresentationPanel for light theme





  - Update `src/components/PresentationPanel.tsx` styling
  - Update `src/components/PresentationContainer.tsx` styling
  - Change backgrounds from dark to light
  - Update PDF viewer controls for light theme
  - Update annotation toolbar colors
  - Ensure proper contrast for all UI elements
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.3, 7.4_

- [x] 7. Update Whiteboard component for light theme





  - Update `src/components/Whiteboard.tsx` styling
  - Update `src/components/WhiteboardCanvas.tsx` background to white
  - Update tool palette colors for light theme
  - Update annotation toolbar styling
  - Adjust default drawing colors for visibility on white background
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.2, 7.3_

- [x] 8. Update remaining UI components for light theme




- [x] 8.1 Update modal and dialog components


  - Update `src/components/Modal.tsx` with light theme styling
  - Update backdrop color (semi-transparent dark)
  - Update modal background to white
  - Update close button and borders
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 8.2 Update toast notifications


  - Update `src/components/Toast.tsx` styling
  - Update success, error, warning, info variants for light theme
  - Ensure proper contrast and visibility
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 8.3 Update button components


  - Update `src/components/Button.tsx` with light theme variants
  - Update primary, secondary, and tertiary button styles
  - Update hover and active states
  - Ensure proper focus indicators
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 8.4 Update control toolbar


  - Update `src/components/ControlToolbar.tsx` styling
  - Update icon colors and backgrounds
  - Update tooltips for light theme
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 9. Implement smooth animations and transitions





  - Add transition animations for tab switching (300ms)
  - Add transition for panel resizing with cubic-bezier easing
  - Add fade transitions for content loading
  - Implement skeleton screens for AI Output loading states
  - Ensure 60 FPS performance for all animations
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10. Update authentication pages for light theme





  - Update `src/pages/LoginPage.tsx` with light theme styling
  - Update `src/components/LoginForm.tsx` styling
  - Update `src/pages/HomePage.tsx` styling
  - Ensure consistent light theme across all pages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 11. Add accessibility improvements





  - Verify all color contrast ratios meet WCAG AA standards
  - Add keyboard shortcuts for tab navigation (Ctrl+1, Ctrl+2, etc.)
  - Ensure focus indicators are visible on light backgrounds
  - Add ARIA labels for new components
  - Test with screen readers
  - _Requirements: 1.4, 7.5, 8.5_

- [ ] 12. Testing and polish
- [ ] 12.1 Visual regression testing
  - Capture screenshots of all components in light theme
  - Compare against design specifications
  - Verify consistency across all pages
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 12.2 Functional testing
  - Test chat functionality in new layout
  - Test AI Output panel with different content types
  - Test real-time synchronization between users
  - Test tab switching and panel resizing
  - Verify all existing features work in new layout
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 12.3 Performance optimization
  - Measure and optimize animation performance
  - Test WebSocket connection stability
  - Optimize re-renders with React.memo
  - Test with multiple content types in AI Output
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 12.4 Cross-browser testing
  - Test on Chrome, Firefox, Safari, Edge
  - Test on different screen sizes (1280px to 4K)
  - Verify responsive behavior of resizable panels
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

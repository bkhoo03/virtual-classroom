# Video & Chat Layout Redesign

## Overview
Redesigned the video/chat layout system to ensure video is ALWAYS visible and never collapses to just a header bar.

## New Layout Modes

### 1. Normal Mode (Default) - Video Compact, Chat Large
- **Video Section**: Fixed 280px height (just enough for 2 landscape videos side-by-side)
- **Chat Section**: Takes remaining space (flex-1) - much larger than video
- **Spacer**: 6px gap between them
- **Video Layout**: Side-by-side (flex-row) - compact horizontal layout

### 2. Chat Collapsed Mode - Video Expanded
- **Video Section**: Expands to `calc(100% - 56px)` (full height minus chat header)
- **Chat Section**: Collapses to 56px (just the header bar)
- **Spacer**: Collapses to 0px with opacity 0
- **Video Layout**: Switches to stacked (flex-col) for better use of vertical space

## What Changed

### Removed Features
❌ **Video collapse button** - No longer exists
❌ **Video collapsed state** - Video never collapses to just a header
❌ **Coupled collapse logic** - Video and chat no longer collapse together

### New Behavior
✅ **Video always visible** - Video feeds are always displayed
✅ **Independent chat control** - Only chat can be collapsed/expanded
✅ **Dynamic video layout** - Videos rearrange from side-by-side to stacked when chat collapses
✅ **Smooth transitions** - All changes animate smoothly over 700ms

## Layout Calculations

### Video Height
```tsx
const getVideoHeight = () => {
  if (isAICollapsed) return 'h-[calc(100%-56px)]'; // Chat collapsed: video takes almost full height
  return 'h-[280px]'; // Normal: fixed height for 2 landscape videos
};
```

### Chat Height
```tsx
const getChatHeight = () => {
  if (isAICollapsed) return 'h-14'; // Collapsed: just header (56px)
  return 'flex-1'; // Normal: takes all remaining space
};
```

### Spacer
```tsx
// Only visible in normal mode
className={`${isAICollapsed ? 'h-0 opacity-0' : 'h-6 opacity-100'}`}
```

## Video Feed Arrangement

### Normal Mode (Chat Expanded)
```
┌─────────────────────────┐
│   Video Call Header     │
├───────────┬─────────────┤
│  Student  │   Tutor     │  ← Compact: 280px height
├───────────┴─────────────┤  Side by side (flex-row)
│      6px spacer         │
├─────────────────────────┤
│    Chat Header          │
├─────────────────────────┤
│                         │
│                         │
│    Chat Messages        │  ← Takes remaining space
│      (Large Area)       │
│                         │
│                         │
└─────────────────────────┘
```

### Chat Collapsed Mode (Video Expanded)
```
┌─────────────────────────┐
│   Video Call Header     │
├─────────────────────────┤
│                         │
│       Student           │  ← Stacked vertically
│                         │  (flex-col)
├─────────────────────────┤
│                         │
│        Tutor            │
│                         │
├─────────────────────────┤
│    Chat Header (bar)    │
└─────────────────────────┘
```

## User Interactions

### Expand Video (Collapse Chat)
**Can be triggered from:**
- Video header expand button (chevron down)
- Chat header collapse button (chevron down)

**What happens:**
1. Chat section: `flex-1` (large) → `h-14` (56px)
2. Spacer: `h-6 opacity-100` → `h-0 opacity-0`
3. Video section: `h-[280px]` → `h-[calc(100%-56px)]` (expands significantly)
4. Video layout: `flex-row` → `flex-col` (side-by-side to stacked)
5. All transitions: 700ms cubic-bezier

### Shrink Video (Expand Chat)
**Can be triggered from:**
- Video header shrink button (chevron up when expanded)
- Chat header expand button (chevron up when collapsed)

**What happens:**
1. Chat section: `h-14` → `flex-1` (expands to large area)
2. Spacer: `h-0 opacity-0` → `h-6 opacity-100`
3. Video section: `h-[calc(100%-56px)]` → `h-[280px]` (shrinks to compact)
4. Video layout: `flex-col` → `flex-row` (stacked to side-by-side)
5. All transitions: 700ms cubic-bezier

## Benefits

1. **Always Accessible Video** - Users can always see participants
2. **Better Space Utilization** - Video expands when chat is collapsed
3. **Intuitive Layout** - Videos rearrange to best fit available space
4. **Smooth Animations** - All transitions are fluid and synchronized
5. **Simpler Logic** - Only one collapse state to manage (chat)
6. **Clear Purpose** - Video is for communication, always visible

## Technical Implementation

### ClassroomLayout.tsx Changes
- Removed `isVideoCollapsed` state
- Removed `handleVideoCollapse` function
- Removed video collapse button from header
- Simplified height calculations
- Changed video container to always render content (no conditional opacity)
- Made video section use `flex-1 min-h-0` for proper flex behavior

### VideoCallModule.tsx
- Receives `isChatCollapsed` prop
- Adjusts layout from `flex-row` to `flex-col` based on prop
- Video containers use `flex-1` to fill available space
- Smooth transitions on layout changes

## Control Buttons

### Video Header Button
- **Normal state**: Chevron down icon - "Expand video (hide chat)"
- **Expanded state**: Chevron up icon - "Show chat (shrink video)"
- **Action**: Toggles chat collapse state

### Chat Header Button
- **Normal state**: Chevron down icon - "Collapse AI assistant"
- **Collapsed state**: Chevron up icon - "Expand AI assistant"
- **Action**: Toggles chat collapse state

Both buttons control the same state (`isAICollapsed`) and are synchronized.

## Testing Checklist

- [ ] Default state shows compact video (280px) with large chat area below
- [ ] Videos are side-by-side in normal mode
- [ ] Chat takes most of the vertical space in normal mode
- [ ] Video header has expand button (chevron down)
- [ ] Clicking video expand button collapses chat and expands video
- [ ] Clicking chat collapse button expands video
- [ ] Videos rearrange from side-by-side to stacked when chat collapses
- [ ] Video expands significantly when chat collapses
- [ ] Video button icon rotates to chevron up when expanded
- [ ] Clicking video shrink button (chevron up) restores compact video + large chat
- [ ] Clicking chat expand button restores compact video + large chat
- [ ] Videos rearrange from stacked to side-by-side when chat expands
- [ ] All transitions are smooth (700ms)
- [ ] No jumping or layout shifts
- [ ] Video feeds are always visible
- [ ] Status indicators remain visible throughout transitions
- [ ] Both buttons stay synchronized

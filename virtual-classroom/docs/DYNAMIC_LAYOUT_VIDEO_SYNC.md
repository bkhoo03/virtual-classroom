# Dynamic Layout & Video Control Sync

## Changes Made

### 1. Dynamic Video Section Layout

**Problem:** Video section had fixed size regardless of chat panel state.

**Solution:**
- Updated `ClassroomLayout.tsx` to dynamically adjust video section size
- When chat is collapsed, video section expands from `w-[400px]` to `w-[500px]`
- When chat is collapsed, video height expands from `h-[280px]` to `h-full`
- Smooth transitions with cubic-bezier easing for professional feel

**Benefits:**
- Better space utilization
- Larger video feeds when chat isn't needed
- More immersive video experience

### 2. Video Control Synchronization

**Problem:** Toolbar mute/video buttons were independent from VideoCallModule controls.

**Solution:**
- Added state management in `ClassroomPage.tsx` to track video control states
- VideoCallModule now accepts `onAudioChange` and `onVideoChange` callbacks
- VideoCallModule accepts `externalAudioMuted` and `externalVideoOff` props
- Bidirectional sync: changes in either location update both

**Flow:**
```
VideoCallModule ←→ ClassroomPage ←→ ControlToolbar
     (actual)         (state)         (UI controls)
```

### 3. Implementation Details

#### ClassroomPage State Management
```typescript
const [videoAudioMuted, setVideoAudioMuted] = useState(false);
const [videoVideoOff, setVideoVideoOff] = useState(false);

const handleVideoAudioChange = useCallback((muted: boolean) => {
  setVideoAudioMuted(muted);
}, []);

const handleVideoVideoChange = useCallback((off: boolean) => {
  setVideoVideoOff(off);
}, []);
```

#### VideoCallModule Sync
```typescript
// Notify parent when local controls change
const handleToggleAudio = useCallback(async (muted: boolean) => {
  setIsAudioMuted(muted);
  await videoService.toggleAudio(muted);
  if (onAudioChange) {
    onAudioChange(muted);
  }
}, [videoService, onAudioChange]);

// Sync with external control changes
useEffect(() => {
  if (externalAudioMuted !== undefined && externalAudioMuted !== isAudioMuted) {
    handleToggleAudio(externalAudioMuted);
  }
}, [externalAudioMuted, isAudioMuted, handleToggleAudio]);
```

#### ControlToolbar Display
```typescript
<ControlToolbar
  isAudioMuted={videoAudioMuted}  // Synced from VideoCallModule
  isVideoOff={videoVideoOff}      // Synced from VideoCallModule
  onToggleAudio={toggleAudio}
  onToggleVideo={toggleVideo}
  // ... other props
/>
```

## User Experience Improvements

### Dynamic Layout
1. **Chat Collapsed:**
   - Video section width: 400px → 500px (+25%)
   - Video section height: 280px → full height
   - More screen real estate for video participants
   - Better for focus on video content

2. **Chat Expanded:**
   - Balanced layout with all panels visible
   - Video section maintains comfortable size
   - Easy access to chat and video simultaneously

### Control Sync
1. **Consistent State:**
   - Mute button in toolbar matches VideoCallModule state
   - Video button in toolbar matches VideoCallModule state
   - No confusion about actual device state

2. **Control from Anywhere:**
   - Toggle audio from toolbar → VideoCallModule updates
   - Toggle audio from VideoCallModule → toolbar updates
   - Single source of truth for device states

## Technical Benefits

1. **Maintainability:**
   - Single state management location (ClassroomPage)
   - Clear data flow
   - Easy to debug

2. **Extensibility:**
   - Easy to add more synced controls
   - Pattern can be reused for other features
   - Decoupled components

3. **Performance:**
   - Minimal re-renders
   - useCallback for stable references
   - Efficient state updates

## Files Modified

- `src/layouts/ClassroomLayout.tsx` - Dynamic width/height calculations
- `src/pages/ClassroomPage.tsx` - State management and sync logic
- `src/components/VideoCallModule.tsx` - Callbacks and external state sync
- `src/components/ControlToolbar.tsx` - Interface updates for external state

## Testing Checklist

- [ ] Collapse chat → video section expands
- [ ] Expand chat → video section shrinks
- [ ] Mute from toolbar → VideoCallModule mutes
- [ ] Mute from VideoCallModule → toolbar updates
- [ ] Toggle video from toolbar → VideoCallModule updates
- [ ] Toggle video from VideoCallModule → toolbar updates
- [ ] Smooth transitions without jank
- [ ] No state desync issues

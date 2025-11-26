import { useCallback, useMemo } from 'react';
import { useClassroomContext } from '../contexts/ClassroomContext';
import { useKeyboardShortcuts, type KeyboardShortcut } from './useKeyboardShortcuts';

export interface UseClassroomControlsOptions {
  onLeaveClassroom?: () => void;
  onToggleScreenShare?: () => void;
  onChangePresentationMode?: (mode: 'pdf' | 'screenshare' | 'whiteboard') => void;
}

/**
 * Custom hook that provides unified classroom controls and keyboard shortcuts
 */
export function useClassroomControls({
  onLeaveClassroom,
  onToggleScreenShare,
  onChangePresentationMode,
}: UseClassroomControlsOptions = {}) {
  const { state, dispatch } = useClassroomContext();

  // Video controls
  const toggleAudio = useCallback(() => {
    const newMutedState = !state.video.isAudioMuted;
    dispatch({ type: 'TOGGLE_AUDIO', payload: newMutedState });
  }, [state.video.isAudioMuted, dispatch]);

  const toggleVideo = useCallback(() => {
    const newVideoState = !state.video.isVideoOff;
    dispatch({ type: 'TOGGLE_VIDEO', payload: newVideoState });
  }, [state.video.isVideoOff, dispatch]);

  // Presentation controls
  const changePresentationMode = useCallback(
    (mode: 'pdf' | 'screenshare' | 'whiteboard') => {
      dispatch({ type: 'SET_PRESENTATION_MODE', payload: mode });
      if (onChangePresentationMode) {
        onChangePresentationMode(mode);
      }
    },
    [dispatch, onChangePresentationMode]
  );

  // Define keyboard shortcuts
  const shortcuts = useMemo<KeyboardShortcut[]>(
    () => [
      {
        key: 'm',
        action: toggleAudio,
        description: 'Toggle microphone mute',
      },
      {
        key: 'c',
        action: toggleVideo,
        description: 'Toggle camera on/off',
      },
      {
        key: 's',
        action: () => {
          if (onToggleScreenShare) {
            onToggleScreenShare();
          }
        },
        description: 'Toggle screen sharing',
      },
      {
        key: 'p',
        action: () => changePresentationMode('pdf'),
        description: 'Switch to PDF mode',
      },
      {
        key: 'w',
        action: () => changePresentationMode('whiteboard'),
        description: 'Switch to whiteboard mode',
      },
      {
        key: 'l',
        action: () => {
          if (onLeaveClassroom) {
            onLeaveClassroom();
          }
        },
        description: 'Leave classroom',
      },
    ],
    [
      toggleAudio,
      toggleVideo,
      onToggleScreenShare,
      changePresentationMode,
      onLeaveClassroom,
    ]
  );

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts,
    enabled: true,
  });

  return {
    // Video state
    isAudioMuted: state.video.isAudioMuted,
    isVideoOff: state.video.isVideoOff,
    
    // Presentation state
    presentationMode: state.presentation.mode,
    
    // Actions
    toggleAudio,
    toggleVideo,
    changePresentationMode,
    
    // Shortcuts for display
    shortcuts,
  };
}

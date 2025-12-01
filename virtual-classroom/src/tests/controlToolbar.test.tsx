import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import ControlToolbar from '../components/ControlToolbar';

/**
 * Property-Based Tests for Control Toolbar UI Modernization
 * 
 * These tests verify that the control toolbar uses modern design elements
 * including Lucide icons, glass-morphism effects, and yellow highlights.
 */

describe('Control Toolbar UI Tests', () => {
  let testContainer: HTMLDivElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.removeChild(testContainer);
  });

  describe('Property 93: Modern control toolbar', () => {
    /**
     * **Feature: classroom-ui-overhaul, Property 93: Modern control toolbar**
     * 
     * *For any* control toolbar button, modern icons with smooth hover effects 
     * and yellow highlights should be used for active states
     * 
     * **Validates: Requirements 19.7**
     */
    it('should use Lucide icons instead of emoji', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // isAudioMuted
          fc.boolean(), // isVideoOff
          fc.boolean(), // isScreenSharing
          (isAudioMuted, isVideoOff, isScreenSharing) => {
            const { container } = render(
              <ControlToolbar
                isAudioMuted={isAudioMuted}
                isVideoOff={isVideoOff}
                onToggleAudio={() => {}}
                onToggleVideo={() => {}}
                isScreenSharing={isScreenSharing}
                onToggleScreenShare={() => {}}
                onLeaveClassroom={() => {}}
              />
            );

            // Check that SVG icons are used (Lucide renders as SVG)
            const svgIcons = container.querySelectorAll('svg');
            expect(svgIcons.length).toBeGreaterThan(0);

            // Check that no emoji characters are used in buttons
            const buttons = container.querySelectorAll('button');
            buttons.forEach(button => {
              const text = button.textContent || '';
              // Emoji regex pattern
              const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
              expect(emojiRegex.test(text)).toBe(false);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should apply glass morphism background with backdrop blur to toolbar container', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (isAudioMuted, isVideoOff) => {
            const { container } = render(
              <ControlToolbar
                isAudioMuted={isAudioMuted}
                isVideoOff={isVideoOff}
                onToggleAudio={() => {}}
                onToggleVideo={() => {}}
              />
            );

            // Find the toolbar container (should have bg-white/10 and backdrop-blur-md for glass morphism)
            const toolbarContainer = container.querySelector('.bg-white\\/10');
            expect(toolbarContainer).toBeTruthy();

            // Verify it has rounded corners (rounded-full for pill shape)
            expect(toolbarContainer?.classList.contains('rounded-full')).toBe(true);
            
            // Verify it has backdrop blur
            expect(toolbarContainer?.classList.contains('backdrop-blur-md')).toBe(true);
            
            // Verify it has white/20 border for glass effect
            expect(toolbarContainer?.classList.contains('border-white/20')).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should apply yellow highlights for active screen share state', () => {
      const { container, rerender } = render(
        <ControlToolbar
          isAudioMuted={false}
          isVideoOff={false}
          onToggleAudio={() => {}}
          onToggleVideo={() => {}}
          isScreenSharing={true}
          onToggleScreenShare={() => {}}
        />
      );

      // Find screen share button (should have Monitor icon)
      const buttons = container.querySelectorAll('button');
      const screenShareButton = Array.from(buttons).find(btn => 
        btn.getAttribute('aria-label')?.includes('screen sharing')
      );

      expect(screenShareButton).toBeTruthy();
      
      // When screen sharing is active, should have yellow background
      const hasYellowBg = screenShareButton?.classList.contains('bg-[#FDC500]/90') ||
                          screenShareButton?.className.includes('FDC500');
      expect(hasYellowBg).toBe(true);

      // Rerender with screen sharing off
      rerender(
        <ControlToolbar
          isAudioMuted={false}
          isVideoOff={false}
          onToggleAudio={() => {}}
          onToggleVideo={() => {}}
          isScreenSharing={false}
          onToggleScreenShare={() => {}}
        />
      );

      const updatedButtons = container.querySelectorAll('button');
      const updatedScreenShareButton = Array.from(updatedButtons).find(btn => 
        btn.getAttribute('aria-label')?.includes('screen sharing')
      );

      // When not active, should have glass morphism background
      expect(updatedScreenShareButton?.classList.contains('bg-white/10')).toBe(true);
    });

    it('should apply danger state styling for muted audio', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isAudioMuted) => {
            const { container } = render(
              <ControlToolbar
                isAudioMuted={isAudioMuted}
                isVideoOff={false}
                onToggleAudio={() => {}}
                onToggleVideo={() => {}}
              />
            );

            const buttons = container.querySelectorAll('button');
            const audioButton = Array.from(buttons).find(btn => 
              btn.getAttribute('aria-label')?.includes('microphone')
            );

            expect(audioButton).toBeTruthy();

            if (isAudioMuted) {
              // When muted, should have red background
              expect(audioButton?.classList.contains('bg-red-500/90')).toBe(true);
            } else {
              // When not muted, should have glass morphism background
              expect(audioButton?.classList.contains('bg-white/10')).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should apply danger state styling for video off', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          (isVideoOff) => {
            const { container } = render(
              <ControlToolbar
                isAudioMuted={false}
                isVideoOff={isVideoOff}
                onToggleAudio={() => {}}
                onToggleVideo={() => {}}
              />
            );

            const buttons = container.querySelectorAll('button');
            const videoButton = Array.from(buttons).find(btn => 
              btn.getAttribute('aria-label')?.includes('camera')
            );

            expect(videoButton).toBeTruthy();

            if (isVideoOff) {
              // When video is off, should have red background
              expect(videoButton?.classList.contains('bg-red-500/90')).toBe(true);
            } else {
              // When video is on, should have glass morphism background
              expect(videoButton?.classList.contains('bg-white/10')).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should apply danger state styling for leave button', () => {
      const { container } = render(
        <ControlToolbar
          isAudioMuted={false}
          isVideoOff={false}
          onToggleAudio={() => {}}
          onToggleVideo={() => {}}
          onLeaveClassroom={() => {}}
        />
      );

      const buttons = container.querySelectorAll('button');
      const leaveButton = Array.from(buttons).find(btn => 
        btn.getAttribute('aria-label')?.includes('Leave')
      );

      expect(leaveButton).toBeTruthy();
      // Leave button should always have red background
      expect(leaveButton?.classList.contains('bg-red-500/90')).toBe(true);
    });

    it('should have smooth hover animations on all buttons', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          (isAudioMuted, isVideoOff) => {
            const { container } = render(
              <ControlToolbar
                isAudioMuted={isAudioMuted}
                isVideoOff={isVideoOff}
                onToggleAudio={() => {}}
                onToggleVideo={() => {}}
                onLeaveClassroom={() => {}}
              />
            );

            const buttons = container.querySelectorAll('button');
            
            // All buttons should have transition classes for smooth animations
            buttons.forEach(button => {
              expect(button.classList.contains('transition-all')).toBe(true);
              // Duration can be 300ms or 500ms depending on the button
              const hasDuration = button.classList.contains('duration-300') || 
                                 button.classList.contains('duration-500');
              expect(hasDuration).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should use white/30 dividers for glass morphism effect', () => {
      const { container } = render(
        <ControlToolbar
          isAudioMuted={false}
          isVideoOff={false}
          onToggleAudio={() => {}}
          onToggleVideo={() => {}}
          onToggleScreenShare={() => {}}
          onLeaveClassroom={() => {}}
        />
      );

      // Find dividers (vertical lines between button groups)
      const dividers = container.querySelectorAll('.w-px');
      
      dividers.forEach(divider => {
        // Should use white/30 for glass morphism effect
        expect(divider.classList.contains('bg-white/30')).toBe(true);
      });
    });

    it('should maintain consistent button sizing', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.boolean(),
          fc.boolean(),
          (isAudioMuted, isVideoOff, isScreenSharing) => {
            const { container } = render(
              <ControlToolbar
                isAudioMuted={isAudioMuted}
                isVideoOff={isVideoOff}
                onToggleAudio={() => {}}
                onToggleVideo={() => {}}
                isScreenSharing={isScreenSharing}
                onToggleScreenShare={() => {}}
                onLeaveClassroom={() => {}}
              />
            );

            const buttons = container.querySelectorAll('button');
            
            // All toolbar buttons should have consistent sizing (w-9 h-9)
            expect(buttons.length).toBeGreaterThan(0);
            
            buttons.forEach(button => {
              expect(button.classList.contains('w-9')).toBe(true);
              expect(button.classList.contains('h-9')).toBe(true);
            });
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

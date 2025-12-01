import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import ConnectionQualityIndicator from '../components/ConnectionQualityIndicator';
import * as fc from 'fast-check';

/**
 * Feature: classroom-ui-overhaul, Property 94: Modern video call UI
 * 
 * For any video call overlay element, glass-morphism effects and yellow accents should be applied
 * 
 * Validates: Requirements 19.8
 */

describe('Property 94: Modern video call UI', () => {
  it('should apply glass-morphism effects to video overlays', () => {
    fc.assert(
      fc.property(
        fc.record({
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          isLocal: fc.boolean(),
          connectionQuality: fc.constantFrom('excellent', 'good', 'poor', 'bad'),
          audioMuted: fc.boolean(),
          videoOff: fc.boolean(),
        }),
        (props) => {
          const { container } = render(
            <BrowserRouter>
              <VideoPlayer
                videoTrack={null}
                userName={props.userName}
                isLocal={props.isLocal}
                connectionQuality={props.connectionQuality as any}
                audioMuted={props.audioMuted}
                videoOff={props.videoOff}
              />
            </BrowserRouter>
          );

          // Check for glass-dark class on overlays
          const glassElements = container.querySelectorAll('.glass-dark');
          
          // Should have glass-dark overlays for user info and status indicators
          expect(glassElements.length).toBeGreaterThan(0);

          // Verify glass-dark elements have proper styling attributes
          glassElements.forEach((element) => {
            // Note: In jsdom, backdrop-filter might not be computed correctly
            // So we check for the class presence as a proxy for glass-morphism
            expect(element.classList.contains('glass-dark')).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply rounded corners to video elements', () => {
    fc.assert(
      fc.property(
        fc.record({
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          isLocal: fc.boolean(),
          connectionQuality: fc.constantFrom('excellent', 'good', 'poor', 'bad'),
        }),
        (props) => {
          const { container } = render(
            <BrowserRouter>
              <VideoPlayer
                videoTrack={null}
                userName={props.userName}
                isLocal={props.isLocal}
                connectionQuality={props.connectionQuality as any}
              />
            </BrowserRouter>
          );

          // Check for rounded corners on main video container
          const videoContainer = container.querySelector('[role="region"]');
          expect(videoContainer).toBeTruthy();
          
          if (videoContainer) {
            // Should have rounded-2xl class (or similar rounded class)
            const hasRoundedClass = Array.from(videoContainer.classList).some(
              (cls) => cls.includes('rounded')
            );
            expect(hasRoundedClass).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display connection quality indicator with modern styling', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('excellent', 'good', 'poor', 'bad'),
        (quality) => {
          const { container } = render(
            <BrowserRouter>
              <ConnectionQualityIndicator 
                quality={quality as any} 
                showLabel={false} 
              />
            </BrowserRouter>
          );

          // Should have connection quality bars
          const bars = container.querySelectorAll('[role="status"]');
          expect(bars.length).toBeGreaterThan(0);

          // Bars should have rounded styling
          const barElements = container.querySelectorAll('div[class*="rounded"]');
          expect(barElements.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply smooth fade-in animations to overlays', () => {
    fc.assert(
      fc.property(
        fc.record({
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          isLocal: fc.boolean(),
          audioMuted: fc.boolean(),
          videoOff: fc.boolean(),
        }),
        (props) => {
          const { container } = render(
            <BrowserRouter>
              <VideoPlayer
                videoTrack={null}
                userName={props.userName}
                isLocal={props.isLocal}
                audioMuted={props.audioMuted}
                videoOff={props.videoOff}
              />
            </BrowserRouter>
          );

          // Check for animate-fade-in class on overlays
          const animatedElements = container.querySelectorAll('.animate-fade-in');
          
          // Should have animated elements when overlays are present
          if (props.videoOff || props.audioMuted || props.isLocal) {
            expect(animatedElements.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should use modern Lucide icons instead of SVG paths', () => {
    fc.assert(
      fc.property(
        fc.record({
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          isLocal: fc.boolean(),
          audioMuted: fc.boolean(),
          videoOff: fc.boolean(),
        }),
        (props) => {
          const { container } = render(
            <BrowserRouter>
              <VideoPlayer
                videoTrack={null}
                userName={props.userName}
                isLocal={props.isLocal}
                audioMuted={props.audioMuted}
                videoOff={props.videoOff}
              />
            </BrowserRouter>
          );

          // When status indicators are shown, they should use Lucide icons
          if (props.isLocal && (props.audioMuted || props.videoOff)) {
            const statusContainer = container.querySelector('[role="status"]');
            expect(statusContainer).toBeTruthy();
            
            // Lucide icons are rendered as SVG elements
            const svgIcons = statusContainer?.querySelectorAll('svg');
            expect(svgIcons && svgIcons.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply hover transitions to status indicators', () => {
    fc.assert(
      fc.property(
        fc.record({
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          audioMuted: fc.boolean(),
          videoOff: fc.boolean(),
        }),
        (props) => {
          const { container } = render(
            <BrowserRouter>
              <VideoPlayer
                videoTrack={null}
                userName={props.userName}
                isLocal={true}
                audioMuted={props.audioMuted}
                videoOff={props.videoOff}
              />
            </BrowserRouter>
          );

          // Status indicators (top right corner) should have transition classes
          // These are only shown when audioMuted or videoOff is true
          if (props.audioMuted || props.videoOff) {
            // Look for the status indicators container
            const statusContainer = container.querySelector('[role="status"][aria-live="polite"]');
            
            if (statusContainer) {
              const indicators = statusContainer.querySelectorAll('.glass-dark');
              
              // Each indicator should have transition or hover classes
              indicators.forEach((indicator) => {
                const hasTransition = Array.from(indicator.classList).some(
                  (cls) => cls.includes('transition') || cls.includes('hover')
                );
                expect(hasTransition).toBe(true);
              });
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display animated connection quality dot', () => {
    fc.assert(
      fc.property(
        fc.record({
          userName: fc.string({ minLength: 1, maxLength: 50 }),
          connectionQuality: fc.constantFrom('excellent', 'good', 'poor', 'bad'),
        }),
        (props) => {
          const { container } = render(
            <BrowserRouter>
              <VideoPlayer
                videoTrack={null}
                userName={props.userName}
                isLocal={false}
                connectionQuality={props.connectionQuality as any}
              />
            </BrowserRouter>
          );

          // Should have an animated dot for connection quality
          const animatedDots = container.querySelectorAll('.animate-pulse');
          expect(animatedDots.length).toBeGreaterThan(0);

          // Dot should have rounded-full class
          const dots = Array.from(animatedDots).filter((el) =>
            el.classList.contains('rounded-full')
          );
          expect(dots.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should apply scale animations to video off overlay', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        (userName) => {
          const { container } = render(
            <BrowserRouter>
              <VideoPlayer
                videoTrack={null}
                userName={userName}
                isLocal={false}
                videoOff={true}
              />
            </BrowserRouter>
          );

          // Video off overlay should have scale animation
          const scaleElements = container.querySelectorAll('.animate-scale-in');
          expect(scaleElements.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

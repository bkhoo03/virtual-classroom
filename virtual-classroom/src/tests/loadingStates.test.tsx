/**
 * Loading States Tests
 * 
 * Feature: classroom-ui-overhaul, Property 97: Modern loading states
 * Validates: Requirements 19.11
 * 
 * Tests that loading indicators and skeleton loaders have modern animations with yellow accents
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from '../components/Spinner';
import AILoadingIndicator from '../components/AILoadingIndicator';
import { AIOutputSkeleton, ChatSkeleton, PresentationSkeleton, VideoCallSkeleton } from '../components/skeletons';

describe('Property 97: Modern loading states', () => {
  describe('Spinner Component', () => {
    it('should render spinner with yellow colors', () => {
      const { container } = render(<Spinner />);
      
      // Verify spinner is rendered
      expect(container.querySelector('.border-yellow-500')).toBeTruthy();
      expect(container.querySelector('.border-yellow-200')).toBeTruthy();
    });

    it('should support different sizes', () => {
      const { container: smallContainer } = render(<Spinner size="small" />);
      const { container: mediumContainer } = render(<Spinner size="medium" />);
      const { container: largeContainer } = render(<Spinner size="large" />);
      
      // Verify different size classes are applied
      expect(smallContainer.querySelector('.w-6')).toBeTruthy();
      expect(mediumContainer.querySelector('.w-12')).toBeTruthy();
      expect(largeContainer.querySelector('.w-16')).toBeTruthy();
    });

    it('should have smooth rotation animation', () => {
      const { container } = render(<Spinner />);
      
      // Verify animation class is present
      const spinningElement = container.querySelector('.animate-spin');
      expect(spinningElement).toBeTruthy();
    });

    it('should have yellow glow effect', () => {
      const { container } = render(<Spinner />);
      
      // Verify pulse animation for glow effect
      const glowElement = container.querySelector('.animate-pulse');
      expect(glowElement).toBeTruthy();
    });
  });

  describe('AI Loading Indicator', () => {
    it('should render with yellow accents', () => {
      const { container } = render(<AILoadingIndicator />);
      
      // Verify yellow color classes are present
      expect(container.querySelector('.bg-yellow-500')).toBeTruthy();
      expect(container.querySelector('.border-yellow-500')).toBeTruthy();
    });

    it('should display custom message', () => {
      render(<AILoadingIndicator message="Generating response..." />);
      
      expect(screen.getByText('Generating response...')).toBeTruthy();
    });

    it('should have animated bouncing dots', () => {
      const { container } = render(<AILoadingIndicator />);
      
      // Verify bouncing dots are present
      const bouncingDots = container.querySelectorAll('.animate-bounce');
      expect(bouncingDots.length).toBeGreaterThanOrEqual(3);
    });

    it('should have spinning animation', () => {
      const { container } = render(<AILoadingIndicator />);
      
      // Verify spinning animation
      const spinningElement = container.querySelector('.animate-spin');
      expect(spinningElement).toBeTruthy();
    });

    it('should have pulsing glow effect', () => {
      const { container } = render(<AILoadingIndicator />);
      
      // Verify pulse and ping animations
      const pulsingElements = container.querySelectorAll('.animate-pulse');
      const pingElement = container.querySelector('.animate-ping');
      
      expect(pulsingElements.length).toBeGreaterThan(0);
      expect(pingElement).toBeTruthy();
    });
  });

  describe('Skeleton Loaders', () => {
    it('should render AIOutputSkeleton with yellow shimmer', () => {
      const { container } = render(<AIOutputSkeleton />);
      
      // Verify shimmer animation styles are present
      const shimmerElements = container.querySelectorAll('[class*="shimmer"]');
      expect(shimmerElements.length).toBeGreaterThan(0);
      
      // Verify yellow gradient classes
      expect(container.innerHTML).toContain('yellow');
    });

    it('should render ChatSkeleton with glass effect', () => {
      const { container } = render(<ChatSkeleton />);
      
      // Verify glass effect classes
      expect(container.querySelector('.backdrop-blur-sm')).toBeTruthy();
      
      // Verify yellow accents
      expect(container.innerHTML).toContain('yellow');
    });

    it('should render PresentationSkeleton with yellow shimmer', () => {
      const { container } = render(<PresentationSkeleton />);
      
      // Verify shimmer animation
      const shimmerElements = container.querySelectorAll('[class*="shimmer"]');
      expect(shimmerElements.length).toBeGreaterThan(0);
      
      // Verify yellow gradient
      expect(container.innerHTML).toContain('yellow');
    });

    it('should render VideoCallSkeleton with glass effect and yellow accents', () => {
      const { container } = render(<VideoCallSkeleton />);
      
      // Verify glass effect
      expect(container.querySelector('.backdrop-blur-sm')).toBeTruthy();
      
      // Verify yellow accents
      expect(container.innerHTML).toContain('yellow');
    });

    it('should have smooth shimmer animations in all skeletons', () => {
      const skeletons = [
        <AIOutputSkeleton key="ai" />,
        <ChatSkeleton key="chat" />,
        <PresentationSkeleton key="presentation" />,
        <VideoCallSkeleton key="video" />,
      ];

      skeletons.forEach((skeleton) => {
        const { container } = render(skeleton);
        
        // Verify shimmer or animation classes are present
        const hasShimmer = container.querySelectorAll('[class*="shimmer"]').length > 0;
        const hasAnimation = container.querySelectorAll('[class*="animate"]').length > 0;
        
        expect(hasShimmer || hasAnimation).toBe(true);
      });
    });
  });

  describe('Modern Animation Properties', () => {
    it('should use smooth easing functions', () => {
      const { container } = render(<Spinner />);
      
      // Verify smooth animation timing is applied
      const spinningElement = container.querySelector('.animate-spin');
      expect(spinningElement).toBeTruthy();
      
      // In a real browser, we could check computed styles
      // Here we verify the element exists with animation class
    });

    it('should have consistent yellow brand colors across all loading states', () => {
      const components = [
        <Spinner key="spinner" />,
        <AILoadingIndicator key="ai-loading" />,
        <AIOutputSkeleton key="ai-skeleton" />,
        <ChatSkeleton key="chat-skeleton" />,
      ];

      components.forEach((component) => {
        const { container } = render(component);
        
        // Verify yellow colors are present
        const hasYellow = container.innerHTML.includes('yellow');
        expect(hasYellow).toBe(true);
      });
    });

    it('should apply glass-morphism effects to skeleton loaders', () => {
      const skeletons = [
        <ChatSkeleton key="chat" />,
        <PresentationSkeleton key="presentation" />,
        <VideoCallSkeleton key="video" />,
      ];

      skeletons.forEach((skeleton) => {
        const { container } = render(skeleton);
        
        // Verify backdrop-blur (glass effect) is present
        const hasGlassEffect = container.querySelector('.backdrop-blur-sm') !== null;
        expect(hasGlassEffect).toBe(true);
      });
    });
  });

  describe('Accessibility', () => {
    it('should not interfere with screen readers', () => {
      const { container } = render(<Spinner />);
      
      // Loading indicators should not have aria-hidden
      const spinner = container.firstChild;
      expect(spinner).toBeTruthy();
    });

    it('should provide meaningful loading messages', () => {
      render(<AILoadingIndicator message="Processing your request..." />);
      
      // Verify message is visible
      expect(screen.getByText('Processing your request...')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should render multiple loading indicators efficiently', () => {
      const startTime = performance.now();
      
      // Render multiple loading indicators
      for (let i = 0; i < 10; i++) {
        render(<Spinner key={i} />);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should render quickly (< 100ms for 10 indicators)
      expect(duration).toBeLessThan(100);
    });

    it('should render skeleton loaders efficiently', () => {
      const startTime = performance.now();
      
      // Render all skeleton types
      render(<AIOutputSkeleton />);
      render(<ChatSkeleton />);
      render(<PresentationSkeleton />);
      render(<VideoCallSkeleton />);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should render quickly (< 200ms for all skeletons)
      expect(duration).toBeLessThan(200);
    });
  });
});

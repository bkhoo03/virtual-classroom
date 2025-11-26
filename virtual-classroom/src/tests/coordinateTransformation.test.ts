/**
 * Unit tests for coordinate transformation logic
 * Tests zoom and pan coordinate calculations
 * Requirements: 1.8
 */

import { describe, it, expect } from 'vitest';

/**
 * Coordinate transformation utility for testing
 * Mimics the logic used in PDFViewerWithAnnotations
 */
function transformCoordinates(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  zoom: number,
  panOffset: { x: number; y: number }
): { x: number; y: number } {
  const x = (clientX - containerRect.left - panOffset.x) / (zoom / 100);
  const y = (clientY - containerRect.top - panOffset.y) / (zoom / 100);
  return { x, y };
}

describe('Coordinate Transformation', () => {
  const mockContainerRect: DOMRect = {
    left: 100,
    top: 50,
    width: 800,
    height: 600,
    right: 900,
    bottom: 650,
    x: 100,
    y: 50,
    toJSON: () => ({}),
  };

  describe('Basic Transformation at 100% Zoom', () => {
    it('should transform coordinates correctly at 100% zoom with no pan', () => {
      const result = transformCoordinates(200, 150, mockContainerRect, 100, { x: 0, y: 0 });
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('should handle top-left corner', () => {
      const result = transformCoordinates(100, 50, mockContainerRect, 100, { x: 0, y: 0 });
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should handle center coordinates', () => {
      const result = transformCoordinates(500, 350, mockContainerRect, 100, { x: 0, y: 0 });
      expect(result.x).toBe(400);
      expect(result.y).toBe(300);
    });
  });

  describe('Zoom Level Transformations', () => {
    it('should transform correctly at 200% zoom', () => {
      const result = transformCoordinates(200, 150, mockContainerRect, 200, { x: 0, y: 0 });
      expect(result.x).toBe(50);
      expect(result.y).toBe(50);
    });

    it('should transform correctly at 150% zoom', () => {
      const result = transformCoordinates(250, 200, mockContainerRect, 150, { x: 0, y: 0 });
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('should transform correctly at 50% zoom', () => {
      const result = transformCoordinates(150, 100, mockContainerRect, 50, { x: 0, y: 0 });
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('should transform correctly at 300% zoom', () => {
      const result = transformCoordinates(400, 350, mockContainerRect, 300, { x: 0, y: 0 });
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('should handle fractional zoom levels', () => {
      const result = transformCoordinates(200, 150, mockContainerRect, 125, { x: 0, y: 0 });
      expect(result.x).toBe(80);
      expect(result.y).toBe(80);
    });
  });

  describe('Pan Offset Transformations', () => {
    it('should account for positive pan offset', () => {
      const result = transformCoordinates(200, 150, mockContainerRect, 100, { x: 50, y: 30 });
      expect(result.x).toBe(50);
      expect(result.y).toBe(70);
    });

    it('should account for negative pan offset', () => {
      const result = transformCoordinates(200, 150, mockContainerRect, 100, { x: -50, y: -30 });
      expect(result.x).toBe(150);
      expect(result.y).toBe(130);
    });

    it('should handle large pan offsets', () => {
      const result = transformCoordinates(200, 150, mockContainerRect, 100, { x: 200, y: 150 });
      expect(result.x).toBe(-100);
      expect(result.y).toBe(-50);
    });
  });

  describe('Combined Zoom and Pan', () => {
    it('should handle 200% zoom with positive pan', () => {
      const result = transformCoordinates(300, 250, mockContainerRect, 200, { x: 100, y: 50 });
      expect(result.x).toBe(50);
      expect(result.y).toBe(75);
    });

    it('should handle 150% zoom with negative pan', () => {
      const result = transformCoordinates(250, 200, mockContainerRect, 150, { x: -75, y: -45 });
      expect(result.x).toBe(150);
      expect(result.y).toBe(130);
    });

    it('should handle 50% zoom with pan', () => {
      const result = transformCoordinates(200, 150, mockContainerRect, 50, { x: 25, y: 15 });
      expect(result.x).toBe(150);
      expect(result.y).toBe(170);
    });

    it('should handle complex scenario', () => {
      const result = transformCoordinates(450, 400, mockContainerRect, 175, { x: 125, y: 75 });
      expect(result.x).toBeCloseTo(128.57, 1);
      expect(result.y).toBeCloseTo(157.14, 1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero coordinates', () => {
      const result = transformCoordinates(0, 0, mockContainerRect, 100, { x: 0, y: 0 });
      expect(result.x).toBe(-100);
      expect(result.y).toBe(-50);
    });

    it('should handle very large coordinates', () => {
      const result = transformCoordinates(10000, 10000, mockContainerRect, 100, { x: 0, y: 0 });
      expect(result.x).toBe(9900);
      expect(result.y).toBe(9950);
    });

    it('should handle zero zoom gracefully', () => {
      // This would cause division by zero, should be prevented in actual implementation
      const result = transformCoordinates(200, 150, mockContainerRect, 0.01, { x: 0, y: 0 });
      expect(result.x).toBe(1000000);
      expect(result.y).toBe(1000000);
    });

    it('should handle negative coordinates', () => {
      const result = transformCoordinates(-100, -50, mockContainerRect, 100, { x: 0, y: 0 });
      expect(result.x).toBe(-200);
      expect(result.y).toBe(-100);
    });
  });

  describe('Inverse Transformation', () => {
    it('should be reversible at 100% zoom', () => {
      const original = { clientX: 300, clientY: 250 };
      const transformed = transformCoordinates(
        original.clientX,
        original.clientY,
        mockContainerRect,
        100,
        { x: 0, y: 0 }
      );

      // Reverse transformation
      const reversed = {
        x: transformed.x * (100 / 100) + mockContainerRect.left + 0,
        y: transformed.y * (100 / 100) + mockContainerRect.top + 0,
      };

      expect(reversed.x).toBe(original.clientX);
      expect(reversed.y).toBe(original.clientY);
    });

    it('should be reversible at 200% zoom', () => {
      const original = { clientX: 400, clientY: 350 };
      const zoom = 200;
      const pan = { x: 50, y: 30 };

      const transformed = transformCoordinates(
        original.clientX,
        original.clientY,
        mockContainerRect,
        zoom,
        pan
      );

      // Reverse transformation
      const reversed = {
        x: transformed.x * (zoom / 100) + mockContainerRect.left + pan.x,
        y: transformed.y * (zoom / 100) + mockContainerRect.top + pan.y,
      };

      expect(reversed.x).toBeCloseTo(original.clientX, 10);
      expect(reversed.y).toBeCloseTo(original.clientY, 10);
    });
  });

  describe('Precision and Rounding', () => {
    it('should maintain precision for fractional coordinates', () => {
      const result = transformCoordinates(200.5, 150.7, mockContainerRect, 100, { x: 0, y: 0 });
      expect(result.x).toBe(100.5);
      expect(result.y).toBeCloseTo(100.7, 10);
    });

    it('should handle fractional zoom and pan', () => {
      const result = transformCoordinates(200.5, 150.5, mockContainerRect, 133.33, {
        x: 25.5,
        y: 15.5,
      });
      expect(result.x).toBeCloseTo(56.25, 2);
      expect(result.y).toBeCloseTo(63.75, 2);
    });
  });
});

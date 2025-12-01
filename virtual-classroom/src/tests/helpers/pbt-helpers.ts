/**
 * Property-Based Testing Helpers
 * Utilities and custom arbitraries for fast-check property tests
 */

import * as fc from 'fast-check';

/**
 * Custom Arbitraries for Virtual Classroom Domain
 */

// User-related arbitraries
export const userIdArbitrary = fc.uuid();
export const emailArbitrary = fc.emailAddress();
export const passwordArbitrary = fc.string({ minLength: 6, maxLength: 20 });
export const userNameArbitrary = fc.string({ minLength: 2, maxLength: 50 });
export const userRoleArbitrary = fc.constantFrom('tutor', 'tutee');

// Session-related arbitraries
export const sessionIdArbitrary = fc.uuid();
export const channelNameArbitrary = fc.string({ minLength: 1, maxLength: 64 });
export const roomIdArbitrary = fc.string({ minLength: 1, maxLength: 64 });

// Video/Audio state arbitraries
export const booleanStateArbitrary = fc.boolean();
export const connectionQualityArbitrary = fc.constantFrom(
  'excellent',
  'good',
  'poor',
  'bad',
  'unknown'
);

// Whiteboard-related arbitraries
export const whiteboardToolArbitrary = fc.constantFrom('pen', 'eraser', 'selector', 'text');
export const colorArbitrary = fc.tuple(
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 }),
  fc.integer({ min: 0, max: 255 })
).map(([r, g, b]) => {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
});
export const strokeWidthArbitrary = fc.integer({ min: 1, max: 20 });

// Coordinate arbitraries
export const coordinateArbitrary = fc.record({
  x: fc.integer({ min: 0, max: 10000 }),
  y: fc.integer({ min: 0, max: 10000 }),
});

export const pointArrayArbitrary = fc.array(coordinateArbitrary, { minLength: 2, maxLength: 100 });

// Zoom and pan arbitraries
export const zoomLevelArbitrary = fc.integer({ min: 50, max: 300 });
export const panOffsetArbitrary = fc.record({
  x: fc.integer({ min: -1000, max: 1000 }),
  y: fc.integer({ min: -1000, max: 1000 }),
});

// PDF-related arbitraries
export const pageNumberArbitrary = fc.integer({ min: 1, max: 100 });
export const pdfDocumentIdArbitrary = fc.uuid();

// Chat message arbitraries
export const chatMessageArbitrary = fc.record({
  id: fc.uuid(),
  senderId: userIdArbitrary,
  senderName: userNameArbitrary,
  content: fc.string({ minLength: 1, maxLength: 500 }),
  timestamp: fc.date(),
});

// AI message arbitraries
export const aiMessageRoleArbitrary = fc.constantFrom('user', 'assistant', 'system');
export const aiMessageArbitrary = fc.record({
  role: aiMessageRoleArbitrary,
  content: fc.string({ minLength: 1, maxLength: 1000 }),
});

// Token arbitraries
export const jwtTokenArbitrary = fc.string({ minLength: 100, maxLength: 500 });
export const timestampArbitrary = fc.integer({ min: Date.now(), max: Date.now() + 86400000 });

// Annotation arbitraries
export const annotationStrokeArbitrary = fc.record({
  id: fc.uuid(),
  tool: fc.constantFrom('pen', 'highlighter'),
  color: colorArbitrary,
  strokeWidth: strokeWidthArbitrary,
  points: pointArrayArbitrary,
  timestamp: fc.nat(),
});

/**
 * Helper Functions for Property Tests
 */

/**
 * Check if an object has all expected fields
 */
export function hasExpectedFields(obj: any, expectedFields: string[]): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return expectedFields.every(field => field in obj);
}

/**
 * Check if a value is within a range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Check if a color is a valid hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Check if a string is a valid email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Calculate contrast ratio between two colors (for WCAG compliance)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;

    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(
  color1: string,
  color2: string,
  isLargeText: boolean = false
): boolean {
  const ratio = calculateContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Delay helper for async tests
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry helper for flaky operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await delay(delayMs * attempt);
      }
    }
  }

  throw lastError;
}

/**
 * Mock DOM rect for testing
 */
export function createMockDOMRect(
  x: number = 0,
  y: number = 0,
  width: number = 800,
  height: number = 600
): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    left: x,
    bottom: y + height,
    right: x + width,
    toJSON: () => ({}),
  };
}

/**
 * Generate a random valid JWT token structure (for testing)
 */
export function generateMockJWT(payload: any = {}): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, exp: Date.now() + 3600000 }));
  const signature = btoa('mock-signature');
  return `${header}.${body}.${signature}`;
}

/**
 * Parse mock JWT token
 */
export function parseMockJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Check if two arrays have the same elements (order-independent)
 */
export function haveSameElements<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
}

/**
 * Deep equality check for objects
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => {
    if (!keys2.includes(key)) return false;
    return deepEqual(obj1[key], obj2[key]);
  });
}

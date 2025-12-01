/**
 * Color Palette Tests
 * 
 * Tests for yellow and purple color palettes in Tailwind configuration
 * Requirements: 19.3, 19.10
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Color Palette Configuration', () => {
  // Read the CSS file to verify color definitions
  const cssPath = path.join(__dirname, '../index.css');
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  it('should have yellow color palette defined (50-900)', () => {
    // Test yellow palette
    const yellowShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    
    yellowShades.forEach(shade => {
      const pattern = new RegExp(`--color-yellow-${shade}:\\s*#[0-9a-fA-F]{6}`);
      expect(cssContent).toMatch(pattern);
    });
  });

  it('should have purple color palette defined (50-900)', () => {
    // Test purple palette
    const purpleShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    
    purpleShades.forEach(shade => {
      const pattern = new RegExp(`--color-purple-${shade}:\\s*#[0-9a-fA-F]{6}`);
      expect(cssContent).toMatch(pattern);
    });
  });

  it('should have primary color aliases configured', () => {
    // Test primary aliases
    expect(cssContent).toContain('--color-primary:');
    expect(cssContent).toContain('--color-primary-hover:');
    expect(cssContent).toContain('--color-primary-light:');
    expect(cssContent).toContain('--color-primary-dark:');
  });

  it('should have secondary color aliases configured', () => {
    // Test secondary aliases
    expect(cssContent).toContain('--color-secondary:');
    expect(cssContent).toContain('--color-secondary-hover:');
    expect(cssContent).toContain('--color-secondary-light:');
    expect(cssContent).toContain('--color-secondary-dark:');
  });

  it('should have yellow-500 as primary color', () => {
    // Primary should reference yellow-500
    expect(cssContent).toMatch(/--color-primary:\s*var\(--color-yellow-500\)/);
  });

  it('should have purple-900 as secondary color', () => {
    // Secondary should reference purple-900
    expect(cssContent).toMatch(/--color-secondary:\s*var\(--color-purple-900\)/);
  });

  it('should have correct yellow brand colors', () => {
    // Test specific brand colors
    expect(cssContent).toContain('--color-yellow-500: #fdc500');
    expect(cssContent).toContain('--color-yellow-300: #ffee32');
  });

  it('should have correct purple brand colors', () => {
    // Test specific brand colors
    expect(cssContent).toContain('--color-purple-900: #5c0099');
    expect(cssContent).toContain('--color-purple-400: #c86bfa');
  });

  it('should maintain backward compatibility with legacy accent colors', () => {
    // Test legacy colors still exist
    expect(cssContent).toContain('--color-accent: #fdc500');
    expect(cssContent).toContain('--color-accent-light: #ffd500');
    expect(cssContent).toContain('--color-highlight: #ffee32');
  });

  it('should have all yellow shades with valid hex colors', () => {
    const yellowColors = {
      50: '#fffef7',
      100: '#fffbeb',
      200: '#fff4c7',
      300: '#ffee32',
      400: '#ffe500',
      500: '#fdc500',
      600: '#e6a800',
      700: '#b38600',
      800: '#806000',
      900: '#4d3900'
    };

    Object.entries(yellowColors).forEach(([shade, color]) => {
      expect(cssContent).toContain(`--color-yellow-${shade}: ${color}`);
    });
  });

  it('should have all purple shades with valid hex colors', () => {
    const purpleColors = {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c86bfa',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#5c0099'
    };

    Object.entries(purpleColors).forEach(([shade, color]) => {
      expect(cssContent).toContain(`--color-purple-${shade}: ${color}`);
    });
  });
});

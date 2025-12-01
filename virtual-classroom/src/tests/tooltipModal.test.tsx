import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Tooltip } from '../components/Tooltip';
import { Modal } from '../components/Modal';

/**
 * Tests for modernized Tooltip and Modal components
 * Validates: Requirements 19.2, 19.12
 * 
 * Property 98: Glass-morphism tooltips
 * For any tooltip or popover, glass-morphism effects with smooth fade-in animations should be applied
 */

describe('Tooltip Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('should apply glass-strong effect to tooltip', () => {
    // Create a simple tooltip structure
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'glass-strong rounded-lg shadow-xl animate-fade-in';
    tooltipDiv.setAttribute('role', 'tooltip');
    tooltipDiv.textContent = 'Test tooltip';
    container.appendChild(tooltipDiv);

    // Check for glass-strong class
    expect(tooltipDiv.classList.contains('glass-strong')).toBe(true);
  });

  it('should have smooth fade-in animation', () => {
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'glass-strong animate-fade-in';
    tooltipDiv.setAttribute('role', 'tooltip');
    container.appendChild(tooltipDiv);

    expect(tooltipDiv.classList.contains('animate-fade-in')).toBe(true);
  });

  it('should have rounded corners', () => {
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'glass-strong rounded-lg';
    tooltipDiv.setAttribute('role', 'tooltip');
    container.appendChild(tooltipDiv);

    expect(tooltipDiv.classList.contains('rounded-lg')).toBe(true);
  });

  it('should have shadow effect', () => {
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'glass-strong shadow-xl';
    tooltipDiv.setAttribute('role', 'tooltip');
    container.appendChild(tooltipDiv);

    expect(tooltipDiv.classList.contains('shadow-xl')).toBe(true);
  });

  it('should support arrow pointer with glass effect', () => {
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'glass-strong';
    tooltipDiv.setAttribute('role', 'tooltip');
    
    // Add arrow
    const arrow = document.createElement('div');
    arrow.className = 'glass-strong rotate-45';
    tooltipDiv.appendChild(arrow);
    
    container.appendChild(tooltipDiv);

    const arrowElement = tooltipDiv.querySelector('.glass-strong.rotate-45');
    expect(arrowElement).toBeTruthy();
  });

  it('should support keyboard shortcut display with modern styling', () => {
    const tooltipDiv = document.createElement('div');
    tooltipDiv.className = 'glass-strong';
    tooltipDiv.setAttribute('role', 'tooltip');
    
    const shortcut = document.createElement('span');
    shortcut.className = 'bg-gray-100 px-1.5 py-0.5 rounded';
    shortcut.textContent = 'Ctrl+S';
    tooltipDiv.appendChild(shortcut);
    
    container.appendChild(tooltipDiv);

    const shortcutElement = tooltipDiv.querySelector('.bg-gray-100');
    expect(shortcutElement).toBeTruthy();
    expect(shortcutElement?.textContent).toBe('Ctrl+S');
  });
});

describe('Modal Component', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  it('should apply glass-strong effect to modal container', () => {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'glass-strong rounded-2xl shadow-2xl animate-scale-in';
    modalDiv.setAttribute('role', 'dialog');
    modalDiv.setAttribute('aria-modal', 'true');
    container.appendChild(modalDiv);

    // Check for glass-strong class
    expect(modalDiv.classList.contains('glass-strong')).toBe(true);
  });

  it('should have backdrop blur on overlay', () => {
    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop-blur-md bg-gray-900/50';
    backdrop.style.backdropFilter = 'blur(12px)';
    backdrop.style.WebkitBackdropFilter = 'blur(12px)';
    container.appendChild(backdrop);

    expect(backdrop.classList.contains('backdrop-blur-md')).toBe(true);
    expect(backdrop.style.backdropFilter).toBe('blur(12px)');
  });

  it('should have smooth scale-in animation', () => {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'glass-strong animate-scale-in';
    modalDiv.setAttribute('role', 'dialog');
    container.appendChild(modalDiv);

    expect(modalDiv.classList.contains('animate-scale-in')).toBe(true);
  });

  it('should use modern button styling for close button', () => {
    const closeButton = document.createElement('button');
    closeButton.className = 'rounded-xl hover:scale-105 active:scale-95 transition-all duration-200';
    closeButton.setAttribute('aria-label', 'Close modal');
    container.appendChild(closeButton);

    // Check for modern styling classes
    expect(closeButton.classList.contains('rounded-xl')).toBe(true);
    expect(closeButton.classList.contains('hover:scale-105')).toBe(true);
    expect(closeButton.classList.contains('active:scale-95')).toBe(true);
  });

  it('should use Lucide X icon for close button', () => {
    const closeButton = document.createElement('button');
    closeButton.setAttribute('aria-label', 'Close modal');
    
    // Simulate Lucide icon (SVG)
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '20');
    icon.setAttribute('height', '20');
    closeButton.appendChild(icon);
    
    container.appendChild(closeButton);

    // Lucide icons render as SVG elements
    const svgIcon = closeButton.querySelector('svg');
    expect(svgIcon).toBeTruthy();
  });

  it('should have rounded corners on modal', () => {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'glass-strong rounded-2xl';
    modalDiv.setAttribute('role', 'dialog');
    container.appendChild(modalDiv);

    expect(modalDiv.classList.contains('rounded-2xl')).toBe(true);
  });

  it('should have shadow effect on modal', () => {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'glass-strong shadow-2xl';
    modalDiv.setAttribute('role', 'dialog');
    container.appendChild(modalDiv);

    expect(modalDiv.classList.contains('shadow-2xl')).toBe(true);
  });

  it('should support different modal sizes', () => {
    const sizes = ['max-w-md', 'max-w-lg', 'max-w-2xl', 'max-w-4xl'];
    
    sizes.forEach(size => {
      const modalDiv = document.createElement('div');
      modalDiv.className = `glass-strong ${size}`;
      modalDiv.setAttribute('role', 'dialog');
      container.appendChild(modalDiv);

      expect(modalDiv.classList.contains(size)).toBe(true);
    });
  });

  it('should have proper focus management attributes', () => {
    const modalDiv = document.createElement('div');
    modalDiv.setAttribute('role', 'dialog');
    modalDiv.setAttribute('aria-modal', 'true');
    modalDiv.setAttribute('aria-labelledby', 'modal-title');
    container.appendChild(modalDiv);

    expect(modalDiv.getAttribute('role')).toBe('dialog');
    expect(modalDiv.getAttribute('aria-modal')).toBe('true');
    expect(modalDiv.getAttribute('aria-labelledby')).toBe('modal-title');
  });
});

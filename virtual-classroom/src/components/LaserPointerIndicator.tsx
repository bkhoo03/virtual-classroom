import React from 'react';

interface LaserPointerIndicatorProps {
  position: { x: number; y: number } | null;
  zoom?: number;
}

/**
 * LaserPointerIndicator Component
 * 
 * Displays a red dot indicator at the cursor position when the laser pointer tool is active.
 * Features:
 * - 12px diameter red circle with glow effect
 * - Smooth position transitions using CSS transforms
 * - Automatically hides when position is null
 * - Positioned absolutely within the PDF viewer container
 * 
 * @param position - Current cursor position or null to hide
 * @param zoom - Current zoom level (optional, for future scaling)
 */
const LaserPointerIndicator: React.FC<LaserPointerIndicatorProps> = ({ 
  position
}) => {
  // Hide indicator when position is null
  if (!position) {
    return null;
  }

  return (
    <div
      className="laser-pointer-indicator"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px) translate(-50%, -50%)`,
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: '#ff0000',
        boxShadow: '0 0 8px 2px rgba(255, 0, 0, 0.6), 0 0 4px 1px rgba(255, 0, 0, 0.8)',
        pointerEvents: 'none',
        zIndex: 1000,
        transition: 'transform 0.05s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      aria-hidden="true"
    />
  );
};

export default LaserPointerIndicator;

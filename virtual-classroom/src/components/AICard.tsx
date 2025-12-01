import { ReactNode, HTMLAttributes } from 'react';
import { getCardClasses } from '../utils/designSystem';

// ============================================================================
// Type Definitions
// ============================================================================

export interface AICardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant - determines size and elevation
   */
  variant?: 'base' | 'compact' | 'elevated';
  
  /**
   * Whether to show hover effects
   */
  hoverable?: boolean;
  
  /**
   * Card content
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Whether the card is clickable
   */
  clickable?: boolean;
  
  /**
   * Click handler
   */
  onClick?: () => void;
}

// ============================================================================
// AICard Component
// ============================================================================

/**
 * Modern card component with shadows, rounded corners, and hover effects
 * 
 * Features:
 * - Three variants: base, compact, elevated
 * - Smooth hover animations
 * - Proper spacing and shadows
 * - Accessible and semantic
 * 
 * @example
 * ```tsx
 * <AICard variant="base" hoverable>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </AICard>
 * ```
 */
export default function AICard({
  variant = 'base',
  hoverable = false,
  children,
  className = '',
  clickable = false,
  onClick,
  ...props
}: AICardProps) {
  const baseClasses = getCardClasses(variant);
  
  // Add hover classes if hoverable
  const hoverClasses = hoverable && !clickable
    ? 'hover:shadow-lg hover:-translate-y-0.5'
    : '';
  
  // Add clickable classes if clickable
  const clickableClasses = clickable
    ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
    : '';
  
  const combinedClasses = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`.trim();
  
  // Use button element if clickable for better accessibility
  if (clickable && onClick) {
    return (
      <button
        type="button"
        className={combinedClasses}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  }
  
  return (
    <div
      className={combinedClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Card Sub-components
// ============================================================================

/**
 * Card header component
 */
export function AICardHeader({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mb-4 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card title component
 */
export function AICardTitle({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold text-gray-900 ${className}`.trim()}
      {...props}
    >
      {children}
    </h3>
  );
}

/**
 * Card description component
 */
export function AICardDescription({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-gray-600 mt-1 ${className}`.trim()}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Card content component
 */
export function AICardContent({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card footer component
 */
export function AICardFooter({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mt-4 pt-4 border-t border-gray-200 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

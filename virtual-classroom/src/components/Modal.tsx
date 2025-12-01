import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { usePrefersReducedMotion } from '../hooks/useAccessibilityPreferences';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

/**
 * Modal component with glass-morphism effects and smooth animations
 * Implements smooth 300ms transitions as per design requirements
 * Includes focus trap for accessibility
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${prefersReducedMotion ? '' : 'animate-fade-in'}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      style={{
        animationDuration: prefersReducedMotion ? '0ms' : '200ms',
      }}
    >
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-md"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />

      {/* Modal Content with glass-strong effect */}
      <div
        ref={modalRef}
        className={`
          relative 
          glass-strong
          rounded-2xl 
          shadow-2xl 
          w-full 
          ${sizeClasses[size]} 
          ${prefersReducedMotion ? '' : 'animate-scale-in'}
        `}
        style={{
          animationDuration: prefersReducedMotion ? '0ms' : '300ms',
          animationTimingFunction: 'var(--ease-out-expo)',
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="
                  ml-auto w-10 h-10 rounded-xl 
                  flex items-center justify-center 
                  text-gray-600 hover:text-gray-900 
                  hover:bg-gray-100/50
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
                "
                aria-label="Close modal"
              >
                <X size={20} strokeWidth={2} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

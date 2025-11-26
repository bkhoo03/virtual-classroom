import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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
 * Modal component with fade and scale animations
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
    >
      {/* Backdrop - semi-transparent dark for light theme */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />

      {/* Modal Content - white background for light theme */}
      <div
        ref={modalRef}
        className={`relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full ${sizeClasses[size]} ${prefersReducedMotion ? '' : 'animate-fade-scale-in'}`}
        style={{
          animationDuration: prefersReducedMotion ? '0ms' : '300ms',
          animationTimingFunction: 'var(--ease-smooth-out)',
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
                className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
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

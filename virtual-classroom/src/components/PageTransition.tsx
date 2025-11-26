import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition wrapper component
 * Adds smooth 300ms fade and slide transitions to page content
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <div className="animate-page-transition">
      {children}
    </div>
  );
};

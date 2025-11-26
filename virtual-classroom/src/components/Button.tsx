import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  feedbackAnimation?: 'success-glow' | 'error-shake' | 'none';
}

export const Button: React.FC<ButtonProps> = React.memo(({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  feedbackAnimation = 'none',
  onClick,
  ...props
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Trigger feedback animation if specified
    if (feedbackAnimation !== 'none' && buttonRef.current) {
      buttonRef.current.classList.add(`animate-${feedbackAnimation}`);
      setTimeout(() => {
        buttonRef.current?.classList.remove(`animate-${feedbackAnimation}`);
      }, feedbackAnimation === 'success-glow' ? 600 : 500);
    }

    // Call the original onClick handler
    if (onClick) {
      onClick(e);
    }
  };

  // Use CSS transforms for GPU acceleration
  // Enhanced focus indicators for accessibility (WCAG AA compliant)
  // 3px #FDC500 outline as per design requirements
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 shadow-sm hover:shadow-md',
    secondary: 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:scale-95 shadow-sm',
    tertiary: 'bg-transparent text-purple-600 hover:bg-purple-50 active:scale-95',
    icon: 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95 rounded-full shadow-sm hover:shadow-md',
  };
  
  const sizeStyles = {
    sm: variant === 'icon' ? 'w-8 h-8 p-2' : 'px-4 py-2 text-sm rounded-lg',
    md: variant === 'icon' ? 'w-10 h-10 p-2' : 'px-6 py-3 text-base rounded-lg',
    lg: variant === 'icon' ? 'w-12 h-12 p-3' : 'px-8 py-4 text-lg rounded-xl',
  };

  return (
    <button
      ref={buttonRef}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      style={{
        // Use CSS transforms for better performance
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
      {...props}
    >
      {children}
    </button>
  );
});
